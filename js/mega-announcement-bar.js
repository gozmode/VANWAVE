document.addEventListener('DOMContentLoaded', function () {
  // Extra-Footer-Sektion, die als Quelle für die Ankündigungsleiste dient
  const footerSectionId = "6aa6ba2cc7c1be040da45df4";
  const originalFooter = document.querySelector(`section[data-section-id="${footerSectionId}"]`);

  if (!originalFooter) return;

  // Wurde die Leiste bereits per X dauerhaft geschlossen? Dann gar nicht erst aufbauen.
  const STORAGE_KEY = 'announcement-state';
  if (localStorage.getItem(STORAGE_KEY) === 'closed') return;

  // Original-Sektion markieren, damit unser CSS sie ausblenden kann
  originalFooter.classList.add('original-footer-section');

  // Struktur der Ankündigungsleiste aufbauen
  const wrapper = document.createElement('div');
  wrapper.className = 'announcement-bar-wrapper';

  const trigger = document.createElement('div');
  trigger.className = 'announcement-trigger';
  trigger.innerHTML = `
    Relaunch-Rabatt: 5% auf alles
    <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M19 9l-7 7-7-7"></path>
    </svg>
    <div class="close-button">✕</div>
  `;

  const content = document.createElement('div');
  content.className = 'announcement-content';

  const innerContent = document.createElement('div');
  innerContent.className = 'announcement-inner';

  // Inhalt der Extra-Footer-Sektion klonen
  const clonedFooter = originalFooter.cloneNode(true);
  clonedFooter.classList.remove('original-footer-section');
  innerContent.appendChild(clonedFooter);
  content.appendChild(innerContent);

  // Zusammensetzen
  wrapper.appendChild(trigger);
  wrapper.appendChild(content);
  document.body.insertBefore(wrapper, document.body.firstChild);

  // Header um die tatsächliche Höhe der Leiste nach unten schieben
  // (Header ist hier position:absolute, nicht fixed - Prinzip ist aber dasselbe)
  const header = document.querySelector('header');

  function updateOffset() {
    const barHeight = wrapper.getBoundingClientRect().height;
    if (header) header.style.top = barHeight + 'px';
    document.body.style.paddingTop = barHeight + 'px';
  }

  // Auf-/Zuklapp-Logik
  let isOpen = false;

  function toggleAnnouncement(shouldOpen = !isOpen) {
    isOpen = shouldOpen;

    if (shouldOpen) {
      content.classList.add('active');
      trigger.classList.add('active');
      document.body.classList.add('announcement-open');
    } else {
      content.classList.remove('active');
      trigger.classList.remove('active');
      document.body.classList.remove('announcement-open');
    }

    // Höhe ändert sich durch die CSS-Transition (max-height) erst nach und nach
    updateOffset();
    setTimeout(updateOffset, 550);
  }

  updateOffset();
  window.addEventListener('resize', updateOffset);

  trigger.addEventListener('click', (e) => {
    if (e.target.classList.contains('close-button')) return; // eigener Handler unten
    toggleAnnouncement();
  });

  // Schließen bei Klick außerhalb
  document.addEventListener('click', (e) => {
    if (isOpen && !wrapper.contains(e.target)) {
      toggleAnnouncement(false);
    }
  });

  // X: Leiste komplett und dauerhaft ausblenden (nicht nur den Inhalt zuklappen)
  const closeButton = wrapper.querySelector('.close-button');
  closeButton.addEventListener('click', () => {
    localStorage.setItem(STORAGE_KEY, 'closed');
    wrapper.remove();
    if (header) header.style.top = '';
    document.body.style.paddingTop = '';
  });
});
