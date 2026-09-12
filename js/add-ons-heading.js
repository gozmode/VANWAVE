document.addEventListener('DOMContentLoaded', function () {
  var addOns = document.querySelector('.product-add-ons');
  if (addOns && !document.querySelector('.add-ons-heading')) {
    var heading = document.createElement('h3');
    heading.className = 'add-ons-heading';
    heading.textContent = 'Passende Ergänzungen'; // change this text as you like
    addOns.parentNode.insertBefore(heading, addOns);
  }
});
