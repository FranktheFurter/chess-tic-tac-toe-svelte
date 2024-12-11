<script lang="ts">
  import { onMount } from "svelte";
  import { page } from "$app/stores";
  import ChessPiece from "$lib/components/ChessPiece.svelte";
  import { gameStore } from "$lib/game/gameStore";
  import { isValidMove, checkWinner, getValidMoves } from "$lib/game/gameLogic";
  import type { Position, Piece, PieceType } from "$lib/game/types";

  $: gameState = $gameStore;

  $: availablePieces = $gameStore.availablePieces;
  $: currentPlayer = $gameStore.currentPlayer;
  $: board = $gameStore.board;
  $: selectedPiece = $gameStore.selectedPiece;
  $: winner = $gameStore.winner;

  let errorMessage = "";

  // Berechne validMoves basierend auf der ausgewählten Figur
  $: validMoves =
    selectedPiece && selectedPiece.position.row >= 0
      ? getValidMoves(board, selectedPiece.position, selectedPiece.piece)
      : [];

  $: hasAvailablePieces = Object.values(availablePieces[currentPlayer]).some(
    (count) => count > 0
  );

  onMount(() => {
    const size = Number($page.url.searchParams.get("size")) || 3;
    gameStore.reset(size);
  });

  function handleCellClick(row: number, col: number) {
    if (winner) return;
    errorMessage = "";
    const position: Position = { row, col };
    const cellPiece = board[row][col];

    if (cellPiece && cellPiece.color === currentPlayer) {
      // Eigene Figur auf dem Brett anklicken, um sie zu bewegen
      gameStore.selectPiece(cellPiece, position);
    } else if (selectedPiece) {
      if (selectedPiece.position.row === -1) {
        // Neue Figur platzieren
        if (!board[row][col]) {
          gameStore.placePiece(selectedPiece.piece, position);
          gameStore.clearSelection();
          checkForWinner();
        } else {
          errorMessage = "Ungültiger Zug.";
        }
      } else {
        // Figur bewegen
        const isValidTarget = validMoves.some(
          (move) => move.row === row && move.col === col
        );
        if (isValidTarget) {
          gameStore.movePiece(selectedPiece.position, position);
          gameStore.clearSelection();
          checkForWinner();
        } else {
          errorMessage = "Ungültiger Zug.";
        }
      }
    }
  }

  function selectPieceFromInventory(type: PieceType) {
    if (availablePieces[currentPlayer][type] <= 0) return;
    const piece: Piece = { type, color: currentPlayer };
    // Position (-1, -1) kennzeichnet eine neue Figur zum Platzieren
    gameStore.selectPiece(piece, { row: -1, col: -1 });
  }

  function checkForWinner() {
    setTimeout(() => {
      const newWinner = checkWinner($gameStore.board);
      if (newWinner) gameStore.setWinner(newWinner);
    }, 0);
  }

  function resetGame() {
    gameStore.reset();
    errorMessage = "";
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
    </div>

    <!-- Das Figureninventar bleibt immer sichtbar -->
    <div class="piece-inventory">
      <h2>Verfügbare Figuren ({currentPlayer})</h2>
      <div class="inventory-player">
        {#each Object.entries(availablePieces[currentPlayer]) as [type, count]}
          <button
            class="piece-button"
            class:selected={selectedPiece?.piece.type === type && selectedPiece?.position.row === -1}
            class:disabled={count === 0}
            on:click={() => selectPieceFromInventory(type as PieceType)}
          >
            <ChessPiece
              piece={{ type: type as PieceType, color: currentPlayer }}
            />
            <span class="piece-count">×{count}</span>
          </button>
        {/each}
      </div>
    </div>

    {#if errorMessage}
      <div class="error-message">{errorMessage}</div>
    {/if}

    <div class="board" style="grid-template-columns: repeat({$gameStore.board.length}, 100px);">
      {#each board as row, i}
        {#each row as cell, j}
          {@const isValidMove = validMoves.some(
            (move) => move.row === i && move.col === j
          )}
          <div
            class="cell"
            class:dark={(i + j) % 2 === 1}
            class:selected={selectedPiece?.position.row === i &&
              selectedPiece?.position.col === j}
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
  {/if}
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

  .board {
    display: grid;
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
    border-color: #4caf50;
    background-color: #e8f5e9;
  }

  .piece-button.disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .piece-button.disabled:hover {
    border-color: #ccc;
  }

  .piece-count {
    position: absolute;
    bottom: 2px;
    right: 2px;
    font-size: 0.8rem;
    color: #666;
  }

  .winner-banner {
    background-color: #4caf50;
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
    color: #4caf50;
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

  .error-message {
    color: red;
    margin-bottom: 1rem;
  }
</style>
