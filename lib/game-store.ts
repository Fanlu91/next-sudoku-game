import 'server-only';

import { randomUUID } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import {
  GameRecord,
  GameResult,
  GameStore,
  MoveInput,
  MoveRecord,
  PersistedGame,
} from '@/lib/game-types';
import { createPuzzleAndSolution } from '@/utils/sudoku';

const DATA_DIRECTORY = path.join(process.cwd(), '.data');
const STORE_PATH = path.join(DATA_DIRECTORY, 'sudoku-games.json');

const createEmptyStore = (): GameStore => ({
  games: {},
  moves: {},
});

const readStore = async (): Promise<GameStore> => {
  try {
    const raw = await readFile(STORE_PATH, 'utf8');
    return JSON.parse(raw) as GameStore;
  } catch (error) {
    const readError = error as NodeJS.ErrnoException;
    if (readError.code === 'ENOENT') {
      return createEmptyStore();
    }

    throw error;
  }
};

const writeStore = async (store: GameStore): Promise<void> => {
  await mkdir(DATA_DIRECTORY, { recursive: true });
  await writeFile(STORE_PATH, JSON.stringify(store), 'utf8');
};

const sortMoves = (moves: MoveRecord[]): MoveRecord[] => {
  return [...moves].sort((left, right) => left.step - right.step);
};

const buildPersistedGame = (store: GameStore, id: string): PersistedGame | null => {
  const game = store.games[id];
  if (!game) {
    return null;
  }

  return {
    ...game,
    moves: sortMoves(store.moves[id] ?? []),
  };
};

export const createGame = async (difficulty = 'normal'): Promise<GameRecord> => {
  const store = await readStore();
  const id = randomUUID();
  const timestamp = new Date().toISOString();
  const { puzzle, solution } = createPuzzleAndSolution(difficulty);

  const game: GameRecord = {
    id,
    puzzle,
    solution,
    status: 'in_progress',
    result: null,
    createdAt: timestamp,
    completedAt: null,
  };

  store.games[id] = game;
  store.moves[id] = [];

  await writeStore(store);

  return game;
};

export const getGame = async (id: string): Promise<PersistedGame | null> => {
  const store = await readStore();
  return buildPersistedGame(store, id);
};

export const addMove = async (
  gameId: string,
  input: MoveInput
): Promise<MoveRecord | null> => {
  const store = await readStore();
  const game = store.games[gameId];

  if (!game) {
    return null;
  }

  if (game.puzzle[input.row][input.col] !== null) {
    return null;
  }

  const gameMoves = store.moves[gameId] ?? [];
  const move: MoveRecord = {
    id: randomUUID(),
    gameId,
    row: input.row,
    col: input.col,
    value: input.value,
    step: gameMoves.length + 1,
    createdAt: new Date().toISOString(),
  };

  gameMoves.push(move);
  store.moves[gameId] = gameMoves;

  await writeStore(store);

  return move;
};

export const saveResult = async (
  gameId: string,
  result: GameResult
): Promise<GameRecord | null> => {
  const store = await readStore();
  const game = store.games[gameId];

  if (!game) {
    return null;
  }

  game.result = result;
  game.status = result === 'solved' ? 'solved' : 'failed';
  game.completedAt = new Date().toISOString();

  await writeStore(store);

  return game;
};
