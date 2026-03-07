import { NextResponse } from 'next/server';
import { getGame } from '@/lib/game-store';

type RouteContext = {
  params: {
    id: string;
  };
};

export async function GET(_request: Request, context: RouteContext) {
  const game = await getGame(context.params.id);

  if (!game) {
    return NextResponse.json({ error: 'Game not found.' }, { status: 404 });
  }

  return NextResponse.json(game);
}
