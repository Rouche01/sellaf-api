import { QueueOptions } from 'bullmq';
import { applicationConfig } from './application.config';

export const bullMqConfig: QueueOptions = {
  connection: {
    host: applicationConfig().redisHost,
    port: +applicationConfig().redisPort,
    db: 1,
  },
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 300 },
    // removeOnComplete: true,
    // removeOnFail: true,
  },
};
