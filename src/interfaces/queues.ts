import { QUEUES } from 'src/constants';

export type Queues = typeof QUEUES[keyof typeof QUEUES];
