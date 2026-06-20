<script lang="ts">
  import { spec } from '$lib/generated/spec';
  import { sampleData } from '$lib/generated/sample-data';

  type Field = {
    name: string;
    type: 'text' | 'integer' | 'boolean' | 'datetime' | 'reference';
    required?: boolean;
    references?: string;
  };

  type Entity = {
    name: string;
    description?: string;
    fields: readonly Field[];
  };

  type Role = {
    name: string;
    permissions: Record<string, readonly string[]>;
  };

  type Page = {
    type: 'list' | 'detail' | 'form' | 'dashboard';
    entity?: string;
    name?: string;
  };

  type Row = Record<string, string | number | boolean>;

  const rowsByEntity = sampleData as Record<string, readonly Row[]>;
  const entities = spec.entities as readonly Entity[];
  const roles = spec.roles as readonly Role[];
  const pages = spec.pages as readonly Page[];

  function label(value: string): string {
    return value
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase());
  }

  function formatValue(value: string | number | boolean | undefined): string {
    if (value === undefined) return '—';
    if (typeof value === 'boolean') return value ? 'Sì' : 'No';
    return String(value);
  }
</script>

<svelte:head>
  <title>{label(spec.name)} · TORA Build</title>
  <meta name="description" content={spec.description} />
</svelte:head>

<main class="shell">
  <section class="hero">
    <p class="eyebrow">TORA Build MVP</p>
    <h1>{label(spec.name)}</h1>
    <p>{spec.description}</p>
    <div class="badges">
      <span>Auth: {spec.auth.type}</span>
      <span>Self signup: {spec.auth.self_signup ? 'abilitato' : 'disabilitato'}</span>
      <span>{entities.length} entità</span>
    </div>
  </section>

  <section class="grid" aria-label="Entities">
    {#each entities as entity}
      <article class="card">
        <header>
          <h2>{entity.name}</h2>
          {#if entity.description}
            <p>{entity.description}</p>
          {/if}
        </header>

        <h3>Campi</h3>
        <ul class="fields">
          {#each entity.fields as field}
            <li>
              <strong>{field.name}</strong>
              <span>{field.type}{field.required ? ' · richiesto' : ''}{field.references ? ` · → ${field.references}` : ''}</span>
            </li>
          {/each}
        </ul>

        <h3>Dati esempio</h3>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                {#each entity.fields as field}
                  <th>{label(field.name)}</th>
                {/each}
              </tr>
            </thead>
            <tbody>
              {#each rowsByEntity[entity.name] ?? [] as row}
                <tr>
                  {#each entity.fields as field}
                    <td>{formatValue(row[field.name])}</td>
                  {/each}
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      </article>
    {/each}
  </section>

  <section class="two-column">
    <article class="card">
      <h2>Ruoli e permessi</h2>
      {#each roles as role}
        <div class="role">
          <h3>{role.name}</h3>
          <ul>
            {#each Object.entries(role.permissions) as [entityName, permissions]}
              <li><strong>{entityName}</strong>: {permissions.join(', ')}</li>
            {/each}
          </ul>
        </div>
      {/each}
    </article>

    <article class="card">
      <h2>Pagine previste</h2>
      <ul>
        {#each pages as page}
          <li>{page.name ?? label(page.type)}{page.entity ? ` · ${page.entity}` : ''}</li>
        {/each}
      </ul>
    </article>
  </section>
</main>

<style>
  :global(body) {
    margin: 0;
    background: #f6f7fb;
    color: #172033;
    font-family:
      Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  }

  .shell {
    width: min(1180px, calc(100% - 32px));
    margin: 0 auto;
    padding: 40px 0;
  }

  .hero,
  .card {
    border: 1px solid #dfe3ee;
    border-radius: 24px;
    background: #ffffff;
    box-shadow: 0 16px 40px rgb(23 32 51 / 8%);
  }

  .hero {
    padding: 40px;
    margin-bottom: 24px;
  }

  .eyebrow {
    color: #5262ff;
    font-size: 0.8rem;
    font-weight: 800;
    letter-spacing: 0.12em;
    margin: 0 0 8px;
    text-transform: uppercase;
  }

  h1,
  h2,
  h3,
  p {
    margin-top: 0;
  }

  h1 {
    font-size: clamp(2rem, 5vw, 4rem);
    margin-bottom: 12px;
  }

  .badges,
  .grid,
  .two-column {
    display: grid;
    gap: 16px;
  }

  .badges {
    grid-template-columns: repeat(auto-fit, minmax(180px, max-content));
    margin-top: 24px;
  }

  .badges span {
    border-radius: 999px;
    background: #eef0ff;
    color: #2936a3;
    font-weight: 700;
    padding: 8px 14px;
  }

  .grid {
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    margin-bottom: 24px;
  }

  .two-column {
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  }

  .card {
    padding: 24px;
    overflow: hidden;
  }

  .fields {
    display: grid;
    gap: 8px;
    list-style: none;
    padding: 0;
  }

  .fields li {
    display: flex;
    justify-content: space-between;
    gap: 16px;
    border-bottom: 1px solid #edf0f7;
    padding-bottom: 8px;
  }

  .fields span {
    color: #67708a;
    text-align: right;
  }

  .table-wrap {
    overflow-x: auto;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.92rem;
  }

  th,
  td {
    border-bottom: 1px solid #edf0f7;
    padding: 10px 8px;
    text-align: left;
    white-space: nowrap;
  }

  th {
    color: #67708a;
    font-size: 0.75rem;
    text-transform: uppercase;
  }

  .role + .role {
    border-top: 1px solid #edf0f7;
    margin-top: 16px;
    padding-top: 16px;
  }
</style>
