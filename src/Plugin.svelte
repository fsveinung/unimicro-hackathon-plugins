<svelte:options
    customElement={{
        tag: 'unimicro-plugin',
        props: {
            api: { reflect: true, type: 'Object', attribute: 'api' },
        },
    }}
/>

<script lang="ts">
    import { onMount } from 'svelte';

    export let api: any; // TODO: types

    let count: number = 0;
    let user: any;

    onMount(() => {
        if (api) {
            loadUserData();
        }
    });

    async function loadUserData() {
        user = await api.http.get('/api/biz/users?action=current-session');
    }

    function increment() {
        count += 1;
    }
</script>

{#if user}
    <h1>Hello {user.DisplayName || user.UserName || user.Email}</h1>
{/if}

<button on:click={increment}>
    Count: {count}
</button>

<button on:click={api.showAlert('Hello from plugin!')}> Show alert </button>

<style>
    h1 {
        font-weight: 500;
    }
</style>
