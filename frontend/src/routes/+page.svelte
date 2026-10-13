<script lang="ts">
  import { goto } from '$app/navigation';
  import ProjectMapCard from '$lib/components/dashboard/ProjectMapCard.svelte';
  import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
  import { Button } from '$lib/components/ui/button';
  import { Badge } from '$lib/components/ui/badge';
  import { projectStore } from '$lib/stores/projectState.svelte';
  import { ArrowUpRight, Box } from '@lucide/svelte';

  const cut = $derived(projectStore.activeCut);
  const role = $derived(projectStore.effectiveRole);

  const visibleProjects = $derived(
    projectStore.projects.filter((p) => {
      if (role === 'constructor') {
        return p.developerName === projectStore.currentUser.companyName || projectStore.currentUser.role === 'admin';
      }
      if (role === 'fiduciaria') {
        return p.fiduciaryEntity === projectStore.currentUser.companyName || projectStore.currentUser.role === 'admin';
      }
      return true;
    })
  );

  const totalBudgetPortfolio = $derived(
    visibleProjects.reduce((acc, p) => acc + p.totalBudgetCOP, 0)
  );
  const totalDisbursedPortfolio = $derived(
    visibleProjects.reduce((acc, p) => acc + p.disbursedCOP, 0)
  );
  const activeCount = $derived(
    visibleProjects.filter((p) => p.lifecycleStatus === 'in_progress').length
  );

  function formatCOP(value: number, compact = false): string {
    if (compact) {
      return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        notation: 'compact',
        maximumFractionDigits: 1
      }).format(value);
    }
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0
    }).format(value);
  }

  function openProjectInTwin(projectId: string) {
    projectStore.selectProject(projectId);
    goto('/gemelo');
  }
</script>

<div class="space-y-6 w-full">
  <!-- 1. Bienvenida y contexto institucional -->
  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-border">
    <div class="space-y-1">
      <div class="flex items-center gap-2">
        <Badge variant="outline" class="text-[11px] font-medium bg-muted/60 text-foreground border-border gap-1.5">
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          <span class="capitalize">{role === 'admin' ? 'Vista general de administración' : `Perfil ${role}`}</span>
        </Badge>
        <span class="text-xs text-muted-foreground">• {projectStore.currentUser.companyName}</span>
      </div>
      <h1 class="text-2xl font-semibold tracking-tight text-foreground">
        Bienvenido, {projectStore.currentUser.fullName.split('(')[0].trim()}
      </h1>
      <p class="text-xs text-muted-foreground">
        Resumen financiero, estado de encargos fiduciarios y últimos cortes de obra verificados.
      </p>
    </div>

    <div class="flex flex-wrap items-center gap-2">
      <Button
        href="/gemelo"
        variant="outline"
        size="sm"
        class="h-8 text-xs font-medium gap-1.5"
      >
        <Box class="w-3.5 h-3.5 text-muted-foreground" />
        <span>Abrir gemelo 3D</span>
      </Button>

      {#if role === 'admin' || role === 'interventor'}
        <Button
          href="/interventor"
          size="sm"
          class="h-8 bg-foreground text-background hover:bg-foreground/90 text-xs font-medium"
        >
          Certificar corte de obra
        </Button>
      {:else}
        <Button
          href="/fiduciaria"
          size="sm"
          class="h-8 bg-foreground text-background hover:bg-foreground/90 text-xs font-medium"
        >
          {role === 'constructor' ? 'Consultar mis giros' : 'Revisar giros pendientes'}
        </Button>
      {/if}
    </div>
  </div>

  <!-- 2. Métricas bancarias principales (Estilo Enterprise) -->
  <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
    <Card class="bg-card border-border shadow-none">
      <CardContent class="p-5 space-y-1.5">
        <span class="text-xs text-muted-foreground font-medium block">
          Capital total en fideicomiso
        </span>
        <div class="text-2xl font-semibold tracking-tight text-foreground tabular-nums">
          {formatCOP(totalBudgetPortfolio, true)}
        </div>
        <div class="text-[11px] text-muted-foreground tabular-nums pt-1">
          Distribuido en {visibleProjects.length} proyectos registrados
        </div>
      </CardContent>
    </Card>

    <Card class="bg-card border-border shadow-none">
      <CardContent class="p-5 space-y-1.5">
        <span class="text-xs text-muted-foreground font-medium block">
          Recursos desembolsados a la fecha
        </span>
        <div class="text-2xl font-semibold tracking-tight text-foreground tabular-nums">
          {formatCOP(totalDisbursedPortfolio, true)}
        </div>
        <div class="text-[11px] text-muted-foreground tabular-nums pt-1">
          {((totalDisbursedPortfolio / (totalBudgetPortfolio || 1)) * 100).toFixed(1)}% del presupuesto liberado
        </div>
      </CardContent>
    </Card>

    <Card class="bg-card border-border shadow-none">
      <CardContent class="p-5 space-y-1.5">
        <div class="flex items-center justify-between">
          <span class="text-xs text-muted-foreground font-medium">
            Giro del proyecto seleccionado
          </span>
          <Badge variant="outline" class="text-[10px] font-medium bg-muted/50 border-border">
            Corte #{cut.number}
          </Badge>
        </div>
        <div class="text-2xl font-semibold tracking-tight text-foreground tabular-nums">
          {formatCOP(cut.cutDisbursementCOP, true)}
        </div>
        <div class="text-[11px] text-muted-foreground truncate pt-1">
          {cut.projectName}
        </div>
      </CardContent>
    </Card>

    <Card class="bg-card border-border shadow-none">
      <CardContent class="p-5 space-y-1.5">
        <div class="flex items-center justify-between">
          <span class="text-xs text-muted-foreground font-medium">
            Avance físico verificado
          </span>
          <span class="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 tabular-nums">
            {cut.certifiedPhysicalProgress >= cut.scheduledPhysicalProgress ? '+' : ''}{(
              cut.certifiedPhysicalProgress - cut.scheduledPhysicalProgress
            ).toFixed(1)}% vs. cronograma
          </span>
        </div>
        <div class="text-2xl font-semibold tracking-tight text-foreground tabular-nums">
          {cut.certifiedPhysicalProgress.toFixed(1)}%
        </div>
        <div class="w-full h-1.5 rounded-full bg-muted overflow-hidden mt-1">
          <div
            class="h-full bg-foreground rounded-full transition-all"
            style="width: {cut.certifiedPhysicalProgress}%"
          ></div>
        </div>
      </CardContent>
    </Card>
  </div>

  <!-- 2.5 Flujo de negocio integral del proyecto activo -->
  <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
    <a
      href="/ficha-proyecto"
      class="group rounded-xl border border-border bg-card p-4 transition-colors hover:border-foreground/30"
    >
      <div class="flex items-center justify-between">
        <span class="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">01 · Comercial y técnico</span>
        <ArrowUpRight class="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
      </div>
      <div class="mt-1.5 text-sm font-semibold text-foreground">Ficha del proyecto y amenidades</div>
      <p class="mt-1 text-xs text-muted-foreground">
        {projectStore.activeFicha.soldUnits} de {projectStore.activeFicha.totalUnits} unidades vendidas • {projectStore.activeFicha.typologies.length} tipologías y {projectStore.activeFicha.amenities.length} amenidades.
      </p>
    </a>

    <a
      href="/cumplimiento"
      class="group rounded-xl border border-border bg-card p-4 transition-colors hover:border-foreground/30"
    >
      <div class="flex items-center justify-between">
        <span class="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">02 · Jurídico y Ley 1796</span>
        <ArrowUpRight class="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
      </div>
      <div class="mt-1.5 text-sm font-semibold text-foreground">Cumplimiento y documentos</div>
      <p class="mt-1 text-xs text-muted-foreground">
        Constructora e interventoría al 100% • {projectStore.mandatoryDocs.length} documentos obligatorios sellados.
      </p>
    </a>

    <a
      href="/calendario"
      class="group rounded-xl border border-border bg-card p-4 transition-colors hover:border-foreground/30"
    >
      <div class="flex items-center justify-between">
        <span class="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">03 · Programación</span>
        <ArrowUpRight class="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
      </div>
      <div class="mt-1.5 text-sm font-semibold text-foreground">Calendario y cronograma</div>
      <p class="mt-1 text-xs text-muted-foreground">
        {projectStore.calendarEvents.length} eventos programados entre cortes de obra, interventoría y comités.
      </p>
    </a>

    <a
      href="/fiduciaria"
      class="group rounded-xl border border-border bg-card p-4 transition-colors hover:border-foreground/30"
    >
      <div class="flex items-center justify-between">
        <span class="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">04 · Giros y auditoría</span>
        <ArrowUpRight class="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
      </div>
      <div class="mt-1.5 text-sm font-semibold text-foreground">Hitos e historial de desembolsos</div>
      <p class="mt-1 text-xs text-muted-foreground">
        {projectStore.milestones.filter((m) => m.status === 'desembolsado').length} de {projectStore.milestones.length} hitos girados • Revisión y aprobación en comité.
      </p>
    </a>
  </div>

  <!-- 3. Contenido principal: Tabla de proyectos (8 cols) + Proyecto en foco y actividad (4 cols) -->
  <div class="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
    <!-- Columna izquierda: Resumen de proyectos y estado de cortes -->
    <div class="xl:col-span-8 space-y-4">
      <Card class="bg-card border-border shadow-none overflow-hidden">
        <CardHeader class="px-5 py-4 border-b border-border flex flex-row items-center justify-between">
          <div>
            <CardTitle class="text-sm font-semibold text-foreground">
              Estado de obras y encargos fiduciarios ({activeCount} en ejecución)
            </CardTitle>
            <p class="text-xs text-muted-foreground mt-0.5">
              Selecciona una obra para actualizar el contexto activo o inspeccionar su gemelo digital.
            </p>
          </div>
          <Button href="/proyectos" variant="outline" size="sm" class="h-7 text-xs">
            Ver portafolio completo
          </Button>
        </CardHeader>

        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse text-xs">
            <thead>
              <tr class="border-b border-border bg-muted/30 text-muted-foreground font-medium">
                <th class="py-2.5 px-4">Proyecto</th>
                <th class="py-2.5 px-4 whitespace-nowrap">Estado</th>
                <th class="py-2.5 px-4 whitespace-nowrap">Avance físico</th>
                <th class="py-2.5 px-4 text-right whitespace-nowrap">Presupuesto</th>
                <th class="py-2.5 px-4 text-right whitespace-nowrap">Acción</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-border">
              {#each visibleProjects as proj}
                {@const isSelected = proj.projectId === projectStore.selectedProjectId}
                <tr
                  onclick={() => projectStore.selectProject(proj.projectId)}
                  class="transition-colors cursor-pointer {isSelected
                    ? 'bg-muted/50'
                    : 'hover:bg-muted/25'}"
                >
                  <td class="py-3 px-4">
                    <div class="font-medium text-foreground flex items-center gap-2">
                      <span class="whitespace-nowrap">{proj.projectName}</span>
                      {#if isSelected}
                        <Badge variant="secondary" class="text-[10px] px-1.5 py-0 font-normal whitespace-nowrap shrink-0">
                          Seleccionado
                        </Badge>
                      {/if}
                    </div>
                    <div class="text-[11px] text-muted-foreground whitespace-nowrap">
                      {proj.city} • {proj.fiduciaryEntity}
                    </div>
                  </td>

                  <td class="py-3 px-4 whitespace-nowrap">
                    <Badge variant="outline" class="text-[11px] font-normal bg-background border-border gap-1.5 whitespace-nowrap">
                      <span
                        class="w-1.5 h-1.5 shrink-0 rounded-full {proj.lifecycleStatus === 'in_progress'
                          ? proj.status === 'certified'
                            ? 'bg-emerald-500'
                            : 'bg-[#F5A400]'
                          : proj.lifecycleStatus === 'completed'
                            ? 'bg-blue-500'
                            : 'bg-zinc-400'}"
                      ></span>
                      <span>
                        {#if proj.lifecycleStatus === 'completed'}
                          Finalizado
                        {:else if proj.lifecycleStatus === 'upcoming'}
                          Por iniciar
                        {:else if proj.status === 'certified'}
                          Corte #{proj.number} certificado
                        {:else}
                          Corte #{proj.number} en revisión
                        {/if}
                      </span>
                    </Badge>
                  </td>

                  <td class="py-3 px-4 whitespace-nowrap">
                    <div class="flex items-center gap-2.5">
                      <div class="w-20 h-1.5 shrink-0 rounded-full bg-muted overflow-hidden">
                        <div
                          class="h-full rounded-full {proj.certifiedPhysicalProgress === 100
                            ? 'bg-emerald-500'
                            : 'bg-foreground'}"
                          style="width: {proj.certifiedPhysicalProgress}%"
                        ></div>
                      </div>
                      <span class="tabular-nums font-medium text-foreground whitespace-nowrap">
                        {proj.certifiedPhysicalProgress.toFixed(1)}%
                      </span>
                    </div>
                  </td>

                  <td class="py-3 px-4 text-right tabular-nums text-foreground font-medium whitespace-nowrap">
                    {formatCOP(proj.totalBudgetCOP, true)}
                  </td>

                  <td class="py-3 px-4 text-right whitespace-nowrap">
                    <button
                      type="button"
                      onclick={(e) => {
                        e.stopPropagation();
                        openProjectInTwin(proj.projectId);
                      }}
                      class="inline-flex shrink-0 items-center gap-1 text-xs font-medium whitespace-nowrap text-foreground hover:text-[#F5A400] transition-colors cursor-pointer"
                    >
                      <span>Ver 3D</span>
                      <ArrowUpRight class="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>

      </Card>
    </div>

    <!-- Columna derecha: Ficha rápida del proyecto activo y últimos certificados -->
    <div class="xl:col-span-4 space-y-4">
      <!-- Tarjeta del proyecto actualmente seleccionado -->
      <Card class="bg-card border-border shadow-none">
        <CardHeader class="px-5 py-4 border-b border-border">
          <div class="flex items-center justify-between">
            <CardTitle class="text-sm font-semibold text-foreground">
              Proyecto en foco
            </CardTitle>
            <span class="text-[11px] font-mono text-muted-foreground">{cut.code}</span>
          </div>
        </CardHeader>
        <CardContent class="p-5 space-y-4 text-xs">
          <div>
            <div class="text-base font-semibold text-foreground">{cut.projectName}</div>
            <div class="text-muted-foreground mt-0.5">{cut.address} • {cut.city}</div>
          </div>

          <div class="grid grid-cols-2 gap-3 p-3 rounded-lg bg-muted/30 border border-border">
            <div>
              <span class="text-[11px] text-muted-foreground block">Constructora</span>
              <span class="font-medium text-foreground">{cut.developerName}</span>
            </div>
            <div>
              <span class="text-[11px] text-muted-foreground block">Fiduciaria</span>
              <span class="font-medium text-foreground">{cut.fiduciaryEntity}</span>
            </div>
            <div>
              <span class="text-[11px] text-muted-foreground block">Niveles totales</span>
              <span class="font-medium text-foreground tabular-nums">{cut.floors.length} pisos</span>
            </div>
            <div>
              <span class="text-[11px] text-muted-foreground block">Corte vigente</span>
              <span class="font-medium text-foreground tabular-nums">#{cut.number} de {cut.totalCutsPlanned}</span>
            </div>
          </div>

          <div class="flex flex-col gap-2 pt-1">
            <Button
              href="/gemelo"
              class="w-full h-9 bg-foreground text-background hover:bg-foreground/90 text-xs font-medium justify-between"
            >
              <span>Inspeccionar gemelo digital 3D</span>
              <ArrowUpRight class="w-3.5 h-3.5" />
            </Button>

            {#if role === 'admin' || role === 'fiduciaria' || role === 'constructor'}
              <Button
                href="/fiduciaria"
                variant="outline"
                class="w-full h-9 text-xs font-medium justify-between"
              >
                <span>{role === 'constructor' ? 'Ver estado de desembolsos' : 'Ir a aprobación de giros'}</span>
                <ArrowUpRight class="w-3.5 h-3.5 text-muted-foreground" />
              </Button>
            {/if}
          </div>
        </CardContent>
      </Card>

      <!-- Mapa interactivo del proyecto en foco -->
      <ProjectMapCard
        projectName={cut.projectName}
        address={cut.address}
        city={cut.city}
        heightClass="h-48"
      />

      <!-- Últimos certificados emitidos en Stellar -->
      <Card class="bg-card border-border shadow-none">
        <CardHeader class="px-5 py-4 border-b border-border">
          <CardTitle class="text-sm font-semibold text-foreground">
            Últimos certificados registrados
          </CardTitle>
        </CardHeader>
        <CardContent class="p-4 space-y-2.5">
          {#each projectStore.issuedCertificates.slice(0, 3) as cert}
            <div class="p-3 rounded-lg border border-border bg-muted/20 space-y-1 text-xs">
              <div class="flex items-center justify-between">
                <span class="font-medium text-foreground">{cert.metadata.projectName}</span>
                <Badge variant="outline" class="text-[10px] font-normal bg-background border-border gap-1">
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  <span>Corte #{cert.metadata.corteNumber}</span>
                </Badge>
              </div>
              <div class="flex items-center justify-between text-[11px] text-muted-foreground tabular-nums">
                <span>Avance certificado: {cert.metadata.metrics.finalCertifiedProgressPercent}%</span>
                <span>Ledger #{cert.stellarSoroban.ledgerSequence}</span>
              </div>
            </div>
          {/each}
        </CardContent>
      </Card>
    </div>
  </div>
</div>
