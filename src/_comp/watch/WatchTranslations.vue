
<template lang='pug'>

div.watch_translations_wrap
    input.search(v-model='query' type='text' placeholder="Search by name, abbreviation, or language code…")
    p.count {{ filtered.length }} of {{ rows.length }} translations
    table.watch_translations: tbody
        tr
            th Translation
            th Abbrev
            th Language
            th Scope
            th Provided by
        tr(v-for='item of shown' :key='item.id')
            td.condensed: a(:href='item.info_url' target='_blank' rel='noreferrer') {{ item.name }}
            td {{ item.abbrev }}
            td {{ item.language }}
            td {{ item.scope }}
            td {{ item.owner_name }}
    p.more(v-if='filtered.length > shown.length')
        | Showing first {{ shown.length }} — narrow your search to see more specific results.

</template>


<script lang='ts' setup>

import {ref, computed} from 'vue'

// Static Bible Society Watch data — checked into the repo, no backend
import translations from '@/_data/watch/translations.json'
import owners from '@/_data/watch/owners.json'


// Build an id -> name lookup so each row can show its owner's name
const owner_names:Record<string, string> = {}
for (const owner of owners){
    owner_names[owner.id] = owner.name
}

// Attach the owner's name to each row (names are already sorted in the data file)
const rows = translations.map(item => ({
    ...item,
    owner_name: item.owner_id ? (owner_names[item.owner_id] ?? "Unknown") : "",
}))

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

</style>
