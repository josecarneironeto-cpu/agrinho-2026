# 🌱 Agrinho 2026 — Agro Forte, Futuro Sustentável

> **Categoria:** Programação Front-End — HTML, CSS e JavaScript puro  
> **Tema:** *"Agro forte, futuro sustentável: equilíbrio entre produção e meio ambiente"*  
> **Concurso:** Agrinho 2026 — SENAR/PR

---

## 📋 Sobre o Projeto

Este site apresenta de forma interativa e visualmente impactante como a tecnologia e a preservação ambiental podem — e devem — caminhar juntas no agronegócio brasileiro. O projeto explora desafios reais da agricultura, apresenta soluções tecnológicas inovadoras e engaja o visitante com experiências interativas educativas.

---

## 🛠️ Tecnologias Utilizadas

| Tecnologia | Uso |
|---|---|
| **HTML5** | Estrutura semântica completa (`<section>`, `<article>`, `<nav>`, `<header>`, `<footer>`) |
| **CSS3** | Design system com Custom Properties, Grid, Flexbox, animações, media queries |
| **JavaScript ES6+** | Toda interatividade — sem frameworks, sem bibliotecas externas |
| **Canvas API** | Sistema de partículas animadas (hero e CTA) |
| **IntersectionObserver API** | Scroll reveal, ativação de contadores e timeline |
| **Google Fonts** | Tipografia: Cormorant Garamond + Exo 2 |

---

## ✨ Funcionalidades Implementadas

### 🎨 Design & Animações
- Sistema de design com **20+ variáveis CSS** (cores, fontes, espaçamentos, sombras)
- **Glassmorphism** nos cartões de hero e navbar
- **Efeitos parallax** e glow nos elementos de destaque
- **Scroll Reveal** animado via `IntersectionObserver`
- **Elementos flutuantes** (floating keyframes) na seção CTA
- Scrollbar customizada e seleção de texto estilizada

### 🖥️ Interatividade JavaScript
1. **Sistema de Partículas (Canvas)** — rede animada de pontos conectados com linhas
2. **Navbar dinâmica** — fundo blur ao scroll, link ativo por seção visível
3. **Menu mobile** — hamburger com animação de abertura/fechamento
4. **Contadores animados** — números do 0 ao alvo com easing `easeOutExpo`
5. **Cards 3D Flip** — rotação 3D (CSS + JS class toggle) para revelar detalhes
6. **Simulador de Fazenda** — cálculo dinâmico de sustentabilidade (0–100 pts)
7. **Medidor SVG animado** — círculo de progresso com `stroke-dashoffset`
8. **Galeria + Lightbox** — visualização ampliada com navegação por teclado
9. **Quiz interativo** — 5 perguntas, pontuação, feedback imediato, tela de resultado
10. **Scroll suave** com offset correto do navbar fixo

### ♿ Acessibilidade
- Atributos `aria-label`, `aria-hidden`, `aria-expanded`, `aria-live`, `aria-modal`
- Navegação completa por teclado (Tab, Escape, setas no lightbox)
- `role` semânticos em listas, dialogs e grupos de controle
- Suporte a `prefers-reduced-motion`
- Estados de foco visíveis (`:focus-visible`)

### 📱 Responsividade
- **Desktop** (>1024px): layout multi-colunas completo
- **Tablet** (≤1024px): grid adaptado, simulador empilhado
- **Mobile** (≤768px): menu hamburger, timeline vertical, quiz de coluna única
- **Mobile pequeno** (≤480px): botões e galeria em coluna única

---

## 🗂️ Estrutura de Pastas

```
agrinho2026/
├── index.html          ← Estrutura HTML semântica completa
├── css/
│   └── style.css       ← Design system + estilos + media queries
├── js/
│   └── script.js       ← Toda a lógica interativa (11 módulos)
├── assets/
│   ├── images/         ← (reservado para imagens futuras)
│   └── icons/          ← (reservado para ícones futuros)
└── README.md           ← Esta documentação
```

---

## 🚀 Como Executar

### Localmente
1. Clone ou baixe o repositório
2. Abra `index.html` diretamente no navegador  
   *(não é necessário servidor local — é HTML/CSS/JS puro)*

### GitHub Pages
1. Faça upload de todos os arquivos para um repositório público no GitHub
2. Acesse **Settings → Pages → Branch: main → / (root)**
3. Aguarde a publicação e acesse a URL gerada

---

## 📐 Arquitetura do JavaScript (`script.js`)

O arquivo JS é organizado em **11 módulos funcionais**:

```
01. Particle        — Classe da partícula (Canvas)
02. initParticles   — Sistema de partículas hero
03. initNavbar      — Scroll + menu mobile + link ativo
04. initScrollReveal — IntersectionObserver para fade-in
05. initCounters    — Contadores animados com easing
06. initSolutionCards — Flip 3D dos cards de solução
07. initSimulator   — Cálculo de sustentabilidade em tempo real
08. initTimeline    — Animação extra dos pontos da timeline
09. initGallery     — Lightbox com navegação por teclado
10. initQuiz        — Quiz completo: render, resposta, score, resultado
11. initCtaParticles — Partículas sutis da seção CTA
```

---

## 🌿 Conteúdo e Tema

### O Problema
- 70% da água doce mundial usada na agricultura
- 5 milhões de hectares queimados por ano no Brasil
- 12 milhões de hectares desmatados globalmente por ano
- 25% das emissões globais de GEE pelo setor agropecuário

### As Soluções Apresentadas
| Tecnologia | Benefício Principal |
|---|---|
| Irrigação Inteligente | Economia de 50% de água |
| Drones Agrícolas | Redução de 70% de agrotóxicos |
| Energia Solar Rural | Redução de 80% nos custos de energia |
| Sensores IoT | Monitoramento 24/7 em tempo real |
| Reflorestamento/SAF | Sequestro de carbono + renda extra |
| Agricultura de Precisão | Redução de 30% nos custos totais |

---

## 📚 Referências

- [Embrapa — Empresa Brasileira de Pesquisa Agropecuária](https://www.embrapa.br)
- [CNA Brasil — Confederação da Agricultura e Pecuária](https://www.cnabrasil.org.br)
- [FAO Brasil — Organização das Nações Unidas para Alimentação](https://www.fao.org/brasil)
- [Imaflora — Instituto de Manejo e Certificação Florestal](https://www.imaflora.org)
- [SEAB Paraná — Secretaria de Agricultura e Abastecimento](https://www.seab.pr.gov.br)

---


## 📄 Conformidade com o Edital

| Requisito do Edital | Status |
|---|---|
| Apenas HTML, CSS e JavaScript puro | ✅ |
| Sem frameworks (Bootstrap, React, etc.) | ✅ |
| Sem CSS inline / JS inline | ✅ |
| Arquivos separados (html / css / js) | ✅ |
| Código organizado e comentado | ✅ |
| Responsividade completa | ✅ |
| Manipulação do DOM com JavaScript | ✅ |
| Uso de variáveis JavaScript | ✅ |
| Media Queries | ✅ |
| Sem erros no console | ✅ |
| Funciona no GitHub Pages | ✅ |

---

*Agrinho 2026 — Programação Front-End — Paraná*
