<script lang="ts">
  import {
    X,
    ShieldCheck,
    Cpu,
    MapPin,
    Camera,
    ChevronLeft,
    ChevronRight,
    CheckCircle2,
    ExternalLink,
    Copy,
    Check,
    Layers,
    Sparkles
  } from '@lucide/svelte';
  import { Button } from '$lib/components/ui/button';
  import { Badge } from '$lib/components/ui/badge';
  import { Card, CardContent } from '$lib/components/ui/card';
  import { projectStore } from '$lib/stores/projectState.svelte';
  import type { FloorData } from '$lib/types/twin';

  interface Props {
    floor: FloorData;
    onClose: () => void;
  }

  let { floor, onClose }: Props = $props();

  let activePhotoIndex = $state(0);
  let copiedHash = $state(false);

  // Reiniciar foto activa al cambiar de piso
  $effect(() => {
    const _id = floor.id;
    activePhotoIndex = 0;
  });

  function getStatusMeta(status: FloorData['status']) {
    switch (status) {
      case 'certified':
        return {
          label: 'Certificado en Stellar',
          dot: 'bg-emerald-500',
          bar: 'bg-emerald-500',
          text: 'text-emerald-600 dark:text-emerald-400'
        };
      case 'reviewing':
        return {
          label: 'En calibración IA',
          dot: 'bg-[#F5A400]',
          bar: 'bg-[#F5A400]',
          text: 'text-amber-600 dark:text-[#F5A400]'
        };
      case 'in_progress':
        return {
          label: 'En ejecución física',
          dot: 'bg-blue-500',
          bar: 'bg-blue-500',
          text: 'text-blue-600 dark:text-blue-400'
        };
      default:
        return {
          label: 'Proyectado',
          dot: 'bg-zinc-400',
          bar: 'bg-zinc-400',
          text: 'text-muted-foreground'
        };
    }
  }

  const meta = $derived(getStatusMeta(floor.status));
  const activePhoto = $derived(floor.photos[activePhotoIndex] ?? floor.photos[0] ?? null);

  const avgAiConfidence = $derived.by(() => {
    if (!floor.activities.length) return 0;
    const sum = floor.activities.reduce((acc, a) => acc + a.confidenceScore, 0);
    return Math.round(sum / floor.activities.length);
  });

  const prevFloor = $derived(
    projectStore.floors.find((f) => f.levelNumber === floor.levelNumber - 1) ?? null
  );
  const nextFloor = $derived(
    projectStore.floors.find((f) => f.levelNumber === floor.levelNumber + 1) ?? null
  );

  function copyHash() {
    if (!floor.hashSha256) return;
    navigator.clipboard?.writeText(floor.hashSha256);
    copiedHash = true;
    setTimeout(() => {
      copiedHash = false;
    }, 2000);
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') onClose();
  }
</script>

<svelte:window onkeydown={handleKeydown} />

<!-- Fondo del modal amplio centrado -->
<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
  class="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-2 sm:p-5 overflow-y-auto"
  onclick={onClose}
>
  <!-- Contenedor principal del modal amplio de inspección de piso -->
  <div
    class="bg-card border border-border rounded-xl max-w-[1440px] w-[96vw] xl:w-[92vw] max-h-[92vh] flex flex-col overflow-hidden shadow-2xl my-auto"
    onclick={(e) => e.stopPropagation()}
  >
    <!-- 1. Cabecera del modal con navegación rápida entre pisos -->
    <div class="px-6 py-4 border-b border-border flex flex-wrap items-center justify-between gap-4 bg-muted/20 shrink-0">
      <div class="space-y-1">
        <div class="flex flex-wrap items-center gap-2">
          <Badge variant="outline" class="text-[11px] font-medium bg-background text-foreground border-border gap-1.5">
            <span class="w-1.5 h-1.5 rounded-full {meta.dot}"></span>
            <span>{meta.label}</span>
          </Badge>
          <span class="text-xs text-muted-foreground tabular-nums">
            Nivel #{floor.levelNumber} • Cota +{(floor.levelNumber * 3.2).toFixed(1)} m
          </span>
          <span class="text-border hidden sm:inline">•</span>
          <span class="text-xs text-muted-foreground hidden sm:inline">
            {projectStore.activeCut.projectName}
          </span>
        </div>
        <h2 class="text-lg sm:text-xl font-semibold text-foreground tracking-tight">
          {floor.name}
        </h2>
      </div>

      <div class="flex items-center gap-2">
        <!-- Navegación rápida Piso Anterior / Siguiente sin cerrar el modal -->
        <div class="inline-flex items-center rounded-lg border border-border bg-background p-0.5">
          <button
            type="button"
            disabled={!prevFloor}
            onclick={() => prevFloor && projectStore.selectFloor(prevFloor.id)}
            class="px-2.5 py-1 rounded-md text-xs font-medium flex items-center gap-1 transition-colors disabled:opacity-40 disabled:pointer-events-none hover:bg-muted text-foreground cursor-pointer"
            title="Ir al piso inferior"
          >
            <ChevronLeft class="w-3.5 h-3.5" />
            <span class="hidden sm:inline">Piso {floor.levelNumber - 1}</span>
          </button>
          <span class="text-border px-1 text-xs">|</span>
          <button
            type="button"
            disabled={!nextFloor}
            onclick={() => nextFloor && projectStore.selectFloor(nextFloor.id)}
            class="px-2.5 py-1 rounded-md text-xs font-medium flex items-center gap-1 transition-colors disabled:opacity-40 disabled:pointer-events-none hover:bg-muted text-foreground cursor-pointer"
            title="Ir al piso superior"
          >
            <span class="hidden sm:inline">Piso {floor.levelNumber + 1}</span>
            <ChevronRight class="w-3.5 h-3.5" />
          </button>
        </div>

        <Button
          variant="outline"
          size="icon"
          onclick={onClose}
          class="h-8 w-8 cursor-pointer"
          aria-label="Cerrar modal"
        >
          <X class="w-4 h-4" />
        </Button>
      </div>
    </div>

    <!-- 2. Cuerpo del modal con scroll fluido -->
    <div class="p-6 overflow-y-auto space-y-6">
      <!-- Franja superior de 4 KPIs del nivel -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <Card class="bg-muted/25 border-border shadow-none">
          <CardContent class="p-3.5 space-y-1">
            <div class="text-xs text-muted-foreground">Avance físico verificado</div>
            <div class="flex items-baseline justify-between">
              <span class="text-2xl font-semibold text-foreground tabular-nums">
                {floor.completionPercent}%
              </span>
              <span class="text-xs text-muted-foreground tabular-nums">
                Meta: {floor.scheduledPercent}%
              </span>
            </div>
            <div class="w-full h-1.5 bg-muted rounded-full overflow-hidden mt-1">
              <div class="h-full rounded-full {meta.bar}" style="width: {floor.completionPercent}%"></div>
            </div>
          </CardContent>
        </Card>

        <Card class="bg-muted/25 border-border shadow-none">
          <CardContent class="p-3.5 space-y-1">
            <div class="text-xs text-muted-foreground">Confianza de visión IA</div>
            <div class="flex items-baseline justify-between">
              <span class="text-2xl font-semibold text-foreground tabular-nums">
                {avgAiConfidence}%
              </span>
              <span class="text-xs text-muted-foreground">
                {floor.activities.length} partidas
              </span>
            </div>
            <div class="text-[11px] text-muted-foreground">
              {avgAiConfidence > 0 ? 'Inferencia contrastada en obra' : 'Pendiente de inicio físico'}
            </div>
          </CardContent>
        </Card>

        <Card class="bg-muted/25 border-border shadow-none">
          <CardContent class="p-3.5 space-y-1">
            <div class="text-xs text-muted-foreground">Registro fotográfico</div>
            <div class="flex items-baseline justify-between">
              <span class="text-2xl font-semibold text-foreground tabular-nums">
                {floor.photos.length}
              </span>
              <a
                href="/evidencias"
                onclick={onClose}
                class="text-xs font-medium text-muted-foreground hover:text-foreground underline underline-offset-4"
              >
                Abrir galería
              </a>
            </div>
            <div class="text-[11px] text-muted-foreground">
              {floor.photos.length > 0 ? 'Con GPS y validación anti-duplicado' : 'Sin capturas en este corte'}
            </div>
          </CardContent>
        </Card>

        <Card class="bg-muted/25 border-border shadow-none">
          <CardContent class="p-3.5 space-y-1">
            <div class="flex items-center justify-between">
              <span class="text-xs text-muted-foreground">Respaldo en Stellar</span>
              {#if floor.hashSha256}
                <button
                  type="button"
                  onclick={copyHash}
                  class="text-[11px] text-muted-foreground hover:text-foreground inline-flex items-center gap-1 cursor-pointer"
                >
                  {#if copiedHash}
                    <Check class="w-3 h-3 text-emerald-500" />
                    <span class="text-emerald-500">Copiado</span>
                  {:else}
                    <Copy class="w-3 h-3" />
                    <span>Copiar</span>
                  {/if}
                </button>
              {/if}
            </div>
            {#if floor.hashSha256}
              <div class="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 pt-0.5">
                <ShieldCheck class="w-4 h-4 shrink-0" />
                <span>Sello SHA-256 activo</span>
              </div>
              <div class="text-[11px] text-muted-foreground truncate tabular-nums">
                {floor.hashSha256}
              </div>
            {:else}
              <div class="text-sm font-medium text-muted-foreground pt-0.5">
                Pendiente de firma
              </div>
              <div class="text-[11px] text-muted-foreground">
                Se genera al certificar el corte
              </div>
            {/if}
          </CardContent>
        </Card>
      </div>

      <!-- Grid Principal de 12 Columnas: Desglose de Partidas (5 cols) + Visor de Evidencia Fotográfica (7 cols) -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <!-- Columna Izquierda (5 cols): Desglose Técnico por Partida Constructiva -->
        <div class="lg:col-span-5 space-y-3">
          <div class="flex items-center justify-between">
            <h3 class="text-sm font-semibold text-foreground flex items-center gap-2">
              <Cpu class="w-4 h-4 text-muted-foreground" />
              <span>Desglose técnico por actividad</span>
            </h3>
            <span class="text-xs text-muted-foreground">Calibrado vs. IA</span>
          </div>

          <div class="space-y-2.5">
            {#each floor.activities as act}
              {@const delta = act.calibratedPercent - act.scheduledPercent}
              <div class="p-3.5 rounded-lg border border-border bg-muted/15 space-y-2">
                <div class="flex items-center justify-between gap-2">
                  <span class="text-xs font-medium text-foreground">{act.name}</span>
                  <span class="text-xs font-semibold text-foreground tabular-nums">
                    {act.calibratedPercent}%
                  </span>
                </div>

                <!-- Barra de progreso de la partida -->
                <div class="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    class="h-full rounded-full transition-all {act.calibratedPercent >= 100
                      ? 'bg-emerald-500'
                      : act.calibratedPercent > 0
                        ? 'bg-[#F5A400]'
                        : 'bg-zinc-400'}"
                    style="width: {act.calibratedPercent}%"
                  ></div>
                </div>

                <div class="flex flex-wrap items-center justify-between gap-2 text-[11px] text-muted-foreground tabular-nums">
                  <span>
                    IA sugerido: <strong class="text-foreground font-medium">{act.aiEstimatedPercent}%</strong>
                    {act.confidenceScore > 0 ? `(${act.confidenceScore}% conf.)` : ''}
                  </span>
                  <span>
                    Programado: <strong class="text-foreground font-medium">{act.scheduledPercent}%</strong>
                    {#if delta >= 0 && act.scheduledPercent > 0}
                      <span class="text-emerald-600 dark:text-emerald-400 ml-1">(Al día)</span>
                    {:else if delta < 0}
                      <span class="text-amber-600 dark:text-[#F5A400] ml-1">({delta}%)</span>
                    {/if}
                  </span>
                </div>
              </div>
            {/each}
          </div>
        </div>

        <!-- Columna Derecha (7 cols): Visor Interactivo de Evidencias Fotográficas del Piso -->
        <div class="lg:col-span-7 space-y-3">
          <div class="flex items-center justify-between">
            <h3 class="text-sm font-semibold text-foreground flex items-center gap-2">
              <Camera class="w-4 h-4 text-muted-foreground" />
              <span>Evidencia fotográfica georreferenciada ({floor.photos.length})</span>
            </h3>
            <a
              href="/evidencias"
              onclick={onClose}
              class="text-xs font-medium text-muted-foreground hover:text-foreground inline-flex items-center gap-1 underline underline-offset-4"
            >
              <span>Ver todas las evidencias</span>
              <ExternalLink class="w-3 h-3" />
            </a>
          </div>

          {#if floor.photos.length === 0}
            <div class="h-72 rounded-xl border border-dashed border-border bg-muted/20 flex flex-col items-center justify-center p-6 text-center space-y-2">
              <Camera class="w-7 h-7 text-muted-foreground" />
              <div class="text-sm font-medium text-foreground">
                Sin capturas fotográficas registradas en este nivel
              </div>
              <p class="text-xs text-muted-foreground max-w-sm">
                Este piso se encuentra en etapa proyectada dentro del cronograma de obra y aún no tiene actas fotográficas cargadas.
              </p>
            </div>
          {:else if activePhoto}
            <div class="rounded-xl border border-border bg-muted/15 overflow-hidden">
              <!-- Imagen principal ampliada -->
              <div class="relative h-72 sm:h-96 w-full bg-zinc-950 overflow-hidden">
                <img
                  src={activePhoto.thumbnailUrl}
                  alt={activePhoto.title}
                  class="w-full h-full object-cover"
                />
                <div class="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/30"></div>

                <!-- Badges de validación técnica sobre la foto -->
                <div class="absolute top-3 left-3 flex flex-wrap gap-1.5">
                  {#if activePhoto.faceBlurApplied}
                    <span class="px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-background/90 text-foreground border border-border backdrop-blur-sm flex items-center gap-1">
                      <CheckCircle2 class="w-3 h-3 text-emerald-500" />
                      Rostros difuminados
                    </span>
                  {/if}
                  {#if activePhoto.duplicateChecked}
                    <span class="px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-background/90 text-foreground border border-border backdrop-blur-sm flex items-center gap-1">
                      <ShieldCheck class="w-3 h-3 text-blue-500" />
                      Hash único verificado
                    </span>
                  {/if}
                </div>

                <div class="absolute top-3 right-3">
                  <span class="px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-black/70 text-white border border-white/15 tabular-nums">
                    Foto {activePhotoIndex + 1} de {floor.photos.length}
                  </span>
                </div>

                <!-- Pie de foto superpuesto -->
                <div class="absolute bottom-3 left-3 right-3 flex flex-wrap items-end justify-between gap-2 text-white">
                  <div>
                    <div class="text-sm font-semibold">{activePhoto.title}</div>
                    <div class="text-xs text-zinc-300 flex items-center gap-3 tabular-nums mt-0.5">
                      <span class="inline-flex items-center gap-1">
                        <MapPin class="w-3.5 h-3.5 text-[#F5A400]" />
                        {activePhoto.location}
                      </span>
                      <span>•</span>
                      <span>{activePhoto.timestamp}</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Elementos detectados por IA + Tira de miniaturas del nivel -->
              <div class="p-4 space-y-3">
                <div class="flex flex-wrap items-center gap-1.5">
                  <span class="text-xs text-muted-foreground flex items-center gap-1 mr-1">
                    <Sparkles class="w-3.5 h-3.5 text-[#F5A400]" />
                    Elementos validados por IA:
                  </span>
                  {#each activePhoto.aiDetectedElements as elem}
                    <Badge variant="outline" class="text-[11px] font-normal bg-background border-border">
                      {elem}
                    </Badge>
                  {/each}
                </div>

                {#if floor.photos.length > 1}
                  <div class="pt-2 border-t border-border">
                    <div class="text-[11px] text-muted-foreground mb-2">
                      Selecciona otra captura de este piso:
                    </div>
                    <div class="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {#each floor.photos as thumb, idx (thumb.id)}
                        <button
                          type="button"
                          onclick={() => (activePhotoIndex = idx)}
                          class="group relative h-16 rounded-lg overflow-hidden border transition-all cursor-pointer {activePhotoIndex ===
                          idx
                            ? 'border-foreground ring-2 ring-foreground/20'
                            : 'border-border opacity-75 hover:opacity-100'}"
                        >
                          <img
                            src={thumb.thumbnailUrl}
                            alt={thumb.title}
                            class="w-full h-full object-cover"
                          />
                          <div class="absolute inset-x-0 bottom-0 bg-black/65 px-1.5 py-0.5 text-[10px] text-white truncate">
                            #{idx + 1} {thumb.title}
                          </div>
                        </button>
                      {/each}
                    </div>
                  </div>
                {/if}
              </div>
            </div>
          {/if}
        </div>
      </div>
    </div>

    <!-- 3. Pie del modal -->
    <div class="px-6 py-3.5 border-t border-border bg-muted/20 flex flex-wrap items-center justify-between gap-3 shrink-0">
      <div class="text-xs text-muted-foreground flex items-center gap-2">
        <Layers class="w-3.5 h-3.5" />
        <span>Puedes usar las flechas superiores para recorrer los demás pisos sin cerrar esta ventana.</span>
      </div>
      <div class="flex items-center gap-2">
        {#if projectStore.effectiveRole === 'admin' || projectStore.effectiveRole === 'interventor'}
          <Button href="/interventor" variant="outline" size="sm" class="h-8 text-xs" onclick={onClose}>
            Ir a calibración técnica
          </Button>
        {/if}
        <Button
          size="sm"
          onclick={onClose}
          class="h-8 text-xs bg-foreground text-background hover:bg-foreground/90 cursor-pointer"
        >
          Cerrar expediente
        </Button>
      </div>
    </div>
  </div>
</div>
