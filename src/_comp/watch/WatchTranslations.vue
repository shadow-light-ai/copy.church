
<template lang='pug'>

table.watch_translations: tbody
    tr
        th Translation
        th Abbrev
        th Language
        th Scope
        th Provided by
    tr(v-for='item of rows' :key='item.id')
        td.condensed: a(:href='item.info_url' target='_blank' rel='noreferrer') {{ item.name }}
        td {{ item.abbrev }}
        td {{ item.language }}
        td {{ item.scope }}
        td {{ item.owner_name }}

</template>


<script lang='ts' setup>

// Static Bible Society Watch data — checked into the repo, no backend
import translations from '@/_data/watch/translations.json'
import owners from '@/_data/watch/owners.json'


// Build an id -> name lookup so each row can show its owner's name
const owner_names:Record<string, string> = {}
for (const owner of owners){
    owner_names[owner.id] = owner.name
}

// Sort translations alphabetically and attach the owner's name to each row
const rows = [...translations]
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(item => ({...item, owner_name: owner_names[item.owner_id] ?? "Unknown"}))

</script>


<style lang='sass' scoped>

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
