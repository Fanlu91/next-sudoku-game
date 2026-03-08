import { NextResponse } from 'next/server';
import { createGame, createGameFromPuzzle } from '@/lib/game-store';
import { hasBoardConflicts, isBoardShape } from '@/utils/sudoku';

type CreateGamePayload = {
  difficulty?: string;
  puzzle?: unknown;
};

export async function POST(request: Request) {
  const payload = await request.json().catch(() => ({}));
  const body: CreateGamePayload =
    typeof payload === 'object' && payload !== null ? (payload as CreateGamePayload) : {};

  if (body.puzzle !== undefined) {
    if (!isBoardShape(body.puzzle)) {
      return NextResponse.json({ error: 'Invalid puzzle payload.' }, { status: 400 });
    }

    if (hasBoardConflicts(body.puzzle)) {
      return NextResponse.json({ error: 'Puzzle has conflicts.' }, { status: 400 });
    }

    const game = await createGameFromPuzzle(body.puzzle);
    if (!game) {
      return NextResponse.json({ error: 'Puzzle is unsolvable.' }, { status: 400 });
    }

    return NextResponse.json({ id: game.id }, { status: 201 });
  }

  const difficulty = typeof body.difficulty === 'string' ? body.difficulty : 'normal';
  const game = await createGame(difficulty);

  return NextResponse.json({ id: game.id }, { status: 201 });
}
