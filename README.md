# Khalil Ghiati — Portfolio

Bilingual (EN/FR) portfolio for a Systems & Network Engineer / SOC Analyst with a focus on AI-driven infrastructure and cybersecurity. Static site, zero build step, content-driven via JSON.

**Live:** [portfolio-khalil-secure.vercel.app](https://portfolio-khalil-secure.vercel.app/)

---

## What's inside

| Section | What it shows |
|---|---|
| **Home** | Role, bio, social links, full tech stack grouped by domain |
| **Experience** | Timeline — Bouygues Telecom, CogniScan, ETEX Group |
| **Projects** | GitHub repos (live API) + Live Demos with GIF walkthroughs |
| **Certifications** | Degrees, TryHackMe paths, AZ-900, Root-Me — with Credly verification |

---

## Features

- **Bilingual** — EN / FR toggle, all content in both languages
- **Content-driven** — edit `content.json`, refresh, done. No rebuild needed
- **Fully clickable cards** — every project card and demo card is a direct link
- **Credly badge** — Azure Fundamentals AZ-900 links to verified credential
- **Live GitHub repos** — fetched from the API, sorted by last update
- **GIF demos** — live walkthroughs for key projects
- **Dark theme** — CSS custom properties, responsive, mobile-first

---

## Certifications & Credentials

| Credential | Issuer | Verify |
|---|---|---|
| Engineering Degree | ENSIL-ENSCI — Limoges | — |
| SOC Level 1 | TryHackMe | — |
| Jr Penetration Tester | TryHackMe | — |
| Azure Fundamentals AZ-900 | Microsoft | [Credly](https://www.credly.com/badges/13015c35-8a42-4d16-9013-dcadee48e781/public_url) |
| Root-Me 100+ challenges | Root-Me.org | — |

---

## Project structure

```
portfolio/
├── index.html        # Shell — layout, CSS, nav, GitHub fetch logic
├── loadContent.js    # Renders all dynamic content from content.json
├── content.json      # Single source of truth for all portfolio content
├── CONTENT.md        # Human-readable version of content.json
└── vercel.json       # Vercel deployment config
```

---

## Editing content

All text, jobs, projects, certs live in `content.json`. Edit it directly — no toolchain required.

```jsonc
// content.json structure
{
  "personal": { "logo_text": "khalil", "logo_suffix": ".sec" },
  "availability": { "en": "open to work", "fr": "disponible" },
  "home": { "eyebrow": {}, "tagline": {}, "description": {}, "socials": [] },
  "experience": { "jobs": [ { "company", "period", "role", "bullets", "tags" } ] },
  "projects": { "demos": [ { "title", "stack", "repo", "gif", "description" } ] },
  "certifications": { "certs": [ { "name", "issuer", "credly_badge_id", ... } ] }
}
```

To add a Credly-verified cert, add `"credly_badge_id": "<badge-id>"` to the cert object — the "Verify on Credly →" link appears automatically.

---

## Run locally

```bash
git clone https://github.com/khalil-secure/from_MD_to_portfolio.git
cd from_MD_to_portfolio
python -m http.server 8000
# open http://localhost:8000
```

No npm, no build, no dependencies.

---

## Deploy

Push to GitHub → connect to Vercel → auto-deploys on every push. The `vercel.json` is already configured.

---

## Stack

HTML · CSS · Vanilla JS · JSON · GitHub API · Vercel

---

**Contact:** [medkhalilghiati@gmail.com](mailto:medkhalilghiati@gmail.com) · [LinkedIn](https://www.linkedin.com/in/mohamed-ghiati-khalil/) · [GitHub](https://github.com/Khalil-secure)
