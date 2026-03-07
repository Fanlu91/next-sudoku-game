'use client';

import { useMemo, useState } from 'react';
import { Board, createSudoku } from '@/utils/sudoku';

const GRID_SIZE = 9;

type CompletionState = 'solved' | 'errors' | null;

const createEmptyBoard = (): Board =>
  Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(null));

const createPuzzleBoard = (): Board => {
  const board: Board = Array.from({ length: GRID_SIZE }, () =>
    Array(GRID_SIZE).fill(0)
  );
  createSudoku(board, 'normal');
  return board.map((row) => row.map((cell) => (cell === 0 ? null : cell)));
};

const hasConflict = (
  board: Board,
  row: number,
  col: number,
  value: number
): boolean => {
  for (let i = 0; i < GRID_SIZE; i++) {
    if (i !== col && board[row][i] === value) {
      return true;
    }

    if (i !== row && board[i][col] === value) {
      return true;
    }
  }

  const startRow = Math.floor(row / 3) * 3;
  const startCol = Math.floor(col / 3) * 3;

  for (let r = startRow; r < startRow + 3; r++) {
    for (let c = startCol; c < startCol + 3; c++) {
      if ((r !== row || c !== col) && board[r][c] === value) {
        return true;
      }
    }
  }

  return false;
};

const getInvalidCells = (board: Board): boolean[][] => {
  const invalid: boolean[][] = Array.from({ length: GRID_SIZE }, () =>
    Array(GRID_SIZE).fill(false)
  );

  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      const value = board[row][col];
      if (value === null) {
        continue;
      }

      if (value < 1 || value > 9 || hasConflict(board, row, col, value)) {
        invalid[row][col] = true;
      }
    }
  }

  return invalid;
};

const isValidGroup = (values: (number | null)[]): boolean => {
  if (values.some((value) => value === null)) {
    return false;
  }

  return new Set(values).size === GRID_SIZE;
};

const isSolvedBoard = (board: Board): boolean => {
  for (let row = 0; row < GRID_SIZE; row++) {
    if (!isValidGroup(board[row])) {
      return false;
    }
  }

  for (let col = 0; col < GRID_SIZE; col++) {
    const column = board.map((row) => row[col]);
    if (!isValidGroup(column)) {
      return false;
    }
  }

  for (let boxRow = 0; boxRow < 3; boxRow++) {
    for (let boxCol = 0; boxCol < 3; boxCol++) {
      const values: (number | null)[] = [];

      for (let row = boxRow * 3; row < boxRow * 3 + 3; row++) {
        for (let col = boxCol * 3; col < boxCol * 3 + 3; col++) {
          values.push(board[row][col]);
        }
      }

      if (!isValidGroup(values)) {
        return false;
      }
    }
  }

  return true;
};

const SudokuBoard = () => {
  const [board, setBoard] = useState<Board>(createEmptyBoard());
  const [editableCells, setEditableCells] = useState<boolean[][]>(
    Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(false))
  );
  const [hasPuzzle, setHasPuzzle] = useState(false);

  const invalidCells = useMemo(() => getInvalidCells(board), [board]);
  const isBoardFull = useMemo(
    () => board.every((row) => row.every((cell) => cell !== null)),
    [board]
  );

  const completionState: CompletionState = useMemo(() => {
    if (!hasPuzzle || !isBoardFull) {
      return null;
    }

    return isSolvedBoard(board) ? 'solved' : 'errors';
  }, [board, hasPuzzle, isBoardFull]);

  const generatePuzzle = () => {
    const puzzle = createPuzzleBoard();
    setBoard(puzzle);
    setEditableCells(puzzle.map((row) => row.map((value) => value === null)));
    setHasPuzzle(true);
  };

  const updateCell = (row: number, col: number, input: string) => {
    if (!editableCells[row][col]) {
      return;
    }

    const nextChar = input.slice(-1);

    setBoard((previous) => {
      const nextBoard = previous.map((currentRow) => [...currentRow]);

      if (nextChar === '') {
        nextBoard[row][col] = null;
        return nextBoard;
      }

      if (/^[1-9]$/.test(nextChar)) {
        nextBoard[row][col] = Number(nextChar);
      }

      return nextBoard;
    });
  };

  return (
    <section className="w-full max-w-[420px]">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h1 className="text-xl font-semibold">Sudoku</h1>
        <button
          type="button"
          className="rounded bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-700"
          onClick={generatePuzzle}
        >
          Generate Puzzle
        </button>
      </div>

      <div className="grid grid-cols-9">
        {board.map((row, rowIndex) =>
          row.map((value, colIndex) => {
            const isEditable = hasPuzzle && editableCells[rowIndex][colIndex];
            const isInvalid = invalidCells[rowIndex][colIndex];

            return (
              <input
                key={`${rowIndex}-${colIndex}`}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={value ?? ''}
                disabled={!isEditable}
                onChange={(event) =>
                  updateCell(rowIndex, colIndex, event.target.value)
                }
                aria-label={`Row ${rowIndex + 1} Column ${colIndex + 1}`}
                className={`h-10 w-10 border text-center text-lg focus:outline-none focus:ring-2 focus:ring-sky-500 ${
                  isEditable
                    ? 'bg-white text-slate-900'
                    : 'bg-slate-100 font-semibold text-slate-800'
                } ${isInvalid ? 'border-red-500 bg-red-100 text-red-700' : 'border-slate-300'}`}
                style={{
                  borderTopWidth: rowIndex % 3 === 0 ? '2px' : '1px',
                  borderLeftWidth: colIndex % 3 === 0 ? '2px' : '1px',
                  borderRightWidth:
                    colIndex === GRID_SIZE - 1 || colIndex % 3 === 2 ? '2px' : '1px',
                  borderBottomWidth:
                    rowIndex === GRID_SIZE - 1 || rowIndex % 3 === 2 ? '2px' : '1px',
                }}
              />
            );
          })
        )}
      </div>

      <p className="mt-4 min-h-6 text-sm text-slate-700">
        {!hasPuzzle && 'Click Generate Puzzle to start a new game.'}
        {hasPuzzle && !isBoardFull &&
          'Fill the blank cells. Invalid entries are highlighted in red.'}
        {completionState === 'solved' && (
          <span className="font-medium text-green-700">Solved correctly.</span>
        )}
        {completionState === 'errors' && (
          <span className="font-medium text-red-700">
            Board is full, but the solution has errors.
          </span>
        )}
      </p>
    </section>
  );
};

export default SudokuBoard;
