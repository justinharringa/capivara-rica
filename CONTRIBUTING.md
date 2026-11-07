# Contribuindo / Contributing

Português abaixo. English follows.

## Português

Obrigado por querer ajudar. Este é um projeto de educação pública, gratuito e aberto.

**O que mais ajuda agora**

1. **Verificar números.** `npm run data:check` lista os parâmetros ainda `placeholder` ou
   `memory`. Um PR que troca um placeholder por um valor com fonte primária (BCB, IBGE, DIEESE,
   Tesouro, lei no Planalto) e data é a contribuição mais valiosa que existe.
2. **Textos.** As falas da Capivara e os eventos estão em `content/pt-BR/events.json`. Se uma
   frase soa errada, datada ou didática demais, mande a versão melhor.
3. **Eventos novos.** Um evento é uma entrada em `src/engine/events.ts` (lógica) mais um bloco
   em `content/pt-BR/events.json` (texto). O teste `content coverage` garante que os dois batem.
4. **Bugs no motor.** Escreva o teste que falha primeiro (`src/engine/*.test.ts`).

**Regras**

- Todo número da economia vai para `data/br/*.json` com `source` e `status`. Nunca no código.
- O motor (`src/engine`) não importa nada da interface e não usa `Math.random`: só `src/engine/rng.ts`.
- Dinheiro é inteiro em centavos.
- Nada de contas, rastreadores, anúncios, compras ou caixas de recompensa aleatória. O público
  inclui crianças; a estratégia legal do projeto é não coletar nada.
- Mantenha `npm run check`, `npm test`, `npm run build` e `npm run size` verdes.

**Como enviar**

- Abra um PR com uma descrição curta do que muda e por quê.
- Assine seus commits com `git commit -s` (Developer Certificate of Origin). Isso diz que você
  tem o direito de contribuir o que está enviando, sob as licenças do projeto (MIT para código,
  CC BY 4.0 para conteúdo).

## English

Thanks for helping. This is a free, open, public-education project.

**Most useful right now**

1. **Verify numbers.** `npm run data:check` lists the parameters still marked `placeholder` or
   `memory`. Replacing one with a primary-sourced, dated value is the single best PR.
2. **Copy.** The Capivara's lines and the events live in `content/pt-BR/events.json`.
3. **New events.** Logic in `src/engine/events.ts`, text in `content/pt-BR/events.json`; the
   `content coverage` test keeps them in sync.
4. **Engine bugs.** Write the failing test first.

**Rules**

- Every economic number goes in `data/<country>/*.json` with `source` and `status`, never in code.
- The engine imports nothing from the UI and never calls `Math.random`; use `src/engine/rng.ts`.
- Money is integer centavos.
- No accounts, trackers, ads, purchases or randomised rewards. Children play this.
- Keep `npm run check`, `npm test`, `npm run build` and `npm run size` green.

**Submitting**

- Open a PR with a short why.
- Sign your commits with `git commit -s` (DCO). Code is MIT, content is CC BY 4.0, inbound = outbound.
