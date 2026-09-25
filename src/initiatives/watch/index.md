---
description: A registry of Bible translations, who owns them, and how they've responded when their work was shared.
---

<script lang='ts' setup>
import WatchTranslations from '@/_comp/watch/WatchTranslations.vue'
</script>

# Bible Society Watch

_This page is a placeholder. The feature described below is still being researched and designed — nothing here is final._

Bible Society Watch will extend copy.church's existing [Bible ratings](/initiatives/bibles/) beyond a
hand-picked list of English translations into a much larger, structured registry: every known Bible
translation, who owns or publishes it, what its actual license terms are, and a public record of how
that owner has responded when people have copied, shared, translated, or adapted it.

The goal isn't just information but leverage — making rights-holder behavior visible, so that
restrictive or punitive responses carry a reputational cost, and generous ones a reputational reward.

## What it will cover

- **Translation directory** — every known Bible translation, searchable and filterable by
  language, owner, and how shareable its license actually is.
- **Owner directory** — the Bible societies, denominations, translators, and publishers behind
  those translations, each with the translations and response-log entries tied to them.
- **Response log** — a dated record of how an owner has actually responded to sharing: a
  cease-and-desist, a revoked license, a public permissive statement, and so on, each with its
  evidence and a verification status.

## Where things stand

All data behind this feature is static, checked into this repository like the rest of the
site — there's no database or backend. The schema lives in `src/_data/watch/` as four JSON
files (translations, owners, license terms, response log) with types in `types.ts`. Coverage
currently includes full Bibles, New Testaments, and partial/portion translations, sourced from
find.bible's public dataset and cross-referenced against the Digital Bible Library where possible.

See also &nbsp; <VPButton text="Bible ratings" href='/initiatives/bibles/' theme='alt' /> &nbsp; <VPButton text="Critical Text ratings" href='/initiatives/critical-texts/' theme='alt' />

## Data test

5,438 translations, sourced from [digitalbiblesociety/data](https://github.com/digitalbiblesociety/data)
(the public dataset behind find.bible) and cross-referenced against a Digital Bible Library test
pull for owner information where available. License terms aren't populated yet — every entry
currently shows `unknown` until the license-detection step is built, and only 110 translations
have a known owner so far. The response log is empty; entries will be added manually, each
reviewed before publishing, once real cases are sourced and verified.

<details>
<summary>5,438 translations from the Bible Society Watch dataset</summary>

<WatchTranslations/>

</details>
