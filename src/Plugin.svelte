<svelte:options
    customElement={{
        tag: 'unimicro-plugin',
        props: {
            api: { reflect: true, type: 'Object', attribute: 'api' },
        },
    }}
/>

<script lang="ts">
    export let api: any; // TODO: types

    let count: number = 0;

    function increment() {
        count += 1;
    }
</script>

<button on:click={increment}>
    Count: {count}
</button>

<button on:click={api.showAlert('Hello from plugin!')}> Show alert </button>

<style>
</style>
