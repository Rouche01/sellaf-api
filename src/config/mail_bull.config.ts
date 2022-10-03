import { QueueOptions } from 'bullmq';
import { applicationConfig } from './application.config';

export const mailBullConfig: QueueOptions = {
  connection: {
    host: applicationConfig().redisHost,
    port: +applicationConfig().redisPort,
    db: 1,
  },
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 300 },
  },
};
