export type Board = (number | null)[][];

const GRID_SIZE = 9;
const BOX_SIZE = 3;

type FillableBoard = number[][];
type CandidateMap = Array<number[]>;

export type SolvePlanReason =
  | 'naked_single'
  | 'hidden_single_row'
  | 'hidden_single_col'
  | 'hidden_single_box'
  | 'guided_choice';

export type SolvePlanStep = {
  row: number;
  col: number;
  value: number;
  reason: SolvePlanReason;
};

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

const getGroupsForCell = (
  board: FillableBoard,
  row: number,
  col: number
): [number[], number[], number[]] => {
  const rowGroup = [...board[row]];
  const colGroup = board.map((currentRow) => currentRow[col]);
  const boxGroup: number[] = [];

  const startRow = Math.floor(row / BOX_SIZE) * BOX_SIZE;
  const startCol = Math.floor(col / BOX_SIZE) * BOX_SIZE;

  for (let r = startRow; r < startRow + BOX_SIZE; r++) {
    for (let c = startCol; c < startCol + BOX_SIZE; c++) {
      boxGroup.push(board[r][c]);
    }
  }

  return [rowGroup, colGroup, boxGroup];
};

const isValidPlacement = (board: FillableBoard, row: number, col: number, num: number): boolean => {
  const [rowGroup, colGroup, boxGroup] = getGroupsForCell(board, row, col);

  return !rowGroup.includes(num) && !colGroup.includes(num) && !boxGroup.includes(num);
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

const cloneNormalizedBoard = (board: FillableBoard): FillableBoard => {
  return board.map((row) => [...row]);
};

const hasEmptyCell = (board: FillableBoard): boolean => {
  return board.some((row) => row.some((value) => value === 0));
};

const getCandidates = (board: FillableBoard, row: number, col: number): number[] => {
  if (board[row][col] !== 0) {
    return [];
  }

  const candidates: number[] = [];

  for (let candidate = 1; candidate <= GRID_SIZE; candidate++) {
    if (isValidPlacement(board, row, col, candidate)) {
      candidates.push(candidate);
    }
  }

  return candidates;
};

const getDeterministicCellStep = (
  board: FillableBoard,
  row: number,
  col: number
): SolvePlanStep | null => {
  if (board[row][col] !== 0) {
    return null;
  }

  const candidates = getCandidates(board, row, col);
  if (candidates.length !== 1) {
    return null;
  }

  return {
    row,
    col,
    value: candidates[0],
    reason: 'naked_single',
  };
};

const getNextDeterministicCellStep = (
  board: FillableBoard,
  startIndex = 0
): SolvePlanStep | null => {
  for (let index = startIndex; index < GRID_SIZE * GRID_SIZE; index++) {
    const row = Math.floor(index / GRID_SIZE);
    const col = index % GRID_SIZE;
    const step = getDeterministicCellStep(board, row, col);

    if (step) {
      return step;
    }
  }

  return null;
};

const applyDeterministicCellSweep = (
  board: FillableBoard,
  steps: SolvePlanStep[]
): boolean => {
  let madeProgress = false;
  let nextIndex = 0;

  while (nextIndex < GRID_SIZE * GRID_SIZE) {
    const step = getNextDeterministicCellStep(board, nextIndex);
    if (!step) {
      break;
    }

    board[step.row][step.col] = step.value;
    steps.push(step);
    madeProgress = true;
    nextIndex = step.row * GRID_SIZE + step.col + 1;
  }

  return madeProgress;
};

const findHiddenSingleInRow = (board: FillableBoard): SolvePlanStep | null => {
  for (let row = 0; row < GRID_SIZE; row++) {
    const positionByCandidate: CandidateMap = Array.from(
      { length: GRID_SIZE + 1 },
      () => []
    );

    for (let col = 0; col < GRID_SIZE; col++) {
      const candidates = getCandidates(board, row, col);
      for (const candidate of candidates) {
        positionByCandidate[candidate].push(col);
      }
    }

    for (let candidate = 1; candidate <= GRID_SIZE; candidate++) {
      if (positionByCandidate[candidate].length !== 1) {
        continue;
      }

      return {
        row,
        col: positionByCandidate[candidate][0],
        value: candidate,
        reason: 'hidden_single_row',
      };
    }
  }

  return null;
};

const findHiddenSingleInCol = (board: FillableBoard): SolvePlanStep | null => {
  for (let col = 0; col < GRID_SIZE; col++) {
    const positionByCandidate: CandidateMap = Array.from(
      { length: GRID_SIZE + 1 },
      () => []
    );

    for (let row = 0; row < GRID_SIZE; row++) {
      const candidates = getCandidates(board, row, col);
      for (const candidate of candidates) {
        positionByCandidate[candidate].push(row);
      }
    }

    for (let candidate = 1; candidate <= GRID_SIZE; candidate++) {
      if (positionByCandidate[candidate].length !== 1) {
        continue;
      }

      return {
        row: positionByCandidate[candidate][0],
        col,
        value: candidate,
        reason: 'hidden_single_col',
      };
    }
  }

  return null;
};

const findHiddenSingleInBox = (board: FillableBoard): SolvePlanStep | null => {
  for (let boxRow = 0; boxRow < BOX_SIZE; boxRow++) {
    for (let boxCol = 0; boxCol < BOX_SIZE; boxCol++) {
      const startRow = boxRow * BOX_SIZE;
      const startCol = boxCol * BOX_SIZE;
      const positionByCandidate: CandidateMap = Array.from(
        { length: GRID_SIZE + 1 },
        () => []
      );

      for (let row = startRow; row < startRow + BOX_SIZE; row++) {
        for (let col = startCol; col < startCol + BOX_SIZE; col++) {
          const candidates = getCandidates(board, row, col);
          for (const candidate of candidates) {
            positionByCandidate[candidate].push(row * GRID_SIZE + col);
          }
        }
      }

      for (let candidate = 1; candidate <= GRID_SIZE; candidate++) {
        if (positionByCandidate[candidate].length !== 1) {
          continue;
        }

        const encoded = positionByCandidate[candidate][0];

        return {
          row: Math.floor(encoded / GRID_SIZE),
          col: encoded % GRID_SIZE,
          value: candidate,
          reason: 'hidden_single_box',
        };
      }
    }
  }

  return null;
};

const findHiddenSingleStep = (board: FillableBoard): SolvePlanStep | null => {
  return (
    findHiddenSingleInRow(board) ??
    findHiddenSingleInCol(board) ??
    findHiddenSingleInBox(board)
  );
};

const applyHumanSteps = (board: FillableBoard, steps: SolvePlanStep[]): void => {
  while (true) {
    const madeProgress = applyDeterministicCellSweep(board, steps);
    if (madeProgress) {
      continue;
    }

    const hiddenSingleStep = findHiddenSingleStep(board);
    if (!hiddenSingleStep) {
      return;
    }

    board[hiddenSingleStep.row][hiddenSingleStep.col] = hiddenSingleStep.value;
    steps.push(hiddenSingleStep);
  }
};

const findGuidedStep = (
  board: FillableBoard,
  solvedBoard: FillableBoard
): SolvePlanStep | null => {
  let bestStep: SolvePlanStep | null = null;
  let smallestCandidateSize = GRID_SIZE + 1;

  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      if (board[row][col] !== 0) {
        continue;
      }

      const candidates = getCandidates(board, row, col);
      if (candidates.length === 0) {
        return null;
      }

      const targetValue = solvedBoard[row][col];
      if (!candidates.includes(targetValue)) {
        return null;
      }

      if (candidates.length < smallestCandidateSize) {
        smallestCandidateSize = candidates.length;
        bestStep = {
          row,
          col,
          value: targetValue,
          reason: 'guided_choice',
        };
      }
    }
  }

  return bestStep;
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

export const createSolvePlan = (board: Board): SolvePlanStep[] | null => {
  if (hasBoardConflicts(board)) {
    return null;
  }

  const workingBoard = normalizeBoard(board);
  const steps: SolvePlanStep[] = [];

  applyHumanSteps(workingBoard, steps);

  if (!hasEmptyCell(workingBoard)) {
    return steps;
  }

  const solvedBoard = cloneNormalizedBoard(workingBoard);
  if (!solveNormalizedBoard(solvedBoard)) {
    return null;
  }

  while (hasEmptyCell(workingBoard)) {
    const guidedStep = findGuidedStep(workingBoard, solvedBoard);
    if (!guidedStep) {
      return null;
    }

    workingBoard[guidedStep.row][guidedStep.col] = guidedStep.value;
    steps.push(guidedStep);
    applyHumanSteps(workingBoard, steps);
  }

  return steps;
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
