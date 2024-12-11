<script>
    import { goto } from '$app/navigation';

    let boardSize = 3;

    const startNewGame = () => {
        goto(`/game?size=${boardSize}`);
    };
</script>

<div class="container">
    <h1>Chess Tic-Tac-Toe</h1>
    <div class="settings">
        <label for="boardSize">Board Size:</label>
        <select id="boardSize" bind:value={boardSize}>
            {#each Array.from({length: 6}, (_, i) => i + 3) as size}
                <option value={size}>{size}x{size}</option>
            {/each}
        </select>
    </div>
    <button on:click={startNewGame}>New Game</button>
</div>

<style>
    .container {
        height: 100vh;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        gap: 2rem;
    }

    h1 {
        font-size: 2.5rem;
        color: #333;
    }

    button {
        padding: 1rem 2rem;
        font-size: 1.2rem;
        background-color: #4CAF50;
        color: white;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        transition: background-color 0.2s;
    }

    button:hover {
        background-color: #45a049;
    }

    .settings {
        display: flex;
        gap: 1rem;
        align-items: center;
        margin-bottom: 1rem;
    }

    select {
        padding: 0.5rem;
        font-size: 1rem;
        border-radius: 4px;
        border: 1px solid #ccc;
    }

    label {
        font-size: 1.1rem;
        color: #333;
    }
</style>
