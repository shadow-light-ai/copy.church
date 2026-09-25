
// Shared types for the Bible Society Watch dataset (src/_data/watch/*.json)
// All data here is static and checked into the repo — no backend, no Firestore.


// A single Bible translation (full, NT-only, or a partial/portion translation)
export interface Translation {
    id: string  // Stable internal id, e.g. `<lang_code>_<org_abbrev>`
    name: {
        local: string
        local_abbrev: string
        english: string
        english_abbrev: string
    }
    language: {
        code: string  // ISO 639-3
        name: string
    }
    country: string
    year: number  // Earliest known year (submission or completion)
    scope: "full" | "nt" | "ot" | "portion"
    owner_id: string  // References an Owner's `id`
    external_ids: {
        dbl?: string
        ebible?: string
        open_bibles?: string
    }
    source_url: string  // Where to read/access the text
}


// A rights holder — organization or individual — that owns or publishes translations
export interface Owner {
    id: string
    name: string
    website?: string
}


// License terms for a translation, as granted by a specific owner
// Kept simple for now — a single license label rather than a granular permission map
export interface LicenseTerms {
    translation_id: string  // References a Translation's `id`
    owner_id: string  // References an Owner's `id`
    license: string  // e.g. 'cc-by-sa-4.0', 'public-domain', 'proprietary', 'unknown'
    url: string  // Where the license terms are documented
    last_verified: string  // ISO 8601 date, e.g. '2026-09-25'
}


// A dated, evidenced record of how an owner has responded to sharing/copying
// This is the genuinely novel part of the feature — the accountability log
export interface ResponseLogEntry {
    id: string
    owner_id: string  // References an Owner's `id`
    translation_id?: string  // Optionally scoped to a specific Translation
    date: string  // ISO 8601 date
    type: "cease_and_desist" | "access_revoked" | "permissive_statement"
        | "license_liberalized" | "no_response" | "other"
    summary: string
    evidence_url: string
    verification_status: "verified" | "unverified" | "disputed"
}
