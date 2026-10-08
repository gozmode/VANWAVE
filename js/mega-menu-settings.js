// Ergänzt die Standardwerte, überschreibt aber nicht, was im Footer bereits vor
// diesem Skript per window.wmMegaMenuSettings gesetzt wurde (z.B. showOnMobile) -
// sonst gehen dort gesetzte Optionen verloren, bevor das Plugin sie liest.
window.wmMegaMenuSettings = Object.assign(
  {
    layout: 'full-width', // full-width or inset
    openAnimation: 'slide', // slide, fade, or swing
    openOnClick: false // false = am Desktop beim Überfahren öffnen
  },
  window.wmMegaMenuSettings
)
