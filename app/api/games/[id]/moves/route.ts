import { NextResponse } from 'next/server';
import { addMove } from '@/lib/game-store';

type MovePayload = {
  row?: number;
  col?: number;
  value?: number | null;
};

type RouteContext = {
  params: {
    id: string;
  };
};

const isIntegerInRange = (value: unknown, min: number, max: number): value is number => {
  return Number.isInteger(value) && (value as number) >= min && (value as number) <= max;
};

const isMoveValue = (value: unknown): value is number | null => {
  if (value === null) {
    return true;
  }

  return isIntegerInRange(value, 1, 9);
};

export async function POST(request: Request, context: RouteContext) {
  const body = await request.json().catch(() => null) as MovePayload | null;

  if (!body || !isIntegerInRange(body.row, 0, 8) || !isIntegerInRange(body.col, 0, 8) || !isMoveValue(body.value)) {
    return NextResponse.json({ error: 'Invalid move payload.' }, { status: 400 });
  }

  const move = await addMove(context.params.id, {
    row: body.row,
    col: body.col,
    value: body.value,
  });

  if (!move) {
    return NextResponse.json({ error: 'Game not found or cell is not editable.' }, { status: 404 });
  }

  return NextResponse.json(move, { status: 201 });
}
