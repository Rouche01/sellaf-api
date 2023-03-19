import { Queues } from 'src/interfaces/queues';

export interface AddJobArgs<T> {
  queueName: Queues;
  jobName: string;
  jobId: string;
  data: T;
  jobDelay?: number;
}
