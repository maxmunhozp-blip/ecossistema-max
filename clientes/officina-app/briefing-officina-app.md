# Briefing — Officina App

Documento de contexto para uso com Claude Web. Leia tudo antes de qualquer resposta.

---

## O QUE É O OFFICINA APP

Marketplace automotivo que conecta motoristas a oficinas verificadas em São Paulo.

**Proposta de valor:** Transparência no orçamento antes de deixar o carro, oficinas com CNPJ ativo e histórico verificado, avaliações reais focadas em tempo de entrega e clareza no orçamento.

**Diferenciais:**
- Orçamento no celular antes de qualquer serviço começar
- Só lista oficinas que passaram por verificação (endereço real, CNPJ ativo, histórico)
- Mais de 500 oficinas verificadas em São Paulo
- Download gratuito

---

## IDENTIDADE VISUAL

| Elemento | Valor |
|----------|-------|
| Cor primária | `#3DA9A5` (teal) |
| Cor acento | `#F5A623` (amber) |
| Fundo claro | `#F0F7F7` |
| Superfície | `#FFFFFF` |
| Texto principal | `#1A2424` |
| Texto suave | `#6A8888` |
| Fonte | Inter (todos os pesos) |

**Estilo visual:** clean, confiante, profissional — como um app de saúde premium. Sem emojis. Sem ícones coloridos. Ícones só em teal ou texto suave.

---

## PÚBLICO-ALVO

**Motorista urbano de SP**, 28–50 anos, que já foi surpreendido por cobrança inesperada em oficina ou não sabe em quem confiar para levar o carro.

**Dores principais:**
- Não sabe se a oficina é confiável
- Medo de ser enganado no orçamento
- Já ficou na mão no meio da rua por não fazer revisão preventiva
- Perde tempo ligando para várias oficinas

**Desejos:**
- Resolver rápido, sem sair de casa para pesquisar
- Saber o preço antes de decidir
- Confiar que a oficina é real e verificada

---

## PERSONAS DE FUNCIONÁRIOS (chats internos)

### Lucas Lobato — Estratégico de Conteúdo
- Pragmático, direto, levemente seco, confiante
- Fala como profissional jovem no WhatsApp
- Sem ponto final, sem travessão, usa "vc", "tb", "pq", "show", "bora"
- Respostas curtas (1–2 frases)
- Nunca começa com "Olá", "Certo", "Entendido", "Perfeito"

### Juliana Costa — Redatora
- Criativa, animada com leveza, foco em qualidade de texto
- Usa "gente", "olha", "vc", "né", "tá bom"
- Sem exagero — nada de !! ou emojis

### Rafael Mota — Designer
- Técnico mas acessível, linguagem visual
- Usa "cara", "olha", "tipo", "dá pra fazer"
- Fala de design sem jargão

---

## CONTEÚDO DE REDES SOCIAIS — OS 5 CARROSSÉIS

Cada carrossel tem slides de 1080×1440px (Instagram portrait 3:4).

### Post 1 — "Como escolher a oficina certa" (5 slides)
Conceito: linha horizontal teal, tipografia grande, muito espaço negativo.
- S1 (capa): fundo branco, título grande, badge teal "Dica Officina App"
- S2: fundo teal, número "01" amber, "Verifique as avaliações — mas as certas"
- S3: fundo branco, "02", orçamento antes de deixar o carro
- S4: fundo #F0F7F7, "03", histórico verificado
- S5 (CTA): fundo teal, "Encontre uma oficina confiável agora", CTA amber

### Post 2 — "5 sinais que seu carro precisa de revisão" (6 slides)
Conceito: numeração grande como elemento gráfico, contraste alto.
- S1 (capa): fundo branco, tag amber "Revisão preventiva"
- S2–S5: um sinal por slide (barulho novo, freio mole, luz no painel, consumo subindo)
- S6 (CTA): fundo amber, texto escuro, CTA teal

### Post 3 — "Depoimento: Eduardo resolveu em 1 hora" (4 slides)
Conceito: estilo editorial, aspas grandes, depoimento real.
- S1 (capa): fundo teal, "De 3 dias de incerteza para 1 hora de solução"
- S2: depoimento de Eduardo Faria, 38 anos
- S3: comparativo R$280 (pagou) vs R$480 (concorrente)
- S4 (CTA): fundo branco, border teal

### Post 4 — "Officina App em 3 passos" (3 slides)
Conceito: clean, passo a passo numerado.
- S1: fundo teal, "Resolveu em 3 passos"
- S2: fundo branco, 3 cards com border teal esquerda
- S3 (CTA): fundo branco, logo "O" teal, CTA amber

### Post 5 — "Por que revisão preventiva vale a pena" (5 slides)
Conceito: dados e números, infográfico clean.
- S1 (capa): fundo branco, tag "Saúde do seu carro"
- S2: fundo teal, "3x" grande (custo corretivo vs preventivo)
- S3: fundo branco, tabela de preços de revisão preventiva
- S4: fundo #F0F7F7, "regra dos 10.000km"
- S5 (CTA): fundo teal, CTA amber

---

## ARQUIVOS DO PROJETO

| Arquivo | Descrição |
|---------|-----------|
| `carrosseis-officina.html` | 5 carrosséis prontos, grid de preview + modal de visualização |
| `persona-profunda.html` | Dashboard completo — abas: Redes Sociais, Gerador de Imagem, Chat Lucas Lobato, Chat BB |
| `logo-teal.png` | Logo para fundos claros |
| `logo-amber.png` | Logo para fundos escuros |
| `logo-black.png` | Logo preta |

---

## REGRAS DE COMPORTAMENTO AO TRABALHAR NESTE PROJETO

1. **Só altere o que foi pedido** — sem melhorias não solicitadas, sem refatorações, sem "aproveitei e ajustei também"
2. **Pergunte antes de qualquer decisão de design** — nunca decida cor, tamanho, posição por conta própria
3. **Alterações no carrossel** são pontuais — um slide, um elemento, uma cor
4. **Linguagem dos funcionários**: informal, sem ponto final, sem travessão, sem robôs
5. **Zero emojis** em qualquer interface ou conteúdo

---

## SISTEMA DE DEPLOY

- Repositório: `github.com/maxmunhozp-blip/ecossistema-max`
- VPS: `76.13.172.151` (nginx serve `/opt/ecosistema-max/`)
- Ajustes via chat → GitHub Actions → Claude Code no VPS → git push → sync nginx
- Notificação de resultado via Telegram
