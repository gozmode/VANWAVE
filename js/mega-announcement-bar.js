// Aufklappbare Ankündigungsleiste oben auf der Seite (gleiches Prinzip wie
// im Repo gozmode/BRANDT).
//
// - Text der Leiste: aus der nativen Squarespace-Ankündigungsleiste
//   (Marketing > Ankündigungsleiste). Ist sie aus oder leer, entsteht
//   unsere Leiste gar nicht. Die native Leiste selbst blendet das CSS aus
//   (Abschnitt 12 in vanwave-custom-css.css).
// - Aufklappbarer Inhalt: erster Abschnitt der eigenständigen, nicht im
//   Menü verlinkten Seite /announce. Fehlt die Seite, gibt es nur die
//   Leiste ohne Aufklappen.
// - X: blendet die Leiste aus, bis der Text in Squarespace geändert wird.

(function () {
  'use strict';

  var CONTENT_URL = '/announce';
  var STORAGE_KEY = 'vw-announcement-closed';

  // Übergang: Früher kam der Inhalt aus dieser Extra-Footer-Sektion. Solange
  // sie noch existiert, bleibt sie ausgeblendet und dient als Ersatz-Inhalt,
  // falls /announce noch nicht angelegt ist. Sobald die Sektion in
  // Squarespace gelöscht ist, kann dieser Block entfallen.
  var LEGACY_SECTION_ID = '6aa6ba2cc7c1be040da45df4';

  function start() {
    var legacy = document.querySelector('section[data-section-id="' + LEGACY_SECTION_ID + '"]');
    if (legacy) legacy.classList.add('original-footer-section');

    // Squarespace füllt .sqs-announcement-bar-text-inner erst nach
    // DOMContentLoaded - deshalb mit Wiederholungen prüfen (max. 3 s).
    (function waitForText(attempt) {
      var native = document.querySelector('.sqs-announcement-bar-text-inner');
      var text = native && native.innerText.trim();

      if (text) {
        build(text, legacy);
      } else if (attempt < 10) {
        setTimeout(function () {
          waitForText(attempt + 1);
        }, 300);
      }
    })(0);
  }

  function readClosed() {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch (error) {
      return null;
    }
  }

  function build(triggerText, legacy) {
    // Genau diese Ankündigung wurde bereits per X geschlossen.
    if (readClosed() === triggerText) return;

    var wrapper = document.createElement('div');
    wrapper.className = 'announcement-bar-wrapper no-content';

    var trigger = document.createElement('div');
    trigger.className = 'announcement-trigger';
    trigger.innerHTML =
      '<span class="announcement-trigger-text"></span>' +
      '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
      '<path d="M19 9l-7 7-7-7"></path></svg>' +
      '<div class="close-button">✕</div>';
    trigger.querySelector('.announcement-trigger-text').textContent = triggerText;

    var content = document.createElement('div');
    content.className = 'announcement-content';

    var inner = document.createElement('div');
    inner.className = 'announcement-inner';
    content.appendChild(inner);

    wrapper.appendChild(trigger);
    wrapper.appendChild(content);
    document.body.insertBefore(wrapper, document.body.firstChild);

    function setContent(section) {
      if (!section || inner.firstChild) return;
      inner.appendChild(section);
      wrapper.classList.remove('no-content');
    }

    function useLegacy() {
      if (!legacy) return;
      var clone = legacy.cloneNode(true);
      clone.classList.remove('original-footer-section');
      setContent(clone);
    }

    fetch(CONTENT_URL)
      .then(function (response) {
        // Auch die 404-Seite enthält einen Abschnitt - deshalb Status prüfen.
        if (!response.ok) throw new Error(String(response.status));
        return response.text();
      })
      .then(function (html) {
        var doc = new DOMParser().parseFromString(html, 'text/html');
        var section = doc.querySelector('#page .page-section, main .page-section');
        if (section) setContent(document.importNode(section, true));
        else useLegacy();
      })
      .catch(useLegacy);

    // Nur die Trigger-Zeile verdrängt den Header (hier position:absolute) -
    // der aufklappende Inhalt schwebt darüber und nimmt keinen Platz ein.
    var header = document.querySelector('header');

    function updateOffset() {
      var barHeight = trigger.getBoundingClientRect().height;
      if (header) header.style.top = barHeight + 'px';
      document.body.style.paddingTop = barHeight + 'px';
    }

    var isOpen = false;

    function toggle(shouldOpen) {
      isOpen = wrapper.classList.contains('no-content') ? false : shouldOpen;
      content.classList.toggle('active', isOpen);
      trigger.classList.toggle('active', isOpen);
      document.body.classList.toggle('announcement-open', isOpen);
    }

    updateOffset();
    window.addEventListener('resize', updateOffset);

    trigger.addEventListener('click', function (event) {
      if (event.target.closest('.close-button')) return; // eigener Handler unten
      toggle(!isOpen);
    });

    document.addEventListener('click', function (event) {
      if (isOpen && !wrapper.contains(event.target)) toggle(false);
    });

    trigger.querySelector('.close-button').addEventListener('click', function () {
      try {
        localStorage.setItem(STORAGE_KEY, triggerText);
      } catch (error) {
        // Ohne Speicher gilt das Schließen nur für diese Seite.
      }
      window.removeEventListener('resize', updateOffset);
      document.body.classList.remove('announcement-open');
      wrapper.remove();
      if (header) header.style.top = '';
      document.body.style.paddingTop = '';
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
})();
