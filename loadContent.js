// ═══════════════════════════════════════════════════════════════════════
// loadContent.js — Single source of truth for all portfolio content
// Fetches content.json and renders everything dynamically into the shell HTML
// ═══════════════════════════════════════════════════════════════════════

var CONTENT_DATA = null;

// SVG icons for social links
var SOCIAL_ICONS = {
  github: '<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/></svg>',
  linkedin: '<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>',
  email: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>',
  resume: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>'
};

// CSS class mapping for experience tags
var TAG_CLASSES = {
  '5G':'tag-proto','LTE':'tag-proto','FTTH':'tag-proto','NFC':'tag-proto',
  'ANSSI':'tag-sec','CIS':'tag-sec','Security':'tag-sec',
  'Python':'tag-lang','Bash':'tag-lang','Go':'tag-lang','JavaScript':'tag-lang','TypeScript':'tag-lang','Java':'tag-lang',
  'PyTorch':'tag-ml','TensorFlow':'tag-ml','Matlab':'tag-ml','ML':'tag-ml',
  'REST API':'tag-infra','Linux':'tag-infra','Docker':'tag-infra','Kubernetes':'tag-infra',
  'Centreon':'tag-infra','Hyper-V':'tag-infra','Terraform':'tag-infra','Azure':'tag-infra',
  'AWS':'tag-infra','VMware':'tag-infra','Grafana':'tag-infra','Prometheus':'tag-infra'
};

function tagClass(tag) {
  return TAG_CLASSES[tag] || 'tag-proto';
}

// ── Fetch content.json (with cache-busting so Vercel always serves fresh data)
async function loadContentData() {
  try {
    var res = await fetch('content.json?v=' + Date.now());
    if (!res.ok) throw new Error('content.json fetch failed: ' + res.status);
    CONTENT_DATA = await res.json();
    renderAll(window.currentLang || 'en');
    return true;
  } catch (e) {
    console.error('loadContent: could not load content.json', e);
    return false;
  }
}

// ── Render everything for a given language
function renderAll(lang) {
  if (!CONTENT_DATA) return;
  renderLogo();
  renderNav(lang);
  renderAvailability(lang);
  renderHome(lang);
  renderExperience(lang);
  renderProjectsText(lang);
  renderCertifications(lang);
  // Re-render demos if they were already displayed
  if (window._demosLoaded) {
    window._demosLoaded = false;
    renderDemos();
  }
}

function renderLogo() {
  var el = document.getElementById('logo');
  if (el) el.innerHTML = CONTENT_DATA.personal.logo_text + '<em>' + CONTENT_DATA.personal.logo_suffix + '</em>';
}

function renderNav(lang) {
  var t = lang === 'fr' ? 'fr' : 'en';
  var nav = CONTENT_DATA.nav;
  var ids = {
    'nav-txt-home': nav.home[t],
    'nav-txt-exp':  nav.experience[t],
    'nav-txt-proj': nav.projects[t],
    'nav-txt-cert': nav.certifications[t]
  };
  Object.keys(ids).forEach(function(id) {
    var el = document.getElementById(id);
    if (el) el.textContent = ids[id];
  });
}

function renderAvailability(lang) {
  var el = document.getElementById('avail-txt');
  if (el) el.textContent = CONTENT_DATA.availability[lang === 'fr' ? 'fr' : 'en'];
}

function renderHome(lang) {
  var t = lang === 'fr' ? 'fr' : 'en';
  var c = CONTENT_DATA.home;

  // Build social links
  var socialsHtml = c.socials.map(function(s) {
    var icon = SOCIAL_ICONS[s.icon] || '';
    var extra = (s.url.startsWith('http') || s.url.startsWith('mailto')) ? ' target="_blank"' : '';
    return '<a href="' + s.url + '"' + extra + ' class="soc">' + icon + s.label + '</a>';
  }).join('');

  var homeLeft = document.getElementById('home-left');
  if (homeLeft) {
    homeLeft.innerHTML =
      '<p class="eyebrow"><span class="eyebrow-line"></span><span>' + c.eyebrow[t] + '</span></p>' +
      '<h1 class="name"><span style="display:block">' + c.name + '</span><span class="acc">' + c.name_accent + '</span></h1>' +
      '<p class="tagline">' + c.tagline[t] + '</p>' +
      '<p class="desc">' + c.description[t] + '</p>' +
      '<div class="socials">' + socialsHtml + '</div>';
  }

  var stackLabel = document.getElementById('stack-label-txt');
  if (stackLabel) stackLabel.textContent = c.stack_label[t];
}

function renderExperience(lang) {
  var t = lang === 'fr' ? 'fr' : 'en';
  var c = CONTENT_DATA.experience;

  var titleEl = document.getElementById('exp-title');
  if (titleEl) titleEl.innerHTML = c.title[t];

  var subEl = document.getElementById('exp-sub');
  if (subEl) subEl.textContent = c.subtitle[t];

  var timeline = document.getElementById('exp-timeline');
  if (!timeline) return;

  timeline.innerHTML = c.jobs.map(function(job) {
    var bullets = job.bullets[t].map(function(b) {
      return '<li>' + b + '</li>';
    }).join('');

    var tags = job.tags.map(function(tag) {
      return '<span class="exp-tag ' + tagClass(tag) + '">' + tag + '</span>';
    }).join('');

    return '<div class="exp-card">' +
      '<div class="exp-top"><div class="exp-co">' + job.company + '</div><div class="exp-period">' + job.period + '</div></div>' +
      '<div class="exp-role">' + job.role[t] + '</div>' +
      '<div class="exp-loc">' + job.location + '</div>' +
      '<ul class="exp-list">' + bullets + '</ul>' +
      '<div class="exp-tags">' + tags + '</div>' +
      '</div>';
  }).join('');
}

function renderProjectsText(lang) {
  var t = lang === 'fr' ? 'fr' : 'en';
  var c = CONTENT_DATA.projects;

  var els = {
    'proj-title':    { prop: 'innerHTML', val: c.title[t] },
    'btn-code-txt':  { prop: 'textContent', val: c.toggles.code[t] },
    'btn-demo-txt':  { prop: 'textContent', val: c.toggles.demo[t] },
    'proj-sub-code': { prop: 'textContent', val: c.subtitles.code[t] },
    'proj-sub-demo': { prop: 'textContent', val: c.subtitles.demo[t] },
    'load-more-btn': { prop: 'textContent', val: c.load_more[t] }
  };

  Object.keys(els).forEach(function(id) {
    var el = document.getElementById(id);
    if (el) el[els[id].prop] = els[id].val;
  });
}

function renderCertifications(lang) {
  var t = lang === 'fr' ? 'fr' : 'en';
  var c = CONTENT_DATA.certifications;

  var titleEl = document.getElementById('cert-title');
  if (titleEl) titleEl.innerHTML = c.title[t];

  var subEl = document.getElementById('cert-sub');
  if (subEl) subEl.textContent = c.subtitle[t];

  var grid = document.getElementById('certs-grid');
  if (!grid) return;

  grid.innerHTML = c.certs.map(function(cert) {
    var iconHtml = cert.icon_type === 'image'
      ? '<div class="cert-ico-container"><img src="' + cert.icon + '" alt="' + cert.name + '" style="width:80px;height:80px;object-fit:contain"></div>'
      : '<span class="cert-ico">' + cert.icon + '</span>';

    var credlyHtml = cert.credly_badge_id
      ? '<a href="https://www.credly.com/badges/' + cert.credly_badge_id + '/public_url" target="_blank" class="credly-link">Verify on Credly ↗</a>'
      : '';

    return '<div class="cert-card">' +
      iconHtml +
      '<div class="cert-name">' + cert.name + '</div>' +
      '<div class="cert-iss">' + cert.issuer + '</div>' +
      '<div class="cert-desc">' + cert.description[t] + '</div>' +
      '<span class="cbadge ' + cert.badge_class + '">' + cert.badge_text + '</span>' +
      credlyHtml +
      '</div>';
  }).join('');
}

// ── renderDemos is called globally by show() in index.html when projects tab opens
function renderDemos() {
  if (!CONTENT_DATA) return;
  var t = (window.currentLang === 'fr') ? 'fr' : 'en';
  var gifSoon = t === 'fr' ? 'GIF bientôt disponible' : 'GIF coming soon';
  var grid = document.getElementById('demos-grid');
  if (!grid) return;

  grid.innerHTML = CONTENT_DATA.projects.demos.map(function(d) {
    var desc = d.description[t];
    var thumb = d.gif
      ? '<img src="' + d.gif + '" alt="' + d.title + '" loading="lazy">'
      : '<div class="demo-thumb-placeholder"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polygon points="5 3 19 12 5 21 5 3"/></svg><span>' + gifSoon + '</span></div>';
    var tags = d.stack.map(function(s) { return '<span class="demo-tag">' + s + '</span>'; }).join('');
    var ghBtn = d.repo ? '<span class="demo-link demo-link-gh">GitHub ↗</span>' : '';
    var playBtn = '<div class="demo-play"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg></div>';
    var href = d.repo || '#';

    return '<a href="' + href + '" target="_blank" rel="noreferrer" class="demo-card">' +
      '<div class="demo-thumb">' + thumb + '<span class="demo-badge ' + d.badge + '">' + d.badge_label + '</span>' + playBtn + '</div>' +
      '<div class="demo-body">' +
        '<div class="demo-title">' + d.title + '</div>' +
        '<div class="demo-desc">' + desc + '</div>' +
        '<div class="demo-stack">' + tags + '</div>' +
        '<div class="demo-links">' + ghBtn + '</div>' +
      '</div>' +
      '</a>';
  }).join('');

  window._demosLoaded = true;
}

// ── Language switcher — overrides any previous setLang definition
window.setLang = function(lang, btn) {
  window.currentLang = lang;
  document.querySelectorAll('.lang-btn').forEach(function(b) { b.classList.remove('active'); });
  btn.classList.add('active');
  document.documentElement.lang = lang;
  if (CONTENT_DATA) renderAll(lang);
};

// ── Bootstrap
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadContentData);
} else {
  loadContentData();
}
