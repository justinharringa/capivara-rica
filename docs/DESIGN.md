# Design v1 (resumo)

A versão completa, com a pesquisa e as fontes, está em
[research/report-2026-11-07.md](research/report-2026-11-07.md). Este arquivo é o resumo
operacional do que o código implementa hoje e do que falta.

## Decisões fixas (entrevista com o dono do projeto, 2026-11-07)

1. Uma vida contínua com três entradas: 10, 14 e 18 anos. Começar antes dá mais tempo ao juro.
2. Loop mensal: todo mês acontece; o jogo só para quando há decisão nova (~60 paradas por partida).
3. Tom: engraçado, com gíria, narrador (a Capivara) que zomba da oferta, não do jogador.
4. Fim: patrimônio aos 30 em reais de hoje + fantasma (a Capivara) que rejoga a mesma vida
   com a mesma sorte.
5. V1: cartão (rotativo, mínimo, fatura parcelada, teto de 100%), parcelamento, investimentos
   (poupança/Tesouro Selic/CDB com palpite-antes-de-revelar), carreira (SISU, EAD, técnico, cursinho).
6. pt-BR primeiro, código em inglês, economia e textos em arquivos de dados por país.
7. Open source (MIT + CC BY 4.0). Escolas e modo sala de aula ficam para a v2.

## O que o código faz hoje (v0.1)

- Motor determinístico em `src/engine` com RNG por fluxo (`macro`, `events`, `shocks`,
  `career`, `misc`), o que permite ao fantasma ver exatamente a mesma sorte.
- Um sorteio por mês no fluxo `events`, independente do que está elegível, pela mesma razão.
- Cartão: fatura = compras do ciclo + parcelas no cartão; política integral/mínimo/parcelar;
  rotativo por um ciclo e conversão automática em 12x; teto de 100% sobre `capBase`, que soma
  cada saldo novo que entra em rotativo (leitura ainda não confirmada na norma, ver gaps).
- Investimentos: poupança (0,5% + TR, ou 70% da Selic), Tesouro Selic (custódia acima de R$ 10 mil),
  CDB a 100% do CDI, IR regressivo no resgate, cofrinho a 0%.
- Macro anual: IPCA e Selic real sorteados com reversão à média; índice de preços deflaciona
  o placar; índice de salários reajusta mesada e salários.
- 30 eventos (`src/engine/events.ts`); textos em `content/pt-BR/events.json`.
- Interface mobile-first em Svelte 5, PWA offline, salvamento local, gráfico você × Capivara.
- Cinco capítulos (infância 10-13, ensino médio 14-17, primeiro emprego 18-21, vida adulta
  22-25, rumo aos 30). Cada fronteira abre um cartão de capítulo com o patrimônio no começo e
  no fim, os juros recebidos e pagos no período, a Capivara na mesma idade e o gráfico até ali.
  É também o ponto natural de parar e voltar depois (o jogo salva sozinho).
- Feedback imediato (2026-11-08): a Capivara é simulada no início da partida, não no fim, então
  o painel mostra "Capivara agora" (mesma sorte, mesma idade) o tempo todo; cada escolha abre um
  cartão de resultado com o que mudou (conta, guardado, dívidas, comprometido, bem-estar) e o que
  a Capivara teria escolhido; e uma linha "mês passado" decompõe renda, gastos, parcelas, o que
  foi guardado e os juros nos dois sentidos.
- Estilo de vida (ordem mensal): econômico / normal / folgado multiplica um gasto base de lazer
  (rolê, roupa, transporte) que só existe para quem tem salário (aprendiz ou adulto) e desloca
  em ±5 o ponto para onde o bem-estar converge. Sem isso um aprendiz de 16 anos chegava a
  R$ 35 mil sem fazer nada: só o celular custava algo.
- Cartão aos 16 é garantido: o limite é o menor entre o que está investido (qualquer
  instrumento, não só CDB; cofrinho não vale) e um teto, e o texto diz o teto.
- Black Friday varia o objeto (sete, nunca o mesmo duas vezes seguidas) e vem no máximo a cada
  dois anos.

## Guardrails pedagógicos (da evidência)

- Bruhn et al. (2016): ensinar crédito pode aumentar o uso de crédito caro. Por isso o custo
  aparece sempre em reais, nunca só em %, e crédito nunca é power-up.
- Viés de crescimento exponencial: o jogador dá um palpite antes de ver o montante.
- Efeitos de educação financeira decaem em ~20 meses: partidas curtas e rejogáveis; o fantasma
  é o "reforço".

## Gaps conhecidos (ver `npm run data:check` e o relatório, seção "Still to verify")

- 12 parâmetros `placeholder` e 2 `memory` em `data/br/2026-11.json`.
- Percentual mínimo da fatura e leitura por operação do teto de 100%.
- Custos de SENAI/SENAC/ETEC/cursinho.
- O "e aos 40?" (coda de projeção) e a lista das 3 decisões mais caras ainda não existem.
- Balanceamento: eventos tardios (25-30 anos) são escassos. Os gastos base de lazer
  (`leisureTeenMonthly`, `leisureAdultMonthly`) e os preços da Black Friday são `placeholder`.
