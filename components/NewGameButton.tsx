'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Board } from '@/utils/sudoku';

type CreateGameResponse = {
  id?: string;
  error?: string;
};

const parseManualPuzzle = (input: string): Board | null => {
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

const NewGameButton = () => {
  const [loadingAction, setLoadingAction] = useState<'random' | 'manual' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [manualPuzzleText, setManualPuzzleText] = useState('');
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

  const startManualGame = async () => {
    const puzzle = parseManualPuzzle(manualPuzzleText);
    if (!puzzle) {
      setError('Enter 81 cells using 1-9 and 0/. for blanks.');
      return;
    }

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
        disabled={isLoading}
        className="mt-4 rounded bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loadingAction === 'random' ? 'Creating puzzle...' : 'Generate Random Puzzle'}
      </button>

      <div className="my-5 border-t border-slate-200" />

      <label htmlFor="manual-puzzle" className="text-sm font-medium text-slate-800">
        Manual puzzle input
      </label>
      <textarea
        id="manual-puzzle"
        value={manualPuzzleText}
        onChange={(event) => setManualPuzzleText(event.target.value)}
        disabled={isLoading}
        className="mt-2 h-40 w-full resize-none rounded border border-slate-300 p-2 font-mono text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 disabled:cursor-not-allowed disabled:bg-slate-100"
        placeholder="Example (9 lines, 0 or . means empty):&#10;530070000&#10;600195000&#10;098000060&#10;800060003&#10;400803001&#10;700020006&#10;060000280&#10;000419005&#10;000080079"
      />
      <p className="mt-2 text-xs text-slate-500">
        Use 9 lines of 9 chars (1-9, 0 or .). Spaces and commas are ignored.
      </p>
      <button
        type="button"
        onClick={startManualGame}
        disabled={isLoading}
        className="mt-3 rounded border border-sky-600 bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700 disabled:cursor-not-allowed disabled:border-slate-300 disabled:bg-slate-300"
      >
        {loadingAction === 'manual' ? 'Saving puzzle...' : 'Save Manual Puzzle'}
      </button>

      {error && <p className="mt-2 text-sm font-medium text-red-700">{error}</p>}
    </section>
  );
};

export default NewGameButton;
