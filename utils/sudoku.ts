export type Board = (number | null)[][];

const GRID_SIZE = 9;
const BOX_SIZE = 3;

type FillableBoard = number[][];

const isIntegerInRange = (value: unknown, min: number, max: number): value is number => {
  return Number.isInteger(value) && (value as number) >= min && (value as number) <= max;
};

const isCellValue = (value: unknown): value is number | null => {
  return value === null || isIntegerInRange(value, 1, GRID_SIZE);
};

function isValid(board: Board, row: number, col: number, num: number): boolean {
  for (let i = 0; i < GRID_SIZE; i++) {
    const m = BOX_SIZE * Math.floor(row / BOX_SIZE) + Math.floor(i / BOX_SIZE);
    const n = BOX_SIZE * Math.floor(col / BOX_SIZE) + (i % BOX_SIZE);

    if (board[row][i] === num || board[i][col] === num || board[m][n] === num) {
      return false;
    }
  }

  return true;
}

function fillBoard(board: Board, row = 0, col = 0): boolean {
  if (row === GRID_SIZE) {
    return true;
  }

  if (col === GRID_SIZE) {
    return fillBoard(board, row + 1, 0);
  }

  if (board[row][col] !== 0) {
    return fillBoard(board, row, col + 1);
  }

  const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  shuffleArray(numbers);

  for (const num of numbers) {
    if (!isValid(board, row, col, num)) {
      continue;
    }

    board[row][col] = num;

    if (fillBoard(board, row, col + 1)) {
      return true;
    }

    board[row][col] = 0;
  }

  return false;
}

function shuffleArray(array: number[]): void {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function clearCellsForDifficulty(board: Board, difficulty: string): void {
  const empties = difficulty === 'easy' ? 20 : difficulty === 'normal' ? 40 : 60;
  let cleared = 0;

  while (cleared < empties) {
    const row = Math.floor(Math.random() * GRID_SIZE);
    const col = Math.floor(Math.random() * GRID_SIZE);

    if (board[row][col] === null) {
      continue;
    }

    board[row][col] = null;
    cleared += 1;
  }
}

const normalizeBoard = (board: Board): FillableBoard => {
  return board.map((row) =>
    row.map((value) => {
      return value === null ? 0 : value;
    })
  );
};

const denormalizeBoard = (board: FillableBoard): Board => {
  return board.map((row) => row.map((value) => (value === 0 ? null : value)));
};

const isValidPlacement = (board: FillableBoard, row: number, col: number, num: number): boolean => {
  for (let i = 0; i < GRID_SIZE; i++) {
    if (board[row][i] === num || board[i][col] === num) {
      return false;
    }
  }

  const startRow = Math.floor(row / BOX_SIZE) * BOX_SIZE;
  const startCol = Math.floor(col / BOX_SIZE) * BOX_SIZE;

  for (let r = startRow; r < startRow + BOX_SIZE; r++) {
    for (let c = startCol; c < startCol + BOX_SIZE; c++) {
      if (board[r][c] === num) {
        return false;
      }
    }
  }

  return true;
};

const solveNormalizedBoard = (board: FillableBoard): boolean => {
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      if (board[row][col] !== 0) {
        continue;
      }

      for (let candidate = 1; candidate <= GRID_SIZE; candidate++) {
        if (!isValidPlacement(board, row, col, candidate)) {
          continue;
        }

        board[row][col] = candidate;
        if (solveNormalizedBoard(board)) {
          return true;
        }
        board[row][col] = 0;
      }

      return false;
    }
  }

  return true;
};

export const isBoardShape = (value: unknown): value is Board => {
  if (!Array.isArray(value) || value.length !== GRID_SIZE) {
    return false;
  }

  return value.every((row) => {
    if (!Array.isArray(row) || row.length !== GRID_SIZE) {
      return false;
    }

    return row.every((cell) => isCellValue(cell));
  });
};

export const hasBoardConflicts = (board: Board): boolean => {
  const normalized = normalizeBoard(board);

  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      const value = normalized[row][col];
      if (value === 0) {
        continue;
      }

      normalized[row][col] = 0;
      const isAllowed = isValidPlacement(normalized, row, col, value);
      normalized[row][col] = value;

      if (!isAllowed) {
        return true;
      }
    }
  }

  return false;
};

export const solveBoard = (board: Board): Board | null => {
  if (hasBoardConflicts(board)) {
    return null;
  }

  const normalized = normalizeBoard(board);
  const solved = solveNormalizedBoard(normalized);

  if (!solved) {
    return null;
  }

  return denormalizeBoard(normalized);
};

export function createPuzzleAndSolution(difficulty: string): {
  puzzle: Board;
  solution: Board;
} {
  const solution: Board = Array.from({ length: GRID_SIZE }, () =>
    Array(GRID_SIZE).fill(0)
  );

  fillBoard(solution);

  const puzzle = solution.map((row) => [...row]);
  clearCellsForDifficulty(puzzle, difficulty);

  return { puzzle, solution };
}

export function createSudoku(
  board: Board,
  difficulty: string,
  row = 0,
  col = 0
): boolean {
  if (row === GRID_SIZE) {
    clearCellsForDifficulty(board, difficulty);
    return true;
  }

  if (col === GRID_SIZE) {
    return createSudoku(board, difficulty, row + 1, 0);
  }

  if (board[row][col] !== 0) {
    return createSudoku(board, difficulty, row, col + 1);
  }

  const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  shuffleArray(numbers);

  for (const num of numbers) {
    if (!isValid(board, row, col, num)) {
      continue;
    }

    board[row][col] = num;

    if (createSudoku(board, difficulty, row, col + 1)) {
      return true;
    }

    board[row][col] = 0;
  }

  return false;
}
