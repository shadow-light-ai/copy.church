
// Shared types for the Bible Society Watch dataset (src/_data/watch/*.json)
// All data here is static and checked into the repo — no backend, no Firestore.


// A single Bible translation (full, NT-only, or a partial/portion translation)
export interface Translation {
    id: string  // Stable internal id, e.g. `<lang_code>_<org_abbrev>`
    name: string  // English name
    abbrev: string  // English abbreviation
    language: string  // ISO 639-3 code
    latest_year: number  // Most recent known year (revision, or completion)
    scope: "full" | "nt" | "ot" | "portion" | "unknown"  // 'unknown' when the source doesn't say
    external_ids: {
        dbl?: string
        find_bible?: string
        ebible?: string
        open_bibles?: string
    }
    info_url: string  // find.bible page where possible, else a source-specific fallback
}


// A rights holder — organization or individual — that owns or publishes translations
export interface Owner {
    id: string
    name: string
    website?: string
    ministry_watch_url?: string  // Link to this owner's Ministry Watch database entry, if present
}


// License terms for a translation, as granted by a specific owner
// Kept simple for now — a single license label rather than a granular permission map
export interface LicenseTerms {
    translation_id: string  // References a Translation's `id`
    owner_id: string  // References an Owner's `id`
    type: "text" | "audio"  // Which form of the translation these terms apply to
    license: string  // fetch.bible format, no version numbers: 'public', 'cc-by', 'cc-by-sa',
        // 'cc-by-nc', 'cc-by-nc-sa', 'cc-by-nd', 'cc-by-nc-nd', 'custom', or 'unknown'
    url: string  // Where the license terms are documented
    last_verified: string  // ISO 8601 date, e.g. '2026-09-25'
}


// A dated, evidenced record of how an owner has responded to sharing/copying
// This is the genuinely novel part of the feature — the accountability log
export interface ResponseLogEntry {
    id: string
    owner_id: string  // References an Owner's `id`
    translation_ids: string[]  // Optionally scoped to specific Translations
    date: string  // ISO 8601 date
    summary: string
    evidence_url: string
    reporter_name: string  // Who reported this entry
    reporter_url: string  // Link to the reporter (profile, site, contact page, etc.)
}
