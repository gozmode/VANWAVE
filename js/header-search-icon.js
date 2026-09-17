// Fügt links vom Konto-Link im Header ein Such-Icon ein, das zu /search
// verlinkt. Die Optik (Icon-Maske) kommt aus vanwave-custom-css.css,
// Abschnitt 15 - dieses Skript erzeugt nur das Element selbst, da reines
// CSS keine neuen, klickbaren Elemente einfügen kann.

document.addEventListener('DOMContentLoaded', function () {
  const accountLink = document.querySelector('.header-actions .user-accounts-link');
  if (!accountLink || document.querySelector('.header-search-icon')) return;

  const searchLink = document.createElement('a');
  searchLink.href = '/search';
  searchLink.className = 'header-search-icon';
  searchLink.setAttribute('aria-label', 'Suche');

  accountLink.parentNode.insertBefore(searchLink, accountLink);
});
