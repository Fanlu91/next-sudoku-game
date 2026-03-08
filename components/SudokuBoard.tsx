'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { GameResult, GameStatus, MoveRecord } from '@/lib/game-types';
import { Board, createSolvePlan } from '@/utils/sudoku';

const GRID_SIZE = 9;
const STEP_DELAY_MS = 2000;

type CompletionState = GameResult | null;

type SudokuBoardProps = {
  gameId: string;
  initialPuzzle: Board;
  initialMoves: MoveRecord[];
  initialStatus: GameStatus;
  initialResult: GameResult | null;
};

const createEditableCells = (puzzle: Board): boolean[][] => {
  return puzzle.map((row) => row.map((value) => value === null));
};

const applyMoves = (puzzle: Board, moves: MoveRecord[]): Board => {
  const nextBoard = puzzle.map((row) => [...row]);

  for (const move of [...moves].sort((left, right) => left.step - right.step)) {
    if (!Number.isInteger(move.row) || !Number.isInteger(move.col)) {
      continue;
    }

    if (move.row < 0 || move.row >= GRID_SIZE || move.col < 0 || move.col >= GRID_SIZE) {
      continue;
    }

    if (puzzle[move.row][move.col] !== null) {
      continue;
    }

    nextBoard[move.row][move.col] = move.value;
  }

  return nextBoard;
};

const sortMoves = (moves: MoveRecord[]): MoveRecord[] => {
  return [...moves].sort((left, right) => left.step - right.step);
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
  const digits = values.filter((value): value is number => value !== null);

  if (digits.length !== GRID_SIZE) {
    return false;
  }

  if (digits.some((value) => value < 1 || value > GRID_SIZE)) {
    return false;
  }

  return new Set(digits).size === GRID_SIZE;
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

const SudokuBoard = ({
  gameId,
  initialPuzzle,
  initialMoves,
  initialStatus,
  initialResult,
}: SudokuBoardProps) => {
  const sortedMoves = useMemo(() => sortMoves(initialMoves), [initialMoves]);
  const isReplayMode = initialStatus !== 'in_progress' || initialResult !== null;
  const totalReplaySteps = sortedMoves.length;
  const [board, setBoard] = useState<Board>(() => applyMoves(initialPuzzle, sortedMoves));
  const [replayStep, setReplayStep] = useState<number>(isReplayMode ? 0 : totalReplaySteps);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [isAutoSolving, setIsAutoSolving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const editableCells = useMemo(() => createEditableCells(initialPuzzle), [initialPuzzle]);
  const lastPersistedResult = useRef<GameResult | null>(initialResult);
  const replayBoard = useMemo(
    () => applyMoves(initialPuzzle, sortedMoves.slice(0, replayStep)),
    [initialPuzzle, replayStep, sortedMoves]
  );
  const renderedBoard = isReplayMode ? replayBoard : board;

  const invalidCells = useMemo(() => getInvalidCells(renderedBoard), [renderedBoard]);
  const isBoardFull = useMemo(
    () => renderedBoard.every((row) => row.every((cell) => cell !== null)),
    [renderedBoard]
  );

  const completionState: CompletionState = useMemo(() => {
    if (isReplayMode) {
      return replayStep === totalReplaySteps ? initialResult : null;
    }

    if (!isBoardFull) {
      return null;
    }

    return isSolvedBoard(renderedBoard) ? 'solved' : 'errors';
  }, [
    initialResult,
    isBoardFull,
    isReplayMode,
    renderedBoard,
    replayStep,
    totalReplaySteps,
  ]);

  useEffect(() => {
    if (!isReplayMode || !isAutoPlaying) {
      return;
    }

    if (replayStep >= totalReplaySteps) {
      setIsAutoPlaying(false);
      return;
    }

    const timer = window.setTimeout(() => {
      setReplayStep((previous) => Math.min(previous + 1, totalReplaySteps));
    }, STEP_DELAY_MS);

    return () => {
      window.clearTimeout(timer);
    };
  }, [isAutoPlaying, isReplayMode, replayStep, totalReplaySteps]);

  useEffect(() => {
    if (isReplayMode || !completionState || completionState === lastPersistedResult.current) {
      return;
    }

    const persistResult = async () => {
      const response = await fetch(`/api/games/${gameId}/result`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ result: completionState }),
      });

      if (!response.ok) {
        throw new Error('Unable to save result');
      }

      lastPersistedResult.current = completionState;
      setSaveError(null);
    };

    void persistResult().catch(() => {
      setSaveError('Could not save game result.');
    });
  }, [completionState, gameId, isReplayMode]);

  const updateCell = (row: number, col: number, input: string) => {
    if (isReplayMode || isAutoSolving || !editableCells[row][col]) {
      return;
    }

    const nextChar = input.slice(-1);
    if (nextChar !== '' && !/^[1-9]$/.test(nextChar)) {
      return;
    }

    const nextValue = nextChar === '' ? null : Number(nextChar);

    setBoard((previous) => {
      const nextBoard = previous.map((currentRow) => [...currentRow]);
      nextBoard[row][col] = nextValue;
      return nextBoard;
    });

    void fetch(`/api/games/${gameId}/moves`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ row, col, value: nextValue }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Unable to save move');
        }

        setSaveError(null);
      })
      .catch(() => {
        setSaveError('Could not save your latest move.');
      });
  };

  const autoSolve = async () => {
    if (isReplayMode || isAutoSolving) {
      return;
    }

    const solvePlan = createSolvePlan(board);
    if (!solvePlan) {
      setSaveError('This puzzle cannot be solved from the current board.');
      return;
    }

    const steps = solvePlan.map((step) => ({
      row: step.row,
      col: step.col,
      value: step.value,
    }));

    if (steps.length === 0) {
      return;
    }

    setSaveError(null);
    setIsAutoSolving(true);

    try {
      for (let stepIndex = 0; stepIndex < steps.length; stepIndex++) {
        const step = steps[stepIndex];

        setBoard((previous) => {
          const nextBoard = previous.map((currentRow) => [...currentRow]);
          nextBoard[step.row][step.col] = step.value;
          return nextBoard;
        });

        const response = await fetch(`/api/games/${gameId}/moves`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(step),
        });

        if (!response.ok) {
          throw new Error('Unable to save auto-solve move');
        }

        if (stepIndex < steps.length - 1) {
          await new Promise<void>((resolve) => {
            window.setTimeout(resolve, STEP_DELAY_MS);
          });
        }
      }
    } catch {
      setSaveError('Auto-solve failed while saving steps.');
    } finally {
      setIsAutoSolving(false);
    }
  };

  const goToPreviousStep = () => {
    setIsAutoPlaying(false);
    setReplayStep((previous) => Math.max(previous - 1, 0));
  };

  const goToNextStep = () => {
    setIsAutoPlaying(false);
    setReplayStep((previous) => Math.min(previous + 1, totalReplaySteps));
  };

  const toggleAutoPlay = () => {
    if (isAutoPlaying) {
      setIsAutoPlaying(false);
      return;
    }

    if (replayStep >= totalReplaySteps) {
      setReplayStep(0);
    }

    setIsAutoPlaying(true);
  };

  return (
    <section className="w-full max-w-[420px]">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h1 className="text-xl font-semibold">Sudoku</h1>
        <p className="text-xs text-slate-500">Game ID: {gameId}</p>
      </div>

      {!isReplayMode && (
        <div className="mb-4 rounded-md border border-slate-300 bg-slate-50 p-3">
          <p className="text-sm text-slate-700">
            Use auto-solve to run the JS solver and save each step for replay.
          </p>
          <button
            type="button"
            onClick={() => {
              void autoSolve();
            }}
            disabled={isAutoSolving || completionState === 'solved'}
            className="mt-2 rounded border border-sky-600 bg-sky-600 px-3 py-1.5 text-sm font-medium text-white disabled:cursor-not-allowed disabled:border-slate-300 disabled:bg-slate-300"
          >
            {isAutoSolving ? 'Auto-solving (2s/step)...' : 'Auto Solve'}
          </button>
        </div>
      )}

      {isReplayMode && (
        <div className="mb-4 rounded-md border border-slate-300 bg-slate-50 p-3">
          <p className="text-sm font-semibold text-slate-800">Replay mode</p>
          <p className="mt-1 text-sm text-slate-700">
            Step {replayStep} of {totalReplaySteps}
          </p>
          <p className="mt-1 text-sm text-slate-700">
            Final result:{' '}
            {initialResult === 'solved'
              ? 'Solved correctly'
              : initialResult === 'errors'
                ? 'Completed with errors'
                : 'Unknown'}
          </p>
          <div className="mt-3 flex items-center gap-2">
            <button
              type="button"
              onClick={goToPreviousStep}
              disabled={replayStep === 0}
              className="rounded border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={toggleAutoPlay}
              disabled={totalReplaySteps === 0}
              className="rounded border border-sky-600 bg-sky-600 px-3 py-1.5 text-sm font-medium text-white disabled:cursor-not-allowed disabled:border-slate-300 disabled:bg-slate-300"
            >
              {isAutoPlaying ? 'Pause' : 'Auto-play'}
            </button>
            <button
              type="button"
              onClick={goToNextStep}
              disabled={replayStep === totalReplaySteps}
              className="rounded border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-9">
        {renderedBoard.map((row, rowIndex) =>
          row.map((value, colIndex) => {
            const isEditable = editableCells[rowIndex][colIndex];
            const isInvalid = invalidCells[rowIndex][colIndex];

            return (
              <input
                key={`${rowIndex}-${colIndex}`}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={value ?? ''}
                disabled={isReplayMode || isAutoSolving || !isEditable}
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
        {!isReplayMode && !isBoardFull && (
          'Fill the blank cells. Invalid entries are highlighted in red.'
        )}
        {!isReplayMode && completionState === 'solved' && (
          <span className="font-medium text-green-700">Solved correctly.</span>
        )}
        {!isReplayMode && completionState === 'errors' && (
          <span className="font-medium text-red-700">
            Board is full, but the solution has errors.
          </span>
        )}
        {!isReplayMode && isAutoSolving && (
          <span>Auto-solving in progress. One move is applied every 2 seconds.</span>
        )}
        {isReplayMode && replayStep < totalReplaySteps && (
          <span>Use previous/next or auto-play to step through the saved moves.</span>
        )}
        {isReplayMode && replayStep === totalReplaySteps && completionState === 'solved' && (
          <span className="font-medium text-green-700">Replay complete: solved correctly.</span>
        )}
        {isReplayMode && replayStep === totalReplaySteps && completionState === 'errors' && (
          <span className="font-medium text-red-700">Replay complete: completed with errors.</span>
        )}
      </p>

      {saveError && (
        <p className="mt-2 text-sm font-medium text-red-700">{saveError}</p>
      )}
    </section>
  );
};

export default SudokuBoard;
