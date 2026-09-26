---
description: A registry of Bible translations, who owns them, and how they've responded when their work was shared.
---

<script lang='ts' setup>
import WatchOwnerDashboard from '@/_comp/watch/WatchOwnerDashboard.vue'
</script>

# Bible Org Watch

Bible Org Watch tracks which organizations hold the rights to God's word, and how much of it
they choose to restrict rather than release.

- **Restricted**: You cannot share the Bible translation without their permission
- **Semi-restricted**: You cannot use the translation as a base for a new Bible translation
  and/or sell printed copies (no derivatives / non-commercial)

All data behind this feature is static, checked into this repository like the rest of the
site — there's no database or backend. The schema lives in `src/_data/watch/` as four JSON
files (translations, owners, license terms, response log) with types in `types.ts`.

See also &nbsp; <VPButton text="Bible ratings" href='/initiatives/bibles/' theme='alt' /> &nbsp; <VPButton text="Critical Text ratings" href='/initiatives/critical-texts/' theme='alt' />

<WatchOwnerDashboard/>

<VPButton text="All Bibles" href='/watch/translations/' theme='alt' />

_All figures above only cover modern translations — anything old enough to be in the public
domain by age (more than 95 years old under US copyright law) is excluded, except the KJV, which
remains under perpetual Crown copyright._
