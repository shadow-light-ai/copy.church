
---
description: A registry of Bible translations, who owns them, and how they've responded when their work was shared.
---

<script lang='ts' setup>
import WatchOwnerDashboard from '@/_comp/watch/WatchOwnerDashboard.vue'
import WatchTranslations from '@/_comp/watch/WatchTranslations.vue'
</script>

# Bible Society Watch

Bible Society Watch tracks every known Bible translation, who owns or publishes it, and how
restrictively that owner licenses it — ranking owners by how much of their catalogue is locked
down, so restrictive behavior carries a reputational cost and generous licensing a reputational
reward.

All data behind this feature is static, checked into this repository like the rest of the
site — there's no database or backend. The schema lives in `src/_data/watch/` as four JSON
files (translations, owners, license terms, response log) with types in `types.ts`.

See also &nbsp; <VPButton text="Bible ratings" href='/initiatives/bibles/' theme='alt' /> &nbsp; <VPButton text="Critical Text ratings" href='/initiatives/critical-texts/' theme='alt' />

## Owners ranked by restriction

<WatchOwnerDashboard/>

## Translation directory

<WatchTranslations/>
