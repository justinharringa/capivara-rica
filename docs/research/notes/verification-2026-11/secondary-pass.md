# Secondary-source pass: four weak parameters (checked 2026-11-09)

Follow-up to [education.md](education.md). Four parameters whose `secondary` source was a single
blog post or a news relay were re-sourced from official pages, fee tables and price lists. Each
entry: what was found, the URLs opened, the value the evidence supports, the recommendation
(value, status) and residual doubts. Values in centavos unless the unit says otherwise.

Convention, as in the sibling notes: `verified` means a primary or official source states that
exact figure; a value that is a design choice inside a sourced range stays `secondary` even when
the range is official.

Pages that would not load here: `planalto.gov.br` (blocked, "bloqueio de aplicações"),
`atos.cnj.jus.br` (HTTP 403), Catho's own survey report (not found). Nothing is quoted from them.

## seguroDesempregoMax

- **Value:** 251865 -> 251865 (centavos/month), asOf 2026-01, status secondary -> **verified**
- **Source:** https://www.gov.br/trabalho-e-emprego/pt-br/noticias-e-conteudo/2026/janeiro/mte-reajusta-valores-do-beneficio-seguro-desemprego
- **Found:** The MTE's own page, "MTE reajusta valores do benefício Seguro-Desemprego",
  "Publicado em 12/01/2026 15h11" (updated 04/11/2026), table "com vigência a partir de 11 de
  janeiro de 2026":
  - "Até R$ 2.222,17 - Multiplica-se o salário médio por 0,8"
  - "De R$ 2.222,18 até R$ 3.703,99 - O que exceder a R$ 2.222,17 multiplica-se por 0,5 e soma-se
    com R$ 1.777,74"
  - "Acima de R$ 3.703,99 - O valor será invariável de R$ 2.518,65"
  - the benefit "não será inferior ao valor do salário mínimo de R$ 1.621,00 vigente para o ano de
    2026"; basis "Lei nº 7.998, de 1990" and "Resolução nº 957, de 2022, do Conselho Deliberativo
    do Fundo de Amparo ao Trabalhador (CODEFAT)"; INPC "3,90%".
  Same text on Agência Gov (EBC), "Confira os novos valores do benefício Seguro-Desemprego para
  2026", 12/01/2026 18:30: https://agenciagov.ebc.com.br/noticias/202601/mte-reajusta-valores-do-beneficio-seguro-desemprego
- **Supported value:** R$ 2.518,65 = 251865 centavos. Unchanged.
- **Recommendation:** keep the value, set status `verified`, source the gov.br page.
- **Residual doubts:** The MTE service page
  (https://www.gov.br/trabalho-e-emprego/pt-br/servicos/trabalhador/seguro-desemprego/seguro-desemprego-formal)
  still shows the 2024 table (teto R$ 2.313,74, "Atualizado em 11/01/2024"), so a reader landing
  there sees a stale figure; the news page is the one that carries 2026. No Portaria or Resolução
  number for the 2026 table itself was found; the page cites the standing CODEFAT Resolução
  957/2022 as the rule and the INPC as the index. The R$ 2.587,47 quoted on some sites has no
  official basis.

## weddingCostSimple

- **Value:** 500000 -> 500000 (centavos), asOf 2026 -> 2026-01, status secondary -> secondary
- **Source:** https://www.arpensp.org.br/tabela-de-custas/2026 (spreadsheet
  https://arpensp.org.br/arquivos/uploads/tabela-de-custas-2026-sem-iss.xlsx, read with openpyxl)
- **Found:** ARPEN-SP's 2026 fee table (Lei estadual 11.331/2002), "TABELA V - REGISTRO CIVIL DAS
  PESSOAS NATURAIS", "Em vigor a partir de 08/01/2026", sheet "Sem ISS":
  - item 1, "Lavratura de assento de casamento realizado na sede, bem como de casamento religioso
    com efeitos civis e conversão de união estável em casamento, incluindo todas as despesas,
    exceto os custos de editais": emolumentos R$ 480,25 + Estado R$ 96,05 = **R$ 576,30**
  - item 3, "Habilitação de casamento a ser realizado em outra serventia (incluindo o preparo de
    papéis, excluídas as despesas de publicação de editais pela imprensa)": R$ 326,71 + R$ 65,34 =
    R$ 392,05 (only when the couple marries at a different cartório)
  - item 4, lavratura "a vista de certidão de habilitação expedida por outra serventia": R$ 174,94
  - item 2, wedding "fora da sede" (judge travels): R$ 1.921,00
  The "ISS integrante" sheet carries the same emolumentos plus a municipal ISS column (1% to 5%
  depending on the municipality), so a São Paulo city wedding is R$ 576,30 plus at most about
  R$ 25 of ISS plus the edital.
  Free civil marriage: Código Civil (Lei 10.406/2002) art. 1.512, read from the Câmara's
  consolidated text
  (https://www2.camara.leg.br/legin/fed/lei/2002/lei-10406-10-janeiro-2002-432893-normaatualizada-pl.html):
  "Art. 1.512. O casamento é civil e gratuita a sua celebração. Parágrafo único. A habilitação
  para o casamento, o registro e a primeira certidão serão isentos de selos, emolumentos e custas,
  para as pessoas cuja pobreza for declarada, sob as penas da lei." The procedure is now
  standardised by CNJ Provimento 221, de 22/04/2026 (DJe 24/04/2026), read on Portal do RI
  (https://portaldori.com.br/2026/04/27/provimento-corregedoria-nacional-de-justica-cnj-no-221-de-22-04-2026-d-j-e-24-04-2026/)
  and IRIB (https://www.irib.org.br/?p=159598): gratuidade "será garantida às pessoas físicas que
  comprovarem insuficiência de recursos" by "declaração de hipossuficiência econômica" (art. 2º);
  it "não abrange os serviços postais, as remessas de documentos, nem as despesas" of diligences
  or notifications (art. 1º § 3º); court-granted gratuidade is outside its scope (§ 4º). It does
  not name casamento; the exemption for casamento comes from art. 1.512 itself.
- **Supported value:** civil part R$ 576,30 (was R$ 539,53 from Meu Tudo, which Meu Tudo's own
  page, updated 02/07/2026, says is not yet a confirmed 2026 figure). The game value is a
  "simple wedding" total: cartório plus a small family celebration. The celebration (~R$ 4.400)
  still has no source, so R$ 5.000 is kept.
- **Recommendation:** keep the value and `secondary` status; move the source to the ARPEN-SP
  table so the sourced component is official. If the design ever splits the civil fee out as its
  own parameter, R$ 576,30 (57630) qualifies for `verified` and R$ 0 is the right value for a
  low-income couple.
- **Residual doubts:** Edital de proclamas cost not in the table (publication in the electronic
  journal was R$ 13,45 in 2020 per the ARPEN-SP 2020 table, not re-checked). The exact ISS rate
  for São Paulo city was not confirmed. The celebration cost remains a guess.

## englishPremium

- **Value:** 0.25 -> 0.25 (rate), asOf 2017 -> 2024-12, status secondary -> secondary
- **Source:** https://prnewswire.com/br/comunicados-para-a-imprensa/entre-gerentes-e-diretores-fluencia-em-ingles-pode-elevar-salarios-em-ate-164-302333777.html
- **Found:** Press release by Jiveworld (Salvador, 17/12/2024), citing a Catho survey of the
  "segundo semestre de 2024" on the average pay gap between fluent professionals and those who do
  not speak English, by level: "Técnico (49%); Analista (58%); Operacional (133%); Especialista
  (51%)", "Supervisores/Coordenadores (78%); e Gerente/Diretor (164%)". No sample size, no R$
  figures. Older editions, for the trend: Catho's own article (catho.com.br/carreira-sucesso,
  updated 05/02/2024) says "nos cargos de coordenação, uma pessoa que fala inglês pode ganhar até
  61% a mais" and "nos cargos de diretoria, a diferença salarial é de até 56%"; Jornal Contábil
  (15/02/2023) cites a 2022 Catho study at "até 83% a mais", 118% for leadership and 63% for
  assistants; Tribuna de Jundiaí (05/11/2019) cites the 59ª Pesquisa Salarial at "123% em cargos
  de assistente ou auxiliar" and 63% in senior management; the 2017 edition (the old source) had
  20% for analysts, 32% for specialists, 56% for management. Quero Bolsa (14/07/2026) repeats the
  61%/56% figures without a year. Robert Half's Guia Salarial 2026 lists English among the most
  demanded skills but publishes no percentage; no IBGE/PNAD-based estimate was found.
- **Supported value:** The newest by-level data puts the raw gap at an early-career level
  (técnico/analista) at 49% to 58%. These are raw averages: fluent workers also have more
  schooling and work for larger firms, so the causal premium is smaller. 0.25 is about half the
  raw entry-level gap, the same conservative discount `degreePremium` applies to the 126% raw
  graduate gap, so the value is kept.
- **Recommendation:** keep 0.25, keep `secondary`, replace the 2017 source with the 2024 release
  and asOf 2024-12.
- **Residual doubts:** The release is a third party (a language-app company) relaying Catho; the
  Catho report itself was not found online, so edition number and sample are unknown. Catho's
  numbers swing widely between editions (20% to 164% for similar levels), which argues for
  treating any one edition as indicative only.

## cursinhoMonthly

- **Value:** 80000 -> 80000 (centavos/month), asOf 2025-01 -> 2026, status secondary -> secondary
- **Source:** https://www.educamaisbrasil.com.br/pre-vestibular-enem
- **Found:** No 2026 price list is published online by Anglo, Etapa, Objetivo or Poliedro (their
  pages offer scholarship contests and "o investimento varia conforme a turma"; Etapa's plan
  finder shows "36xR$1993,99*" with no course named). Sources that do give prices:
  - Educa Mais Brasil guide, "Quanto custa um curso preparatório para o Enem presencial?",
    "Média de valores em 2026": "Mensalidade: entre R$ 400 e R$ 1.200"; "Pacote anual (10 a 12
    meses): de R$ 4.500 a R$ 12.000". Undated page (footer 2026).
  - Cursinho da Poli (São Paulo, Tatuapé and Paraíso), Extensivo 2027 price cards, read
    09/11/2026: "Extensivo Segunda a Sexta" "a partir de R$475,40 por mês"; "Terça a Quinta"
    "a partir de R$361,58 por mês"; "Sábados" "a partir de R$303,26 por mês"; medicina integral
    "a partir de R$990,00 por mês"; "Parcele em até 16x no boleto". Promotional "a partir de"
    prices with a 30% to 40% launch discount. https://cursinhodapoli.com.br/
  - Cursinho Maximize (Paulista), Extensivo 2027: manhã and tarde "R$ 607,00" "em 14x no cartão
    • ou 13x de R$ 754,26 no boleto"; noite "R$ 527,00" x14; sábado "R$ 238,16" x12.
    https://www.cursinhomaximize.org.br/extensivo/
  - Bernoulli BH, Pré-vestibular Extensivo 2026 Manhã (PDF, created 17/11/2025): "Mensalidade
    R$ 38.290,00" à vista or 12x R$ 3.401,00; "Material R$ 4.628,00"; "Taxa de matrícula:
    R$ 997,00". About R$ 3.576/month over 12 months, the elite end.
    https://www.bernoulli.com.br/app/uploads/2025/11/Pre-vestibular-Bernoulli-BH-Extensivo-2026-Manha.pdf
  - Auditório Ibirapuera blog (19/05/2023, dated figures): Objetivo "no período da manhã é de, em
    média, R$2.000 na unidade principal (Paulista)" and "em torno de R$900" elsewhere; Anglo
    "R$ 164,00 (Extensivo Modular Fim de Semana)" to "R$ 1.203,00 (Extensivo Manhã Biológicas)".
    https://www.auditorioibirapuera.com.br/qual-o-valor-da-mensalidade-do-cursinho-da-poli/
  - Online, for the split: Descomplica Enem 2027 "12xR$ 49,90" (R$ 598,80 for 12 + 2 months),
    Fuvest/Unicamp preparatórios 12x R$ 69,90 (https://descomplica.com.br/assinatura/);
    Estratégia Vestibulares packages 12x R$ 69,90 to R$ 99,90 (the old source, re-read, promotion
    valid to 11/11/2026). Online is roughly one tenth of presencial.
- **Supported value:** Presencial Monday-to-Friday courses in São Paulo run from about R$ 475
  (popular cursinhos, promotional) through R$ 600 to R$ 750 (mid-market) to R$ 900 to R$ 2.000
  (Anglo/Objetivo morning classes, 2023) and R$ 3.500 (Bernoulli). R$ 800 is the midpoint of the
  guide's R$ 400 to R$ 1.200 range and sits between the popular and the brand-name tiers.
- **Recommendation:** keep R$ 800 and `secondary`; source the guide, with the price lists in the
  note. A lower-cost variant (about R$ 450, Poli-style) would also be defensible if the design
  wants the cursinho to be reachable on a part-time wage.
- **Residual doubts:** The guide is undated and not a survey; the big four publish no prices;
  the Poli and Maximize figures are 2027-intake promotional prices; Anglo/Objetivo figures are
  from 2023. No consumer survey of cursinho spending exists.
