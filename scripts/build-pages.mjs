#!/usr/bin/env node
/**
 * Builds the static landing page that is deployed to GitHub Pages.
 *
 * Input layout (filled by the `deploy-reports` job of the CI workflow):
 *   site/api/playwright   -> Playwright HTML report
 *   site/api/allure       -> Allure HTML report
 *   site/ui               -> Cucumber HTML/JSON/JUnit reports
 *
 * Missing folders are tolerated so the site still deploys for partial runs.
 */
import fs from 'node:fs';
import path from 'node:path';

const siteDir = path.resolve(process.cwd(), 'site');
const fromSite = (...parts) => path.join(siteDir, ...parts);

fs.mkdirSync(siteDir, { recursive: true });

// Prevent Jekyll from mangling the generated reports.
fs.writeFileSync(fromSite('.nojekyll'), '', 'utf8');

const escapeHtml = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (character) =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
      })[character],
  );

const readJson = (...parts) => {
  try {
    return JSON.parse(fs.readFileSync(fromSite(...parts), 'utf8'));
  } catch {
    return null;
  }
};

const exists = (...parts) => fs.existsSync(fromSite(...parts));

const statusStyles = {
  success: { label: 'Passed', className: 'passed' },
  failure: { label: 'Failed', className: 'failed' },
  cancelled: { label: 'Cancelled', className: 'cancelled' },
  skipped: { label: 'Skipped', className: 'skipped' },
};

const statusBadge = (result) => {
  const status = statusStyles[result] ?? { label: 'Unknown', className: 'skipped' };
  return `<span class="badge ${status.className}">${status.label}</span>`;
};

function allureSummary() {
  const statistic = readJson('api', 'allure', 'widgets', 'summary.json')?.statistic;

  if (!statistic) {
    return null;
  }

  return `${statistic.passed ?? 0} passed · ${statistic.failed ?? 0} failed · ${
    statistic.broken ?? 0
  } broken · ${statistic.skipped ?? 0} skipped (${statistic.total ?? 0} total)`;
}

function cucumberSummary() {
  const features = readJson('ui', 'cucumber-report.json');

  if (!Array.isArray(features)) {
    return null;
  }

  let passed = 0;
  let failed = 0;
  let skipped = 0;

  for (const feature of features) {
    for (const element of feature?.elements ?? []) {
      if (element?.type !== 'scenario') {
        continue;
      }

      const statuses = (element.steps ?? [])
        .map((step) => step?.result?.status)
        .filter(Boolean);

      if (statuses.includes('failed')) {
        failed += 1;
      } else if (statuses.includes('skipped') || statuses.includes('undefined')) {
        skipped += 1;
      } else {
        passed += 1;
      }
    }
  }

  return `${passed} passed · ${failed} failed · ${skipped} skipped (${
    passed + failed + skipped
  } total)`;
}

const reports = [
  {
    title: 'API · Playwright HTML',
    description:
      'Resultado de Playwright Test con steps, adjuntos JSON, trazas y log de ejecución por test.',
    href: 'api/playwright/',
    available: exists('api', 'playwright', 'index.html'),
    summary: null,
  },
  {
    title: 'API · Allure',
    description:
      'Vista Allure con historias, severidades, timelines y detalle de cada request de la capa API.',
    href: 'api/allure/',
    available: exists('api', 'allure', 'index.html'),
    summary: allureSummary(),
  },
  {
    title: 'UI · Cucumber',
    description:
      'Reporte BDD con escenarios Gherkin, screenshots adjuntos, JSON de /auth/me y execution-log.txt.',
    href: 'ui/cucumber-report.html',
    available: exists('ui', 'cucumber-report.html'),
    summary: cucumberSummary(),
  },
];

const cards = reports
  .map((report) => {
    const body = report.available
      ? `<p class="card-description">${escapeHtml(report.description)}</p>
         ${report.summary ? `<p class="card-summary">${escapeHtml(report.summary)}</p>` : ''}
         <a class="card-link" href="${escapeHtml(report.href)}">Abrir reporte →</a>`
      : `<p class="card-description">${escapeHtml(report.description)}</p>
         <p class="card-summary">No se generó en esta ejecución.</p>
         <span class="card-link disabled">No disponible</span>`;

    return `<article class="card">
        <h2>${escapeHtml(report.title)}</h2>
        ${body}
      </article>`;
  })
  .join('\n');

const repository = process.env.GITHUB_REPOSITORY ?? 'eventhub-automation';
const repositoryUrl = `https://github.com/${repository}`;
const branch = process.env.GITHUB_REF_NAME ?? 'local';
const commit = (process.env.GITHUB_SHA ?? '').slice(0, 7) || '—';
const runNumber = process.env.GITHUB_RUN_NUMBER;
const runUrl = process.env.GITHUB_RUN_ID
  ? `${repositoryUrl}/actions/runs/${process.env.GITHUB_RUN_ID}`
  : repositoryUrl;
const generatedAt = new Date().toISOString().replace('T', ' ').slice(0, 19);

const html = `<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>EventHub Automation · Test Reports</title>
    <style>
      :root {
        color-scheme: light;
        --bg: #f4f6fb;
        --surface: #ffffff;
        --text: #1b2432;
        --muted: #5c6b82;
        --border: #dde3ee;
        --accent: #3d5afe;
      }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        min-height: 100vh;
        font-family: "Segoe UI", system-ui, -apple-system, sans-serif;
        background: var(--bg);
        color: var(--text);
      }
      main { max-width: 1040px; margin: 0 auto; padding: 48px 24px 64px; }
      header h1 { margin: 0 0 8px; font-size: 2rem; letter-spacing: -0.02em; }
      header p { margin: 0 0 20px; color: var(--muted); }
      .jobs { display: flex; flex-wrap: wrap; gap: 12px; margin-bottom: 20px; }
      .job {
        display: inline-flex; align-items: center; gap: 8px;
        padding: 8px 14px; border-radius: 999px;
        background: var(--surface); border: 1px solid var(--border);
        font-size: 0.9rem; font-weight: 600;
      }
      .badge {
        display: inline-block; padding: 2px 10px; border-radius: 999px;
        font-size: 0.75rem; font-weight: 700; text-transform: uppercase;
        letter-spacing: 0.04em;
      }
      .badge.passed { background: #e3f8ec; color: #0f7b46; }
      .badge.failed { background: #fde8e8; color: #b42318; }
      .badge.cancelled { background: #fff4dd; color: #9a6200; }
      .badge.skipped { background: #eef1f6; color: #5c6b82; }
      dl.meta {
        display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
        gap: 12px; margin: 0 0 36px; padding: 16px;
        background: var(--surface); border: 1px solid var(--border); border-radius: 12px;
      }
      dl.meta div { min-width: 0; }
      dl.meta dt {
        font-size: 0.72rem; font-weight: 700; text-transform: uppercase;
        letter-spacing: 0.06em; color: var(--muted); margin-bottom: 4px;
      }
      dl.meta dd {
        margin: 0; font-size: 0.92rem; overflow: hidden; text-overflow: ellipsis;
        white-space: nowrap;
      }
      dl.meta a { color: var(--accent); text-decoration: none; }
      .cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; }
      .card {
        display: flex; flex-direction: column;
        padding: 22px; background: var(--surface);
        border: 1px solid var(--border); border-radius: 14px;
        box-shadow: 0 8px 24px rgba(27, 36, 50, 0.04);
      }
      .card h2 { margin: 0 0 10px; font-size: 1.1rem; }
      .card-description { margin: 0 0 12px; color: var(--muted); font-size: 0.9rem; line-height: 1.5; }
      .card-summary { margin: 0 0 18px; font-size: 0.85rem; font-weight: 600; }
      .card-link {
        margin-top: auto; align-self: flex-start;
        color: var(--accent); font-weight: 700; font-size: 0.9rem; text-decoration: none;
      }
      .card-link:hover { text-decoration: underline; }
      .card-link.disabled { color: var(--muted); cursor: not-allowed; }
      footer { margin-top: 40px; color: var(--muted); font-size: 0.8rem; }
    </style>
  </head>
  <body>
    <main>
      <header>
        <h1>EventHub Automation · Test Reports</h1>
        <p>Resultados de la última ejecución de CI para las capas API y UI.</p>
        <div class="jobs">
          <span class="job">API (Playwright) ${statusBadge(process.env.API_RESULT)}</span>
          <span class="job">UI (Cucumber BDD) ${statusBadge(process.env.UI_RESULT)}</span>
        </div>
      </header>

      <dl class="meta">
        <div><dt>Repositorio</dt><dd><a href="${escapeHtml(repositoryUrl)}">${escapeHtml(repository)}</a></dd></div>
        <div><dt>Rama</dt><dd>${escapeHtml(branch)}</dd></div>
        <div><dt>Commit</dt><dd>${escapeHtml(commit)}</dd></div>
        <div><dt>Ejecución</dt><dd>${
          runNumber ? `<a href="${escapeHtml(runUrl)}">#${escapeHtml(runNumber)}</a>` : 'Local'
        }</dd></div>
        <div><dt>Generado (UTC)</dt><dd>${escapeHtml(generatedAt)}</dd></div>
      </dl>

      <section class="cards">
        ${cards}
      </section>

      <footer>
        Generado automáticamente por GitHub Actions. Los artefactos completos de cada
        ejecución (incluidos los logs) quedan disponibles en la pestaña Actions del repositorio.
      </footer>
    </main>
  </body>
</html>
`;

fs.writeFileSync(fromSite('index.html'), html, 'utf8');

const available = reports.filter((report) => report.available).length;
console.log(`Built GitHub Pages site at ${siteDir} (${available}/${reports.length} reports available).`);
