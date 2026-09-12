/*
  VANWAVE · Deutsche Texte und deine Website-Schriften im Kundenkonto

  Squarespace 7.1 · Code-Injection > Footer

  Dieses Script verändert ausschließlich Texte innerhalb des
  Squarespace-Kundenkontos. Es verändert nicht das Flyout, die Breite,
  die Position oder das Layout.
*/

(() => {
  'use strict';

  const translations = {
    'Account': 'Konto',
    'Address': 'Adresse',
    'Addresses': 'Adressen',
    'Add new address': 'Neue Adresse hinzufügen',
    'Close': 'Schließen',
    'Confirm New': 'Neu bestätigen',
    'Current': 'Aktuell',
    'Default': 'Standard',
    'Delete Address': 'Adresse löschen',
    'Delete Payment Method': 'Zahlungsmethode löschen',
    'Digital Products': 'Digitale Produkte',
    'Email': 'E-Mail',
    'Items': 'Artikel',
    'New': 'Neu',
    'New Address': 'Neue Adresse',
    'New Payment Method': 'Neue Zahlungsmethode',
    'No orders yet': 'Noch keine Bestellungen',
    'No saved addresses': 'Keine gespeicherten Adressen',
    'No saved payments': 'Keine gespeicherten Zahlungsmethoden',
    'Order': 'Bestellung',
    'Order Date': 'Bestelldatum',
    'Orders': 'Bestellungen',
    'Other': 'Weitere',
    'Password': 'Passwort',
    'Payment': 'Zahlung',
    'Payment Method': 'Zahlungsmethode',
    'Payment Methods': 'Zahlungsmethoden',
    'Profile': 'Profil',
    'Resend verification email': 'Bestätigungs-E-Mail erneut senden',
    'Search': 'Suchen',
    'Shipping': 'Versand',
    'Shipping Address': 'Lieferadresse',
    'Shipping Option': 'Versandoption',
    'Sign out': 'Abmelden',
    'Status': 'Status',
    'Subtotal': 'Zwischensumme',
    'Summary': 'Zusammenfassung',
    'Tax': 'Steuern',
    'Total': 'Gesamt',
    'Update Password': 'Passwort aktualisieren'
  };

  // Entspricht den Squarespace-Einstellungen:
  // Überschriften/Verschiedenes = Rama Gothic E, Absätze = Open Sans.
  const fontStyles = `
    #user-profile-page-root,
    #user-profile-page-root button,
    #user-profile-page-root a,
    #user-profile-page-root input,
    #user-profile-page-root label,
    #user-profile-page-root p,
    #user-profile-page-root span {
      font-family: 'Open Sans', Arial, sans-serif !important;
    }

    #user-profile-page-root h1,
    #user-profile-page-root h2,
    #user-profile-page-root h3,
    #user-profile-page-root h4,
    #user-profile-page-root h5,
    #user-profile-page-root h6,
    #user-profile-page-root [role='heading'] {
      font-family: 'Rama Gothic E', Arial, sans-serif !important;
    }
  `;

  let currentFrame = null;
  let currentDocument = null;

  function translate(root) {
    if (!root) return;

    const walker = root.ownerDocument.createTreeWalker(root, 4);
    const nodes = [];

    while (walker.nextNode()) nodes.push(walker.currentNode);

    nodes.forEach((node) => {
      const original = node.nodeValue;
      const trimmed = original.trim();
      let replacement = translations[trimmed];

      if (!replacement) {
        replacement = trimmed.replace(/^Hi,\s*/i, 'Moin, ');
        if (replacement === trimmed) return;
      }

      node.nodeValue = original.replace(trimmed, replacement);
    });

    root.querySelectorAll('[aria-label], [title], input[placeholder]').forEach((element) => {
      ['aria-label', 'title', 'placeholder'].forEach((attribute) => {
        const value = element.getAttribute(attribute);
        const replacement = value && translations[value.trim()];
        if (replacement) element.setAttribute(attribute, replacement);
      });
    });
  }

  function translateFrame(frame) {
    try {
      const accountDocument = frame.contentDocument;
      if (!accountDocument || !accountDocument.body) return;

      if (!accountDocument.head.querySelector('style[data-vanwave-account-fonts]')) {
        const style = accountDocument.createElement('style');
        style.dataset.vanwaveAccountFonts = '';
        style.textContent = fontStyles;
        accountDocument.head.appendChild(style);
      }

      translate(accountDocument.body);

      if (accountDocument !== currentDocument) {
        currentDocument = accountDocument;
        new MutationObserver(() => translate(accountDocument.body)).observe(accountDocument.body, {
          childList: true,
          characterData: true,
          subtree: true
        });
      }
    } catch (error) {
      // Das Konto kann während des Ladens kurzzeitig noch nicht zugänglich sein.
    }
  }

  function scan() {
    const frame = document.querySelector('#accountFrame');

    if (frame !== currentFrame) {
      currentFrame = frame;
      currentDocument = null;

      if (frame) {
        frame.addEventListener('load', () => {
          currentDocument = null;
          translateFrame(frame);
        });
      }
    }

    if (frame) translateFrame(frame);
  }

  function start() {
    scan();
    new MutationObserver(scan).observe(document.body, { childList: true, subtree: true });
    window.setInterval(scan, 1000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
