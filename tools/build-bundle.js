#!/usr/bin/env node
// Baut aus den Einzeldateien unter js/ die Sammeldatei dist/vanwave.js,
// die in Squarespace mit einer einzigen <script defer>-Zeile geladen wird.
//
//   node tools/build-bundle.js           Sammeldatei neu schreiben
//   node tools/build-bundle.js --check   nur prüfen, ob sie aktuell ist
//
// Bearbeitet werden immer die Einzeldateien, nie dist/vanwave.js.

'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const OUTPUT = 'dist/vanwave.js';

// Reihenfolge = bisherige Ausführungsreihenfolge der einzelnen
// <script defer>-Zeilen (erst Header-, dann Footer-Code-Injection).
// Nicht enthalten: js/mega-menu-settings.js - muss ohne defer direkt vor
// dem Mega-Menü-Plugin laden und bleibt deshalb eine eigene Zeile.
const FILES = [
  'js/mega-announcement-bar.js',
  'js/sale-badge.js',
  'js/bundle-badge.js',
  'js/restock-info.js',
  'js/sale-page-filter.js',
  'js/section-slider-progress-bullets.js',
  'js/header-search-icon.js',
  'js/refurbished.js',
  'js/price-note.js',
  'js/create-accordions.js',
  'js/hotspot-navigator.js',
  'js/add-ons-heading.js',
  'js/account-translations.js',
  'js/shop-filter-anchor.js',
  'js/shop-filter-category-links.js',
  'js/shop-filter-remove-empty.js',
  'js/shop-filter-heading.js'
];

function build() {
  const parts = [
    '/* VANWAVE - Sammeldatei aller eigenen Skripte.',
    ' * Automatisch erzeugt von tools/build-bundle.js - nicht von Hand ändern.',
    ' * Quellen: ' + FILES.length + ' Dateien unter js/ (Reihenfolge siehe Bau-Skript). */',
    ''
  ];

  FILES.forEach(function (file) {
    const source = fs.readFileSync(path.join(ROOT, file), 'utf8').replace(/\s+$/, '');

    // Ein Syntaxfehler in einer Datei würde die ganze Sammeldatei lahmlegen.
    new vm.Script(source, { filename: file });

    // Jede Datei läuft für sich in try/catch: Wirft eine beim Start einen
    // Fehler, laufen die übrigen trotzdem und die Konsole nennt die Quelle.
    parts.push(
      '/* ===== ' + file + ' ===== */',
      'try {',
      source,
      '} catch (error) {',
      "  console.error('[VANWAVE] " + file + "', error);",
      '}',
      ''
    );
  });

  const bundle = parts.join('\n');
  new vm.Script(bundle, { filename: OUTPUT });
  return bundle;
}

const bundle = build();
const target = path.join(ROOT, OUTPUT);
const current = fs.existsSync(target) ? fs.readFileSync(target, 'utf8') : null;

if (process.argv.includes('--check')) {
  if (current !== bundle) {
    console.error(OUTPUT + ' ist nicht aktuell. Bitte "node tools/build-bundle.js" ausführen und die Datei mit committen.');
    process.exit(1);
  }
  console.log(OUTPUT + ' ist aktuell.');
} else {
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, bundle);
  console.log(OUTPUT + ' geschrieben (' + FILES.length + ' Dateien, ' + Buffer.byteLength(bundle) + ' Bytes).');
}
