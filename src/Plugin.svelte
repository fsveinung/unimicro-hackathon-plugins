<svelte:options customElement="unimicro-plugin" />

<script lang="ts">
    let count: number = 0;
    const increment = () => {
        count += 1;
    };
</script>

<button on:click={increment}>
    Count: {count}
</button>

<style>
</style>
