'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Board } from '@/utils/sudoku';

const GRID_SIZE = 9;

type CreateGameResponse = {
  id?: string;
  error?: string;
};

const parsePastedPuzzle = (input: string): Board | null => {
  const compact = input.replace(/[\s|,]/g, '');
  if (compact.length !== 81) {
    return null;
  }

  const values: (number | null)[] = [];

  for (const char of compact) {
    if (char === '.' || char === '0') {
      values.push(null);
      continue;
    }

    if (!/^[1-9]$/.test(char)) {
      return null;
    }

    values.push(Number(char));
  }

  return Array.from({ length: 9 }, (_, rowIndex) =>
    values.slice(rowIndex * 9, (rowIndex + 1) * 9)
  );
};

const createEmptyManualCells = (): string[][] => {
  return Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(''));
};

const boardToManualCells = (board: Board): string[][] => {
  return board.map((row) => row.map((value) => (value === null ? '' : String(value))));
};

const manualCellsToBoard = (cells: string[][]): Board => {
  return cells.map((row) => row.map((value) => (value === '' ? null : Number(value))));
};

const hasAnyManualValue = (cells: string[][]): boolean => {
  return cells.some((row) => row.some((value) => value !== ''));
};

const NewGameButton = () => {
  const [loadingAction, setLoadingAction] = useState<'random' | 'manual' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isManualMode, setIsManualMode] = useState(false);
  const [manualCells, setManualCells] = useState<string[][]>(() => createEmptyManualCells());
  const router = useRouter();

  const createGame = async (payload?: { puzzle: Board }) => {
    setError(null);
    setLoadingAction(payload ? 'manual' : 'random');

    try {
      const response = await fetch('/api/games', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: payload ? JSON.stringify(payload) : '{}',
      });

      const data = (await response.json().catch(() => ({}))) as CreateGameResponse;

      if (!response.ok) {
        throw new Error(data.error ?? 'Unable to create game');
      }

      if (!data.id) {
        throw new Error('Missing game id');
      }

      router.push(`/game/${data.id}`);
    } catch (caughtError) {
      const message =
        caughtError instanceof Error ? caughtError.message : 'Could not create puzzle.';
      setError(message);
      setLoadingAction(null);
    }
  };

  const startRandomGame = async () => {
    await createGame();
  };

  const updateManualCell = (row: number, col: number, input: string) => {
    if (loadingAction !== null) {
      return;
    }

    const nextChar = input.slice(-1);
    if (nextChar !== '' && !/^[0-9]$/.test(nextChar)) {
      return;
    }

    const nextValue = nextChar === '0' ? '' : nextChar;

    setManualCells((previous) => {
      const next = previous.map((currentRow) => [...currentRow]);
      next[row][col] = nextValue;
      return next;
    });
  };

  const handleCellPaste = (text: string): boolean => {
    const parsedBoard = parsePastedPuzzle(text);
    if (!parsedBoard) {
      return false;
    }

    setManualCells(boardToManualCells(parsedBoard));
    setError(null);
    return true;
  };

  const startManualGame = async () => {
    if (!hasAnyManualValue(manualCells)) {
      setError('Enter at least one number before saving.');
      return;
    }

    const puzzle = manualCellsToBoard(manualCells);
    await createGame({ puzzle });
  };

  const isLoading = loadingAction !== null;

  return (
    <section className="w-full max-w-xl rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <h1 className="text-xl font-semibold text-slate-900">Sudoku</h1>
      <p className="mt-2 text-sm text-slate-600">
        Start a random puzzle or paste your own 9x9 puzzle.
      </p>

      <button
        type="button"
        onClick={startRandomGame}
        disabled={isLoading || isManualMode}
        className="mt-4 rounded bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loadingAction === 'random' ? 'Creating puzzle...' : 'Generate Random Puzzle'}
      </button>

      <div className="my-5 border-t border-slate-200" />

      {!isManualMode && (
        <button
          type="button"
          onClick={() => {
            setError(null);
            setIsManualMode(true);
          }}
          disabled={isLoading}
          className="rounded border border-sky-600 bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700 disabled:cursor-not-allowed disabled:border-slate-300 disabled:bg-slate-300"
        >
          Enter Puzzle Manually
        </button>
      )}

      {isManualMode && (
        <div>
          <p className="text-sm font-medium text-slate-800">Manual 9x9 puzzle input</p>
          <p className="mt-1 text-xs text-slate-500">
            Enter clues directly in the grid. Paste 81 cells (1-9 with 0/. as blanks) into any cell to auto-fill.
          </p>
          <div className="mt-3 inline-block rounded border-2 border-slate-800">
            <div className="grid grid-cols-9">
              {manualCells.map((row, rowIndex) =>
                row.map((value, colIndex) => (
                  <input
                    key={`manual-${rowIndex}-${colIndex}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={value}
                    disabled={isLoading}
                    onChange={(event) =>
                      updateManualCell(rowIndex, colIndex, event.target.value)
                    }
                    onPaste={(event) => {
                      if (handleCellPaste(event.clipboardData.getData('text'))) {
                        event.preventDefault();
                      }
                    }}
                    aria-label={`Manual row ${rowIndex + 1} column ${colIndex + 1}`}
                    className="h-9 w-9 border border-slate-300 text-center text-base text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 disabled:cursor-not-allowed disabled:bg-slate-100"
                    style={{
                      borderTopWidth: rowIndex % 3 === 0 ? '2px' : '1px',
                      borderLeftWidth: colIndex % 3 === 0 ? '2px' : '1px',
                      borderRightWidth:
                        colIndex === GRID_SIZE - 1 || colIndex % 3 === 2 ? '2px' : '1px',
                      borderBottomWidth:
                        rowIndex === GRID_SIZE - 1 || rowIndex % 3 === 2 ? '2px' : '1px',
                    }}
                  />
                ))
              )}
            </div>
          </div>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={startManualGame}
              disabled={isLoading}
              className="rounded border border-sky-600 bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700 disabled:cursor-not-allowed disabled:border-slate-300 disabled:bg-slate-300"
            >
              {loadingAction === 'manual' ? 'Saving puzzle...' : 'Save Manual Puzzle'}
            </button>
            <button
              type="button"
              onClick={() => {
                setManualCells(createEmptyManualCells());
                setError(null);
              }}
              disabled={isLoading}
              className="rounded border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={() => {
                setError(null);
                setIsManualMode(false);
              }}
              disabled={isLoading}
              className="rounded border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {error && <p className="mt-2 text-sm font-medium text-red-700">{error}</p>}
    </section>
  );
};

export default NewGameButton;
