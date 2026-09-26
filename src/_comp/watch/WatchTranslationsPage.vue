
<template lang='pug'>

div.watch_translations_page
    div.filters
        select(v-model='selected_owner')
            option(value='') All owners
            option(v-for='o of owner_options' :key='o.id' :value='o.id') {{ o.name }} ({{ o.tracked }})
        select(v-model='selected_language')
            option(value='') All languages
            option(v-for='l of language_options' :key='l' :value='l') {{ l }}
        input.search(v-model='query' type='text' placeholder="Search by name or abbreviation…")
        button.clear(v-if='has_filters' @click='clear_filters') Clear filters
    p.count {{ filtered.length }} of {{ rows.length }} translations
    table.watch_translations: tbody
        tr
            th Translation
            th Abbrev
            th Language
            th License
            th Provided by
        tr(v-for='item of shown' :key='item.id')
            td.condensed: a(:href='item.info_url' target='_blank' rel='noreferrer') {{ item.name }}
            td {{ item.abbrev }}
            td {{ item.language }}
            td: span.license_pill(:class='license_tier(item.license, item.id)') {{ item.license }}
            td {{ item.owner_name }}
    p.more(v-if='filtered.length > shown.length')
        | Showing first {{ shown.length }} — narrow your search or filters to see more specific results.

</template>


<script lang='ts' setup>

import {ref, computed, onBeforeMount, watch} from 'vue'

// Static Bible Org Watch data — checked into the repo, no backend
import translations from '@/_data/watch/translations.json'
import owners from '@/_data/watch/owners.json'
import license_terms from '@/_data/watch/license_terms.json'


// Same manual overrides as the owner dashboard — a few 'custom' licenses read no worse than an
// nc/nd clause once checked, and nld_nbg (GNU FDL) is actually open (permits commercial use and
// modification). See WatchOwnerDashboard.vue for per-entry notes.
const custom_tier_overrides:Record<string, 'open' | 'semi_restricted'> = {
    amh_amh: 'semi_restricted',
    cop_shc: 'semi_restricted',
    eng_net: 'semi_restricted',
    spa_rvg: 'semi_restricted',
    ukr_bju: 'semi_restricted',
    nld_nbg: 'open',
}

// Same tier scheme as the owner dashboard, used here to color-code each license pill.
// An unknown license is treated as restricted — not proven open, so not assumed open.
function license_tier(
        license:string, translation_id?:string):'open' | 'semi_restricted' | 'restricted'{
    if (license === 'custom' && translation_id && translation_id in custom_tier_overrides)
        return custom_tier_overrides[translation_id]!
    if (license === 'unknown' || license === 'custom') return 'restricted'
    if (license.includes('nc') || license.includes('nd')) return 'semi_restricted'
    return 'open'
}

// Build an id -> name lookup so each row can show its owner's name
const owner_names:Record<string, string> = {}
for (const owner of owners){
    owner_names[owner.id] = owner.name
}

// Prefer a translation's text license terms over audio when both exist
const license_by_translation:Record<string, {license:string, owner_id:string}> = {}
for (const term of license_terms){
    if (!license_by_translation[term.translation_id] || term.type === 'text')
        license_by_translation[term.translation_id] = {license: term.license, owner_id: term.owner_id}
}

// Attach license, owner id, and owner name to each row
const rows = translations.map(item => {
    const terms = license_by_translation[item.id]
    const owner_id = terms && terms.owner_id !== 'unknown' ? terms.owner_id : ''
    return {
        ...item,
        license: terms?.license ?? 'unknown',
        owner_id,
        owner_name: owner_id ? (owner_names[owner_id] ?? 'Unknown') : '',
    }
})

// Owners worth offering as a filter — only those with at least one tracked translation here
const owner_tracked_counts:Record<string, number> = {}
for (const row of rows){
    if (row.owner_id)
        owner_tracked_counts[row.owner_id] = (owner_tracked_counts[row.owner_id] ?? 0) + 1
}
const owner_options = Object.entries(owner_tracked_counts)
    .map(([id, tracked]) => ({id, name: owner_names[id] ?? id, tracked}))
    .sort((a, b) => a.name.localeCompare(b.name))

const language_options = [...new Set(rows.map(r => r.language))].sort()

// Filter state — kept in the URL hash so links (e.g. from the owner dashboard) can deep-link here
const selected_owner = ref("")
const selected_language = ref("")
const query = ref("")

onBeforeMount(() => {
    const params = new URLSearchParams(self.location.hash.slice(1))
    if (params.has('o')) selected_owner.value = params.get('o')!
    if (params.has('l')) selected_language.value = params.get('l')!
    if (params.has('q')) query.value = params.get('q')!
})

watch([selected_owner, selected_language, query], () => {
    const params = new URLSearchParams()
    if (selected_owner.value) params.set('o', selected_owner.value)
    if (selected_language.value) params.set('l', selected_language.value)
    if (query.value) params.set('q', query.value)
    self.location.hash = params.toString()
})

const has_filters = computed(() =>
    !!(selected_owner.value || selected_language.value || query.value))

function clear_filters(){
    selected_owner.value = ""
    selected_language.value = ""
    query.value = ""
}

const filtered = computed(() => {
    const q = query.value.trim().toLowerCase()
    return rows.filter(item =>
        (!selected_owner.value || item.owner_id === selected_owner.value)
        && (!selected_language.value || item.language === selected_language.value)
        && (!q || item.name.toLowerCase().includes(q) || item.abbrev.toLowerCase().includes(q)))
})

// Cap rendered rows for performance — narrowing the search/filters reveals more
const LIMIT = 200
const shown = computed(() => filtered.value.slice(0, LIMIT))

</script>


<style lang='sass' scoped>

.watch_translations_page
    .filters
        display: flex
        flex-wrap: wrap
        gap: 8px
        margin-bottom: 8px

        select, .search
            padding: 8px 10px
            border: 1px solid var(--vp-c-divider)
            border-radius: 6px
            font-size: 0.9em
            background: var(--vp-c-bg)
            color: var(--vp-c-text-1)

        select
            max-width: 260px

        .search
            flex: 1
            min-width: 200px

        .clear
            padding: 8px 12px
            border: 1px solid var(--vp-c-divider)
            border-radius: 6px
            font-size: 0.85em
            background: var(--vp-c-bg)
            color: var(--vp-c-text-2)
            cursor: pointer

            &:hover
                border-color: var(--vp-c-brand-1)
                color: var(--vp-c-brand-1)

    .count
        font-size: 0.8em
        opacity: 0.7
        margin: 0 0 8px

    .more
        font-size: 0.8em
        opacity: 0.7
        margin-top: 8px

.watch_translations
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

    .condensed
        max-width: 240px
        overflow: hidden
        text-overflow: ellipsis
        white-space: nowrap

.license_pill
    display: inline-block
    padding: 1px 7px
    border-radius: 5px
    font-size: 0.9em

    &.open
        color: var(--vp-c-green-1)
        background: var(--vp-c-green-soft)

    &.semi_restricted
        color: var(--vp-c-yellow-1)
        background: var(--vp-c-yellow-soft)

    &.restricted
        color: var(--vp-c-red-1)
        background: var(--vp-c-red-soft)

</style>
