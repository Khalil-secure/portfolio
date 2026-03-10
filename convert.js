#!/usr/bin/env node
/**
 * CONTENT.md → content.json converter
 * Runs in GitHub Actions to parse markdown and update JSON
 */

const fs = require('fs');
const path = require('path');

const CONTENT_FILE = path.join(__dirname, 'CONTENT.md');
const JSON_FILE = path.join(__dirname, 'content.json');

try {
  const mdContent = fs.readFileSync(CONTENT_FILE, 'utf-8');
  const json = JSON.parse(fs.readFileSync(JSON_FILE, 'utf-8'));

  // Helper: Find value after "- **Key**: "
  const getValue = (text, key) => {
    const regex = new RegExp(`-\\s*\\*\\*${key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\*\\*:\\s*(.+?)(?=\\n|$)`);
    const match = text.match(regex);
    return match ? match[1].trim() : null;
  };

  // Helper: Get section content
  const getSection = (text, sectionTitle) => {
    const regex = new RegExp(`## ${sectionTitle}([\\s\\S]*?)(?=##|$)`);
    const match = text.match(regex);
    return match ? match[1] : '';
  };

  // === PERSONAL INFO ===
  const personal = getSection(mdContent, 'Personal Information');
  const logoText = getValue(personal, 'Logo Text');
  const logoSuffix = getValue(personal, 'Logo Suffix');
  const availEN = getValue(personal, 'EN');
  const availFR = getValue(personal, 'FR');

  if (logoText) json.personal.logo_text = logoText;
  if (logoSuffix) json.personal.logo_suffix = logoSuffix;
  if (availEN) json.availability.en = availEN;
  if (availFR) json.availability.fr = availFR;

  // === HOME SECTION ===
  const home = getSection(mdContent, 'Home Section');
  const eyebrowEN = getValue(home, 'EN Eyebrow');
  const eyebrowFR = getValue(home, 'FR Eyebrow');
  const taglineEN = getValue(home, 'EN Tagline');
  const taglineFR = getValue(home, 'FR Tagline');
  const fullName = getValue(home, 'Full Name');
  const accentPart = getValue(home, 'Accent Part');
  const github = getValue(home, 'GitHub');
  const linkedin = getValue(home, 'LinkedIn');
  const email = getValue(home, 'Email');
  const cvPDF = getValue(home, 'Resume PDF');

  if (eyebrowEN) json.home.eyebrow.en = eyebrowEN;
  if (eyebrowFR) json.home.eyebrow.fr = eyebrowFR;
  if (taglineEN) json.home.tagline.en = taglineEN;
  if (taglineFR) json.home.tagline.fr = taglineFR;
  if (fullName) json.personal.full_name = fullName;
  if (accentPart) json.personal.accent_part = accentPart;
  if (github) json.social.github = github;
  if (linkedin) json.social.linkedin = linkedin;
  if (email) json.social.email = email;
  if (cvPDF) json.personal.cv_pdf = cvPDF;

  // Extract description
  const descRegex = /### Full Description\n([\s\S]*?)(?=###|##|$)/;
  const descMatch = home.match(descRegex);
  if (descMatch) {
    const enMatch = descMatch[1].match(/\*\*EN\*\*:\s*([\s\S]*?)(?=\n\*\*FR\*\*:|$)/);
    const frMatch = descMatch[1].match(/\*\*FR\*\*:\s*([\s\S]*?)(?=###|##|$)/);
    if (enMatch) json.home.description.en = enMatch[1].trim();
    if (frMatch) json.home.description.fr = frMatch[1].trim();
  }

  // === EXPERIENCE SECTION ===
  const exp = getSection(mdContent, 'Experience Section');
  const expTitleEN = getValue(exp, 'EN Title');
  const expTitleFR = getValue(exp, 'FR Title');
  const expSubtitleEN = getValue(exp, 'EN Subtitle');
  const expSubtitleFR = getValue(exp, 'FR Subtitle');

  if (expTitleEN) json.experience.title.en = expTitleEN;
  if (expTitleFR) json.experience.title.fr = expTitleFR;
  if (expSubtitleEN) json.experience.subtitle.en = expSubtitleEN;
  if (expSubtitleFR) json.experience.subtitle.fr = expSubtitleFR;

  // === PROJECTS SECTION ===
  const proj = getSection(mdContent, 'Projects Section');
  const projTitleEN = getValue(proj, 'EN Title');
  const projTitleFR = getValue(proj, 'FR Title');
  const projSubEN = getValue(proj, 'EN Code');
  const projSubFR = getValue(proj, 'FR Code');

  if (projTitleEN) json.projects.title.en = projTitleEN;
  if (projTitleFR) json.projects.title.fr = projTitleFR;
  if (projSubEN) json.projects.subtitle.en = projSubEN;
  if (projSubFR) json.projects.subtitle.fr = projSubFR;

  // === CERTIFICATIONS SECTION ===
  const certs = getSection(mdContent, 'Certifications Section');
  const certTitleEN = getValue(certs, 'EN Title');
  const certTitleFR = getValue(certs, 'FR Title');
  const certSubEN = getValue(certs, 'EN Subtitle');
  const certSubFR = getValue(certs, 'FR Subtitle');

  if (certTitleEN) json.certifications.title.en = certTitleEN;
  if (certTitleFR) json.certifications.title.fr = certTitleFR;
  if (certSubEN) json.certifications.subtitle.en = certSubEN;
  if (certSubFR) json.certifications.subtitle.fr = certSubFR;

  // Write JSON
  fs.writeFileSync(JSON_FILE, JSON.stringify(json, null, 2));
  
  console.log('✅ Conversion complete!');
  console.log(`📝 Updated Logo: "${logoText}"`);
  console.log(`📝 Updated Eyebrow EN: "${eyebrowEN}"`);
  console.log(`📝 Updated Tagline EN: "${taglineEN}"`);

} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}
