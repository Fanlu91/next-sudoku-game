import { Board } from '@/utils/sudoku';

export type GameResult = 'solved' | 'errors';

export type GameStatus = 'in_progress' | 'solved' | 'failed';

export type GameRecord = {
  id: string;
  puzzle: Board;
  solution: Board;
  status: GameStatus;
  result: GameResult | null;
  createdAt: string;
  completedAt: string | null;
};

export type MoveRecord = {
  id: string;
  gameId: string;
  step: number;
  row: number;
  col: number;
  value: number | null;
  createdAt: string;
};

export type PersistedGame = GameRecord & {
  moves: MoveRecord[];
};

type StoreShape = {
  games: Record<string, GameRecord>;
  moves: Record<string, MoveRecord[]>;
};

export type GameStore = StoreShape;

export type MoveInput = {
  row: number;
  col: number;
  value: number | null;
};
