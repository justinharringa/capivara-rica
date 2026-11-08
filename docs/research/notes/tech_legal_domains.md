# Technical, legal and naming groundwork for a free, open-source, browser-based financial-education game for Brazilian teens (14-25), as of 2026

Research date: 2026-11-07 (sandbox clock: `Sat Nov 7 04:19-04:20 UTC 2026`).
Source labels used below:
- **[fetched]**: retrieved and read in this session.
- **[search-summary]**: seen only as a web-search result summary. The claim is attributed to the linked page but was not opened in full.
- **[canonical, not fetched]**: an authoritative URL cited from prior knowledge, not re-read this session. Verify before relying on it.

Important access limits from this sandbox:
- planalto.gov.br returned an **access-denied page** (Presidência "bloqueio de aplicações"), so no law text was read verbatim this session.
- rdap.registro.br returned **HTTP 403**.
- Identity Digital RDAP (.io/.games) returned **429 / Cloudflare error 1015**.
- GitHub user/org lookups returned **403**: the session is bound to its configured repositories.
- No `whois` or `dig` binaries are installed.

---

## 1. Device and network reality in Brazil

### Takeaway
Design for a mid/low-end Android phone running Chrome, on metered mobile data, used by someone for whom the phone is often the only internet device. iPhone/Safari (roughly 1 in 5 users) is the second target. School computer labs exist but are not where teens get online: only 37% of 9-17 users say they access the internet at school, and that figure is falling.

### Cited Findings
**Mobile OS share (StatCounter, Brazil, 2026)**
- Mobile only: Android 77.59% / iOS 22.41% (July 2026) and Android 78.96% / iOS 21.03% (June 2026).
- The mobile+tablet+console page shows Android 75.21% / iOS 24.49% (August 2026).
- Source: [StatCounter mobile OS Brazil](https://gs.statcounter.com/os-market-share/mobile/brazil) [search-summary; figures vary a few points between StatCounter page variants]

**Mobile browser share (Brazil)**
- July 2026: Chrome 77.79%, Safari 17.16%, Samsung Internet 3.66%, Opera 0.49%, Firefox 0.33%, Brave 0.25%.
- June 2026: Chrome 80.98%, Safari 13.5%, Samsung Internet 3.94%.
- Source: [StatCounter mobile browser Brazil](https://gs.statcounter.com/browser-market-share/mobile/brazil) [search-summary]

**Teens and their devices (TIC Kids Online Brasil 2025)**
- Fieldwork ran March to September 2025 using face-to-face CAPI interviews with internet users aged 9-17. Results were released 22 Oct 2025.
- 92% of 9-17s are internet users (24,585,769 people accessed the internet in the last three months).
- Device used by internet users aged 9-17, as % using it at all: mobile phone 96% (78% "several times a day"), TV 74%, laptop 18%, desktop 16%, video game console 16%, tablet 11%. Phones dwarf computers.
- Owning a phone (posse de celular) rises with age: 15-17s were 99% in 2024 and 95% in 2025, against 77% for the total in 2025.
- Place of access: **school 37%**. Press coverage frames this as a fall from 51% ([CNN Brasil](https://www.cnnbrasil.com.br/educacao/uso-de-internet-por-adolescentes-nas-escolas-cai-de-51-para-37/) [search-summary]). The fall coincides with Brazil's 2025 school phone restrictions (inference; not stated in the source read).
- Gaming: 30% "did not play online". Most play at least weekly (Total row: 33% more than once a day, 22% at least daily, 10% weekly).
- **21% of 11-17 users made a purchase or spent money to advance or get items in online games** (11-12: 16%; 13-14: 22%; 15-17: 24%).
- Children report seeing influencers "divulgando jogos de apostas" (gambling games) among the ad formats measured.
- Source: [Cetic.br TIC Kids Online Brasil 2025, principais resultados (PDF)](https://www.cetic.br/media/analises/tic_kids_online_brasil_2025_principais_resultados.pdf) [fetched; text extracted with pdftotext; charts partly garbled, so figures were taken from the cleanly parsed tables]

**Mobile-only users**
- 2024 edition: phone used by 98% of 9-17s, and it was the **only** device for 32% of users in classes DE ([search summary of Cetic.br / press](https://cetic.br/media/docs/publicacoes/2/20250512154015/tic_kids_online_2024_resumo_executivo.pdf)) [search-summary].
- A "44% access exclusively by phone" figure circulates in the press with no year attached. Do not use it.
- Headline: ["Crianças das classes D e E só acessam a internet no celular" (A União)](https://auniao.pb.gov.br/noticias/caderno_diversidade/criancas-das-classes-d-e-e-so-acessam-a-internet-no-celular) [search-summary].

**Schools (TIC Educação)**
- 2024 table A4: 99% of primary and secondary schools have internet access (North 95%). It is unclear whether the cut is public-only or all schools ([Cetic.br TIC Educação 2024 A4](https://cetic.br/en/tics/educacao/2024/escolas/A4/)) [search-summary].
- 2022 edition: 93% of public schools had internet but only 58% had computers plus internet available to students ([Mobile Time](https://www.mobiletime.com.br/noticias/25/09/2023/93-das-escolas-publicas-possuem-acesso-a-internet-mas-58-tem-dispositivos-aponta-tic-educacao/)) [search-summary].
- In public schools the computer lab is the most common place students use computers and internet (76%; year unconfirmed) ([Exame](https://exame.com/tecnologia/computador-esta-fora-da-sala-de-aula-na-maioria-das-escolas-publicas)) [search-summary].
- 2025 edition coverage (Sept 2025): "rapid growth in four years", from 60% to 88% of municipal schools and from 63% to 86% of state schools. The indicator was not specified in the summary ([Mobile Time, TIC Educação 2025](https://www.mobiletime.com.br/noticias/16/09/2025/tic-educacao-2025/)) [search-summary].
- 2025 data tables exist ([B13 mobile labs 2025](https://cetic.br/en/tics/educacao/2025/escolas/B13/)) but were not read.

### Inferences
- Primary target: an Android Chrome/WebView of roughly the last 4-5 versions on 2-4 GB RAM devices. Secondary target: iOS Safari (about 17-22% of mobile traffic), which has stricter PWA storage and install behaviour.
- Samsung Internet (about 4%) is Chromium-based. Test it, but it is not a separate engine risk.
- Teens get online at home and on the move far more than at school. The game should work offline after the first load and degrade gracefully on a desktop school lab (old Windows + Chrome/Edge), but the phone is the design centre.
- With 21% of 11-17s already spending money in games, a game teaching about "parcelas", "juros" and loot-box-style spending is topical. The game itself must not contain any of these mechanics with real money (see §3).
- Implied budget: well under 1 MB gzipped critical path, so a first load is reasonable on congested 3G/4G and cheap prepaid plans. Assets are lazy-loaded and cached by a service worker.

### Gaps
- **Not researched, no sources found this session:** low-end Android RAM/GPU distribution in Brazil (Google Play device-catalogue stats are not public in aggregate); prepaid data-plan sizes and the WhatsApp/Instagram zero-rating effect; Opensignal/Ookla Brazil 2026 speed figures. Treat "data is scarce" as plausible and widely reported but **unverified here**.
- I found no Brazil-specific Android/iOS split for ages 14-24. StatCounter is all-ages traffic. iOS is plausibly higher among higher-income urban youth and lower among classes DE, but this is unverified.
- The exact 2025 "mobile-only" percentage for 9-17s is in the full TIC Kids Online tables at cetic.br, which were not opened.
- No data was gathered on Chromebook deployment by state.

---

## 2. Recommended web stack, free hosting and ops

### Takeaway
**Recommendation: Vite + TypeScript + Svelte 5 (or Preact) for the UI-heavy life-sim, with a lightweight chart library (uPlot or hand-rolled SVG), no game engine, as an installable offline PWA (vite-plugin-pwa / Workbox), saved to IndexedDB with a localStorage fallback, hosted on Cloudflare Pages or GitHub Pages, and no analytics or only cookieless aggregate analytics.**
- A turn-based or idle life-sim with charts is mostly forms, cards and charts. That is DOM/SVG work, and it is far smaller and more accessible than a canvas engine.
- Use Phaser 4 or PixiJS only if animated scenes become central.
- Avoid Godot web export for this use case: the payload is multi-MB WASM and there are Safari/WebGL issues.

### Cited Findings
**Godot 4 web export**
- Since 4.3, Godot supports single-threaded web export, which "solves" the SharedArrayBuffer/cross-origin-isolation problem and works much better on macOS/iOS.
- The docs still warn that Safari "has several issues with WebGL 2.0 support" and recommend Chromium or Firefox. They also recommend custom optimized export templates to cut mobile load times.
- Source: [Godot docs, Exporting for the Web](https://docs.godotengine.org/en/stable/tutorials/export/exporting_for_web.html) [search-summary]

**Phaser 4**
- Phaser 4 was reported released on 14 Apr 2026 ([pulse.bot](https://www.pulse.bot/gaming/news/phaser-4-released-e82fc617-4092-4e7d-baa0-d02b91b39a65/) [search-summary, secondary]; [phaser.io/download/phaser4](https://phaser.io/download/phaser4)).
- No reliable gzipped bundle size was found this session.

**Hosting free tiers (2026)**
- **Cloudflare Pages free:** unlimited static bandwidth/requests, 500 builds/month, 1 concurrent build, 20 min build timeout, 20,000 files per site, 25 MiB max file, 100 custom domains per project ([Cloudflare Pages limits](https://developers.cloudflare.com/pages/platform/limits/) [search-summary of official page and third-party summaries such as eastondev 2026](https://eastondev.com/blog/en/posts/dev/20260526-cloudflare-free-limits/)).
- **GitHub Pages:** soft limit of 100 GB/month bandwidth, 1 GB published site, 10 builds/hour; not for online businesses or commercial SaaS ([summary, 2026 comparisons](https://hostfleet.pages.dev/cf-pages-vs-vercel-vs-netlify-2026/) [search-summary]; official: [GitHub Pages limits](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits) [canonical, not fetched]).
- **Netlify:** reportedly moved to a credit system in September 2025 (300 free credits/month metered across builds, bandwidth and functions). Sources conflict, and others still cite 100 GB and 300 build minutes ([summary](https://hostfleet.pages.dev/cf-pages-vs-vercel-vs-netlify-2026/) [search-summary, single secondary source]).
- **Vercel Hobby:** restricted to non-commercial personal use per its terms ([Vercel fair use / Hobby](https://vercel.com/docs/limits/fair-use-guidelines) [canonical, not fetched]).

**Free asset sources**
- Kenney assets are CC0 ([kenney.nl/support](https://kenney.nl/support)) [canonical, not fetched].
- OpenGameArt licences vary per asset (CC0 / CC-BY / CC-BY-SA / GPL), so check each one ([opengameart.org](https://opengameart.org/)) [canonical, not fetched].
- Google Fonts are under the SIL Open Font License / Apache ([fonts.google.com/about](https://fonts.google.com/about)) [canonical, not fetched]. Self-host the font files: hot-linking Google Fonts sends visitor IPs to Google.

### Stack comparison (prior knowledge; sizes are approximate and should be measured with `vite build` and bundlephobia before committing)

| Option | Fit for turn-based life-sim with charts | Size / perf notes | Verdict |
|---|---|---|---|
| Svelte 5 + Vite + TS | Excellent. Compiled, tiny runtime, built-in transitions, good a11y warnings | Few-KB runtime | **Recommended** |
| Preact (+signals) | Excellent; React-familiar for contributors | ~4 KB core | Strong alternative |
| SolidJS | Excellent perf; smaller contributor pool | small | OK |
| React 19 | Fine but heavier; largest contributor pool | ~45 KB+ gz with react-dom | Acceptable if contributor reach matters most |
| Phaser 4 | Overkill for menus and charts; good for animated scenes | Large single library (hundreds of KB gz) | Only if scene animation is core |
| PixiJS v8 | 2D renderer only; would need UI built separately | Mid-size; tree-shakeable | Use for an animated "city/room" layer at most |
| Kaplay (Kaboom successor) / Excalibur | Arcade-oriented | small/medium | Not a fit for UI-heavy sim |
| Godot 4 web | Great editor, poor web payload | Multi-MB WASM + PCK; Safari WebGL2 caveats (above) | **Avoid** for 3G/low-end |

Supporting choices:
- **Charts:** uPlot (very small, fast canvas time-series) or hand-written SVG sparklines/bars for the few charts a life-sim needs (balance over time, debt vs interest). Chart.js is heavier but more featureful. Avoid ECharts/Plotly on 3G.
- **i18n:** pt-BR as the source locale. Use a light library (e.g. `svelte-i18n`, or typed message catalogs; ICU MessageFormat via `@formatjs/intl-messageformat` if plurals/gender matter) and `Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'})` for money. Keep strings in JSON/PO so Weblate can manage them.
- **Save:**
  - IndexedDB via `idb-keyval` (tiny), with a localStorage fallback. Call `navigator.storage.persist()`.
  - On iOS Safari, script-writable storage can be evicted after about 7 days without use unless the PWA is installed to the Home Screen, so offer an export/import save code.
  - **Share-a-code:** serialize the save as compressed JSON (e.g. `lz-string`) into base64url, shared as text or a link fragment (`#s=...`). Fragments are not sent to the server, which keeps the no-data-collection posture.
- **PWA:** `vite-plugin-pwa` (Workbox) to precache the app shell and lazy-cache assets. Ship a web app manifest so Android users can "install" it.
- **Budgets:** target ≤150-200 KB gzipped JS+CSS for first interactive, ≤500 KB total first load including fonts and initial art, and use SVG/WebP sprites. Enforce with `size-limit` or Lighthouse CI budgets in GitHub Actions.
- **Tests:** Vitest for the simulation engine. Keep the economy model as pure TS functions so they are deterministic and seedable. Use Playwright for e2e and mobile emulation, Lighthouse CI for perf/PWA/a11y, and axe-core for accessibility.
- **AI/asset tools:** free open asset packs (Kenney CC0, OpenGameArt per-asset), Google Fonts (OFL), and icon sets such as Lucide/Tabler (MIT/ISC). AI-generated art carries unsettled copyright status and possible training-data concerns. Prefer CC0 packs and human-made contributions for an open project. If AI art is used, label it and keep prompts and outputs in the repo.

**Hosting and ops recommendation**
- Primary host: **Cloudflare Pages** for unlimited bandwidth and a large edge network, including Brazilian PoPs (São Paulo, Rio, and others: [Cloudflare network map](https://www.cloudflare.com/network/) [canonical, not fetched]).
- Alternative: **GitHub Pages** if everything should stay inside GitHub. It is simpler for contributors, with deploys via `actions/deploy-pages`.
- Both support custom domains with free TLS.
- Avoid Vercel Hobby if any sponsorship or donations could be read as commercial use.

**Analytics on a site for minors**
- Default to **none**, or to cookieless aggregate-only analytics that stores no personal data (e.g. Cloudflare Web Analytics, which is free and cookieless: [Cloudflare Web Analytics](https://www.cloudflare.com/web-analytics/) [canonical, not fetched]).
- Alternatives: GoatCounter (free for non-commercial, open source) or self-hosted Umami/Plausible. Self-hosting adds a server to run and secure, which defeats the goal of zero ops.
- Given the ECA Digital ban on profiling (§3), avoid anything with persistent identifiers, fingerprinting or third-party ad pixels.
- If learning-outcome data is wanted, collect it through an explicit, anonymous, opt-in in-game survey rather than tracking.

### Inferences
- A client-only static PWA means no server-side personal data. This is the strongest legal simplifier (§3) and costs $0 in hosting.
- Cloudflare Pages edge plus a service-worker cache means repeat plays cost no data at all, which matters more than CDN latency for prepaid users.

### Gaps
- No measured bundle sizes were gathered for Phaser 4 / PixiJS v8 / Svelte 5 / Preact / uPlot / Chart.js in this session. Verify on bundlephobia or with a build.
- No official 2026 Netlify free-tier terms were read. Sources conflict.
- No Cloudflare/GitHub Pages latency measurements to Brazil were taken. GitHub Pages is served via Fastly, which has São Paulo PoPs per prior knowledge; unverified.

---

## 3. Legal constraints for a site used by minors in Brazil

### Takeaway
LGPD art. 14 and the ECA Digital (Lei 15.211/2025, **in force since 17 Mar 2026**) both apply in principle to a service "likely to be accessed" by adolescents. Most of their heavy obligations attach to **collecting and processing personal data, accounts, profiling, ads and monetisation**.

A purely client-side game with:
- no accounts,
- no server-side data,
- no third-party trackers or ads,
- no purchases or loot boxes,
- no chat/UGC

sidesteps most of these obligations, though not the duty of care/best-interest framing. It must still:
- avoid real-money gambling mechanics and any "bets" promotion,
- meet accessibility norms (LBI/eMAG/WCAG),
- publish a plain-language pt-BR privacy notice saying what it does *not* do.

### Cited Findings
**ECA Digital (Lei 15.211/2025)**
- **Timing:** sanctioned 17 Sep 2025, in force 17 Mar 2026 after a six-month vacatio ([Machado Meyer](https://www.machadomeyer.com.br/pt/inteligencia-juridica/publicacoes-ij/direito-digital/estatuto-digital-da-crianca-e-do-adolescente-lei-n-15-211-2025-entra-em-vigor-em-17-de-marco-de-2026)) [search-summary].
- **Scope:** covers technology products and services *directed at* minors or *likely to be accessed* by them. "Likely access" requires, cumulatively, a sufficient probability of use by and attractiveness to that public, among other conditions ([Demarest client alert](https://www.demarest.com.br/protecao-de-criancas-e-adolescentes-no-ambiente-digital/); [Confidata](https://confidata.com.br/blog/eca-digital-o-que-muda-empresas)) [search-summary]. *A teen-targeted finance game is squarely "directed at" adolescents.*
- **Profiling and ads:** profiling to target advertising at children and adolescents is prohibited. Behavioural advertising is barred regardless of consent ([Demarest](https://www.demarest.com.br/?p=164008); [Machado Meyer factsheet](https://www.machadomeyer.com.br/images/ebooks/Factsheet_ECA_Digital.pdf)) [search-summary].
- **Loot boxes (art. 20):** prohibited in electronic games directed at, or likely accessed by, children and adolescents. Per the government, the ban hits the feature, not the game ([Assis e Mendes](https://assisemendes.com.br/loot-boxes-eca-digital-e-monetizacao-em-jogos-2836273/); [ND Games](https://www.ndgames.com.br/esports/verificacao-de-idade-games-eca-digital/)) [search-summary].
- **Age assurance:** providers of content *improper for under-18s* must use reliable age-verification mechanisms, and self-declaration is prohibited. App stores and operating systems also have age-signal duties ([search summary of FADC / Colatina em Ação / Machado Meyer](https://www.fadc.org.br/noticias/eca-digital-entenda-nova-lei)) [search-summary].
- **Linked accounts (art. 24):** accounts of users up to 16 must be linked to a legal guardian's account with parental supervision. Reported as applying to social networks, so it does not apply to a no-account game ([search summary](https://colatinaemacao.com.br/2026/03/18/eca-digital-verificacao-de-idade-loot-boxes-e-inclusao-digital-colocam-participacao-das-familias-como-desafio-central-o-que-muda-com-o-decreto-da-lei-15-211-2025/)) [search-summary].
- **Regulation and enforcement:** Decreto 12.880/2026 regulates the law. The ANPD issued preliminary guidance and an initial enforcement timeline on 20 Mar 2026. Sources disagree on whether an adaptation period applies ([same search summary](https://colatinaemacao.com.br/2026/03/18/eca-digital-verificacao-de-idade-loot-boxes-e-inclusao-digital-colocam-participacao-das-familias-como-desafio-central-o-que-muda-com-o-decreto-da-lei-15-211-2025/)) [search-summary; decree number not verified on Planalto].
- **Sanctions (art. 35):** range from warning to fine and suspension of activities. The fine ceiling is reported as up to 10% of Brazilian revenue, capped at R$ 50 million per infraction; this is a single-source claim ([ComputerWeekly BR](https://www.computerweekly.com/br/reportagen/ECA-Digital-obrigacoes-penalidades-e-o-que-muda-para-plataformas-digitais-no-Brasil)) [search-summary; verify].
- **Official text** (blocked from this sandbox): [Planalto L15211](https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2025/lei/L15211.htm).

**LGPD art. 14 and ANPD Enunciado CD/ANPD nº 1/2023**
- Art. 14 caput: processing children's and adolescents' data must be in their **best interest**. §1 requires specific, prominent consent from at least one parent/guardian for **children (under 12, per ECA's definition)**. Law text: [LGPD, Planalto](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm) [canonical, not fetched; Planalto blocked].
- The Enunciado CD/ANPD nº 1/2023 (approved 22 May 2023, published 24 May 2023) says processing children's and adolescents' data **may rely on any legal basis in arts. 7 and 11**, not only parental consent, provided the best interest prevails. This settled the "consent-only" controversy ([Lefosse](https://lefosse.com/noticias/alerta/anpd-publica-enunciado-sobre-o-tratamento-de-dados-pessoais-de-criancas-e-adolescentes/); [Felsberg](https://www.felsberg.com.br/importante-anpd-publica-enunciado-sobre-o-tratamento-de-dados-pessoais-de-criancas-e-adolescentes/)) [search-summary].
- **Adolescents (12-17):** §1 parental consent does not apply directly, but the caput's best-interest standard does ([Confidata, LGPD comentada](https://confidata.com.br/blog/lgpd-comentada-10-criancas-adolescentes)) [search-summary].
- Critics: OAB-SP asked for a revision, and Instituto Alana argues only art. 11 bases should apply ([search summary incl. criancaeconsumo.org.br](https://criancaeconsumo.org.br/wp-content/uploads/2023/11/MInteresse.pdf)) [search-summary].
- The ANPD said the Enunciado would remain applicable after PL 2628/2022, which became the ECA Digital ([Senado doc](https://legis.senado.leg.br/sdleg-getter/documento?dm=9846335)) [search-summary].

**Betting / "bets"**
- Lei 14.790/2023 requires fixed-odds betting advertising to be aimed at adults, never at children and adolescents.
- Portaria SPA/MF 1.231/2024 (31 Jul 2024) treats any betting advertising aimed directly or indirectly at minors as abusive, including the use of minors' image, especially appealing elements, or ties to their cultural activities.
- An STF justice ordered the minor-protection advertising rules to take immediate effect.
- Portaria SPA/MF 1.964 later amended 1.231, with warning changes effective 17 Jul 2026.
- Sources: [Lefosse](https://lefosse.com/noticias/publicidade-de-apostas-de-quota-fixa-novas-regras-ampliam-deveres-de-operadores-e-agentes-da-cadeia-de-veiculacao/); [BNL Data](https://bnldata.com.br/governo-federal-limita-publicidade-de-bets-e-proibe-anuncios-para-jovens/); [legjur, Lei 14.790 seção II](https://www.legjur.com/legislacao/nivel/lei_00147902023/-secao-ii-da-publicidade-e-da-propaganda) [search-summary]
- These rules bind betting operators and advertisers. An educational game that **depicts** the risks of bets critically is not advertising.

**MEC / public-school educational resources**
- Portaria MEC nº 451/2018 (16 May 2018) requires MEC-funded basic-education resources to be open educational resources (REA) and, when digital, published on public sites ([Signo/UNISC article](https://seer.unisc.br/index.php/signo/article/view/18891/11325)) [search-summary].
- The MEC RED platform distributes open digital resources for basic education. Studies found CC BY-NC-SA the most common licence there, and many items lack licence information ([OEGlobal on MEC RED](https://oeweek.oeglobal.org/resources/2019/plataforma-integrada-mec-de-recursos-educacionais-digitais-mec-red/); [SBC/SBIE paper](https://sol.sbc.org.br/index.php/sbie/article/view/38521)) [search-summary].
- A PL to promote REA in public administration is advancing in the Câmara ([Congresso em Foco](https://congressoemfoco.com.br/noticia/24745/projeto-de-lei-rea-aprovado-na-comissao-de-cultura-da-camara)) [search-summary].

### Inferences
- **No accounts, no server data, no third-party trackers or ads, no purchases or loot boxes, no chat** removes most LGPD/ECA Digital obligations. There is no personal data for art. 14 to bite on, no profiling, and no linked-account or age-verification duty, because the content is not "improper for under-18s".
- localStorage/IndexedDB saves that never leave the device are not "tratamento" by the publisher in any practical sense. This is a reasoned view, not an ANPD statement.
- Hosting and CDN access logs (IP addresses) are still personal data. Prefer hosts that do not expose raw logs, and say so in the privacy notice.
- Still do these things:
  - publish a short pt-BR "o que este jogo NÃO coleta" notice;
  - add no cookie banner. None is needed if no non-essential cookies or storage beyond the save are used, but say the save is local;
  - avoid dark patterns such as streak guilt and FOMO timers, given the ECA Digital best-interest and design duties;
  - keep any in-game "loot box", "bet" or "raspadinha" mechanic purely a **critical depiction** with fake currency. Better still, frame it as a cautionary minigame that shows the expected loss, never a reward loop. Art. 20 bans loot boxes as a feature, and a cautionary simulation could be read as one if it is a randomized reward bought with in-game currency. *Get legal review if one is included.*
- **Marco Civil da Internet** (Lei 12.965/2014): art. 15's 6-month access-log retention applies to application providers "constituídos na forma de pessoa jurídica" acting professionally for economic ends. A non-commercial individual project is likely outside it ([Marco Civil, Planalto](https://www.planalto.gov.br/ccivil_03/_ato2011-2014/2014/lei/l12965.htm) [canonical, not fetched]).
- **Accessibility:** Lei Brasileira de Inclusão (Lei 13.146/2015) art. 63 mandates accessibility for sites of companies headquartered or with commercial representation in Brazil, and for government bodies ([LBI, Planalto](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2015/lei/l13146.htm) [canonical, not fetched]). eMAG is the federal government's model, based on WCAG ([eMAG gov.br](https://www.gov.br/governodigital/pt-br/acessibilidade-e-usuario/acessibilidade-digital/modelo-de-acessibilidade) [canonical, not fetched]). For school adoption, aim for WCAG 2.2 AA anyway.
- **US side (if the author is a US individual):** COPPA applies to operators of sites directed to US children **under 13**, or with actual knowledge of collecting their data ([FTC COPPA FAQ](https://www.ftc.gov/business-guidance/resources/complying-coppa-frequently-asked-questions) [canonical, not fetched]). A no-collection, pt-BR, teen-targeted site has negligible COPPA exposure. Note that some US states (e.g. California's Age-Appropriate Design Code, partly enjoined) target under-18s, but they bind businesses meeting revenue thresholds. Unverified this session.
- **School use:** to be eligible for or attractive on MEC RED/PNLD-adjacent channels, use an open licence (CC BY or CC BY-SA for content). Being free and open matches Portaria 451's REA requirement for MEC-funded materials.

### Gaps
- No verbatim text of Lei 15.211/2025, LGPD art. 14, ECA, the Marco Civil or the LBI was read (Planalto blocked). Article numbers come from secondary legal commentary.
- Decreto 12.880/2026 and the ANPD's 20 Mar 2026 guidance were not read. The adaptation-period question is unresolved.
- No Idec/Procon commentary was gathered.
- No source specifically addresses whether a *simulated*, non-monetary loot box in an educational game falls under art. 20. Legal review is recommended.
- The current status of Portaria MEC 451/2018 and of MEC RED as a live platform in 2026 is unverified.
- Rules on depicting gambling (as opposed to advertising it) in content for minors, including classificação indicativa criteria for simulated gambling, were not researched. ClassInd (Ministério da Justiça) rates "jogos de azar simulados", which may matter if the game is ever published on an app store. Unverified.

---

## 4. Names and domain availability (live checks)

### Takeaway
Of 19 candidate names checked live on 2026-11-07, the clearest fully free set (.com, .com.br, .org, .app, .game all unregistered, plus .io/.games NXDOMAIN) is:
- **Vida de Dindin** (vidadedindin)
- **Corre da Grana** (corredagrana)
- **Sobe o Saldo** (sobeosaldo)
- **Juros da Vida** (jurosdavida)
- **Fatura Fatal** (faturafatal)
- **Dindin Quest** (dindinquest)
- **Vira o Mês** (viraromes)
- **Vida de Grana** (vidadegrana)

The premise of an "open .br second-level" turned out to be false for these names. registro.br's own availability API rejects `<name>.br` with **"Categoria inválida"** (even `google.br` and `globo.br`), so direct `.br` is **not** registrable for ordinary names as of this check. Use `.com.br`, `.app.br`, `.art.br` or `.org.br` instead.

### Cited Findings
**Methods (all from this sandbox, 2026-11-07 ~04:19 UTC)**
- `.com`: `curl https://rdap.verisign.com/com/v1/domain/<n>.com` returns HTTP 200 if registered and 404 if not.
- `.org`: `https://rdap.publicinterestregistry.org/rdap/domain/<n>.org`
- `.app`: `https://pubapi.registry.google/rdap/domain/<n>.app`
- `.game`: `https://rdap.centralnic.com/game/domain/<n>.game`
- Endpoints come from the IANA bootstrap file `https://data.iana.org/rdap/dns.json` (fetched).
- `.io` and `.games`: Identity Digital RDAP returned **429 / Cloudflare "error code: 1015"** for every query, so the only evidence is DNS over HTTPS (`https://cloudflare-dns.com/dns-query?name=<d>&type=NS`). DoH `Status:3` (NXDOMAIN, SOA from the TLD) means *probably unregistered*. This is weaker evidence than RDAP, because a registered domain with no delegation also returns NXDOMAIN. Labelled **"likely free (DNS-only)"**.
- `.com.br`, `.br`, `.app.br`, `.org.br`, `.art.br`: `curl https://registro.br/v2/ajax/avail/raw/<domain>`.
  - Calibrated: `zzqqxxnotreal7781.com.br` gives `"status":0`, so 0 = available.
  - `globo.com.br` / `nubank.com.br` give `"status":2` with `expires-at`, so 2 = registered.
  - `globo.br` gives `"status":3,"reasons":["Categoria inválida"]`, so 3 = invalid.
  - `"status":5` was seen for `trampoegrana.com.br` and `rendeu.com.br`, with no other fields (raw: `{"status":5,"fqdn":"trampoegrana.com.br","fqdnace":"","exempt":false}`). Meaning **undocumented/unknown**: possibly a name in a release ("liberação") process or a pending ticket. Treat as **not available now**.
  - `rdap.registro.br` returned **HTTP 403**, so no registro.br RDAP was used.
- Calibration line for .com: `google.com RDAP(verisign)=200`; `zzqqxxnotreal7781.com RDAP(verisign)=404 DoH={"Status":3,...,"auth":"a.gtld-servers.net. nstld.verisign-grs.c"}`.
- Raw outputs saved in sandbox scratch: `/tmp/claude-0/-home-user/9c2dbdd3-b155-5acd-9dcb-27b3afa95776/scratchpad/dom/results.txt`.

**Results table** (A = available/unregistered per authoritative check; T = taken; L = likely free per DNS NXDOMAIN only; "exp" = registro.br expires-at date; `.br` direct was "Categoria inválida" for **every** name)

| Name (spoken) | Wordplay / gloss | .com | .com.br | .app.br | .org | .app | .io | .games | .game |
|---|---|---|---|---|---|---|---|---|---|
| **Vida de Dindin** – vidadedindin | "dindin" = money (kid slang) + "vida" life-sim | A (404) | A (0) | A (0) | A (404) | A (404) | L | L | A (404) |
| **Corre da Grana** – corredagrana | "o corre" = hustle; money hustle | A | A | A | A | A | L | L | A |
| **Sobe o Saldo** – sobeosaldo | "make the balance go up" | A | A | A | A | A | L | L | A |
| **Juros da Vida** – jurosdavida | "interest of life" / compound life choices | A | A | A | A | A | L | L | A |
| **Fatura Fatal** – faturafatal | alliterative "fatal credit-card bill" | A | A | A | A | A | L | L | A |
| **Dindin Quest** – dindinquest | gamer framing | A | A | A | A | A | L | L | A |
| **Vira o Mês** – viraromes ("virar o mês") | surviving to month's end | A | A | A | A | A | L | L | A |
| **Vida de Grana** – vidadegrana | life + money | A | A | A | A | A | L | L | A |
| **Trampo & Grana** – trampoegrana | "trampo" = job | A | **status 5 (not available now)** | A | A | A | L | L | A |
| **Fim do Mês** – fimdomes | month-end squeeze | **T** (200, OVH NS) | T (exp 2026-08-14, i.e. lapsed/frozen?) | A | A | A | L | L | A |
| **Tô Duro** – toduro | "I'm broke" | **T** (Afternic: for sale) | T (exp 2027-02-28) | A | A | A | L | L | A |
| **Grana Game** – granagame | | A | T (exp 2026-09-10, lapsed?) | A | A | A | L | L | A |
| **Rende Aí** – rendeai | "make it yield" | **T** (GoDaddy NS) | T (exp 2027-01-08) | A | A | A | L | L | A |
| **Grana Viva** – granaviva | | **T** | T (exp 2027-08-25) | A | A | A | L | L | A |
| **Mesada Quest** – mesadaquest | "mesada" = allowance | A | T (exp 2027-10-03) | A | A | A | L | L | A |
| **Bolso Cheio** – bolsocheio | "full pocket" | T | T (exp 2026-11-17) | A | A | **T** | L | L | A |
| **Tô no Azul** – tonoazul | "I'm in the black" | T | T (exp 2026-08-09, lapsed?) | **T** | A | A | L | L | A |
| **Rendeu** – rendeu | "it paid off" | T | status 5 | T | T | T | L | L | A |
| **Bufunfa** – bufunfa | slang for money | T | T | T | T | T | **T** (DNS: Cloudflare NS) | L | A |

Extra registro.br category checks (raw `{status,reasons}`):
- `viraromes.org.br`, `vidadedindin.org.br`, `corredagrana.org.br`, `sobeosaldo.org.br`, `jurosdavida.org.br`, `dindinquest.org.br`, `faturafatal.org.br`, `viraromes.art.br`: all `{"status":0}` (available).
- `viraromes.jog.br` and `zzqqxx.jogos.br`: `"Categoria inválida"`. There is **no** "jog.br" or "jogos.br" category.
- The registro.br avail responses list valid categories as suggestions, e.g. `"app.br","art.br","dev.br","eco.br","etc.br","ia.br","ind.br","log.br","net.br","ong.br","rec.br","social.br","tec.br","tv.br","xyz.br"` (from the `granagame.br` response).

**Other candidates proposed but not domain-checked (brainstorm list, for completeness)**

Bufunfinha, Corre do Tutu, Pila Quest, Tá na Conta, Nome Limpo (avoid: close to Serasa "Limpa Nome"), Bora Render (avoid: too close to B3's "Bora Investir"), Dez Vezes (parcelamento joke), Trampolim (trampo + trampoline, generic word, likely taken), Granada ("grana" pun, city name, taken), Montanteiro, Mango Run, Saldo Zero, Juro Bola de Neve.

**Registration rules and prices**
- `.com.br` requires a Brazilian CPF or CNPJ, and registro.br validates it against official databases ([atakdomain](https://www.atakdomain.com/en/blog/combr-domain-registrationhow-to-register-a-brazil-domain-from-anywhere); [guiaferramentasdigitais](https://guiaferramentasdigitais.com.br/guias/como-registrar-dominio-brasil/)) [search-summary, secondary].
- Foreign *companies* can register without a Brazilian entity by appointing a legally established procurador in Brazil ([namefi](https://namefi.io/r/en/tld/br)) [search-summary, secondary].
- Commercial trustee services exist for people without a CPF/CNPJ, at about US$70 extra ([atakdomain](https://www.atakdomain.com/en/blog/combr-domain-registrationhow-to-register-a-brazil-domain-from-anywhere)) [search-summary, commercial, unverified].
- Price: registro.br's reference price is widely quoted as **R$ 40/year** ([homehost](https://www.homehost.com.br/blog/dominio/registro-de-dominio-br/)) [search-summary, secondary; the official 2026 price table was not read].
- `.org.br` is restricted to non-profit legal entities (CNPJ) [prior knowledge, unverified]. `.app.br` and `.art.br` accept CPF holders [prior knowledge, unverified].
- **.com / .app prices:** not checked live. As a rough prior-knowledge range, .com is about US$10-11/yr at-cost via Cloudflare Registrar, .app about US$12-15/yr, and .io noticeably more (~US$30-60/yr). Unverified; check [Cloudflare Registrar](https://www.cloudflare.com/products/registrar/) or [Namecheap](https://www.namecheap.com/) before buying.

### Inferences
- **Top picks for the brief:**
  - **Vida de Dindin** (vidadedindin.com / .com.br / .app all free): fun, rhythmic, says "life-sim about money".
  - **Corre da Grana** (corredagrana.*): current youth slang, active verb.
  - **Sobe o Saldo** (sobeosaldo.*): goal-oriented, easy to type, no accents.
  - **Fatura Fatal** (faturafatal.*): memorable, but it frames credit as doom, so it suits a debt-focused mode or chapter better.
  - **Juros da Vida**: wordy, but good for a compound-interest hook.
- All top picks avoid accented characters in the domain. "Tô"/"Mês" accents are a typing hazard, and IDN domains confuse users.
- For a US individual without a CPF, the practical options are:
  1. register **.com** and **.app** (no nationality restriction) right away;
  2. have a Brazilian co-maintainer with a CPF hold the **.com.br** (or a trustee service);
  3. or later move the .com.br to a Brazilian association/CNPJ, which would also unlock `.org.br`.
- Prefer `.app` or `.com` as the canonical domain, with `.com.br` redirecting.
- `.app` is HSTS-preloaded (HTTPS-only). That is fine on Cloudflare/GitHub Pages [prior knowledge].

### Gaps
- **GitHub org/user availability: not checkable.** Both `curl https://api.github.com/users/<n>` and `gh api users/<n>` returned 403: "This GitHub API path is not available: sessions are bound to their configured repositories." `github.com/<n>` also returned 403. **Unverified for all names.**
- **Instagram/TikTok handles: not checkable.**
  - The Instagram web_profile_info endpoint returned 404 for `google` and for a nonsense name alike, so it is uninformative.
  - TikTok returned HTTP 200 for a nonsense handle (soft page).
  - **Unverified for all names.**
- **.io and .games RDAP not run** (rate-limited). Only DNS NXDOMAIN evidence exists.
- **INPI trademark search not run.** The INPI's busca is session/form-based; not attempted within the tool budget. Needs a manual search at [busca.inpi.gov.br](https://busca.inpi.gov.br/pePI/) in classes 9, 28, 41 (and 36) for "dindin", "grana", "saldo", "fatura".
  - "Dindin" is a known brand risk: prior-knowledge-only notes suggest there have been fintech apps/products named "Dindin". Unverified.
- The meaning of registro.br avail `status 5` is undocumented.
- Several `.com.br` names (fimdomes, granagame, tonoazul) show `expires-at` dates already past (Aug-Sep 2026) yet `status 2`. They may be in registro.br's post-expiry freeze or release cycle and become available later. Not verified.

---

## 5. Open-source licensing and repository setup

### Takeaway
- **Code:** MIT, or Apache-2.0 for an explicit patent grant. Use AGPL-3.0 only if preventing closed hosted forks (e.g. by a fintech) matters more than maximum reuse by schools, governments and companies.
- **Content** (text, art, scenarios, translations): **CC BY 4.0** for maximum reuse, including MEC/REA channels, or **CC BY-SA 4.0** to keep derivatives open. Avoid NC licences, which complicate school, government and commercial-publisher reuse.
- Host under a **GitHub organisation**, not a personal account, with bilingual pt-BR/en community files.

### Cited Findings
- choosealicense.com summarises:
  - MIT: short and permissive.
  - Apache-2.0: permissive plus an express patent grant.
  - AGPL-3.0: copyleft that extends to network use.
  - Source: [choosealicense.com/licenses](https://choosealicense.com/licenses/) [canonical, not fetched]
- Creative Commons 4.0 licences are international (unported) and have official Portuguese translations ([creativecommons.org/licenses](https://creativecommons.org/licenses/list.pt) [canonical, not fetched]).
- MEC RED studies show CC BY-NC-SA dominating there, with frequent licence misuse ([SBC/SBIE](https://sol.sbc.org.br/index.php/sbie/article/view/38521) [search-summary]). A clear CC BY / BY-SA label is a differentiator.
- Portaria MEC 451/2018: MEC-funded basic-education digital resources must be REA ([Signo/UNISC](https://seer.unisc.br/index.php/signo/article/view/18891/11325) [search-summary]).

### Inferences / recommendations
- **Dual-licence layout:** `LICENSE` (MIT or Apache-2.0) for `/src`, and `LICENSE-CONTENT` (CC BY-SA 4.0 or CC BY 4.0) for `/content`, `/locales` and `/assets/original`. Third-party assets keep their own licence, recorded in `ASSETS.md` and a machine-readable `assets/credits.json` (Kenney CC0, OFL fonts, and so on).
- **Contributions:** use a **DCO** (`Signed-off-by`, enforced by the DCO GitHub App) rather than a CLA. It is lighter for teen and volunteer contributors and keeps licensing inbound=outbound.
- **Translations:** inbound=outbound under the content licence. Manage them via **Weblate's free hosting for libre projects** or Crowdin's open-source plan [prior knowledge, unverified]. Credit translators in `CREDITS.md`/`AUTHORS`. Keep pt-BR as the source of truth.
- **Repo layout:**
  ```
  /src/engine        (pure TS economy model, seeded RNG, fully unit-tested)
  /src/ui            (Svelte components)
  /content/pt-BR     (scenarios, events, glossary as JSON/YAML; CC BY-SA)
  /locales/{pt-BR,en,es}.json
  /public            (manifest, icons)
  /assets            (art, audio; credits.json)
  /docs              (design, pedagogy, privacy.md in pt-BR + en)
  /tests  /e2e
  .github/workflows/{ci.yml,deploy.yml}
  README.md (pt-BR first, link to README.en.md), CONTRIBUTING.md + CONTRIBUTING.en.md,
  CODE_OF_CONDUCT.md (Contributor Covenant 2.1 has an official pt-BR translation [prior knowledge]),
  SECURITY.md, PRIVACY.md, LICENSE, LICENSE-CONTENT, ASSETS.md
  ```
- **CI/CD:**
  - GitHub Actions: `npm ci`, then lint, Vitest, Playwright (mobile viewport), Lighthouse CI with budgets, and size-limit.
  - Deploy with `actions/upload-pages-artifact` + `actions/deploy-pages`, or the Cloudflare Pages Git integration.
  - Public repos get free Actions minutes [prior knowledge, standard GitHub policy].
- **Releases:** SemVer tags (`v0.x`) with release notes in pt-BR. release-please or Changesets can automate them. Ship a downloadable zip of the static build so school labs can run it offline from a USB stick or LAN.
- **Org vs personal:** a GitHub org (free) gives:
  - a bus factor greater than 1 (multiple owners);
  - teams for translators and reviewers;
  - a neutral brand for schools and NGOs;
  - easy later transfer to a Brazilian association.
  Repos can be transferred from a personal account later with redirects, but starting in an org avoids the move.
- **Contributor venues:**
  - Python Brasil (annual conference);
  - Campus Party Brasil;
  - BrazilJS legacy community and local JS meetups;
  - Hacktoberfest;
  - university extension projects (e.g. USP/ICMC, UFPE CIn);
  - Brazilian game-dev communities (SBGames, the SBC games symposium);
  - Educação financeira networks (ENEF/AEF-Brasil);
  - FISL (Fórum Internacional Software Livre, Porto Alegre), a legacy venue that has been largely inactive since around 2018.
  - These rest on prior knowledge only; none were researched this session.

### Gaps
- None of the licensing sources were fetched this session (choosealicense, CC, OSI). The recommendations rest on standard, stable licence semantics. Verify Weblate/Crowdin free-plan terms for 2026.
- Not researched: Brazilian community venue schedules and status for 2026 (Campus Party editions, Python Brasil 2026 host city, Hackers in Rio activity).
- Not researched: whether MEC RED accepts externally hosted web games, or its submission process in 2026.
