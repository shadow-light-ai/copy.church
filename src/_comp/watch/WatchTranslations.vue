
<template lang='pug'>

div.watch_translations_wrap
    input.search(v-model='query' type='text' placeholder="Search by name, abbreviation, or language code…")
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
            td: span.license_pill(:class='license_tier(item.license)') {{ item.license }}
            td {{ item.owner_name }}
    p.more(v-if='filtered.length > shown.length')
        | Showing first {{ shown.length }} — narrow your search to see more specific results.

</template>


<script lang='ts' setup>

import {ref, computed} from 'vue'

// Static Bible Society Watch data — checked into the repo, no backend
import translations from '@/_data/watch/translations.json'
import owners from '@/_data/watch/owners.json'
import license_terms from '@/_data/watch/license_terms.json'


// Same tier scheme as the owner dashboard, used here to color-code each license pill
function license_tier(license:string):'open' | 'limited' | 'restricted' | 'unknown'{
    if (license === 'unknown') return 'unknown'
    if (license === 'custom') return 'restricted'
    const nc = license.includes('nc')
    const nd = license.includes('nd')
    if (nc && nd) return 'restricted'
    if (nc || nd) return 'limited'
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

// Attach license and owner name to each row (rows are already sorted in the data file)
const rows = translations.map(item => {
    const terms = license_by_translation[item.id]
    return {
        ...item,
        license: terms?.license ?? 'unknown',
        owner_name: terms && terms.owner_id !== 'unknown' ? (owner_names[terms.owner_id] ?? 'Unknown') : '',
    }
})

// Filter by name/abbrev/language as the visitor types
const query = ref("")
const filtered = computed(() => {
    const q = query.value.trim().toLowerCase()
    if (!q) return rows
    return rows.filter(item =>
        item.name.toLowerCase().includes(q)
        || item.abbrev.toLowerCase().includes(q)
        || item.language.toLowerCase().includes(q))
})

// Cap rendered rows for performance — narrowing the search reveals more
const LIMIT = 200
const shown = computed(() => filtered.value.slice(0, LIMIT))

</script>


<style lang='sass' scoped>

.watch_translations_wrap
    .search
        width: 100%
        padding: 8px 10px
        margin-bottom: 8px
        border: 1px solid var(--vp-c-divider)
        border-radius: 6px
        font-size: 0.9em
        background: var(--vp-c-bg)
        color: var(--vp-c-text-1)

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

    &.limited
        color: var(--vp-c-yellow-1)
        background: var(--vp-c-yellow-soft)

    &.restricted
        color: var(--vp-c-red-1)
        background: var(--vp-c-red-soft)

    &.unknown
        color: var(--vp-c-text-2)
        background: var(--vp-c-bg-alt)

</style>
