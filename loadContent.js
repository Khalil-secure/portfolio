// ═══════════════════════════════════════════════════════════════════════
// Content Loader - Dynamically load portfolio content from JSON
// ═══════════════════════════════════════════════════════════════════════

let CONTENT_DATA = null;

async function loadContentData() {
  try {
    const response = await fetch('content.json');
    if (!response.ok) throw new Error('Failed to fetch content.json');
    CONTENT_DATA = await response.json();
    
    // Apply initial language
    applyContent(window.currentLang || 'en');
    return true;
  } catch (error) {
    console.error('Error loading content:', error);
    return false;
  }
}

/**
 * Apply content to DOM based on current language
 * @param {string} lang - Language code ('en' or 'fr')
 */
function applyContent(lang) {
  if (!CONTENT_DATA) {
    console.warn('Content data not loaded yet');
    return;
  }

  const c = CONTENT_DATA;
  const t = lang === 'fr' ? 'fr' : 'en';

  // ── Logo
  const logoEl = document.querySelector('.logo');
  if (logoEl) {
    logoEl.innerHTML = `${c.personal.logo_text}<em>${c.personal.logo_suffix}</em>`;
  }

  // ── Top bar - Availability
  const availTxt = document.getElementById('avail-txt');
  if (availTxt) availTxt.textContent = c.availability[t];

  // ── Home section
  const eyebrowTxt = document.getElementById('eyebrow-txt');
  if (eyebrowTxt) eyebrowTxt.textContent = c.home.eyebrow[t];

  const taglineTxt = document.getElementById('tagline-txt');
  if (taglineTxt) taglineTxt.textContent = c.home.tagline[t];

  const descTxt = document.getElementById('desc-txt');
  if (descTxt) descTxt.innerHTML = c.home.description[t];

  const stackLabelTxt = document.getElementById('stack-label-txt');
  if (stackLabelTxt) stackLabelTxt.textContent = c.home.stack_label[t];

  // ── Experience section
  const expTitle = document.getElementById('exp-title');
  if (expTitle) expTitle.innerHTML = c.experience.title[t];

  const expSub = document.getElementById('exp-sub');
  if (expSub) expSub.textContent = c.experience.subtitle[t];

  // Apply experience entries
  c.experience.jobs.forEach((job, idx) => {
    const roleEl = document.getElementById(`role-${idx}`);
    if (roleEl) roleEl.textContent = job.role[t];

    const bulletsList = document.getElementById(`bullets-${idx}`);
    if (bulletsList) {
      const lis = bulletsList.querySelectorAll('li');
      lis.forEach((li, bulletIdx) => {
        if (job.bullets[t] && job.bullets[t][bulletIdx]) {
          li.innerHTML = job.bullets[t][bulletIdx];
        }
      });
    }
  });

  // ── Projects section
  const projTitle = document.getElementById('proj-title');
  if (projTitle) projTitle.innerHTML = c.projects.title[t];

  const btnCodeTxt = document.getElementById('btn-code-txt');
  if (btnCodeTxt) btnCodeTxt.textContent = c.projects.toggles.code[t];

  const btnDemoTxt = document.getElementById('btn-demo-txt');
  if (btnDemoTxt) btnDemoTxt.textContent = c.projects.toggles.demo[t];

  const projSubCode = document.getElementById('proj-sub-code');
  if (projSubCode) projSubCode.textContent = c.projects.subtitles.code[t];

  const projSubDemo = document.getElementById('proj-sub-demo');
  if (projSubDemo) projSubDemo.textContent = c.projects.subtitles.demo[t];

  const loadMoreBtn = document.getElementById('load-more-btn');
  if (loadMoreBtn) loadMoreBtn.textContent = c.projects.load_more[t];

  // ── Certifications section
  const certTitle = document.getElementById('cert-title');
  if (certTitle) certTitle.innerHTML = c.certifications.title[t];

  const certSub = document.getElementById('cert-sub');
  if (certSub) certSub.textContent = c.certifications.subtitle[t];

  // Apply certification descriptions
  c.certifications.certs.forEach((cert, idx) => {
    const certDesc = document.getElementById(`cert-desc-${idx}`);
    if (certDesc) certDesc.textContent = cert.description[t];
  });

  // Regenerate demos with updated language
  if (window._demosLoaded) {
    window._demosLoaded = false;
    renderDemosFromData();
  }
}

/**
 * Render demos using content data instead of hardcoded DEMOS array
 */
function renderDemosFromData() {
  if (!CONTENT_DATA) return;

  const lang = window.currentLang || 'en';
  const gifSoon = lang === 'fr' ? 'GIF bientôt disponible' : 'GIF coming soon';
  const grid = document.getElementById('demos-grid');
  
  if (!grid) return;
  
  grid.innerHTML = '';

  CONTENT_DATA.projects.demos.forEach(function(d) {
    const desc = lang === 'fr' ? d.description.fr : d.description.en;
    const thumb = d.gif 
      ? `<img src="${d.gif}" alt="${d.title}" loading="lazy">`
      : `<div class="demo-thumb-placeholder"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polygon points="5 3 19 12 5 21 5 3"/></svg><span>${gifSoon}</span></div>`;
    
    const tags = d.stack.map(function(t) { return `<span class="demo-tag">${t}</span>`; }).join('');
    const ghBtn = d.repo ? `<a href="${d.repo}" target="_blank" class="demo-link demo-link-gh">GitHub</a>` : '';
    const playBtn = d.repo ? `<a href="${d.repo}" target="_blank" class="demo-play"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg></a>` : '';

    const card = `
      <div class="demo-card">
        <div class="demo-thumb">
          ${thumb}
          <span class="demo-badge ${d.badge}">${d.badge_label}</span>
          ${playBtn}
        </div>
        <div class="demo-body">
          <div class="demo-title">${d.title}</div>
          <div class="demo-desc">${desc}</div>
          <div class="demo-stack">${tags}</div>
          <div class="demo-links">${ghBtn}</div>
        </div>
      </div>
    `;
    
    grid.innerHTML += card;
  });

  window._demosLoaded = true;
}

/**
 * Override the original setLang function to also apply content
 */
const originalSetLang = window.setLang;
window.setLang = function(lang, btn) {
  window.currentLang = lang;
  
  // Original language setup for nav buttons
  document.querySelectorAll('.lang-btn').forEach(function(b) { 
    b.classList.remove('active'); 
  });
  btn.classList.add('active');
  document.documentElement.lang = lang;

  // Apply content from JSON data
  applyContent(lang);
};

/**
 * Initialize content loader on page load
 */
document.addEventListener('DOMContentLoaded', async function() {
  const success = await loadContentData();
  if (!success) {
    console.warn('Content auto-loader: Failed to load content.json, falling back to hardcoded content');
  }
});

// Ensure content is loaded if script runs after DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadContentData);
} else {
  loadContentData();
}