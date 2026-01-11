import { Player } from './Player';

export interface Team {
  id: number;
  name: string;
  country: string;
  logo?: string;
  players?: Player[];
  att?: number;
  mid?: number;
  def?: number;
  budget?: number;
}
