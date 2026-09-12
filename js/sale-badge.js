document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('.summary-item').forEach(function (item) {
    const originalPrice = item.querySelector('.original-price');
    const status = item.querySelector('.summary-product-status');

    if (originalPrice && status && !status.textContent.trim()) {
      status.textContent = 'SALE';
      status.classList.add('custom-sale-badge');
    }
  });
});
