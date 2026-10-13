<script lang="ts">
  import { page } from '$app/state';
  import { goto } from '$app/navigation';
  import {
    LayoutDashboard,
    Box,
    HardHat,
    Landmark,
    ShieldCheck,
    Sun,
    Moon,
    FolderKanban,
    ChevronsUpDown,
    UserCog,
    LogOut,
    Building2,
    Settings,
    Bell,
    KeyRound,
    ExternalLink,
    X,
    IdCard,
    Camera,
    FileCheck2,
    CalendarDays,
    History
  } from '@lucide/svelte';
  import { Button } from '$lib/components/ui/button';
  import { Badge } from '$lib/components/ui/badge';
  import TramoBrandLogo from '$lib/components/ui/TramoBrandLogo.svelte';
  import { projectStore, AVAILABLE_PROFILES } from '$lib/stores/projectState.svelte';
  import type { UserRole } from '$lib/types/twin';

  let {
    isCollapsed = $bindable(false),
    isMobileOpen = $bindable(false)
  }: {
    isCollapsed?: boolean;
    isMobileOpen?: boolean;
  } = $props();

  let isUserMenuOpen = $state(false);
  let notificationsEnabled = $state(true);

  const roleLabels: Record<UserRole, { label: string; dot: string }> = {
    admin: { label: 'Administrador', dot: 'bg-[#F5A400]' },
    fiduciaria: { label: 'Fiduciaria', dot: 'bg-emerald-500' },
    constructor: { label: 'Constructor', dot: 'bg-blue-500' },
    interventor: { label: 'Interventor', dot: 'bg-amber-500' }
  };

  const platformNavItems = $derived.by(() => {
    const role = projectStore.effectiveRole;
    const items = [
      { href: '/', label: 'Inicio', icon: LayoutDashboard, roles: ['admin', 'fiduciaria', 'constructor', 'interventor'] },
      { href: '/ficha-proyecto', label: 'Ficha del proyecto', icon: Building2, roles: ['admin', 'fiduciaria', 'constructor', 'interventor'] },
      { href: '/gemelo', label: 'Vista 3D', icon: Box, roles: ['admin', 'fiduciaria', 'constructor', 'interventor'] },
      { href: '/evidencias', label: 'Evidencias fotográficas', icon: Camera, roles: ['admin', 'fiduciaria', 'constructor', 'interventor'] },
      { href: '/cumplimiento', label: 'Cumplimiento y documentos', icon: FileCheck2, roles: ['admin', 'fiduciaria', 'constructor', 'interventor'] },
      { href: '/calendario', label: 'Calendario y agenda', icon: CalendarDays, roles: ['admin', 'fiduciaria', 'constructor', 'interventor'] },
      { href: '/interventor', label: 'Interventoría técnica', icon: HardHat, roles: ['admin', 'interventor'] },
      {
        href: '/fiduciaria',
        label: role === 'constructor' ? 'Mis cortes y giros' : 'Fiduciaria y desembolsos',
        icon: Landmark,
        roles: ['admin', 'fiduciaria', 'constructor']
      },
      { href: '/auditoria', label: 'Auditoría y trazabilidad', icon: History, roles: ['admin', 'fiduciaria', 'constructor', 'interventor'] },
      { href: '/proyectos', label: 'Portafolio de obras', icon: FolderKanban, roles: ['admin', 'fiduciaria', 'constructor'] }
    ];
    return items.filter((item) => item.roles.includes(role));
  });

  function closeMobileNav() {
    isMobileOpen = false;
  }

  function handleLogout() {
    isUserMenuOpen = false;
    isMobileOpen = false;
    projectStore.logout();
    goto('/login');
  }
</script>

<!-- 1. Menú lateral de escritorio (oculto en pantallas móviles < md) -->
<aside
  class="hidden md:flex h-screen sticky top-0 z-40 flex-col border-r border-border bg-sidebar text-sidebar-foreground transition-all duration-200 select-none shrink-0 {isCollapsed
    ? 'w-[68px] overflow-visible'
    : 'w-64 overflow-hidden'}"
>
  <!-- Cabecera del menú lateral de escritorio -->
  <div class="h-14 px-3 border-b border-border flex items-center {isCollapsed ? 'justify-center' : 'justify-between'}">
    {#if isCollapsed}
      <div class="relative group/tip flex items-center justify-center">
        <a
          href="/"
          title="tramo — Ir al inicio"
          aria-label="tramo — Ir al inicio"
          class="flex items-center justify-center w-10 h-10 rounded-xl hover:bg-accent/60 transition-colors"
        >
          <TramoBrandLogo variant="isotipo" class="h-6 w-6" />
        </a>

        <!-- Tooltip -->
        <div
          role="tooltip"
          class="pointer-events-none absolute left-full ml-3 top-1/2 -translate-y-1/2 z-50 hidden group-hover/tip:flex items-center px-2.5 py-1.5 rounded-lg bg-popover text-popover-foreground text-xs font-semibold shadow-xl border border-border whitespace-nowrap"
        >
          <div class="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 rotate-45 bg-popover border-l border-b border-border"></div>
          <span class="relative z-10">tramo — Ir al inicio</span>
        </div>
      </div>
    {:else}
      <a href="/" class="flex items-center gap-2.5 pl-1 overflow-hidden">
        <TramoBrandLogo variant="full" isDark={projectStore.isDark} class="h-5 w-auto" />
      </a>
    {/if}
  </div>

  <!-- Cuerpo del menú lateral de escritorio -->
  <div
    class="flex-1 {isCollapsed ? 'overflow-visible' : 'overflow-y-auto'} flex flex-col justify-between {isCollapsed ? 'px-2 py-2.5 gap-4' : 'px-3 py-3.5 gap-5'}"
  >
    <!-- Parte superior: Navegación principal -->
    <div class="space-y-1">
      {#if !isCollapsed}
        <div class="px-2.5 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/80">
          Módulos del proyecto
        </div>
      {/if}
      {#each platformNavItems as item (item.href)}
        {@const isActive = page.url.pathname === item.href}
        {#if isCollapsed}
          <div class="relative group/tip flex items-center justify-center">
            <a
              href={item.href}
              title={item.label}
              aria-label={item.label}
              class="relative flex items-center justify-center w-10 h-10 rounded-xl transition-all {isActive
                ? 'bg-foreground text-background font-semibold shadow-2xs'
                : 'text-muted-foreground hover:text-foreground hover:bg-accent/60 font-medium'}"
            >
              <item.icon
                class="w-[18px] h-[18px] shrink-0 transition-transform group-hover/tip:scale-105 {isActive
                  ? 'text-background'
                  : 'text-muted-foreground group-hover/tip:text-foreground'}"
              />
            </a>

            <!-- Tooltip con título del módulo -->
            <div
              role="tooltip"
              class="pointer-events-none absolute left-full ml-3 top-1/2 -translate-y-1/2 z-50 hidden group-hover/tip:flex items-center px-2.5 py-1.5 rounded-lg bg-popover text-popover-foreground text-xs font-semibold shadow-xl border border-border whitespace-nowrap"
            >
              <div class="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 rotate-45 bg-popover border-l border-b border-border"></div>
              <span class="relative z-10">{item.label}</span>
            </div>
          </div>
        {:else}
          <a
            href={item.href}
            class="flex items-center gap-3 px-2.5 py-2 rounded-lg text-xs transition-all {isActive
              ? 'bg-foreground text-background font-semibold shadow-2xs'
              : 'text-muted-foreground hover:text-foreground hover:bg-accent/60 font-medium'}"
          >
            <item.icon
              class="w-4 h-4 shrink-0 transition-transform group-hover:scale-105 {isActive
                ? 'text-background'
                : 'text-muted-foreground group-hover:text-foreground'}"
            />
            <span class="truncate">{item.label}</span>
          </a>
        {/if}
      {/each}
    </div>

    <!-- Parte inferior del menú vertical: Simulador de rol + Portales públicos (Propietario y Verificador) -->
    <div class="space-y-3 pt-2">
      {#if projectStore.currentUser.role === 'admin' && !isCollapsed}
        <div class="p-3 rounded-xl border border-border bg-muted/30 space-y-2">
          <div class="flex items-center gap-1.5 text-[11px] font-medium text-foreground">
            <UserCog class="w-3.5 h-3.5 text-muted-foreground" />
            <span>Simulador de rol</span>
          </div>
          <div class="grid grid-cols-2 gap-1">
            {#each ['admin', 'fiduciaria', 'constructor', 'interventor'] as r (r)}
              {@const roleKey = r as UserRole}
              <button
                type="button"
                onclick={() => projectStore.setViewingRole(roleKey)}
                class="px-2 py-1.5 rounded-md text-[11px] capitalize text-left transition-all cursor-pointer {projectStore.viewingAsRole === roleKey
                  ? 'bg-foreground text-background font-medium'
                  : 'bg-background text-muted-foreground hover:text-foreground border border-border/60'}"
              >
                {roleKey === 'admin' ? 'Admin' : roleKey}
              </button>
            {/each}
          </div>
        </div>
      {/if}

      <div class="space-y-1 pt-3 border-t border-border/60">
        {#if !isCollapsed}
          <div class="px-2.5 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/80">
            Portales públicos
          </div>
        {/if}
        {#if isCollapsed}
          <div class="relative group/tip flex items-center justify-center">
            <a
              href="/propietario"
              title="Portal de propietarios"
              aria-label="Portal de propietarios"
              class="flex items-center justify-center w-10 h-10 rounded-xl font-medium text-muted-foreground hover:text-foreground hover:bg-accent/60 transition-colors"
            >
              <IdCard class="w-[18px] h-[18px] shrink-0" />
            </a>
            <div
              role="tooltip"
              class="pointer-events-none absolute left-full ml-3 top-1/2 -translate-y-1/2 z-50 hidden group-hover/tip:flex items-center px-2.5 py-1.5 rounded-lg bg-popover text-popover-foreground text-xs font-semibold shadow-xl border border-border whitespace-nowrap"
            >
              <div class="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 rotate-45 bg-popover border-l border-b border-border"></div>
              <span class="relative z-10">Portal de propietarios</span>
            </div>
          </div>

          <div class="relative group/tip flex items-center justify-center">
            <a
              href="/verificar"
              title="Verificador público"
              aria-label="Verificador público"
              class="flex items-center justify-center w-10 h-10 rounded-xl font-medium text-muted-foreground hover:text-foreground hover:bg-accent/60 transition-colors"
            >
              <ShieldCheck class="w-[18px] h-[18px] shrink-0" />
            </a>
            <div
              role="tooltip"
              class="pointer-events-none absolute left-full ml-3 top-1/2 -translate-y-1/2 z-50 hidden group-hover/tip:flex items-center px-2.5 py-1.5 rounded-lg bg-popover text-popover-foreground text-xs font-semibold shadow-xl border border-border whitespace-nowrap"
            >
              <div class="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 rotate-45 bg-popover border-l border-b border-border"></div>
              <span class="relative z-10">Verificador público</span>
            </div>
          </div>
        {:else}
          <a
            href="/propietario"
            class="group flex items-center justify-between gap-2 px-2.5 py-2 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent/60 transition-colors"
          >
            <span class="flex items-center gap-3 min-w-0">
              <IdCard class="w-4 h-4 shrink-0" />
              <span class="truncate">Portal de propietarios</span>
            </span>
            <ExternalLink class="w-3 h-3 opacity-50 shrink-0" />
          </a>

          <a
            href="/verificar"
            class="group flex items-center justify-between gap-2 px-2.5 py-2 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent/60 transition-colors"
          >
            <span class="flex items-center gap-3 min-w-0">
              <ShieldCheck class="w-4 h-4 shrink-0" />
              <span class="truncate">Verificador público</span>
            </span>
            <ExternalLink class="w-3 h-3 opacity-50 shrink-0" />
          </a>
        {/if}
      </div>
    </div>
  </div>

  <!-- 3. Pie del menú lateral: Cuenta de usuario y sesión -->
  <div class="p-2.5 border-t border-border relative">
    {#if isCollapsed}
      <div class="relative group/tip flex items-center justify-center">
        <button
          type="button"
          onclick={() => (isUserMenuOpen = !isUserMenuOpen)}
          title="{projectStore.currentUser.fullName} • {projectStore.currentUser.companyName}"
          aria-label="Opciones de cuenta y sesión"
          class="flex items-center justify-center p-1.5 rounded-xl hover:bg-accent transition-colors cursor-pointer"
        >
          <div class="w-8 h-8 rounded-lg bg-muted border border-border text-foreground flex items-center justify-center text-xs font-semibold shrink-0">
            {projectStore.currentUser.avatarInitials}
          </div>
        </button>

        <div
          role="tooltip"
          class="pointer-events-none absolute left-full ml-3 top-1/2 -translate-y-1/2 z-50 hidden group-hover/tip:flex items-center px-2.5 py-1.5 rounded-lg bg-popover text-popover-foreground text-xs font-semibold shadow-xl border border-border whitespace-nowrap"
        >
          <div class="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 rotate-45 bg-popover border-l border-b border-border"></div>
          <span class="relative z-10">{projectStore.currentUser.fullName} • {projectStore.currentUser.companyName}</span>
        </div>
      </div>
    {:else}
      <button
        type="button"
        onclick={() => (isUserMenuOpen = !isUserMenuOpen)}
        class="w-full flex items-center justify-between gap-2.5 p-2 rounded-xl hover:bg-accent transition-colors text-left cursor-pointer"
      >
        <div class="flex items-center gap-2.5 min-w-0">
          <div class="w-8 h-8 rounded-lg bg-muted border border-border text-foreground flex items-center justify-center text-xs font-semibold shrink-0">
            {projectStore.currentUser.avatarInitials}
          </div>
          <div class="min-w-0 flex-1">
            <div class="text-xs font-medium text-foreground truncate">
              {projectStore.currentUser.fullName}
            </div>
            <div class="text-[11px] text-muted-foreground truncate">
              {projectStore.currentUser.companyName}
            </div>
          </div>
        </div>
        <ChevronsUpDown class="w-3.5 h-3.5 text-muted-foreground shrink-0" />
      </button>
    {/if}

    {#if isUserMenuOpen}
      <div
        class="fixed inset-0 z-40"
        onclick={() => (isUserMenuOpen = false)}
        role="presentation"
      ></div>
      <div
        class="absolute left-2.5 bottom-full mb-2 w-72 rounded-xl border border-border bg-popover text-popover-foreground shadow-xl z-50 p-1.5 space-y-1"
      >
        <div class="px-2.5 py-2 border-b border-border/60">
          <div class="flex items-center justify-between gap-2">
            <span class="text-xs font-semibold text-foreground truncate">{projectStore.currentUser.fullName}</span>
            <Badge variant="outline" class="text-[10px] font-normal bg-muted/50 border-border gap-1">
              <span class="w-1.5 h-1.5 rounded-full {roleLabels[projectStore.effectiveRole].dot}"></span>
              <span>{roleLabels[projectStore.effectiveRole].label}</span>
            </Badge>
          </div>
          <div class="text-[11px] text-muted-foreground truncate mt-0.5">{projectStore.currentUser.email}</div>
        </div>

        <div class="py-1 space-y-0.5">
          <button
            type="button"
            onclick={() => {
              isUserMenuOpen = false;
              projectStore.openAccountModal();
            }}
            class="w-full px-2.5 py-1.5 rounded-lg text-xs flex items-center gap-2 hover:bg-accent text-foreground transition-colors cursor-pointer"
          >
            <Settings class="w-3.5 h-3.5 text-muted-foreground" />
            <span>Detalles de la cuenta</span>
          </button>

          <button
            type="button"
            onclick={() => projectStore.toggleTheme()}
            class="w-full px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between hover:bg-accent text-foreground transition-colors cursor-pointer"
          >
            <span class="flex items-center gap-2">
              {#if projectStore.isDark}
                <Sun class="w-3.5 h-3.5 text-muted-foreground" />
                <span>Cambiar a tema claro</span>
              {:else}
                <Moon class="w-3.5 h-3.5 text-muted-foreground" />
                <span>Cambiar a tema oscuro</span>
              {/if}
            </span>
          </button>
        </div>

        <div class="py-1 border-t border-border/60">
          <div class="px-2.5 py-1 text-[11px] text-muted-foreground">
            Cambiar cuenta de demostración
          </div>
          {#each AVAILABLE_PROFILES as prof (prof.id)}
            <button
              type="button"
              onclick={() => {
                projectStore.loginWithProfile(prof);
                isUserMenuOpen = false;
              }}
              class="w-full px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between hover:bg-accent transition-colors cursor-pointer {projectStore.currentUser.id === prof.id
                ? 'bg-accent/60 font-medium text-foreground'
                : 'text-muted-foreground'}"
            >
              <span class="truncate">{prof.fullName}</span>
              <span class="text-[11px] capitalize text-muted-foreground">{prof.role}</span>
            </button>
          {/each}
        </div>

        <div class="pt-1 border-t border-border/60">
          <button
            type="button"
            onclick={handleLogout}
            class="w-full px-2.5 py-1.5 rounded-lg text-xs font-medium text-red-500 hover:bg-red-500/10 flex items-center gap-2 transition-colors cursor-pointer"
          >
            <LogOut class="w-3.5 h-3.5" />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </div>
    {/if}
  </div>
</aside>

<!-- 2. Cajón deslizante lateral exclusivo para celular y tablet (< md) -->
{#if isMobileOpen}
  <div
    class="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs md:hidden"
    onclick={closeMobileNav}
    role="presentation"
  ></div>

  <aside
    class="fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] flex flex-col border-r border-border bg-sidebar text-sidebar-foreground shadow-2xl md:hidden select-none animate-in slide-in-from-left duration-200"
  >
    <!-- Cabecera del cajón móvil con logo y botón cerrar -->
    <div class="h-14 px-4 border-b border-border flex items-center justify-between">
      <a href="/" onclick={closeMobileNav} class="flex items-center gap-2">
        <TramoBrandLogo variant="full" isDark={projectStore.isDark} class="h-5 w-auto" />
      </a>

      <button
        type="button"
        onclick={closeMobileNav}
        class="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent cursor-pointer"
        aria-label="Cerrar menú"
      >
        <X class="w-4 h-4" />
      </button>
    </div>

    <!-- Navegación móvil -->
    <div class="flex-1 overflow-y-auto px-3 py-3.5 flex flex-col justify-between gap-5">
      <div class="space-y-1">
        <div class="px-2.5 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/80">
          Módulos del proyecto
        </div>
        {#each platformNavItems as item (item.href)}
          {@const isActive = page.url.pathname === item.href}
          <a
            href={item.href}
            onclick={closeMobileNav}
            class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors {isActive
              ? 'bg-foreground text-background font-semibold shadow-2xs'
              : 'text-muted-foreground hover:text-foreground hover:bg-accent/60'}"
          >
            <item.icon class="w-4 h-4 shrink-0 {isActive ? 'text-background' : 'text-muted-foreground'}" />
            <span class="truncate">{item.label}</span>
          </a>
        {/each}
      </div>

      <!-- Simulador de rol + Portales públicos en móvil -->
      <div class="space-y-3 pt-2">
        {#if projectStore.currentUser.role === 'admin'}
          <div class="p-3 rounded-xl border border-border bg-muted/30 space-y-2">
            <div class="flex items-center gap-1.5 text-[11px] font-medium text-foreground">
              <UserCog class="w-3.5 h-3.5 text-muted-foreground" />
              <span>Simulador de rol</span>
            </div>
            <div class="grid grid-cols-2 gap-1">
              {#each ['admin', 'fiduciaria', 'constructor', 'interventor'] as r (r)}
                {@const roleKey = r as UserRole}
                <button
                  type="button"
                  onclick={() => {
                    projectStore.setViewingRole(roleKey);
                    closeMobileNav();
                  }}
                  class="px-2 py-1.5 rounded-md text-[11px] capitalize text-left transition-all cursor-pointer {projectStore.viewingAsRole === roleKey
                    ? 'bg-foreground text-background font-medium'
                    : 'bg-background text-muted-foreground hover:text-foreground border border-border/60'}"
                >
                  {roleKey === 'admin' ? 'Admin' : roleKey}
                </button>
              {/each}
            </div>
          </div>
        {/if}

        <div class="space-y-1 pt-3 border-t border-border/60">
          <div class="px-2.5 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/80">
            Portales públicos
          </div>
          <a
            href="/propietario"
            onclick={closeMobileNav}
            class="flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent/60"
          >
            <span class="flex items-center gap-3 truncate">
              <IdCard class="w-4 h-4 shrink-0" />
              <span>Portal de propietarios</span>
            </span>
            <ExternalLink class="w-3 h-3 opacity-50 shrink-0" />
          </a>

          <a
            href="/verificar"
            onclick={closeMobileNav}
            class="flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent/60"
          >
            <span class="flex items-center gap-3 truncate">
              <ShieldCheck class="w-4 h-4 shrink-0" />
              <span>Verificador público</span>
            </span>
            <ExternalLink class="w-3 h-3 opacity-50 shrink-0" />
          </a>
        </div>
      </div>
    </div>

    <!-- Pie de usuario en móvil -->
    <div class="p-3 border-t border-border">
      <div class="flex items-center justify-between gap-2 p-2 rounded-xl bg-muted/30 border border-border">
        <div class="flex items-center gap-2.5 min-w-0">
          <div class="w-8 h-8 rounded-lg bg-muted border border-border text-foreground flex items-center justify-center text-xs font-semibold shrink-0">
            {projectStore.currentUser.avatarInitials}
          </div>
          <div class="min-w-0 flex-1">
            <div class="text-xs font-medium text-foreground truncate">
              {projectStore.currentUser.fullName}
            </div>
            <div class="text-[11px] text-muted-foreground truncate">
              {roleLabels[projectStore.effectiveRole].label}
            </div>
          </div>
        </div>

        <button
          type="button"
          onclick={handleLogout}
          title="Cerrar sesión"
          class="p-1.5 rounded-lg text-red-500 hover:bg-red-500/10 cursor-pointer"
        >
          <LogOut class="w-4 h-4" />
        </button>
      </div>
    </div>
  </aside>
{/if}

<!-- Modal de detalles de cuenta -->
{#if projectStore.isAccountModalOpen}
  <div class="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 overflow-y-auto">
    <div class="w-full sm:max-w-lg max-h-[92dvh] sm:max-h-none rounded-t-2xl sm:rounded-xl border border-border bg-card text-card-foreground shadow-xl overflow-hidden flex flex-col">
      <div class="p-4 sm:p-5 border-b border-border flex items-center justify-between shrink-0">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-lg bg-muted border border-border text-foreground flex items-center justify-center font-semibold text-sm">
            {projectStore.currentUser.avatarInitials}
          </div>
          <div>
            <h3 class="text-sm font-semibold text-foreground">Detalles de la cuenta</h3>
            <p class="text-xs text-muted-foreground">Información corporativa y llave de firma asociada</p>
          </div>
        </div>
        <button
          type="button"
          onclick={() => projectStore.closeAccountModal()}
          class="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent cursor-pointer shrink-0"
        >
          <X class="w-4 h-4" />
        </button>
      </div>

      <div class="p-4 sm:p-5 space-y-4 text-xs overflow-y-auto flex-1">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-lg bg-muted/30 border border-border">
          <div>
            <span class="text-[11px] text-muted-foreground block">Titular</span>
            <span class="font-medium text-foreground">{projectStore.currentUser.fullName}</span>
          </div>
          <div>
            <span class="text-[11px] text-muted-foreground block">Organización</span>
            <span class="font-medium text-foreground">{projectStore.currentUser.companyName}</span>
          </div>
          <div>
            <span class="text-[11px] text-muted-foreground block">Correo corporativo</span>
            <span class="text-foreground break-all">{projectStore.currentUser.email}</span>
          </div>
          <div>
            <span class="text-[11px] text-muted-foreground block">Registro / NIT</span>
            <span class="font-mono text-foreground">{projectStore.currentUser.licenseNumber}</span>
          </div>
        </div>

        <div class="p-3.5 rounded-lg bg-muted/30 border border-border space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-[11px] text-muted-foreground flex items-center gap-1.5">
              <KeyRound class="w-3.5 h-3.5" />
              <span>Llave pública en Stellar Soroban</span>
            </span>
            <Badge variant="outline" class="text-[10px] font-normal bg-background border-border gap-1">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span>Activa</span>
            </Badge>
          </div>
          <div class="p-2 rounded bg-background border border-border font-mono text-[11px] text-foreground truncate">
            GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5
          </div>
        </div>

        <div class="flex items-center justify-between p-3.5 rounded-lg bg-muted/30 border border-border">
          <div class="flex items-center gap-2.5">
            <Bell class="w-4 h-4 text-muted-foreground" />
            <div>
              <div class="font-medium text-foreground">Notificaciones de nuevos cortes</div>
              <div class="text-[11px] text-muted-foreground">Recibir aviso por correo cuando se certifique un avance</div>
            </div>
          </div>
          <input type="checkbox" bind:checked={notificationsEnabled} class="w-4 h-4 cursor-pointer" />
        </div>
      </div>

      <div class="p-4 border-t border-border bg-muted/20 flex items-center justify-between shrink-0">
        <Button
          variant="outline"
          size="sm"
          onclick={handleLogout}
          class="text-xs text-red-500 hover:text-red-600 cursor-pointer gap-1.5"
        >
          <LogOut class="w-3.5 h-3.5" />
          <span>Cerrar sesión</span>
        </Button>

        <Button
          size="sm"
          onclick={() => projectStore.closeAccountModal()}
          class="bg-foreground text-background hover:bg-foreground/90 font-medium text-xs cursor-pointer"
        >
          Listo
        </Button>
      </div>
    </div>
  </div>
{/if}
