// Adds Collapse All / Expand All buttons and collapses opblocks by default
(function () {

  // Inject custom styles to top-align tag header and description
  function injectStyles() {
    if (document.getElementById('swagger-custom-styles')) return;
    var style = document.createElement('style');
    style.id = 'swagger-custom-styles';
    style.type = 'text/css';
    style.textContent = `
/* Use grid layout for opblock tag header + description and vertically center them */
.swagger-ui .opblock-tag {
  display: grid !important;
  grid-template-columns: auto 1fr !important;
  align-items: center !important; /* center vertically so header and subtitle share a horizontal baseline */
  gap: 16px !important;
  column-gap: 16px !important;
}

/* Ensure title and description have no extra margins and center vertically */
.swagger-ui .opblock-tag h2,
.swagger-ui .opblock-tag-section h2,
.swagger-ui .tag h2 {
  margin: 0 !important;
  padding: 0 !important;
  line-height: 1.2 !important;
  align-self: center !important;
}

.swagger-ui .opblock-tag .markdown,
.swagger-ui .opblock-tag-section .markdown,
.swagger-ui .tag .markdown {
  margin: 0 !important;
  align-self: center !important;
}

/* Responsive: stack on narrow screens */
@media (max-width: 700px) {
  .swagger-ui .opblock-tag {
    grid-template-columns: 1fr !important;
    grid-auto-rows: auto !important;
  }
  .swagger-ui .opblock-tag .markdown {
    margin-top: 8px !important;
  }
}
`;
    document.head.appendChild(style);
  }
  injectStyles();

  function collapseAll() {
    document.querySelectorAll('.opblock').forEach(function (el) { el.classList.add('opblock-collapsed'); });
  }

  function expandAll() {
    document.querySelectorAll('.opblock').forEach(function (el) { el.classList.remove('opblock-collapsed'); });
  }

  function insertButtons() {
    var topbar = document.querySelector('.swagger-ui .topbar');
    if (!topbar) return false;

    // Avoid duplicate insertion
    if (document.getElementById('swagger-collapse-expand-container')) return true;

    var container = document.createElement('div');
    container.id = 'swagger-collapse-expand-container';
    container.style.display = 'inline-flex';
    container.style.alignItems = 'center';
    container.style.marginLeft = '12px';

    function makeBtn(text, handler) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'btn';
      b.style.marginRight = '6px';
      b.style.padding = '6px 10px';
      b.style.border = '1px solid rgba(0,0,0,0.15)';
      b.style.background = '#fff';
      b.style.borderRadius = '4px';
      b.style.cursor = 'pointer';
      b.textContent = text;
      b.addEventListener('click', handler);
      return b;
    }

    var btnCollapse = makeBtn('Collapse All', collapseAll);
    var btnExpand = makeBtn('Expand All', expandAll);

    container.appendChild(btnCollapse);
    container.appendChild(btnExpand);

    // Insert before the search/input area if present, otherwise append
    var right = topbar.querySelector('.download-url-wrapper') || topbar.querySelector('.topbar-wrapper') || topbar;
    right.appendChild(container);
    return true;
  }

  // Try insert immediately, otherwise observe for DOM changes
  if (!insertButtons()) {
    var obs = new MutationObserver(function (mutations, observer) {
      if (insertButtons()) observer.disconnect();
    });
    obs.observe(document.body, { childList: true, subtree: true });
  }

  // Collapse by default after a short delay (in case opblocks are rendered later)
  setTimeout(collapseAll, 300);

  // Expose helpers for debugging
  window.swaggerCollapseAll = collapseAll;
  window.swaggerExpandAll = expandAll;
})();