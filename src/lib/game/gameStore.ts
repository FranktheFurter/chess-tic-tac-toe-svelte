import { writable } from "svelte/store";
import type {
  GameState,
  PlayerColor,
  PieceType,
  Position,
  Piece,
} from "./types";
import { INITIAL_PIECES } from "./types";

const createInitialState = (size: number = 3): GameState => ({
  board: Array(size)
    .fill(null)
    .map(() => Array(size).fill(null)),
  currentPlayer: "white",
  selectedPiece: null,
  availablePieces: {
    white: { ...INITIAL_PIECES },
    black: { ...INITIAL_PIECES },
  },
  winner: null,
  boardSize: size,
});

function createGameStore() {
  const { subscribe, set, update } = writable<GameState>(createInitialState());

  return {
    subscribe,
    reset: (size: number = 3) => set(createInitialState(size)),
    selectPiece: (piece: Piece, position: Position) =>
      update((state) => ({
        ...state,
        selectedPiece: { piece, position },
      })),
    clearSelection: () =>
      update((state) => ({
        ...state,
        selectedPiece: null,
      })),
    placePiece: (piece: Piece, position: Position) =>
      update((state) => {
        const newBoard = state.board.map((row) => [...row]);
        newBoard[position.row][position.col] = piece;

        const newAvailablePieces = {
          ...state.availablePieces,
          [piece.color]: {
            ...state.availablePieces[piece.color],
            [piece.type]: state.availablePieces[piece.color][piece.type] - 1,
          },
        };

        return {
          ...state,
          board: newBoard,
          currentPlayer: state.currentPlayer === "white" ? "black" : "white",
          availablePieces: newAvailablePieces,
          selectedPiece: null,
        };
      }),
    movePiece: (from: Position, to: Position) =>
      update((state) => {
        // Verhindere Bewegung im ersten Zug, wenn das Brett leer ist
        if (state.board.flat().every((cell) => cell === null)) {
          return state;
        }
        const newBoard = state.board.map((row) => [...row]);
        const piece = newBoard[from.row][from.col];
        newBoard[from.row][from.col] = null;
        newBoard[to.row][to.col] = piece;

        return {
          ...state,
          board: newBoard,
          currentPlayer: state.currentPlayer === "white" ? "black" : "white",
          selectedPiece: null,
        };
      }),
    setWinner: (winner: PlayerColor) =>
      update((state) => ({
        ...state,
        winner,
      })),
  };
}

export const gameStore = createGameStore();
