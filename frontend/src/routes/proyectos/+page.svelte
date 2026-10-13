<script lang="ts">
  import { goto } from '$app/navigation';
  import { projectStore } from '$lib/stores/projectState.svelte';
  import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '$lib/components/ui/card';
  import { Button } from '$lib/components/ui/button';
  import { Badge } from '$lib/components/ui/badge';
  import type { ProjectLifecycleStatus, ProjectCut } from '$lib/types/twin';
  import { MapPin } from '@lucide/svelte';

  let filterStatus = $state<'all' | ProjectLifecycleStatus>('all');

  let filteredProjects = $derived(
    filterStatus === 'all'
      ? projectStore.projects
      : projectStore.projects.filter((p) => p.lifecycleStatus === filterStatus)
  );

  let totalPortfolioBudget = $derived(
    projectStore.projects.reduce((acc, p) => acc + p.totalBudgetCOP, 0)
  );

  let totalPortfolioDisbursed = $derived(
    projectStore.projects.reduce((acc, p) => acc + p.disbursedCOP, 0)
  );

  function getLifecycleBadge(status: ProjectLifecycleStatus) {
    switch (status) {
      case 'in_progress':
        return { label: 'En ejecución', dot: 'bg-emerald-500' };
      case 'upcoming':
        return { label: 'Por empezar', dot: 'bg-zinc-400' };
      case 'completed':
        return { label: 'Obra finalizada', dot: 'bg-blue-500' };
    }
  }

  function openProject(proj: ProjectCut, targetRoute: string) {
    projectStore.selectProject(proj.projectId);
    goto(targetRoute);
  }
</script>

<div class="space-y-6 w-full">
  <!-- Cabecera de portafolio -->
  <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border">
    <div class="space-y-1">
      <div class="flex items-center gap-2">
        <Badge variant="outline" class="text-[11px] font-normal bg-muted/60 text-foreground border-border gap-1.5">
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          <span>Portafolio inmobiliario</span>
        </Badge>
        <span class="text-xs text-muted-foreground">• {projectStore.currentUser.companyName}</span>
      </div>
      <h1 class="text-2xl font-semibold text-foreground tracking-tight">
        Directorio de proyectos y fideicomisos
      </h1>
      <p class="text-xs text-muted-foreground">
        Supervisión de obras en ejecución, proyectos por iniciar y edificaciones liquidadas con registro en Stellar.
      </p>
    </div>

    <!-- Indicadores consolidados -->
    <div class="flex items-center gap-6 bg-card border border-border rounded-lg px-5 py-3">
      <div>
        <div class="text-[11px] text-muted-foreground">Valor total del portafolio</div>
        <div class="text-base font-semibold text-foreground tabular-nums">
          ${(totalPortfolioBudget / 1000000000).toFixed(1)}B COP
        </div>
      </div>
      <div class="h-8 w-px bg-border"></div>
      <div>
        <div class="text-[11px] text-muted-foreground">Total desembolsado</div>
        <div class="text-base font-semibold text-foreground tabular-nums">
          ${(totalPortfolioDisbursed / 1000000000).toFixed(1)}B COP
        </div>
      </div>
    </div>
  </div>

  <!-- Filtros por estado -->
  <div class="flex flex-wrap items-center justify-between gap-4">
    <div class="flex flex-wrap items-center gap-1 bg-muted/50 p-1 rounded-lg border border-border">
      <button
        type="button"
        onclick={() => (filterStatus = 'all')}
        class="px-3 py-1.5 rounded-md text-xs transition-all cursor-pointer {filterStatus === 'all'
          ? 'bg-background text-foreground font-medium shadow-xs'
          : 'text-muted-foreground hover:text-foreground'}"
      >
        Todos ({projectStore.projects.length})
      </button>
      <button
        type="button"
        onclick={() => (filterStatus = 'in_progress')}
        class="px-3 py-1.5 rounded-md text-xs transition-all cursor-pointer {filterStatus === 'in_progress'
          ? 'bg-background text-foreground font-medium shadow-xs'
          : 'text-muted-foreground hover:text-foreground'}"
      >
        En ejecución ({projectStore.projects.filter((p) => p.lifecycleStatus === 'in_progress').length})
      </button>
      <button
        type="button"
        onclick={() => (filterStatus = 'upcoming')}
        class="px-3 py-1.5 rounded-md text-xs transition-all cursor-pointer {filterStatus === 'upcoming'
          ? 'bg-background text-foreground font-medium shadow-xs'
          : 'text-muted-foreground hover:text-foreground'}"
      >
        Por empezar ({projectStore.projects.filter((p) => p.lifecycleStatus === 'upcoming').length})
      </button>
      <button
        type="button"
        onclick={() => (filterStatus = 'completed')}
        class="px-3 py-1.5 rounded-md text-xs transition-all cursor-pointer {filterStatus === 'completed'
          ? 'bg-background text-foreground font-medium shadow-xs'
          : 'text-muted-foreground hover:text-foreground'}"
      >
        Terminados ({projectStore.projects.filter((p) => p.lifecycleStatus === 'completed').length})
      </button>
    </div>

    <div class="text-xs text-muted-foreground">
      Proyecto activo: <strong class="text-foreground font-medium">{projectStore.activeCut.projectName}</strong>
    </div>
  </div>

  <!-- Grilla de proyectos -->
  <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 w-full">
    {#each filteredProjects as proj}
      {@const badge = getLifecycleBadge(proj.lifecycleStatus)}
      {@const isSelected = projectStore.selectedProjectId === proj.projectId}

      <Card
        class="bg-card transition-all shadow-none flex flex-col justify-between {isSelected
          ? 'border-foreground/50'
          : 'border-border hover:border-foreground/30'}"
      >
        <CardHeader class="p-5 pb-3 border-b border-border space-y-2">
          <div class="flex items-center justify-between gap-2">
            <Badge variant="outline" class="text-[11px] font-normal bg-muted/50 text-foreground border-border gap-1.5">
              <span class="w-1.5 h-1.5 rounded-full {badge.dot}"></span>
              <span>{badge.label}</span>
            </Badge>
            <span class="text-xs text-muted-foreground tabular-nums">
              {proj.code}
            </span>
          </div>

          <div>
            <CardTitle class="text-base font-semibold text-foreground flex items-center justify-between gap-2">
              <span>{proj.projectName}</span>
              {#if isSelected}
                <Badge variant="secondary" class="text-[10px] font-normal">
                  Seleccionado
                </Badge>
              {/if}
            </CardTitle>
            <CardDescription class="text-xs flex items-center gap-1 mt-0.5">
              <MapPin class="w-3.5 h-3.5 text-muted-foreground" />
              <span>{proj.city} • {proj.address}</span>
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent class="p-5 space-y-4 flex-1 flex flex-col justify-between">
          <div class="space-y-4">
            <!-- Barra de avance físico -->
            <div class="space-y-1.5">
              <div class="flex items-center justify-between text-xs">
                <span class="text-muted-foreground">Avance físico certificado</span>
                <span class="font-medium text-foreground tabular-nums">
                  {proj.certifiedPhysicalProgress}% <span class="text-muted-foreground font-normal">(prog: {proj.scheduledPhysicalProgress}%)</span>
                </span>
              </div>
              <div class="w-full bg-muted h-1.5 rounded-full overflow-hidden">
                <div
                  class="h-full rounded-full transition-all {proj.lifecycleStatus === 'completed'
                    ? 'bg-emerald-500'
                    : 'bg-foreground'}"
                  style="width: {proj.certifiedPhysicalProgress}%"
                ></div>
              </div>
            </div>

            <!-- Cifras financieras -->
            <div class="grid grid-cols-2 gap-3 p-3 rounded-lg bg-muted/30 border border-border text-xs tabular-nums">
              <div>
                <div class="text-[11px] text-muted-foreground">Presupuesto total</div>
                <div class="font-semibold text-foreground text-sm mt-0.5">
                  ${proj.totalBudgetCOP.toLocaleString('es-CO')}
                </div>
              </div>
              <div>
                <div class="text-[11px] text-muted-foreground">Desembolsado</div>
                <div class="font-semibold text-foreground text-sm mt-0.5">
                  ${proj.disbursedCOP.toLocaleString('es-CO')}
                </div>
              </div>
            </div>

            <!-- Entidades involucradas -->
            <div class="space-y-1.5 text-xs border-t border-border pt-3">
              <div class="flex justify-between">
                <span class="text-muted-foreground">Constructora</span>
                <span class="font-medium text-foreground">{proj.developerName}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-muted-foreground">Fiduciaria</span>
                <span class="font-medium text-foreground">{proj.fiduciaryEntity}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-muted-foreground">Encargo fiduciario</span>
                <span class="font-medium text-foreground tabular-nums">{proj.fiduciaryTrustCode}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-muted-foreground">Cortes certificados</span>
                <span class="font-medium text-foreground tabular-nums">{proj.number} de {proj.totalCutsPlanned}</span>
              </div>
            </div>
          </div>

          <!-- Acciones -->
          <div class="pt-4 border-t border-border flex items-center gap-2">
            <Button
              onclick={() => openProject(proj, '/gemelo')}
              variant={isSelected ? 'default' : 'outline'}
              size="sm"
              class="flex-1 h-8 text-xs cursor-pointer {isSelected
                ? 'bg-foreground text-background hover:bg-foreground/90 font-medium'
                : ''}"
            >
              Ver gemelo 3D
            </Button>

            {#if projectStore.effectiveRole === 'interventor'}
              <Button
                onclick={() => openProject(proj, '/interventor')}
                variant="outline"
                size="sm"
                class="flex-1 h-8 text-xs cursor-pointer"
              >
                Calibrar corte
              </Button>
            {:else}
              <Button
                onclick={() => openProject(proj, '/fiduciaria')}
                variant="outline"
                size="sm"
                class="flex-1 h-8 text-xs cursor-pointer"
              >
                Ver giros
              </Button>
            {/if}
          </div>
        </CardContent>
      </Card>
    {/each}
  </div>
</div>
