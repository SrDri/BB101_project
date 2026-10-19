<script lang="ts">
  import LoginForm from '$lib/components/login-form.svelte';
  import { Button } from '$lib/components/ui/button';
  import { Sun, Moon } from '@lucide/svelte';
  import { projectStore } from '$lib/stores/projectState.svelte';
</script>

<div class="relative min-h-[100dvh] h-[100dvh] w-full flex flex-col items-center justify-center p-3.5 sm:p-6 md:p-10 bg-background overflow-hidden">
  <!-- Contenedor aislado para capas de fondo: evita cualquier desplazamiento o desborde vertical -->
  <div class="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
    <!-- Capa 1: Lienzo Mesh Aurora en movimiento continuo -->
    <div class="absolute inset-0 ambient-aurora-canvas"></div>

    <!-- Capa 2: Haz de luz volumétrico superior con barrido suave -->
    <div
      class="absolute -top-44 left-1/2 h-[520px] w-[1100px] bg-[conic-gradient(from_180deg_at_50%_0%,transparent_32%,rgba(245,164,0,0.22)_47%,rgba(16,185,129,0.16)_53%,transparent_68%)] dark:bg-[conic-gradient(from_180deg_at_50%_0%,transparent_30%,rgba(245,164,0,0.28)_47%,rgba(16,185,129,0.20)_53%,transparent_70%)] blur-[75px] animate-aurora-sweep"
    ></div>

    <!-- Capa 3: Cintas orgánicas mórficas en órbita (Ámbar Fiduciario, Esmeralda y Platino/Índigo) -->
    <div
      class="absolute -top-24 left-[8%] h-[460px] w-[640px] bg-gradient-to-br from-[#F5A400]/22 via-amber-500/14 to-transparent dark:from-[#F5A400]/26 dark:via-amber-500/16 blur-[85px] animate-ambient-orb-a"
    ></div>
    <div
      class="absolute -bottom-28 right-[6%] h-[440px] w-[620px] bg-gradient-to-tl from-emerald-500/18 via-teal-500/12 to-transparent dark:from-emerald-500/22 dark:via-teal-500/14 blur-[90px] animate-ambient-orb-b"
    ></div>
    <div
      class="absolute top-1/3 left-1/2 -translate-x-1/2 h-[360px] w-[560px] rounded-full bg-gradient-to-r from-indigo-500/10 via-[#F5A400]/12 to-emerald-500/10 dark:from-indigo-500/15 dark:via-[#F5A400]/15 dark:to-emerald-500/14 blur-[95px] animate-ambient-orb-c"
    ></div>

    <!-- Capa 4: Retícula arquitectónica de precisión con máscara radial -->
    <div
      class="absolute inset-0 bg-[linear-gradient(to_right,rgba(120,120,128,0.055)_1px,transparent_1px),linear-gradient(to_bottom,rgba(120,120,128,0.055)_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:36px_36px] [mask-image:radial-gradient(ellipse_75%_65%_at_50%_45%,#000_35%,transparent_100%)]"
    ></div>
  </div>

  <!-- Botón discreto de tema Claro / Oscuro Gris -->
  <div class="absolute top-3.5 right-3.5 sm:top-6 sm:right-6 z-20">
    <Button
      variant="outline"
      size="icon"
      onclick={() => projectStore.toggleTheme()}
      title={projectStore.isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro gris'}
      class="h-8 w-8 sm:h-9 sm:w-9 cursor-pointer bg-card/80 backdrop-blur-xs"
    >
      {#if projectStore.isDark}
        <Sun class="w-4 h-4 text-[#F5A400]" />
      {:else}
        <Moon class="w-4 h-4 text-foreground" />
      {/if}
    </Button>
  </div>

  <div class="relative z-10 w-full max-w-4xl my-auto">
    <LoginForm />
  </div>
</div>
