
<template lang='pug'>

div.watch_dashboard_wrap
    div.stats
        div.stat
            div.stat_value {{ stats.known_translations }}
            div.stat_label Known Bible translations
        div.stat.restricted
            div.stat_value {{ stats.restricted_pct }}%
            div.stat_label Restricted
        div.stat.semi_restricted
            div.stat_value {{ stats.semi_restricted_or_worse_pct }}%
            div.stat_label Semi-restricted / Restricted

    div.controls
        div.sort_toggle
            span.sort_label Sort by
            button(:class='{active: sort_mode === "total"}' @click='sort_mode = "total"')
                | Total owned
            button(:class='{active: sort_mode === "count"}' @click='sort_mode = "count"')
                | Restricted (#)
            button(:class='{active: sort_mode === "pct"}' @click='sort_mode = "pct"')
                | Restricted (%)

    div.owner_table
        div.owner_row.header_row
            div.cell.rank
            div.cell.name Org Name
            div.cell.tracked.num Translations owned
            div.cell.restricted_num.num Restricted
            div.cell.semi_num.num Semi-restricted
            div.cell.bar Restricted vs open
            div.cell.responses
        template(v-for='(owner, i) of ranked' :key='owner.id')
            div.owner_row.clickable(@click='handle_row_click(owner, $event)')
                div.cell.rank {{ i + 1 }}
                div.cell.name
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
                div.cell.tracked.num
                    span.cell_label Owned
                    | {{ owner.tracked }}
                div.cell.restricted_num.num
                    span.cell_label Restricted
                    | {{ owner.restricted }}
                div.cell.semi_num.num
                    span.cell_label Semi
                    | {{ owner.semi_restricted }}
                div.cell.bar
                    div.meter
                        div.meter_segment.open(:style='{width: owner.open_pct + "%"}')
                        div.meter_segment.semi_restricted(:style='{width: owner.semi_restricted_pct + "%"}')
                        div.meter_segment.restricted(:style='{width: owner.restricted_pct + "%"}')
                div.cell.responses
                    button.responses_btn(
                        v-if='response_log_by_owner[owner.id]' @click='toggle_responses(owner.id)'
                        :class='{active: expanded.has(owner.id)}'
                    )
                        | Cases ({{ response_log_by_owner[owner.id].length }})
            div.responses_panel(v-if='expanded.has(owner.id)')
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
import translations from '@/_data/watch/translations.json'
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
        // 'restricted' (used for ranking/sorting) is the strict tier only — semi_restricted is
        // shown as its own column but doesn't count as restricted.
        return {
            id,
            name: owner_names[id] ?? id,
            website: owner_meta[id]?.website,
            ministry_watch_url: owner_meta[id]?.ministry_watch_url,
            tracked: tally.tracked,
            restricted: tally.restricted_only,
            semi_restricted: tally.semi_restricted,
            restricted_pct: Math.round((tally.restricted_only / tally.tracked) * 100),
            semi_restricted_pct: Math.round((tally.semi_restricted / tally.tracked) * 100),
            open_pct: Math.round(((tally.tracked - tally.semi_restricted - tally.restricted_only) / tally.tracked) * 100),
        }
    })

// Overall stats shown as headline tiles. known_translations is every translation in the whole
// dataset (translations.json — already excludes anything too old to still be under copyright,
// see too_old_for_copyright() in update_watch_data.ts). The other two are percentages of that
// same total, not just the subset with a resolved license — a translation with no license_terms
// entry at all has an unknown license, and unknown is assumed restricted rather than open.
const license_by_translation:Record<string, string> = {}
for (const term of license_terms){
    if (!license_by_translation[term.translation_id] || term.type === 'text')
        license_by_translation[term.translation_id] = term.license
}

const stats = computed(() => {
    let restricted = 0
    let semi_restricted_or_worse = 0
    for (const translation of translations){
        const license = license_by_translation[translation.id]
        const tier = license ? license_tier(license) : 'restricted'
        if (tier === 'restricted') restricted += 1
        if (tier !== 'open') semi_restricted_or_worse += 1
    }
    const total = translations.length
    return {
        known_translations: total,
        restricted_pct: total ? Math.round((restricted / total) * 100) : 0,
        semi_restricted_or_worse_pct: total ? Math.round((semi_restricted_or_worse / total) * 100) : 0,
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
            semi_restricted: 0,
            restricted_pct: 0,
            semi_restricted_pct: 0,
            open_pct: 0,
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

// Make the whole row act like the name link, except for its own interactive children (website/MW
// badges, the Cases button) — those already do their own thing, so let their clicks through
function handle_row_click(owner:typeof display_rows[0], event:MouseEvent){
    if ((event.target as HTMLElement).closest('a, button')) return
    location.href = `/watch/translations/#o=${owner.id}`
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

        &.restricted .stat_value
            color: var(--vp-c-red-1)

        &.semi_restricted .stat_value
            color: var(--vp-c-yellow-1)

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
        align-items: center
        gap: 6px

        .sort_label
            font-size: 0.85em
            color: var(--vp-c-text-2)
            margin-right: 2px

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

// A CSS-grid "table" rather than a real <table> — at narrow widths each owner's row reflows
// from one line into two (numbers, then bar + responses) without ever scrolling horizontally,
// which a real <table> can't do without either an overflow scrollbar or losing columns.
.owner_table
    width: 100%
    font-size: 0.85em

    .owner_row
        display: grid
        grid-template-columns: 2em minmax(160px, 1fr) auto auto auto 140px auto
        grid-template-areas: "rank name tracked restricted semi bar responses"
        align-items: center
        column-gap: 10px
        padding: 6px 10px
        border-bottom: 1px solid var(--vp-c-divider)

        &.header_row
            font-weight: 600
            border-bottom: 2px solid var(--vp-c-divider)

        &.clickable
            cursor: pointer

            &:hover
                background: var(--vp-c-bg-alt)

    .cell
        min-width: 0

    .cell_label
        display: none

    .rank
        grid-area: rank
        opacity: 0.5
        text-align: right

    .name
        grid-area: name

        .website, .ministry_watch
            margin-left: 6px
            font-size: 0.75em
            padding: 1px 5px
            border: 1px solid var(--vp-c-divider)
            border-radius: 4px
            color: var(--vp-c-text-2)

    .tracked
        grid-area: tracked

    .restricted_num
        grid-area: restricted

    .semi_num
        grid-area: semi

    .bar
        grid-area: bar

    .responses
        grid-area: responses

    .num
        text-align: right
        white-space: nowrap

    .responses_btn
        padding: 3px 10px
        font-size: 0.75em
        font-family: inherit
        font-variant-numeric: tabular-nums
        border: 1px solid var(--vp-c-yellow-2)
        border-radius: 5px
        background: var(--vp-c-yellow-soft)
        color: var(--vp-c-yellow-1)
        cursor: pointer

        &:hover, &.active
            border-color: var(--vp-c-yellow-1)
            font-weight: 600

    @media (max-width: 640px)
        .owner_row
            grid-template-columns: 2em minmax(50px, 1fr) minmax(28px, 1fr) minmax(28px, 1fr) minmax(75px, auto)
            grid-template-areas: "rank name tracked restricted semi" "rank name bar bar responses"
            row-gap: 6px

            &.header_row
                display: none

        .tracked, .restricted_num, .semi_num
            white-space: normal
            text-align: left

        .cell_label
            display: block
            font-weight: 400
            font-size: 0.72em
            opacity: 0.6
            white-space: normal

        .bar, .responses
            align-self: center

    .responses_panel
        background: var(--vp-c-bg-alt)
        padding: 10px 14px
        border-bottom: 1px solid var(--vp-c-divider)

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
