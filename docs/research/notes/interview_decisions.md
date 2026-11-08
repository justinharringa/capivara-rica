# Interview decisions (from the project owner, 2026-11-07)

These are the owner's answers to a design interview. They are product decisions, not research findings, and the report must treat them as fixed constraints that the research should serve.

## Mission (owner's words, paraphrased)
Free browser game for Brazilian youngsters that teaches compound interest and the good and bad of credit cards, loans and parcelamento. Players start on minimum wage and discover the value of investing in a career. Free to play, public education, Brazil first with possible expansion. A domain name and a GitHub repository are wanted.

## Decisions
1. **Audience**: not only 14-17. The owner wants 10-14 AND 14-18 AND young adults, with the player picking an age.
2. **Age entry model (chosen)**: ONE continuous life (roughly age 10 to 40) with THREE entry points: start at 10 (mesada, cofrinho, lanche vs. saving), 14 (Jovem Aprendiz, first phone, first parcelamento) or 18 (first CLT job, first card, moving out). Same economy throughout; starting earlier literally gives compound interest more time, which is the lesson. Younger phases are shorter and simpler.
3. **Core loop (chosen)**: month-by-month life sim. Each turn is one month: pay arrives, bills and parcelas are due, 1-3 choices, an event may hit. A full run should play in about 15 minutes.
4. **Tone (chosen)**: funny, meme-literate, Brazilian slang, sarcastic narrator. Owner accepts the risk that slang dates fast.
5. **Win state (chosen)**: net worth at a fixed age (30 or 40) plus a "what if" ghost replay of the same run with different choices; replay to beat your own ghost.
6. **V1 must-have mechanics (all four chosen)**:
   - Credit card: rotativo, minimum payment, fatura parcelada, with the real 2024 rule capping total charges at 100% of the original debt.
   - Parcelamento and "à vista vs. 12x" decisions (phones, motos, Black Friday); parcelas stacking up; when "sem juros" is fine.
   - Investing: poupança vs. Tesouro Selic vs. CDB, with a "guess the balance, then reveal" step to attack exponential-growth bias.
   - Career and education: courses, ENEM/SISU, SENAI, dropout, wage jumps; spending money and months now for a higher salary later.
7. **Localization (chosen)**: pt-BR content, English code, i18n-ready from day one; all strings and economic parameters (rates, wages, instruments) in per-country data files.
8. **Build model (chosen)**: open source, public repo, owner + Claude build it; MIT/Apache code, CC BY content; v1 ships to TikTok/Instagram/WhatsApp sharing; teacher guide, classroom mode and BNCC alignment come in v2 after the loop is proven fun.
