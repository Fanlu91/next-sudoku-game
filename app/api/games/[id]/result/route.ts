import { NextResponse } from 'next/server';
import { saveResult } from '@/lib/game-store';
import { GameResult } from '@/lib/game-types';

type ResultPayload = {
  result?: GameResult;
};

type RouteContext = {
  params: {
    id: string;
  };
};

const isGameResult = (value: unknown): value is GameResult => {
  return value === 'solved' || value === 'errors';
};

export async function POST(request: Request, context: RouteContext) {
  const body = await request.json().catch(() => null) as ResultPayload | null;

  if (!body || !isGameResult(body.result)) {
    return NextResponse.json({ error: 'Invalid result payload.' }, { status: 400 });
  }

  const game = await saveResult(context.params.id, body.result);

  if (!game) {
    return NextResponse.json({ error: 'Game not found.' }, { status: 404 });
  }

  return NextResponse.json({
    id: game.id,
    status: game.status,
    result: game.result,
    completedAt: game.completedAt,
  });
}
