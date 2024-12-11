<script>
    import { goto } from '$app/navigation';

    const startNewGame = () => {
        goto('/game');
    };
</script>

<div class="container">
    <h1>Chess Tic-Tac-Toe</h1>
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
</style>
