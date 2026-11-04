const fs = require('node:fs');
const path = require('node:path');

const reportsDirectory = path.resolve(process.cwd(), 'reports');

// Recreate the reports directory before Cucumber opens the formatter streams.
fs.rmSync(reportsDirectory, { recursive: true, force: true });
fs.mkdirSync(reportsDirectory, { recursive: true });

const common = {
  require: ['features/support/**/*.ts', 'features/step_definitions/**/*.ts'],
  requireModule: ['tsx/cjs'],
  format: [
    'progress',
    'html:reports/cucumber-report.html',
    'json:reports/cucumber-report.json',
    'junit:reports/cucumber-report.xml',
  ],
  formatOptions: {
    snippetInterface: 'async-await',
  },
  publishQuiet: true,
  parallel: 0,
};

module.exports = {
  default: {
    ...common,
    paths: ['features/**/*.feature'],
  },
  smoke: {
    ...common,
    paths: ['features/**/*.feature'],
    tags: '@smoke',
  },
};
