
// Pulls Bible translation, owner, and license data to update the static
// Bible Society Watch dataset in src/_data/watch/*.json. Sources, in order:
//   1. find.bible — via the public digitalbiblesociety/data dataset (base translation list)
//   2. fetch.bible — v1.fetch.bible/manifest.json (license/owner for translations it distributes)
//   3. DBL (Digital Bible Library) — only for translations still missing a license after 1-2,
//      only with --with-dbl, and only after an interactive confirmation (never run silently)
// Deliberately does NOT consult eBible or open.bible (open.bible was tried and dropped — see
// git history if it needs revisiting; this sandbox's network can't reach it at all).
//
// Usage:
//   node --experimental-strip-types scripts/update_watch_data.ts [--dry-run] [--with-dbl]

import {readFileSync, writeFileSync} from 'node:fs'
import {createInterface} from 'node:readline/promises'
import {createHmac} from 'node:crypto'

import type {Translation, Owner, LicenseTerms} from '../src/_data/watch/types.ts'


const DATA_DIR = new URL('../src/_data/watch/', import.meta.url)
const FIND_BIBLE_BASE = 'https://raw.githubusercontent.com/digitalbiblesociety/data/master'
const FETCH_BIBLE_MANIFEST = 'https://v1.fetch.bible/manifest.json'
const DBL_API = 'https://api.library.bible/v1'

const args = new Set(process.argv.slice(2))
const DRY_RUN = args.has('--dry-run')
const WITH_DBL = args.has('--with-dbl')


// ---- small generic helpers ----

function load_json<T>(name:string):T{
    // Read one of our own data files
    return JSON.parse(readFileSync(new URL(name, DATA_DIR), 'utf8'))
}

function save_json(name:string, data:unknown):void{
    // Write one of our own data files, matching the repo's existing 4-space formatting
    if (DRY_RUN){
        console.info(`[dry-run] would write ${name}`)
        return
    }
    writeFileSync(new URL(name, DATA_DIR), JSON.stringify(data, null, 4) + '\n')
}

function slugify(name:string):string{
    // Turn an owner display name into a stable, url-safe id
    return name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '')
}

async function fetch_json<T>(url:string, headers:Record<string, string> = {}):Promise<T>{
    const res = await fetch(url, {headers})
    if (!res.ok)
        throw new Error(`Failed to fetch ${url}: ${res.status}`)
    return res.json() as Promise<T>
}

function upsert_by_id<T extends {id:string}>(list:T[], item:T):void{
    const i = list.findIndex(x => x.id === item.id)
    if (i === -1) list.push(item)
    else list[i] = {...list[i], ...item}
}

function get_or_create_owner(owners:Owner[], name:string):string{
    // Find an existing owner by name, or add a new one — returns the owner's id
    const id = slugify(name)
    if (!owners.some(o => o.id === id))
        owners.push({id, name})
    return id
}

const today = ():string => new Date().toISOString().slice(0, 10)


// ---- license detection (ported from fetch.bible's collector/src/parts/license.ts) ----

const STANDARD_LICENSES = new Set([
    'public', 'cc-by', 'cc-by-sa', 'cc-by-nc', 'cc-by-nc-sa', 'cc-by-nd', 'cc-by-nc-nd',
])

function license_from_url(url:string):{license:string, url:string}|null{
    const clean = url.replace(/[^\x20-\x7E]/g, '')
    const normalized = clean.replace(/^http:/, 'https:').replace(/\/?$/, '/')
    const cc_match = /creativecommons\.org\/licenses\/(by[a-z-]*)\//i.exec(normalized)
    if (cc_match){
        const license = `cc-${cc_match[1]!.toLowerCase()}`
        if (STANDARD_LICENSES.has(license))
            return {license, url: normalized}
    }
    if (/creativecommons\.org\/publicdomain\/zero\//i.test(normalized))
        return {license: 'public', url: normalized}
    return null
}

function license_from_text(text:string):{license:string, url:string}|null{
    const url_match =
        /https?:\/\/creativecommons\.org\/(?:licenses|publicdomain)\/[^\s"'<>]+/i.exec(text)
    if (url_match){
        const detected = license_from_url(url_match[0])
        if (detected) return detected
    }
    if (/public domain/i.test(text) && !/not public domain/i.test(text))
        return {license: 'public', url: ''}
    return null
}


// ---- 1. find.bible (digitalbiblesociety/data) ----

interface FindBibleEntry {
    id:string
    tt:string  // title (name)
    iso:string  // ISO 639-3 language code
    dt:string  // date/year, e.g. "1964"
}

interface FindBibleLink {
    bible_abbr:string  // matches FindBibleEntry.id
    url:string
    provider:string
}

async function pull_find_bible(translations:Translation[]):Promise<void>{
    console.info('Fetching find.bible dataset (digitalbiblesociety/data)...')
    const [bibles, links] = await Promise.all([
        fetch_json<FindBibleEntry[]>(`${FIND_BIBLE_BASE}/bibles.json`),
        fetch_json<FindBibleLink[]>(`${FIND_BIBLE_BASE}/bible_links.json`),
    ])

    // Map bible_abbr -> DBL uid, extracted from links whose provider is the Digital Bible Library
    const dbl_uid_by_abbr = new Map<string, string>()
    for (const link of links){
        if (!/digital bible library/i.test(link.provider)) continue
        const uid_match = /([0-9a-f]{16})/.exec(link.url)
        if (uid_match) dbl_uid_by_abbr.set(link.bible_abbr, uid_match[1]!)
    }

    let added = 0
    for (const entry of bibles){
        // Skip junk entries — blank name, or ISO's "no linguistic content" placeholder
        const name = entry.tt.trim()
        if (!name || entry.iso === 'zxx') continue

        const year = parseInt(entry.dt) || 0
        const dbl_uid = dbl_uid_by_abbr.get(entry.id)

        const translation:Translation = {
            id: entry.id,
            name,
            abbrev: entry.id,
            language: entry.iso,
            latest_year: year,
            external_ids: {
                find_bible: entry.id,
                ...(dbl_uid ? {dbl: dbl_uid} : {}),
            },
            info_url: `https://find.bible/bibles/${entry.id}/`,
        }
        // Preserve any external_ids already on the existing record (e.g. a manually-added one)
        const existing = translations.find(t => t.id === entry.id)
        if (existing) translation.external_ids = {...existing.external_ids, ...translation.external_ids}

        upsert_by_id(translations, translation)
        added += 1
    }
    console.info(`find.bible: upserted ${added} translations`)
}


// ---- 2. fetch.bible (v1.fetch.bible/manifest.json) ----

interface FetchBibleEntry {
    name:{english:string, english_abbrev:string}
    year:number
    copyright:{
        licenses:{license:string, url:string}[]
        attribution:string
        attribution_url:string
    }
}

async function pull_fetch_bible(
        translations:Translation[], owners:Owner[], license_terms:LicenseTerms[]):Promise<void>{
    console.info('Fetching fetch.bible manifest...')
    const manifest = await fetch_json<{bibles:Record<string, FetchBibleEntry>}>(FETCH_BIBLE_MANIFEST)

    // fetch.bible's own ids don't correspond to find.bible ids, so match via the DBL uid embedded
    // in each entry's attribution_url (both reference the same underlying DBL content-entry uid)
    const by_dbl_uid = new Map<string, FetchBibleEntry>()
    for (const entry of Object.values(manifest.bibles)){
        const uid_match = /([0-9a-f]{16})/.exec(entry.copyright.attribution_url)
        if (uid_match) by_dbl_uid.set(uid_match[1]!, entry)
    }

    let matched = 0
    for (const translation of translations){
        const dbl_uid = translation.external_ids.dbl
        if (!dbl_uid) continue
        const entry = by_dbl_uid.get(dbl_uid)
        if (!entry) continue

        // Already have license terms for this translation? Don't overwrite.
        if (license_terms.some(lt => lt.translation_id === translation.id && lt.type === 'text'))
            continue

        const license = entry.copyright.licenses[0]
        if (!license) continue

        const owner_name = entry.copyright.attribution || 'Unknown'
        const owner_id = get_or_create_owner(owners, owner_name)

        license_terms.push({
            translation_id: translation.id,
            owner_id,
            type: 'text',
            license: license.license,
            url: license.url,
            last_verified: today(),
        })
        matched += 1
    }
    console.info(`fetch.bible: added license terms for ${matched} translations`)
}


// ---- 3. DBL (Digital Bible Library) — gated behind --with-dbl + interactive confirmation ----

function dbl_headers(url:string, method='GET'):Record<string, string>{
    const api_key = (process.env['DBL_API_KEY'] ?? '').toLowerCase()
    const api_secret = (process.env['DBL_API_SECRET'] ?? '').toLowerCase()
    if (!api_key || !api_secret){
        throw new Error('DBL_API_KEY and DBL_API_SECRET env vars required'
            + ' — see https://care.library.bible/article/147-add-and-manage-access-tokens')
    }
    const path = new URL(url).pathname
    const date = new Date().toUTCString()
    const signing = `${method} ${path}\n\n${date}\n`
    const sig = createHmac('sha1', api_key).update(signing + api_secret).digest('hex')
    return {
        'Accept': 'application/json',
        'Date': date,
        'X-DBL-Authorization': `version=v1,token=${api_key},signature=${sig}`,
    }
}

interface DblContentEntry {
    uid:string
    copyrightStatement?:string
    primaryLicensorOrg?:{name:string}
    providedByOrg?:{name:string}
}

interface DblListResponse {
    items:DblContentEntry[]
}

// fetch.bible is the primary source for license detection — DBL is only a fallback for
// translations it doesn't cover. Uses the paginated list endpoint (a handful of requests for the
// whole open-access catalog), never one request per translation.
async function fetch_dbl_open_access_entries():Promise<DblContentEntry[]>{
    const all:DblContentEntry[] = []
    const limit = 500
    let offset = 0
    while (true){
        const url = `${DBL_API}/content-entries?is_open_access=true&medium=text`
            + `&include_full_details=true&limit=${limit}&offset=${offset}`
        const page = await fetch_json<DblListResponse>(url, dbl_headers(url))
        all.push(...page.items)
        if (page.items.length < limit) break
        offset += limit
    }
    return all
}

async function pull_dbl(
        translations:Translation[], owners:Owner[], license_terms:LicenseTerms[]):Promise<void>{
    const candidates = translations.filter(t =>
        t.external_ids.dbl && !license_terms.some(lt => lt.translation_id === t.id))
    if (!candidates.length){
        console.info('DBL: nothing left needing a lookup, skipping')
        return
    }

    if (!WITH_DBL){
        console.info(`DBL: ${candidates.length} translations have a DBL id but no license from `
            + 'fetch.bible yet — re-run with --with-dbl to check the DBL catalog (never run '
            + 'automatically)')
        return
    }

    const rl = createInterface({input: process.stdin, output: process.stdout})
    const answer = await rl.question(
        'About to fetch the DBL open-access catalog (a handful of paginated list requests, '
        + 'not one per translation). Continue? [y/N] ')
    rl.close()
    if (answer.trim().toLowerCase() !== 'y'){
        console.info('DBL: cancelled')
        return
    }

    const entries = await fetch_dbl_open_access_entries()
    const by_uid = new Map(entries.map(e => [e.uid, e]))

    let matched = 0
    for (const translation of candidates){
        const entry = by_uid.get(translation.external_ids.dbl!)
        if (!entry) continue

        const detected = license_from_text(entry.copyrightStatement ?? '')
        if (!detected) continue

        const owner_name = entry.primaryLicensorOrg?.name || entry.providedByOrg?.name || 'Unknown'
        const owner_id = get_or_create_owner(owners, owner_name)

        license_terms.push({
            translation_id: translation.id,
            owner_id,
            type: 'text',
            license: detected.license,
            url: detected.url || `https://app.library.bible/content/${entry.uid}`,
            last_verified: today(),
        })
        matched += 1
    }
    console.info(`DBL: added license terms for ${matched} translations`)
}


// ---- main ----

async function main():Promise<void>{
    const translations = load_json<Translation[]>('translations.json')
    const owners = load_json<Owner[]>('owners.json')
    const license_terms = load_json<LicenseTerms[]>('license_terms.json')

    await pull_find_bible(translations)
    await pull_fetch_bible(translations, owners, license_terms)
    await pull_dbl(translations, owners, license_terms)

    translations.sort((a, b) => a.id.localeCompare(b.id))
    owners.sort((a, b) => a.id.localeCompare(b.id))
    license_terms.sort((a, b) => a.translation_id.localeCompare(b.translation_id))

    save_json('translations.json', translations)
    save_json('owners.json', owners)
    save_json('license_terms.json', license_terms)

    console.info(`Done: ${translations.length} translations, ${owners.length} owners, `
        + `${license_terms.length} license terms`)
}

main().catch(err => {
    console.error(err)
    process.exit(1)
})
