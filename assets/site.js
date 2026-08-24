/* ==========================================================================
   Melio Tasks : comportements communs à toutes les pages
   --------------------------------------------------------------------------
   Ce fichier remplace les scripts inline qui étaient recopiés à l'identique
   dans index / pricing / our-story : menu mobile, apparitions au scroll,
   défilement doux, accordéon FAQ, bandeau cookies, barre de progression.

   Chargé en `defer` : le DOM est complet quand il s'exécute, mais l'événement
   DOMContentLoaded n'est pas encore parti, c'est ce qui permet d'injecter le
   bandeau cookies avant que le moteur i18n ne traduise la page.
   ========================================================================== */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------------------------- bandeau cookies ---- */

  var COOKIE_HTML =
    '<div class="cookie-message">' +
      '<span data-i18n="cookie.message"></span> ' +
      '<a href="/privacy-policy/" data-i18n="cookie.learnMore"></a>' +
    '</div>' +
    '<div class="cookie-buttons">' +
      '<button class="cookie-accept" id="acceptCookies" data-i18n="cookie.accept"></button>' +
      '<button class="cookie-reject" id="rejectCookies" data-i18n="cookie.reject"></button>' +
    '</div>';

  function ensureCookieBanner() {
    if (document.getElementById('cookieBanner')) return;
    var banner = document.createElement('div');
    banner.className = 'custom-cookie-banner';
    banner.id = 'cookieBanner';
    banner.innerHTML = COOKIE_HTML;
    document.body.appendChild(banner);
  }

  function consent(granted) {
    if (typeof window.gtag === 'function') {
      window.gtag('consent', 'update', {
        analytics_storage: granted ? 'granted' : 'denied'
      });
    }
  }

  function setupCookies() {
    var banner = document.getElementById('cookieBanner');
    if (!banner) return;

    var stored = null;
    try { stored = localStorage.getItem('cookieConsent'); } catch (e) {}

    if (!stored) {
      window.setTimeout(function () { banner.classList.add('show'); }, 1200);
    }

    function decide(value) {
      try { localStorage.setItem('cookieConsent', value); } catch (e) {}
      banner.classList.remove('show');
      consent(value === 'accepted');
    }

    var accept = document.getElementById('acceptCookies');
    var reject = document.getElementById('rejectCookies');
    if (accept) accept.addEventListener('click', function () { decide('accepted'); });
    if (reject) reject.addEventListener('click', function () { decide('rejected'); });

    document.querySelectorAll('#cookieSettingsFooter, [data-cookie-settings]').forEach(function (link) {
      link.addEventListener('click', function (e) {
        e.preventDefault();
        banner.classList.add('show');
      });
    });
  }

  /* ------------------------------------------------------ menu mobile ---- */

  function setupMenu() {
    var btn = document.getElementById('menuBtn');
    var menu = document.getElementById('mobileMenu');
    if (!btn || !menu) return;

    btn.addEventListener('click', function () {
      btn.classList.toggle('active');
      menu.classList.toggle('show');
    });

    menu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        btn.classList.remove('active');
        menu.classList.remove('show');
      });
    });

    document.addEventListener('click', function (e) {
      if (!menu.contains(e.target) && !btn.contains(e.target)) {
        btn.classList.remove('active');
        menu.classList.remove('show');
      }
    });
  }

  /* ------------------------------------------- apparitions au défilement -- */

  function setupReveal() {
    var targets = document.querySelectorAll('.fade-in, .feature-visual img');
    if (!targets.length) return;

    if (reduceMotion || !('IntersectionObserver' in window)) {
      targets.forEach(function (el) { el.classList.add('visible'); });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('visible', 'animating');
        window.setTimeout(function () {
          entry.target.classList.remove('animating');
        }, 2000);
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -100px 0px' });

    targets.forEach(function (el) { observer.observe(el); });
  }

  /* ------------------------------------------------------ nav & scroll --- */

  function setupScrollChrome() {
    var nav = document.querySelector('nav');
    var bar = document.createElement('div');
    bar.className = 'scroll-progress';
    document.body.appendChild(bar);

    var ticking = false;

    function update() {
      var y = window.scrollY || window.pageYOffset;
      var max = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.transform = 'scaleX(' + (max > 0 ? Math.min(y / max, 1) : 0) + ')';
      if (nav) nav.classList.toggle('scrolled', y > 40);
      ticking = false;
    }

    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(update);
    }, { passive: true });

    update();
  }

  function setupSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
      anchor.addEventListener('click', function (e) {
        var href = this.getAttribute('href');
        if (!href || href === '#') { e.preventDefault(); return; }
        if (href === '#hero') {
          e.preventDefault();
          window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
          return;
        }
        var target = document.querySelector(href);
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
      });
    });
  }

  /* Souligne l'entrée de menu correspondant à la section en cours de lecture.

     La première version observait les sections avec un seuil de 0,5 : une
     section plus haute que la fenêtre ne pouvait jamais atteindre la moitié de
     sa propre surface visible, et « Melio AI », qui fait plus de 1 500 px, ne
     se soulignait donc jamais. On raisonne maintenant sur une ligne de lecture
     placée au tiers de la fenêtre : la section active est la dernière dont le
     haut est passé au-dessus de cette ligne, quelle que soit sa hauteur. Le
     calcul tourne aussi au chargement, donc une arrivée directe sur #melio-ai
     souligne le bon lien sans avoir cliqué. */
  function setupActiveNav() {
    var links = [].slice.call(document.querySelectorAll('.nav-link'));
    if (!links.length) return;

    var targets = [];
    links.forEach(function (link) {
      var href = link.getAttribute('href') || '';
      var hash = href.indexOf('#') >= 0 ? href.slice(href.indexOf('#') + 1) : '';

      /* « Accueil » pointe sur `/`, sans ancre : sans ce rattachement au héros,
         tout le haut de la page n'aurait aucun lien souligné. Sur les pages
         internes, #hero n'existe pas et le lien est simplement ignoré. */
      if (!hash && (href === '/' || href === '/index.html')) hash = 'hero';
      if (!hash) return;

      var el = document.getElementById(hash);
      if (el) targets.push({ link: link, el: el });
    });

    /* Aucune ancre résolue : on est sur une page interne, où le lien courant est
       déjà marqué dans le HTML. Y toucher l'effacerait. */
    if (!targets.length) return;

    function update() {
      targets.sort(function (a, b) {
        return a.el.getBoundingClientRect().top - b.el.getBoundingClientRect().top;
      });

      var line = window.innerHeight * 0.34;
      var current = null;

      targets.forEach(function (t) {
        if (t.el.getBoundingClientRect().top <= line) current = t;
      });

      /* Arrivé en bas de page, la dernière section reste la bonne réponse même
         si son haut est repassé au-dessus de la ligne depuis longtemps. */
      var atBottom = window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 4;
      if (atBottom) current = targets[targets.length - 1];

      links.forEach(function (link) {
        link.classList.toggle('is-active', !!current && link === current.link);
      });
    }

    var ticking = false;
    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(function () { update(); ticking = false; });
    }, { passive: true });
    window.addEventListener('resize', update);
    window.addEventListener('hashchange', update);

    /* Une arrivée sur /#melio-ai place le navigateur au bon endroit sans jamais
       émettre d'événement `scroll`. On recalcule donc aussi une fois la page
       chargée, quand les images ont fini de fixer les positions. */
    window.addEventListener('load', update);
    window.setTimeout(update, 350);
    update();
  }

  /* ------------------------------------------------------------- FAQ ---- */

  function setupFaq() {
    var items = document.querySelectorAll('.faq-item');
    items.forEach(function (item) {
      item.addEventListener('click', function () {
        var wasActive = item.classList.contains('active');
        items.forEach(function (other) {
          if (other !== item) other.classList.remove('active');
        });
        item.classList.toggle('active', !wasActive);
      });
    });
  }

  /* --------------------------------------------- démo du chat Melio AI --- */

  /* La démo rejoue la séquence réelle de l'app : message, réflexion, réponse,
     carte de confirmation, appui sur Créer, chargement, création. Elle ne tourne
     que lorsqu'elle est à l'écran : inutile d'animer une section que personne ne
     regarde. */
  function setupAiDemo() {
    var demo = document.getElementById('aiDemo');
    if (!demo) return;

    var turns = demo.querySelectorAll('.ai-turn');
    var typing = demo.querySelector('.ai-typing');
    var card = demo.querySelector('.ai-card');
    var create = demo.querySelector('.ai-btn--create');
    var timers = [];
    var running = false;

    function clear() {
      timers.forEach(window.clearTimeout);
      timers = [];
    }

    function at(delay, fn) { timers.push(window.setTimeout(fn, delay)); }

    function reset() {
      turns.forEach(function (t) { t.classList.remove('show'); });
      if (card) card.classList.remove('done');
      if (create) create.classList.remove('loading', 'pressed');
    }

    function show(step) {
      var el = demo.querySelector('[data-step="' + step + '"]');
      if (el) el.classList.add('show');
    }

    /* Le minutage suit celui d'un vrai échange : la réflexion dure presque deux
       secondes, la carte se lit avant qu'on appuie, et le chargement du bouton
       tient 1,1 s avant de basculer en « Créé ». */
    function run() {
      clear();
      reset();
      at(250,  function () { show(1); });
      at(1150, function () { show(2); });
      at(3000, function () {
        if (typing) typing.classList.remove('show');
        show(3);
      });
      at(4050, function () { show(4); });
      at(6500, function () { if (create) create.classList.add('pressed'); });
      at(6660, function () {
        if (!create) return;
        create.classList.remove('pressed');
        create.classList.add('loading');
      });
      at(7760, function () {
        if (create) create.classList.remove('loading');
        if (card) card.classList.add('done');
      });
      at(12600, run);
    }

    if (reduceMotion) {
      turns.forEach(function (t) { t.classList.add('show'); });
      if (typing) typing.classList.remove('show');
      if (card) card.classList.add('done');
      return;
    }

    if (!('IntersectionObserver' in window)) { run(); return; }

    /* L'observateur se déclenche à chaque franchissement du seuil, et la simple
       apparition de la carte (fade-in) en provoque un. Sans ce verrou, la
       séquence repartait de zéro juste après avoir démarré. */
    new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          if (running) return;
          running = true;
          run();
        } else {
          running = false;
          clear();
          reset();
        }
      });
    }, { threshold: 0.25 }).observe(demo);
  }

  /* ------------------------------------------------------------ init ---- */

  ensureCookieBanner();

  document.addEventListener('DOMContentLoaded', function () {
    setupMenu();
    setupReveal();
    setupScrollChrome();
    setupSmoothScroll();
    setupActiveNav();
    setupFaq();
    setupCookies();
    setupAiDemo();
  });
})();
