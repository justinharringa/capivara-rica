# Capivara Rica

**Uma vida inteira em 15 minutos.** Jogo gratuito, no navegador, que ensina juros compostos,
cartão de crédito, parcelamento e o valor de investir numa carreira, com os números reais do
Brasil. Para quem tem de 10 a 25 anos, e para quem ensina.

- Escolha começar aos **10, 14 ou 18 anos** e jogue a mesma vida até os 30, mês a mês.
- Cada mês acontece: entra mesada ou salário, vencem parcelas e fatura, suas ordens mensais
  guardam dinheiro. O jogo só para quando há uma decisão nova.
- O cartão funciona como a lei manda em 2026: rotativo a ~15% ao mês, parcelamento da fatura,
  e o **teto legal de 100% da dívida original** (Lei 14.690/2023).
- Poupança, Tesouro Selic e CDB rendem com as taxas de hoje, com imposto regressivo e taxa de
  custódia. Antes de ver quanto rendeu, você dá um palpite.
- No fim, a **Capivara joga a mesma vida com a mesma sorte** e outras escolhas. A diferença foi
  escolha, não azar.
- Sem conta, sem anúncios, sem rastreio. Nada sai do seu aparelho. Funciona offline.

> Protótipo v0.1. Vários números ainda são **placeholders** marcados no arquivo de dados.
> Veja [docs/research](docs/research/) e `npm run data:check`.

## Jogar

**https://capivararica.com.br** (Cloudflare Workers; `capivarica.com.br` redireciona para lá).
Localmente: `npm install && npm run dev`.

## Desenvolver

```
npm install
npm run dev          # servidor local
npm test             # testes do motor (vitest)
npm run check        # svelte-check / TypeScript
npm run data:check   # proveniência dos parâmetros econômicos
npm run build        # build estático em dist/
npm run size         # orçamento de tamanho (200 KB gzip de JS+CSS, 500 KB total)
```

Node 22 (`.nvmrc`). Sem back-end: o build é um site estático e um PWA, publicado como
Cloudflare Workers static assets (`wrangler.jsonc`) por `.github/workflows/deploy.yml`.
Configurações de zona e o redirecionamento do domínio de digitação errada são Terraform em
`infrastructure/terraform/cloudflare/` (veja o README de lá para o bootstrap único).

### Estrutura

```
src/engine/     motor do jogo: TypeScript puro, determinístico, em centavos inteiros, testado
src/ui/         interface em Svelte 5
src/lib/        store reativo, conteúdo, salvamento local
content/pt-BR/  todos os textos: eventos, falas da Capivara, interface
data/br/        parâmetros econômicos com proveniência (valor, unidade, data, fonte, status)
docs/           design, privacidade, roadmap e a pesquisa que embasou o jogo
scripts/        verificações de CI (dados, tamanho) e o recorte dos sprites
infrastructure/ Terraform do Cloudflare (configurações de zona, redirecionamento)
```

### Dados com proveniência

Todo número da economia vive em `data/br/2026-11.json` com `value`, `unit`, `asOf`, `source` e
`status` (`verified` | `secondary` | `memory` | `placeholder`). `npm run data:check --release`
recusa um release enquanto houver parâmetro `memory` ou `placeholder`. Atualizar o salário
mínimo ou a Selic é um PR nos dados, não no código.

## Contribuir

Leia [CONTRIBUTING.md](CONTRIBUTING.md). Issues e PRs em português ou inglês são bem-vindos.
Textos do jogo, novos eventos e traduções são tão importantes quanto código.

## Licenças

- Código: [MIT](LICENSE).
- Conteúdo (textos, eventos, arte original, documentação, pesquisa): [CC BY 4.0](LICENSE-CONTENT.md).

---

## English

**A whole life in 15 minutes.** A free browser game that teaches compound interest, credit
cards, instalment buying ("parcelamento") and the value of investing in a career, using real
Brazilian numbers. Brazil first; the economy and every string live in per-country data files so
another country is a data job, not a rewrite.

Start at 10, 14 or 18 and play the same life to 30, month by month. The credit card follows the
2024 law that caps interest at 100% of the original debt. Savings instruments pay today's rates.
At the end, a ghost (the Capivara) replays your exact life with the same luck and calmer choices.

No accounts, no ads, no tracking, works offline. Code MIT, content CC BY 4.0. The research the
design rests on is in [docs/research](docs/research/).
