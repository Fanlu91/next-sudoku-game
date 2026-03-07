import { NextResponse } from 'next/server';
import { createGame } from '@/lib/game-store';

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({} as { difficulty?: string }));
  const difficulty = typeof body.difficulty === 'string' ? body.difficulty : 'normal';

  const game = await createGame(difficulty);

  return NextResponse.json({ id: game.id }, { status: 201 });
}
