/* ==========================================================================
   Melio Tasks : moteur multilingue
   --------------------------------------------------------------------------
   Les cinq langues sont exactement celles de l'app (en, fr, es, zh, ar), pour
   qu'un visiteur arrivé depuis le store retrouve le site dans la langue de son
   téléphone.

   Balisage attendu dans les pages :
     data-i18n="cle"                  -> textContent
     data-i18n-html="cle"             -> innerHTML (textes contenant <br>, <span>)
     data-i18n-attr="placeholder:cle" -> attribut(s), séparés par des ;
     data-lang-switcher               -> conteneur où injecter le sélecteur

   La langue choisie est mémorisée dans localStorage et reflétée dans l'URL
   (?lang=fr) : un lien partagé garde la langue de celui qui l'a copié.
   ========================================================================== */
(function () {
  'use strict';

  var LANGS = [
    { code: 'en', label: 'English',  short: 'EN', dir: 'ltr', locale: 'en-US' },
    { code: 'fr', label: 'Français', short: 'FR', dir: 'ltr', locale: 'fr-FR' },
    { code: 'es', label: 'Español',  short: 'ES', dir: 'ltr', locale: 'es-ES' },
    { code: 'zh', label: '中文',      short: 'ZH', dir: 'ltr', locale: 'zh-CN' },
    /* `ar` tout court fait basculer les compteurs en chiffres arabes orientaux
       (١٢٬٥٣٤) alors que le reste des textes arabes utilise les chiffres
       occidentaux. On force donc le système de numération latin. */
    { code: 'ar', label: 'العربية',   short: 'AR', dir: 'rtl', locale: 'ar-u-nu-latn' }
  ];

  var STORAGE_KEY = 'melioLang';
  var DEFAULT = 'en';
  var dict = window.MELIO_I18N || {};

  function meta(code) {
    for (var i = 0; i < LANGS.length; i++) {
      if (LANGS[i].code === code) return LANGS[i];
    }
    return LANGS[0];
  }

  function supported(code) {
    if (!code) return null;
    var base = String(code).toLowerCase().split('-')[0];
    for (var i = 0; i < LANGS.length; i++) {
      if (LANGS[i].code === base) return base;
    }
    return null;
  }

  function stored() {
    try { return window.localStorage.getItem(STORAGE_KEY); } catch (e) { return null; }
  }

  function remember(code) {
    try { window.localStorage.setItem(STORAGE_KEY, code); } catch (e) {}
  }

  /* Ordre de décision : l'URL gagne sur le choix mémorisé, qui gagne sur la
     langue du navigateur. Sans quoi un lien ?lang=es envoyé à quelqu'un qui a
     déjà visité le site en anglais s'ouvrirait en anglais. */
  function detect() {
    var params = new URLSearchParams(window.location.search);
    var fromUrl = supported(params.get('lang'));
    if (fromUrl) return fromUrl;

    var fromStore = supported(stored());
    if (fromStore) return fromStore;

    var navLangs = navigator.languages || [navigator.language];
    for (var i = 0; i < navLangs.length; i++) {
      var hit = supported(navLangs[i]);
      if (hit) return hit;
    }
    return DEFAULT;
  }

  var current = detect();

  /* Une clé absente retombe sur l'anglais plutôt que d'afficher la clé brute :
     une traduction oubliée doit dégrader en texte lisible, pas en « nav.home ». */
  function translate(key, lang) {
    var code = lang || current;
    var table = dict[code];
    if (table && typeof table[key] === 'string') return table[key];
    var fallback = dict[DEFAULT];
    if (fallback && typeof fallback[key] === 'string') return fallback[key];
    return null;
  }

  function applyAttrs(el, spec, lang) {
    spec.split(';').forEach(function (pair) {
      var bits = pair.split(':');
      if (bits.length < 2) return;
      var attr = bits[0].trim();
      var value = translate(bits.slice(1).join(':').trim(), lang);
      if (value !== null) el.setAttribute(attr, value);
    });
  }

  function apply(lang) {
    var info = meta(lang);
    var root = document.documentElement;

    root.setAttribute('lang', lang);
    root.setAttribute('dir', info.dir);
    root.setAttribute('data-lang', lang);

    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var value = translate(el.getAttribute('data-i18n'), lang);
      if (value !== null) el.textContent = value;
    });

    document.querySelectorAll('[data-i18n-html]').forEach(function (el) {
      var value = translate(el.getAttribute('data-i18n-html'), lang);
      if (value !== null) el.innerHTML = value;
    });

    document.querySelectorAll('[data-i18n-attr]').forEach(function (el) {
      applyAttrs(el, el.getAttribute('data-i18n-attr'), lang);
    });

    var title = translate('meta.title', lang);
    if (title) document.title = title;

    var desc = translate('meta.description', lang);
    if (desc) {
      var tag = document.querySelector('meta[name="description"]');
      if (tag) tag.setAttribute('content', desc);
    }

    updateSwitchers(lang);
    document.dispatchEvent(new CustomEvent('melio:languagechange', {
      detail: { lang: lang, locale: info.locale, dir: info.dir }
    }));
  }

  /* Durée du fondu sortant. Assez long pour être perçu, assez court pour que la
     bascule reste instantanée à l'usage. */
  var SWAP_MS = 190;

  var reduceMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function commit(code, options) {
    current = code;
    remember(code);
    apply(code);

    if (!options || options.updateUrl !== false) {
      var url = new URL(window.location.href);
      if (code === DEFAULT) url.searchParams.delete('lang');
      else url.searchParams.set('lang', code);
      window.history.replaceState({}, '', url.toString());
    }
  }

  /* La page s'estompe le temps de l'échange, puis revient. Le fondu ne sert pas
     qu'à faire joli : il masque le reflux de la mise en page, très visible en
     arabe où toute la page bascule de droite à gauche, et les sauts de hauteur
     quand une traduction est plus longue que l'autre. */
  function setLanguage(lang, options) {
    var code = supported(lang) || DEFAULT;

    /* Rechoisir la langue déjà active ne doit pas faire clignoter la page. */
    if (code === current) return;

    var root = document.documentElement;

    if (reduceMotion) { commit(code, options); return; }

    root.classList.add('lang-swapping');

    window.setTimeout(function () {
      commit(code, options);

      /* Deux images d'attente : le nouveau texte doit être peint avant qu'on
         relance l'opacité, sinon on voit l'ancien et le nouveau se croiser. */
      window.requestAnimationFrame(function () {
        window.requestAnimationFrame(function () {
          root.classList.remove('lang-swapping');
        });
      });
    }, SWAP_MS);

    /* Filet : dans un onglet en arrière-plan, requestAnimationFrame est
       suspendu. Sans ce délai, la page resterait estompée jusqu'au retour de
       l'utilisateur. */
    window.setTimeout(function () {
      root.classList.remove('lang-swapping');
    }, SWAP_MS + 500);
  }

  /* ---------------------------------------------------------------- UI ---- */

  function buildSwitcher(container) {
    var variant = container.getAttribute('data-lang-switcher') || 'nav';
    container.classList.add('lang-switcher', 'lang-switcher--' + variant);
    container.innerHTML = '';

    var button = document.createElement('button');
    button.type = 'button';
    button.className = 'lang-trigger';
    button.setAttribute('aria-haspopup', 'listbox');
    button.setAttribute('aria-expanded', 'false');
    button.innerHTML =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" ' +
      'stroke-linecap="round" aria-hidden="true">' +
      '<circle cx="12" cy="12" r="9"></circle>' +
      '<path d="M3 12h18"></path>' +
      '<path d="M12 3a15 15 0 0 1 0 18a15 15 0 0 1 0-18"></path></svg>' +
      '<span class="lang-trigger-label"></span>' +
      '<svg class="lang-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
      'stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<path d="m6 9 6 6 6-6"></path></svg>';

    var list = document.createElement('ul');
    list.className = 'lang-menu';
    list.setAttribute('role', 'listbox');

    LANGS.forEach(function (item) {
      var li = document.createElement('li');
      var option = document.createElement('button');
      option.type = 'button';
      option.className = 'lang-option';
      option.setAttribute('role', 'option');
      option.setAttribute('lang', item.code);
      option.dataset.lang = item.code;
      option.innerHTML =
        '<span class="lang-option-label">' + item.label + '</span>' +
        '<span class="lang-option-check" aria-hidden="true">✓</span>';
      option.addEventListener('click', function () {
        setLanguage(item.code);
        close(container);
      });
      li.appendChild(option);
      list.appendChild(li);
    });

    button.addEventListener('click', function (event) {
      event.stopPropagation();
      var isOpen = container.classList.contains('open');
      closeAll();
      if (!isOpen) open(container);
    });

    container.appendChild(button);
    container.appendChild(list);
  }

  function open(container) {
    container.classList.add('open');
    container.querySelector('.lang-trigger').setAttribute('aria-expanded', 'true');
  }

  function close(container) {
    container.classList.remove('open');
    var trigger = container.querySelector('.lang-trigger');
    if (trigger) trigger.setAttribute('aria-expanded', 'false');
  }

  function closeAll() {
    document.querySelectorAll('.lang-switcher.open').forEach(close);
  }

  function updateSwitchers(lang) {
    var info = meta(lang);
    document.querySelectorAll('.lang-switcher').forEach(function (container) {
      var label = container.querySelector('.lang-trigger-label');
      if (label) label.textContent = info.short;

      var trigger = container.querySelector('.lang-trigger');
      if (trigger) {
        trigger.setAttribute('aria-label',
          (translate('a11y.language', lang) || 'Language') + ' : ' + info.label);
      }

      container.querySelectorAll('.lang-option').forEach(function (option) {
        var active = option.dataset.lang === lang;
        option.classList.toggle('active', active);
        option.setAttribute('aria-selected', active ? 'true' : 'false');
      });
    });
  }

  /* --------------------------------------------------------------- init --- */

  function init() {
    document.querySelectorAll('[data-lang-switcher]').forEach(buildSwitcher);
    document.addEventListener('click', closeAll);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeAll();
    });
    apply(current);
    document.documentElement.classList.remove('i18n-pending');
  }

  window.Melio = window.Melio || {};
  window.Melio.i18n = {
    languages: LANGS,
    get lang() { return current; },
    get locale() { return meta(current).locale; },
    t: translate,
    set: setLanguage,
    refresh: function () { apply(current); }
  };
  /* Raccourci : les scripts de page appellent Melio.t('stats.daily.title'). */
  window.Melio.t = function (key) { return translate(key); };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  /* Filet : si un script tiers casse avant l'init, la page ne doit pas rester
     masquée par la classe d'anti-scintillement. */
  window.setTimeout(function () {
    document.documentElement.classList.remove('i18n-pending');
  }, 1500);
})();
