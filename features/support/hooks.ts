import {
  After,
  Before,
  setDefaultTimeout,
  Status,
} from '@cucumber/cucumber';
import { EventHubWorld } from './world';

setDefaultTimeout(60_000);

Before(async function (this: EventHubWorld, { pickle }) {
  this.logger.info(`BDD SCENARIO START | ${pickle.name}`, {
    tags: pickle.tags.map((tag) => tag.name),
  });

  await this.initialise();
});

After(async function (this: EventHubWorld, { pickle, result }) {
  const status = result?.status ?? Status.UNKNOWN;

  this.logger.info(`BDD SCENARIO END   | ${pickle.name}`, {
    status,
    durationMs: this.startedAt > 0 ? Date.now() - this.startedAt : undefined,
  });

  try {
    if (status === Status.FAILED) {
      try {
        await this.attachScreenshot('failure-screenshot');
      } catch (error) {
        this.logger.warn('Failed to attach the failure screenshot', { error });
      }
    }

    if (this.logCapture) {
      const lines = this.logCapture.getLines();

      if (lines.length > 0) {
        this.attach(lines.join('\n'), {
          mediaType: 'text/plain',
          fileName: 'execution-log.txt',
        });
      }
    }
  } finally {
    await this.dispose();
  }
});
