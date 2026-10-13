<script lang="ts">
  import { onMount } from 'svelte';
  import { Layers, Box, Image } from '@lucide/svelte';
  import { Button } from '$lib/components/ui/button';
  import BuildingCanvas3D from './BuildingCanvas3D.svelte';
  import RenderOverlayViewer from './RenderOverlayViewer.svelte';
  import FallbackIsometricSVG from './FallbackIsometricSVG.svelte';
  import FloorDrawer from './FloorDrawer.svelte';
  import { projectStore } from '$lib/stores/projectState.svelte';
  import type { FloorData } from '$lib/types/twin';

  let viewMode = $state<'3d' | 'render' | 'isometric'>('3d');
  let webglAvailable = $state(true);

  onMount(() => {
    try {
      const canvas = document.createElement('canvas');
      webglAvailable = !!(
        window.WebGLRenderingContext &&
        (canvas.getContext('webgl2') || canvas.getContext('webgl'))
      );
      if (!webglAvailable) {
        viewMode = 'render';
      }
    } catch {
      webglAvailable = false;
      viewMode = 'render';
    }
  });

  function handleSelect(floor: FloorData) {
    projectStore.selectFloor(floor.id);
  }

  let selectedFloor = $derived(
    projectStore.floors.find((f) => f.id === projectStore.selectedFloorId)
  );
</script>

<div class="relative w-full h-[600px] bg-card rounded-xl border border-border overflow-hidden select-none">
  <!-- HUD superior de telemetría -->
  <div class="absolute top-4 left-4 z-20 flex flex-wrap items-center gap-3 bg-background/90 backdrop-blur-md px-3.5 py-2 rounded-lg border border-border">
    <div class="flex items-center gap-2">
      <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
      <span class="text-xs font-medium text-foreground">
        {viewMode === '3d'
          ? 'Vista 3D'
          : viewMode === 'render'
            ? 'Render arquitectónico'
            : 'Elevación 2D'} • {projectStore.activeCut.projectName}
      </span>
    </div>
    <span class="text-border hidden sm:inline">|</span>
    <div class="text-xs text-muted-foreground hidden sm:flex items-center gap-1.5 tabular-nums">
      <span>Corte #{projectStore.activeCut.number}</span>
      <span>•</span>
      <span class="text-foreground font-medium">
        {projectStore.floors.filter((f) => f.status === 'certified').length} niveles sellados
      </span>
    </div>
  </div>

  <!-- Controles de modo de visualización: Vista 3D | Render | Planta 2D -->
  <div class="absolute top-4 right-4 z-20 flex items-center gap-1 bg-background/90 backdrop-blur-md p-1 rounded-lg border border-border">
    {#if webglAvailable}
      <Button
        variant={viewMode === '3d' ? 'default' : 'ghost'}
        size="sm"
        onclick={() => (viewMode = '3d')}
        class="h-7 px-2.5 text-xs cursor-pointer {viewMode === '3d'
          ? 'bg-foreground text-background hover:bg-foreground/90 font-medium'
          : ''}"
      >
        <Box class="w-3.5 h-3.5 mr-1.5" />
        <span>Vista 3D</span>
      </Button>
    {/if}

    <Button
      variant={viewMode === 'render' ? 'default' : 'ghost'}
      size="sm"
      onclick={() => (viewMode = 'render')}
      class="h-7 px-2.5 text-xs cursor-pointer {viewMode === 'render'
        ? 'bg-foreground text-background hover:bg-foreground/90 font-medium'
        : ''}"
    >
      <Image class="w-3.5 h-3.5 mr-1.5" />
      <span>Render</span>
    </Button>

    <Button
      variant={viewMode === 'isometric' ? 'default' : 'ghost'}
      size="sm"
      onclick={() => (viewMode = 'isometric')}
      class="h-7 px-2.5 text-xs cursor-pointer {viewMode === 'isometric'
        ? 'bg-foreground text-background hover:bg-foreground/90 font-medium'
        : ''}"
    >
      <Layers class="w-3.5 h-3.5 mr-1.5" />
      <span>Planta 2D</span>
    </Button>
  </div>

  <!-- Leyenda de estados -->
  <div class="absolute bottom-4 left-4 z-20 hidden md:flex items-center gap-4 bg-background/90 backdrop-blur-md px-3.5 py-2 rounded-lg border border-border text-xs">
    <div class="flex items-center gap-1.5">
      <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
      <span class="text-foreground">Certificado y sellado</span>
    </div>
    <div class="flex items-center gap-1.5">
      <span class="w-2 h-2 rounded-full bg-[#F5A400]"></span>
      <span class="text-foreground">En calibración IA</span>
    </div>
    <div class="flex items-center gap-1.5">
      <span class="w-2 h-2 rounded-full bg-blue-500"></span>
      <span class="text-foreground">En ejecución</span>
    </div>
    <div class="flex items-center gap-1.5">
      <span class="w-2 h-2 rounded-full bg-muted-foreground/50"></span>
      <span class="text-muted-foreground">Proyectado (Outline)</span>
    </div>
  </div>

  <!-- Renderizador Activo -->
  {#if viewMode === '3d' && webglAvailable}
    <BuildingCanvas3D
      floors={projectStore.floors}
      selectedFloorId={projectStore.selectedFloorId}
      onSelect={handleSelect}
    />
  {:else if viewMode === 'render'}
    <RenderOverlayViewer
      floors={projectStore.floors}
      selectedFloorId={projectStore.selectedFloorId}
      onSelect={handleSelect}
    />
  {:else}
    <FallbackIsometricSVG
      floors={projectStore.floors}
      selectedFloorId={projectStore.selectedFloorId}
      onSelect={handleSelect}
    />
  {/if}
</div>

<!-- Modal amplio centrado cuando hay un piso seleccionado -->
{#if projectStore.isDrawerOpen && selectedFloor}
  <FloorDrawer
    floor={selectedFloor}
    onClose={() => projectStore.closeDrawer()}
  />
{/if}
