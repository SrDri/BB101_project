<script lang="ts">
  import './layout.css';
  import { page } from '$app/state';
  import { goto } from '$app/navigation';
  import AppSidebar from '$lib/components/layout/AppSidebar.svelte';
  import PublicHeader from '$lib/components/layout/PublicHeader.svelte';
  import { Badge } from '$lib/components/ui/badge';
  import { Button } from '$lib/components/ui/button';
  import { projectStore } from '$lib/stores/projectState.svelte';
  import {
    Sun,
    Moon,
    ChevronRight,
    UserCog,
    Building2,
    ChevronsUpDown,
    FolderKanban,
    Check,
    Bell,
    ShieldAlert,
    FileSignature,
    Clock,
    CheckCheck,
    ArrowUpRight,
    ShieldCheck,
    Menu
  } from '@lucide/svelte';
  import type { LayoutProps } from './$types';

  let { children }: LayoutProps = $props();

  let isSidebarCollapsed = $state(false);
  let isMobileSidebarOpen = $state(false);
  let isProjectMenuOpen = $state(false);
  let isNotificationsOpen = $state(false);
  let inboxTab = $state<'acciones' | 'actividad'>('acciones');
  let dismissedNotificationIds = $state<string[]>([]);

  const isLoginRoute = $derived(page.url.pathname.startsWith('/login'));
  const isIsolatedPublicRoute = $derived(
    page.url.pathname.startsWith('/verificar') || page.url.pathname.startsWith('/propietario')
  );
  const isProtectedCorporateRoute = $derived(!isLoginRoute && !isIsolatedPublicRoute);

  $effect(() => {
    projectStore.initAuth();
    if (projectStore.authInitialized && isProtectedCorporateRoute && !projectStore.isAuthenticated) {
      const currentPath = page.url.pathname;
      const targetUrl =
        currentPath && currentPath !== '/'
          ? `/login?redirect=${encodeURIComponent(currentPath)}`
          : '/login';
      goto(targetUrl, { replaceState: true });
    }
  });

  const activeProjectsForUser = $derived(
    projectStore.projects.filter((p) => {
      if (p.lifecycleStatus !== 'in_progress') return false;
      const role = projectStore.effectiveRole;
      if (role === 'constructor') {
        return p.developerName === projectStore.currentUser.companyName || projectStore.currentUser.role === 'admin';
      }
      if (role === 'fiduciaria') {
        return p.fiduciaryEntity === projectStore.currentUser.companyName || projectStore.currentUser.role === 'admin';
      }
      return true;
    })
  );

  interface ActionInboxItem {
    id: string;
    title: string;
    subtitle: string;
    badge: string;
    tone: 'critical' | 'warning' | 'action' | 'success';
    href: string;
    roleLabel: string;
  }

  const rawActionInboxItems = $derived.by<ActionInboxItem[]>(() => {
    const role = projectStore.effectiveRole;
    const items: ActionInboxItem[] = [];

    // 1. Hallazgos críticos abiertos (relevante para todos los roles)
    for (const f of projectStore.technicalFindings.filter((t) => t.status === 'abierto')) {
      items.push({
        id: `finding-${f.id}`,
        title: `${f.code}: ${f.title}`,
        subtitle: `${f.location} · Reportado por ${f.reportedBy}`,
        badge: f.severity === 'critica' ? 'Bloqueo crítico' : 'Hallazgo abierto',
        tone: f.severity === 'critica' ? 'critical' : 'warning',
        href: '/interventor',
        roleLabel: role === 'constructor' ? 'Por subsanar' : 'Control técnico'
      });
    }

    // 2. Hitos listos para giro fiduciario
    for (const m of projectStore.milestones.filter((item) => item.status === 'listo_para_giro')) {
      items.push({
        id: `milestone-ready-${m.id}`,
        title: `Firma pendiente: Giro Hito #${m.milestoneNumber} (${m.title})`,
        subtitle: `Avance ${m.certifiedPhysicalPercent}% certificado · Listo para comité fiduciario`,
        badge: 'Firma de giro',
        tone: 'action',
        href: '/fiduciaria',
        roleLabel: 'Comité fiduciario'
      });
    }

    // 3. Hitos en ejecución por radicar (para constructor)
    if (role === 'constructor' || role === 'admin') {
      for (const m of projectStore.milestones.filter((item) => item.status === 'en_ejecucion')) {
        items.push({
          id: `milestone-submit-${m.id}`,
          title: `Radicar cuenta de cobro y PILA · Hito #${m.milestoneNumber}`,
          subtitle: `${m.title} (${m.certifiedPhysicalPercent}% físico ejecutado)`,
          badge: 'Por radicar',
          tone: 'action',
          href: '/fiduciaria',
          roleLabel: 'Constructora'
        });
      }
    }

    // 4. Corte activo pendiente de sello Soroban (para interventor)
    if (projectStore.activeCut.status !== 'certified') {
      items.push({
        id: `cut-certify-${projectStore.activeCut.id}`,
        title: `Corte #${projectStore.activeCut.number} pendiente de sello criptográfico`,
        subtitle: `${projectStore.activeCut.projectName} · Firma COPNIA requerida en Soroban`,
        badge: 'Firma COPNIA',
        tone: 'warning',
        href: '/interventor',
        roleLabel: 'Interventoría'
      });
    }

    // 5. Alertas de cumplimiento legal próximo a vencer
    for (const c of projectStore.legalCompliance.filter((item) => item.status === 'proximo_a_vencer')) {
      items.push({
        id: `compliance-${c.id}`,
        title: `Renovación próxima: ${c.requirement}`,
        subtitle: `${c.entity} · Vence ${c.expirationDate}`,
        badge: 'Vencimiento',
        tone: 'warning',
        href: '/cumplimiento',
        roleLabel: 'Legal y seguros'
      });
    }

    // 6. Detalles de posventa (Snag List) y liberación de retención 5%
    const pendingSnags = projectStore.unitSnagItems.filter((s) => s.status !== 'validado_propietario');
    if (pendingSnags.length > 0) {
      items.push({
        id: `snags-pending-${pendingSnags.length}`,
        title: `${pendingSnags.length} observación(es) posventa pendientes de VoBo`,
        subtitle: `Unidades en pre-entrega antes de liberar el 5% de retención en garantía`,
        badge: 'Posventa 5%',
        tone: 'action',
        href: role === 'fiduciaria' ? '/fiduciaria' : '/propietario',
        roleLabel: 'Entrega unidades'
      });
    }

    return items;
  });

  const visibleInboxItems = $derived(
    rawActionInboxItems.filter((item) => !dismissedNotificationIds.includes(item.id))
  );

  function markAllNotificationsRead() {
    dismissedNotificationIds = rawActionInboxItems.map((i) => i.id);
  }

  function resetDismissedNotifications() {
    dismissedNotificationIds = [];
  }

  const currentSectionLabel = $derived.by(() => {
    const path = page.url.pathname;
    if (path === '/') return 'Inicio';
    if (path.startsWith('/ficha-proyecto')) return 'Ficha del proyecto';
    if (path.startsWith('/gemelo')) return 'Vista 3D';
    if (path.startsWith('/evidencias')) return 'Evidencias fotográficas';
    if (path.startsWith('/cumplimiento')) return 'Cumplimiento y documentos';
    if (path.startsWith('/calendario')) return 'Calendario y agenda';
    if (path.startsWith('/proyectos')) return 'Portafolio de obras';
    if (path.startsWith('/interventor')) return 'Interventoría técnica';
    if (path.startsWith('/auditoria')) return 'Auditoría y bitácora';
    if (path.startsWith('/fiduciaria')) {
      return projectStore.effectiveRole === 'constructor' ? 'Mis cortes y giros' : 'Fiduciaria y desembolsos';
    }
    return 'Consola principal';
  });
</script>

{#if isLoginRoute}
  <!-- 1. Ruta de login aislada (sin header ni sidebar) -->
  <div class="min-h-screen w-full bg-background text-foreground font-sans">
    {@render children()}
  </div>
{:else if isIsolatedPublicRoute}
  <!-- 2. Portal público aislado (/verificar y /propietario) -->
  <div class="min-h-screen flex flex-col bg-background text-foreground font-sans">
    <PublicHeader />

    <main class="flex-1 w-full px-3.5 sm:px-6 lg:px-10 py-4 sm:py-6 overflow-x-hidden">
      {@render children()}
    </main>

    <footer class="border-t border-border bg-card/50 py-4 mt-8 text-xs text-muted-foreground">
      <div class="w-full px-3.5 sm:px-6 lg:px-10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div class="flex items-center gap-2">
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          <span class="text-foreground font-medium">tramo</span>
          <span>• Portal público de consulta y verificación</span>
        </div>
        <div class="flex items-center gap-4">
          <span>Red Stellar Soroban</span>
          <span>•</span>
          <a href="/login" class="hover:text-foreground transition-colors underline underline-offset-4">
            Acceso corporativo
          </a>
        </div>
      </div>
    </footer>
  </div>
{:else if !projectStore.authInitialized || !projectStore.isAuthenticated}
  <!-- 3. Guardia de autenticación corporativa (evita mostrar la consola sin sesión activa) -->
  <div class="min-h-screen w-full flex flex-col items-center justify-center bg-background text-foreground font-sans p-6">
    <div class="flex items-center gap-2.5 text-xs text-muted-foreground">
      <span class="h-2 w-2 rounded-full bg-[#F5A400] animate-ping"></span>
      <span>Redirigiendo al acceso corporativo de Tramo...</span>
    </div>
  </div>
{:else}
  <!-- 4. Plataforma corporativa con menú vertical y selector de proyecto en el Topbar -->
  <div class="min-h-screen flex w-full bg-background text-foreground font-sans">
    <AppSidebar bind:isCollapsed={isSidebarCollapsed} bind:isMobileOpen={isMobileSidebarOpen} />

    <div class="flex-1 flex flex-col min-w-0">
      <!-- Barra contextual superior con Selector Rápido de Proyecto y Action Inbox -->
      <header class="sticky top-0 z-30 h-14 border-b border-border bg-background/95 backdrop-blur-md px-3 sm:px-6 flex items-center justify-between gap-2.5 sm:gap-4">
        <div class="flex items-center gap-1.5 sm:gap-2.5 min-w-0">
          <!-- Botón de menú hamburguesa exclusivo para celular (< md) -->
          <button
            type="button"
            onclick={() => (isMobileSidebarOpen = true)}
            class="md:hidden p-1.5 -ml-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent cursor-pointer shrink-0"
            aria-label="Abrir menú de navegación"
            title="Abrir menú"
          >
            <Menu class="w-5 h-5" />
          </button>

          <!-- Selector desplegable de proyecto activo en el Topbar -->
          <div class="relative">
            <button
              type="button"
              onclick={() => {
                isProjectMenuOpen = !isProjectMenuOpen;
                isNotificationsOpen = false;
              }}
              class="flex items-center gap-1.5 sm:gap-2 rounded-xl border border-border bg-card hover:bg-accent/60 px-2.5 sm:px-3 py-1.5 text-left transition-all cursor-pointer shadow-2xs"
              title="Cambiar proyecto activo"
            >
              <div class="flex items-center gap-1.5 sm:gap-2 min-w-0">
                <span class="text-xs font-semibold text-foreground truncate max-w-[130px] xs:max-w-[170px] sm:max-w-[240px]">
                  {projectStore.activeCut.projectName}
                </span>
                <span class="hidden md:inline-flex items-center gap-1 rounded-md bg-muted px-1.5 py-0.5 font-mono text-[10px] font-medium text-muted-foreground tabular-nums">
                  <span class="w-1.5 h-1.5 rounded-full {projectStore.activeCut.status === 'certified' ? 'bg-emerald-500' : 'bg-[#F5A400]'}"></span>
                  {projectStore.activeCut.certifiedPhysicalProgress.toFixed(1)}%
                </span>
              </div>

              <ChevronsUpDown class="w-3.5 h-3.5 text-muted-foreground shrink-0 ml-0.5" />
            </button>

            {#if isProjectMenuOpen}
              <div
                class="fixed inset-0 z-40"
                onclick={() => (isProjectMenuOpen = false)}
                role="presentation"
              ></div>
              <div
                class="fixed inset-x-3 top-15 sm:absolute sm:inset-x-auto sm:left-0 sm:top-full sm:mt-2 w-auto sm:w-96 rounded-xl border border-border bg-popover text-popover-foreground shadow-2xl z-50 p-2 space-y-1.5"
              >
                <div class="px-2.5 py-1.5 flex items-center justify-between border-b border-border/60">
                  <span class="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Cambiar proyecto activo ({activeProjectsForUser.length})
                  </span>
                  <span class="text-[11px] font-mono text-muted-foreground">
                    {projectStore.activeCut.code}
                  </span>
                </div>

                <div class="max-h-72 overflow-y-auto space-y-1 py-1">
                  {#each activeProjectsForUser as proj (proj.projectId)}
                    {@const isSelected = proj.projectId === projectStore.selectedProjectId}
                    <button
                      type="button"
                      onclick={() => {
                        projectStore.selectProject(proj.projectId);
                        isProjectMenuOpen = false;
                      }}
                      class="w-full text-left px-3 py-2.5 rounded-lg text-xs flex items-center justify-between gap-3 transition-colors cursor-pointer {isSelected
                        ? 'bg-accent text-foreground font-medium border border-border/80'
                        : 'hover:bg-accent/50 text-muted-foreground hover:text-foreground'}"
                    >
                      <div class="min-w-0 flex-1">
                        <div class="flex items-center gap-2">
                          <span class="w-2 h-2 rounded-full shrink-0 {proj.status === 'certified' ? 'bg-emerald-500' : 'bg-[#F5A400]'}"></span>
                          <span class="truncate text-foreground font-semibold">{proj.projectName}</span>
                        </div>
                        <div class="text-[11px] text-muted-foreground pl-4 truncate mt-0.5">
                          {proj.city} • {proj.fiduciaryEntity}
                        </div>
                      </div>

                      <div class="flex items-center gap-2 shrink-0">
                        <span class="rounded-md bg-muted px-2 py-0.5 font-mono text-xs font-semibold tabular-nums text-foreground">
                          {proj.certifiedPhysicalProgress.toFixed(1)}%
                        </span>
                        {#if isSelected}
                          <Check class="w-3.5 h-3.5 text-emerald-500" />
                        {/if}
                      </div>
                    </button>
                  {/each}
                </div>

                <div class="pt-1.5 border-t border-border/60 flex items-center justify-between px-1">
                  <a
                    href="/proyectos"
                    onclick={() => (isProjectMenuOpen = false)}
                    class="w-full px-2.5 py-1.5 rounded-lg text-xs font-medium text-foreground hover:bg-accent flex items-center justify-between transition-colors"
                  >
                    <span class="flex items-center gap-2">
                      <FolderKanban class="w-3.5 h-3.5 text-muted-foreground" />
                      <span>Ver portafolio completo de obras</span>
                    </span>
                    <ChevronRight class="w-3.5 h-3.5 text-muted-foreground" />
                  </a>
                </div>
              </div>
            {/if}
          </div>

          <ChevronRight class="w-3.5 h-3.5 text-muted-foreground hidden sm:inline shrink-0" />

          <span class="text-xs font-semibold text-foreground truncate hidden sm:inline">
            {currentSectionLabel}
          </span>
        </div>

        <div class="flex items-center gap-2 shrink-0">
          {#if projectStore.currentUser.role === 'admin' && projectStore.viewingAsRole !== 'admin'}
            <Badge variant="outline" class="text-[11px] font-normal bg-muted/60 text-foreground border-border gap-1.5 whitespace-nowrap">
              <UserCog class="w-3 h-3 text-muted-foreground" />
              <span>Vista como: <strong class="font-medium capitalize">{projectStore.viewingAsRole}</strong></span>
            </Badge>
          {/if}

          <!-- Centro de Notificaciones y Firma Pendiente (Action Inbox) -->
          <div class="relative">
            <button
              type="button"
              onclick={() => {
                isNotificationsOpen = !isNotificationsOpen;
                isProjectMenuOpen = false;
              }}
              class="relative inline-flex h-8 items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 text-xs font-medium text-foreground transition-colors hover:bg-accent cursor-pointer"
              title="Centro de notificaciones y firmas pendientes"
            >
              <Bell class="h-3.5 w-3.5 text-muted-foreground" />
              <span class="hidden lg:inline text-[11px] font-medium whitespace-nowrap">Bandeja de firmas</span>
              {#if visibleInboxItems.length > 0}
                <span class="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-[#F5A400] px-1 font-mono text-[10px] font-bold text-black">
                  {visibleInboxItems.length}
                </span>
              {/if}
            </button>

            {#if isNotificationsOpen}
              <div
                class="fixed inset-0 z-40"
                onclick={() => (isNotificationsOpen = false)}
                role="presentation"
              ></div>

              <div
                class="fixed inset-x-3 top-15 sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-2 w-auto sm:w-[420px] rounded-2xl border border-border bg-popover text-popover-foreground shadow-2xl z-50 overflow-hidden"
              >
                <!-- Header del Action Inbox -->
                <div class="flex items-center justify-between gap-2 border-b border-border bg-muted/30 px-4 py-3">
                  <div>
                    <div class="flex items-center gap-2">
                      <span class="font-display text-xs font-bold text-foreground">
                        Centro de firmas y alertas operativas
                      </span>
                      <span class="rounded-md bg-muted px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase text-muted-foreground">
                        {projectStore.effectiveRole}
                      </span>
                    </div>
                    <p class="text-[11px] text-muted-foreground">
                      Tareas pendientes de aprobación, subsanación o sellado
                    </p>
                  </div>

                  {#if visibleInboxItems.length > 0}
                    <button
                      type="button"
                      onclick={markAllNotificationsRead}
                      class="inline-flex shrink-0 cursor-pointer items-center gap-1 rounded-lg border border-border bg-background px-2 py-1 text-[10px] font-medium whitespace-nowrap text-muted-foreground hover:text-foreground"
                    >
                      <CheckCheck class="h-3 w-3" />
                      Limpiar ({visibleInboxItems.length})
                    </button>
                  {:else if dismissedNotificationIds.length > 0}
                    <button
                      type="button"
                      onclick={resetDismissedNotifications}
                      class="inline-flex shrink-0 cursor-pointer items-center gap-1 rounded-lg border border-border bg-background px-2 py-1 text-[10px] font-medium whitespace-nowrap text-muted-foreground hover:text-foreground"
                    >
                      Restaurar ({rawActionInboxItems.length})
                    </button>
                  {/if}
                </div>

                <!-- Selector de pestaña interna -->
                <div class="grid grid-cols-2 gap-1 border-b border-border bg-muted/15 p-1.5 text-xs">
                  <button
                    type="button"
                    onclick={() => (inboxTab = 'acciones')}
                    class="cursor-pointer rounded-lg py-1.5 font-medium whitespace-nowrap transition-colors {inboxTab === 'acciones'
                      ? 'bg-background text-foreground shadow-2xs'
                      : 'text-muted-foreground hover:text-foreground'}"
                  >
                    Por atender ({visibleInboxItems.length})
                  </button>
                  <button
                    type="button"
                    onclick={() => (inboxTab = 'actividad')}
                    class="cursor-pointer rounded-lg py-1.5 font-medium whitespace-nowrap transition-colors {inboxTab === 'actividad'
                      ? 'bg-background text-foreground shadow-2xs'
                      : 'text-muted-foreground hover:text-foreground'}"
                  >
                    Últimos eventos ({projectStore.auditLogs.slice(0, 5).length})
                  </button>
                </div>

                {#if inboxTab === 'acciones'}
                  <div class="max-h-84 overflow-y-auto divide-y divide-border">
                    {#if visibleInboxItems.length === 0}
                      <div class="p-6 text-center space-y-2">
                        <ShieldCheck class="mx-auto h-7 w-7 text-emerald-500" />
                        <div class="text-xs font-semibold text-foreground">
                          Bandeja al día para tu rol
                        </div>
                        <p class="text-[11px] text-muted-foreground">
                          No tienes firmas ni alertas pendientes por revisar en esta vista.
                        </p>
                      </div>
                    {:else}
                      {#each visibleInboxItems as item (item.id)}
                        <a
                          href={item.href}
                          onclick={() => (isNotificationsOpen = false)}
                          class="flex items-start justify-between gap-3 px-4 py-3 transition-colors hover:bg-muted/40"
                        >
                          <div class="flex items-start gap-2.5 min-w-0">
                            <div class="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border {item.tone === 'critical'
                              ? 'border-rose-500/30 bg-rose-500/10 text-rose-500'
                              : item.tone === 'warning'
                                ? 'border-amber-500/30 bg-amber-500/10 text-amber-500'
                                : 'border-sky-500/30 bg-sky-500/10 text-sky-500'}">
                              {#if item.tone === 'critical'}
                                <ShieldAlert class="h-3.5 w-3.5" />
                              {:else if item.tone === 'warning'}
                                <Clock class="h-3.5 w-3.5" />
                              {:else}
                                <FileSignature class="h-3.5 w-3.5" />
                              {/if}
                            </div>
                            <div class="min-w-0 space-y-0.5">
                              <div class="flex flex-wrap items-center gap-1.5">
                                <span class="rounded px-1.5 py-0.2 font-mono text-[10px] font-semibold whitespace-nowrap {item.tone === 'critical'
                                  ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                                  : item.tone === 'warning'
                                    ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                                    : 'bg-sky-500/15 text-sky-600 dark:text-sky-400'}">
                                  {item.badge}
                                </span>
                                <span class="text-[10px] text-muted-foreground whitespace-nowrap">
                                  · {item.roleLabel}
                                </span>
                              </div>
                              <p class="text-xs font-semibold text-foreground leading-snug">
                                {item.title}
                              </p>
                              <p class="text-[11px] text-muted-foreground line-clamp-1">
                                {item.subtitle}
                              </p>
                            </div>
                          </div>
                          <ArrowUpRight class="mt-1 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                        </a>
                      {/each}
                    {/if}
                  </div>
                {:else}
                  <div class="max-h-84 overflow-y-auto divide-y divide-border">
                    {#each projectStore.auditLogs.slice(0, 5) as log (log.id)}
                      <a
                        href="/auditoria"
                        onclick={() => (isNotificationsOpen = false)}
                        class="block px-4 py-2.5 transition-colors hover:bg-muted/40"
                      >
                        <div class="flex items-center justify-between gap-2 text-[10px] text-muted-foreground">
                          <span class="font-semibold text-foreground">{log.actorName}</span>
                          <span class="font-mono whitespace-nowrap">{log.timestamp}</span>
                        </div>
                        <p class="mt-0.5 text-xs font-medium text-foreground line-clamp-1">
                          {log.actionTitle}
                        </p>
                        <p class="mt-0.5 font-mono text-[10px] text-muted-foreground truncate">
                          {log.entityRef}
                        </p>
                      </a>
                    {/each}
                  </div>
                {/if}

                <div class="border-t border-border bg-muted/20 px-4 py-2.5 flex items-center justify-between text-xs">
                  <a
                    href="/auditoria"
                    onclick={() => (isNotificationsOpen = false)}
                    class="font-medium text-foreground hover:underline flex items-center gap-1"
                  >
                    <span>Abrir bitácora forense de auditoría</span>
                    <ChevronRight class="h-3.5 w-3.5" />
                  </a>
                  <span class="font-mono text-[10px] text-muted-foreground">
                    {projectStore.auditLogs.length} eventos
                  </span>
                </div>
              </div>
            {/if}
          </div>

          <Button
            variant="outline"
            size="icon"
            onclick={() => projectStore.toggleTheme()}
            title={projectStore.isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            class="h-8 w-8 cursor-pointer"
          >
            {#if projectStore.isDark}
              <Sun class="w-4 h-4 text-muted-foreground" />
            {:else}
              <Moon class="w-4 h-4 text-muted-foreground" />
            {/if}
          </Button>
        </div>
      </header>

      <main class="flex-1 w-full px-3.5 sm:px-6 lg:px-8 py-4 sm:py-6 overflow-x-hidden">
        {@render children()}
      </main>

      <footer class="border-t border-border bg-card/50 py-3.5 px-3.5 sm:px-6 lg:px-8 text-xs text-muted-foreground">
        <div class="w-full flex flex-col sm:flex-row items-center justify-between gap-3">
          <div class="flex items-center gap-2">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span class="text-foreground font-medium">tramo</span>
            <span>• Certificación de avances de obra en Stellar Soroban</span>
          </div>
          <div class="flex items-center gap-4">
            <a href="/propietario" class="hover:text-foreground transition-colors">Portal de propietarios</a>
            <span>•</span>
            <a href="/verificar" class="hover:text-foreground transition-colors">Verificador público</a>
          </div>
        </div>
      </footer>
    </div>
  </div>
{/if}
