// Preishinweis unter dem Preis auf der Produktdetailseite mit Link auf "Versand".
// Der Text steht als Rückfall weiterhin per ::after im CSS (Abschnitt 04) - ein
// Link ist in ::after nicht möglich. Sobald dieses Script den echten Hinweis
// einfügt, blendet .has-price-note den ::after-Text aus.
// Linkziel hier ändern:
const SHIPPING_URL = 'https://vanwave.squarespace.com/agb';

document.addEventListener('DOMContentLoaded', function () {
  const detail = document.querySelector('.product-detail');
  const price = detail && detail.querySelector('.product-price-value');
  if (!price || detail.querySelector('.price-note')) return;

  const note = document.createElement('div');
  note.className = 'price-note';
  note.innerHTML = 'inkl. MwSt., zzgl. <a href="' + SHIPPING_URL + '" target="_self">Versand</a> (wird beim Checkout berechnet)';

  // Neben den Preis statt hinein: Squarespace überschreibt den Preistext beim
  // Variantenwechsel, ein eingefügtes Kind würde dabei verschwinden.
  price.insertAdjacentElement('afterend', note);
  detail.classList.add('has-price-note');
});
