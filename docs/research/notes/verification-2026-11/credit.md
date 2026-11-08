# Credit group: research notes (as of 2026-11-08)

All web pages named were opened unless marked. BCB, Einstein and Itaú first-party pages returned empty, 403 or unreadable PDFs, so most items are `secondary` (press citing BCB).

## cardMinimumPaymentPct

- Value: 0.15 (rate of statement), asOf 2024-01, status secondary
- Source: https://www.mobills.com.br/blog/cartao-de-credito/pagamento-minimo-do-cartao-de-credito/
- Finding and conversion: Mobills (4 Jan 2024) describes the issuer minimum as 15% of the statement plus 100% of interest, IOF, late fees and withdrawals. Nubank's help page (nubank.com.br/ajuda-e-seguranca/rotativo-e-parcelamento) shows R$ 130 on a R$ 725 bill (17.9%, charges included) without stating a rule. No bank page found stating its own percentage; 15% is the representative share.

## cardFirstLimit

- Value: 50000 (centavos), asOf 2026-11, status placeholder
- Source: https://www.mobills.com.br/blog/cartao-de-credito/qual-o-limite-do-cartao-nubank/
- Finding and conversion: Design choice. Nubank does not publish an initial limit (limit is individual, set by credit analysis); its 'construir limite' deposit route can reach R$ 5.000 (Mobills, 1 Nov 2023). No survey with a typical first limit for an 18-year-old with no history was found.

## securedCardMaxLimit

- Value: 100000 (centavos), asOf 2025-09, status secondary
- Source: https://blog.nubank.com.br/cartao-de-credito-menor-de-18-anos/
- Finding and conversion: Game design choice. Real rule (Nubank, ages 16-17): limit equals the Caixinha balance, no published maximum or minimum, unpaid bills are settled from the Caixinha. Nubank's deposit-backed limit route tops out at R$ 5.000 (Mobills 2023), so R$ 1.000 sits inside the R$ 0 to R$ 5.000 real range.

## overdraftFloor

- Value: 50000 (centavos), asOf 2026-11, status placeholder
- Source: https://normativos.bcb.gov.br/Lists/Normativos/Attachments/50875/Res_4765_v2_P.pdf
- Finding and conversion: Design choice. No source states a typical minimum pre-approved cheque especial for a new account. Res. CMN 4.765/2019 references R$ 500 (a bank may not impose a limit above R$ 500 on a client who opts for less; the BCB journal calls R$ 500 a minimum for re-framing) but the PDF text could not be read here, so this rests on search snippets.

## pixDiscountTypical

- Value: 0.05 (rate), asOf 2024-07, status secondary
- Source: https://www.seudinheiro.com/2024/empresas/descontos-de-encher-os-olhos-por-que-magalu-mglu3-casas-bahia-bhia3-e-outras-varejistas-oferecem-precos-ate-20-mais-baixos-para-pagamento-via-pix-mcss
- Finding and conversion: GMattos survey (July 2024, Seu Dinheiro 12 Sep 2024): 58% of retailers gave Pix advantages; 3-5% across all products at many stores, 10-15% on some groups, up to 20% on some items. Coupon guide for Magalu (cupomonline.com.br/cupom-magazine-luiza-pix/) says 5-15%. 5% is the typical store-wide figure.

## blackFridayPixDiscount

- Value: 0.1 (rate), asOf 2026-11, status secondary
- Source: https://www.cupomonline.com.br/cupom-magazine-luiza-pix/
- Finding and conversion: Design choice inside the observed range: Magalu Pix discount 5-15% depending on product and promotion (coupon site, 2026); GMattos 2024 found 10-15% on selected groups. No 2026 retailer page quoting a Black Friday Pix percentage was found.

## consignadoAmount

- Value: 600000 (centavos), asOf 2025-04, status secondary
- Source: https://meutudo.com.br/blog/noticias/2025/04/04/valor-medio-do-consignado-clt-e-r-6-240-por-trabalhador-saiba-mais/
- Finding and conversion: MTE data (early Apr 2025): average R$ 6.240,57 per worker, installment R$ 349,20, 18 months; margin up to 35% of net income. Computation for a minimum-wage worker (R$ 1.621, Decreto 12.797/2025): net about R$ 1.500, 35% margin about R$ 525/month, which at 3.75%/month supports about R$ 6.800 over 18 months. Changed from R$ 5.000 to R$ 6.000 (game value rounds the average).

## familyPixAmount

- Value: 20000 (centavos), asOf 2025-09, status secondary
- Source: https://forbes.com.br/forbes-money/2025/09/adeptos-ao-pix-para-troca-de-mensagens-publico-menor-de-idade-podera-ter-cartao-de-credito-proprio-no-nubank/
- Finding and conversion: Design choice. Nubank study via Forbes (29 Sep 2025): 84% of under-18 users use Pix for transfers and 64% of young clients send R$ 20 or less. That describes teen-to-teen transfers, not a loan from family; R$ 200 is a deliberately larger 'family loan' above the usual R$ 20 transfer. No survey of family loan size found.

## emergencyMinCost

- Value: 60000 (centavos), asOf 2024-07, status secondary
- Source: https://riosaude.com/quanto-custa-uma-consulta-no-ps-do-einstein/
- Finding and conversion: Einstein PS consultation R$ 600 to R$ 1.000 (broker article, 6 Jul 2024, repeating the hospital's own FAQ, which returned 403 here). Exams are billed separately and not priced in the source.

## emergencyMaxCost

- Value: 150000 (centavos), asOf 2026-08, status secondary
- Source: https://www.ikaros.com.br/blog/tabela-de-precos-hospital-albert-einstein-particular-x-plano
- Finding and conversion: Design choice at the low end of a wide range. Ikaros (Aug 2026) estimates an entry fee of R$ 1.500 to R$ 3.500 at high-complexity SP hospitals, exams and medication billed on top; it is a market estimate, not an official Einstein price. Consider raising if the game should reflect Einstein-class cost.

## phoneTheftAnnualProb

- Value: 0.014 (probability/year), asOf 2025, status secondary
- Source: https://www.acessa.com/noticias/2026/01/307708-estado-de-sp-tem-queda-de-59-no-numero-de-celulares-roubados-ou-furtados-media-de-697-por-dia.html
- Finding and conversion: SSP: 161.666 phones robbed or stolen in São Paulo city in 2025 (254.416 statewide). City population 11.904.961 (IBGE 2025 estimate, via abcdoabc.com.br) gives 1.36% per person; statewide 254.416 / 46.081.801 = 0.55%. Counts are police reports (undercount) and can include repeat victims and non-residents, so 1.4% for the city is an approximation. Was 3%.

## betsExpectedLoss

- Value: 0.35 (share of stake lost per month), asOf 2024-06, status secondary
- Source: https://oantagonista.com.br/brasil/brasileiros-perderam-quase-240-bilhoes-em-apostas-esportivas/
- Finding and conversion: Itaú study (Jul 2023 to Jun 2024, via O Antagonista): deposits R$ 68,2 bn, withdrawals R$ 44,3 bn, net loss R$ 23,9 bn = 35% of deposits ('R$ 1 lost per R$ 3'). Comsefaz (Agência Brasil/O Povo, 6 Aug 2026): R$ 62,5 bn lost in 2025, R$ 4,7 bn/month, using BCB Pix data; it gives no deposit-loss share. Fortune Tiger RTP is reported as 96,81% by affiliate and press sites, not confirmed by PG Soft. The game applies the 35% as the share lost; it is a yearly aggregate used as a monthly proxy, so treat as a design simplification. Was 60%.

## cardRotativoMonthly

- Value: 0.1529 (rate/month), asOf 2026-09, status secondary
- Source: https://www.opovo.com.br/noticias/economia/2026/10/29/juro-medio-do-rotativo-do-cartao-de-credito-sobe-a-4517-ao-ano-em-setembro-diz-bc.html
- Finding and conversion: BCB average 451,7% a.a. for rotativo, Sep 2026 (published 29 Oct 2026, Agência Estado). (1+4,517)^(1/12)-1 = 15,29%/month. BCB page itself could not be rendered.

## cardParceladoMonthly

- Value: 0.0937 (rate/month), asOf 2026-09, status secondary
- Source: https://www.opovo.com.br/noticias/economia/2026/10/29/juro-medio-do-rotativo-do-cartao-de-credito-sobe-a-4517-ao-ano-em-setembro-diz-bc.html
- Finding and conversion: BCB average 193,0% a.a. for parcelado, Sep 2026. (2,93)^(1/12)-1 = 9,37%/month.

## chequeEspecialMonthly

- Value: 0.08 (rate/month), asOf 2026-09, status secondary
- Source: https://paiquerefm.com.br/estadao/juro-medio-no-credito-livre-sobe-a-490-em-setembro-mostra-bc-cheque-especial-vai-a-139/
- Finding and conversion: Kept as the legal cap (CMN Res. 4.765/2019, 8%/month; cap text not re-opened, PDF unreadable). BCB Sep 2026 average is 139,0% a.a. = 7,53%/month (Estadão via Paiquerê FM, 29 Oct 2026), just under the cap. Use 0.0753 if the game should show the average rather than the ceiling.

## personalLoanMonthly

- Value: 0.0642 (rate/month), asOf 2026-09, status secondary
- Source: https://paiquerefm.com.br/estadao/juro-medio-no-credito-livre-sobe-a-490-em-setembro-mostra-bc-cheque-especial-vai-a-139/
- Finding and conversion: BCB average 110,9% a.a. for non-consigned personal credit, Sep 2026 (Aug 110,4%). (2,109)^(1/12)-1 = 6,42%/month. Procon-SP's 8,66% a.m. at big banks (earlier note) not re-verified.

## consignadoMonthly

- Value: 0.0375 (rate/month), asOf 2026-09, status secondary
- Source: https://www.jornaldocomercio.com/economia/2026/10/1268731-concessoes-do-consignado-privado-cairam-77-em-setembro-ante-agosto-mostra-bc.html
- Finding and conversion: BCB average for consignado privado (CLT) 55,5% a.a. in Sep 2026 (Aug 56,3%). (1,555)^(1/12)-1 = 3,75%/month; consistent with 3,79%/month reported for June 2026. Old value 3,4% was from mid-2025.

## selicAnnual

- Value: 0.1375 (rate/year), asOf 2026-11-04, status secondary
- Source: https://atlaspublico.com.br/bcb/noticias/copom-mantem-selic-em-13-75pct-ao-ano-por-unanimidade-e-ve-99107
- Finding and conversion: Copom 282nd meeting, 4 Nov 2026: Selic held at 13,75% a.a., unanimous (communiqué reproduced by Atlas Publico; Rankia confirms and says target in force since 16 Sep). bcb.gov.br pages did not render, so not verified.

## cdiAnnual

- Value: 0.1365 (rate/year), asOf 2026-11, status secondary
- Source: https://rankia.com.br/proxima-reuniao-copom/
- Finding and conversion: Rankia: CDI 'perto de 13,65% a.a.' after the Nov 2026 hold. CDI trades about 0,10 pp under Selic.

## poupancaMonthly

- Value: 0.0066 (rate/month), asOf 2026-11, status secondary
- Source: https://rankia.com.br/poupanca-outubro-2026-quanto-rende/
- Finding and conversion: Rankia: credit of 0,6624% on 1 Nov 2026 (0,5% + TR of 0,1616% for 1 Oct to 1 Nov, BCB TR). Rule 0,5%+TR holds while Selic > 8,5%. Rounded from 0,006624.

## ipcaExpected

- Value: 0.0522 (rate/year), asOf 2026-10-30, status secondary
- Source: https://paraibabusiness.com.br/focus-eleva-ipca-de-2027-a-476-acima-do-teto-da-meta-diz-bc/
- Finding and conversion: Focus bulletin of 2 Nov 2026 (data to 30 Oct): IPCA 2026 median 5,22%, 2027 4,76% (above the 4,5% ceiling), Selic end-2026 13,50%, end-2027 12,50%. Value for 2026 unchanged; 2027 is 0.0476 if needed.
