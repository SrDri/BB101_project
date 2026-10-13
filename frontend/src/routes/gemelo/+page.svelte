<script lang="ts">
  import BuildingViewer from '$lib/components/building-twin/BuildingViewer.svelte';
  import KpiStrip from '$lib/components/dashboard/KpiStrip.svelte';
  import ProjectMapCard from '$lib/components/dashboard/ProjectMapCard.svelte';
  import { Button } from '$lib/components/ui/button';
  import { Badge } from '$lib/components/ui/badge';
  import { Card, CardContent } from '$lib/components/ui/card';
  import { Camera, ShieldCheck, Maximize2, Layers } from '@lucide/svelte';
  import { projectStore } from '$lib/stores/projectState.svelte';

  let cut = $derived(projectStore.activeCut);

  function getStatusLabel(status: string) {
    switch (status) {
      case 'certified':
        return { label: 'Certificado', dot: 'bg-emerald-500' };
      case 'reviewing':
        return { label: 'En revisión IA', dot: 'bg-[#F5A400]' };
      case 'in_progress':
        return { label: 'En ejecución', dot: 'bg-blue-500' };
      default:
        return { label: 'Proyectado', dot: 'bg-zinc-400' };
    }
  }
</script>

<div class="space-y-6 w-full">
  <!-- Cabecera de la sección con ortografía natural y badges sobrios -->
  <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border">
    <div class="space-y-1">
      <div class="flex flex-wrap items-center gap-2">
        <Badge variant="outline" class="text-[11px] font-medium bg-muted/60 text-foreground border-border gap-1.5">
          <span
            class="w-1.5 h-1.5 rounded-full {cut.lifecycleStatus === 'in_progress'
              ? 'bg-emerald-500'
              : cut.lifecycleStatus === 'completed'
                ? 'bg-blue-500'
                : 'bg-zinc-400'}"
          ></span>
          <span>
            {cut.lifecycleStatus === 'in_progress'
              ? 'En ejecución'
              : cut.lifecycleStatus === 'completed'
                ? 'Obra finalizada'
                : 'Próximo inicio'}
          </span>
        </Badge>
        <span class="text-xs text-muted-foreground tabular-nums">
          {cut.fiduciaryTrustCode} • {cut.city}
        </span>
      </div>

      <h1 class="text-2xl font-semibold text-foreground tracking-tight">
        Vista 3D — {cut.projectName}
      </h1>
      <p class="text-xs text-muted-foreground">
        Selecciona cualquier nivel en la vista 3D, en el render o en el plano de planta 2D para abrir el expediente completo del piso.
      </p>
    </div>

    <div class="flex flex-wrap items-center gap-2">
      <Button href="/evidencias" variant="outline" size="sm" class="text-xs h-8">
        Evidencias fotográficas
      </Button>
      <Button href="/proyectos" variant="outline" size="sm" class="text-xs h-8">
        Cambiar de proyecto
      </Button>

      {#if projectStore.effectiveRole === 'admin' || projectStore.effectiveRole === 'interventor'}
        <Button
          href="/interventor"
          size="sm"
          class="h-8 bg-foreground text-background hover:bg-foreground/90 text-xs font-medium"
        >
          Calibrar corte #{cut.number}
        </Button>
      {/if}
    </div>
  </div>

  <!-- Indicadores del proyecto activo -->
  <KpiStrip />

  <!-- Visor Principal a Ancho Completo (Vista 3D | Render | Planta 2D) -->
  <div class="w-full">
    <BuildingViewer />
  </div>

  <!-- Sección Inferior: Matriz Resumen por Nivel (7 cols) + Ubicación del Proyecto Reubicada (5 cols) -->
  <div class="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">
    <Card class="xl:col-span-7 bg-card border-border flex flex-col justify-between">
      <CardContent class="p-5 space-y-4">
        <div class="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-border">
          <div>
            <h2 class="text-sm font-semibold text-foreground flex items-center gap-2">
              <Layers class="w-4 h-4 text-muted-foreground" />
              <span>Matriz de estado por nivel estructural</span>
            </h2>
            <p class="text-xs text-muted-foreground">
              Haz clic en cualquier fila para abrir el modal detallado del piso con fotos y partidas
            </p>
          </div>
          <Badge variant="outline" class="text-[11px] font-normal bg-muted/50 border-border tabular-nums">
            {projectStore.floors.filter((f) => f.status === 'certified').length} de {projectStore.floors.length} pisos certificados
          </Badge>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse text-xs">
            <thead>
              <tr class="border-b border-border text-muted-foreground">
                <th class="py-2 pr-3 font-medium">Nivel</th>
                <th class="py-2 px-3 font-medium">Estado</th>
                <th class="py-2 px-3 font-medium">Avance real</th>
                <th class="py-2 px-3 font-medium">Evidencias</th>
                <th class="py-2 pl-3 text-right font-medium">Expediente</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-border/70">
              {#each [...projectStore.floors].reverse() as floor (floor.id)}
                {@const st = getStatusLabel(floor.status)}
                <tr
                  class="hover:bg-muted/40 transition-colors cursor-pointer"
                  onclick={() => projectStore.selectFloor(floor.id)}
                >
                  <td class="py-2.5 pr-3 font-medium text-foreground">
                    <div class="flex items-center gap-2">
                      <span class="tabular-nums text-muted-foreground">P{floor.levelNumber}</span>
                      <span class="truncate max-w-[200px]">{floor.name.replace(/^Piso \d+ -\s*/, '')}</span>
                    </div>
                  </td>
                  <td class="py-2.5 px-3">
                    <span class="inline-flex items-center gap-1.5 text-[11px]">
                      <span class="w-1.5 h-1.5 rounded-full {st.dot}"></span>
                      <span>{st.label}</span>
                    </span>
                  </td>
                  <td class="py-2.5 px-3 tabular-nums">
                    <div class="flex items-center gap-2">
                      <div class="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div class="h-full rounded-full {st.dot}" style="width: {floor.completionPercent}%"></div>
                      </div>
                      <span class="font-medium text-foreground">{floor.completionPercent}%</span>
                    </div>
                  </td>
                  <td class="py-2.5 px-3 tabular-nums text-muted-foreground">
                    <span class="inline-flex items-center gap-1">
                      <Camera class="w-3.5 h-3.5" />
                      {floor.photos.length}
                    </span>
                  </td>
                  <td class="py-2.5 pl-3 text-right">
                    <button
                      type="button"
                      onclick={(e) => {
                        e.stopPropagation();
                        projectStore.selectFloor(floor.id);
                      }}
                      class="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      <span>Abrir modal</span>
                      <Maximize2 class="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>

    <div class="xl:col-span-5">
      <ProjectMapCard
        projectName={cut.projectName}
        address={cut.address}
        city={cut.city}
        heightClass="h-[340px]"
      />
    </div>
  </div>
</div>
