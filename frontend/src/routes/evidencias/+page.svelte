<script lang="ts">
  import { goto } from '$app/navigation';
  import { Card, CardContent } from '$lib/components/ui/card';
  import { Badge } from '$lib/components/ui/badge';
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { projectStore } from '$lib/stores/projectState.svelte';
  import type { PhotoEvidence, FloorData } from '$lib/types/twin';
  import BeforeAfterComparisonSlider from '$lib/components/twin/BeforeAfterComparisonSlider.svelte';
  import { Camera, MapPin, Clock, Search, X, ShieldCheck, Box } from '@lucide/svelte';

  interface EnrichedPhoto extends PhotoEvidence {
    floorId: number;
    floorNumber: number;
    floorName: string;
    floorStatus: FloorData['status'];
    floorHash?: string;
  }

  let selectedLevelFilter = $state<number | 'all'>('all');
  let searchQuery = $state('');
  let activeModalPhoto = $state<EnrichedPhoto | null>(null);

  const cut = $derived(projectStore.activeCut);

  const allPhotos = $derived.by(() => {
    const list: EnrichedPhoto[] = [];
    for (const floor of cut.floors) {
      for (const photo of floor.photos) {
        list.push({
          ...photo,
          floorId: floor.id,
          floorNumber: floor.levelNumber,
          floorName: floor.name,
          floorStatus: floor.status,
          floorHash: floor.hashSha256 || cut.sha256Hash
        });
      }
    }
    return list.sort((a, b) => b.floorNumber - a.floorNumber);
  });

  const filteredPhotos = $derived(
    allPhotos.filter((p) => {
      if (selectedLevelFilter !== 'all' && p.floorNumber !== selectedLevelFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = p.title.toLowerCase().includes(q);
        const matchLoc = p.location.toLowerCase().includes(q);
        const matchAi = p.aiDetectedElements.some((el) => el.toLowerCase().includes(q));
        return matchTitle || matchLoc || matchAi;
      }
      return true;
    })
  );

  const floorsWithPhotos = $derived(
    cut.floors.filter((f) => f.photos.length > 0)
  );

  function openFloorInViewer(floorId: number) {
    projectStore.selectFloor(floorId);
    goto('/gemelo');
  }
</script>

<div class="space-y-6 w-full">
  <!-- Cabecera de evidencias fotográficas -->
  <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border">
    <div class="space-y-1">
      <div class="flex items-center gap-2">
        <Badge variant="outline" class="text-[11px] font-normal bg-muted/60 text-foreground border-border gap-1.5">
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          <span>Registro visual georreferenciado</span>
        </Badge>
        <span class="text-xs text-muted-foreground tabular-nums">
          • Corte #{cut.number}
        </span>
      </div>
      <h1 class="text-2xl font-semibold text-foreground tracking-tight">
        Evidencias fotográficas — {cut.projectName}
      </h1>
      <p class="text-xs text-muted-foreground">
        Archivo de inspecciones de campo con coordenadas GPS verificadas, detección de elementos por IA y huella en Stellar.
      </p>
    </div>

    <!-- Resumen de validación visual -->
    <div class="flex items-center gap-5 bg-card border border-border rounded-lg px-4 py-2.5 text-xs">
      <div>
        <span class="text-[11px] text-muted-foreground block">Total evidencias</span>
        <span class="font-semibold text-foreground tabular-nums">{allPhotos.length} fotografías</span>
      </div>
      <div class="h-7 w-px bg-border"></div>
      <div>
        <span class="text-[11px] text-muted-foreground block">Geocerca GPS</span>
        <span class="font-semibold text-foreground tabular-nums">100% validadas</span>
      </div>
      <div class="h-7 w-px bg-border"></div>
      <div>
        <span class="text-[11px] text-muted-foreground block">Privacidad en obra</span>
        <span class="font-semibold text-foreground">Rostros anonimizados</span>
      </div>
    </div>
  </div>

  <!-- Comparador Interactivo Time-Lapse Antes vs. Después entre Cortes -->
  <BeforeAfterComparisonSlider unitLabel="{cut.projectName} · Corte #2 vs. Corte #{cut.number}" />

  <!-- Barra de filtros por nivel y buscador -->
  <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
    <div class="flex flex-wrap items-center gap-1 bg-muted/50 p-1 rounded-lg border border-border">

      <button
        type="button"
        onclick={() => (selectedLevelFilter = 'all')}
        class="px-3 py-1.5 rounded-md text-xs transition-all cursor-pointer {selectedLevelFilter === 'all'
          ? 'bg-background text-foreground font-medium shadow-xs'
          : 'text-muted-foreground hover:text-foreground'}"
      >
        Todos los niveles ({allPhotos.length})
      </button>

      {#each floorsWithPhotos as floor}
        <button
          type="button"
          onclick={() => (selectedLevelFilter = floor.levelNumber)}
          class="px-3 py-1.5 rounded-md text-xs transition-all cursor-pointer tabular-nums {selectedLevelFilter === floor.levelNumber
            ? 'bg-background text-foreground font-medium shadow-xs'
            : 'text-muted-foreground hover:text-foreground'}"
        >
          Nivel {floor.levelNumber} ({floor.photos.length})
        </button>
      {/each}
    </div>

    <div class="relative w-full lg:w-80">
      <Search class="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
      <Input
        type="text"
        bind:value={searchQuery}
        placeholder="Buscar por actividad, eje o elemento..."
        class="pl-8 h-9 text-xs"
      />
    </div>
  </div>

  <!-- Grilla de fotografías -->
  {#if filteredPhotos.length === 0}
    <Card class="bg-card border-border shadow-none">
      <CardContent class="p-12 text-center space-y-2">
        <Camera class="w-6 h-6 text-muted-foreground mx-auto" />
        <div class="text-sm font-medium text-foreground">No se encontraron fotografías para este filtro</div>
        <p class="text-xs text-muted-foreground">Prueba seleccionando otro nivel o limpiando la búsqueda.</p>
      </CardContent>
    </Card>
  {:else}
    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
      {#each filteredPhotos as photo}
        <Card
          class="bg-card border-border hover:border-foreground/30 transition-all shadow-none overflow-hidden flex flex-col justify-between group"
        >
          <div>
            <!-- Imagen con overlay de nivel y precisión GPS -->
            <button
              type="button"
              onclick={() => (activeModalPhoto = photo)}
              class="relative w-full h-52 bg-muted overflow-hidden block text-left cursor-pointer"
            >
              <img
                src={photo.thumbnailUrl}
                alt={photo.title}
                referrerpolicy="no-referrer"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div class="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/30"></div>

              <div class="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
                <span class="px-2.5 py-1 rounded-md bg-black/70 backdrop-blur-xs text-white text-[11px] font-medium flex items-center gap-1.5">
                  <span
                    class="w-1.5 h-1.5 rounded-full {photo.floorStatus === 'certified'
                      ? 'bg-emerald-400'
                      : photo.floorStatus === 'reviewing'
                        ? 'bg-[#F5A400]'
                        : 'bg-blue-400'}"
                  ></span>
                  <span>Nivel {photo.floorNumber}</span>
                </span>

                <span class="px-2 py-0.5 rounded bg-black/65 text-white/90 text-[10px] font-mono tabular-nums">
                  GPS ±{photo.gps.accuracyMeters}m
                </span>
              </div>

              <div class="absolute bottom-3 left-3 right-3 text-white">
                <div class="text-xs font-semibold truncate">{photo.title}</div>
                <div class="text-[11px] text-white/80 flex items-center gap-1 mt-0.5">
                  <MapPin class="w-3 h-3 shrink-0" />
                  <span class="truncate">{photo.location}</span>
                </div>
              </div>
            </button>

            <!-- Elementos detectados por visión computacional -->
            <CardContent class="p-4 space-y-3">
              <div class="space-y-1.5">
                <span class="text-[11px] text-muted-foreground block">Elementos verificados en imagen:</span>
                <div class="flex flex-wrap gap-1.5">
                  {#each photo.aiDetectedElements as el}
                    <Badge variant="outline" class="text-[11px] font-normal bg-muted/40 border-border text-foreground">
                      {el}
                    </Badge>
                  {/each}
                </div>
              </div>

              <div class="pt-3 border-t border-border flex items-center justify-between text-[11px] text-muted-foreground tabular-nums">
                <span class="flex items-center gap-1">
                  <Clock class="w-3 h-3" />
                  <span>{photo.timestamp}</span>
                </span>
                <button
                  type="button"
                  onclick={() => (activeModalPhoto = photo)}
                  class="text-foreground font-medium underline underline-offset-4 hover:text-[#F5A400] cursor-pointer"
                >
                  Ver ficha técnica
                </button>
              </div>
            </CardContent>
          </div>
        </Card>
      {/each}
    </div>
  {/if}
</div>

<!-- Modal de inspección fotográfica de alta resolución -->
{#if activeModalPhoto}
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-3 sm:p-6"
    onclick={() => (activeModalPhoto = null)}
  >
    <div
      class="w-[95vw] xl:w-[88vw] max-w-6xl rounded-xl border border-border bg-card text-card-foreground shadow-2xl overflow-hidden"
      onclick={(e) => e.stopPropagation()}
    >
      <div class="px-6 py-4 border-b border-border flex items-center justify-between gap-4 bg-muted/20">
        <div>
          <h3 class="text-base font-semibold text-foreground">{activeModalPhoto.title}</h3>
          <p class="text-xs text-muted-foreground">{activeModalPhoto.location} • {cut.projectName}</p>
        </div>
        <button
          type="button"
          onclick={() => (activeModalPhoto = null)}
          class="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent cursor-pointer"
        >
          <X class="w-4 h-4" />
        </button>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12">
        <div class="lg:col-span-8 bg-black flex items-center justify-center max-h-[540px] overflow-hidden">
          <img
            src={activeModalPhoto.fullUrl}
            alt={activeModalPhoto.title}
            referrerpolicy="no-referrer"
            class="w-full h-full object-cover"
          />
        </div>

        <div class="lg:col-span-4 p-6 space-y-4 text-xs flex flex-col justify-between">
          <div class="space-y-4">
            <div class="space-y-2 p-3 rounded-lg bg-muted/30 border border-border tabular-nums">
              <div class="flex justify-between">
                <span class="text-muted-foreground">Nivel ubicado</span>
                <span class="font-medium text-foreground">Nivel {activeModalPhoto.floorNumber}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-muted-foreground">Fecha de captura</span>
                <span class="font-medium text-foreground">{activeModalPhoto.timestamp}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-muted-foreground">Coordenadas GPS</span>
                <span class="font-mono text-foreground">
                  {activeModalPhoto.gps.lat}, {activeModalPhoto.gps.lng}
                </span>
              </div>
              <div class="flex justify-between">
                <span class="text-muted-foreground">Precisión satelital</span>
                <span class="font-medium text-foreground">±{activeModalPhoto.gps.accuracyMeters} metros</span>
              </div>
            </div>

            <div class="space-y-1.5">
              <span class="text-[11px] text-muted-foreground block">Detección asistida por visión artificial:</span>
              <div class="flex flex-wrap gap-1.5">
                {#each activeModalPhoto.aiDetectedElements as tag}
                  <Badge variant="outline" class="text-[11px] font-normal bg-muted/50 border-border">
                    {tag}
                  </Badge>
                {/each}
              </div>
            </div>

            <div class="p-3 rounded-lg bg-muted/30 border border-border space-y-1">
              <span class="text-[11px] text-muted-foreground flex items-center gap-1.5">
                <ShieldCheck class="w-3.5 h-3.5 text-emerald-500" />
                <span>Huella SHA-256 asociada al nivel</span>
              </span>
              <div class="font-mono text-[10px] text-foreground truncate tabular-nums">
                {activeModalPhoto.floorHash}
              </div>
            </div>
          </div>

          <div class="pt-3 border-t border-border flex items-center gap-2">
            <Button
              onclick={() => {
                const fId = activeModalPhoto!.floorId;
                activeModalPhoto = null;
                openFloorInViewer(fId);
              }}
              class="flex-1 h-8 bg-foreground text-background hover:bg-foreground/90 text-xs font-medium gap-1.5 cursor-pointer"
            >
              <Box class="w-3.5 h-3.5" />
              <span>Ver nivel en Vista 3D</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  </div>
{/if}

