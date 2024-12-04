<script lang="ts">
    import { onMount } from 'svelte';
    import ChessPiece from '$lib/components/ChessPiece.svelte';
    import { gameStore } from '$lib/game/gameStore';
    import { isValidMove, checkWinner, getValidMoves } from '$lib/game/gameLogic';
    import type { Position, Piece, PieceType } from '$lib/game/types';

    $: gameState = $gameStore;
    
    $: availablePieces = $gameStore.availablePieces;
    $: currentPlayer = $gameStore.currentPlayer;
    $: board = $gameStore.board;
    $: isPlacementMode = $gameStore.isPlacementMode;
    $: selectedPiece = $gameStore.selectedPiece;
    $: winner = $gameStore.winner;

    // Calculate valid moves when a piece is selected in move mode
    $: validMoves = !isPlacementMode && selectedPiece 
        ? getValidMoves(board, selectedPiece.position, selectedPiece.piece)
        : [];

    function handleCellClick(row: number, col: number) {
        if (winner) return;
        const position: Position = { row, col };
        
        if (isPlacementMode) {
            handlePlacement(position);
        } else {
            handleMovement(position);
        }
    }

    function handlePlacement(position: Position) {
        if (board[position.row][position.col]) return;
        if (selectedPiece) {
            gameStore.placePiece(selectedPiece.piece, position);
            setTimeout(() => {
                const newWinner = checkWinner($gameStore.board);
                if (newWinner) gameStore.setWinner(newWinner);
            }, 0);
        }
    }

    function handleMovement(position: Position) {
        if (!selectedPiece) {
            const piece = board[position.row][position.col];
            if (piece && piece.color === currentPlayer) {
                gameStore.selectPiece(piece, position);
            }
        } else {
            const isValidTarget = validMoves.some(
                move => move.row === position.row && move.col === position.col
            );
            
            if (isValidTarget) {
                gameStore.movePiece(selectedPiece.position, position);
                setTimeout(() => {
                    const newWinner = checkWinner($gameStore.board);
                    if (newWinner) gameStore.setWinner(newWinner);
                }, 0);
            } else {
                // If clicking on another own piece, select it instead
                const piece = board[position.row][position.col];
                if (piece && piece.color === currentPlayer) {
                    gameStore.selectPiece(piece, position);
                } else {
                    gameStore.clearSelection();
                }
            }
        }
    }

    function selectPieceFromInventory(type: PieceType) {
        if (!isPlacementMode) return;
        if (availablePieces[currentPlayer][type] <= 0) return;
        const piece: Piece = { type, color: currentPlayer };
        gameStore.selectPiece(piece, { row: -1, col: -1 });
    }

    function resetGame() {
        gameStore.reset();
    }
</script>

<main>
    <h1>Chess Tic-Tac-Toe</h1>
    
    {#if winner}
        <div class="winner-banner">
            {winner.charAt(0).toUpperCase() + winner.slice(1)} wins!
            <button on:click={resetGame}>Play Again</button>
        </div>
    {:else}
        <div class="game-info">
            <div class="current-player">
                Current Player: <span class={currentPlayer}>{currentPlayer}</span>
            </div>
            <label class="mode-toggle">
                <input 
                    type="checkbox" 
                    bind:checked={$gameStore.isPlacementMode}
                    on:change={() => gameStore.clearSelection()}
                >
                {isPlacementMode ? 'Place Mode' : 'Move Mode'}
            </label>
        </div>

        {#if isPlacementMode}
            <div class="piece-inventory">
                <div class="inventory-player">
                    {#each Object.entries(availablePieces[currentPlayer]) as [type, count]}
                        {#if count > 0}
                            <button 
                                class="piece-button" 
                                class:selected={selectedPiece?.piece.type === type}
                                on:click={() => selectPieceFromInventory(type as PieceType)}
                            >
                                <ChessPiece piece={{ type: type as PieceType, color: currentPlayer }} />
                                <span class="piece-count">×{count}</span>
                            </button>
                        {/if}
                    {/each}
                </div>
            </div>
        {/if}
    {/if}

    <div class="board">
        {#each board as row, i}
            {#each row as cell, j}
                {@const isValidMove = validMoves.some(move => move.row === i && move.col === j)}
                <div 
                    class="cell"
                    class:dark={(i + j) % 2 === 1}
                    class:selected={selectedPiece?.position.row === i && selectedPiece?.position.col === j}
                    class:valid-move={isValidMove}
                    on:click={() => handleCellClick(i, j)}
                >
                    {#if cell}
                        <ChessPiece piece={cell} />
                    {/if}
                    {#if isValidMove}
                        <div class="move-indicator" />
                    {/if}
                </div>
            {/each}
        {/each}
    </div>
</main>

<style>
    main {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 2rem;
        min-height: 100vh;
        background-color: #f0f0f0;
    }

    h1 {
        color: #333;
        margin-bottom: 2rem;
    }

    .game-info {
        display: flex;
        gap: 2rem;
        margin-bottom: 2rem;
        align-items: center;
    }

    .current-player {
        font-size: 1.2rem;
    }

    .current-player .white {
        color: #333;
        font-weight: bold;
    }

    .current-player .black {
        color: #000;
        font-weight: bold;
    }

    .mode-toggle {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        cursor: pointer;
    }

    .board {
        display: grid;
        grid-template-columns: repeat(3, 100px);
        gap: 2px;
        background-color: #666;
        padding: 2px;
        border-radius: 4px;
    }

    .cell {
        width: 100px;
        height: 100px;
        background-color: #fff;
        display: flex;
        justify-content: center;
        align-items: center;
        cursor: pointer;
        transition: background-color 0.2s;
    }

    .cell.dark {
        background-color: #ccc;
    }

    .cell:hover {
        background-color: #e0e0e0;
    }

    .cell.dark:hover {
        background-color: #bbb;
    }

    .cell.selected {
        background-color: #a8d5ff !important;
    }

    .piece-inventory {
        margin-bottom: 2rem;
        padding: 1rem;
        background-color: #fff;
        border-radius: 4px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .inventory-player {
        display: flex;
        gap: 1rem;
        flex-wrap: wrap;
    }

    .piece-button {
        position: relative;
        width: 60px;
        height: 60px;
        padding: 0;
        border: 2px solid #ccc;
        border-radius: 4px;
        background-color: #fff;
        cursor: pointer;
        transition: all 0.2s;
    }

    .piece-button:hover {
        border-color: #999;
    }

    .piece-button.selected {
        border-color: #4CAF50;
        background-color: #e8f5e9;
    }

    .piece-count {
        position: absolute;
        bottom: 2px;
        right: 2px;
        font-size: 0.8rem;
        color: #666;
    }

    .winner-banner {
        background-color: #4CAF50;
        color: white;
        padding: 1rem 2rem;
        border-radius: 4px;
        margin-bottom: 2rem;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1rem;
    }

    .winner-banner button {
        background-color: white;
        color: #4CAF50;
        border: none;
        padding: 0.5rem 1rem;
        border-radius: 4px;
        cursor: pointer;
        font-weight: bold;
        transition: background-color 0.2s;
    }

    .winner-banner button:hover {
        background-color: #f0f0f0;
    }

    .valid-move {
        position: relative;
    }

    .move-indicator {
        position: absolute;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background-color: rgba(76, 175, 80, 0.3);
        border: 2px solid rgba(76, 175, 80, 0.5);
        pointer-events: none;
    }

    .cell.valid-move:hover {
        background-color: rgba(76, 175, 80, 0.2);
    }

    .cell.dark.valid-move:hover {
        background-color: rgba(76, 175, 80, 0.3);
    }
</style>
