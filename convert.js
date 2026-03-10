#!/usr/bin/env node
/**
 * CONTENT.md → content.json converter
 * Parses markdown and updates JSON with all portfolio content
 */

const fs = require('fs');
const path = require('path');

const CONTENT_FILE = path.join(__dirname, 'CONTENT.md');
const JSON_FILE = path.join(__dirname, 'content.json');

try {
  const mdContent = fs.readFileSync(CONTENT_FILE, 'utf-8');
  const json = JSON.parse(fs.readFileSync(JSON_FILE, 'utf-8'));

  // Helper: Extract value from markdown pattern: - **Key**: value
  const extractValue = (content, key) => {
    const regex = new RegExp(`- \\*\\*${key}\\*\\*:\\s*(.+?)(?=\\n|$)`, 'i');
    const match = content.match(regex);
    return match ? match[1].trim() : null;
  };

  // Helper: Extract section content
  const extractSection = (content, sectionName) => {
    const sectionRegex = new RegExp(`## ${sectionName}([\\s\\S]*?)(?=##|$)`);
    const match = content.match(sectionRegex);
    return match ? match[1] : '';
  };

  // Parse Personal Info
  const personalSection = extractSection(mdContent, 'Personal Information');
  const logoText = extractValue(personalSection, 'Logo Text');
  const logoSuffix = extractValue(personalSection, 'Logo Suffix');
  const availEN = extractValue(personalSection, 'EN');
  const availFR = extractValue(personalSection, 'FR');

  if (logoText) json.personal.logo_text = logoText;
  if (logoSuffix) json.personal.logo_suffix = logoSuffix;
  if (availEN) json.availability.en = availEN;
  if (availFR) json.availability.fr = availFR;

  // Parse Home Section
  const homeSection = extractSection(mdContent, 'Home Section');
  const eyebrowEN = extractValue(homeSection, 'EN Eyebrow');
  const eyebrowFR = extractValue(homeSection, 'FR Eyebrow');
  const taglineEN = extractValue(homeSection, 'EN Tagline');
  const taglineFR = extractValue(homeSection, 'FR Tagline');
  const fullName = extractValue(homeSection, 'Full Name');
  const accentPart = extractValue(homeSection, 'Accent Part');
  const gitHub = extractValue(homeSection, 'GitHub');
  const linkedIn = extractValue(homeSection, 'LinkedIn');
  const email = extractValue(homeSection, 'Email');
  const toolStackEN = extractValue(homeSection, 'EN');
  const toolStackFR = extractValue(homeSection, 'FR');

  if (eyebrowEN) json.home.eyebrow.en = eyebrowEN;
  if (eyebrowFR) json.home.eyebrow.fr = eyebrowFR;
  if (taglineEN) json.home.tagline.en = taglineEN;
  if (taglineFR) json.home.tagline.fr = taglineFR;
  if (fullName) json.personal.full_name = fullName;
  if (accentPart) json.personal.accent_part = accentPart;
  if (gitHub) json.social.github = gitHub;
  if (linkedIn) json.social.linkedin = linkedIn;
  if (email) json.social.email = email;

  // Parse description from markdown (multi-line format)
  const descMatch = homeSection.match(/### Full Description\n([\s\S]*?)(?=###|##|$)/);
  if (descMatch) {
    const descBlock = descMatch[1];
    const enDescMatch = descBlock.match(/\*\*EN\*\*:\s*([\s\S]*?)(?=\n\*\*FR\*\*:|$)/);
    const frDescMatch = descBlock.match(/\*\*FR\*\*:\s*([\s\S]*?)(?=###|##|$)/);
    if (enDescMatch) json.home.description.en = enDescMatch[1].trim();
    if (frDescMatch) json.home.description.fr = frDescMatch[1].trim();
  }

  // Write updated JSON
  fs.writeFileSync(JSON_FILE, JSON.stringify(json, null, 2));
  console.log('✅ CONTENT.md → content.json updated successfully!');
  console.log('📝 Changes will load automatically in your portfolio');

} catch (error) {
  console.error('❌ Conversion error:', error.message);
  process.exit(1);
}
