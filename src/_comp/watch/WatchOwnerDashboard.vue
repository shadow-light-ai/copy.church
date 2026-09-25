
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
        label.min_filter
            | Min. tracked translations
            input(v-model.number='min_tracked' type='number' min='1' :max='stats.translations')

    table.owner_table: tbody
        tr
            th Owner
            th.num Tracked
            th.bar Restricted vs open
            th.num Restricted
            th.num %
        tr(v-for='(owner, i) of shown' :key='owner.id')
            td.rank {{ i + 1 }}
            td.owner_name
                a(v-if='owner.website' :href='owner.website' target='_blank' rel='noreferrer') {{ owner.name }}
                span(v-else) {{ owner.name }}
                a.ministry_watch(
                    v-if='owner.ministry_watch_url' :href='owner.ministry_watch_url'
                    target='_blank' rel='noreferrer' title='View on Ministry Watch'
                ) MW
            td.num {{ owner.tracked }}
            td.bar
                div.meter
                    div.meter_segment.open(:style='{width: owner.open_pct + "%"}')
                    div.meter_segment.restricted(:style='{width: owner.restricted_pct + "%"}')
            td.num {{ owner.restricted }}
            td.num {{ owner.restricted_pct }}%
    p.more(v-if='ranked.length > shown.length')
        | Showing top {{ shown.length }} of {{ ranked.length }} owners meeting the minimum — raise the
        | limit or narrow the minimum to see more.

</template>


<script lang='ts' setup>

import {ref, computed} from 'vue'

// Static Bible Society Watch data — checked into the repo, no backend
import owners from '@/_data/watch/owners.json'
import license_terms from '@/_data/watch/license_terms.json'


// A license counts as restricted if it limits noncommercial use or derivatives,
// or its terms are non-standard ('custom'). 'public', 'cc-by', and 'cc-by-sa'
// place no such restriction on sharing.
function is_restricted(license:string):boolean{
    return license === 'custom' || license.includes('nc') || license.includes('nd')
}

// Tally each owner's tracked translations and how many carry a restricted license
const owner_names:Record<string, string> = {}
const owner_meta:Record<string, {website?:string, ministry_watch_url?:string}> = {}
for (const owner of owners){
    owner_names[owner.id] = owner.name
    owner_meta[owner.id] = {website: owner.website, ministry_watch_url: owner.ministry_watch_url}
}

const tallies:Record<string, {tracked:number, restricted:number}> = {}
for (const term of license_terms){
    const tally = tallies[term.owner_id] ??= {tracked: 0, restricted: 0}
    tally.tracked += 1
    if (is_restricted(term.license))
        tally.restricted += 1
}

const owner_rows = Object.entries(tallies)
    .filter(([id]) => id !== 'unknown')
    .map(([id, tally]) => {
        const restricted_pct = Math.round((tally.restricted / tally.tracked) * 100)
        return {
            id,
            name: owner_names[id] ?? id,
            website: owner_meta[id]?.website,
            ministry_watch_url: owner_meta[id]?.ministry_watch_url,
            tracked: tally.tracked,
            restricted: tally.restricted,
            open: tally.tracked - tally.restricted,
            restricted_pct,
            open_pct: 100 - restricted_pct,
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

// Ranking controls — by raw restricted count, or by restricted share of an owner's catalogue
const sort_mode = ref<'count' | 'pct'>('count')
const min_tracked = ref(3)

const ranked = computed(() => {
    const rows = owner_rows.filter(o => o.tracked >= min_tracked.value)
    return rows.sort((a, b) => sort_mode.value === 'count'
        ? (b.restricted - a.restricted) || (b.restricted_pct - a.restricted_pct)
        : (b.restricted_pct - a.restricted_pct) || (b.restricted - a.restricted))
})

const LIMIT = 50
const shown = computed(() => ranked.value.slice(0, LIMIT))

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

    .min_filter
        display: flex
        align-items: center
        gap: 6px
        font-size: 0.8em
        opacity: 0.8

        input
            width: 56px
            padding: 4px 6px
            border: 1px solid var(--vp-c-divider)
            border-radius: 6px
            background: var(--vp-c-bg)
            color: var(--vp-c-text-1)

    .more
        font-size: 0.8em
        opacity: 0.7
        margin-top: 8px

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
        .ministry_watch
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

        &.restricted
            background: var(--vp-c-red-2)

</style>
