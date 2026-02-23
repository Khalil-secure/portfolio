'use client'

import { useState, useEffect, useCallback } from 'react'

// ─── Types ───────────────────────────────────────────────────────────────────
type Section = 'home' | 'experience' | 'projects' | 'certifications'

interface Repo {
  id: number
  name: string
  description: string | null
  html_url: string
  language: string | null
  stargazers_count: number
  updated_at: string
  fork: boolean
}

// ─── Constants ───────────────────────────────────────────────────────────────
const GITHUB_USER = 'Khalil-secure'
const PER_PAGE = 9

const LANG_COLORS: Record<string, string> = {
  Python: '#3572A5', JavaScript: '#f1e05a', TypeScript: '#2b7489',
  Go: '#00ADD8', Shell: '#89e051', Rust: '#dea584',
  HTML: '#e34c26', CSS: '#563d7c', Dockerfile: '#384d54',
}

function timeAgo(date: string) {
  const d = Math.floor((Date.now() - new Date(date).getTime()) / 86400000)
  if (d === 0) return 'today'
  if (d === 1) return 'yesterday'
  if (d < 30) return `${d}d ago`
  if (d < 365) return `${Math.floor(d / 30)}mo ago`
  return `${Math.floor(d / 365)}y ago`
}

// ─── Terminal Groups ──────────────────────────────────────────────────────────
function TerminalCard() {
  return (
    <div className="terminal-card">
      <div className="term-bar">
        <span className="dot dot-r" />
        <span className="dot dot-y" />
        <span className="dot dot-g" />
        <span className="term-title">khalil@infra ~ tool-stack</span>
      </div>
      <div className="term-body">

        {/* AUTOMATION */}
        <div className="term-group">
          <div className="term-group-header">⚙ Automation</div>
          <span className="tl"><span className="cmd">$ terraform plan -out=prod.tfplan</span></span>
          <span className="tl"><span className="info">Refreshing state... 14 resources</span></span>
          <span className="tl"><span className="ok">Plan: 12 to add, 2 to change, 0 to destroy.</span></span>
          <span className="tl dim">&nbsp;</span>
          <span className="tl"><span className="cmd">$ gh workflow run deploy.yml --ref main</span></span>
          <span className="tl"><span className="ok">✔ Triggered CI/CD pipeline on branch main</span></span>
          <span className="tl"><span className="info">→ lint ✔ &nbsp;build ✔ &nbsp;scan ✔ &nbsp;deploy ✔</span></span>
          <span className="tl dim">&nbsp;</span>
          <span className="tl"><span className="cmd">$ bash harden.sh --profile anssi</span></span>
          <span className="tl"><span className="ok">✔ SSH hardened &nbsp;✔ UFW configured &nbsp;✔ Auditd active</span></span>
        </div>

        {/* MONITORING */}
        <div className="term-group">
          <div className="term-group-header">📊 Monitoring</div>
          <span className="tl"><span className="cmd">$ curl -s grafana:3000/api/health</span></span>
          <span className="tl"><span className="ok">{'{"database":"ok","version":"10.4.2"}'}</span></span>
          <span className="tl dim">&nbsp;</span>
          <span className="tl"><span className="cmd">$ logcli query '{job="suricata"}' --limit=3</span></span>
          <span className="tl"><span className="warn">[WARN] 192.168.1.45 → port scan detected (SYN flood)</span></span>
          <span className="tl"><span className="ok">[INFO] Alert forwarded to ELK Stack</span></span>
          <span className="tl dim">&nbsp;</span>
          <span className="tl"><span className="cmd">$ netdata-cli info | grep status</span></span>
          <span className="tl"><span className="ok">status: running &nbsp;· &nbsp;charts: 1842 &nbsp;· &nbsp;metrics: 48293</span></span>
        </div>

        {/* SECURITY */}
        <div className="term-group">
          <div className="term-group-header">🔐 Security</div>
          <span className="tl"><span className="cmd">$ trivy image myapp:latest --severity HIGH,CRITICAL</span></span>
          <span className="tl"><span className="ok">Total: 0 (HIGH: 0, CRITICAL: 0) ✔ Clean</span></span>
          <span className="tl dim">&nbsp;</span>
          <span className="tl"><span className="cmd">$ suricata -T -c /etc/suricata/suricata.yaml</span></span>
          <span className="tl"><span className="ok">Configuration provided was successfully loaded.</span></span>
          <span className="tl"><span className="info">Rules loaded: 34 282 &nbsp;· &nbsp;MITRE ATT&CK mapped ✔</span></span>
          <span className="tl dim">&nbsp;</span>
          <span className="tl"><span className="cmd">$ fail2ban-client status sshd</span></span>
          <span className="tl"><span className="out">Currently banned: 7 &nbsp;· &nbsp;Total banned: 143</span></span>
          <span className="tl"><span className="cmd">$ opa eval -d policy.rego 'data.authz.allow'</span></span>
          <span className="tl"><span className="ok">{"{ \"result\": true }"}</span></span>
        </div>

        {/* CONTAINER / INFRA */}
        <div className="term-group">
          <div className="term-group-header">☸ Container / Infra</div>
          <span className="tl"><span className="cmd">$ kubectl get pods -n security</span></span>
          <span className="tl"><span className="ok">istio-pilot-7d9f &nbsp;&nbsp; Running &nbsp; 1/1</span></span>
          <span className="tl"><span className="ok">cert-manager-9e3d &nbsp; Running &nbsp; 1/1</span></span>
          <span className="tl"><span className="ok">opa-gatekeeper-2a &nbsp; Running &nbsp; 1/1</span></span>
          <span className="tl dim">&nbsp;</span>
          <span className="tl"><span className="cmd">$ docker stats --no-stream --format \</span></span>
          <span className="tl"><span className="out">&nbsp;&nbsp;"{'{{.Name}}'}&nbsp;&nbsp;CPU: {'{{.CPUPerc}}'}&nbsp;&nbsp;MEM: {'{{.MemUsage}}'}"</span></span>
          <span className="tl"><span className="info">elk-stack &nbsp;&nbsp; CPU: 4.2% &nbsp; MEM: 1.1GiB / 8GiB</span></span>
          <span className="tl"><span className="info">suricata &nbsp;&nbsp;&nbsp; CPU: 1.8% &nbsp; MEM: 256MiB / 8GiB</span></span>
          <span className="tl dim">&nbsp;</span>
          <span className="tl"><span className="cmd">$ helm upgrade --install ingress ingress-nginx/</span></span>
          <span className="tl"><span className="ok">Release "ingress" has been upgraded. STATUS: deployed</span></span>
          <span className="tl"><span className="cmd">$ </span><span className="warn">█</span></span>
        </div>

      </div>
    </div>
  )
}

// ─── Home Section ─────────────────────────────────────────────────────────────
function HomeSection() {
  return (
    <section id="home" className="section active">
      <div className="home-grid">
        {/* LEFT: Hero */}
        <div>
          <p className="hero-eyebrow">// Infrastructure & Security Engineer</p>
          <h1 className="hero-name">
            Khalil<br /><span className="acc">Ghiati.</span>
          </h1>
          <p className="hero-role">Lyon, France · Ingénieur diplômé ENSIL-ENSCI</p>
          <p className="hero-quote">
            <strong>Ma motivation ne se lit pas, elle se voit.</strong><br />
            Infrastructures déployées, environnements SOC construits, Docker, Kubernetes, cloud —
            mon GitHub parle mieux que n&apos;importe quelle lettre de motivation.
          </p>
          <div className="socials">
            <a href="https://github.com/Khalil-secure" target="_blank" rel="noreferrer" className="social-link">
              <GithubIcon /> GitHub
            </a>
            <a href="https://www.linkedin.com/in/mohamed-ghiati-khalil/" target="_blank" rel="noreferrer" className="social-link">
              <LinkedinIcon /> LinkedIn
            </a>
            <a href="mailto:medkhalilghiati@gmail.com" className="social-link">
              <MailIcon /> Email
            </a>
            <a href="https://portfolio-khalil-secure.vercel.app" target="_blank" rel="noreferrer" className="social-link">
              <GlobeIcon /> Portfolio
            </a>
          </div>
        </div>

        {/* RIGHT: Terminal */}
        <TerminalCard />
      </div>

      {/* Skills */}
      <div className="skills-row">
        <p className="skills-label">// Stack technique</p>
        <div className="chips">
          {[
            { label: 'Kubernetes', c: 'g' }, { label: 'Zero Trust', c: 'g' },
            { label: 'Terraform', c: 'g' }, { label: 'Suricata IDS/IPS', c: 'g' },
            { label: 'MITRE ATT&CK', c: 'g' }, { label: 'ANSSI compliance', c: 'g' },
            { label: 'Docker', c: 'b' }, { label: 'ELK Stack', c: 'b' },
            { label: 'Loki / Grafana', c: 'b' }, { label: 'GitHub Actions', c: 'b' },
            { label: 'Istio mTLS', c: 'b' }, { label: 'WireGuard', c: 'b' },
            { label: 'Fail2ban', c: 'b' }, { label: 'OPA / Gatekeeper', c: 'b' },
            { label: 'Python', c: 'o' }, { label: 'Bash', c: 'o' },
            { label: '5G / LTE / FTTH', c: 'o' }, { label: 'CIS Benchmarks', c: 'o' },
            { label: 'Centreon', c: '' }, { label: 'Hyper-V / VMware', c: '' },
            { label: 'Trivy', c: '' }, { label: 'eBPF / Cilium', c: 'p' },
            { label: 'Linux hardening', c: '' }, { label: 'Azure AZ-900', c: '' },
          ].map(({ label, c }) => (
            <span key={label} className={`chip ${c}`}>{label}</span>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Experience Section ───────────────────────────────────────────────────────
function ExperienceSection() {
  const jobs = [
    {
      company: 'Bouygues Telecom',
      role: 'Telecom Project Manager',
      location: '📍 Lyon, France',
      period: 'Sept 2024 — Sept 2025',
      bullets: [
        <>Automated data collection across <strong>300+ telecom sites</strong> via APIs — <strong>+90% efficiency gain</strong></>,
        <>Managed <strong>4 major projects</strong> end-to-end with full stakeholder reporting</>,
        <><strong>5G infrastructure security analysis</strong> aligned with ANSSI recommendations</>,
        <>Cross-functional team coordination with AI-based operational optimisation</>,
      ],
      tags: ['5G', 'LTE', 'FTTH', 'VoLTE', 'ANSSI', 'Python', 'REST API'],
    },
    {
      company: 'CogniScan (Start-up)',
      role: 'ML Engineer & Project Manager',
      location: '📍 Limoges, France',
      period: 'Apr 2024 — Aug 2024',
      bullets: [
        <>Interactive data visualisation tools (Python, Dash, Plotly)</>,
        <>Optimised <strong>CNN architectures</strong> for anomaly detection on medical imaging</>,
        <>Signal processing algorithms for biological signature extraction</>,
      ],
      tags: ['Python', 'PyTorch', 'TensorFlow', 'Matlab', 'Embedded'],
    },
    {
      company: 'ETEX Group',
      role: 'Assistant Regional IT Infrastructure Manager',
      location: '📍 Avignon, France',
      period: 'Jun 2023 — Aug 2023',
      bullets: [
        <>Deployed <strong>Centreon</strong> monitoring across <strong>1 200+ endpoints</strong> in Western Europe</>,
        <><strong>VMware → Hyper-V</strong> server migration with full monitoring integration</>,
        <>Linux server hardening per <strong>CIS benchmarks</strong> & ANSSI (SSH, firewall, patching)</>,
      ],
      tags: ['Linux', 'Docker', 'Centreon', 'Hyper-V', 'Bash', 'CIS'],
    },
  ]

  return (
    <section id="experience" className="section active">
      <div className="exp-wrap">
        <h2 className="sec-title">Where I&apos;ve <span className="acc">shipped.</span></h2>
        <p className="sec-sub">// Real work, real impact</p>
        <div className="timeline">
          {jobs.map((job) => (
            <div key={job.company} className="exp-card">
              <div className="exp-top">
                <div className="exp-company">{job.company}</div>
                <div className="exp-period">{job.period}</div>
              </div>
              <div className="exp-role">{job.role}</div>
              <div className="exp-loc">{job.location}</div>
              <ul className="exp-list">
                {job.bullets.map((b, i) => <li key={i}>{b}</li>)}
              </ul>
              <div className="exp-tags">
                {job.tags.map(t => <span key={t} className="exp-tag">{t}</span>)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Projects Section ─────────────────────────────────────────────────────────
function ProjectsSection() {
  const [repos, setRepos] = useState<Repo[]>([])
  const [displayed, setDisplayed] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const fetchRepos = useCallback(async () => {
    try {
      const res = await fetch(
        `https://api.github.com/users/${GITHUB_USER}/repos?sort=updated&per_page=100&type=public`
      )
      const data: Repo[] = await res.json()
      if (!Array.isArray(data)) throw new Error()
      const filtered = data.filter(r => !r.fork).sort(
        (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      )
      setRepos(filtered)
      setDisplayed(PER_PAGE)
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchRepos() }, [fetchRepos])

  const visibleRepos = repos.slice(0, displayed)

  return (
    <section id="projects" className="section active">
      <div className="proj-wrap">
        <h2 className="sec-title">Built, broken, <span className="acc">documented.</span></h2>
        <p className="sec-sub">// All public repos · fetched live from GitHub · click to open</p>

        <div className="proj-grid">
          {loading && (
            <div className="spinner-wrap">
              <div className="spin" />
              <span>Fetching repos from GitHub...</span>
            </div>
          )}
          {error && (
            <div className="spinner-wrap">
              Could not fetch repos.&nbsp;
              <a href={`https://github.com/${GITHUB_USER}`} target="_blank" rel="noreferrer"
                style={{ color: 'var(--accent)' }}>View on GitHub →</a>
            </div>
          )}
          {visibleRepos.map(repo => (
            <a key={repo.id} href={repo.html_url} target="_blank" rel="noreferrer" className="proj-card">
              <div className="proj-head">
                <div className="proj-name">{repo.name}</div>
                <div className="proj-arrow">↗</div>
              </div>
              <div className="proj-desc">{repo.description || 'No description provided.'}</div>
              <div className="proj-meta">
                {repo.language && (
                  <div className="proj-lang">
                    <span className="lang-dot" style={{ background: LANG_COLORS[repo.language] ?? '#8b949e' }} />
                    {repo.language}
                  </div>
                )}
                {repo.stargazers_count > 0 && (
                  <div className="proj-stars">★ {repo.stargazers_count}</div>
                )}
                <div className="proj-updated">Updated {timeAgo(repo.updated_at)}</div>
              </div>
            </a>
          ))}
        </div>

        {displayed < repos.length && (
          <button className="load-more" onClick={() => setDisplayed(p => p + PER_PAGE)}>
            ↓ load more projects ({repos.length - displayed} remaining)
          </button>
        )}
      </div>
    </section>
  )
}

// ─── Certifications Section ───────────────────────────────────────────────────
function CertificationsSection() {
  const certs = [
    { icon: '🎯', name: 'SOC Level 1', issuer: 'TryHackMe', desc: 'Blue team operations, threat detection and incident response.', badge: 'Certified', bc: 'badge-g' },
    { icon: '🔓', name: 'Jr Penetration Tester', issuer: 'TryHackMe', desc: 'Full learning path — web exploitation, network pentesting, privilege escalation.', badge: 'Completed', bc: 'badge-b' },
    { icon: '☁️', name: 'Azure Fundamentals', issuer: 'Microsoft — AZ-900', desc: 'Cloud foundations — Azure services, security, compliance, and pricing.', badge: 'Certified', bc: 'badge-b' },
    { icon: '⚔️', name: 'Root-Me 100+', issuer: 'Root-Me.org', desc: '100+ CTF challenges — web, crypto, network, system exploitation.', badge: 'Active', bc: 'badge-o' },
    { icon: '📡', name: 'TOEIC 940/990', issuer: 'ETS Global', desc: 'Professional English proficiency — C1 level equivalent.', badge: 'Certified', bc: 'badge-g' },
    { icon: '🎓', name: 'Engineering Degree', issuer: 'ENSIL-ENSCI — Limoges', desc: 'Electronics & Telecommunications · 2022–2026. Infrastructure & Security specialisation.', badge: 'Obtained', bc: 'badge-g' },
  ]

  return (
    <section id="certifications" className="section active">
      <div className="certs-wrap">
        <h2 className="sec-title">Credentials & <span className="acc">Training.</span></h2>
        <p className="sec-sub">// Certifications & formation</p>
        <div className="certs-grid">
          {certs.map(c => (
            <div key={c.name} className="cert-card">
              <span className="cert-icon">{c.icon}</span>
              <div className="cert-name">{c.name}</div>
              <div className="cert-issuer">{c.issuer}</div>
              <div className="cert-desc">{c.desc}</div>
              <span className={`badge ${c.bc}`}>{c.badge}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Icons ────────────────────────────────────────────────────────────────────
const GithubIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
  </svg>
)
const LinkedinIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
)
const MailIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
    <polyline points="22,6 12,12 2,6"/>
  </svg>
)
const GlobeIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
    <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/>
  </svg>
)

// ─── Root Page ────────────────────────────────────────────────────────────────
export default function Page() {
  const [active, setActive] = useState<Section>('home')

  const nav: { id: Section; label: string }[] = [
    { id: 'home', label: 'Home' },
    { id: 'experience', label: 'Experience' },
    { id: 'projects', label: 'Projects' },
    { id: 'certifications', label: 'Certs' },
  ]

  return (
    <>
      <header className="header">
        <div className="logo">khalil<span>.sec</span></div>

        <nav className="toggle-nav">
          {nav.map(({ id, label }) => (
            <button
              key={id}
              className={`toggle-btn${active === id ? ' active' : ''}`}
              onClick={() => setActive(id)}
            >
              {label}
            </button>
          ))}
        </nav>

        <div className="status">
          <span className="status-dot" />
          open to work
        </div>
      </header>

      <main>
        {active === 'home'           && <HomeSection />}
        {active === 'experience'     && <ExperienceSection />}
        {active === 'projects'       && <ProjectsSection />}
        {active === 'certifications' && <CertificationsSection />}
      </main>
    </>
  )
}
