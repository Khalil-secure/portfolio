#!/usr/bin/env node
/**
 * CONTENT.md → content.json — full converter
 * Parses every section of CONTENT.md and overwrites content.json completely.
 * Run automatically by GitHub Actions on every push that changes CONTENT.md.
 */

const fs   = require('fs');
const path = require('path');

const CONTENT_FILE = path.join(__dirname, 'CONTENT.md');
const JSON_FILE    = path.join(__dirname, 'content.json');

// Normalize line endings so \r\n (Windows) doesn't break regex matching
const md   = fs.readFileSync(CONTENT_FILE, 'utf-8').replace(/\r\n/g, '\n');
const json = JSON.parse(fs.readFileSync(JSON_FILE, 'utf-8'));

// ─── Helpers ───────────────────────────────────────────────────────────────

function escRe(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Return the body of a level-2 (##) section */
function getSection(text, title) {
  const re = new RegExp(`## ${escRe(title)}([\\s\\S]*?)(?=\\n## |$)`);
  const m  = text.match(re);
  return m ? m[1] : '';
}

/** Return the body of a level-3 (###) subsection within a section */
function getSubsection(text, title) {
  const re = new RegExp(`### ${escRe(title)}([\\s\\S]*?)(?=\\n###|\\n##|$)`);
  const m  = text.match(re);
  return m ? m[1] : '';
}

/** Extract value from "- **Key**: value" */
function getValue(text, key) {
  const re = new RegExp(`-\\s*\\*\\*${escRe(key)}\\*\\*:\\s*(.+?)(?=\\n|$)`);
  const m  = text.match(re);
  return m ? m[1].trim() : null;
}

/** Convert **bold** → <span class="acc">bold</span>  (for section titles) */
function titleMd(str) {
  return str.replace(/\*\*(.+?)\*\*/g, '<span class="acc">$1</span>');
}

/** Convert **bold** → <strong>bold</strong>  (for body text / bullets) */
function bodyMd(str) {
  return str.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
}

/** Extract bullet list items from a block of text */
function parseBullets(block) {
  return block
    .split('\n')
    .map(l => l.trim())
    .filter(l => l.startsWith('- ') || l.startsWith('* '))
    .map(l => bodyMd(l.replace(/^[-*]\s+/, '')));
}

// ─── Personal Information ──────────────────────────────────────────────────

const personal  = getSection(md, 'Personal Information');
const logoSec   = getSubsection(personal, 'Logo');
const availSec  = getSubsection(personal, 'Availability Status');

const logoText   = getValue(logoSec,  'Logo Text');
const logoSuffix = getValue(logoSec,  'Logo Suffix');
const availEN    = getValue(availSec, 'EN');
const availFR    = getValue(availSec, 'FR');

if (logoText)   json.personal.logo_text   = logoText;
if (logoSuffix) json.personal.logo_suffix = logoSuffix;
if (availEN)    json.availability.en      = availEN;
if (availFR)    json.availability.fr      = availFR;

// ─── Home Section ─────────────────────────────────────────────────────────

const home       = getSection(md, 'Home Section');
const bioPart    = getSubsection(home, 'Short Bio');
const namePart   = getSubsection(home, 'Name');
const descPart   = getSubsection(home, 'Full Description');
const socialPart = getSubsection(home, 'Social Links');
const stackPart  = getSubsection(home, 'Tool Stack Label');

// Eyebrow & Tagline
const eyebrowEN = getValue(bioPart, 'EN Eyebrow');
const eyebrowFR = getValue(bioPart, 'FR Eyebrow');
const taglineEN = getValue(bioPart, 'EN Tagline');
const taglineFR = getValue(bioPart, 'FR Tagline');
if (eyebrowEN) json.home.eyebrow.en = eyebrowEN;
if (eyebrowFR) json.home.eyebrow.fr = eyebrowFR;
if (taglineEN) json.home.tagline.en = taglineEN;
if (taglineFR) json.home.tagline.fr = taglineFR;

// Name — derive first name from Full Name minus the accent part
const accentRaw  = getValue(namePart, 'Accent Part');
const fullName   = getValue(namePart, 'Full Name');
const accentPart = accentRaw ? accentRaw.replace(/\s*\(.*?\)\s*$/, '').trim() : null;
if (accentPart) json.home.name_accent = accentPart;
if (fullName && accentPart) {
  const firstName = fullName.replace(accentPart, '').trim();
  if (firstName) json.home.name = firstName;
}

// Description
const enDescM = descPart.match(/\*\*EN\*\*:\s*([\s\S]*?)(?=\n\*\*FR\*\*:|$)/);
const frDescM = descPart.match(/\*\*FR\*\*:\s*([\s\S]*?)(?=\n\*\*EN\*\*:|###|##|$)/);
if (enDescM) json.home.description.en = bodyMd(enDescM[1].trim());
if (frDescM) json.home.description.fr = bodyMd(frDescM[1].trim());

// Social links
const github   = getValue(socialPart, 'GitHub');
const linkedin = getValue(socialPart, 'LinkedIn');
const emailRaw = getValue(socialPart, 'Email');
const resume   = getValue(socialPart, 'Resume PDF');
const email    = emailRaw
  ? (emailRaw.startsWith('mailto:') ? emailRaw : 'mailto:' + emailRaw)
  : null;

if (github || linkedin || email || resume) {
  json.home.socials = [
    github   ? { label: 'GitHub',   url: github,    icon: 'github'   } : null,
    linkedin ? { label: 'LinkedIn', url: linkedin,  icon: 'linkedin' } : null,
    email    ? { label: 'Email',    url: email,     icon: 'email'    } : null,
    resume   ? { label: 'Resume',   url: resume,    icon: 'resume'   } : null,
  ].filter(Boolean);
}

// Stack label
const stackEN = getValue(stackPart, 'EN');
const stackFR = getValue(stackPart, 'FR');
if (stackEN) json.home.stack_label.en = stackEN;
if (stackFR) json.home.stack_label.fr = stackFR;

// ─── Experience Section ────────────────────────────────────────────────────

const exp       = getSection(md, 'Experience Section');
const expHeader = getSubsection(exp, 'Section Header');

const expTitleEN = getValue(expHeader, 'EN Title');
const expTitleFR = getValue(expHeader, 'FR Title');
const expSubEN   = getValue(expHeader, 'EN Subtitle');
const expSubFR   = getValue(expHeader, 'FR Subtitle');

if (expTitleEN) json.experience.title.en    = titleMd(expTitleEN);
if (expTitleFR) json.experience.title.fr    = titleMd(expTitleFR);
if (expSubEN)   json.experience.subtitle.en = expSubEN;
if (expSubFR)   json.experience.subtitle.fr = expSubFR;

// Individual job entries
const expEntries = [...exp.matchAll(/### Experience #\d+[^\n]*\n([\s\S]*?)(?=### Experience #|\n## |$)/g)];
if (expEntries.length > 0) {
  json.experience.jobs = expEntries.map(m => {
    const block    = m[1];
    const company  = getValue(block, 'Company');
    const period   = getValue(block, 'Period');
    const roleEN   = getValue(block, 'EN Role');
    const roleFR   = getValue(block, 'FR Role');
    const location = getValue(block, 'Location');
    const tagsRaw  = getValue(block, 'Tags');
    const tags     = tagsRaw ? tagsRaw.split(',').map(t => t.trim()) : [];

    const enBulletM = block.match(/\*\*EN Bullets\*\*:\s*\n([\s\S]*?)(?=\*\*FR Bullets\*\*:|###|##|$)/);
    const frBulletM = block.match(/\*\*FR Bullets\*\*:\s*\n([\s\S]*?)(?=\*\*EN Bullets\*\*:|###|##|$)/);

    return {
      company,
      period,
      role:    { en: roleEN, fr: roleFR },
      location,
      tags,
      bullets: {
        en: enBulletM ? parseBullets(enBulletM[1]) : [],
        fr: frBulletM ? parseBullets(frBulletM[1]) : [],
      },
    };
  });
}

// ─── Projects Section ──────────────────────────────────────────────────────

const proj       = getSection(md, 'Projects Section');
const projHeader = getSubsection(proj, 'Section Header');

const projTitleEN = getValue(projHeader, 'EN Title');
const projTitleFR = getValue(projHeader, 'FR Title');
if (projTitleEN) json.projects.title.en = titleMd(projTitleEN);
if (projTitleFR) json.projects.title.fr = titleMd(projTitleFR);

// Toggle buttons  (format: "- **EN Code**: Coding Projects | **EN Demo**: Live Demos")
const toggleSec = getSubsection(proj, 'Toggle Buttons');
const enCodeM = toggleSec.match(/\*\*EN Code\*\*:\s*([^|*\n]+)/);
const enDemoM = toggleSec.match(/\*\*EN Demo\*\*:\s*([^\n*|]+)/);
const frCodeM = toggleSec.match(/\*\*FR Code\*\*:\s*([^|*\n]+)/);
const frDemoM = toggleSec.match(/\*\*FR Demo\*\*:\s*([^\n*|]+)/);
if (enCodeM) json.projects.toggles.code.en = enCodeM[1].trim();
if (enDemoM) json.projects.toggles.demo.en = enDemoM[1].trim();
if (frCodeM) json.projects.toggles.code.fr = frCodeM[1].trim();
if (frDemoM) json.projects.toggles.demo.fr = frDemoM[1].trim();

// Subtitles
const subSec    = getSubsection(proj, 'Project Subtitles');
const subCodeEN = getValue(subSec, 'EN Code');
const subDemoEN = getValue(subSec, 'EN Demo');
const subCodeFR = getValue(subSec, 'FR Code');
const subDemoFR = getValue(subSec, 'FR Demo');
if (subCodeEN) json.projects.subtitles.code.en = subCodeEN;
if (subDemoEN) json.projects.subtitles.demo.en = subDemoEN;
if (subCodeFR) json.projects.subtitles.code.fr = subCodeFR;
if (subDemoFR) json.projects.subtitles.demo.fr = subDemoFR;

// Load more button
const loadSec  = getSubsection(proj, 'Load More Button');
const loadEN   = getValue(loadSec, 'EN');
const loadFR   = getValue(loadSec, 'FR');
if (loadEN) json.projects.load_more.en = loadEN;
if (loadFR) json.projects.load_more.fr = loadFR;

// Demo badge CSS class from badge label text
function demoBadgeClass(label) {
  if (!label) return 'badge-infra';
  const l = label.toLowerCase();
  if (l.includes('ai') || l.includes('devsec')) return 'badge-ai';
  if (l.includes('sec') || l.includes('security')) return 'badge-sec';
  return 'badge-infra';
}

// Live demo entries
const demoSec     = getSubsection(proj, 'Live Demos');
const demoEntries = [...demoSec.matchAll(/#### Demo #\d+[^\n]*\n([\s\S]*?)(?=#### Demo #|\n### |\n## |$)/g)];
if (demoEntries.length > 0) {
  json.projects.demos = demoEntries.map(m => {
    const block    = m[1];
    const title    = getValue(block, 'Title');
    const badge    = getValue(block, 'Badge');
    const stackRaw = getValue(block, 'Tech Stack');
    const repo     = getValue(block, 'GitHub');
    const gif      = getValue(block, 'GIF');

    const enDescM = block.match(/\*\*EN Description\*\*:\s*\n([\s\S]*?)(?=\n\*\*FR Description\*\*:|####|###|##|$)/);
    const frDescM = block.match(/\*\*FR Description\*\*:\s*\n([\s\S]*?)(?=\n\*\*EN Description\*\*:|####|###|##|$)/);

    return {
      title,
      badge:       demoBadgeClass(badge),
      badge_label: badge,
      stack:       stackRaw ? stackRaw.split(',').map(s => s.trim()) : [],
      repo,
      gif,
      description: {
        en: enDescM ? enDescM[1].trim() : '',
        fr: frDescM ? frDescM[1].trim() : '',
      },
    };
  });
}

// ─── Certifications Section ────────────────────────────────────────────────

const certs      = getSection(md, 'Certifications Section');
const certHeader = getSubsection(certs, 'Section Header');

const certTitleEN = getValue(certHeader, 'EN Title');
const certTitleFR = getValue(certHeader, 'FR Title');
const certSubEN   = getValue(certHeader, 'EN Subtitle');
const certSubFR   = getValue(certHeader, 'FR Subtitle');
if (certTitleEN) json.certifications.title.en    = titleMd(certTitleEN);
if (certTitleFR) json.certifications.title.fr    = titleMd(certTitleFR);
if (certSubEN)   json.certifications.subtitle.en = certSubEN;
if (certSubFR)   json.certifications.subtitle.fr = certSubFR;

// Cert badge CSS class from "Text (color)" format
function certBadgeClass(raw) {
  const l = raw.toLowerCase();
  if (l.includes('orange') || l.includes('active'))                  return 'cbo';
  if (l.includes('blue')   || l.includes('complet'))                 return 'cbb';
  return 'cbg'; // green (obtained, certified green)
}
function certBadgeText(raw) {
  return raw.replace(/\s*\(.*?\)\s*$/, '').trim();
}
function iconType(icon) {
  return /\.(png|jpe?g|jfif|svg|webp)$/i.test(icon) ? 'image' : 'emoji';
}

const certEntries = [...certs.matchAll(/### Certification #\d+[^\n]*\n([\s\S]*?)(?=### Certification #|\n## |$)/g)];
if (certEntries.length > 0) {
  json.certifications.certs = certEntries.map(m => {
    const block       = m[1];
    const icon        = getValue(block, 'Icon');
    const name        = getValue(block, 'Name');
    const issuer      = getValue(block, 'Issuer');
    const badgeRaw    = getValue(block, 'Status Badge');
    const credlyId    = getValue(block, 'Credly Badge ID');
    const descEN      = getValue(block, 'EN Description');
    const descFR      = getValue(block, 'FR Description');

    const cert = {
      icon,
      icon_type:   icon ? iconType(icon) : 'emoji',
      name,
      issuer,
      badge_class: badgeRaw ? certBadgeClass(badgeRaw) : 'cbg',
      badge_text:  badgeRaw ? certBadgeText(badgeRaw)  : '',
      description: { en: descEN, fr: descFR },
    };
    if (credlyId) cert.credly_badge_id = credlyId;
    return cert;
  });
}

// ─── Navigation Labels ─────────────────────────────────────────────────────
// Format: "- **Home**: Home / Accueil"

const navSec = getSection(md, 'Navigation Labels');

function parseNav(text, key) {
  const val = getValue(text, key);
  if (!val) return null;
  const parts = val.split('/').map(s => s.trim());
  return { en: parts[0], fr: parts[1] || parts[0] };
}

const navHome  = parseNav(navSec, 'Home');
const navExp   = parseNav(navSec, 'Experience');
const navProj  = parseNav(navSec, 'Projects');
const navCerts = parseNav(navSec, 'Certifications');

if (navHome)  { json.nav.home.en           = navHome.en;  json.nav.home.fr           = navHome.fr; }
if (navExp)   { json.nav.experience.en     = navExp.en;   json.nav.experience.fr     = navExp.fr; }
if (navProj)  { json.nav.projects.en       = navProj.en;  json.nav.projects.fr       = navProj.fr; }
if (navCerts) { json.nav.certifications.en = navCerts.en; json.nav.certifications.fr = navCerts.fr; }

// ─── Write ─────────────────────────────────────────────────────────────────

fs.writeFileSync(JSON_FILE, JSON.stringify(json, null, 2));

console.log('✅ content.json fully updated from CONTENT.md');
console.log(`   Logo       : ${json.personal.logo_text}${json.personal.logo_suffix}`);
console.log(`   Jobs       : ${json.experience.jobs.length}`);
console.log(`   Demos      : ${json.projects.demos.length}`);
console.log(`   Certs      : ${json.certifications.certs.length}`);
