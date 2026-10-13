<script lang="ts">
  import { Camera, CheckCircle2, Sparkles, Eye } from '@lucide/svelte';
  import { Badge } from '$lib/components/ui/badge';
  import type { FloorData } from '$lib/types/twin';

  interface Props {
    floors: FloorData[];
    selectedFloorId: number | null;
    onSelect: (floor: FloorData) => void;
  }

  let { floors, selectedFloorId, onSelect }: Props = $props();

  let hoveredId = $state<number | null>(null);
  let renderMode = $state<'hybrid' | 'full_render'>('hybrid');

  // Orden descendente (Piso 8 arriba -> Piso 1 abajo)
  const orderedFloors = $derived([...floors].reverse());

  function getStatusMeta(status: FloorData['status']) {
    switch (status) {
      case 'certified':
        return {
          label: 'Certificado',
          stroke: '#10b981',
          fill: 'rgba(16, 185, 129, 0.18)',
          dotClass: 'bg-emerald-500'
        };
      case 'reviewing':
        return {
          label: 'En revisión IA',
          stroke: '#f5a400',
          fill: 'rgba(245, 164, 0, 0.22)',
          dotClass: 'bg-[#F5A400]'
        };
      case 'in_progress':
        return {
          label: 'En obra',
          stroke: '#3b82f6',
          fill: 'rgba(59, 130, 246, 0.20)',
          dotClass: 'bg-blue-500'
        };
      default:
        return {
          label: 'Proyectado (Outline)',
          stroke: '#a1a1aa',
          fill: 'rgba(255, 255, 255, 0.04)',
          dotClass: 'bg-zinc-400'
        };
    }
  }

  // Cálculo del porcentaje de altura aún en etapa proyectada para el recorte híbrido
  const unbuiltTopRatio = $derived.by(() => {
    const builtFloors = floors.filter((f) => f.status !== 'pending').length;
    const total = floors.length || 8;
    return Math.max(0, Math.min(100, ((total - builtFloors) / total) * 100));
  });
</script>

<div class="w-full h-full pt-16 pb-14 px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch overflow-y-auto lg:overflow-hidden">
  <!-- Columna Izquierda (8 cols): Render Arquitectónico Fotorrealista con Outline Interactivo por Piso -->
  <div class="lg:col-span-8 relative rounded-xl border border-border overflow-hidden bg-zinc-950 flex flex-col justify-between min-h-[430px] shadow-inner">
    <!-- Capa 1: Imagen de Render Arquitectónico Fotorrealista de Torre Residencial -->
    <div class="absolute inset-0">
      <img
        src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1400&q=85"
        alt="Render arquitectónico del proyecto"
        class="w-full h-full object-cover object-center transition-all duration-500 {renderMode === 'hybrid'
          ? 'brightness-95 contrast-105'
          : 'brightness-100'}"
      />
      <!-- Gradiente arquitectónico oscuro para contraste de cotas y outlines técnicos -->
      <div class="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-zinc-950/35 to-zinc-950/65"></div>
      <div class="absolute inset-0 bg-gradient-to-r from-zinc-950/60 via-transparent to-zinc-950/60"></div>
    </div>

    <!-- Barra flotante interna para alternar entre Avance Híbrido (Outline + Render) y Render 100% -->
    <div class="relative z-10 flex flex-wrap items-center justify-between gap-2 px-4 pt-3">
      <div class="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-zinc-900/85 border border-white/15 backdrop-blur-md text-[11px] text-zinc-200">
        <Sparkles class="w-3.5 h-3.5 text-[#F5A400]" />
        <span>
          {renderMode === 'hybrid'
            ? 'Modo híbrido: pisos construidos a color y proyectados en outline arquitectónico'
            : 'Render comercial terminado con contornos interactivos por piso'}
        </span>
      </div>

      <div class="inline-flex items-center gap-1 bg-zinc-900/90 border border-white/15 p-0.5 rounded-md backdrop-blur-md">
        <button
          type="button"
          onclick={() => (renderMode = 'hybrid')}
          class="px-2.5 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer {renderMode === 'hybrid'
            ? 'bg-white text-zinc-950'
            : 'text-zinc-300 hover:text-white'}"
        >
          Avance vs. Outline
        </button>
        <button
          type="button"
          onclick={() => (renderMode = 'full_render')}
          class="px-2.5 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer {renderMode === 'full_render'
            ? 'bg-white text-zinc-950'
            : 'text-zinc-300 hover:text-white'}"
        >
          Render 100%
        </button>
      </div>
    </div>

    <!-- Capa 2: Malla Vectorial en Perspectiva Arquitectónica sobre el Render -->
    <div class="relative z-10 flex-1 flex items-center justify-center px-2 py-1">
      <svg
        viewBox="0 0 680 420"
        class="w-full h-full max-h-[375px] select-none"
        role="img"
        aria-label="Contorno interactivo sobre render arquitectónico"
      >
        <defs>
          <!-- Patrón de boceto técnico para niveles proyectados en modo híbrido -->
          <pattern id="blueprintHatch" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
            <line x1="0" y1="0" x2="0" y2="8" stroke="rgba(255,255,255,0.16)" stroke-width="1" />
          </pattern>
        </defs>

        <!-- Líneas guía de ejes arquitectónicos en perspectiva -->
        <line x1="175" y1="18" x2="175" y2="395" stroke="rgba(255,255,255,0.18)" stroke-dasharray="3 3" stroke-width="1" />
        <line x1="405" y1="12" x2="405" y2="395" stroke="rgba(255,255,255,0.22)" stroke-dasharray="3 3" stroke-width="1" />
        <line x1="535" y1="26" x2="535" y2="395" stroke="rgba(255,255,255,0.18)" stroke-dasharray="3 3" stroke-width="1" />

        <!-- Remate de cubierta / Penthouse outline en perspectiva de 2 puntos -->
        <g class="opacity-75">
          <!-- Cara frontal remate -->
          <polygon
            points="225,28 405,16 405,42 225,50"
            fill="rgba(24,24,27,0.55)"
            stroke="rgba(255,255,255,0.55)"
            stroke-width="1.2"
            stroke-dasharray="4 2"
          />
          <!-- Cara lateral derecha remate -->
          <polygon
            points="405,16 505,28 505,52 405,42"
            fill="rgba(24,24,27,0.65)"
            stroke="rgba(255,255,255,0.45)"
            stroke-width="1.2"
            stroke-dasharray="4 2"
          />
          <text x="412" y="13" class="text-[9px] fill-zinc-300 font-medium">
            Cubierta / Equipos (+27.5m)
          </text>
        </g>

        <!-- Pisos en perspectiva de 2 puntos alineados con la fachada del render -->
        {#each orderedFloors as floor, idx (floor.id)}
          {@const yFrontTop = 50 + idx * 41}
          {@const yFrontBot = yFrontTop + 39}
          {@const yCornerTop = 42 + idx * 41}
          {@const yCornerBot = yCornerTop + 39}
          {@const yRightTop = 54 + idx * 41}
          {@const yRightBot = yRightTop + 39}
          {@const isSelected = selectedFloorId === floor.id}
          {@const isHovered = hoveredId === floor.id}
          {@const isPending = floor.status === 'pending'}
          {@const meta = getStatusMeta(floor.status)}
          {@const elevationMeters = (floor.levelNumber * 3.2).toFixed(1)}

          <!-- Polígonos en perspectiva: Fachada frontal (175 -> 405) y Fachada lateral (405 -> 535) -->
          <!-- svelte-ignore a11y_click_events_have_key_events -->
          <!-- svelte-ignore a11y_no_static_element_interactions -->
          <g
            class="cursor-pointer transition-all duration-150"
            onmouseenter={() => (hoveredId = floor.id)}
            onmouseleave={() => (hoveredId = null)}
            onclick={() => onSelect(floor)}
          >
            <!-- 1. Línea de cota izquierda -->
            <line
              x1="108"
              y1={yFrontTop + 18}
              x2="170"
              y2={yFrontTop + 18}
              stroke={isSelected || isHovered ? '#f5a400' : 'rgba(255,255,255,0.28)'}
              stroke-width={isSelected || isHovered ? '1.5' : '1'}
              stroke-dasharray={isPending ? '2 2' : 'none'}
            />
            <text
              x="102"
              y={yFrontTop + 21}
              text-anchor="end"
              class="text-[10px] tabular-nums {isSelected || isHovered
                ? 'fill-[#F5A400] font-semibold'
                : 'fill-zinc-300'}"
            >
              +{elevationMeters}m • P{floor.levelNumber}
            </text>

            <!-- 2. Fachada Frontal Principal (en perspectiva hacia la arista central x=405) -->
            <polygon
              points="175,{yFrontTop} 405,{yCornerTop} 405,{yCornerBot} 175,{yFrontBot}"
              fill={isSelected || isHovered
                ? meta.fill
                : renderMode === 'hybrid' && isPending
                  ? 'rgba(18, 18, 22, 0.76)'
                  : 'rgba(18, 18, 22, 0.12)'}
              stroke={isSelected || isHovered
                ? '#f5a400'
                : renderMode === 'hybrid' && isPending
                  ? 'rgba(255,255,255,0.65)'
                  : meta.stroke}
              stroke-width={isSelected || isHovered ? '2.4' : isPending ? '1.3' : '1.5'}
              stroke-dasharray={isPending && !isSelected && !isHovered ? '5 3' : 'none'}
            />

            <!-- Patrón de boceto arquitectónico si el piso aún es proyectado en modo híbrido -->
            {#if renderMode === 'hybrid' && isPending}
              <polygon
                points="175,{yFrontTop} 405,{yCornerTop} 405,{yCornerBot} 175,{yFrontBot}"
                fill="url(#blueprintHatch)"
              />
            {/if}

            <!-- 3. Fachada Lateral Derecha (en perspectiva desde la arista central x=405 hasta x=535) -->
            <polygon
              points="405,{yCornerTop} 535,{yRightTop} 535,{yRightBot} 405,{yCornerBot}"
              fill={isSelected || isHovered
                ? meta.fill
                : renderMode === 'hybrid' && isPending
                  ? 'rgba(12, 12, 16, 0.82)'
                  : 'rgba(12, 12, 16, 0.22)'}
              stroke={isSelected || isHovered
                ? '#f5a400'
                : renderMode === 'hybrid' && isPending
                  ? 'rgba(255,255,255,0.5)'
                  : meta.stroke}
              stroke-width={isSelected || isHovered ? '2.2' : '1.3'}
              stroke-dasharray={isPending && !isSelected && !isHovered ? '5 3' : 'none'}
            />

            <!-- 4. Balcón en voladizo y divisiones de ventanería (para realismo arquitectónico del outline) -->
            <polygon
              points="210,{yFrontBot - 15} 345,{yCornerBot - 15} 345,{yCornerBot - 2} 210,{yFrontBot - 2}"
              fill={isSelected || isHovered ? 'rgba(245, 164, 0, 0.25)' : 'rgba(255,255,255,0.06)'}
              stroke={isSelected || isHovered ? '#f5a400' : 'rgba(255,255,255,0.38)'}
              stroke-width="1"
            />
            <!-- Columnas / Mullions verticales internos del nivel -->
            <line
              x1="255"
              y1={yFrontTop + 2}
              x2="255"
              y2={yFrontBot - 2}
              stroke="rgba(255,255,255,0.28)"
              stroke-width="1"
            />
            <line
              x1="335"
              y1={yCornerTop + 4}
              x2="335"
              y2={yCornerBot - 2}
              stroke="rgba(255,255,255,0.28)"
              stroke-width="1"
            />
            <line
              x1="468"
              y1={yCornerTop + 6}
              x2="468"
              y2={yCornerBot + 6}
              stroke="rgba(255,255,255,0.22)"
              stroke-width="1"
            />

            <!-- 5. Etiqueta sobre el render (Estado y % de avance) -->
            <g transform="translate(548, {yRightTop + 14})">
              <rect
                x="0"
                y="-11"
                width="116"
                height="20"
                rx="4"
                fill={isSelected || isHovered ? '#f5a400' : 'rgba(24, 24, 27, 0.85)'}
                stroke={isSelected || isHovered ? '#f5a400' : 'rgba(255,255,255,0.18)'}
                stroke-width="1"
              />
              <text
                x="8"
                y="2"
                class="text-[10px] font-medium tabular-nums {isSelected || isHovered
                  ? 'fill-zinc-950 font-semibold'
                  : 'fill-zinc-200'}"
              >
                {floor.completionPercent}% • {meta.label.split(' ')[0]}
              </text>
            </g>
          </g>
        {/each}
      </svg>
    </div>

    <!-- Pie del render -->
    <div class="relative z-10 px-4 pb-3 flex items-center justify-between text-[11px] text-zinc-300">
      <span>Haz clic sobre cualquier contorno de piso en el render para abrir el expediente técnico</span>
      <span class="tabular-nums text-zinc-400">Perspectiva arquitectónica 2 puntos</span>
    </div>
  </div>

  <!-- Columna Derecha (4 cols): Selector rápido de niveles del render -->
  <div class="lg:col-span-4 min-h-0 flex flex-col justify-between bg-muted/20 rounded-xl border border-border p-3.5 overflow-hidden">
    <div class="flex items-center justify-between px-1 pb-2.5 border-b border-border shrink-0">
      <div>
        <h4 class="text-xs font-semibold text-foreground">Capas del render por piso</h4>
        <p class="text-[11px] text-muted-foreground">Pasa el cursor para iluminar el outline</p>
      </div>
      <Badge variant="outline" class="text-[10px] font-normal bg-background border-border tabular-nums">
        {floors.filter((f) => f.status !== 'pending').length}/{floors.length} activos
      </Badge>
    </div>

    <div class="flex-1 min-h-0 overflow-y-auto pr-1.5 mt-2 space-y-1.5">
      {#each orderedFloors as floor (floor.id)}
        {@const isSelected = selectedFloorId === floor.id}
        {@const isHovered = hoveredId === floor.id}
        {@const meta = getStatusMeta(floor.status)}
        <button
          type="button"
          onmouseenter={() => (hoveredId = floor.id)}
          onmouseleave={() => (hoveredId = null)}
          onclick={() => onSelect(floor)}
          class="relative w-full text-left px-3 py-2 rounded-lg border transition-all flex items-center justify-between gap-2 cursor-pointer {isSelected ||
          isHovered
            ? 'bg-accent/80 border-foreground/30 shadow-xs'
            : 'bg-card/80 border-border hover:bg-accent/40'}"
        >
          {#if isSelected || isHovered}
            <span class="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r bg-[#F5A400]"></span>
          {/if}
          <div class="min-w-0 pl-1">
            <div class="flex items-center gap-1.5">
              <span class="w-2 h-2 rounded-full shrink-0 {meta.dotClass}"></span>
              <span class="text-xs font-medium text-foreground truncate">{floor.name}</span>
            </div>
            <div class="text-[11px] text-muted-foreground pl-3.5 flex items-center gap-2 tabular-nums">
              <span>{meta.label}</span>
              {#if floor.photos.length > 0}
                <span class="inline-flex items-center gap-0.5 text-foreground">
                  <Camera class="w-3 h-3 text-muted-foreground" />
                  {floor.photos.length}
                </span>
              {/if}
            </div>
          </div>

          <div class="text-right shrink-0 tabular-nums">
            <div class="text-xs font-semibold text-foreground">{floor.completionPercent}%</div>
            <div class="text-[10px] text-muted-foreground">Prog: {floor.scheduledPercent}%</div>
          </div>
        </button>
      {/each}
    </div>
  </div>
</div>

