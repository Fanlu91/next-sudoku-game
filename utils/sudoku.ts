export type Board = (number | null)[][];

const GRID_SIZE = 9;

function isValid(board: Board, row: number, col: number, num: number): boolean {
  for (let i = 0; i < GRID_SIZE; i++) {
    const m = 3 * Math.floor(row / 3) + Math.floor(i / 3);
    const n = 3 * Math.floor(col / 3) + (i % 3);

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
