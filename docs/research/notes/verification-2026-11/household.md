# Household group: research notes (checked 2026-11-08)

Each entry gives the old and new game value (centavos unless the unit says otherwise), the status, the source opened, and how the value was derived. Sources that blocked the fetch tool (Planalto, honda.com.br, Magalu, OLX, Mercado Livre, Casas Bahia) are named where relevant; prices from them come from search snippets only and are flagged as such.

## lanchePrice

- Value: 400 -> 900 (centavos/school day), as of 2026-04, status **secondary**
- Source: https://www.ufmg.br/dlo/arquivo/dfc/Contratos/013_2025_LCA/013_2025_01apost.pdf
- Findings and conversion: No São Paulo school-cantina list was found. Proxy: the UFMG engineering-school cantina contract price list readjusted 23/04/2026 has pão de queijo R$ 3,05, coxinha R$ 5,44, juice box R$ 4,46, soda can R$ 5,44, so salgado plus drink is R$ 7,51 to R$ 10,90; R$ 9 sits in that range. Raised from R$ 4: 20 days at R$ 9 is R$ 180, above a R$ 100 mesada, which is the intended dilemma.

## schoolDaysPerMonth

- Value: 20 -> 20 (days), as of 2026, status **verified**
- Source: https://legis.senado.leg.br/sdleg-getter/documento?dm=3641047
- Findings and conversion: LDB (Lei 9.394/1996) art. 24, I: minimum 800 hours over at least 200 days of effective school work, excluding final exams. 200 days over about 10 school months is 20 days per month.

## phonePlan

- Value: 5000 -> 3000 (centavos/month), as of 2026-09, status **secondary**
- Source: https://melhorplano.net/planos-de-celular/plano-pre-pago/melhores-planos-pre-pagos
- Findings and conversion: Comparator page dated 21/09/2026: typical prepaid at R$ 30 per 30 days (Claro Prezão 21GB, Vivo Pré 25GB, TIM Pré Xip 16GB). Controle starts at R$ 49,90 to R$ 59,90 (melhorplano.net/planos-de-celular/plano-controle, updated 06/11/2026). Operator price pages were not opened. Lowered from R$ 50 because the key describes a prepaid plan.

## usedPhonePrice

- Value: 50000 -> 80000 (centavos), as of 2026-11, status **secondary**
- Source: https://www.extra.com.br/usado-samsung-galaxy-a54-5g-128gb-preto-bom-trocafone/p/1582810588
- Findings and conversion: Used Galaxy A54 5G (2023 mid-range): Trocafone refurbished about R$ 908 to R$ 1.153 on Magalu and R$ 1.037 (Pix) on Casas Bahia/Extra; OLX private ads about R$ 800 to R$ 1.200; Mercado Livre R$ 850 and up. Listing pages return 403 to the fetch tool, so prices come from search-result snippets and are not page-verified. R$ 800 is the private-listing low end. Note this is close to a new Galaxy A17.

## entryPhonePrice

- Value: 136600 -> 99900 (centavos), as of 2026-09, status **secondary**
- Source: https://www.techtudo.com.br/listas/2026/09/melhor-celular-ate-r-1500-para-comprar-em-setembro-de-2026-edqualcomprarmb.ghtml
- Findings and conversion: TechTudo, 11/09/2026: Galaxy A17 128GB R$ 999 on Amazon (offer card; text says R$ 849) and R$ 1.081,52 on Magalu; Moto G35 256GB R$ 899 to R$ 1.199. Value is the Amazon A17 offer-card price. The old R$ 1.366 was the Redmi Note 15, which is mid-range, not entry.

## giftGrandma

- Value: 10000 -> 10000 (centavos), as of 2026-10, status **secondary**
- Source: https://mercadoeconsumo.com.br/06/10/2024/noticias-varejo/dia-das-criancas-deve-movimentar-r-18-bilhoes-em-compras-volume-128-maior-que-2023/amp/
- Findings and conversion: Design choice. No survey of cash gifts from grandparents exists. Reference range: Datafolha/Abecs average planned Dia das Crianças gift R$ 231 (2024); the 2025 and 2026 editions are reported at R$ 219 and R$ 225 in search snippets; a gift guide's bands for ages 10-12 run R$ 30 to R$ 150. R$ 100 sits inside that range.

## giftBirthdayUnit

- Value: 10000 -> 10000 (centavos), as of 2026-10, status **secondary**
- Source: https://www.guardardinheiro.com.br/blog/lista-presentes-dia-das-criancas-2026-idade-preco
- Findings and conversion: Design choice. One unit is R$ 100, so a gift is R$ 100 to R$ 200. Reference: the top band for ages 10-12 in the gift guide is R$ 70 to R$ 150 (the guide's own suggestions); Datafolha/Abecs average R$ 231 (2024).

## mesadaMonthly

- Value: 10000 -> 10000 (centavos/month), as of 2023-10, status **secondary**
- Source: https://www.serasa.com.br/imprensa/mesada-aos-filhos/
- Findings and conversion: Serasa/Opinion Box (Oct 2023): 74% of paying parents give up to R$ 100 and 53% up to R$ 60; sample size not published. SPC Brasil is cited in search snippets at an average of about R$ 123 (page not opened). The 2024 wave (61% up to R$ 100) is in docs/research/notes/tween_teen_money_life.md and was not re-opened here. R$ 100 is the documented ceiling for most payers.

## mesadaYearlyStep

- Value: 2000 -> 1000 (centavos/year of age), as of 2026-11, status **secondary**
- Source: https://www.serasa.com.br/imprensa/mesada-aos-filhos/
- Findings and conversion: Design choice. No survey gives mesada by age (Serasa 2023 gives only the share of payers: 54% at 6-11, 45% at 15-18). The repo notes' inference is R$ 50-100 at 10-14 and R$ 100-150 at 15-17. From R$ 100 at 10, R$ 10 per year gives R$ 150 at 15 and R$ 170 at 17. The old R$ 20 per year reached R$ 240 at 17, above any sourced figure.

## bicoWeekPay

- Value: 15000 -> 15000 (centavos), as of 2026-11, status **secondary**
- Source: https://www.salario.com.br/profissao/panfleteiro-cbo-519905/
- Findings and conversion: Design choice backed by computation. Salario.com.br (Nov 2026): panfleteiro CLT base R$ 1.862,80 to R$ 2.756 a month, average R$ 9,72 per hour, so about 15 hours a week is R$ 146. Day rates seen: freelance garçom R$ 120 for 18h-01h in Campinas (bne.com.br/vaga-de-emprego-na-area-alimentos-em-campinas-sp/garcom/4654395, undated); Recife leafleting R$ 70 per 4h shift and São Paulo babá about R$ 27 per hour appear only in search snippets. No São Paulo teen-specific source exists, and minors under 16 cannot legally work.

## leisureTeenMonthly

- Value: 35000 -> 35000 (centavos/month), as of 2026-01, status **secondary**
- Source: https://cdn.correiodoestado.com.br/upload/dn_arquivo/2026/02/serasa-completo-custos-de-vida-jan2026-v5.pdf
- Findings and conversion: Design choice. Serasa Custos de Vida (fieldwork 22/12/2025-06/01/2026, n=6.063, among respondents who have the expense): national average lazer R$ 340 a month, São Paulo R$ 390, eating out R$ 250 national and R$ 310 SP. No teen breakdown. R$ 350 is the national lazer average; a teen's roupa and rolê share is assumed similar.

## leisureAdultMonthly

- Value: 40000 -> 40000 (centavos/month), as of 2026-01, status **secondary**
- Source: https://cdn.correiodoestado.com.br/upload/dn_arquivo/2026/02/serasa-completo-custos-de-vida-jan2026-v5.pdf
- Findings and conversion: Serasa Custos de Vida Jan 2026 (n=6.063): lazer R$ 390 in São Paulo (R$ 340 national), personal-care services R$ 150 national, eating out R$ 310 SP. R$ 400 equals the SP lazer average alone, so lazer, roupa and barbearia together are a conservative game figure. IBGE POF 2017-2018 (Tabela 5, opened): vestuário 4,3% and recreação e cultura 2,6% of mean monthly family consumption of R$ 3.764,51, about R$ 162 and R$ 98 in 2018 reais, as a cross-check.

## familyContribution

- Value: 40000 -> 40000 (centavos/month), as of 2026-11, status **secondary**
- Source: https://brasil61.com/noticias/economia-oito-em-cada-dez-jovens-ajudam-no-sustento-da-casa-de-acordo-com-spc-cofe170013
- Findings and conversion: Design choice. SPC Brasil/CNDL (article of 13/02/2017): 83% of 18-30 year-olds help pay household expenses; 29% cover part and 27% are the main provider. No amount in reais was found in any source. R$ 400 is about 25% of the 2026 minimum wage of R$ 1.621.

## rentKitnetSP

- Value: 120000 -> 150000 (centavos/month), as of 2026-11, status **secondary**
- Source: https://www.quintoandar.com.br/alugar/imovel/aclimacao-sao-paulo-sp-brasil/kitnet
- Findings and conversion: QuintoAndar kitnet/studio neighbourhood averages in São Paulo (listing-based, not an official survey): Sé R$ 1.520, Mooca R$ 1.800, Liberdade R$ 1.840, Aclimação R$ 2.125, Vila Mariana R$ 2.750. FipeZAP April 2026: R$ 64,20/m2 in São Paulo, so a 30 m2 one-bedroom is R$ 1.926 (viva.com.br/dinheiro/maior-demanda-por-aluguel-na-cidade-de-sao-paulo-encarece-compactos.html). R$ 1.500 is the cheapest central average; peripheral units are cheaper but unsourced.

## motoPrice

- Value: 1735000 -> 1735000 (centavos), as of 2026-01, status **secondary**
- Source: https://garagem360.com.br/?p=300428
- Findings and conversion: Honda's own site returned 403. Garagem360 (16/01/2026) reports a suggested price of R$ 15.780 for the CG 160 Start 2026 excluding freight, and says dealer prices run R$ 2.000 to R$ 3.000 higher. Other outlets cite R$ 16.770 and R$ 17.350 (the figure kept from the repo notes, from A Revista, which now redirects to a 404). R$ 17.350 sits between suggested price and dealer price.

## motoRunningCost

- Value: 25000 -> 57000 (centavos/month), as of 2026-01, status **secondary**
- Source: https://garagem360.com.br/?p=301259
- Findings and conversion: Garagem360 (21/01/2026), about 1.000 km a month, 35-45 km/l, gasoline about R$ 6,00: fuel R$ 150-180, insurance R$ 110-135 (R$ 1.300-1.600 a year), IPVA and licensing R$ 50-55, maintenance R$ 200-260; total R$ 510-630, midpoint R$ 570. At about 400 km a month the same inputs give roughly R$ 300. Raised from R$ 250 assuming delivery-type use.

## valeTransporteRate

- Value: 0.06 -> 0.06 (rate of gross salary), as of 2026-01, status **verified**
- Source: https://legis.senado.leg.br/norma/517887/publicacao/15646209
- Findings and conversion: Decreto 95.247/1987 art. 9 (Senate legislation portal): the beneficiary pays 'a parcela equivalente a 6% de seu salário básico ou vencimento' and the employer pays the excess. Same rule in Lei 7.418/1985 (art. 4, parágrafo único; Planalto blocked the fetch). Search results say the decree was revoked by Decreto 10.854/2021, whose art. 114 repeats the 6% (not opened). The base is salário básico, excluding adicionais.

## promotionBonus

- Value: 20000 -> 20000 (centavos), as of 2025-12, status **secondary**
- Source: https://timesbrasil.com.br/brasil/economia-brasileira/quanto-os-bares-e-restaurantes-de-sp-esperam-faturar-ate-o-final-do-ano-veja-pesquisa-do-setor/
- Findings and conversion: Design choice. Abrasel-SP expects an average ticket of R$ 120 per person for end-of-year events in São Paulo bars and restaurants (article of 13/12/2025). A São Paulo full lunch averaged R$ 59,67 in the 2024 ABBT/Mosaiclab survey. R$ 200 is about four people at R$ 50, below the festive peak.

## blackFridayMinCash

- Value: 100000 -> 100000 (centavos), as of 2026-08, status **secondary**
- Source: https://mercadoeconsumo.com.br/07/10/2026/noticias-varejo/black-friday-2026-consumidor-antecipa-decisao-e-shopping-ganha-forca-na-conversao-aponta-helloo/
- Findings and conversion: Design choice. Helloo (Aug 2026, n=600): 66% expect to spend over R$ 500 on Black Friday. A Stefanini ticket of R$ 790,71 per order appears only in search snippets. R$ 1.000 sits above both and about equals the entry phone (R$ 999), the likely big-ticket offer; the game should keep it at or above the cheapest offer's price.

## busFareSP

- Value: 530 -> 530 (centavos/ride), as of 2026-01, status **secondary**
- Source: https://diariodotransporte.com.br/2026/01/05/confira-as-tarifas-com-reajuste-dos-transportes-na-grande-sao-paulo-nesta-segunda-05-e-o-ultimo-dia-para-carregar-o-bilhete-unico-para-escapar-do-aumento-por-seis-meses/
- Findings and conversion: SPTrans municipal bus basic fare rose from R$ 5,00 to R$ 5,30 on 06/01/2026 (Diário do Transporte). SPTrans' own page was not opened. No later change was found.

## cestaBasicaSP

- Value: 92251 -> 92251 (centavos/month), as of 2026-09, status **verified**
- Source: https://www.dieese.org.br/analisecestabasica/2026/202609cestabasica.pdf
- Findings and conversion: DIEESE bulletin dated 9 Oct 2026, read as text: São Paulo R$ 922,51 in September (+2,43% on August), the most expensive capital. The October bulletin (202610cestabasica.pdf) returned 404 on 8 Nov 2026, so September is the latest.
