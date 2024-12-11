import type { Position, Piece, PieceType } from "./types";

export function isValidMove(
  board: (Piece | null)[][],
  from: Position,
  to: Position,
  piece: Piece
): boolean {
  const boardSize = board.length;
  // Check if destination is within bounds
  if (to.row < 0 || to.row >= boardSize || to.col < 0 || to.col >= boardSize) {
    return false;
  }

  // Check if destination has a piece of the same color
  const destPiece = board[to.row][to.col];
  if (destPiece && destPiece.color === piece.color) {
    return false;
  }

  const rowDiff = Math.abs(to.row - from.row);
  const colDiff = Math.abs(to.col - from.col);

  switch (piece.type) {
    case "pawn":
      // Pawns can only move forward (different for white and black)
      const direction = piece.color === "white" ? -1 : 1;
      const forwardRow = from.row + direction;
      if (forwardRow < 0 || forwardRow >= boardSize) {
        return false;
      }
      const validForward =
        to.row === forwardRow && to.col === from.col && !board[to.row][to.col];
      const validCapture =
        to.row === from.row + direction &&
        Math.abs(to.col - from.col) === 1 &&
        board[to.row][to.col] !== null;
      return validForward || validCapture;

    case "rook":
      // Rooks move horizontally or vertically
      if (from.row !== to.row && from.col !== to.col) return false;
      return !hasObstaclesInPath(board, from, to);

    case "bishop":
      // Bishops move diagonally
      if (rowDiff !== colDiff) return false;
      return !hasObstaclesInPath(board, from, to);

    case "knight":
      // Knights move in L-shape
      return (
        (rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2)
      );

    case "queen":
      // Queens combine rook and bishop movements
      if (from.row !== to.row && from.col !== to.col && rowDiff !== colDiff)
        return false;
      return !hasObstaclesInPath(board, from, to);

    default:
      return false;
  }
}

function hasObstaclesInPath(
  board: (Piece | null)[][],
  from: Position,
  to: Position
): boolean {
  const rowStep = Math.sign(to.row - from.row) || 0;
  const colStep = Math.sign(to.col - from.col) || 0;

  let currentRow = from.row + rowStep;
  let currentCol = from.col + colStep;

  while (currentRow !== to.row || currentCol !== to.col) {
    if (board[currentRow][currentCol]) return true;
    currentRow += rowStep;
    currentCol += colStep;
  }

  return false;
}

export function getValidMoves(
  board: (Piece | null)[][],
  position: Position,
  piece: Piece
): Position[] {
  const validMoves: Position[] = [];
  const boardSize = board.length;

  // Check all possible positions on the board
  for (let row = 0; row < boardSize; row++) {
    for (let col = 0; col < boardSize; col++) {
      const targetPos: Position = { row, col };
      if (isValidMove(board, position, targetPos, piece)) {
        validMoves.push(targetPos);
      }
    }
  }

  return validMoves;
}

export function checkWinner(
  board: (Piece | null)[][]
): "white" | "black" | null {
  const boardSize = board.length;
  const winLength = 3; // Keep win condition at 3 in a row

  // Check rows
  for (let row = 0; row < boardSize; row++) {
    for (let col = 0; col <= boardSize - winLength; col++) {
      const color = board[row][col]?.color;
      if (color) {
        let win = true;
        for (let i = 1; i < winLength; i++) {
          if (board[row][col + i]?.color !== color) {
            win = false;
            break;
          }
        }
        if (win) return color;
      }
    }
  }

  // Check columns
  for (let col = 0; col < boardSize; col++) {
    for (let row = 0; row <= boardSize - winLength; row++) {
      const color = board[row][col]?.color;
      if (color) {
        let win = true;
        for (let i = 1; i < winLength; i++) {
          if (board[row + i][col]?.color !== color) {
            win = false;
            break;
          }
        }
        if (win) return color;
      }
    }
  }

  // Check diagonals (top-left to bottom-right)
  for (let row = 0; row <= boardSize - winLength; row++) {
    for (let col = 0; col <= boardSize - winLength; col++) {
      const color = board[row][col]?.color;
      if (color) {
        let win = true;
        for (let i = 1; i < winLength; i++) {
          if (board[row + i][col + i]?.color !== color) {
            win = false;
            break;
          }
        }
        if (win) return color;
      }
    }
  }

  // Check diagonals (top-right to bottom-left)
  for (let row = 0; row <= boardSize - winLength; row++) {
    for (let col = winLength - 1; col < boardSize; col++) {
      const color = board[row][col]?.color;
      if (color) {
        let win = true;
        for (let i = 1; i < winLength; i++) {
          if (board[row + i][col - i]?.color !== color) {
            win = false;
            break;
          }
        }
        if (win) return color;
      }
    }
  }

  return null;
}
