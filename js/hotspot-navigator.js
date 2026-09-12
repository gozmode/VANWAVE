/* Hotspot Navigator v3.1 — configurable companion add-on for Will Myers Image Hotspots. */
(function (window, document) {
  'use strict';
  var DOT = '.image-hotspot-dot';
  var SOURCE = 'ImageHotspots[block], [data-wm-plugin="image-hotspots"]';

  function clean(value) { return value ? value.trim() : ''; }
  function sourceFor(nav) {
    var root = nav.closest ? (nav.closest('section') || nav.closest('.fluid-engine') || document) : document;
    var candidates = Array.prototype.slice.call(root.querySelectorAll(SOURCE));
    var before = candidates.filter(function (candidate) {
      return candidate !== nav && (candidate.compareDocumentPosition(nav) & Node.DOCUMENT_POSITION_FOLLOWING);
    });
    return before[before.length - 1] || candidates[0] || null;
  }
  function dotsFor(source) {
    var block = null;
    try { block = source && document.querySelector(source.getAttribute('block')); } catch (error) {}
    if (!block) return [];
    var scope = block.closest ? (block.closest('.sqs-block') || block.parentElement) : block.parentElement;
    return scope ? Array.prototype.slice.call(scope.querySelectorAll(DOT)) : [];
  }
  function init(nav) {
    if (nav.dataset.hsnReady === 'true') return;
    var source = sourceFor(nav), dots = dotsFor(source);
    if (!source || !dots.length) return;
    var titles = Array.prototype.slice.call(source.querySelectorAll('DotTitle'));
    var descriptions = Array.prototype.slice.call(source.querySelectorAll('DotDescription'));
    var data = dots.map(function (dot, index) {
      var box = descriptions[index];
      var info = box && box.querySelector('.hsn-info-title');
      var teaser = box && box.querySelector('.hsn-teaser');
      var longtext = box && box.querySelector('.hsn-longtext');
      return { dot: dot, number: clean(titles[index] && titles[index].textContent) || String(index + 1), title: clean(info && info.textContent) || 'Hotspot ' + (index + 1), teaser: teaser ? teaser.outerHTML : '', longtext: longtext ? longtext.outerHTML : '' };
    });
    nav.dataset.hsnReady = 'true';
    var navStyles = window.getComputedStyle(nav);
    dots.forEach(function (dot) {
      ['--hsn-dot-ring', '--hsn-dot-ring-width', '--hsn-dot-ring-gap', '--hsn-dot-glow'].forEach(function (name) {
        var value = navStyles.getPropertyValue(name).trim();
        if (value) dot.style.setProperty(name, value);
      });
    });
    nav.innerHTML = '<div class="hsn-list" role="list">' + data.map(function (item, index) {
      return '<article class="hsn-item" role="listitem"><button class="hsn-trigger" type="button" aria-expanded="false"><span class="hsn-number" aria-hidden="true">' + item.number + '</span><span class="hsn-copy"><span class="hsn-title">' + item.title.replace(/[&<>]/g, '') + '</span><span class="hsn-description">' + item.teaser + item.longtext + '</span></span></button></article>';
    }).join('') + '</div>';
    var items = Array.prototype.slice.call(nav.querySelectorAll('.hsn-item'));
    function activate(index, open) {
      items.forEach(function (item, i) { var active = i === index; item.classList.toggle('is-active', active); item.querySelector('.hsn-trigger').setAttribute('aria-expanded', active && open ? 'true' : 'false'); data[i].dot.classList.toggle('hsn-navigator-active', active); });
    }
    items.forEach(function (item, index) {
      var button = item.querySelector('.hsn-trigger');
      button.addEventListener('click', function () { activate(index, true); data[index].dot.click(); });
      button.addEventListener('mouseenter', function () { activate(index, false); });
      button.addEventListener('focus', function () { activate(index, false); });
      data[index].dot.addEventListener('mouseenter', function () { activate(index, false); });
      data[index].dot.addEventListener('focus', function () { activate(index, false); });
    });
    var observer = new MutationObserver(function (changes) { changes.forEach(function (change) { if (change.target.getAttribute('aria-expanded') === 'true') activate(data.findIndex(function (item) { return item.dot === change.target; }), true); }); });
    data.forEach(function (item) { observer.observe(item.dot, { attributes: true, attributeFilter: ['aria-expanded'] }); });
  }
  function scan() { Array.prototype.forEach.call(document.querySelectorAll('.hsn-navigator'), init); }
  window.HotspotNavigator = { init: scan };
  function start() { scan(); new MutationObserver(scan).observe(document.body, { childList: true, subtree: true }); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
}(window, document));
