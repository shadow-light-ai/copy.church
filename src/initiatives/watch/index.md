---
description: A registry of Bible translations, who owns them, and how they've responded when their work was shared.
---

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
  language, country, owner, and how shareable its license actually is.
- **Owner directory** — the Bible societies, denominations, translators, and publishers behind
  those translations, each with the translations and response-log entries tied to them.
- **Response log** — a dated record of how an owner has actually responded to sharing: a
  cease-and-desist, a revoked license, a public permissive statement, and so on, each with its
  evidence and a verification status.

## Where things stand

All data behind this feature will be static, checked into this repository like the rest of the
site — there's no database or backend planned for it. The open question still being worked through
is scope: whether to cover full Bibles only, or also New Testament and partial-scripture
translations from the start.

See also &nbsp; <VPButton text="Bible ratings" href='/initiatives/bibles/' theme='alt' /> &nbsp; <VPButton text="Critical Text ratings" href='/initiatives/critical-texts/' theme='alt' />

## Live data test

A single test request to the Digital Bible Library API, fetching the first 100 open-access
text entries, to confirm the pipeline works before scaling it up. This list is a static
snapshot from that one request — not live, and not deduplicated or cleaned yet.

<details>
<summary>100 translations from a single DBL API request</summary>

| Translation | Language | Country | Provided by |
| --- | --- | --- | --- |
| Akukem Portions for DBL | Akukem | Papua New Guinea | Pioneer Bible Translators |
| Bayso New Testament Ethiopic Version | Baiso | Ethiopia | The Word for the World International |
| Bayso New Tetament | Baiso | Ethiopia | The Word for the World International |
| Bhumiya | Bhunjia | India | The Word for the World International |
| Bible (A.Bokun translation) | Belarusian | Belarus | John the Forerunner Church of Christians of Evangelical Faith of Minsk City |
| Bible Iyansi | Yansi | Congo, the Democratic Republic of the | The Seed Company |
| Biblica® Open Asante Twi Contemporary Bible 2020 | Twi | Ghana | Biblica, Inc. |
| Biblica® Open Hausa Contemporary Bible 2020 | Hausa | Nigeria | Biblica, Inc. |
| Biblica® Open Hiligaynon Contemporary Bible 2022 | Hiligaynon | Philippines | Biblica, Inc. |
| Biblica® Open Hindi Contemporary Version 2019 | Hindi | India | Biblica, Inc. |
| Biblica® Open Indian Tamil Contemporary Version | Tamil | India | Biblica, Inc. |
| Biblica® Open Kannada Contemporary Version 2022 | Kannada | India | Biblica, Inc. |
| Biblica® Open Kiswahili Contemporary Scriptures™ 2024 | Swahili | Tanzania, United Republic of | Biblica, Inc. |
| Biblica® Open Marathi Contemporary Version | Marathi | India | Biblica, Inc. |
| Biblica® Open Ndebele Contemporary Bible 2022 | Ndebele | Zimbabwe | Biblica, Inc. |
| Biblica® Open New Oromo Contemporary Version Latin 2022 | Oromo, West Central | Ethiopia | Biblica, Inc. |
| Biblica® Open Norwegian Living New Testament 2005 | Norwegian Bokmål | Norway | Biblica, Inc. |
| Chrau Bible Literal Text | Chrau | Viet Nam | FAR EAST BROADCASTING COMPANY |
| Cishingini Agwara Kambari [asg] | Cishingini | Nigeria | The Seed Company |
| Croatian: Sarić translation revised with DC 2007 | Croatian | Croatia | Croatian Bible Society |
| Cua Bible Literal Text | Cua | Viet Nam | FAR EAST BROADCASTING COMPANY |
| Duay-Rheims American Edition  1899 [eng] USA | English | United States | eBible.org |
| Ekajuk Scriptures | Ekajuk | Nigeria | The Seed Company |
| Etulo | Etulo | Nigeria | The Seed Company |
| Gamo Full Bible Ethiopic Version | Gamo | Ethiopia | The Word for the World International |
| Gata Didayi Bible | Gata’ | India | The Word for the World International |
| Gava | Guduf-Gava | Nigeria | The Seed Company |
| Gawli Bible | Gowli | India | The Word for the World International |
| Haryanvi Bible | Haryanvi | India | Beyond Translation |
| Havai | Ambae, East | Vanuatu | Pioneer Bible Translators |
| Hindi Standard Bible | Hindi | India | Global Bible Initiative |
| Hona Bible | Hwana | Nigeria | The Seed Company |
| Indian Revised Version (IRV) Tamil - 2019 | Tamil | India | Bridge Connectivity Solutions |
| Indian Revised Version(IRV) Hindi - 2019 | Hindi | India | Bridge Connectivity Solutions |
| Indian Revised Version(IRV) Odia - 2021 | Oriya | India | Bridge Connectivity Solutions |
| Juray Soura Bible | Juray | India | The Word for the World International |
| Katu Bible Literal Text | Katu, Western | Viet Nam | FAR EAST BROADCASTING COMPANY |
| KOLAMI Bible | Kolami, Southeastern | India | The Word for the World International |
| Konda Porja Bible | Konda-Dora | India | The Word for the World International |
| Koya Bible | Koya | India | The Word for the World International |
| Literal Standard Version | English | United States of America | Covenant Press |
| MAALE Bible | Male | Ethiopia | Bible Society of Ethiopia |
| Maori New Testament | Maori | New Zealand | Bible Society New Zealand Charitable Trust |
| Margi Tiwi Nga Tǝm [mfm] | Marghi South | Nigeria | The Seed Company |
| Mbembe Okohm | Mbe | Nigeria | The Seed Company |
| Mbula | Mbula-Bwazza | Nigeria | The Seed Company |
| Melo New Testament Ethiopic | Melo | Ethiopia | The Word for the World International |
| Melo New Testament Latin | Melo | Ethiopia | The Word for the World International |
| Myanmar Standard Bible (Unicode) | Burmese | Myanmar | Global Bible Initiative |
| Nend Portions - Mark | Nend | Papua New Guinea | Pioneer Bible Translators |
| New Testament in Kwere | Kwere | Tanzania, United Republic of | The Word for the World International |
| Ngindo New Testament | Ngindo | Tanzania | The Word for the World International |
| Nguu New Testament | Nguu | Tanzania | The Word for the World International |
| Northern Zeme Bible | Naga, Mzieme | India | Bridge Connectivity Solutions |
| Oyda New Testament Latin | Oyda | Ethiopia | The Word for the World International |
| Powari Standard Project | Powari | India | The Word for the World International |
| Projet Yaka | Yaka | Congo, the Democratic Republic of the | The Seed Company |
| Romani Arli Bible 2024 | Romani, Balkan | Serbia | The Word for the World International |
| Saafi-Saafi Scripture for Digital | Saafi-Saafi | Senegal | Wycliffe Bible Translators, Inc. |
| Sanskrit Bible (NT) in Cologne Script (satyavEdaH\|) | Sanskrit | India | SanskritBible.in |
| Sanskrit Bible (NT) in IAST Script (satyavedaḥ\|) | Sanskrit | India | SanskritBible.in |
| Sanskrit Bible (NT) in Malayalam Script (സത്യവേദഃ।) | Sanskrit | India | SanskritBible.in |
| Sanskrit Bible (NT) in Punjabi Script (ਸਤ੍ਯਵੇਦਃ।) | Sanskrit | India | SanskritBible.in |
| Sanskrit Bible (NT) in Sinhala Script (සත්‍යවේදඃ।) | Sanskrit | Sri Lanka | SanskritBible.in |
| Sanskrit Bible (NT) in Tamil Script (ஸத்யவேத³​:।) | Sanskrit | India | SanskritBible.in |
| Sanskrit Bible (NT) in Thai Script (สตฺยเวท:ฯ) | Sanskrit | Thailand | SanskritBible.in |
| Sanskrit Bible (NT) in Tibetan Script (སཏྱཝེདཿ།) | Sanskrit | China | SanskritBible.in |
| Sanskrit Bible (NT) in Urdu Script (سَتْیَویدَح۔) | Sanskrit | India | SanskritBible.in |
| Serbian Bible (Vuk Karadžić, Đura Daničić) [srp] Serbia | Serbian | Serbia | eBible.org |
| Sikkiligar Bible | Sholaga | India | The Word for the World International |
| SOLI BIBLE TRANSLATION | Soli | Zambia | The Word for the World International |
| Southern Arabic | Arabic, Sudanese Creole | South Sudan | Pioneer Bible Translators |
| Southern East Cree (Roman) [crj] -Canada (web 2018) | Cree, Southern East | Canada | Canadian Bible Society |
| Susu Arabic | Susu | Guinea | Pioneer Bible Translators |
| Tagakaulo Version | Tagakolu | Philippines | Wycliffe Bible Translators, Inc. |
| Takuu New Testament | Takuu | Papua New Guinea | eBible.org |
| Terjemahan Sederhana Indonesia | Indonesian | Indonesia | The Our Language Bible Organization |
| Thai KJV | Thai | Thailand | eBible.org |
| The English New Testament According to Family 35 | English | Unspecific | eBible.org |
| The New Testament in Pogoro | Shipogoro | Tanzania | The Word for the World International |
| The Text-Critical English New Testament | English | United States of America | eBible.org |
| Thur | Thur | Uganda | Wycliffe Bible Translators, Inc. |
| Toma Bible | Toma | Guinea | Bible Society in Guinea-Conakry |
| Tongan Revised West Version | Tonga (Tonga Islands) | Tonga | eBible.org |
| True Meaning Arabic | Arabic, Standard | Lebanon | Eastern Zone |
| Tsakhur | Tsakhur | Azerbaijan | Institute for Bible Translation, Russia |
| Tutsa: Bible Translation 1st Edition | Tutsa Naga | India | The Word for the World International |
| Ubuvala (Iamalele) New Testament | Ubuvala | Papua New Guinea | Wycliffe Bible Translators, Inc. |
| Urdu Geo Version (Roman Script) | Urdu | Pakistan | eBible.org |
| Urdu Geo Version (Urdu Script) | Urdu | Pakistan | eBible.org |
| UWSPÓŁCZEŚNIONA BIBLIA GDAŃSKA [pol] | Polish | Poland | eBible.org |
| Vietnamese Bible 1925 [vie] Vietnam | Vietnamese | Viet Nam | eBible.org |
| Westminister Leningrad Codex | Hebrew, Ancient | Israel | eBible.org |
| Westminster Leningrad Codex | Hebrew | Unspecific | United Bible Societies |
| World Messianic Bible British Edition | English | Australia | eBible.org |
| Yemsa New Testament Ethiopic | Yemsa | Ethiopia | The Word for the World International |
| Yorumsuz Türkçe Çeviri (YTC) | Turkish | Turkey | eBible.org |
| Zotung Bible | Zotung Chin | Myanmar | Bible Society of Myanmar |
| Zul | Polci | Nigeria | The Seed Company |
| 免费的易读圣经 Free Easy-to-read Bible | Chinese, Mandarin | China | Free Bible Ministry, Inc. |

</details>
