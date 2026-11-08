# Roadmap

## v0.1 (este repositório)
- [x] Motor determinístico, testado, com teto legal do cartão e IR nos investimentos
- [x] Três entradas (10/14/18), loop mensal, ~60 paradas, fantasma, palpite-antes-de-revelar
- [x] PWA offline, sem coleta de dados, orçamento de tamanho em CI

## v0.2: números e balanceamento
- [x] Mover os multiplicadores de reserva (2× Black Friday, 1,5× moto) para parâmetros nomeados
- [x] Capítulos com cartão de balanço; Capivara visível desde o início; resultado de cada escolha; linha "mês passado"
- [x] Estilo de vida (gasto de lazer) para quem tem salário; cartão aos 16 honesto sobre o teto
- [ ] Verificar os gastos de lazer por idade (POF/IBGE) e os preços da Black Friday
- [ ] Zerar `placeholder`/`memory` em `data/br/2026-11.json` (P0 do relatório: mínimo da fatura,
      IOF, taxas de setembro/2026 no BCB, Pix vs 12x real, Tesouro Selic, poupança/TR)
- [ ] Custos de curso técnico/cursinho; renda por escolaridade (IBGE SIDRA)
- [x] Black Friday a cada 2 anos, com objeto diferente a cada vez
- [x] ℹ️ em cada indicador e ordem mensal; "Mover dinheiro" (depósito e resgate com o IR na frente)
- [x] Partidas salvas sobrevivem a atualizações (`src/engine/migrate.ts`, fixtures por versão)
- [x] "Guardar do que sobra" vai até 100% (o limite de 60% era arbitrário)
- [ ] Mais eventos para 25-30 anos; variar a Capivara por idade
- [ ] Coda "e aos 40?" com palpite; as 3 decisões que mais custaram, comparadas ao fantasma
- [ ] Cartão de resultado em PNG para compartilhar (Web Share API)

## v0.3: forma
- [ ] Arte da Capivara por ilustrador(a) (CC BY), expressões e acessórios por patrimônio
- [ ] Som opcional, animação do "tique" mensal
- [ ] Acessibilidade WCAG 2.2 AA auditada (axe), Lighthouse CI

## v1.0: lançamento
- [x] Domínio, Cloudflare Workers static assets (`wrangler.jsonc` + Terraform em `infrastructure/terraform/cloudflare/`), política de privacidade publicada
- [ ] Revisão jurídica rápida (ECA Digital, LGPD art. 14) do fluxo final
- [ ] Teste com 10 jogadores de 12 a 20 anos; medir tempo de partida e compreensão

## v2: escolas
- [ ] Modo sala de aula sem login, guia do professor, fichas de reflexão, códigos BNCC
- [ ] Cadastro na Plataforma MEC RED com licença explícita
- [ ] Zip offline do build para laboratório sem internet

## Depois
- [ ] `data/mx`, `data/pt`: segundo país como teste da arquitetura de dados
