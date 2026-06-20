<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { LayoutData } from './$types';

  interface Props { data: LayoutData; children: Snippet }
  let { data, children }: Props = $props();
</script>

{#if data.user}
  <nav>
    <a href="/">Home</a>
    <span>{data.user.email}</span>
    <form method="POST" action="/auth/logout">
      <button type="submit">Esci</button>
    </form>
  </nav>
{/if}

{@render children()}
