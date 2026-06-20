<script lang="ts">
  import { enhance } from '$app/forms';
  import type { ActionData } from './$types';

  let { form }: { form: ActionData } = $props();
</script>

<main>
  <h1>Accedi</h1>
  {#if form?.sent}
    <p>Controlla la tua email: abbiamo inviato un link di accesso.</p>
  {:else}
    <form method="POST" use:enhance>
      <label>
        Email
        <input type="email" name="email" required autocomplete="email" />
      </label>
      {#if form?.error}
        <p>{form.error}</p>
      {/if}
      <button type="submit">Invia link di accesso</button>
    </form>
  {/if}
</main>
