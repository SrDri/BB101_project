<script lang="ts">
  import { page } from '$app/state';
  import { projectStore, AVAILABLE_PROFILES } from '$lib/stores/projectState.svelte';
  import { Button } from '$lib/components/ui/button';
  import { Badge } from '$lib/components/ui/badge';
  import type { UserRole } from '$lib/types/twin';
  import {
    Shield,
    Layers,
    HardHat,
    Building2,
    SearchCheck,
    Sun,
    Moon,
    FolderKanban,
    UserCog,
    LogIn,
    ChevronDown
  } from '@lucide/svelte';

  const allNavLinks = [
    { href: '/', label: 'Gemelo 3D', icon: Layers, roles: ['admin', 'fiduciaria', 'constructor', 'interventor'] },
    { href: '/proyectos', label: 'Proyectos', icon: FolderKanban, roles: ['admin', 'fiduciaria', 'constructor', 'interventor'] },
    { href: '/interventor', label: 'Interventor (Obra)', icon: HardHat, roles: ['admin', 'interventor'] },
    { href: '/fiduciaria', label: 'Fiduciaria & Giros', icon: Building2, roles: ['admin', 'fiduciaria', 'constructor'] },
    { href: '/verificar', label: 'Verificación', icon: SearchCheck, roles: ['admin', 'fiduciaria', 'constructor', 'interventor'] }
  ];

  let visibleLinks = $derived(
    allNavLinks.filter(link => link.roles.includes(projectStore.effectiveRole))
  );

  let activeProjects = $derived(
    projectStore.projects.filter(p => p.lifecycleStatus === 'in_progress')
  );

  function handleProjectChange(e: Event) {
    const target = e.target as HTMLSelectElement;
    if (target.value === '__ALL__') {
      window.location.href = '/proyectos';
    } else {
      projectStore.selectProject(target.value);
    }
  }

  function handleRoleSwitch(e: Event) {
    const target = e.target as HTMLSelectElement;
    projectStore.setViewingRole(target.value as UserRole);
  }
</script>

<header class="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
  <div class="w-full px-6 lg:px-10 h-16 flex items-center justify-between gap-3">
    <!-- Izquierda: Logo Oficial + Selector Desplegable de Proyectos Activos -->
    <div class="flex items-center gap-4">
      <a href="/" class="flex items-center gap-2.5 shrink-0">
        {#if projectStore.isDark}
          <img src="/white_logo_ui_v1.svg" alt="tramo" class="h-7 w-auto" />
        {:else}
          <img src="/black_logo_ui_v1.svg" alt="tramo" class="h-7 w-auto" />
        {/if}
      </a>

      <!-- Selector Desplegable de Proyectos Activos en el Header -->
      <div class="hidden lg:flex items-center gap-2 border-l border-border pl-4">
        <div class="relative flex items-center">
          <select
            value={projectStore.selectedProjectId}
            onchange={handleProjectChange}
            aria-label="Seleccionar proyecto activo"
            class="appearance-none bg-muted/60 hover:bg-muted border border-border rounded-lg pl-3 pr-8 py-1.5 text-xs font-semibold text-foreground focus:outline-none focus:border-[#F5A400] transition-colors cursor-pointer tabular-nums"
          >
            <optgroup label="Proyectos Activos (En Ejecución)">
              {#each activeProjects as proj}
                <option value={proj.projectId} class="bg-card text-foreground">
                  {proj.projectName} ({proj.certifiedPhysicalProgress}%)
                </option>
              {/each}
            </optgroup>
            <optgroup label="Otros Proyectos (Por Empezar / Terminados)">
              {#each projectStore.projects.filter(p => p.lifecycleStatus !== 'in_progress') as proj}
                <option value={proj.projectId} class="bg-card text-foreground">
                  {proj.projectName} ({proj.lifecycleStatus === 'completed' ? '100% Terminado' : 'Por Empezar'})
                </option>
              {/each}
            </optgroup>
          </select>
          <ChevronDown class="w-3.5 h-3.5 text-muted-foreground absolute right-2.5 pointer-events-none" />
        </div>
      </div>
    </div>

    <!-- Centro: Navegación Contextual por Perfil -->
    <nav class="hidden md:flex items-center gap-1 bg-muted/60 p-1 rounded-lg border border-border">
      {#each visibleLinks as link}
        {@const isActive = page.url.pathname === link.href}
        {@const Icon = link.icon}
        <a
          href={link.href}
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all {isActive
            ? 'bg-background text-foreground font-semibold shadow-xs border border-border/80'
            : 'text-muted-foreground hover:text-foreground hover:bg-background/50'}"
        >
          <Icon class="w-3.5 h-3.5 {isActive ? 'text-[#F5A400]' : 'text-muted-foreground'}" />
          <span>{link.label}</span>
        </a>
      {/each}
    </nav>

    <!-- Derecha: Selector de Perfil del Administrador + Tema + Login -->
    <div class="flex items-center gap-2">
      <!-- Si el usuario es Administrador, puede seleccionar qué perfil ver -->
      {#if projectStore.currentUser.role === 'admin'}
        <div class="hidden sm:flex items-center gap-1.5 bg-[#F5A400]/10 border border-[#F5A400]/30 rounded-lg px-2.5 py-1">
          <UserCog class="w-3.5 h-3.5 text-[#F5A400]" />
          <span class="text-[10px] font-semibold text-[#F5A400] uppercase">Vista Admin:</span>
          <select
            value={projectStore.viewingAsRole}
            onchange={handleRoleSwitch}
            aria-label="Seleccionar perfil a visualizar"
            class="bg-transparent text-xs font-bold text-foreground focus:outline-none cursor-pointer"
          >
            <option value="admin" class="bg-card text-foreground">Administrador (Todo)</option>
            <option value="fiduciaria" class="bg-card text-foreground">Perfil Fiduciaria</option>
            <option value="constructor" class="bg-card text-foreground">Perfil Constructor</option>
            <option value="interventor" class="bg-card text-foreground">Perfil Interventor</option>
          </select>
        </div>
      {:else}
        <Badge variant="outline" class="hidden sm:inline-flex text-[11px] border-border bg-muted/40">
          Perfil: <strong class="text-[#F5A400] ml-1 capitalize">{projectStore.currentUser.role}</strong>
        </Badge>
      {/if}

      <!-- Botón de Cambio de Tema Claro / Oscuro -->
      <Button
        variant="outline"
        size="icon"
        onclick={() => projectStore.toggleTheme()}
        class="h-8 w-8 cursor-pointer"
        aria-label="Cambiar tema claro u oscuro"
      >
        {#if projectStore.isDark}
          <Sun class="h-4 w-4 text-[#F5A400]" />
        {:else}
          <Moon class="h-4 w-4 text-foreground" />
        {/if}
      </Button>

      <!-- Acceso a Login / Cambiar Usuario -->
      <Button
        href="/login"
        variant="outline"
        size="sm"
        class="h-8 px-3 text-xs font-semibold gap-1.5"
      >
        <LogIn class="w-3.5 h-3.5 text-[#F5A400]" />
        <span class="hidden sm:inline">Cambiar Cuenta</span>
      </Button>
    </div>
  </div>

  <!-- Navegación Móvil -->
  <div class="md:hidden flex items-center justify-around border-t border-border bg-background py-2 px-2">
    {#each visibleLinks as link}
      {@const isActive = page.url.pathname === link.href}
      {@const Icon = link.icon}
      <a
        href={link.href}
        class="flex flex-col items-center gap-1 p-1 text-[10px] {isActive ? 'text-[#F5A400] font-semibold' : 'text-muted-foreground'}"
      >
        <Icon class="w-4 h-4" />
        <span class="truncate max-w-[70px]">{link.label.split(' ')[0]}</span>
      </a>
    {/each}
  </div>
</header>
