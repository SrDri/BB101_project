<script lang="ts">
  import { goto } from '$app/navigation';
  import { projectStore } from '$lib/stores/projectState.svelte';
  import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '$lib/components/ui/card';
  import { Button } from '$lib/components/ui/button';
  import { Badge } from '$lib/components/ui/badge';
  import { Input } from '$lib/components/ui/input';
  import type { ProjectLifecycleStatus, ProjectCut, ProjectFichaDetails } from '$lib/types/twin';
  import { MapPin, Plus, Building2, X } from '@lucide/svelte';

  let filterStatus = $state<'all' | ProjectLifecycleStatus>('all');
  let isCreateModalOpen = $state(false);

  // Campos del formulario de constitución de proyecto y ficha inicial
  let newProjectName = $state('Reserva del Poblado — Etapa 1');
  let newCode = $state('TRM-2026-06');
  let newCity = $state('Medellín, Antioquia');
  let newAddress = $state('Transversal Superior # 10A-45');
  let newFiduciaryTrustCode = $state('ENC-FID-9920-06');
  let newPropertyType = $state<ProjectFichaDetails['propertyType']>('Apartamentos residenciales');
  let newStratum = $state('Estrato 6');
  let newTotalFloors = $state(12);
  let newTotalUnits = $state(48);
  let newTotalBudgetCOP = $state(28500000000);
  let newEstimatedDelivery = $state('Noviembre 2028');
  let newDescription = $state(
    'Torre residencial bioclimática con certificación sostenible, estructurada bajo patrimonio autónomo fiduciario y trazabilidad de obra en Stellar Soroban.'
  );

  const canCreateProject = $derived(
    projectStore.effectiveRole === 'admin' ||
      projectStore.effectiveRole === 'fiduciaria' ||
      projectStore.effectiveRole === 'constructor'
  );

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

  function handleCreateProject(e: SubmitEvent) {
    e.preventDefault();
    if (!newProjectName.trim()) return;
    projectStore.createProjectWithFicha({
      projectName: newProjectName,
      code: newCode,
      city: newCity,
      address: newAddress,
      fiduciaryTrustCode: newFiduciaryTrustCode,
      propertyType: newPropertyType,
      stratum: newStratum,
      totalFloors: Number(newTotalFloors),
      totalUnits: Number(newTotalUnits),
      totalBudgetCOP: Number(newTotalBudgetCOP),
      estimatedDelivery: newEstimatedDelivery,
      description: newDescription
    });
    isCreateModalOpen = false;
    goto('/ficha-proyecto');
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

    <!-- Indicadores consolidados + Botón de Constitución por Rol -->
    <div class="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3">
      <div class="flex items-center justify-between sm:justify-start gap-4 sm:gap-6 bg-card border border-border rounded-lg px-4 sm:px-5 py-2.5">
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

      {#if canCreateProject}
        <Button
          onclick={() => (isCreateModalOpen = true)}
          class="h-10 w-full sm:w-auto bg-foreground text-background hover:bg-foreground/90 text-xs font-medium gap-1.5 cursor-pointer"
        >
          <Plus class="w-4 h-4" />
          <span>Constituir proyecto y ficha</span>
        </Button>
      {/if}
    </div>
  </div>

  <!-- Filtros por estado -->
  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
    <div class="w-full sm:w-auto grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-1 bg-muted/50 p-1 rounded-lg border border-border text-center">
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
              onclick={() => openProject(proj, '/ficha-proyecto')}
              variant={isSelected ? 'default' : 'outline'}
              size="sm"
              class="flex-1 h-8 text-xs cursor-pointer {isSelected
                ? 'bg-foreground text-background hover:bg-foreground/90 font-medium'
                : ''}"
            >
              Ficha integral
            </Button>

            <Button
              onclick={() => openProject(proj, '/gemelo')}
              variant="outline"
              size="sm"
              class="flex-1 h-8 text-xs cursor-pointer"
            >
              Vista 3D
            </Button>

            {#if projectStore.effectiveRole === 'interventor'}
              <Button
                onclick={() => openProject(proj, '/interventor')}
                variant="outline"
                size="sm"
                class="flex-1 h-8 text-xs cursor-pointer"
              >
                Calibrar
              </Button>
            {:else}
              <Button
                onclick={() => openProject(proj, '/fiduciaria')}
                variant="outline"
                size="sm"
                class="flex-1 h-8 text-xs cursor-pointer"
              >
                Giros
              </Button>
            {/if}
          </div>
        </CardContent>
      </Card>
    {/each}
  </div>
</div>

<!-- Modal de Constitución de Nuevo Proyecto y Ficha Integral -->
{#if isCreateModalOpen}
  <div class="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/65 backdrop-blur-xs p-0 sm:p-4 overflow-y-auto">
    <div class="w-full max-w-2xl max-h-[92dvh] flex flex-col rounded-t-2xl sm:rounded-xl border border-border bg-card text-card-foreground shadow-2xl overflow-hidden my-0 sm:my-auto">
      <div class="p-4 sm:p-5 border-b border-border flex items-center justify-between shrink-0">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-lg bg-muted border border-border flex items-center justify-center shrink-0">
            <Building2 class="w-4 h-4 text-foreground" />
          </div>
          <div>
            <h2 class="text-sm font-semibold text-foreground">
              Constituir nuevo proyecto y Ficha Integral
            </h2>
            <p class="text-xs text-muted-foreground">
              Radicación conjunta por <strong class="text-foreground">{projectStore.currentUser.companyName}</strong> ({projectStore.effectiveRole})
            </p>
          </div>
        </div>
        <button
          type="button"
          onclick={() => (isCreateModalOpen = false)}
          class="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent cursor-pointer"
        >
          <X class="w-4 h-4" />
        </button>
      </div>

      <form onsubmit={handleCreateProject} class="p-4 sm:p-5 space-y-4 text-xs overflow-y-auto flex-1">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div class="space-y-1.5 sm:col-span-2">
            <label for="np-name" class="font-medium text-foreground">Nombre comercial del proyecto</label>
            <Input id="np-name" bind:value={newProjectName} class="h-9 text-xs" required />
          </div>

          <div class="space-y-1.5">
            <label for="np-code" class="font-medium text-foreground">Código técnico Tramo</label>
            <Input id="np-code" bind:value={newCode} class="h-9 text-xs font-mono" required />
          </div>

          <div class="space-y-1.5">
            <label for="np-fid" class="font-medium text-foreground">Código de Encargo Fiduciario</label>
            <Input id="np-fid" bind:value={newFiduciaryTrustCode} class="h-9 text-xs font-mono" required />
          </div>

          <div class="space-y-1.5">
            <label for="np-city" class="font-medium text-foreground">Ciudad / Municipio</label>
            <Input id="np-city" bind:value={newCity} class="h-9 text-xs" required />
          </div>

          <div class="space-y-1.5">
            <label for="np-addr" class="font-medium text-foreground">Dirección del predio</label>
            <Input id="np-addr" bind:value={newAddress} class="h-9 text-xs" required />
          </div>

          <div class="space-y-1.5">
            <label for="np-type" class="font-medium text-foreground">Tipología inmobiliaria</label>
            <select
              id="np-type"
              bind:value={newPropertyType}
              class="w-full h-9 rounded-md border border-input bg-background px-3 text-xs text-foreground"
            >
              <option value="Apartamentos residenciales">Apartamentos residenciales</option>
              <option value="Vivienda VIS">Vivienda VIS</option>
              <option value="Uso mixto y corporativo">Uso mixto y corporativo</option>
              <option value="Casas en conjunto">Casas en conjunto</option>
            </select>
          </div>

          <div class="space-y-1.5">
            <label for="np-stratum" class="font-medium text-foreground">Estrato socioeconómico</label>
            <select
              id="np-stratum"
              bind:value={newStratum}
              class="w-full h-9 rounded-md border border-input bg-background px-3 text-xs text-foreground"
            >
              <option value="Estrato 3">Estrato 3</option>
              <option value="Estrato 4">Estrato 4</option>
              <option value="Estrato 5">Estrato 5</option>
              <option value="Estrato 6">Estrato 6</option>
            </select>
          </div>

          <div class="space-y-1.5">
            <label for="np-floors" class="font-medium text-foreground">Niveles / Pisos (Gemelo 3D)</label>
            <Input id="np-floors" type="number" min="3" max="25" bind:value={newTotalFloors} class="h-9 text-xs" required />
          </div>

          <div class="space-y-1.5">
            <label for="np-units" class="font-medium text-foreground">Total de unidades privadas</label>
            <Input id="np-units" type="number" min="8" max="400" bind:value={newTotalUnits} class="h-9 text-xs" required />
          </div>

          <div class="space-y-1.5">
            <label for="np-budget" class="font-medium text-foreground">Presupuesto fiduciario total (COP)</label>
            <Input id="np-budget" type="number" step="500000000" bind:value={newTotalBudgetCOP} class="h-9 text-xs font-mono" required />
          </div>

          <div class="space-y-1.5">
            <label for="np-deliv" class="font-medium text-foreground">Fecha estimada de entrega</label>
            <Input id="np-deliv" bind:value={newEstimatedDelivery} class="h-9 text-xs" required />
          </div>

          <div class="space-y-1.5 sm:col-span-2">
            <label for="np-desc" class="font-medium text-foreground">Descripción ejecutiva para la Ficha Integral</label>
            <textarea
              id="np-desc"
              bind:value={newDescription}
              rows="3"
              class="w-full rounded-md border border-input bg-background p-2.5 text-xs text-foreground leading-relaxed"
              required
            ></textarea>
          </div>
        </div>

        <div class="pt-3 border-t border-border flex items-center justify-end gap-2 shrink-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onclick={() => (isCreateModalOpen = false)}
            class="h-8 text-xs cursor-pointer"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            size="sm"
            class="h-8 bg-foreground text-background hover:bg-foreground/90 text-xs font-medium cursor-pointer"
          >
            Crear proyecto y abrir Ficha Integral
          </Button>
        </div>
      </form>
    </div>
  </div>
{/if}
