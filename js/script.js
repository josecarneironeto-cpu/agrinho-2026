/**
 * ================================================================
 *  AGRINHO 2026 — Agro Forte, Futuro Sustentável
 *  Arquivo : js/script.js
 *  Descrição: Lógica interativa completa do site
 *
 *  Módulos:
 *   1.  Partículas (canvas hero)
 *   2.  Navbar (scroll + menu mobile)
 *   3.  Scroll Reveal (IntersectionObserver)
 *   4.  Contadores animados
 *   5.  Cards de solução (flip)
 *   6.  Simulador "Monte sua fazenda"
 *   7.  Timeline
 *   8.  Galeria + Lightbox
 *   9.  Quiz interativo
 *  10.  Partículas CTA
 *  11.  Inicialização geral
 * ================================================================
 */

'use strict';

/* ================================================================
   01. SISTEMA DE PARTÍCULAS — Canvas Hero
   Cria uma rede animada de pontos conectados no fundo do hero.
================================================================ */

/**
 * Representa uma única partícula no canvas.
 */
class Particle {
    /**
     * @param {HTMLCanvasElement} canvas
     */
    constructor(canvas) {
        this.canvas = canvas;
        this.reset();
    }

    /** Inicializa (ou reinicia) a posição e comportamento da partícula. */
    reset() {
        this.x       = Math.random() * this.canvas.width;
        this.y       = Math.random() * this.canvas.height;
        this.size    = Math.random() * 2 + 0.8;
        this.speedX  = (Math.random() - 0.5) * 0.6;
        this.speedY  = (Math.random() - 0.5) * 0.6;
        this.opacity = Math.random() * 0.55 + 0.15;
        // Alterna entre verde e teal para variedade visual
        this.color   = Math.random() > 0.6
            ? `rgba(0, 201, 212, ${this.opacity})`
            : `rgba(0, 232, 125, ${this.opacity})`;
    }

    /** Atualiza a posição a cada frame. Rebate nas bordas. */
    update() {
        this.x += this.speedX;
        this.y += this.speedY;

        // Rebate nas bordas do canvas
        if (this.x < 0 || this.x > this.canvas.width)  this.speedX *= -1;
        if (this.y < 0 || this.y > this.canvas.height) this.speedY *= -1;

        // Mantém dentro dos limites
        this.x = Math.max(0, Math.min(this.canvas.width,  this.x));
        this.y = Math.max(0, Math.min(this.canvas.height, this.y));
    }

    /**
     * Desenha a partícula no contexto 2D.
     * @param {CanvasRenderingContext2D} ctx
     */
    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
    }
}

/**
 * Inicializa o sistema de partículas no canvas do hero.
 * Cria partículas, anima e conecta as próximas com linhas.
 */
function initParticles() {
    const canvas = document.getElementById('particles-canvas');
    if (!canvas) return;

    const ctx        = canvas.getContext('2d');
    const MAX_DIST   = 130;     // distância máxima para conectar partículas
    let   particles  = [];
    let   animId     = null;
    let   mouse      = { x: -9999, y: -9999 }; // posição do mouse (fora por padrão)

    /** Calcula quantas partículas usar com base no tamanho da tela. */
    function getParticleCount() {
        const area = canvas.width * canvas.height;
        // ~1 partícula a cada 18.000px² — reduz em telas pequenas
        return Math.min(Math.floor(area / 18000), 90);
    }

    /** Ajusta o canvas ao tamanho da janela e recria partículas. */
    function resize() {
        canvas.width  = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        createParticles();
    }

    /** Cria (ou recria) o array de partículas. */
    function createParticles() {
        particles = [];
        const count = getParticleCount();
        for (let i = 0; i < count; i++) {
            particles.push(new Particle(canvas));
        }
    }

    /**
     * Desenha linhas entre partículas próximas.
     * A opacidade diminui proporcionalmente à distância.
     */
    function connectParticles() {
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx   = particles[i].x - particles[j].x;
                const dy   = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < MAX_DIST) {
                    const alpha = 1 - dist / MAX_DIST;
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(0, 232, 125, ${alpha * 0.18})`;
                    ctx.lineWidth   = 0.8;
                    ctx.stroke();
                }
            }
        }
    }

    /**
     * Loop principal de animação.
     * Limpa o canvas, atualiza e redesenha todas as partículas.
     */
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        particles.forEach(function(p) {
            p.update();
            p.draw(ctx);
        });

        connectParticles();
        animId = requestAnimationFrame(animate);
    }

    // Rastreia posição do mouse para interações futuras
    canvas.addEventListener('mousemove', function(e) {
        const rect = canvas.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
    });

    canvas.addEventListener('mouseleave', function() {
        mouse.x = -9999;
        mouse.y = -9999;
    });

    // Redimensiona quando a janela mudar
    window.addEventListener('resize', function() {
        cancelAnimationFrame(animId);
        resize();
        animate();
    });

    // Inicia
    resize();
    animate();
}

/* ================================================================
   02. NAVBAR — Scroll + Menu Mobile
================================================================ */

/**
 * Controla o comportamento da barra de navegação:
 * - Adiciona classe "scrolled" ao rolar (fundo escuro + blur)
 * - Abre/fecha menu mobile (hamburger)
 * - Fecha menu ao clicar em um link
 * - Marca link ativo conforme seção visível
 */
function initNavbar() {
    const navbar      = document.getElementById('navbar');
    const hamburger   = document.getElementById('hamburger');
    const navLinks    = document.getElementById('nav-links');
    const allNavLinks = document.querySelectorAll('.nav-link');

    if (!navbar) return;

    /* --- Scroll: fundo translúcido --- */
    function onScroll() {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        highlightActiveLink();
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // checa posição inicial

    /* --- Menu Mobile --- */
    if (hamburger && navLinks) {
        hamburger.addEventListener('click', function() {
            const isOpen = navLinks.classList.toggle('is-open');
            hamburger.classList.toggle('is-open', isOpen);
            hamburger.setAttribute('aria-expanded', String(isOpen));
            // Bloqueia scroll da página quando menu aberto
            document.body.style.overflow = isOpen ? 'hidden' : '';
        });

        // Fecha o menu ao clicar em qualquer link
        allNavLinks.forEach(function(link) {
            link.addEventListener('click', function() {
                navLinks.classList.remove('is-open');
                hamburger.classList.remove('is-open');
                hamburger.setAttribute('aria-expanded', 'false');
                document.body.style.overflow = '';
            });
        });

        // Fecha o menu ao clicar fora dele
        document.addEventListener('click', function(e) {
            if (!navbar.contains(e.target) && navLinks.classList.contains('is-open')) {
                navLinks.classList.remove('is-open');
                hamburger.classList.remove('is-open');
                hamburger.setAttribute('aria-expanded', 'false');
                document.body.style.overflow = '';
            }
        });
    }

    /* --- Link Ativo por Seção --- */
    function highlightActiveLink() {
        const sections    = document.querySelectorAll('section[id]');
        const scrollMid   = window.scrollY + window.innerHeight / 2;

        sections.forEach(function(section) {
            const top    = section.offsetTop;
            const bottom = top + section.offsetHeight;

            if (scrollMid >= top && scrollMid < bottom) {
                allNavLinks.forEach(function(link) {
                    link.classList.toggle(
                        'active',
                        link.getAttribute('data-section') === section.id
                    );
                });
            }
        });
    }
}

/* ================================================================
   03. SCROLL REVEAL — IntersectionObserver
   Observa elementos com [data-reveal] e adiciona 'is-visible'
   quando entram na viewport para disparar animações CSS.
================================================================ */

function initScrollReveal() {
    // Verifica suporte ao IntersectionObserver
    if (!('IntersectionObserver' in window)) {
        // Fallback: mostra tudo imediatamente
        document.querySelectorAll('[data-reveal]').forEach(function(el) {
            el.classList.add('is-visible');
        });
        return;
    }

    const observer = new IntersectionObserver(
        function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    // Para de observar após animar (melhora performance)
                    observer.unobserve(entry.target);

                    // Se for item da timeline, anima o ponto também
                    if (entry.target.classList.contains('timeline-item')) {
                        entry.target.classList.add('is-visible');
                    }
                }
            });
        },
        {
            threshold:  0.12,   // 12% do elemento visível para disparar
            rootMargin: '0px 0px -60px 0px' // dispara um pouco antes do fim
        }
    );

    document.querySelectorAll('[data-reveal]').forEach(function(el) {
        observer.observe(el);
    });
}

/* ================================================================
   04. CONTADORES ANIMADOS
   Anima números do 0 até o valor alvo (data-target) com easing.
================================================================ */

/**
 * Anima um único elemento contador do 0 até data-target.
 * @param {HTMLElement} el  — elemento span com data-target
 */
function animateCounter(el) {
    const target   = parseInt(el.getAttribute('data-target'), 10);
    const duration = 1800; // ms
    const start    = performance.now();

    /**
     * Função de easing: desacelera no final.
     * @param {number} t — progresso [0, 1]
     */
    function easeOutExpo(t) {
        return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
    }

    function step(now) {
        const elapsed  = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const value    = Math.round(easeOutExpo(progress) * target);

        el.textContent = value.toLocaleString('pt-BR');

        if (progress < 1) {
            requestAnimationFrame(step);
        } else {
            el.textContent = target.toLocaleString('pt-BR');
        }
    }

    requestAnimationFrame(step);
}

/**
 * Observa os contadores e dispara a animação quando visíveis.
 * Inclui tanto os counters da seção #sobre quanto os do hero.
 */
function initCounters() {
    // Contadores da seção "O Problema" (.counter)
    const sectionCounters = document.querySelectorAll('.counter[data-target]');

    if ('IntersectionObserver' in window) {
        const counterObserver = new IntersectionObserver(
            function(entries) {
                entries.forEach(function(entry) {
                    if (entry.isIntersecting) {
                        animateCounter(entry.target);
                        counterObserver.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.5 }
        );

        sectionCounters.forEach(function(el) {
            counterObserver.observe(el);
        });
    } else {
        // Fallback sem IntersectionObserver
        sectionCounters.forEach(animateCounter);
    }

    // Contadores do hero (.stat-number com data-count)
    // Disparam após um pequeno delay na abertura da página
    const heroCounters = document.querySelectorAll('.stat-number[data-count]');
    heroCounters.forEach(function(el) {
        const target   = parseInt(el.getAttribute('data-count'), 10);
        const duration = 2000;
        const startAt  = performance.now();

        function easeOutExpo(t) {
            return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
        }

        // Pequeno delay para o hero carregar primeiro
        setTimeout(function() {
            function step(now) {
                const progress = Math.min((now - startAt) / duration, 1);
                el.textContent = Math.round(easeOutExpo(progress) * target)
                                     .toLocaleString('pt-BR');
                if (progress < 1) requestAnimationFrame(step);
                else el.textContent = target.toLocaleString('pt-BR');
            }
            requestAnimationFrame(step);
        }, 600);
    });
}

/* ================================================================
   05. CARDS DE SOLUÇÃO — Flip 3D
   Alterna entre frente e verso ao clicar no botão "Ver detalhes".
================================================================ */

function initSolutionCards() {
    const cards = document.querySelectorAll('.solution-card');

    cards.forEach(function(card) {
        // Botão da frente: abre o verso
        const btnExpand = card.querySelector('.btn-expand:not(.btn-back)');
        // Botão do verso: volta à frente
        const btnBack   = card.querySelector('.btn-back');

        if (btnExpand) {
            btnExpand.addEventListener('click', function() {
                card.classList.add('is-flipped');
                // Atualiza acessibilidade
                const backEl = card.querySelector('.solution-card-back');
                if (backEl) backEl.removeAttribute('aria-hidden');
            });
        }

        if (btnBack) {
            btnBack.addEventListener('click', function() {
                card.classList.remove('is-flipped');
                const backEl = card.querySelector('.solution-card-back');
                if (backEl) backEl.setAttribute('aria-hidden', 'true');
            });
        }

        // Permite fechar com Escape
        card.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && card.classList.contains('is-flipped')) {
                card.classList.remove('is-flipped');
            }
        });
    });
}

/* ================================================================
   06. SIMULADOR — "Monte sua Fazenda Sustentável"
   Calcula o índice de sustentabilidade (0–100) a partir das
   escolhas do usuário e atualiza o DOM em tempo real.
================================================================ */

/**
 * Tabela de pontuações do simulador.
 * Cada categoria tem um peso no total de 100 pontos.
 *
 * Energia    : max 30 pts
 * Irrigação  : max 30 pts
 * Floresta   : max 20 pts
 * Poluição   : max 20 pts
 */
var SIMULATOR_SCORES = {
    energia: {
        solar:    30,
        eolica:   25,
        rede:     10,
        fossil:    0
    },
    irrigacao: {
        gotejamento: 30,
        aspersao:    20,
        manual:      15,
        inundacao:    5
    }
};

/** Textos de feedback conforme a pontuação total. */
var SIMULATOR_MESSAGES = [
    {
        min: 0,  max: 30,
        label: '🔴 Crítico',
        color: '#f87171',
        msg:   'Sua fazenda tem grande impacto ambiental. Considere fontes de energia limpa e irrigação eficiente para começar a mudança!'
    },
    {
        min: 31, max: 55,
        label: '🟡 Em desenvolvimento',
        color: '#fbbf24',
        msg:   'Você está no caminho certo, mas há muito espaço para melhorar. Adote mais práticas sustentáveis e veja a diferença!'
    },
    {
        min: 56, max: 75,
        label: '🟢 Sustentável',
        color: '#34d399',
        msg:   'Boa fazenda! Você já equilibra produção e preservação. Plante mais árvores e reduza ainda mais a poluição para chegar ao topo!'
    },
    {
        min: 76, max: 90,
        label: '💚 Muito sustentável',
        color: '#00e87d',
        msg:   'Excelente! Sua fazenda é referência em sustentabilidade. Poucos detalhes separam você da perfeição.'
    },
    {
        min: 91, max: 100,
        label: '🌟 Fazenda do Futuro!',
        color: '#00c9d4',
        msg:   'Perfeito! Sua fazenda é 100% sustentável. Você atingiu o equilíbrio ideal entre produção agrícola e preservação ambiental!'
    }
];

/**
 * Retorna a mensagem adequada para a pontuação.
 * @param   {number} score
 * @returns {object}
 */
function getSimulatorMessage(score) {
    return SIMULATOR_MESSAGES.find(function(m) {
        return score >= m.min && score <= m.max;
    }) || SIMULATOR_MESSAGES[0];
}

/**
 * Anima a transição de um valor numérico de [from] até [to].
 * Usado para animar o placar central do simulador.
 * @param {HTMLElement} el
 * @param {number}      from
 * @param {number}      to
 */
function animateValue(el, from, to) {
    var start   = performance.now();
    var duration = 700;

    function easeOut(t) {
        return 1 - Math.pow(1 - t, 3);
    }

    function step(now) {
        var progress = Math.min((now - start) / duration, 1);
        el.textContent = Math.round(from + easeOut(progress) * (to - from));
        if (progress < 1) requestAnimationFrame(step);
        else el.textContent = to;
    }

    requestAnimationFrame(step);
}

/**
 * Inicializa o simulador: eventos nos inputs e botão calcular.
 */
function initSimulator() {
    var calcBtn       = document.getElementById('calcular-btn');
    var arvoresSlider = document.getElementById('arvores-slider');
    var poluicaoSlider = document.getElementById('poluicao-slider');
    var arvoresValue  = document.getElementById('arvores-value');
    var poluicaoValue = document.getElementById('poluicao-value');

    if (!calcBtn) return;

    /* --- Labels em tempo real dos sliders --- */
    if (arvoresSlider && arvoresValue) {
        arvoresSlider.addEventListener('input', function() {
            var v = parseInt(this.value, 10);
            arvoresValue.textContent = v + (v === 1 ? ' árvore' : ' árvores');
        });
    }

    if (poluicaoSlider && poluicaoValue) {
        poluicaoSlider.addEventListener('input', function() {
            poluicaoValue.textContent = this.value + '% reduzido';
        });
    }

    /* --- Botão Calcular --- */
    calcBtn.addEventListener('click', function() {
        runSimulator();
    });

    /* --- Também recalcula ao mudar qualquer input (feedback instantâneo) --- */
    document.querySelectorAll('.sim-input').forEach(function(input) {
        input.addEventListener('change', function() {
            // Pequeno delay para o usuário perceber a seleção primeiro
            setTimeout(runSimulator, 150);
        });
    });
}

/**
 * Executa o cálculo e atualiza toda a UI de resultados.
 */
function runSimulator() {
    /* --- Coleta os valores dos controles --- */
    var energiaInput   = document.querySelector('[name="energia"]:checked');
    var irrigacaoInput = document.querySelector('[name="irrigacao"]:checked');
    var arvoresSlider  = document.getElementById('arvores-slider');
    var poluicaoSlider = document.getElementById('poluicao-slider');

    var energiaVal   = energiaInput   ? energiaInput.value   : null;
    var irrigacaoVal = irrigacaoInput ? irrigacaoInput.value : null;
    var arvoresVal   = arvoresSlider  ? parseInt(arvoresSlider.value, 10)  : 0;
    var poluicaoVal  = poluicaoSlider ? parseInt(poluicaoSlider.value, 10) : 0;

    /* --- Calcula pontos por categoria --- */
    var ptsEnergia   = energiaVal   ? (SIMULATOR_SCORES.energia[energiaVal]   || 0) : 0;
    var ptsAgua      = irrigacaoVal ? (SIMULATOR_SCORES.irrigacao[irrigacaoVal] || 0) : 0;
    var ptsFloresta  = Math.round((arvoresVal  / 100) * 20); // max 20
    var ptsPoluicao  = Math.round((poluicaoVal / 100) * 20); // max 20
    var totalScore   = ptsEnergia + ptsAgua + ptsFloresta + ptsPoluicao;

    /* --- Atualiza o medidor circular (SVG stroke-dashoffset) --- */
    var meterScore   = document.getElementById('meter-score');
    var meterProgress = document.getElementById('meter-progress');
    var meterLabel   = document.getElementById('meter-label');

    if (meterScore) {
        var prevScore = parseInt(meterScore.textContent, 10) || 0;
        animateValue(meterScore, prevScore, totalScore);
    }

    if (meterProgress) {
        // Circunferência do círculo r=52: 2π×52 ≈ 327
        var circumference = 327;
        var offset = circumference - (totalScore / 100) * circumference;
        meterProgress.style.strokeDashoffset = offset;

        // Muda cor conforme pontuação
        if (totalScore >= 80) {
            meterProgress.style.stroke = '#00c9d4'; // teal (ótimo)
        } else if (totalScore >= 55) {
            meterProgress.style.stroke = '#00e87d'; // verde (bom)
        } else if (totalScore >= 30) {
            meterProgress.style.stroke = '#fbbf24'; // âmbar (médio)
        } else {
            meterProgress.style.stroke = '#f87171'; // vermelho (baixo)
        }
    }

    /* --- Atualiza barras de progresso por categoria --- */
    updateResultBar('bar-energia',  'pts-energia',  ptsEnergia,  30);
    updateResultBar('bar-agua',     'pts-agua',     ptsAgua,     30);
    updateResultBar('bar-floresta', 'pts-floresta', ptsFloresta, 20);
    updateResultBar('bar-poluicao', 'pts-poluicao', ptsPoluicao, 20);

    /* --- Rótulo e mensagem de resultado --- */
    var msg = getSimulatorMessage(totalScore);

    if (meterLabel) {
        meterLabel.textContent = msg.label;
        meterLabel.style.color = msg.color;
    }

    var resultMessage = document.getElementById('result-message');
    if (resultMessage) {
        resultMessage.innerHTML =
            '<p style="color:' + msg.color + '">' + msg.msg + '</p>';
    }
}

/**
 * Atualiza uma barra de resultado individual com animação.
 * @param {string} barId    — ID da div da barra
 * @param {string} ptsId    — ID do span de pontos
 * @param {number} pts      — pontuação atual
 * @param {number} maxPts   — pontuação máxima desta categoria
 */
function updateResultBar(barId, ptsId, pts, maxPts) {
    var bar  = document.getElementById(barId);
    var span = document.getElementById(ptsId);

    if (bar) {
        // A largura percentual é relativa ao máximo da categoria
        var percent = Math.round((pts / maxPts) * 100);
        bar.style.width = percent + '%';
    }

    if (span) {
        span.textContent = pts + '/' + maxPts;
    }
}

/* ================================================================
   07. TIMELINE — Animação extra dos pontos ao entrar na viewport
   (O Scroll Reveal base já cuida do fade-in dos cards.)
================================================================ */

function initTimeline() {
    if (!('IntersectionObserver' in window)) return;

    var timelineItems = document.querySelectorAll('.timeline-item');

    var tlObserver = new IntersectionObserver(
        function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    tlObserver.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.25 }
    );

    timelineItems.forEach(function(item) {
        tlObserver.observe(item);
    });
}

/* ================================================================
   08. GALERIA + LIGHTBOX
================================================================ */

/** Dados de cada item da galeria para o lightbox. */
var GALLERY_DATA = [
    {
        title: '💧 Irrigação Inteligente',
        desc:  'Sistemas de gotejamento guiados por sensores de umidade entregam água diretamente na raiz. Com isso, economiza-se até 50% de água em comparação à irrigação tradicional, reduzindo custo e impacto ambiental.',
        cls:   'gv-1'
    },
    {
        title: '☀️ Energia Solar Rural',
        desc:  'Painéis fotovoltaicos transformam propriedades rurais em geradoras de energia limpa. A economia pode chegar a 80% na conta e o excedente pode ser vendido à rede elétrica, gerando renda extra ao produtor.',
        cls:   'gv-2'
    },
    {
        title: '🚁 Drones Agrícolas',
        desc:  'Drones equipados com câmeras multiespectrais mapeiam a saúde das plantações por NDVI e realizam pulverização cirúrgica, reduzindo o uso de agrotóxicos em até 70% e protegendo solo e mananciais.',
        cls:   'gv-3'
    },
    {
        title: '🌲 Reflorestamento Produtivo',
        desc:  'Sistemas Agroflorestais (SAF) integram espécies nativas com culturas agrícolas. Sequestram carbono atmosférico, restauram biodiversidade e ainda geram renda adicional para o produtor rural.',
        cls:   'gv-4'
    },
    {
        title: '📡 Sensores IoT no Campo',
        desc:  'Redes de sensores inteligentes monitoram temperatura, umidade do solo, pH e pragas em tempo real, 24 horas por dia. Dados enviados à nuvem permitem decisões precisas e redução de desperdícios.',
        cls:   'gv-5'
    },
    {
        title: '🛰️ Agricultura de Precisão',
        desc:  'GPS centimétrico, imagens de satélite e inteligência artificial orientam cada centímetro do plantio. A aplicação variável de insumos reduz custos em até 30% e minimiza o impacto ambiental da lavoura.',
        cls:   'gv-6'
    }
];

/** Índice do item atualmente aberto no lightbox. */
var currentLightboxIndex = 0;

/**
 * Abre o lightbox com o item de índice informado.
 * @param {number} index
 */
function openLightbox(index) {
    var lightbox    = document.getElementById('lightbox');
    var visual      = document.getElementById('lightbox-visual');
    var title       = document.getElementById('lightbox-title');
    var desc        = document.getElementById('lightbox-desc');

    if (!lightbox || !GALLERY_DATA[index]) return;

    currentLightboxIndex = index;
    var data = GALLERY_DATA[index];

    // Atualiza conteúdo
    // Remove classes anteriores e adiciona a nova
    visual.className = 'lightbox-visual ' + data.cls;
    title.textContent = data.title;
    desc.textContent  = data.desc;

    // Abre com animação
    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    // Foco no botão fechar para acessibilidade
    var closeBtn = document.getElementById('lightbox-close');
    if (closeBtn) closeBtn.focus();
}

/** Fecha o lightbox. */
function closeLightbox() {
    var lightbox = document.getElementById('lightbox');
    if (!lightbox) return;

    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
}

/** Navega para o próximo item no lightbox. */
function lightboxNext() {
    var next = (currentLightboxIndex + 1) % GALLERY_DATA.length;
    openLightbox(next);
}

/** Navega para o item anterior no lightbox. */
function lightboxPrev() {
    var prev = (currentLightboxIndex - 1 + GALLERY_DATA.length) % GALLERY_DATA.length;
    openLightbox(prev);
}

/**
 * Inicializa a galeria: eventos de clique nos items e controles do lightbox.
 */
function initGallery() {
    // Botões da galeria abrem o lightbox
    var galleryItems = document.querySelectorAll('.gallery-item[data-gallery-index]');
    galleryItems.forEach(function(item) {
        item.addEventListener('click', function() {
            var index = parseInt(this.getAttribute('data-gallery-index'), 10);
            openLightbox(index);
        });
    });

    // Botão fechar
    var closeBtn = document.getElementById('lightbox-close');
    if (closeBtn) closeBtn.addEventListener('click', closeLightbox);

    // Navegação
    var nextBtn = document.getElementById('lightbox-next');
    var prevBtn = document.getElementById('lightbox-prev');
    if (nextBtn) nextBtn.addEventListener('click', lightboxNext);
    if (prevBtn) prevBtn.addEventListener('click', lightboxPrev);

    // Fecha ao clicar no fundo escuro
    var lightbox = document.getElementById('lightbox');
    if (lightbox) {
        lightbox.addEventListener('click', function(e) {
            // Só fecha se clicar diretamente no overlay (não no conteúdo)
            if (e.target === lightbox) closeLightbox();
        });
    }

    // Teclado: Escape fecha, setas navegam
    document.addEventListener('keydown', function(e) {
        var lb = document.getElementById('lightbox');
        if (!lb || !lb.classList.contains('is-open')) return;

        if (e.key === 'Escape')      closeLightbox();
        if (e.key === 'ArrowRight')  lightboxNext();
        if (e.key === 'ArrowLeft')   lightboxPrev();
    });
}

/* ================================================================
   09. QUIZ INTERATIVO
================================================================ */

/** Banco de perguntas do quiz. */
var QUIZ_QUESTIONS = [
    {
        question: 'Qual sistema de irrigação economiza mais água na agricultura?',
        options: [
            'Irrigação por aspersão (sprinkler)',
            'Irrigação por inundação (flood)',
            'Irrigação por gotejamento (drip)',
            'Irrigação manual com regador'
        ],
        correct: 2,
        explanation: '✅ Correto! A irrigação por gotejamento aplica água direto na raiz da planta, economizando até 50% do recurso em comparação a outros métodos.'
    },
    {
        question: 'Para que os drones agrícolas são principalmente utilizados?',
        options: [
            'Apenas fotografar lavouras para marketing',
            'Monitoramento NDVI e pulverização de precisão',
            'Transporte de produtos entre fazendas',
            'Comunicação entre produtores rurais'
        ],
        correct: 1,
        explanation: '✅ Isso mesmo! Drones agrícolas realizam mapeamento com câmeras multiespectrais (NDVI) e pulverização cirúrgica, reduzindo agrotóxicos em até 70%.'
    },
    {
        question: 'Aproximadamente quanto da água doce mundial é consumida pela agricultura?',
        options: ['30%', '50%', '70%', '90%'],
        correct: 2,
        explanation: '✅ Certo! Cerca de 70% de toda a água doce disponível no planeta é usada pela agricultura — por isso técnicas eficientes são fundamentais.'
    },
    {
        question: 'O que caracteriza a "Agricultura de Precisão"?',
        options: [
            'Cultivo manual com ferramentas artesanais especializadas',
            'Agricultura praticada apenas em pequenas áreas urbanas',
            'Tipo de certificação de agricultura orgânica',
            'Uso de GPS, sensores e dados para otimizar insumos e produção'
        ],
        correct: 3,
        explanation: '✅ Exato! Agricultura de precisão usa GPS centimétrico, sensores, drones e Big Data para aplicar insumos exatamente onde necessário, reduzindo custos e desperdícios.'
    },
    {
        question: 'Qual prática contribui diretamente para o sequestro de carbono e a biodiversidade?',
        options: [
            'Queima controlada de resíduos agrícolas',
            'Monocultura extensiva mecanizada',
            'Sistemas Agroflorestais (SAF)',
            'Aração intensiva do solo'
        ],
        correct: 2,
        explanation: '✅ Perfeito! Sistemas Agroflorestais integram árvores nativas com culturas agrícolas, sequestram carbono, preservam biodiversidade e ainda geram renda extra!'
    }
];

/** Estado interno do quiz. */
var quizState = {
    currentQuestion: 0,
    score:           0,
    answered:        false
};

/**
 * Renderiza a pergunta atual na tela.
 */
function renderQuestion() {
    var q          = QUIZ_QUESTIONS[quizState.currentQuestion];
    var qText      = document.getElementById('quiz-question-text');
    var optGrid    = document.getElementById('quiz-options-grid');
    var feedback   = document.getElementById('quiz-feedback');
    var nextBtn    = document.getElementById('quiz-btn-next');
    var progressFill = document.getElementById('quiz-progress-fill');
    var progressText = document.getElementById('quiz-progress-text');
    var scoreEl    = document.getElementById('quiz-score-live');

    if (!q || !qText) return;

    // Atualiza barra de progresso
    var progressPct = (quizState.currentQuestion / QUIZ_QUESTIONS.length) * 100;
    if (progressFill) progressFill.style.width = progressPct + '%';
    if (progressText) progressText.textContent =
        'Questão ' + (quizState.currentQuestion + 1) + ' de ' + QUIZ_QUESTIONS.length;

    // Placar ao vivo
    if (scoreEl) scoreEl.textContent = quizState.score + ' pts';

    // Texto da pergunta
    qText.textContent = (quizState.currentQuestion + 1) + '. ' + q.question;

    // Esconde feedback e botão próxima
    if (feedback) { feedback.textContent = ''; feedback.className = 'quiz-feedback'; }
    if (nextBtn)  nextBtn.classList.remove('show');

    // Reseta estado de resposta
    quizState.answered = false;

    // Renderiza opções
    if (optGrid) {
        optGrid.innerHTML = '';

        q.options.forEach(function(optText, idx) {
            var btn = document.createElement('button');
            btn.className   = 'quiz-option';
            btn.textContent = optText;
            btn.setAttribute('type', 'button');

            btn.addEventListener('click', function() {
                if (!quizState.answered) {
                    handleAnswer(idx);
                }
            });

            optGrid.appendChild(btn);
        });
    }
}

/**
 * Processa a resposta selecionada pelo usuário.
 * @param {number} selectedIndex
 */
function handleAnswer(selectedIndex) {
    if (quizState.answered) return;

    var q          = QUIZ_QUESTIONS[quizState.currentQuestion];
    var optButtons = document.querySelectorAll('.quiz-option');
    var feedback   = document.getElementById('quiz-feedback');
    var nextBtn    = document.getElementById('quiz-btn-next');
    var scoreEl    = document.getElementById('quiz-score-live');

    quizState.answered = true;

    var isCorrect = selectedIndex === q.correct;

    // Pontua
    if (isCorrect) {
        quizState.score += 1;
        if (scoreEl) scoreEl.textContent = quizState.score + ' pts';
    }

    // Marca visualmente os botões
    optButtons.forEach(function(btn, idx) {
        btn.disabled = true;
        if (idx === q.correct) {
            btn.classList.add('correct');
        } else if (idx === selectedIndex && !isCorrect) {
            btn.classList.add('wrong');
        }
    });

    // Exibe feedback
    if (feedback) {
        feedback.textContent = isCorrect
            ? q.explanation
            : '❌ Errou! ' + q.explanation;
        feedback.className = 'quiz-feedback show ' +
            (isCorrect ? 'feedback-correct' : 'feedback-wrong');
    }

    // Exibe botão de avançar
    if (nextBtn) {
        nextBtn.classList.add('show');
        // Muda texto na última pergunta
        if (quizState.currentQuestion === QUIZ_QUESTIONS.length - 1) {
            nextBtn.innerHTML =
                'Ver Resultado ' +
                '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">' +
                '<path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
        }
    }
}

/**
 * Avança para a próxima pergunta ou exibe a tela de resultado final.
 */
function nextQuestion() {
    quizState.currentQuestion += 1;

    if (quizState.currentQuestion < QUIZ_QUESTIONS.length) {
        renderQuestion();
    } else {
        showQuizResults();
    }
}

/**
 * Exibe a tela de resultado final com mensagem personalizada.
 */
function showQuizResults() {
    var gameArea    = document.getElementById('quiz-game-area');
    var resultsScreen = document.getElementById('quiz-results-screen');
    var finalScore  = document.getElementById('quiz-final-score');
    var finalMsg    = document.getElementById('quiz-final-msg');
    var trophy      = document.getElementById('result-trophy');
    var title       = document.getElementById('quiz-result-title');
    var progressFill = document.getElementById('quiz-progress-fill');

    if (gameArea)     gameArea.style.display    = 'none';
    if (resultsScreen) resultsScreen.classList.add('show');

    // Barra de progresso 100%
    if (progressFill) progressFill.style.width = '100%';

    if (finalScore) finalScore.textContent = quizState.score;

    // Mensagens e emojis conforme acertos
    var s = quizState.score;
    var messages = {
        0: { title: 'Continue estudando!',    icon: '📚', msg: 'Não desanime! O conhecimento sobre sustentabilidade é o primeiro passo para a mudança. Explore o site e tente de novo!' },
        1: { title: 'Continue tentando!',     icon: '📖', msg: 'Um ponto! Você está aprendendo. Reveja as seções do site para aprofundar seu conhecimento sobre o agro sustentável.' },
        2: { title: 'Bom começo!',            icon: '🌱', msg: 'Você está no caminho certo. Leia mais sobre as tecnologias apresentadas e volte para superar sua pontuação!' },
        3: { title: 'Bem informado!',         icon: '🌿', msg: 'Você já sabe bastante sobre sustentabilidade no agro. Com mais estudo, chegará à pontuação máxima!' },
        4: { title: 'Quase perfeito!',        icon: '🏅', msg: 'Impressionante! Você está muito bem informado sobre tecnologia e sustentabilidade rural. Continue assim!' },
        5: { title: 'Especialista do Agro!', icon: '🏆', msg: 'Parabéns! Você acertou tudo! Você é um verdadeiro especialista em agro sustentável. O futuro do campo precisa de pessoas como você!' }
    };

    var result = messages[s] || messages[0];
    if (trophy) trophy.textContent = result.icon;
    if (title)  title.textContent  = result.title;
    if (finalMsg) finalMsg.textContent = result.msg;
}

/**
 * Reinicia o quiz do zero.
 */
function restartQuiz() {
    quizState.currentQuestion = 0;
    quizState.score           = 0;
    quizState.answered        = false;

    var gameArea    = document.getElementById('quiz-game-area');
    var resultsScreen = document.getElementById('quiz-results-screen');
    var nextBtn     = document.getElementById('quiz-btn-next');
    var progressFill = document.getElementById('quiz-progress-fill');
    var scoreEl     = document.getElementById('quiz-score-live');

    if (gameArea)     gameArea.style.display = '';
    if (resultsScreen) resultsScreen.classList.remove('show');
    if (nextBtn)      nextBtn.classList.remove('show');
    if (progressFill) progressFill.style.width = '0%';
    if (scoreEl)      scoreEl.textContent = '0 pts';

    // Reseta texto do botão next
    if (nextBtn) {
        nextBtn.innerHTML =
            'Próxima Pergunta ' +
            '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">' +
            '<path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
    }

    renderQuestion();
}

/**
 * Inicializa o módulo do quiz, anexando eventos.
 */
function initQuiz() {
    var nextBtn    = document.getElementById('quiz-btn-next');
    var restartBtn = document.getElementById('quiz-restart-btn');

    if (nextBtn) {
        nextBtn.addEventListener('click', function() {
            if (quizState.answered) nextQuestion();
        });
    }

    if (restartBtn) {
        restartBtn.addEventListener('click', restartQuiz);
    }

    // Inicia exibindo a primeira pergunta
    renderQuestion();
}

/* ================================================================
   10. PARTÍCULAS CTA — Canvas da seção final
   Versão mais simples e esparsa para não competir com o texto.
================================================================ */

function initCtaParticles() {
    var canvas = document.getElementById('cta-canvas');
    if (!canvas) return;

    var ctx       = canvas.getContext('2d');
    var particles = [];
    var animId    = null;

    function resize() {
        canvas.width  = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
    }

    function createCtaParticles() {
        particles = [];
        var count = 30;
        for (var i = 0; i < count; i++) {
            particles.push({
                x:      Math.random() * canvas.width,
                y:      Math.random() * canvas.height,
                r:      Math.random() * 2 + 0.5,
                speedX: (Math.random() - 0.5) * 0.4,
                speedY: (Math.random() - 0.5) * 0.4,
                op:     Math.random() * 0.3 + 0.05
            });
        }
    }

    function animateCta() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(function(p) {
            p.x += p.speedX;
            p.y += p.speedY;
            if (p.x < 0 || p.x > canvas.width)  p.speedX *= -1;
            if (p.y < 0 || p.y > canvas.height) p.speedY *= -1;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(0, 232, 125, ' + p.op + ')';
            ctx.fill();
        });
        animId = requestAnimationFrame(animateCta);
    }

    window.addEventListener('resize', function() {
        cancelAnimationFrame(animId);
        resize();
        createCtaParticles();
        animateCta();
    });

    resize();
    createCtaParticles();
    animateCta();
}

/* ================================================================
   11. NAVEGAÇÃO SUAVE — Corrige offset do navbar fixo
================================================================ */

function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
        anchor.addEventListener('click', function(e) {
            var targetId = this.getAttribute('href');
            if (targetId === '#') return;

            var target = document.querySelector(targetId);
            if (!target) return;

            e.preventDefault();

            var navHeight = parseInt(
                getComputedStyle(document.documentElement)
                    .getPropertyValue('--nav-height') || '68',
                10
            );

            var targetY = target.getBoundingClientRect().top
                        + window.pageYOffset
                        - navHeight;

            window.scrollTo({ top: targetY, behavior: 'smooth' });
        });
    });
}

/* ================================================================
   12. GRÁFICO — Chart.js (funciona offline com js/chart.min.js)
   Exibe comparativo de produção agrícola × impacto ambiental
   de 2022 a 2025 com design integrado ao estilo do site.
================================================================ */
function initProductionChart() {
    var canvas = document.getElementById('productionChart');

    // Sai silenciosamente se o canvas não existir ou Chart.js não carregar
    if (!canvas || typeof Chart === 'undefined') return;

    var ctx = canvas.getContext('2d');

    var anos = ['2022', '2023', '2024', '2025'];

    var dados = {
        producao: [272, 296, 310, 322],
        desmatamento: [11568, 9001, 8200, 7100],
        emissoes: [580, 560, 540, 510]
    };

    var corVerde  = 'rgba(0, 232, 125, 1)';
    var corTeal   = 'rgba(0, 201, 212, 1)';
    var corAmbar  = 'rgba(245, 158, 11, 1)';
    var corVerdeF = 'rgba(0, 232, 125, 0.12)';
    var corTealF  = 'rgba(0, 201, 212, 0.12)';
    var corAmbarF = 'rgba(245, 158, 11, 0.12)';

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: anos,
            datasets: [
                {
                    type:            'bar',
                    label:           'Produção de Grãos (Mi ton)',
                    data:            dados.producao,
                    backgroundColor: corVerdeF,
                    borderColor:     corVerde,
                    borderWidth:     1.5,
                    borderRadius:    6,
                    yAxisID:         'yProducao'
                },
                {
                    type:             'line',
                    label:            'Desmatamento (mil ha)',
                    data:             dados.desmatamento,
                    borderColor:      corAmbar,
                    backgroundColor:  corAmbarF,
                    borderWidth:      2.5,
                    pointRadius:      5,
                    pointHoverRadius: 7,
                    pointBackgroundColor: corAmbar,
                    tension:          0.4,
                    fill:             false,
                    yAxisID:          'yImpacto'
                },
                {
                    type:             'line',
                    label:            'Emissões CO₂eq (Mt)',
                    data:             dados.emissoes,
                    borderColor:      corTeal,
                    backgroundColor:  corTealF,
                    borderWidth:      2.5,
                    pointRadius:      5,
                    pointHoverRadius: 7,
                    pointBackgroundColor: corTeal,
                    tension:          0.4,
                    fill:             false,
                    yAxisID:          'yImpacto'
                }
            ]
        },
        options: {
            responsive:          true,
            maintainAspectRatio: true,
            interaction: {
                mode:      'index',
                intersect: false
            },
            animation: {
                duration: 1200,
                easing:   'easeOutQuart'
            },
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color:     'rgba(232, 245, 233, 0.75)',
                        font:      { family: "'Exo 2', sans-serif", size: 12 },
                        padding:   20,
                        usePointStyle: true,
                        pointStyleWidth: 10
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(6, 13, 10, 0.92)',
                    borderColor:     'rgba(0, 232, 125, 0.3)',
                    borderWidth:     1,
                    titleColor:      'rgba(232, 245, 233, 1)',
                    bodyColor:       'rgba(168, 184, 160, 1)',
                    titleFont:       { family: "'Exo 2', sans-serif", weight: '700', size: 13 },
                    bodyFont:        { family: "'Exo 2', sans-serif", size: 12 },
                    padding:         12,
                    cornerRadius:    10,
                    callbacks: {
                        label: function(context) {
                            var label = context.dataset.label || '';
                            var value = context.parsed.y;
                            return ' ' + label + ': ' + value.toLocaleString('pt-BR');
                        }
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: 'rgba(168, 184, 160, 0.8)',
                        font:  { family: "'Exo 2', sans-serif", size: 12 }
                    },
                    grid: { color: 'rgba(0, 232, 125, 0.06)' }
                },
                yProducao: {
                    type:     'linear',
                    position: 'left',
                    title: {
                        display: true,
                        text:    'Produção (Mi toneladas)',
                        color:   corVerde,
                        font:    { family: "'Exo 2', sans-serif", size: 11 }
                    },
                    ticks: {
                        color: 'rgba(168, 184, 160, 0.8)',
                        font:  { family: "'Exo 2', sans-serif", size: 11 }
                    },
                    grid: { color: 'rgba(0, 232, 125, 0.06)' }
                },
                yImpacto: {
                    type:     'linear',
                    position: 'right',
                    title: {
                        display: true,
                        text:    'Impacto Ambiental',
                        color:   corAmbar,
                        font:    { family: "'Exo 2', sans-serif", size: 11 }
                    },
                    ticks: {
                        color: 'rgba(168, 184, 160, 0.8)',
                        font:  { family: "'Exo 2', sans-serif", size: 11 }
                    },
                    grid: { drawOnChartArea: false }
                }
            }
        }
    });
}

/* ================================================================
   13. INICIALIZAÇÃO GERAL
   Aguarda o DOM estar pronto e inicializa todos os módulos
================================================================ */
document.addEventListener('DOMContentLoaded', function() {

    // 1. Partículas do Hero (canvas — alta prioridade visual)
    initParticles();

    // 2. Navbar (deve ser configurada cedo para scroll correto)
    initNavbar();

    // 3. Scroll suave com offset do navbar
    initSmoothScroll();

    // 4. Scroll Reveal (IntersectionObserver nas seções)
    initScrollReveal();

    // 5. Contadores animados (dependem do Scroll Reveal)
    initCounters();

    // 6. Cards de solução (flip 3D)
    initSolutionCards();

    // 7. Simulador da fazenda
    initSimulator();

    // 8. Timeline (animação dos pontos)
    initTimeline();

    // 9. Galeria + Lightbox
    initGallery();

    // 10. Quiz
    initQuiz();

    // 11. Partículas CTA (seção final)
    initCtaParticles();

    // 12. Gráfico Chart.js — Produção Agrícola vs. Impacto Ambiental
    initProductionChart();

    // Log de confirmação para o console do desenvolvedor
    console.log('%c🌱 Agrinho 2026 — Carregado com sucesso!', 'color:#00e87d;font-weight:bold;font-size:14px;');
    console.log('%cAgro Forte, Futuro Sustentável', 'color:#00c9d4;font-size:12px;');
});