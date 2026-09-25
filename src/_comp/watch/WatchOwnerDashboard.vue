
<template lang='pug'>

div.watch_dashboard_wrap
    div.stats
        div.stat
            div.stat_value {{ stats.owners }}
            div.stat_label Owners tracked
        div.stat
            div.stat_value {{ stats.translations }}
            div.stat_label Translations tracked
        div.stat
            div.stat_value {{ stats.pct_restricted }}%
            div.stat_label Restricted overall

    div.controls
        div.sort_toggle
            button(:class='{active: sort_mode === "total"}' @click='sort_mode = "total"')
                | Total translations
            button(:class='{active: sort_mode === "count"}' @click='sort_mode = "count"')
                | Restricted translations
            button(:class='{active: sort_mode === "pct"}' @click='sort_mode = "pct"')
                | Percent restricted

    p.legend
        span.legend_item: span.swatch.open
        | &nbsp;Open&emsp;
        span.legend_item: span.swatch.semi_restricted
        | &nbsp;Semi-restricted&emsp;
        span.legend_item: span.swatch.restricted
        | &nbsp;Restricted

    table.owner_table: tbody
        tr
            th Owner
            th.num Tracked
            th.bar Restricted vs open
            th.num Restricted
            th.num %
        template(v-for='(owner, i) of ranked' :key='owner.id')
            tr
                td.rank {{ i + 1 }}
                td.owner_name
                    a(:href='`/watch/translations/#o=${owner.id}`' :title='`See ${owner.name}\'s translations`')
                        | {{ owner.name }}
                    a.website(
                        v-if='owner.website' :href='owner.website' target='_blank' rel='noreferrer'
                        title='Visit website'
                    ) ↗
                    a.ministry_watch(
                        v-if='owner.ministry_watch_url' :href='owner.ministry_watch_url'
                        target='_blank' rel='noreferrer' title='View on Ministry Watch'
                    ) MW
                    button.responses_btn(
                        v-if='response_log_by_owner[owner.id]' @click='toggle_responses(owner.id)'
                        :class='{active: expanded.has(owner.id)}'
                    )
                        | Responses
                        span.badge_count {{ response_log_by_owner[owner.id].length }}
                td.num {{ owner.tracked }}
                td.bar
                    div.meter
                        div.meter_segment.open(:style='{width: owner.open_pct + "%"}')
                        div.meter_segment.semi_restricted(:style='{width: owner.semi_restricted_pct + "%"}')
                        div.meter_segment.restricted(:style='{width: owner.restricted_pct + "%"}')
                td.num {{ owner.restricted }}
                td.num {{ owner.restricted_pct }}%
            tr(v-if='expanded.has(owner.id)')
                td.responses_cell(colspan='5')
                    div.response_entry(v-for='entry of response_log_by_owner[owner.id]' :key='entry.id')
                        div.response_top
                            span.response_date {{ entry.date || 'Undated' }}
                            a(:href='entry.evidence_url' target='_blank' rel='noreferrer') Evidence ↗
                        p.response_summary {{ entry.summary }}
                        p.response_reporter
                            | Reported by
                            a(v-if='entry.reporter_url' :href='entry.reporter_url' target='_blank' rel='noreferrer')
                                | &nbsp;{{ entry.reporter_name }}
                            span(v-else) &nbsp;{{ entry.reporter_name }}

</template>


<script lang='ts' setup>

import {ref, computed} from 'vue'

// Static Bible Org Watch data — checked into the repo, no backend
import owners from '@/_data/watch/owners.json'
import license_terms from '@/_data/watch/license_terms.json'
import response_log from '@/_data/watch/response_log.json'


// A license's tier: 'open' places no restriction on sharing ('public', 'cc-by', 'cc-by-sa');
// 'semi_restricted' carries a noncommercial and/or no-derivatives clause (including 'cc-by-nc-nd');
// 'restricted' is non-standard terms ('custom') or no license at all ('unknown') — not proven
// open, so not assumed open. For ranking/filtering purposes, only 'restricted' counts against an
// owner — 'semi_restricted' does not count as restricted, even though the bar still shows it
// separately.
function license_tier(license:string):'open' | 'semi_restricted' | 'restricted'{
    if (license === 'custom' || license === 'unknown') return 'restricted'
    if (license.includes('nc') || license.includes('nd')) return 'semi_restricted'
    return 'open'
}
const is_restricted = (license:string) => license_tier(license) === 'restricted'

// Tally each owner's tracked translations and how many carry a restricted license
const owner_names:Record<string, string> = {}
const owner_meta:Record<string, {website?:string, ministry_watch_url?:string}> = {}
for (const owner of owners){
    owner_names[owner.id] = owner.name
    owner_meta[owner.id] = {website: owner.website, ministry_watch_url: owner.ministry_watch_url}
}

const tallies:Record<string, {tracked:number, semi_restricted:number, restricted_only:number}> = {}
for (const term of license_terms){
    const tally = tallies[term.owner_id] ??= {tracked: 0, semi_restricted: 0, restricted_only: 0}
    tally.tracked += 1
    const tier = license_tier(term.license)
    if (tier === 'semi_restricted') tally.semi_restricted += 1
    else if (tier === 'restricted') tally.restricted_only += 1
}

const owner_rows = Object.entries(tallies)
    .filter(([id]) => id !== 'unknown')
    .map(([id, tally]) => {
        // 'restricted' here (used for ranking/columns) is the strict tier only — semi_restricted
        // doesn't count as restricted. The bar below still shows all three tiers.
        return {
            id,
            name: owner_names[id] ?? id,
            website: owner_meta[id]?.website,
            ministry_watch_url: owner_meta[id]?.ministry_watch_url,
            tracked: tally.tracked,
            restricted: tally.restricted_only,
            restricted_pct: Math.round((tally.restricted_only / tally.tracked) * 100),
            open_pct: Math.round(((tally.tracked - tally.semi_restricted - tally.restricted_only) / tally.tracked) * 100),
            semi_restricted_pct: Math.round((tally.semi_restricted / tally.tracked) * 100),
        }
    })

// Overall stats shown as headline tiles — based only on owners with tracked translations, not
// the response-log-only rows added below
const stats = computed(() => {
    const translations = license_terms.length
    const restricted = license_terms.filter(t => is_restricted(t.license)).length
    return {
        owners: owner_rows.length,
        translations,
        pct_restricted: translations ? Math.round((restricted / translations) * 100) : 0,
    }
})

// Group response log entries by owner_id when matched, else by a slugified owner_name — most of
// these owners (Crossway, Zondervan, Lockman, ...) have no tracked/open-licensed translations, so
// they're not otherwise in owner_rows at all. Add a zero-tracked row for those so their Responses
// button still has somewhere to appear.
const slugify_local = (name:string) => name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '')

const response_log_by_owner:Record<string, typeof response_log> = {}
for (const entry of response_log){
    const key = entry.owner_id ?? slugify_local(entry.owner_name)
    ;(response_log_by_owner[key] ??= []).push(entry)
}

// display_rows is what the table ranks/shows — owner_rows itself stays untouched so the stat
// tiles above keep counting only owners with tracked translations
const display_rows = [...owner_rows]
for (const [key, entries] of Object.entries(response_log_by_owner)){
    if (!display_rows.some(o => o.id === key)){
        display_rows.push({
            id: key,
            name: owner_names[key] ?? entries[0]!.owner_name,
            website: owner_meta[key]?.website,
            ministry_watch_url: owner_meta[key]?.ministry_watch_url,
            tracked: 0,
            restricted: 0,
            restricted_pct: 0,
            open_pct: 0,
            semi_restricted_pct: 0,
        })
    }
}

// Ranking control — by total tracked, by raw restricted count, or by restricted share
const sort_mode = ref<'total' | 'count' | 'pct'>('total')

const sorters = {
    total: (a:typeof display_rows[0], b:typeof display_rows[0]) =>
        (b.tracked - a.tracked) || (b.restricted - a.restricted),
    count: (a:typeof display_rows[0], b:typeof display_rows[0]) =>
        (b.restricted - a.restricted) || (b.restricted_pct - a.restricted_pct),
    pct: (a:typeof display_rows[0], b:typeof display_rows[0]) =>
        (b.restricted_pct - a.restricted_pct) || (b.restricted - a.restricted),
}

const ranked = computed(() => [...display_rows].sort(sorters[sort_mode.value]))

// Which owners' response log is currently expanded in the table
const expanded = ref(new Set<string>())
function toggle_responses(owner_id:string){
    if (expanded.value.has(owner_id)) expanded.value.delete(owner_id)
    else expanded.value.add(owner_id)
    expanded.value = new Set(expanded.value)
}

</script>


<style lang='sass' scoped>

.watch_dashboard_wrap
    .stats
        display: flex
        gap: 12px
        margin-bottom: 16px

    .stat
        flex: 1
        padding: 12px 14px
        border: 1px solid var(--vp-c-divider)
        border-radius: 8px
        background: var(--vp-c-bg-alt)

        .stat_value
            font-size: 1.6em
            font-weight: 600
            line-height: 1.2

        .stat_label
            font-size: 0.8em
            opacity: 0.7

    .controls
        display: flex
        align-items: center
        justify-content: space-between
        flex-wrap: wrap
        gap: 10px
        margin-bottom: 10px

    .sort_toggle
        display: flex
        flex-wrap: wrap
        gap: 6px

        button
            padding: 6px 12px
            border: 1px solid var(--vp-c-divider)
            border-radius: 6px
            background: var(--vp-c-bg)
            color: var(--vp-c-text-2)
            font-size: 0.85em
            cursor: pointer

            &.active
                border-color: var(--vp-c-brand-1)
                color: var(--vp-c-brand-1)
                font-weight: 600

    .legend
        font-size: 0.78em
        opacity: 0.75
        margin: 0 0 10px

        .legend_item
            display: inline-flex
            vertical-align: middle

        .swatch
            display: inline-block
            width: 10px
            height: 10px
            border-radius: 2px

            &.open
                background: var(--vp-c-green-2)

            &.semi_restricted
                background: var(--vp-c-yellow-2)

            &.restricted
                background: var(--vp-c-red-2)

.owner_table
    width: 100%
    border-collapse: collapse
    font-size: 0.85em

    th
        text-align: left
        padding: 6px 10px
        border-bottom: 2px solid var(--vp-c-divider)

    td
        padding: 6px 10px
        border-bottom: 1px solid var(--vp-c-divider)
        vertical-align: middle

    .num
        text-align: right
        white-space: nowrap

    .rank
        opacity: 0.5
        text-align: right
        width: 2em

    .bar
        width: 160px

    .owner_name
        .website, .ministry_watch
            margin-left: 6px
            font-size: 0.75em
            padding: 1px 5px
            border: 1px solid var(--vp-c-divider)
            border-radius: 4px
            color: var(--vp-c-text-2)

        .responses_btn
            position: relative
            margin-left: 8px
            padding: 3px 10px
            font-size: 0.75em
            font-family: inherit
            border: 1px solid var(--vp-c-divider)
            border-radius: 5px
            background: var(--vp-c-bg)
            color: var(--vp-c-text-2)
            cursor: pointer

            &:hover, &.active
                border-color: var(--vp-c-red-2)
                color: var(--vp-c-red-1)

            .badge_count
                position: absolute
                top: -7px
                right: -7px
                min-width: 16px
                height: 16px
                padding: 0 3px
                border-radius: 8px
                background: var(--vp-c-red-2)
                color: white
                font-size: 0.72em
                font-weight: 700
                line-height: 16px
                text-align: center

    .responses_cell
        background: var(--vp-c-bg-alt)
        padding: 10px 14px

    .response_entry
        padding: 8px 0
        border-bottom: 1px solid var(--vp-c-divider)

        &:last-child
            border-bottom: none

        .response_top
            display: flex
            justify-content: space-between
            align-items: baseline
            font-size: 0.85em
            margin-bottom: 4px

        .response_date
            color: var(--vp-c-text-2)
            font-weight: 600

        .response_summary
            margin: 0 0 4px
            line-height: 1.5

        .response_reporter
            margin: 0
            font-size: 0.8em
            color: var(--vp-c-text-2)

.meter
    display: flex
    width: 100%
    height: 8px
    border-radius: 4px
    overflow: hidden
    background: var(--vp-c-bg-alt)

    .meter_segment
        height: 100%

        &.open
            background: var(--vp-c-green-2)

        &.semi_restricted
            background: var(--vp-c-yellow-2)

        &.restricted
            background: var(--vp-c-red-2)

</style>
