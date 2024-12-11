export type PieceType = "rook" | "bishop" | "knight" | "pawn" | "queen";
export type PlayerColor = "white" | "black";

export interface Piece {
  type: PieceType;
  color: PlayerColor;
}

export interface Position {
  row: number;
  col: number;
}

export interface Move {
  from?: Position; // undefined for placement moves
  to: Position;
  piece: Piece;
}

export interface GameState {
  board: (Piece | null)[][];
  currentPlayer: PlayerColor;
  selectedPiece: {
    piece: Piece;
    position: Position;
  } | null;
  availablePieces: {
    white: { [key in PieceType]: number };
    black: { [key in PieceType]: number };
  };
  winner: PlayerColor | null;
  boardSize: number;
}

export const INITIAL_PIECES: Record<PieceType, number> = {
  rook: 2,
  bishop: 2,
  knight: 2,
  pawn: 8,
  queen: 1,
};
