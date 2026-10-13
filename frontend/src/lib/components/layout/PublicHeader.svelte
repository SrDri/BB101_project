<script lang="ts">
  import { page } from '$app/state';
  import { Sun, Moon } from '@lucide/svelte';
  import { Button } from '$lib/components/ui/button';
  import TramoBrandLogo from '$lib/components/ui/TramoBrandLogo.svelte';
  import { projectStore } from '$lib/stores/projectState.svelte';
</script>

<header class="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur-md">
  <div class="w-full px-3.5 sm:px-6 lg:px-10 h-14 sm:h-15 flex items-center justify-between gap-2 sm:gap-4">
    <!-- Identidad del portal público -->
    <div class="flex items-center gap-3 min-w-0">
      <a href="/verificar" class="flex items-center gap-2.5 shrink-0">
        <TramoBrandLogo variant="full" isDark={projectStore.isDark} class="h-4.5 sm:h-5 w-auto" />
      </a>

      <div class="hidden lg:flex items-center pl-4 border-l border-border">
        <h2 class="text-sm font-medium text-foreground whitespace-nowrap">
          Portal de consulta pública
        </h2>
      </div>
    </div>

    <!-- Navegación entre módulos públicos (Desktop/Tablet) + Acciones -->
    <div class="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
      <div class="hidden md:flex items-center gap-1 bg-muted/50 p-1 rounded-lg border border-border">
        <a
          href="/verificar"
          class="px-3 py-1 rounded-md text-xs transition-all whitespace-nowrap {page.url.pathname === '/verificar'
            ? 'bg-background text-foreground font-medium shadow-xs'
            : 'text-muted-foreground hover:text-foreground'}"
        >
          Verificador criptográfico
        </a>

        <a
          href="/propietario"
          class="px-3 py-1 rounded-md text-xs transition-all whitespace-nowrap {page.url.pathname === '/propietario'
            ? 'bg-background text-foreground font-medium shadow-xs'
            : 'text-muted-foreground hover:text-foreground'}"
        >
          Soy propietario (cédula)
        </a>
      </div>

      <Button
        variant="outline"
        size="icon"
        onclick={() => projectStore.toggleTheme()}
        title={projectStore.isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
        class="h-8 w-8 cursor-pointer shrink-0"
      >
        {#if projectStore.isDark}
          <Sun class="w-4 h-4 text-muted-foreground" />
        {:else}
          <Moon class="w-4 h-4 text-muted-foreground" />
        {/if}
      </Button>

      <Button
        variant="outline"
        size="sm"
        href="/login"
        class="text-[11px] sm:text-xs h-8 px-2.5 sm:px-3 cursor-pointer whitespace-nowrap"
      >
        Acceso corporativo
      </Button>
    </div>
  </div>

  <!-- Barra de pestañas públicas para celular (< md) -->
  <div class="flex md:hidden px-3.5 pb-2.5">
    <div class="grid grid-cols-2 w-full gap-1 bg-muted/50 p-1 rounded-lg border border-border">
      <a
        href="/verificar"
        class="py-1.5 px-2 rounded-md text-[11px] text-center transition-all truncate {page.url.pathname === '/verificar'
          ? 'bg-background text-foreground font-medium shadow-xs'
          : 'text-muted-foreground hover:text-foreground'}"
      >
        Verificador criptográfico
      </a>

      <a
        href="/propietario"
        class="py-1.5 px-2 rounded-md text-[11px] text-center transition-all truncate {page.url.pathname === '/propietario'
          ? 'bg-background text-foreground font-medium shadow-xs'
          : 'text-muted-foreground hover:text-foreground'}"
      >
        Soy propietario (cédula)
      </a>
    </div>
  </div>
</header>

