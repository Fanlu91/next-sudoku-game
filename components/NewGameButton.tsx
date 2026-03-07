'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

const NewGameButton = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const startGame = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/games', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Unable to create game');
      }

      const payload = (await response.json()) as { id?: string };

      if (!payload.id) {
        throw new Error('Missing game id');
      }

      router.push(`/game/${payload.id}`);
    } catch {
      setError('Could not create a puzzle. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <section className="w-full max-w-sm rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <h1 className="text-xl font-semibold text-slate-900">Sudoku</h1>
      <p className="mt-2 text-sm text-slate-600">Create a new puzzle and continue on a dedicated game page.</p>
      <button
        type="button"
        onClick={startGame}
        disabled={isLoading}
        className="mt-4 rounded bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isLoading ? 'Creating puzzle...' : 'Generate Puzzle'}
      </button>
      {error && <p className="mt-2 text-sm font-medium text-red-700">{error}</p>}
    </section>
  );
};

export default NewGameButton;
