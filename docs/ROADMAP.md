# Roadmap

## v0.1 (este repositório)
- [x] Motor determinístico, testado, com teto legal do cartão e IR nos investimentos
- [x] Três entradas (10/14/18), loop mensal, ~60 paradas, fantasma, palpite-antes-de-revelar
- [x] PWA offline, sem coleta de dados, orçamento de tamanho em CI

## v0.2: números e balanceamento (concluída em 2026-11-08)
- [x] Mover os multiplicadores de reserva (2× Black Friday, 1,5× moto) para parâmetros nomeados
- [x] Capítulos com cartão de balanço; Capivara visível desde o início; resultado de cada escolha; linha "mês passado"
- [x] Estilo de vida (gasto de lazer) para quem tem salário; cartão aos 16 honesto sobre o teto
- [x] Verificar os gastos de lazer por idade e os preços da Black Friday (`docs/research/notes/verification-2026-11/`)
- [x] Zerar `placeholder`/`memory` em `data/br/2026-11.json`: 107 parâmetros, 20 `verified`, 87 `secondary`,
      taxas do BCB de setembro/2026, Selic do Copom de novembro/2026, Focus de novembro/2026
      (`npm run data:check -- --release` passa)
- [x] Custos de curso técnico/cursinho; salários por CAGED 2026 (os pisos legais ficam nas notas)
- [x] Black Friday a cada 2 anos, com objeto diferente a cada vez
- [x] ℹ️ em cada indicador e ordem mensal; "Mover dinheiro" (depósito e resgate com o IR na frente)
- [x] Partidas salvas sobrevivem a atualizações (`src/engine/migrate.ts`, fixtures por versão)
- [x] "Guardar do que sobra" vai até 100% (o limite de 60% era arbitrário)
- [x] Mais eventos para 22-30 anos: demissão (FGTS + multa + seguro-desemprego), filho, carro usado,
      morar junto, plano de saúde, viagem, curso de inglês
- [x] Coda "e aos 40?" com palpite; as 3 decisões que mais custaram, recontadas com a escolha da
      Capivara naquele único momento (`src/engine/review.ts`)
- [x] Cartão de resultado em PNG para compartilhar (Web Share API, com download como alternativa)
- [x] Variar a Capivara por idade: criança até os 14 (`public/capi/child/`); adolescente ainda usa a arte adulta (falta a folha)
- [ ] Verificar o que ficou `secondary` fraco: cursinho, preço do casamento civil, prêmio do inglês
      (Catho 2017), teto do seguro-desemprego 2026

## v0.3: forma
- [ ] Arte da Capivara por ilustrador(a) (CC BY), expressões e acessórios por patrimônio e por idade
- [ ] Som opcional, animação do "tique" mensal
- [ ] Acessibilidade WCAG 2.2 AA auditada (axe), Lighthouse CI

## v1.0: lançamento
- [x] Domínio, Cloudflare Workers static assets (`wrangler.jsonc` + Terraform em `infrastructure/terraform/cloudflare/`), política de privacidade publicada
- [x] Endereço de contato `contato@capivararica.com.br` (Cloudflare Email Routing, Terraform) nos rodapés, na privacidade, em SECURITY e no código de conduta
- [ ] Revisão jurídica rápida (ECA Digital, LGPD art. 14) do fluxo final
- [ ] Teste com 10 jogadores de 12 a 20 anos; medir tempo de partida e compreensão

## v2: escolas
- [ ] Modo sala de aula sem login, guia do professor, fichas de reflexão, códigos BNCC
- [ ] Cadastro na Plataforma MEC RED com licença explícita
- [ ] Zip offline do build para laboratório sem internet

## Depois
- [ ] `data/mx`, `data/pt`: segundo país como teste da arquitetura de dados
