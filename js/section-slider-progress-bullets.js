// Alternative Bullet-Darstellung für den Will-Myers Section Slider:
// dünne Striche statt Punkte, der aktive Strich füllt sich über die
// Autoplay-Dauer (data-autoplay-timer) hinweg auf.
//
// Aktivieren pro Slider: dem data-wm-plugin="section-slider"-Div
// zusätzlich data-render-bullet="progressBullet" geben.

window.wmSectionSliderSettings = Object.assign({}, window.wmSectionSliderSettings, {
  progressBullet: function (index, className) {
    return `<span class="${className} progress-bullet"><span class="progress-bullet-fill"></span></span>`;
  }
});

document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('[data-wm-plugin="section-slider"]').forEach(function (el) {
    const timerMs = parseInt(el.getAttribute('data-autoplay-timer'), 10) || 4500;
    const scope = el.closest('.sqs-block') || el.parentElement;
    if (scope) {
      scope.style.setProperty('--wm-slider-autoplay-duration', (timerMs / 1000) + 's');
    }
  });
});
