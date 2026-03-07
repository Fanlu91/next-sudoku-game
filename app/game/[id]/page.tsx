import Link from 'next/link';
import { notFound } from 'next/navigation';
import SudokuBoard from '@/components/SudokuBoard';
import { getGame } from '@/lib/game-store';

type GamePageProps = {
  params: {
    id: string;
  };
};

const GamePage = async ({ params }: GamePageProps) => {
  const game = await getGame(params.id);

  if (!game) {
    notFound();
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-5 px-4 py-8">
      <SudokuBoard
        gameId={game.id}
        initialPuzzle={game.puzzle}
        initialMoves={game.moves}
        initialStatus={game.status}
        initialResult={game.result}
      />
      <Link href="/" className="text-sm font-medium text-slate-700 underline">
        Start a new game
      </Link>
    </main>
  );
};

export default GamePage;
