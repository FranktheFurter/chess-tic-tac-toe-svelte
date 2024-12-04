import { writable } from 'svelte/store';
import type { GameState, PlayerColor, PieceType, Position, Piece } from './types';
import { INITIAL_PIECES } from './types';

const createInitialState = (): GameState => ({
    board: Array(3).fill(null).map(() => Array(3).fill(null)),
    currentPlayer: 'white',
    selectedPiece: null,
    isPlacementMode: true,
    availablePieces: {
        white: { ...INITIAL_PIECES },
        black: { ...INITIAL_PIECES }
    },
    winner: null
});

function createGameStore() {
    const { subscribe, set, update } = writable<GameState>(createInitialState());

    return {
        subscribe,
        reset: () => set(createInitialState()),
        selectPiece: (piece: Piece, position: Position) => update(state => ({
            ...state,
            selectedPiece: { piece, position }
        })),
        clearSelection: () => update(state => ({
            ...state,
            selectedPiece: null
        })),
        toggleMode: () => update(state => ({
            ...state,
            isPlacementMode: !state.isPlacementMode
        })),
        placePiece: (piece: Piece, position: Position) => update(state => {
            const newBoard = state.board.map(row => [...row]);
            newBoard[position.row][position.col] = piece;
            
            const newAvailablePieces = {
                ...state.availablePieces,
                [piece.color]: {
                    ...state.availablePieces[piece.color],
                    [piece.type]: state.availablePieces[piece.color][piece.type] - 1
                }
            };

            return {
                ...state,
                board: newBoard,
                currentPlayer: state.currentPlayer === 'white' ? 'black' : 'white',
                availablePieces: newAvailablePieces,
                selectedPiece: null
            };
        }),
        movePiece: (from: Position, to: Position) => update(state => {
            const newBoard = state.board.map(row => [...row]);
            const piece = newBoard[from.row][from.col];
            newBoard[from.row][from.col] = null;
            newBoard[to.row][to.col] = piece;

            return {
                ...state,
                board: newBoard,
                currentPlayer: state.currentPlayer === 'white' ? 'black' : 'white',
                selectedPiece: null
            };
        }),
        setWinner: (winner: PlayerColor) => update(state => ({
            ...state,
            winner
        }))
    };
}

export const gameStore = createGameStore();
