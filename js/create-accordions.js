function createAccordion(selector = '.ProductItem-details-excerpt') {
  // Get all matching container elements
  const containers = document.querySelectorAll(selector);
  if (containers.length === 0) {
    console.warn(`No accordion containers matching "${selector}" found on page`);
    return;
  }

  // Process each container
  containers.forEach((container, containerIndex) => {
    // Check for required h1 elements
    if (!container.querySelector('h1')) {
      console.warn(`No accordion content (h1 elements) found in container "${selector}" at index ${containerIndex}`);
      return;
    }

    const accordionContent = [];
    let currentSection = null;
    let sectionContent = [];
    let introContent = [];

    // Process all child elements (Elemente statt HTML-Strings sammeln, damit sich
    // Abschluss-Boxen am Ende noch anhand ihres Tags erkennen und heraustrennen lassen)
    Array.from(container.children).forEach((element, index, array) => {
      if (element.tagName === 'H1') {
        if (currentSection) {
          accordionContent.push({
            title: currentSection,
            content: sectionContent
          });
        }
        currentSection = element.textContent;
        sectionContent = [];
      } else if (currentSection) {
        sectionContent.push(element);

        if (index === array.length - 1) {
          accordionContent.push({
            title: currentSection,
            content: sectionContent
          });
        }
      } else {
        introContent.push(element.outerHTML);
      }
    });

    if (accordionContent.length === 0) {
      console.warn(`No accordion sections found to process in container at index ${containerIndex}`);
      return;
    }

    // Abschluss-Boxen (Zustandsbox als Zitat-Block, "Kompatibel mit" als rein kursiver
    // Absatz) sollen immer sichtbar nach dem Akkordeon stehen: vom Ende des letzten
    // Abschnitts alle zusammenhängenden Box-Elemente abtrennen.
    function isClosingBox(el) {
      if (el.tagName === 'BLOCKQUOTE') return true;
      if (el.tagName === 'P' && el.children.length === 1 &&
          (el.children[0].tagName === 'EM' || el.children[0].tagName === 'STRONG')) return true;
      return false;
    }

    const outroContent = [];
    const lastSection = accordionContent[accordionContent.length - 1];
    while (lastSection.content.length > 0 && isClosingBox(lastSection.content[lastSection.content.length - 1])) {
      outroContent.unshift(lastSection.content.pop());
    }

    try {
      // Create wrapper element
      const wrapper = document.createElement('div');
      wrapper.innerHTML = introContent.join('');

      // Create accordion container
      const accordionContainer = document.createElement('div');
      accordionContainer.className = 'accordion';
      accordionContainer.setAttribute('role', 'presentation');

      // Add each accordion section
      accordionContent.forEach((section, index) => {
        const accordionItem = document.createElement('div');
        accordionItem.className = 'accordion-item';

        const button = document.createElement('button');
        button.className = 'accordion-trigger';
        button.id = `accordion-trigger-${containerIndex}-${index}`;
        button.setAttribute('aria-controls', `accordion-content-${containerIndex}-${index}`);
        button.setAttribute('aria-expanded', 'false');
        button.setAttribute('role', 'button');

        const titleSpan = document.createElement('span');
        titleSpan.className = 'accordion-title';
        titleSpan.textContent = section.title;

        const iconSpan = document.createElement('span');
        iconSpan.className = 'accordion-icon';
        iconSpan.setAttribute('aria-hidden', 'true');

        const content = document.createElement('div');
        content.className = 'accordion-content';
        content.id = `accordion-content-${containerIndex}-${index}`;
        content.setAttribute('role', 'region');
        content.setAttribute('aria-labelledby', `accordion-trigger-${containerIndex}-${index}`);
        content.hidden = true;
        content.innerHTML = section.content.map((el) => el.outerHTML).join('');

        // Add click handler directly to this button
        button.addEventListener('click', () => {
          const isExpanded = button.getAttribute('aria-expanded') === 'true';
          button.setAttribute('aria-expanded', !isExpanded);
          content.hidden = isExpanded;
        });

        button.appendChild(titleSpan);
        button.appendChild(iconSpan);
        accordionItem.appendChild(button);
        accordionItem.appendChild(content);
        accordionContainer.appendChild(accordionItem);
      });

      wrapper.appendChild(accordionContainer);
      outroContent.forEach((el) => wrapper.appendChild(el));

      // Replace container contents
      container.innerHTML = '';
      container.appendChild(wrapper);

    } catch (error) {
      console.error(`Error creating accordion in container ${containerIndex}:`, error);
    }
  });
}

createAccordion('.product-description');