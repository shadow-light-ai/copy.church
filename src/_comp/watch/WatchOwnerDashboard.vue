
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
            button(:class='{active: sort_mode === "count"}' @click='sort_mode = "count"')
                | Most restricted
            button(:class='{active: sort_mode === "pct"}' @click='sort_mode = "pct"')
                | Highest % restricted

    p.legend
        span.legend_item: span.swatch.open
        | &nbsp;Open&emsp;
        span.legend_item: span.swatch.limited
        | &nbsp;NC or ND&emsp;
        span.legend_item: span.swatch.restricted
        | &nbsp;NC and ND (or custom)

    table.owner_table: tbody
        tr
            th Owner
            th.num Tracked
            th.bar Restricted vs open
            th.num Restricted
            th.num %
        tr(v-for='(owner, i) of ranked' :key='owner.id')
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
            td.num {{ owner.tracked }}
            td.bar
                div.meter
                    div.meter_segment.open(:style='{width: owner.open_pct + "%"}')
                    div.meter_segment.limited(:style='{width: owner.limited_pct + "%"}')
                    div.meter_segment.restricted(:style='{width: owner.fully_restricted_pct + "%"}')
            td.num {{ owner.restricted }}
            td.num {{ owner.restricted_pct }}%

</template>


<script lang='ts' setup>

import {ref, computed} from 'vue'

// Static Bible Org Watch data — checked into the repo, no backend
import owners from '@/_data/watch/owners.json'
import license_terms from '@/_data/watch/license_terms.json'


// A license's tier: 'open' places no restriction on sharing ('public', 'cc-by', 'cc-by-sa');
// 'limited' carries exactly one of noncommercial or no-derivatives; 'restricted' carries both,
// or its terms are non-standard ('custom'). Ranking/percentages treat limited + restricted as
// both counting against an owner — only the bar breaks the two apart.
function license_tier(license:string):'open' | 'limited' | 'restricted'{
    if (license === 'custom') return 'restricted'
    const nc = license.includes('nc')
    const nd = license.includes('nd')
    if (nc && nd) return 'restricted'
    if (nc || nd) return 'limited'
    return 'open'
}
const is_restricted = (license:string) => license_tier(license) !== 'open'

// Tally each owner's tracked translations and how many carry a restricted license
const owner_names:Record<string, string> = {}
const owner_meta:Record<string, {website?:string, ministry_watch_url?:string}> = {}
for (const owner of owners){
    owner_names[owner.id] = owner.name
    owner_meta[owner.id] = {website: owner.website, ministry_watch_url: owner.ministry_watch_url}
}

const tallies:Record<string, {tracked:number, limited:number, fully_restricted:number}> = {}
for (const term of license_terms){
    const tally = tallies[term.owner_id] ??= {tracked: 0, limited: 0, fully_restricted: 0}
    tally.tracked += 1
    const tier = license_tier(term.license)
    if (tier === 'limited') tally.limited += 1
    else if (tier === 'restricted') tally.fully_restricted += 1
}

const owner_rows = Object.entries(tallies)
    .filter(([id]) => id !== 'unknown')
    .map(([id, tally]) => {
        const restricted = tally.limited + tally.fully_restricted
        const restricted_pct = Math.round((restricted / tally.tracked) * 100)
        return {
            id,
            name: owner_names[id] ?? id,
            website: owner_meta[id]?.website,
            ministry_watch_url: owner_meta[id]?.ministry_watch_url,
            tracked: tally.tracked,
            restricted,
            restricted_pct,
            open_pct: Math.round(((tally.tracked - restricted) / tally.tracked) * 100),
            limited_pct: Math.round((tally.limited / tally.tracked) * 100),
            fully_restricted_pct: Math.round((tally.fully_restricted / tally.tracked) * 100),
        }
    })

// Overall stats shown as headline tiles
const stats = computed(() => {
    const translations = license_terms.length
    const restricted = license_terms.filter(t => is_restricted(t.license)).length
    return {
        owners: owner_rows.length,
        translations,
        pct_restricted: translations ? Math.round((restricted / translations) * 100) : 0,
    }
})

// Ranking control — by raw restricted count, or by restricted share of an owner's catalogue
const sort_mode = ref<'count' | 'pct'>('count')

const ranked = computed(() => [...owner_rows].sort((a, b) => sort_mode.value === 'count'
    ? (b.restricted - a.restricted) || (b.restricted_pct - a.restricted_pct)
    : (b.restricted_pct - a.restricted_pct) || (b.restricted - a.restricted)))

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

            &.limited
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

        &.limited
            background: var(--vp-c-yellow-2)

        &.restricted
            background: var(--vp-c-red-2)

</style>
