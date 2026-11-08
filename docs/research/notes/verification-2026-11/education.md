# Education, jobs and life-event parameters: research notes (2026-11-08)

Group `education`. Each entry: value, status, evidence and conversion. Values in centavos unless noted.

## tecnicoTuitionMonthly

- **Value:** 45000 centavos/month (asOf 2026-09, status secondary); previous 30000
- **Source:** https://querobolsa.com.br/revista/quanto-custa-um-curso-tecnico-em-enfermagem
- **Finding and conversion:** Quero Bolsa (09/09/2026): private presencial técnico R$ 300-600/month, EaD ~R$ 400, course ~2 years; value is the R$ 450 midpoint. ETEC/IF are free; SENAC SP advertises fixed installments (page not readable here, so no price taken). Not an SP-specific price list.

## cursinhoMonthly

- **Value:** 80000 centavos/month (asOf 2025-01, status secondary); previous 40000
- **Source:** https://vestibulares.estrategia.com/portal/enem-e-vestibulares/quanto-custa-um-curso-pre-vestibular
- **Finding and conversion:** Estrategia Vestibulares (published 30/12/2024, updated 06/01/2025): a complete presencial pre-vestibular costs R$ 800-3.000 (unclear whether monthly or total); value is the low end as a monthly. Online 12-month plans are R$ 70-100/month. No Anglo/Etapa/Objetivo/Poliedro 2026 price page was found, so this is weak.

## eadTuitionMonthly

- **Value:** 21400 centavos/month (asOf 2026, status secondary); previous 21400
- **Source:** https://abmes.org.br/noticias/mensalidades-da-graduacao-privada-registram-queda-real-em-2026-e-revelam-novo-ciclo-competitivo-5200
- **Finding and conversion:** Hoper study via ABMES: median EAD fee actually charged in 2026 is R$ 214 (net of discounts). Semesp's average is higher (R$ 317 in 1st semester 2025, different method).

## privateTuitionMonthly

- **Value:** 83500 centavos/month (asOf 2026, status secondary); previous 83500
- **Source:** https://abmes.org.br/noticias/mensalidades-da-graduacao-privada-registram-queda-real-em-2026-e-revelam-novo-ciclo-competitivo-5200
- **Finding and conversion:** Hoper study via ABMES: median presencial private fee actually charged in 2026 is R$ 835 (net of discounts). Medicina is the outlier (median R$ 11,4 mil per the repo note).

## salaryAuxAdmin

- **Value:** 209900 centavos/month (asOf 2026-11, status secondary); previous 220000
- **Source:** https://www.salario.com.br/profissao/assistente-administrativo-cbo-411010/
- **Finding and conversion:** Salario.com.br (updated 05/11/2026, CAGED 12 months): auxiliar administrativo listed at R$ 2.099 average; assistente administrativo R$ 2.476. The auxiliar page itself reports R$ 2.079-2.099 (page figures differ slightly). Was R$ 2.200.

## salaryTecnicoEnfermagem

- **Value:** 256000 centavos/month (asOf 2026-11, status secondary); previous 332500
- **Source:** https://www.salario.com.br/profissao/tecnico-de-enfermagem-cbo-322205/
- **Finding and conversion:** Salario.com.br (updated 05/11/2026, CAGED CLT base pay): average R$ 2.559,99, median R$ 2.423. The old value R$ 3.325 is the legal piso (Lei 14.434/2022), which real hiring does not follow; game designer must decide which to use.

## salaryDevJunior

- **Value:** 345900 centavos/month (asOf 2026-11, status secondary); previous 346300
- **Source:** https://www.salario.com.br/profissao/programador-de-sistemas-de-informacao-cbo-317110/
- **Finding and conversion:** Salario.com.br (05/11/2026, CAGED): programador piso R$ 3.459, median R$ 4.631, average R$ 6.104 (junior breakdown is paywalled). The entry-level proxy is the piso, which is close to the old Glassdoor R$ 3.463. Top firms pay much more (Robert Half p50 R$ 6.850 per repo note).

## salaryEnfermeiro

- **Value:** 449300 centavos/month (asOf 2026-11, status secondary); previous 475000
- **Source:** https://www.salario.com.br/profissao/enfermeiro-cbo-223505/
- **Finding and conversion:** Salario.com.br (updated 05/11/2026, CAGED Oct 2025-Sep 2026): average R$ 4.493,35, reference piso R$ 3.684,45 at 38h/week. Legal national piso is R$ 4.750 (Lei 14.434/2022), the old value; not universally applied.

## salaryProfessor

- **Value:** 513063 centavos/month (asOf 2026-01, status secondary); previous 513063
- **Source:** docs/research/notes/careers_wages_cost_of_living.md
- **Finding and conversion:** Kept: national piso for public basic-education teachers, R$ 5.130,63 for 40h (MEC Portaria 82/2026, per Conexao TO cited in the repo note; not re-opened here). Private CLT hiring is much lower: Salario.com.br shows Professor I Ensino Fundamental ~R$ 3.354 at 30h (search result, not opened).

## salaryIfood

- **Value:** 336000 centavos/month (asOf 2026-05, status secondary); previous 240000
- **Source:** https://www.serasa.com.br/blog/quanto-ganha-um-entregador-do-ifood/
- **Finding and conversion:** Serasa (27/05/2026) citing iFood: gross R$ 28/hour worked in 2024; iFood says more than R$ 2.500/month at ~4h/day; Serasa's example of 6h x 20 days = R$ 3.360 gross (R$ 28 x 6 x 20, an estimate). Gross only: fuel, maintenance and insurance not deducted (Cebrap ~R$ 700/month maintenance per repo note). Was R$ 2.400; designer may keep that as the net-ish figure.

## medioPremium

- **Value:** 0.15 rate (asOf 2022, status secondary); previous 0.15
- **Source:** https://repositorio.ipea.gov.br/bitstream/11058/11532/2/TD_2804_Sumex.pdf
- **Finding and conversion:** IPEA TD 2804 (Oferta de escolas e retorno do ensino medio): completing ensino medio is associated with a wage return of 11% to 20% depending on instrument. 0.15 is a game design choice inside that range. Raw IBGE gap by education could not be extracted.

## tecnicoPremium

- **Value:** 0.23 rate (asOf 2022, status secondary); previous 0.23
- **Source:** https://repositorio.ipea.gov.br/bitstream/11058/11817/2/TD_2859_Sumex.pdf
- **Finding and conversion:** IPEA TD 2859 (Retorno da educacao tecnica): wage premium of 21,3% to 24,9% for workers in technical occupations (RAIS longitudinal, 2007-2018 data). 0.23 is a design choice inside the range; smaller for 18-year-olds.

## degreePremium

- **Value:** 0.25 rate (asOf 2025, status secondary); previous 0.25
- **Source:** https://www.mackenzie.br/ceat/menu/noticias/arquivo/n/a/i/no-brasil-graduados-tem-renda-126-maior-que-os-trabalhadores-com-ensino-medio-aponta-pesquisa-do-ibge
- **Finding and conversion:** Design choice: a conservative causal premium (Insper 2018 dissertation, cited in the repo note, finds >25%; not re-opened). Raw PNAD gap is far larger: graduates earn 126% more than ensino medio (Mackenzie/IBGE headline); IBGE 2025 puts superior completo at R$ 6.947 (Bahia Noticias) but the medio figure was not found.

## jovemAprendizPay4h

- **Value:** 73700 centavos/month (asOf 2026-01, status secondary); previous 73700
- **Source:** https://www2.camara.leg.br/legin/fed/decret/2025/decreto-12797-23-dezembro-2025-798569-publicacaooriginal-177587-pe.html
- **Finding and conversion:** Decreto 12.797/2025 sets the hourly minimum at R$ 7,37; apprentice pay is at least the hourly minimum (CLT art. 428 par. 2; Decreto 9.579/2018 regulates the contract; neither opened). R$ 7,37 x 100h/month (4h x 5 days x 20 weeks, Genyo method) = R$ 737. Brief's 22-day formula gives R$ 648,56; with DSR (Caltrab) ~R$ 761.

## minimumWage

- **Value:** 162100 centavos/month (asOf 2026-01, status verified); previous 162100
- **Source:** https://www2.camara.leg.br/legin/fed/decret/2025/decreto-12797-23-dezembro-2025-798569-publicacaooriginal-177587-pe.html
- **Finding and conversion:** Decreto 12.797 of 23/12/2025, art. 1: R$ 1.621,00, daily R$ 54,04, hourly R$ 7,37, in force 01/01/2026. Sao Paulo state floor is R$ 1.874,36 from 01/06/2026 (Lei estadual 18.471/2026, per search results; not opened), used only by categories without a federal piso.

## healthPlanYoung

- **Value:** 19761 centavos/month (asOf 2026-10, status secondary); previous 14500
- **Source:** https://www.companyhero.com/blog/planos-empresariais-tabela-de-precos
- **Finding and conversion:** Company Hero simulator (checked 21/10/2026), Sao Paulo, age 24-28: cheapest R$ 197,61 per person for a 1-life MEI plan, R$ 149,63 for plans with 3+ lives. These are coletivo/empresarial starting prices; individual plans are rarely sold (Bradesco sells none). Was R$ 145 (ages 19-23).

## childMonthlyCost

- **Value:** 140000 centavos/month (asOf 2026-04, status secondary); new key
- **Source:** https://sum.money/br/custo-filho/
- **Finding and conversion:** sum.money (updated April 2026, citing IBGE/SPC/FGV): lower-income family with public school and SUS spends R$ 1.200-1.600/month on a child; midpoint R$ 1.400. Component breakdown not given. Diapers R$ 150-420/month and formula ~R$ 400/month appear in other search results (not opened).

## usedCarPrice

- **Value:** 4000000 centavos (asOf 2026-10, status secondary); new key
- **Source:** https://consultadeplaca.net/blog/tabela-fipe-mobi
- **Finding and conversion:** FIPE for a 2018 Fiat Mobi (8 years old), reference October 2026: R$ 37.588 to R$ 45.613 by version; a median near R$ 39.845 is reported. Rounded to R$ 40.000. FIPE read via an aggregator; Gol and HB20 not checked (HB20 2018 is R$ 63-68k).

## carFinanceMonthly

- **Value:** 0.0196 rate/month (asOf 2026-09, status verified); new key
- **Source:** https://api.bcb.gov.br/dados/serie/bcdata.sgs.25471/dados/ultimos/6?formato=json
- **Finding and conversion:** BCB SGS API (opened): monthly series returns 1,96% (Sep 2026), 1,97% (Aug), 1,98% (Jul). Matches SGS 20749 (annual rate for aquisicao de veiculos, PF) of 26,18% a.a. in Sep 2026 = 1,96%/month compounded. This is the average for all vehicle credit, not used-car only.

## carFinanceMonths

- **Value:** 48 months (asOf 2026-08, status secondary); new key
- **Source:** https://garagem360.com.br/?p=321743
- **Finding and conversion:** Design choice: 48 months (the brief's 48-or-60). Garagem360 simulates a 48-month Tabela Price loan at the BCB average rate (26,42% a.a. in Aug 2026); it does not state a typical term, and no BCB term series was read.

## carRunningCost

- **Value:** 100000 centavos/month (asOf 2026-04, status secondary); new key
- **Source:** https://canaltech.com.br/carros/quanto-custa-manter-um-carro-em-2026-fizemos-as-contas-por-categoria/
- **Finding and conversion:** Canaltech (04/04/2026), entry hatch at 1.200 km/month: fuel R$ 500 + insurance R$ 150 + IPVA R$ 220 + maintenance R$ 200 = R$ 1.070. Adjusted for a R$ 40k car: IPVA SP 4% = R$ 133/month, giving ~R$ 983, rounded to R$ 1.000. Vrum (03/08/2026) cites R$ 1.632 for a popular car including protection and washing (upper bound). IPVA rate is from search results, not opened.

## weddingCostSimple

- **Value:** 500000 centavos (asOf 2026, status secondary); new key
- **Source:** https://meutudo.com.br/blog/casamento-civil-como-funciona/
- **Finding and conversion:** Only the civil part is sourced: Sao Paulo cartorio R$ 539,53 (Meu Tudo, 2026 table). The small celebration (~R$ 4.500 for a family lunch) is a game design assumption with no source; total R$ 5.000. Weak.

## weddingCostParty

- **Value:** 2800000 centavos (asOf 2025, status secondary); new key
- **Source:** https://www.casamentos.com.br/artigos/como-sobreviver-organizacao-casamento-tradicoes-curiosidades-informe-setor-nupcial-brasil--c11071
- **Finding and conversion:** Casamentos.com.br (2025 report, couples married 2024): Sao Paulo average R$ 54.947 for ~124 guests = ~R$ 443/guest; at 65 guests ~R$ 28,8k. Zankyou via Neon: SP economico R$ 40 mil per 100 guests (~R$ 400/guest, ~R$ 26k at 65). Value R$ 28.000 computed.

## tripCost

- **Value:** 300000 centavos (asOf 2026-07, status secondary); new key
- **Source:** https://www.itatiaia.com.br/turismo/viagens-corporativas-movimentam-r-102-bilhoes-no-primeiro-semestre-de-2026/
- **Finding and conversion:** Computed: Anac average fare R$ 660 (Jun 2026; R$ 703 in Jul per Panrotas) x 2 legs = ~R$ 1.360, plus 4 nights at the Fohb national average daily rate R$ 421 (Jun 2026) = R$ 1.684; total ~R$ 3.040, rounded R$ 3.000. Food and local transport excluded. No Decolar/Hurb data found.

## englishCourseMonthly

- **Value:** 40000 centavos/month (asOf 2026-09, status secondary); new key
- **Source:** https://compareescolas.com.br/wizard/
- **Finding and conversion:** Wizard (30/09/2026): from R$ 277/month up to R$ 742 by unit, promo 12 x R$ 279. Fisk SP (page dated 2024, 2026 range R$ 250-400): R$ 283/month plus material R$ 725/semester (~R$ 121/month). Value R$ 400 = fee + material. Catraca Livre (22/01/2026) gives R$ 200-600 for presencial group classes.

## englishPremium

- **Value:** 0.25 rate (asOf 2017, status secondary); new key
- **Source:** https://www.educamaisbrasil.com.br/educacao/noticias/ter-dominio-do-ingles-favorece-boa-colocacao-no-mercado-de-trabalho
- **Finding and conversion:** Catho salary survey (published 25/07/2017, 13.000+ respondents): English adds 20% for analysts, 32% for specialists, 56% for management. 0.25 sits between analyst and specialist. Old data; newer Catho editions cite 'up to' 52-72% (search results, not opened). No Robert Half percentage found.

## fgtsRate

- **Value:** 0.08 rate (asOf 2026, status verified); new key
- **Source:** https://www.gov.br/pgfn/pt-br/assuntos/divida-ativa-da-uniao/divida-ativa-do-fgts/breve-historico-do-fgts
- **Finding and conversion:** Lei 8.036/1990 art. 15: employer deposits 8% of the remuneration paid or due (PGFN page opened). Apprentices get 2% (search result, unverified), so the game should use 0.02 for the aprendiz job.

## fgtsFineRate

- **Value:** 0.4 rate (asOf 2026, status verified); new key
- **Source:** https://www.gov.br/pgfn/pt-br/assuntos/divida-ativa-da-uniao/divida-ativa-do-fgts/breve-historico-do-fgts
- **Finding and conversion:** Fine on dismissal without cause is 40% of the FGTS balance (Lei 8.036/1990 art. 18 par. 1; raised from 10% by CF/88 ADCT art. 10, I, per PGFN page). It is 20% for culpa reciproca or forca maior. Paid on the whole balance, not on salary.

## seguroDesempregoMonthsMin

- **Value:** 3 months (asOf 2026, status verified); new key
- **Source:** https://www.gov.br/trabalho-e-emprego/pt-br/servicos/trabalhador/seguro-desemprego/seguro-desemprego-formal
- **Finding and conversion:** MTE page: 3 parcelas for 9-11 months worked (2nd request) or 6-11 months (3rd+); a first request needs 12+ months and gets no 3-parcela tier. Lei 7.998/1990 art. 4 sets the 3-5 range.

## seguroDesempregoMonthsMax

- **Value:** 5 months (asOf 2026, status verified); new key
- **Source:** https://www.gov.br/trabalho-e-emprego/pt-br/servicos/trabalhador/seguro-desemprego/seguro-desemprego-formal
- **Finding and conversion:** MTE page: 4 parcelas for 12-23 months worked, 5 for 24 months or more, within the last 36 months. Game rule: 3 if 6-11 months, 4 if 12-23, 5 if 24+ (simplification of the first-request rule).

## seguroDesempregoMax

- **Value:** 251865 centavos/month (asOf 2026-01, status secondary); new key
- **Source:** https://borainvestir.b3.com.br/noticias/seguro-desemprego-veja-novos-valores-em-2026-teto-e-regra-de-calculo/
- **Finding and conversion:** B3 Bora Investir, relaying the MTE table from 11/01/2026: ceiling R$ 2.518,65 (was R$ 2.424,11 in 2025); 80% of average pay up to R$ 2.222,17, then R$ 1.777,74 + 50% of the excess, capped above R$ 3.703,99. The MTE page itself still shows the 2024 table. Some sites quote R$ 2.587,47 (conflict).

## seguroDesempregoMin

- **Value:** 162100 centavos/month (asOf 2026-01, status verified); new key
- **Source:** https://www.gov.br/trabalho-e-emprego/pt-br/servicos/trabalhador/seguro-desemprego/seguro-desemprego-formal
- **Finding and conversion:** The benefit cannot be below the minimum wage (MTE page); the 2026 minimum is R$ 1.621 (Decreto 12.797/2025).
