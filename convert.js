#!/usr/bin/env node
/**
 * CONTENT.md → content.json converter
 * Automatically converts markdown content file to JSON
 */

const fs = require('fs');
const path = require('path');

const CONTENT_FILE = path.join(__dirname, 'CONTENT.md');
const JSON_FILE = path.join(__dirname, 'content.json');

// Read CONTENT.md
const mdContent = fs.readFileSync(CONTENT_FILE, 'utf-8');
const lines = mdContent.split('\n');

// Load existing JSON to preserve structure
const existingJSON = JSON.parse(fs.readFileSync(JSON_FILE, 'utf-8'));
const output = JSON.parse(JSON.stringify(existingJSON)); // Deep copy

let currentSection = null;
let currentSubsection = null;
let currentLang = 'en';
let i = 0;

while (i < lines.length) {
  const line = lines[i].trim();

  // Detect language blocks
  if (line.startsWith('**EN'):')) {
    currentLang = 'en';
    i++;
    continue;
  }
  if (line.startsWith('**FR'):')) {
    currentLang = 'fr';
    i++;
    continue;
  }

  // Eyebrow
  if (line.includes('EN Eyebrow')) {
    const nextLine = lines[i + 1].trim();
    const match = nextLine.match(/- \*\*EN Eyebrow\*\*: (.+)/);
    if (match) output.home.eyebrow.en = match[1];
    i += 2;
    continue;
  }
  if (line.includes('FR Eyebrow')) {
    const nextLine = lines[i + 1].trim();
    const match = nextLine.match(/- \*\*FR Eyebrow\*\*: (.+)/);
    if (match) output.home.eyebrow.fr = match[1];
    i += 2;
    continue;
  }

  // Tagline
  if (line.includes('EN Tagline')) {
    const nextLine = lines[i + 1].trim();
    const match = nextLine.match(/- \*\*EN Tagline\*\*: (.+)/);
    if (match) output.home.tagline.en = match[1];
    i += 2;
    continue;
  }
  if (line.includes('FR Tagline')) {
    const nextLine = lines[i + 1].trim();
    const match = nextLine.match(/- \*\*FR Tagline\*\*: (.+)/);
    if (match) output.home.tagline.fr = match[1];
    i += 2;
    continue;
  }

  // Logo
  if (line.includes('Logo Text')) {
    const nextLine = lines[i + 1].trim();
    const match = nextLine.match(/- \*\*Logo Text\*\*: (.+)/);
    if (match) output.personal.logo_text = match[1];
    i += 2;
    continue;
  }

  // Availability
  if (line.includes('EN'):') && line.includes('open to work')) {
    const match = line.match(/- \*\*EN\*\*: (.+)/);
    if (match) output.availability.en = match[1];
  }
  if (line.includes('FR'):') && line.match(/disponible|busy/)) {
    const match = line.match(/- \*\*FR\*\*: (.+)/);
    if (match) output.availability.fr = match[1];
  }

  i++;
}

// Write output
fs.writeFileSync(JSON_FILE, JSON.stringify(output, null, 2));
console.log('✅ CONTENT.md → content.json conversion complete!');
