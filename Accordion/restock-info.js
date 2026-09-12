document.addEventListener('DOMContentLoaded', function () {
  const productStatus = document.querySelector('.product-status');
  const restockCta = document.querySelector('.product-restock-cta');
  const restockForm = document.querySelector('.product-restock-form');
  const captcha = document.querySelector('.captcha-container');

  if (!productStatus || !restockCta || !restockForm) return;

  const wrapper = document.createElement('div');
  wrapper.className = 'custom-restock-wrapper';

  wrapper.appendChild(restockCta);
  wrapper.appendChild(restockForm);

  if (captcha) {
    wrapper.appendChild(captcha);
  }

  productStatus.insertAdjacentElement('afterend', wrapper);
});
