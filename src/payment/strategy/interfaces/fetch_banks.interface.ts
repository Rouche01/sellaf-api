import { FlwBank } from 'src/interfaces';

export interface FetchBanksArgs {
  country: string;
}

export type FetchBanksResponse = FlwBank[];
