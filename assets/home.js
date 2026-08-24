/* ==========================================================================
   Melio Tasks : animations propres à la page d'accueil
   --------------------------------------------------------------------------
   Tout ce qui affiche du texte ici passe par le dictionnaire : ces blocs sont
   pilotés en JavaScript, ils ne peuvent donc pas être traduits par le simple
   balayage des attributs data-i18n. Ils se reconstruisent à chaque changement
   de langue via l'événement `melio:languagechange`.
   ========================================================================== */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var t = function (key) {
    return (window.Melio && window.Melio.t(key)) || '';
  };

  /* --------------------------------------------- compteurs de l'en-tête -- */

  function setupHeroCounters() {
    var stats = document.querySelectorAll('.stat-number');
    var hero = document.getElementById('hero');
    if (!stats.length || !hero) return;

    var locale = (window.Melio && window.Melio.i18n.locale) || 'en-US';

    function render(el, value, decimals) {
      el.textContent = decimals
        ? value.toFixed(1)
        : Math.floor(value).toLocaleString(locale);
    }

    function animate(el) {
      var end = parseFloat(el.getAttribute('data-target'));
      var decimals = end < 100;

      if (reduceMotion) { render(el, end, decimals); return; }

      var start = performance.now();
      var duration = 1800;

      function frame(now) {
        var p = Math.min((now - start) / duration, 1);
        /* easeOutExpo : le chiffre ralentit en arrivant, plutôt que de
           s'arrêter net sur sa valeur finale. */
        var eased = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
        render(el, end * eased, decimals);
        if (p < 1) window.requestAnimationFrame(frame);
      }
      window.requestAnimationFrame(frame);
    }

    if (!('IntersectionObserver' in window)) {
      stats.forEach(animate);
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        stats.forEach(animate);
        observer.disconnect();
      });
    }, { threshold: 0.3 });

    observer.observe(hero);
  }

  /* ------------------------------------------------ texte progressif ---- */

  function setupProgressiveText() {
    var wrapper = document.querySelector('.progressive-text-wrapper');
    var holder = document.getElementById('progressiveText');
    if (!wrapper || !holder) return;

    var words = [];

    /* Découpage de la phrase en unités qui s'allument une à une.
       Trois cas à ménager :
       - l'espace ordinaire sépare les mots ;
       - l'espace insécable, lui, soude un groupe : en arabe, « Melio Tasks »
         doit rester une seule boîte, sinon la mise en page de droite à gauche
         inverse les deux mots et affiche « Tasks Melio » ;
       - le chinois n'espace pas ses mots : on descend au caractère, en gardant
         les suites latines et les nombres d'un seul tenant. */
    var CJK = /[\u3400-\u4DBF\u4E00-\u9FFF\u3000-\u303F\uFF00-\uFFEF]/;

    function tokenize(sentence) {
      var out = [];
      sentence.split(/ +/).forEach(function (chunk) {
        if (!chunk) return;
        if (CJK.test(chunk)) {
          var pieces = chunk.match(/[A-Za-z0-9\u00A0'’.,-]+|[\s\S]/g) || [chunk];
          out = out.concat(pieces);
        } else {
          out.push(chunk);
        }
      });
      return out;
    }

    function build() {
      var parts = tokenize(t('progressive.sentence'));
      holder.innerHTML = '';
      parts.forEach(function (part) {
        var span = document.createElement('span');
        span.className = 'word';
        span.textContent = part;
        holder.appendChild(span);
      });
      words = holder.querySelectorAll('.word');
      paint();
    }

    function paint() {
      if (!words.length) return;
      var top = wrapper.offsetTop;
      var height = wrapper.offsetHeight;
      var y = window.scrollY || window.pageYOffset;
      if (y <= top || y >= top + height) return;

      var progress = Math.max(0, (y - top) / (height * 0.5));
      var active = Math.floor(progress * words.length);
      words.forEach(function (word, index) {
        word.classList.toggle('active', index <= active);
      });
    }

    var ticking = false;
    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(function () { paint(); ticking = false; });
    }, { passive: true });

    document.addEventListener('melio:languagechange', build);
    build();
  }

  /* --------------------------------------------- compteur « Impact » ---- */

  function setupImpactCounter() {
    var section = document.querySelector('.stats-counter-section');
    var title = document.getElementById('statsTitle');
    var value = document.getElementById('statsValue');
    var desc = document.getElementById('statsDescription');
    if (!section || !title || !value || !desc) return;

    function stages() {
      return [1, 2, 3, 4].map(function (n) {
        return {
          title: t('stats.s' + n + '.title'),
          value: t('stats.s' + n + '.value'),
          desc: t('stats.s' + n + '.desc')
        };
      });
    }

    var current = -1;
    var busy = false;

    function paint(stage, index) {
      title.textContent = stage.title;
      value.textContent = stage.value;
      desc.textContent = stage.desc;

      /* Le dernier palier tient un nombre à cinq chiffres : sans réduction,
         il déborde de l'écran sur mobile. */
      if (index === 3) {
        value.style.setProperty(
          'font-size',
          window.innerWidth <= 640 ? 'clamp(2.5rem, 12vw, 3.5rem)' : 'clamp(3.5rem, 10vw, 6.5rem)',
          'important'
        );
      } else {
        value.style.removeProperty('font-size');
      }
    }

    function goTo(index) {
      var list = stages();
      if (!list[index]) return;
      if (reduceMotion) { paint(list[index], index); return; }

      busy = true;
      [title, value, desc].forEach(function (el) { el.style.opacity = '0'; });

      window.setTimeout(function () {
        paint(list[index], index);
        [title, value, desc].forEach(function (el) { el.style.opacity = '1'; });
        window.setTimeout(function () { busy = false; }, 220);
      }, 240);
    }

    var ticking = false;
    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(function () {
        ticking = false;
        var top = section.offsetTop;
        var height = section.offsetHeight;
        var y = (window.scrollY || window.pageYOffset) + window.innerHeight / 2;
        if (y <= top || y >= top + height) return;

        var progress = (y - top) / (height * 0.7);
        var index = Math.min(Math.floor(progress * 4), 3);
        if (index === current || index < 0 || busy) return;
        current = index;
        goTo(index);
      });
    }, { passive: true });

    document.addEventListener('melio:languagechange', function () {
      var list = stages();
      paint(list[Math.max(current, 0)], Math.max(current, 0));
    });

    paint(stages()[0], 0);
  }

  /* ------------------------------------------------ carrousel d'avis ---- */

  function setupTestimonials() {
    var track = document.getElementById('testimonialsTrack');
    if (!track || !track.children.length) return;

    if (reduceMotion) {
      track.style.overflowX = 'auto';
      return;
    }

    var offset = 0;
    var paused = false;

    track.addEventListener('mouseenter', function () { paused = true; });
    track.addEventListener('mouseleave', function () { paused = false; });
    track.addEventListener('touchstart', function () { paused = true; }, { passive: true });
    track.addEventListener('touchend', function () { paused = false; }, { passive: true });

    /* La largeur est mesurée plutôt que codée en dur : les cartes rétrécissent
       sous 768 px et une valeur figée décalait la boucle sur mobile. */
    function loopWidth() {
      var card = track.children[0];
      if (!card) return 0;
      var gap = parseFloat(getComputedStyle(track).columnGap || '32') || 32;
      return (card.offsetWidth + gap) * (track.children.length / 2);
    }

    function step() {
      if (!paused) {
        offset -= 0.5;
        var reset = loopWidth();
        if (reset && offset <= -reset) offset = 0;
        track.style.transform = 'translateX(' + offset + 'px)';
      }
      window.requestAnimationFrame(step);
    }

    window.requestAnimationFrame(step);
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupHeroCounters();
    setupProgressiveText();
    setupImpactCounter();
    setupTestimonials();
  });
})();
