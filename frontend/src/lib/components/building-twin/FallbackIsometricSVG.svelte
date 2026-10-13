<script lang="ts">
  import { Camera, ShieldCheck, Maximize2, Layers, Compass, Sparkles } from '@lucide/svelte';
  import { Button } from '$lib/components/ui/button';
  import { Badge } from '$lib/components/ui/badge';
  import type { FloorData } from '$lib/types/twin';

  interface Props {
    floors: FloorData[];
    selectedFloorId: number | null;
    onSelect: (floor: FloorData) => void;
  }

  let { floors, selectedFloorId, onSelect }: Props = $props();

  // Piso activo en el plano 2D (por defecto Piso 4 o el seleccionado)
  let previewFloorId = $state<number>(4);
  let hoveredZone = $state<string | null>(null);

  $effect(() => {
    if (selectedFloorId !== null) {
      previewFloorId = selectedFloorId;
    }
  });

  const orderedFloors = $derived([...floors].reverse());

  const activeFloor = $derived(
    floors.find((f) => f.id === previewFloorId) ?? floors[3] ?? floors[0]
  );

  function getStatusMeta(status: FloorData['status']) {
    switch (status) {
      case 'certified':
        return {
          label: 'Certificado',
          stroke: '#10b981',
          fill: 'rgba(16, 185, 129, 0.14)',
          dotClass: 'bg-emerald-500',
          textClass: 'text-emerald-600 dark:text-emerald-400'
        };
      case 'reviewing':
        return {
          label: 'En revisión IA',
          stroke: '#f5a400',
          fill: 'rgba(245, 164, 0, 0.16)',
          dotClass: 'bg-[#F5A400]',
          textClass: 'text-amber-600 dark:text-[#F5A400]'
        };
      case 'in_progress':
        return {
          label: 'En obra',
          stroke: '#3b82f6',
          fill: 'rgba(59, 130, 246, 0.15)',
          dotClass: 'bg-blue-500',
          textClass: 'text-blue-600 dark:text-blue-400'
        };
      default:
        return {
          label: 'Proyectado',
          stroke: '#71717a',
          fill: 'rgba(113, 113, 122, 0.06)',
          dotClass: 'bg-zinc-400',
          textClass: 'text-muted-foreground'
        };
    }
  }

  const activeMeta = $derived(activeFloor ? getStatusMeta(activeFloor.status) : getStatusMeta('pending'));

  // Zonas arquitectónicas del plano de planta 2D vinculadas a las 4 actividades del piso
  const floorZones = $derived.by(() => {
    if (!activeFloor) return [];
    const lvl = activeFloor.levelNumber;
    const acts = activeFloor.activities;
    const p0 = acts[0]?.calibratedPercent ?? activeFloor.completionPercent;
    const p1 = acts[1]?.calibratedPercent ?? activeFloor.completionPercent;
    const p2 = acts[2]?.calibratedPercent ?? activeFloor.completionPercent;
    const p3 = acts[3]?.calibratedPercent ?? activeFloor.completionPercent;

    return [
      {
        id: 'apt-01',
        code: `Unidad ${lvl}01`,
        area: '84.5 m²',
        activityName: acts[0]?.name ?? 'Estructura y placa',
        percent: p0,
        x: 90,
        y: 62,
        w: 195,
        h: 122,
        camX: 145,
        camY: 118
      },
      {
        id: 'apt-02',
        code: `Unidad ${lvl}02`,
        area: '78.0 m²',
        activityName: acts[1]?.name ?? 'Mampostería y cerramientos',
        percent: p1,
        x: 365,
        y: 62,
        w: 195,
        h: 122,
        camX: 465,
        camY: 115
      },
      {
        id: 'apt-03',
        code: `Unidad ${lvl}03`,
        area: '92.0 m²',
        activityName: acts[2]?.name ?? 'Redes hidrosanitarias y eléctricas',
        percent: p2,
        x: 90,
        y: 206,
        w: 195,
        h: 122,
        camX: 165,
        camY: 265
      },
      {
        id: 'terrace-04',
        code: `Unidad ${lvl}04 + Balcón`,
        area: '88.5 m²',
        activityName: acts[3]?.name ?? 'Acabados y ventanería',
        percent: p3,
        x: 365,
        y: 206,
        w: 195,
        h: 122,
        camX: 485,
        camY: 270
      }
    ];
  });
</script>

<div class="w-full h-full pt-16 pb-14 px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch overflow-y-auto lg:overflow-hidden">
  <!-- Columna Izquierda (4 cols): Selector de Nivel en Corte Vertical con Desplazador Estilizado -->
  <div class="lg:col-span-4 min-h-0 flex flex-col justify-between bg-muted/20 rounded-xl border border-border p-3.5 overflow-hidden">
    <div class="flex items-center justify-between px-1 pb-2.5 border-b border-border shrink-0">
      <div>
        <h4 class="text-xs font-semibold text-foreground flex items-center gap-1.5">
          <Layers class="w-3.5 h-3.5 text-muted-foreground" />
          <span>Corte vertical de niveles</span>
        </h4>
        <p class="text-[11px] text-muted-foreground">
          Elige un piso para ver su plano de planta 2D
        </p>
      </div>
      <span class="text-[11px] text-muted-foreground tabular-nums">8 plantas</span>
    </div>

    <!-- Lista vertical con desplazador acorde al tema de la aplicación -->
    <div class="flex-1 min-h-0 overflow-y-auto pr-1.5 my-2 space-y-1.5">
      {#each orderedFloors as floor (floor.id)}
        {@const isCurrent = activeFloor?.id === floor.id}
        {@const meta = getStatusMeta(floor.status)}
        {@const elevation = (floor.levelNumber * 3.2).toFixed(1)}

        <div
          class="group relative rounded-lg border transition-all flex items-center justify-between gap-2 p-2 {isCurrent
            ? 'bg-accent border-foreground/35 shadow-xs'
            : 'bg-card/75 border-border hover:bg-accent/40'}"
        >
          {#if isCurrent}
            <span class="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r bg-[#F5A400]"></span>
          {/if}
          <button
            type="button"
            onclick={() => (previewFloorId = floor.id)}
            class="flex-1 text-left min-w-0 flex items-center gap-2.5 cursor-pointer pl-1"
          >
            <!-- Indicador visual de cota y estado -->
            <div class="w-11 shrink-0 text-right pr-2 border-r border-border tabular-nums">
              <div class="text-[11px] font-semibold text-foreground">P{floor.levelNumber}</div>
              <div class="text-[9px] text-muted-foreground">+{elevation}m</div>
            </div>

            <div class="min-w-0 flex-1 space-y-1">
              <div class="flex items-center justify-between gap-1.5">
                <span class="text-xs font-medium text-foreground truncate">
                  {floor.name.replace(/^Piso \d+ -\s*/, '')}
                </span>
                <span class="text-xs font-semibold text-foreground tabular-nums shrink-0">
                  {floor.completionPercent}%
                </span>
              </div>

              <!-- Mini barra de progreso tipo losa -->
              <div class="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  class="h-full rounded-full transition-all duration-300 {meta.dotClass}"
                  style="width: {floor.completionPercent}%"
                ></div>
              </div>
            </div>
          </button>

          <!-- Botón directo para abrir el modal grande del piso -->
          <button
            type="button"
            onclick={() => onSelect(floor)}
            title="Abrir expediente completo en pantalla amplia"
            class="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-background border border-transparent hover:border-border transition-colors cursor-pointer shrink-0"
          >
            <Maximize2 class="w-3.5 h-3.5" />
          </button>
        </div>
      {/each}
    </div>

    {#if activeFloor}
      <div class="pt-2.5 border-t border-border flex items-center justify-between gap-2 shrink-0">
        <span class="text-[11px] text-muted-foreground">
          Inspeccionando <strong class="text-foreground font-medium">Piso {activeFloor.levelNumber}</strong>
        </span>
        <Button
          size="sm"
          onclick={() => onSelect(activeFloor)}
          class="h-7 px-3 text-xs bg-foreground text-background hover:bg-foreground/90 cursor-pointer"
        >
          Abrir ficha completa
        </Button>
      </div>
    {/if}
  </div>

  <!-- Columna Derecha (8 cols): Plano de Planta Arquitectónica 2D (Blueprint CAD Interactivo) -->
  {#if activeFloor}
    <div class="lg:col-span-8 flex flex-col justify-between bg-muted/15 rounded-xl border border-border p-4 relative overflow-hidden">
      <!-- Cabecera técnica del Plano de Planta -->
      <div class="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-border">
        <div class="flex items-center gap-2.5">
          <Badge variant="outline" class="text-[11px] font-medium bg-background text-foreground border-border gap-1.5">
            <span class="w-1.5 h-1.5 rounded-full {activeMeta.dotClass}"></span>
            <span>{activeMeta.label}</span>
          </Badge>
          <div>
            <h3 class="text-sm font-semibold text-foreground">
              Plano de planta arquitectónica — {activeFloor.name}
            </h3>
            <p class="text-[11px] text-muted-foreground tabular-nums">
              Cota +{(activeFloor.levelNumber * 3.2).toFixed(1)} m • Área bruta de placa: 385.0 m² • Haz clic en cualquier unidad para abrir el modal detallado
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onclick={() => onSelect(activeFloor)}
            class="h-7 px-2.5 text-xs gap-1.5 cursor-pointer"
          >
            <Maximize2 class="w-3.5 h-3.5" />
            <span>Ver expediente en modal</span>
          </Button>
        </div>
      </div>

      <!-- Lienzo SVG del Plano de Planta Arquitectónica 2D (Ejes A-D, 1-3, Unidades, Punto Fijo y Cámaras) -->
      <div class="flex-1 flex items-center justify-center py-2">
        <svg
          viewBox="0 0 650 380"
          class="w-full h-full max-h-[345px]"
          role="img"
          aria-label="Plano arquitectónico 2D de la planta"
        >
          <defs>
            <pattern id="cadGrid2D" width="20" height="20" patternUnits="userSpaceOnUse">
              <path
                d="M 20 0 L 0 0 0 20"
                fill="none"
                stroke="currentColor"
                stroke-width="0.5"
                class="text-border/55"
              />
            </pattern>
          </defs>

          <!-- Fondo reticulado CAD -->
          <rect x="45" y="28" width="560" height="330" rx="8" fill="url(#cadGrid2D)" />

          <!-- Ejes Estructurales Horizontales (A, B, C, D) y Cotas Superiores -->
          {#each [
            { label: 'A', x: 90 },
            { label: 'B', x: 285 },
            { label: 'C', x: 365 },
            { label: 'D', x: 560 }
          ] as axis}
            <line
              x1={axis.x}
              y1="26"
              x2={axis.x}
              y2="362"
              stroke="currentColor"
              stroke-dasharray="4 4"
              stroke-width="1"
              class="text-border"
            />
            <circle
              cx={axis.x}
              cy="16"
              r="9"
              fill="none"
              stroke="currentColor"
              stroke-width="1.2"
              class="text-muted-foreground"
            />
            <text
              x={axis.x}
              y="19.5"
              text-anchor="middle"
              class="text-[10px] font-semibold fill-foreground"
            >
              {axis.label}
            </text>
          {/each}

          <!-- Cotas de dimensión horizontal (6.00m | 2.40m | 6.00m = 18.40m) -->
          <text x="187" y="42" text-anchor="middle" class="text-[9px] fill-muted-foreground tabular-nums">
            6.80 m
          </text>
          <text x="325" y="42" text-anchor="middle" class="text-[9px] fill-muted-foreground tabular-nums">
            2.80 m (Núcleo)
          </text>
          <text x="462" y="42" text-anchor="middle" class="text-[9px] fill-muted-foreground tabular-nums">
            6.80 m
          </text>

          <!-- Ejes Estructurales Verticales (1, 2, 3) -->
          {#each [
            { label: '1', y: 62 },
            { label: '2', y: 195 },
            { label: '3', y: 328 }
          ] as vAxis}
            <line
              x1="42"
              y1={vAxis.y}
              x2="605"
              y2={vAxis.y}
              stroke="currentColor"
              stroke-dasharray="4 4"
              stroke-width="1"
              class="text-border"
            />
            <circle
              cx="26"
              cy={vAxis.y}
              r="9"
              fill="none"
              stroke="currentColor"
              stroke-width="1.2"
              class="text-muted-foreground"
            />
            <text
              x="26"
              y={vAxis.y + 3.5}
              text-anchor="middle"
              class="text-[10px] font-semibold fill-foreground"
            >
              {vAxis.label}
            </text>
          {/each}

          <!-- Perímetro Exterior de la Losa Estructural del Piso -->
          <rect
            x="84"
            y="56"
            width="482"
            height="278"
            rx="4"
            fill="currentColor"
            class="text-card"
            stroke={activeMeta.stroke}
            stroke-width="2.5"
          />

          <!-- Balcón Frontal en Voladizo (Sur) -->
          <rect
            x="120"
            y="334"
            width="410"
            height="20"
            rx="2"
            fill={activeMeta.fill}
            stroke={activeMeta.stroke}
            stroke-width="1.5"
            stroke-dasharray={activeFloor.status === 'pending' ? '4 2' : 'none'}
          />
          <text x="325" y="347" text-anchor="middle" class="text-[9px] font-medium fill-muted-foreground">
            Terraza / Balcón corrido en voladizo (Baranda de vidrio templado)
          </text>

          <!-- Núcleo Central Rígido: Ascensores 1 y 2 + Escaleras Presurizadas + Ductos -->
          <g>
            <rect
              x="285"
              y="62"
              width="80"
              height="266"
              fill="currentColor"
              class="text-muted/60"
              stroke="currentColor"
              stroke-width="1.5"
            />
            <!-- Foso Ascensor 1 -->
            <rect x="295" y="75" width="26" height="32" fill="none" stroke="currentColor" stroke-width="1.2" class="text-muted-foreground" />
            <line x1="295" y1="75" x2="321" y2="107" stroke="currentColor" stroke-width="0.8" class="text-muted-foreground" />
            <line x1="321" y1="75" x2="295" y2="107" stroke="currentColor" stroke-width="0.8" class="text-muted-foreground" />

            <!-- Foso Ascensor 2 -->
            <rect x="329" y="75" width="26" height="32" fill="none" stroke="currentColor" stroke-width="1.2" class="text-muted-foreground" />
            <line x1="329" y1="75" x2="355" y2="107" stroke="currentColor" stroke-width="0.8" class="text-muted-foreground" />
            <line x1="355" y1="75" x2="329" y2="107" stroke="currentColor" stroke-width="0.8" class="text-muted-foreground" />

            <text x="325" y="122" text-anchor="middle" class="text-[8.5px] font-medium fill-muted-foreground">
              Ascensores
            </text>

            <!-- Lobby / Hall de circulación del piso -->
            <rect x="293" y="132" width="64" height="85" rx="2" fill="none" stroke="currentColor" stroke-dasharray="2 2" stroke-width="1" class="text-border" />
            <text x="325" y="172" text-anchor="middle" class="text-[9px] font-semibold fill-foreground">
              Hall P{activeFloor.levelNumber}
            </text>
            <text x="325" y="185" text-anchor="middle" class="text-[8px] fill-muted-foreground tabular-nums">
              +{(activeFloor.levelNumber * 3.2).toFixed(1)}m
            </text>

            <!-- Escaleras presurizadas (con peldaños arquitectónicos) -->
            <rect x="295" y="230" width="60" height="82" fill="none" stroke="currentColor" stroke-width="1.2" class="text-muted-foreground" />
            {#each [242, 252, 262, 272, 282, 292, 302] as stepY}
              <line x1="295" y1={stepY} x2="355" y2={stepY} stroke="currentColor" stroke-width="0.8" class="text-muted-foreground/70" />
            {/each}
            <text x="325" y="322" text-anchor="middle" class="text-[8px] font-medium fill-muted-foreground">
              Punto fijo escaleras
            </text>
          </g>

          <!-- Las 4 Unidades / Zonas Interactivas del Piso -->
          {#each floorZones as zone, zIdx (zone.id)}
            {@const isZoneHovered = hoveredZone === zone.id}
            {@const zoneColor =
              zone.percent >= 100
                ? '#10b981'
                : zone.percent >= 50
                  ? '#f5a400'
                  : zone.percent > 0
                    ? '#3b82f6'
                    : '#71717a'}

            <!-- svelte-ignore a11y_click_events_have_key_events -->
            <!-- svelte-ignore a11y_no_static_element_interactions -->
            <g
              class="cursor-pointer transition-all"
              onmouseenter={() => (hoveredZone = zone.id)}
              onmouseleave={() => (hoveredZone = null)}
              onclick={() => onSelect(activeFloor)}
            >
              <!-- Fondo de la unidad residencial -->
              <rect
                x={zone.x}
                y={zone.y}
                width={zone.w}
                height={zone.h}
                rx="3"
                fill={isZoneHovered ? 'rgba(245, 164, 0, 0.16)' : activeMeta.fill}
                stroke={isZoneHovered ? '#f5a400' : zoneColor}
                stroke-width={isZoneHovered ? '2.2' : '1.4'}
                stroke-dasharray={activeFloor.status === 'pending' && !isZoneHovered ? '5 3' : 'none'}
              />

              <!-- Divisiones arquitectónicas internas (muros de mampostería esquemáticos) -->
              <line
                x1={zone.x + zone.w * 0.52}
                y1={zone.y}
                x2={zone.x + zone.w * 0.52}
                y2={zone.y + zone.h * 0.62}
                stroke={zoneColor}
                stroke-opacity="0.45"
                stroke-width="1.2"
              />
              <line
                x1={zone.x}
                y1={zone.y + zone.h * 0.62}
                x2={zone.x + zone.w * 0.78}
                y2={zone.y + zone.h * 0.62}
                stroke={zoneColor}
                stroke-opacity="0.45"
                stroke-width="1.2"
              />

              <!-- Barra interna proporcional al porcentaje de avance de esa partida en el piso -->
              <rect
                x={zone.x + 10}
                y={zone.y + zone.h - 16}
                width={zone.w - 20}
                height="5"
                rx="2.5"
                fill="currentColor"
                class="text-muted"
              />
              <rect
                x={zone.x + 10}
                y={zone.y + zone.h - 16}
                width={Math.max(0, ((zone.w - 20) * zone.percent) / 100)}
                height="5"
                rx="2.5"
                fill={zoneColor}
              />

              <!-- Textos técnicos de la unidad -->
              <text
                x={zone.x + 12}
                y={zone.y + 22}
                class="text-[11px] font-semibold fill-foreground"
              >
                {zone.code}
              </text>
              <text
                x={zone.x + zone.w - 12}
                y={zone.y + 22}
                text-anchor="end"
                class="text-[11px] font-semibold tabular-nums fill-foreground"
              >
                {zone.percent}%
              </text>

              <text
                x={zone.x + 12}
                y={zone.y + 37}
                class="text-[9.5px] fill-muted-foreground tabular-nums"
              >
                Área: {zone.area}
              </text>

              <text
                x={zone.x + 12}
                y={zone.y + zone.h - 24}
                class="text-[9.5px] font-medium fill-muted-foreground"
              >
                {zone.activityName}
              </text>

              <!-- Pin de Cámara si el piso tiene fotos asociadas a esta zona -->
              {#if activeFloor.photos[zIdx]}
                <g transform="translate({zone.camX}, {zone.camY})">
                  <circle
                    cx="0"
                    cy="0"
                    r="10"
                    fill="#18181b"
                    stroke="#f5a400"
                    stroke-width="1.5"
                  />
                  <text
                    x="0"
                    y="3.5"
                    text-anchor="middle"
                    class="text-[8.5px] font-semibold fill-[#F5A400] tabular-nums"
                  >
                    F{zIdx + 1}
                  </text>
                </g>
              {/if}
            </g>
          {/each}

          <!-- Columnas estructurales en las intersecciones de los ejes (■) -->
          {#each [90, 285, 365, 560] as cx}
            {#each [62, 195, 328] as cy}
              <rect
                x={cx - 5}
                y={cy - 5}
                width="10"
                height="10"
                rx="1.5"
                fill="currentColor"
                class="text-foreground"
              />
            {/each}
          {/each}

          <!-- Rosa de los vientos / Norte arquitectónico -->
          <g transform="translate(618, 56)">
            <circle cx="0" cy="0" r="14" fill="none" stroke="currentColor" stroke-width="1" class="text-border" />
            <polygon points="0,-10 4,6 0,2 -4,6" fill="currentColor" class="text-foreground" />
            <text x="0" y="-17" text-anchor="middle" class="text-[9px] font-semibold fill-muted-foreground">
              N
            </text>
          </g>
        </svg>
      </div>

      <!-- Pie del plano 2D con leyendas de columnas y fotos -->
      <div class="pt-2.5 border-t border-border flex flex-wrap items-center justify-between gap-2 text-[11px] text-muted-foreground">
        <div class="flex flex-wrap items-center gap-4">
          <span class="inline-flex items-center gap-1.5">
            <span class="w-2.5 h-2.5 bg-foreground inline-block rounded-[2px]"></span>
            <span>Columnas estructurales (12 ejes)</span>
          </span>
          <span class="inline-flex items-center gap-1.5">
            <span class="w-3.5 h-3.5 rounded-full bg-zinc-900 border border-[#F5A400] text-[#F5A400] text-[8px] font-bold inline-flex items-center justify-center">
              F1
            </span>
            <span>Punto de captura fotográfica ({activeFloor.photos.length} en este nivel)</span>
          </span>
        </div>

        <button
          type="button"
          onclick={() => onSelect(activeFloor)}
          class="text-xs font-medium text-foreground hover:underline underline-offset-4 cursor-pointer"
        >
          Abrir modal con {activeFloor.photos.length} fotos y desglose IA →
        </button>
      </div>
    </div>
  {/if}
</div>
