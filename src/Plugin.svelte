<svelte:options
    customElement={{
        tag: 'sb1-loan',
        props: {
            api: { reflect: true, type: 'Object', attribute: 'api' },
        },
    }}
/>

<script lang="ts">
    import { onMount } from 'svelte';
    export let api: any; // TODO: types
    let company: any;

    onMount(() => {
        if (api) {
            loadCompany();
        }
    });

    async function loadCompany() {
        company = await api.http.get('/api/biz/companysettings/1?select=CompanyName');
    }

    function nextStep() {
        //count += 1;
    }
</script>

{#if company}
    <section class="card">
        <h1>Lånesøknad for {company.CompanyName}</h1>
        <h2>Lånebeløp</h2>
        <input type="text" />

    </section>
    <footer>
        <button on:click={nextStep}>Neste</button>
        <button on:click={api.showAlert('Videresendt!')}> Tilbakemelding </button>
    </footer>
{/if}

<style>
    h1 {
        font-weight: 500;
    }
    .card {
        min-height: 10rem;
    }
    footer {
        display: flex;
        margin-top: 1px solid var(--border-color);
        padding: 1rem;
    }
</style>
