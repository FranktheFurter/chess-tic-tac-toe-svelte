<!-- ChessPiece.svelte -->
<script lang="ts">
    import type { Piece } from '../game/types';

    export let piece: Piece;
    
    const pieceSymbols = {
        white: {
            pawn: '♙',
            rook: '♖',
            knight: '♘',
            bishop: '♗',
            queen: '♕'
        },
        black: {
            pawn: '♟',
            rook: '♜',
            knight: '♞',
            bishop: '♝',
            queen: '♛'
        }
    };
</script>

<div class="piece {piece.color}">
    {pieceSymbols[piece.color][piece.type]}
</div>

<style>
    .piece {
        font-size: 2.5em;
        display: flex;
        justify-content: center;
        align-items: center;
        width: 100%;
        height: 100%;
        cursor: pointer;
        user-select: none;
    }

    .white {
        color: #fff;
        text-shadow: 0 0 2px #000;
    }

    .black {
        color: #000;
        text-shadow: 0 0 2px #fff;
    }
</style>
