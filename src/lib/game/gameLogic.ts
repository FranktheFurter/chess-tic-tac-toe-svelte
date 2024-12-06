import type { Position, Piece, PieceType } from "./types";

export function isValidMove(
  board: (Piece | null)[][],
  from: Position,
  to: Position,
  piece: Piece
): boolean {
  // Check if destination is within bounds
  if (to.row < 0 || to.row > 2 || to.col < 0 || to.col > 2) {
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
      if (forwardRow < 0 || forwardRow > 2) {
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

  // Check all possible positions on the 3x3 board
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
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
  // Check rows
  for (let row = 0; row < 3; row++) {
    if (
      board[row][0] &&
      board[row][1] &&
      board[row][2] &&
      board[row][0]!.color === board[row][1]!.color &&
      board[row][1]!.color === board[row][2]!.color
    ) {
      return board[row][0]!.color;
    }
  }

  // Check columns
  for (let col = 0; col < 3; col++) {
    if (
      board[0][col] &&
      board[1][col] &&
      board[2][col] &&
      board[0][col]!.color === board[1][col]!.color &&
      board[1][col]!.color === board[2][col]!.color
    ) {
      return board[0][col]!.color;
    }
  }

  // Check diagonals
  if (
    board[0][0] &&
    board[1][1] &&
    board[2][2] &&
    board[0][0]!.color === board[1][1]!.color &&
    board[1][1]!.color === board[2][2]!.color
  ) {
    return board[0][0]!.color;
  }

  if (
    board[0][2] &&
    board[1][1] &&
    board[2][0] &&
    board[0][2]!.color === board[1][1]!.color &&
    board[1][1]!.color === board[2][0]!.color
  ) {
    return board[0][2]!.color;
  }

  // Überprüfe, ob die Gewinnbedingungen korrekt funktionieren
  // (Der vorhandene Code scheint korrekt zu sein, aber stelle sicher, dass er in der Praxis funktioniert)

  return null;
}
