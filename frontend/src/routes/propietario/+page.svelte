<script lang="ts">
  import { onDestroy } from 'svelte';
  import BuildingViewer from '$lib/components/building-twin/BuildingViewer.svelte';
  import ProjectMapCard from '$lib/components/dashboard/ProjectMapCard.svelte';
  import TramoLogoLoader from '$lib/components/ui/TramoLogoLoader.svelte';
  import BeforeAfterComparisonSlider from '$lib/components/twin/BeforeAfterComparisonSlider.svelte';
  import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
  import { Badge } from '$lib/components/ui/badge';
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { projectStore, PROPERTY_OWNERS, formatCOP } from '$lib/stores/projectState.svelte';
  import type { PropertyOwnerUnit, OwnerPhotoEvidence, UnitSnagItem } from '$lib/types/twin';
  import {
    Search,
    ArrowLeft,
    Lock,
    Camera,
    ShieldCheck,
    CheckCircle2,
    Maximize2,
    Home,
    Building2,
    Box,
    X,
    ChevronLeft,
    ChevronRight,
    Sparkles,
    Compass,
    Landmark,
    FileText,
    Printer,
    ClipboardCheck,
    Plus
  } from '@lucide/svelte';

  let cedulaInput = $state('');
  let searchedCedula = $state<string | null>(null);
  let isSearching = $state(false);
  let loadingStep = $state('');
  let loadingProgress = $state(0);
  let errorMsg = $state('');
  let showTaxCertModal = $state(false);
  let showAddSnagModal = $state(false);
  let newSnagRoom = $state('Sala-Comedor y Balcón');
  let newSnagCategory = $state<UnitSnagItem['category']>('acabados');
  let newSnagTitle = $state('');
  let newSnagDesc = $state('');

  // Modo del visor para el propietario: 'my_apartment' (plano arquitectónico real de su apto) o 'building_3d' (torre general)
  let explorerTab = $state<'my_apartment' | 'building_3d'>('my_apartment');
  // Filtro de galería fotográfica: 'unit' (mi apartamento), 'project' (edificio general), 'all' (todas)
  let photoScopeFilter = $state<'unit' | 'project' | 'all'>('unit');
  let selectedRoomIndex = $state<number>(0);
  let activeModalPhotoIndex = $state<number | null>(null);

  const ownerUnit = $derived<PropertyOwnerUnit | null>(
    searchedCedula ? projectStore.findOwnerByCedula(searchedCedula) : null
  );

  const ownerSnags = $derived(
    ownerUnit
      ? projectStore.unitSnagItems.filter((s) => s.unitNumber === ownerUnit.unitNumber)
      : []
  );

  const pendingOwnerSnags = $derived(
    ownerSnags.filter((s) => s.status !== 'validado_propietario')
  );

  const handoverRecord = $derived(
    ownerUnit ? projectStore.signedHandoverUnits[ownerUnit.unitNumber] || null : null
  );

  function handleAddOwnerSnag(e: Event) {
    e.preventDefault();
    if (!ownerUnit || !newSnagTitle.trim()) return;
    projectStore.addUnitSnagItem({
      unitNumber: ownerUnit.unitNumber,
      floorLevel: ownerUnit.floorLevel,
      ownerName: ownerUnit.ownerName,
      roomZone: newSnagRoom,
      category: newSnagCategory,
      title: newSnagTitle.trim(),
      description:
        newSnagDesc.trim() ||
        'Observación registrada por el propietario durante recorrido de pre-entrega técnica.'
    });
    newSnagTitle = '';
    newSnagDesc = '';
    showAddSnagModal = false;
  }

  // Estado de cuenta fiduciario personalizado del propietario (Cuota inicial 30% y Crédito/Leasing 70%)
  const ownerFinancialPlan = $derived.by(() => {
    const baseValue = ownerUnit ? ownerUnit.areaM2 * 7600000 : 714400000;
    const initialQuotaTotal = Math.round(baseValue * 0.30);
    const paidInitialQuota = Math.round(initialQuotaTotal * 0.85);
    const pendingInitialQuota = initialQuotaTotal - paidInitialQuota;
    const mortgageBalance = baseValue - initialQuotaTotal;

    return {
      totalUnitValueCOP: baseValue,
      initialQuotaTotalCOP: initialQuotaTotal,
      paidInitialQuotaCOP: paidInitialQuota,
      pendingInitialQuotaCOP: pendingInitialQuota,
      mortgageBalanceCOP: mortgageBalance,
      fiduciaryYieldsCOP: Math.round(paidInitialQuota * 0.042),
      paidPercentOfInitial: 85,
      installments: [
        { num: 'Cuota #1 a #14 (Consolidado)', date: 'Ene 2025 - Ago 2026', amount: Math.round(paidInitialQuota * 0.88), ref: 'PSE-FID-884120', status: 'pagado' },
        { num: 'Cuota #15 de 18', date: '15 Sep 2026', amount: Math.round(paidInitialQuota * 0.06), ref: 'PSE-FID-910422', status: 'pagado' },
        { num: 'Cuota #16 de 18', date: '05 Oct 2026', amount: Math.round(paidInitialQuota * 0.06), ref: 'PSE-FID-948219', status: 'pagado' },
        { num: 'Cuota #17 de 18 (Próxima)', date: '05 Nov 2026', amount: Math.round(pendingInitialQuota / 2), ref: 'Programado débito / PSE', status: 'proximo' },
        { num: 'Cuota #18 de 18 (Cierre CI)', date: '05 Dic 2026', amount: Math.round(pendingInitialQuota / 2), ref: 'Programado débito / PSE', status: 'programado' }
      ]
    };
  });

  const ownerProject = $derived(
    ownerUnit
      ? projectStore.projects.find((p) => p.projectId === ownerUnit.projectId) || projectStore.projects[0]
      : null
  );


  const ownerFloorData = $derived(
    ownerProject && ownerUnit
      ? ownerProject.floors.find((f) => f.levelNumber === ownerUnit.floorLevel) || ownerProject.floors[0]
      : null
  );

  const unitRooms = $derived(ownerUnit?.unitRooms ?? []);
  const unitPhotos = $derived(ownerUnit?.unitPhotos ?? []);
  const projectPhotos = $derived(ownerUnit?.projectPhotos ?? []);

  const filteredPhotos = $derived.by<OwnerPhotoEvidence[]>(() => {
    if (photoScopeFilter === 'unit') return unitPhotos;
    if (photoScopeFilter === 'project') return projectPhotos;
    return [...unitPhotos, ...projectPhotos];
  });

  const activeModalPhoto = $derived<OwnerPhotoEvidence | null>(
    activeModalPhotoIndex !== null ? filteredPhotos[activeModalPhotoIndex] ?? null : null
  );

  function getCourtesyGreeting(fullName: string): string {
    const first = fullName.trim().split(' ')[0]?.toLowerCase() ?? '';
    const isFemale = first === 'maría' || first === 'maria' || first.endsWith('a');
    return isFemale ? `Hola, estimada ${fullName}` : `Hola, estimado ${fullName}`;
  }

  function syncTwinForOwner(unit: PropertyOwnerUnit) {
    projectStore.selectedProjectId = unit.projectId;
    projectStore.selectedFloorId = unit.floorLevel;
    projectStore.activeOwnerCedula = unit.cedula;
    projectStore.isDrawerOpen = false;
    explorerTab = 'my_apartment';
    photoScopeFilter = 'unit';
    selectedRoomIndex = 0;
  }

  async function runLookupWithAnimation(cc: string) {
    const clean = cc.replace(/\D/g, '').trim();
    if (!clean) return;

    const found = projectStore.findOwnerByCedula(clean);
    if (!found) {
      errorMsg = `No encontramos ningún encargo fiduciario vinculado a la cédula "${cc}". Selecciona una de las cédulas de ejemplo abajo.`;
      return;
    }

    errorMsg = '';
    isSearching = true;
    loadingProgress = 25;
    loadingStep = 'Consultando titularidad en encargo fiduciario...';

    await new Promise((r) => setTimeout(r, 500));
    loadingProgress = 65;
    loadingStep = `Localizando ${found.unitNumber} en el nivel ${found.floorLevel} y cargando plano arquitectónico...`;

    await new Promise((r) => setTimeout(r, 500));
    loadingProgress = 100;
    loadingStep = 'Sincronizando puntos estratégicos y registro fotográfico de tu apartamento...';

    await new Promise((r) => setTimeout(r, 300));
    syncTwinForOwner(found);
    searchedCedula = clean;
    isSearching = false;
  }

  function handleSearch(e: SubmitEvent) {
    e.preventDefault();
    runLookupWithAnimation(cedulaInput);
  }

  function selectDemoCedula(cc: string) {
    cedulaInput = cc;
    runLookupWithAnimation(cc);
  }

  function resetSearch() {
    searchedCedula = null;
    cedulaInput = '';
    errorMsg = '';
    activeModalPhotoIndex = null;
    projectStore.activeOwnerCedula = null;
  }

  onDestroy(() => {
    projectStore.activeOwnerCedula = null;
  });

  function openUnitPhotoByRoom(roomIdx: number) {
    photoScopeFilter = 'unit';
    selectedRoomIndex = roomIdx;
    if (unitPhotos[roomIdx]) {
      activeModalPhotoIndex = roomIdx;
    }
  }

  // Coordenadas de los 4 espacios reales y sus puntos estratégicos en el plano arquitectónico CAD (760x460)
  const architecturalSpaces = [
    {
      idx: 0,
      shortTag: 'Sala-Comedor + Balcón',
      zonePath: 'M 44,34 L 350,34 L 350,248 L 44,248 Z',
      pinX: 195,
      pinY: 145
    },
    {
      idx: 1,
      shortTag: 'Cocina + Zona de Ropas',
      zonePath: 'M 350,34 L 716,34 L 716,225 L 350,225 Z',
      pinX: 525,
      pinY: 128
    },
    {
      idx: 2,
      shortTag: 'Alcoba Principal + Vestier + Baño',
      zonePath: 'M 44,248 L 375,248 L 375,426 L 44,426 Z',
      pinX: 185,
      pinY: 338
    },
    {
      idx: 3,
      shortTag: 'Alcobas Aux. + Estudio + Baño',
      zonePath: 'M 375,225 L 716,225 L 716,426 L 375,426 Z',
      pinX: 555,
      pinY: 332
    }
  ];
</script>

{#if isSearching}
  <!-- Estado 2: Animación de carga centrada con el isotipo de Tramo -->
  <div class="min-h-[calc(100vh-180px)] w-full flex flex-col items-center justify-center px-4">
    <Card class="w-full max-w-md bg-card border-border shadow-sm">
      <CardContent class="p-8 flex flex-col items-center text-center space-y-5">
        <TramoLogoLoader size={68} />

        <div class="space-y-1.5 w-full">
          <h2 class="text-sm font-semibold text-foreground">
            Consultando expediente inmobiliario
          </h2>
          <p class="text-xs text-muted-foreground">
            {loadingStep}
          </p>
        </div>

        <div class="w-full h-1.5 rounded-full bg-muted overflow-hidden">
          <div
            class="h-full bg-foreground rounded-full transition-all duration-300"
            style="width: {loadingProgress}%"
          ></div>
        </div>

        <span class="text-[11px] text-muted-foreground tabular-nums">
          Cédula consultada: {cedulaInput}
        </span>
      </CardContent>
    </Card>
  </div>
{:else if !ownerUnit || !ownerProject}
  <!-- Estado 1: Buscador centrado sin cédula por defecto -->
  <div class="min-h-[calc(100vh-180px)] w-full flex flex-col items-center justify-center px-4 py-8">
    <div class="w-full max-w-lg space-y-6">
      <div class="text-center space-y-2">
        <div class="inline-flex justify-center">
          <Badge variant="outline" class="text-[11px] font-normal bg-muted/60 text-foreground border-border gap-1.5">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span>Portal de propietarios</span>
          </Badge>
        </div>
        <h1 class="text-2xl font-semibold text-foreground tracking-tight">
          Consulta el avance de tu apartamento
        </h1>
        <p class="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
          Ingresa tu número de documento para explorar el plano arquitectónico de tu apartamento con sus puntos estratégicos de avance y fotografías reales de obra.
        </p>
      </div>

      <Card class="bg-card border-border shadow-sm">
        <CardContent class="p-6 space-y-5">
          <form onsubmit={handleSearch} class="space-y-3">
            <div class="space-y-1.5">
              <label for="cedula-input" class="text-xs font-medium text-foreground block">
                Número de cédula del titular
              </label>
              <div class="flex flex-col sm:flex-row gap-2">
                <Input
                  id="cedula-input"
                  type="text"
                  bind:value={cedulaInput}
                  placeholder="Ingresa tu cédula sin puntos"
                  class="h-9 text-xs tabular-nums flex-1"
                  required
                />
                <Button
                  type="submit"
                  disabled={!cedulaInput.trim()}
                  class="h-9 px-4 bg-foreground text-background hover:bg-foreground/90 font-medium text-xs gap-1.5 cursor-pointer shrink-0"
                >
                  <Search class="w-3.5 h-3.5" />
                  <span>Consultar</span>
                </Button>
              </div>
            </div>
          </form>

          {#if errorMsg}
            <div class="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-xs text-red-500">
              {errorMsg}
            </div>
          {/if}

          <div class="pt-4 border-t border-border space-y-2.5">
            <span class="text-[11px] text-muted-foreground block">
              Selecciona una cédula de prueba para evaluar la vista privada de propietario:
            </span>
            <div class="grid grid-cols-1 gap-2">
              {#each PROPERTY_OWNERS as demo}
                <button
                  type="button"
                  onclick={() => selectDemoCedula(demo.cedula)}
                  class="w-full px-3.5 py-2.5 rounded-lg border border-border bg-muted/30 hover:bg-muted/70 text-left flex items-center justify-between transition-colors cursor-pointer"
                >
                  <div>
                    <div class="text-xs font-medium text-foreground">{demo.ownerName}</div>
                    <div class="text-[11px] text-muted-foreground">
                      {demo.unitNumber} (Piso {demo.floorLevel}) • {demo.projectName}
                    </div>
                  </div>
                  <span class="text-xs font-mono tabular-nums text-foreground bg-background px-2 py-1 rounded border border-border">
                    CC {demo.cedula}
                  </span>
                </button>
              {/each}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
{:else}
  <!-- Estado 3: Expediente privado con bienvenida cálida y plano arquitectónico real del apartamento -->
  <div class="space-y-6 w-full">
    <!-- Banner de bienvenida personalizada al propietario -->
    <div class="p-5 sm:p-6 rounded-xl border border-border bg-card shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div class="space-y-1.5">
        <div class="flex flex-wrap items-center gap-2">
          <Badge variant="outline" class="text-[11px] font-medium bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/25 gap-1.5">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span>Titular fiduciario verificado</span>
          </Badge>
          <span class="text-xs text-muted-foreground tabular-nums">
            Encargo {ownerUnit.fiduciaryEncargoCode} • {ownerUnit.fiduciaryEntity}
          </span>
        </div>

        <h1 class="text-2xl font-semibold text-foreground tracking-tight">
          {getCourtesyGreeting(ownerUnit.ownerName)}
        </h1>

        <p class="text-xs text-muted-foreground max-w-3xl leading-relaxed">
          Bienvenido al seguimiento técnico de tu <strong class="text-foreground font-medium">{ownerUnit.unitNumber}</strong> ubicado en el <strong class="text-foreground font-medium">Piso {ownerUnit.floorLevel}</strong> de <strong class="text-foreground font-medium">{ownerUnit.projectName}</strong>. Aquí puedes inspeccionar el plano arquitectónico real de tu hogar, sus puntos estratégicos de obra y las fotografías certificadas por interventoría.
        </p>
      </div>

      <div class="flex items-center gap-2 self-start md:self-center shrink-0">
        <Button
          variant="outline"
          size="sm"
          onclick={resetSearch}
          class="h-8 text-xs gap-1.5 cursor-pointer"
        >
          <ArrowLeft class="w-3.5 h-3.5" />
          <span>Cambiar de titular</span>
        </Button>
      </div>
    </div>

    <!-- Franja de 4 KPIs del propietario -->
    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      <Card class="bg-card border-border shadow-none">
        <CardContent class="p-4 space-y-1.5">
          <span class="text-xs text-muted-foreground block">Tu inmueble asignado</span>
          <div class="text-base font-semibold text-foreground flex items-center gap-2">
            <span>{ownerUnit.unitNumber}</span>
            <Badge variant="outline" class="text-[11px] font-normal bg-muted/60 border-border">
              Piso {ownerUnit.floorLevel}
            </Badge>
          </div>
          <div class="text-[11px] text-muted-foreground pt-1 border-t border-border/60 truncate">
            {ownerUnit.orientationLabel || ownerUnit.tower} • {ownerUnit.areaM2} m²
          </div>
        </CardContent>
      </Card>

      <Card class="bg-card border-border shadow-none">
        <CardContent class="p-4 space-y-1.5">
          <span class="text-xs text-muted-foreground block">Avance real de tu apartamento</span>
          <div class="flex items-baseline justify-between gap-2">
            <span class="text-2xl font-semibold text-foreground tabular-nums">
              {ownerUnit.unitProgressPercent.toFixed(1)}%
            </span>
            <span class="text-xs text-muted-foreground tabular-nums">
              Edificio general: {ownerProject.certifiedPhysicalProgress.toFixed(1)}%
            </span>
          </div>
          <div class="w-full h-1.5 rounded-full bg-muted overflow-hidden">
            <div
              class="h-full bg-[#F5A400] rounded-full transition-all"
              style="width: {ownerUnit.unitProgressPercent}%"
            ></div>
          </div>
        </CardContent>
      </Card>

      <Card class="bg-card border-border shadow-none">
        <CardContent class="p-4 space-y-1.5">
          <span class="text-xs text-muted-foreground block">Distribución y anexos</span>
          <div class="text-sm font-semibold text-foreground truncate">{ownerUnit.typology}</div>
          <div class="text-[11px] text-muted-foreground pt-1 border-t border-border/60 truncate">
            {ownerUnit.parkingSpot}
          </div>
        </CardContent>
      </Card>

      <Card class="bg-card border-border shadow-none">
        <CardContent class="p-4 space-y-1.5">
          <span class="text-xs text-muted-foreground block">Cuota inicial en fiduciaria</span>
          <div class="text-base font-semibold text-foreground tabular-nums">
            {formatCOP(ownerUnit.financialPlan.downPaymentPaidCOP)}
            <span class="text-xs font-normal text-muted-foreground">
              / {formatCOP(ownerUnit.financialPlan.downPaymentGoalCOP)}
            </span>
          </div>
          <div class="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/60 tabular-nums">
            <span>{ownerUnit.financialPlan.installmentsPaid}/{ownerUnit.financialPlan.installmentsTotal} cuotas</span>
            <span class="text-foreground font-medium">Entrega: {ownerUnit.estimatedDeliveryDate}</span>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- SECCIÓN PRINCIPAL: Plano Arquitectónico Real del Apartamento con Puntos Estratégicos de Avance -->
    <Card class="bg-card border-border shadow-xs overflow-hidden">
      <CardHeader class="px-6 py-4 border-b border-border bg-muted/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div class="space-y-0.5">
          <div class="flex items-center gap-2">
            <Home class="w-4 h-4 text-[#F5A400]" />
            <CardTitle class="text-base font-semibold text-foreground">
              Plano arquitectónico de tu {ownerUnit.unitNumber} y puntos estratégicos de avance
            </CardTitle>
          </div>
          <p class="text-xs text-muted-foreground">
            Selecciona cualquiera de los 4 puntos estratégicos sobre el plano (sala-comedor, cocina, alcoba principal o alcobas auxiliares) para inspeccionar su estado y fotografías.
          </p>
        </div>

        <!-- Selector entre Plano Arquitectónico de Mi Apartamento y Vista 3D/Render del Edificio -->
        <div class="inline-flex items-center gap-1 bg-background p-1 rounded-lg border border-border shrink-0">
          <button
            type="button"
            onclick={() => (explorerTab = 'my_apartment')}
            class="px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer {explorerTab ===
            'my_apartment'
              ? 'bg-foreground text-background'
              : 'text-muted-foreground hover:text-foreground'}"
          >
            <Home class="w-3.5 h-3.5" />
            <span>Plano de mi {ownerUnit.unitNumber}</span>
          </button>
          <button
            type="button"
            onclick={() => (explorerTab = 'building_3d')}
            class="px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer {explorerTab ===
            'building_3d'
              ? 'bg-foreground text-background'
              : 'text-muted-foreground hover:text-foreground'}"
          >
            <Box class="w-3.5 h-3.5" />
            <span>Edificio completo (Vista 3D / Render)</span>
          </button>
        </div>
      </CardHeader>

      <CardContent class="p-5 sm:p-6">
        {#if explorerTab === 'my_apartment'}
          <div class="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">
            <!-- Columna Izquierda (4 cols): Ubicación en Torre + Localización en Piso + Inspector del Punto Estratégico -->
            <div class="xl:col-span-4 flex flex-col justify-between gap-4 bg-muted/15 rounded-xl border border-border p-4">
              <!-- 1. Esquema compacto de localización en Piso y Torre -->
              <div class="space-y-3">
                <div class="flex items-center justify-between">
                  <span class="text-xs font-semibold text-foreground">
                    Localización en Piso {ownerUnit.floorLevel}
                  </span>
                  <span class="text-[11px] text-muted-foreground tabular-nums">
                    Cota +{(ownerUnit.floorLevel * 3.2).toFixed(1)} m
                  </span>
                </div>

                <!-- Mini planta del piso con los 3 vecinos bloqueados con candado y solo la unidad del propietario activa -->
                <div class="grid grid-cols-2 gap-2 p-2.5 rounded-lg bg-card border border-border">
                  {#each [1, 2, 3, 4] as pos}
                    {@const isMyPos = (ownerUnit.unitPositionInFloor ?? 2) === pos}
                    <div
                      class="p-2.5 rounded-md border text-xs flex flex-col justify-between min-h-[58px] {isMyPos
                        ? 'bg-[#F5A400]/15 border-[#F5A400] text-foreground shadow-2xs'
                        : 'bg-muted/35 border-border/60 text-muted-foreground opacity-55'}"
                    >
                      {#if isMyPos}
                        <div class="flex items-center justify-between">
                          <span class="font-semibold text-[11px] text-foreground">{ownerUnit.unitNumber}</span>
                          <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
                        </div>
                        <div class="text-[10px] text-foreground font-medium mt-1">
                          Tu apartamento ({ownerUnit.unitProgressPercent}%)
                        </div>
                      {:else}
                        <div class="flex items-center justify-between">
                          <span class="text-[10px] tabular-nums">Apto {ownerUnit.floorLevel}0{pos}</span>
                          <Lock class="w-3 h-3 text-muted-foreground" />
                        </div>
                        <div class="text-[10px] mt-1">Unidad vecina privada</div>
                      {/if}
                    </div>
                  {/each}
                </div>
              </div>

              <!-- 2. Lista interactiva de los 4 Puntos Estratégicos de tu Apartamento -->
              <div class="space-y-2 pt-2 border-t border-border flex-1 flex flex-col justify-between">
                <div class="space-y-2">
                  <div class="flex items-center justify-between">
                    <span class="text-xs font-semibold text-foreground">
                      Puntos estratégicos de tu unidad
                    </span>
                    <span class="text-[10px] text-muted-foreground">Haz clic para inspeccionar</span>
                  </div>

                  <div class="space-y-1.5">
                    {#each unitRooms as room, idx (room.id)}
                      {@const isSelected = selectedRoomIndex === idx}
                      <button
                        type="button"
                        onclick={() => (selectedRoomIndex = idx)}
                        class="w-full text-left p-2.5 rounded-lg border transition-all flex items-center justify-between gap-2.5 cursor-pointer {isSelected
                          ? 'bg-accent border-[#F5A400] shadow-2xs'
                          : 'bg-card/80 border-border hover:bg-accent/40'}"
                      >
                        <div class="flex items-center gap-2.5 min-w-0">
                          <span
                            class="w-6 h-6 rounded-full text-[11px] font-semibold flex items-center justify-center shrink-0 tabular-nums {isSelected
                              ? 'bg-[#F5A400] text-zinc-950'
                              : room.percent >= 100
                                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                                : 'bg-muted text-foreground border border-border'}"
                          >
                            {idx + 1}
                          </span>
                          <div class="min-w-0">
                            <div class="text-xs font-medium text-foreground truncate">{room.name}</div>
                            <div class="text-[10px] text-muted-foreground tabular-nums">
                              Área: {room.areaM2} m²
                            </div>
                          </div>
                        </div>

                        <div class="text-right shrink-0 tabular-nums">
                          <div class="text-xs font-semibold text-foreground">{room.percent}%</div>
                          <div class="w-12 h-1 bg-muted rounded-full overflow-hidden mt-1">
                            <div
                              class="h-full rounded-full {room.percent >= 100 ? 'bg-emerald-500' : 'bg-[#F5A400]'}"
                              style="width: {room.percent}%"
                            ></div>
                          </div>
                        </div>
                      </button>
                    {/each}
                  </div>
                </div>

                <!-- Detalle del punto estratégico seleccionado y botón de foto -->
                {#if unitRooms[selectedRoomIndex]}
                  {@const activeRoom = unitRooms[selectedRoomIndex]}
                  <div class="p-3 rounded-lg bg-card border border-border space-y-2.5 mt-2">
                    <div class="flex items-center justify-between gap-2">
                      <span class="text-xs font-semibold text-foreground">
                        Punto #{selectedRoomIndex + 1} — {activeRoom.name}
                      </span>
                      <Badge variant="outline" class="text-[10px] font-medium bg-muted/50 border-border tabular-nums">
                        {activeRoom.percent}%
                      </Badge>
                    </div>
                    <p class="text-[11px] text-muted-foreground leading-relaxed">
                      {activeRoom.description}
                    </p>
                    {#if unitPhotos[selectedRoomIndex]}
                      <Button
                        size="sm"
                        onclick={() => openUnitPhotoByRoom(selectedRoomIndex)}
                        class="w-full h-8 bg-foreground text-background hover:bg-foreground/90 text-xs font-medium gap-1.5 cursor-pointer"
                      >
                        <Camera class="w-3.5 h-3.5" />
                        <span>Ver fotografía real de este espacio</span>
                      </Button>
                    {/if}
                  </div>
                {/if}
              </div>
            </div>

            <!-- Columna Derecha (8 cols): Plano Arquitectónico Real CAD con Muros Dobles, Mobiliario, Puertas y Puntos Estratégicos -->
            <div class="xl:col-span-8 flex flex-col justify-between bg-muted/15 rounded-xl border border-border p-4 space-y-3">
              <div class="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-border">
                <div>
                  <h3 class="text-sm font-semibold text-foreground">
                    Plano arquitectónico a escala — {ownerUnit.unitNumber} ({ownerUnit.areaM2} m²)
                  </h3>
                  <p class="text-[11px] text-muted-foreground">
                    Distribución arquitectónica con muros estructurales, mobiliario de referencia y puntos estratégicos de inspección (1 al 4)
                  </p>
                </div>
                <div class="flex items-center gap-3 text-[11px] text-muted-foreground">
                  <span class="inline-flex items-center gap-1.5">
                    <span class="w-2.5 h-2.5 rounded-full bg-[#F5A400]"></span>
                    <span>Punto estratégico interactivo</span>
                  </span>
                </div>
              </div>

              <!-- SVG del Plano Arquitectónico Real del Apartamento -->
              <div class="flex-1 flex items-center justify-center py-1">
                <svg
                  viewBox="0 0 760 460"
                  class="w-full h-full max-h-[400px] select-none"
                  role="img"
                  aria-label="Plano arquitectónico detallado de {ownerUnit.unitNumber}"
                >
                  <defs>
                    <!-- Retícula milimetrada de plano arquitectónico -->
                    <pattern id="archBlueprintGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                      <path
                        d="M 20 0 L 0 0 0 20"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="0.45"
                        class="text-border/55"
                      />
                    </pattern>
                    <!-- Patrón de piso tipo madera/deck para el balcón terraza -->
                    <pattern id="balconyDeck" width="12" height="12" patternUnits="userSpaceOnUse">
                      <line x1="0" y1="0" x2="12" y2="0" stroke="currentColor" stroke-width="0.6" class="text-muted-foreground/30" />
                    </pattern>
                    <!-- Patrón de enchape cerámica para baños y zona húmeda -->
                    <pattern id="wetTileGrid" width="10" height="10" patternUnits="userSpaceOnUse">
                      <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" stroke-width="0.4" class="text-muted-foreground/25" />
                    </pattern>
                  </defs>

                  <!-- Fondo general del plano -->
                  <rect x="12" y="10" width="736" height="440" rx="8" fill="url(#archBlueprintGrid)" />

                  <!-- Cotas dimensionales superiores e izquierdas -->
                  <g class="text-muted-foreground/80">
                    <line x1="44" y1="20" x2="350" y2="20" stroke="currentColor" stroke-width="0.9" />
                    <line x1="44" y1="15" x2="44" y2="25" stroke="currentColor" stroke-width="0.9" />
                    <line x1="350" y1="15" x2="350" y2="25" stroke="currentColor" stroke-width="0.9" />
                    <text x="197" y="16" text-anchor="middle" class="text-[9px] fill-muted-foreground tabular-nums">6.20 m (Zona social y terraza)</text>

                    <line x1="350" y1="20" x2="716" y2="20" stroke="currentColor" stroke-width="0.9" />
                    <line x1="716" y1="15" x2="716" y2="25" stroke="currentColor" stroke-width="0.9" />
                    <text x="533" y="16" text-anchor="middle" class="text-[9px] fill-muted-foreground tabular-nums">6.40 m (Cocina, ropas y estudio)</text>

                    <line x1="26" y1="34" x2="26" y2="426" stroke="currentColor" stroke-width="0.9" />
                    <line x1="21" y1="34" x2="31" y2="34" stroke="currentColor" stroke-width="0.9" />
                    <line x1="21" y1="426" x2="31" y2="426" stroke="currentColor" stroke-width="0.9" />
                    <text x="20" y="230" text-anchor="middle" transform="rotate(-90 20 230)" class="text-[9px] fill-muted-foreground tabular-nums">
                      9.40 m (Fondo arquitectónico privado)
                    </text>
                  </g>

                  <!-- Placa base interior del apartamento -->
                  <rect
                    x="44"
                    y="34"
                    width="672"
                    height="392"
                    fill="currentColor"
                    class="text-card"
                  />

                  <!-- Texturas de pisos en balcones y zonas húmedas -->
                  <!-- Balcón terraza (arriba izquierda) -->
                  <rect x="44" y="34" width="306" height="58" fill="url(#balconyDeck)" />
                  <!-- Cocina y ropas (arriba derecha) -->
                  <rect x="350" y="34" width="366" height="191" fill="url(#wetTileGrid)" />
                  <!-- Baño principal (abajo izquierda) y baño social (centro derecha) -->
                  <rect x="44" y="248" width="108" height="105" fill="url(#wetTileGrid)" />
                  <rect x="375" y="225" width="95" height="88" fill="url(#wetTileGrid)" />

                  <!-- ========================================================================= -->
                  <!-- CAPA 1: ZONAS INTERACTIVAS DE LOS 4 PUNTOS ESTRATÉGICOS (Highlight suave) -->
                  <!-- ========================================================================= -->
                  {#each architecturalSpaces as sp (sp.idx)}
                    {@const room = unitRooms[sp.idx]}
                    {@const isSel = selectedRoomIndex === sp.idx}
                    {#if room}
                      <!-- svelte-ignore a11y_click_events_have_key_events -->
                      <!-- svelte-ignore a11y_no_static_element_interactions -->
                      <path
                        d={sp.zonePath}
                        fill={isSel
                          ? 'rgba(245, 164, 0, 0.14)'
                          : room.percent >= 100
                            ? 'rgba(16, 185, 129, 0.06)'
                            : 'rgba(245, 164, 0, 0.04)'}
                        stroke={isSel ? '#f5a400' : 'transparent'}
                        stroke-width={isSel ? '2' : '0'}
                        class="cursor-pointer transition-all duration-200"
                        onmouseenter={() => (selectedRoomIndex = sp.idx)}
                        onclick={() => openUnitPhotoByRoom(sp.idx)}
                      />
                    {/if}
                  {/each}

                  <!-- ========================================================================= -->
                  <!-- CAPA 2: MOBILIARIO ARQUITECTÓNICO CAD EN PLANTA (Escala Real)             -->
                  <!-- ========================================================================= -->
                  <g stroke="currentColor" class="text-muted-foreground/55" fill="none" stroke-width="1.1">
                    <!-- 1. BALCÓN TERRAZA (x:44..350, y:34..92) -->
                    <!-- Mesa exterior y 2 sillas en balcón -->
                    <circle cx="115" cy="63" r="14" />
                    <circle cx="93" cy="63" r="5" />
                    <circle cx="137" cy="63" r="5" />
                    <!-- Materas decorativas balcón -->
                    <rect x="54" y="42" width="18" height="18" rx="3" />
                    <circle cx="63" cy="51" r="5" />
                    <text x="235" y="66" class="text-[9px] fill-muted-foreground font-medium" stroke="none">
                      Balcón terraza cubierto
                    </text>

                    <!-- Puerta ventana corrediza entre Balcón y Sala-Comedor (y=92) -->
                    <line x1="44" y1="92" x2="350" y2="92" stroke-width="3" class="text-foreground/70" />
                    <line x1="85" y1="90" x2="295" y2="90" stroke="#38bdf8" stroke-width="2" />
                    <line x1="120" y1="94" x2="320" y2="94" stroke="#38bdf8" stroke-width="2" />

                    <!-- 2. SALA-COMEDOR (x:44..350, y:92..248) -->
                    <!-- Sofá en L en sala -->
                    <rect x="64" y="114" width="96" height="32" rx="4" />
                    <rect x="64" y="114" width="30" height="78" rx="4" />
                    <!-- Cojines del sofá -->
                    <line x1="94" y1="122" x2="156" y2="122" />
                    <line x1="125" y1="114" x2="125" y2="146" />
                    <!-- Mesa de centro y alfombra -->
                    <rect x="108" y="156" width="46" height="28" rx="2" />
                    <rect x="100" y="150" width="66" height="44" stroke-dasharray="2 2" />
                    <!-- Comedor de 6 puestos (derecha de la sala) -->
                    <rect x="238" y="122" width="76" height="44" rx="4" />
                    <!-- 6 sillas del comedor -->
                    <rect x="248" y="113" width="16" height="6" rx="1" />
                    <rect x="284" y="113" width="16" height="6" rx="1" />
                    <rect x="248" y="169" width="16" height="6" rx="1" />
                    <rect x="284" y="169" width="16" height="6" rx="1" />
                    <rect x="229" y="136" width="6" height="16" rx="1" />
                    <rect x="317" y="136" width="6" height="16" rx="1" />

                    <!-- 3. COCINA ABIERTA + ISLA + ZONA DE ROPAS (x:350..716, y:34..225) -->
                    <!-- Mesón de cocina en L (arriba y centro) -->
                    <path d="M 356,42 L 585,42 L 585,76 L 390,76 L 390,148 L 356,148 Z" />
                    <!-- Lavaplatos doble poceta -->
                    <rect x="425" y="47" width="22" height="18" rx="2" />
                    <rect x="450" y="47" width="22" height="18" rx="2" />
                    <!-- Cubierta / Estufa 4 puestos -->
                    <rect x="505" y="46" width="38" height="22" rx="2" />
                    <circle cx="515" cy="53" r="3.5" />
                    <circle cx="533" cy="53" r="3.5" />
                    <circle cx="515" cy="62" r="3.5" />
                    <circle cx="533" cy="62" r="3.5" />
                    <!-- Nevecon -->
                    <rect x="359" y="112" width="28" height="32" rx="2" />
                    <!-- Isla central / Barra desayunador con 3 butacos -->
                    <rect x="435" y="112" width="110" height="34" rx="3" />
                    <circle cx="455" cy="156" r="6" />
                    <circle cx="490" cy="156" r="6" />
                    <circle cx="525" cy="156" r="6" />

                    <!-- Zona de ropas independiente (x:592..710, y:42..165) -->
                    <line x1="590" y1="34" x2="590" y2="165" stroke-width="3" class="text-foreground/70" />
                    <!-- Lavadora y secadora -->
                    <rect x="668" y="46" width="34" height="32" rx="2" />
                    <circle cx="685" cy="62" r="10" />
                    <!-- Lavadero -->
                    <rect x="668" y="84" width="34" height="28" rx="2" />
                    <line x1="673" y1="90" x2="697" y2="90" />
                    <line x1="673" y1="96" x2="697" y2="96" />
                    <text x="646" y="142" text-anchor="middle" class="text-[8.5px] fill-muted-foreground" stroke="none">
                      Zona de ropas
                    </text>

                    <!-- 4. ALCOBA PRINCIPAL + VESTIER + BAÑO PRIVADO (x:44..375, y:248..426) -->
                    <!-- Baño privado (x:44..152, y:248..353) -->
                    <line x1="152" y1="248" x2="152" y2="353" stroke-width="4" class="text-foreground/75" />
                    <line x1="44" y1="353" x2="152" y2="353" stroke-width="4" class="text-foreground/75" />
                    <!-- Cabina de ducha con diagonales -->
                    <rect x="50" y="254" width="44" height="52" />
                    <line x1="50" y1="254" x2="94" y2="306" stroke-width="0.7" />
                    <line x1="94" y1="254" x2="50" y2="306" stroke-width="0.7" />
                    <circle cx="72" cy="280" r="3" />
                    <!-- Lavamanos y sanitario baño principal -->
                    <rect x="104" y="254" width="40" height="18" rx="2" />
                    <ellipse cx="124" cy="263" rx="8" ry="5" />
                    <rect x="52" y="320" width="14" height="22" rx="2" />
                    <ellipse cx="75" cy="331" rx="10" ry="7" />

                    <!-- Walk-in Closet / Vestier (x:44..152, y:353..420) -->
                    <line x1="152" y1="382" x2="152" y2="426" stroke-width="4" class="text-foreground/75" />
                    <rect x="52" y="360" width="92" height="14" />
                    <rect x="52" y="404" width="92" height="14" />
                    <text x="98" y="393" text-anchor="middle" class="text-[8.5px] fill-muted-foreground" stroke="none">
                      Vestier
                    </text>

                    <!-- Cama King en Alcoba Principal + 2 mesas de noche (x:160..370, y:255..420) -->
                    <rect x="218" y="318" width="96" height="98" rx="4" />
                    <!-- Almohadas y sobrecama -->
                    <rect x="226" y="388" width="36" height="20" rx="3" />
                    <rect x="270" y="388" width="36" height="20" rx="3" />
                    <line x1="218" y1="376" x2="314" y2="376" />
                    <!-- Mesas de noche -->
                    <rect x="192" y="392" width="20" height="20" rx="2" />
                    <rect x="320" y="392" width="20" height="20" rx="2" />

                    <!-- 5. BAÑO SOCIAL + ESTUDIO + ALCOBA AUXILIAR 2 (x:375..716, y:225..426) -->
                    <!-- Baño social (x:375..470, y:225..313) -->
                    <line x1="470" y1="225" x2="470" y2="313" stroke-width="4" class="text-foreground/75" />
                    <line x1="375" y1="313" x2="470" y2="313" stroke-width="4" class="text-foreground/75" />
                    <rect x="382" y="232" width="36" height="44" />
                    <line x1="382" y1="232" x2="418" y2="276" stroke-width="0.7" />
                    <line x1="418" y1="232" x2="382" y2="276" stroke-width="0.7" />
                    <rect x="426" y="232" width="36" height="16" rx="2" />
                    <ellipse cx="442" cy="292" rx="9" ry="7" />
                    <text x="422" y="308" text-anchor="middle" class="text-[8px] fill-muted-foreground" stroke="none">
                      Baño social
                    </text>

                    <!-- Estudio / Family Room (x:470..585, y:225..330) -->
                    <rect x="488" y="236" width="76" height="24" rx="2" />
                    <circle cx="526" cy="272" r="9" />
                    <text x="526" y="298" text-anchor="middle" class="text-[8.5px] fill-muted-foreground" stroke="none">
                      Estudio / Home office
                    </text>

                    <!-- Alcoba Auxiliar 2 (x:585..710, y:225..420) -->
                    <line x1="585" y1="225" x2="585" y2="426" stroke-width="4" class="text-foreground/75" />
                    <!-- Cama semidoble en Alcoba Auxiliar -->
                    <rect x="615" y="328" width="74" height="88" rx="3" />
                    <rect x="625" y="390" width="54" height="18" rx="2" />
                    <line x1="615" y1="380" x2="689" y2="380" />
                    <!-- Closet Alcoba 2 -->
                    <rect x="592" y="234" width="110" height="16" />

                    <!-- ARCOS DE ABATIMIENTO DE PUERTAS (90 grados arquitectónicos) -->
                    <!-- Puerta acceso principal al apartamento (x=350, y=248) -->
                    <path d="M 350,248 L 350,212 A 36,36 0 0,1 386,248 Z" stroke-dasharray="3 2" class="text-[#10b981]" />
                    <!-- Puerta alcoba principal -->
                    <path d="M 375,286 L 343,286 A 32,32 0 0,1 375,254 Z" stroke-dasharray="2 2" />
                    <!-- Puerta alcoba auxiliar -->
                    <path d="M 585,310 L 615,310 A 30,30 0 0,0 585,280 Z" stroke-dasharray="2 2" />
                  </g>

                  <!-- ========================================================================= -->
                  <!-- CAPA 3: MUROS ESTRUCTURALES PERIMETRALES, DIVISORIOS Y VENTANALES         -->
                  <!-- ========================================================================= -->
                  <g class="text-foreground">
                    <!-- Muro perimetral grueso del apartamento -->
                    <rect
                      x="44"
                      y="34"
                      width="672"
                      height="392"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="6"
                    />
                    <!-- Muro divisorio central horizontal (entre zona social y alcobas) -->
                    <line x1="44" y1="248" x2="346" y2="248" stroke="currentColor" stroke-width="5" />
                    <line x1="386" y1="225" x2="716" y2="225" stroke="currentColor" stroke-width="5" />
                    <!-- Muro divisorio vertical entre Alcoba Principal y Zona Auxiliar -->
                    <line x1="375" y1="286" x2="375" y2="426" stroke="currentColor" stroke-width="5" />

                    <!-- Ventanales acústicos en fachada superior e inferior (líneas azules dobles) -->
                    <line x1="48" y1="34" x2="345" y2="34" stroke="#38bdf8" stroke-width="4" />
                    <line x1="420" y1="34" x2="565" y2="34" stroke="#38bdf8" stroke-width="4" />
                    <line x1="205" y1="426" x2="335" y2="426" stroke="#38bdf8" stroke-width="4" />
                    <line x1="605" y1="426" x2="695" y2="426" stroke="#38bdf8" stroke-width="4" />

                    <!-- Columnas estructurales del apartamento (■) -->
                    {#each [
                      [44, 34],
                      [350, 34],
                      [716, 34],
                      [44, 248],
                      [375, 248],
                      [716, 225],
                      [44, 426],
                      [375, 426],
                      [716, 426]
                    ] as [cx, cy]}
                      <rect x={cx - 6} y={cy - 6} width="12" height="12" fill="currentColor" />
                    {/each}
                  </g>

                  <!-- Indicador de Puerta de Acceso Principal -->
                  <g transform="translate(366, 238)">
                    <rect x="-28" y="-9" width="56" height="18" rx="4" fill="#10b981" />
                    <text x="0" y="3" text-anchor="middle" class="text-[8.5px] font-bold fill-zinc-950">
                      ACCESO
                    </text>
                  </g>

                  <!-- ========================================================================= -->
                  <!-- CAPA 4: PUNTOS ESTRATÉGICOS DE AVANCE INTERACTIVOS (Hotspots 1, 2, 3, 4)  -->
                  <!-- ========================================================================= -->
                  {#each architecturalSpaces as sp (sp.idx)}
                    {@const room = unitRooms[sp.idx]}
                    {@const isSel = selectedRoomIndex === sp.idx}
                    {#if room}
                      {@const badgeColor = room.percent >= 100 ? '#10b981' : '#f5a400'}
                      <!-- svelte-ignore a11y_click_events_have_key_events -->
                      <!-- svelte-ignore a11y_no_static_element_interactions -->
                      <g
                        transform="translate({sp.pinX}, {sp.pinY})"
                        class="cursor-pointer"
                        onmouseenter={() => (selectedRoomIndex = sp.idx)}
                        onclick={() => openUnitPhotoByRoom(sp.idx)}
                      >
                        <!-- Halo exterior pulsante en el punto estratégico activo -->
                        <circle
                          cx="0"
                          cy="0"
                          r={isSel ? '28' : '22'}
                          fill={badgeColor}
                          fill-opacity={isSel ? '0.24' : '0.14'}
                        />

                        <!-- Pastilla principal del Punto Estratégico -->
                        <rect
                          x="-66"
                          y="-18"
                          width="132"
                          height="36"
                          rx="18"
                          fill="#18181b"
                          stroke={isSel ? '#ffffff' : badgeColor}
                          stroke-width={isSel ? '2.2' : '1.6'}
                        />

                        <!-- Círculo con el número del punto estratégico -->
                        <circle cx="-46" cy="0" r="12" fill={badgeColor} />
                        <text
                          x="-46"
                          y="4"
                          text-anchor="middle"
                          class="text-[11px] font-bold fill-zinc-950 tabular-nums"
                        >
                          {sp.idx + 1}
                        </text>

                        <!-- Nombre corto del ambiente y % de avance -->
                        <text x="-28" y="-2" class="text-[9.5px] font-semibold fill-white">
                          {sp.shortTag.split('+')[0].trim()}
                        </text>
                        <text x="-28" y="10" class="text-[10px] font-bold fill-[#F5A400] tabular-nums">
                          Avance: {room.percent}% • Foto →
                        </text>
                      </g>
                    {/if}
                  {/each}
                </svg>
              </div>

              <!-- Leyenda arquitectónica inferior del plano -->
              <div class="pt-2.5 border-t border-border flex flex-wrap items-center justify-between gap-2 text-[11px] text-muted-foreground">
                <div class="flex flex-wrap items-center gap-4">
                  <span class="inline-flex items-center gap-1.5">
                    <span class="w-3 h-1 bg-foreground inline-block"></span>
                    <span>Muros estructurales y divisorios</span>
                  </span>
                  <span class="inline-flex items-center gap-1.5">
                    <span class="w-3 h-1 bg-sky-400 inline-block"></span>
                    <span>Ventanales acústicos piso-techo</span>
                  </span>
                  <span class="inline-flex items-center gap-1.5">
                    <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
                    <span>Acceso principal al apartamento</span>
                  </span>
                </div>

                <span class="text-xs font-medium text-foreground">
                  Haz clic en cualquier punto numérico (1 al 4) para abrir su foto en alta resolución
                </span>
              </div>
            </div>
          </div>
        {:else}
          <!-- Pestaña 2: Vista 3D y Render del Edificio Completo con tu piso preseleccionado -->
          <div class="space-y-3">
            <div class="p-3 rounded-lg bg-muted/30 border border-border flex flex-wrap items-center justify-between gap-2 text-xs">
              <span>
                En esta vista general del proyecto tu <strong class="text-foreground">{ownerUnit.unitNumber}</strong> se encuentra resaltado en el <strong class="text-foreground">Piso {ownerUnit.floorLevel}</strong>.
              </span>
              <button
                type="button"
                onclick={() => (explorerTab = 'my_apartment')}
                class="font-medium text-foreground underline underline-offset-4 cursor-pointer"
              >
                Volver al plano arquitectónico de mi apartamento →
              </button>
            </div>
            <BuildingViewer />
          </div>
        {/if}
      </CardContent>
    </Card>

    <!-- SECCIÓN DE EVIDENCIAS FOTOGRÁFICAS: Fotos de Mi Apartamento vs. Avance General del Proyecto -->
    <Card class="bg-card border-border shadow-xs">
      <CardHeader class="px-6 py-4 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div class="space-y-1">
          <div class="flex items-center gap-2">
            <Camera class="w-4 h-4 text-[#F5A400]" />
            <CardTitle class="text-base font-semibold text-foreground">
              Registro fotográfico de avance real
            </CardTitle>
          </div>
          <p class="text-xs text-muted-foreground">
            Alterna entre las fotografías tomadas dentro de los espacios de tu <strong class="text-foreground">{ownerUnit.unitNumber}</strong> y el avance general del edificio.
          </p>
        </div>

        <!-- Filtros de alcance fotográfico -->
        <div class="inline-flex flex-wrap items-center gap-1 bg-muted/50 p-1 rounded-lg border border-border">
          <button
            type="button"
            onclick={() => (photoScopeFilter = 'unit')}
            class="px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer {photoScopeFilter ===
            'unit'
              ? 'bg-foreground text-background'
              : 'text-muted-foreground hover:text-foreground'}"
          >
            <Home class="w-3.5 h-3.5" />
            <span>Fotos de mi {ownerUnit.unitNumber} ({unitPhotos.length})</span>
          </button>

          <button
            type="button"
            onclick={() => (photoScopeFilter = 'project')}
            class="px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer {photoScopeFilter ===
            'project'
              ? 'bg-foreground text-background'
              : 'text-muted-foreground hover:text-foreground'}"
          >
            <Building2 class="w-3.5 h-3.5" />
            <span>Avance general del proyecto ({projectPhotos.length})</span>
          </button>

          <button
            type="button"
            onclick={() => (photoScopeFilter = 'all')}
            class="px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer {photoScopeFilter === 'all'
              ? 'bg-foreground text-background'
              : 'text-muted-foreground hover:text-foreground'}"
          >
            <span>Todas ({unitPhotos.length + projectPhotos.length})</span>
          </button>
        </div>
      </CardHeader>

      <CardContent class="p-6">
        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {#each filteredPhotos as photo, idx (photo.id)}
            <div
              class="group rounded-xl border border-border bg-muted/15 overflow-hidden flex flex-col justify-between hover:border-foreground/30 transition-all cursor-pointer"
              onclick={() => (activeModalPhotoIndex = idx)}
              role="button"
              tabindex="0"
              onkeydown={(e) => e.key === 'Enter' && (activeModalPhotoIndex = idx)}
            >
              <div>
                <div class="relative h-48 w-full bg-zinc-950 overflow-hidden">
                  <img
                    src={photo.thumbnailUrl}
                    alt={photo.title}
                    class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div class="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/25"></div>

                  <div class="absolute top-2.5 left-2.5">
                    <span
                      class="px-2 py-0.5 rounded text-[10px] font-medium border backdrop-blur-sm {photo.scope === 'unit'
                        ? 'bg-[#F5A400] text-zinc-950 border-[#F5A400]'
                        : 'bg-background/90 text-foreground border-border'}"
                    >
                      {photo.scope === 'unit' ? `Tu ${ownerUnit.unitNumber}` : 'Zonas comunes / Torre'}
                    </span>
                  </div>

                  <div class="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-[11px] text-white">
                    <span class="font-medium truncate">{photo.roomOrArea}</span>
                    <Maximize2 class="w-3.5 h-3.5 opacity-80 group-hover:opacity-100 shrink-0" />
                  </div>
                </div>

                <div class="p-3.5 space-y-2">
                  <div class="text-xs font-semibold text-foreground line-clamp-1">
                    {photo.title}
                  </div>
                  <p class="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                    {photo.inspectorNote}
                  </p>
                </div>
              </div>

              <div class="px-3.5 pb-3.5 pt-2 border-t border-border/60 flex items-center justify-between text-[11px] text-muted-foreground tabular-nums">
                <span>{photo.timestamp}</span>
                <span class="text-foreground font-medium group-hover:underline">Ampliar foto →</span>
              </div>
            </div>
          {/each}
        </div>
      </CardContent>
    </Card>

    <!-- ========================================================================= -->
    <!-- COMPARADOR TIME-LAPSE ANTES VS. DESPUÉS DE TU APARTAMENTO                 -->
    <!-- ========================================================================= -->
    <BeforeAfterComparisonSlider
      unitLabel="Apto {ownerUnit.unitNumber} · Nivel {ownerUnit.floorLevel} ({ownerUnit.projectName})"
      compact={true}
    />

    <!-- ========================================================================= -->
    <!-- ESTADO DE CUENTA FIDUCIARIO DEL COMPRADOR, PLAN DE PAGOS Y RUTA DE ENTREGA -->
    <!-- ========================================================================= -->
    <Card class="bg-card border-border shadow-xs">
      <CardHeader class="px-6 py-4 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div class="space-y-0.5">
          <div class="flex items-center gap-2">
            <Landmark class="w-4 h-4 text-emerald-500" />
            <CardTitle class="text-base font-semibold text-foreground">
              Estado de cuenta fiduciario, plan de pagos y ruta de entrega — {ownerUnit.unitNumber}
            </CardTitle>
          </div>
          <p class="text-xs text-muted-foreground">
            Trazabilidad de tus aportes de cuota inicial recaudados en <strong class="text-foreground">{ownerUnit.fiduciaryEntity}</strong> ({ownerUnit.fiduciaryContractCode}).
          </p>
        </div>

        <button
          type="button"
          onclick={() => (showTaxCertModal = true)}
          class="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg bg-foreground px-3.5 py-2 text-xs font-medium whitespace-nowrap text-background transition-opacity hover:opacity-90"
        >
          <FileText class="w-3.5 h-3.5" />
          <span>Certificado tributario DIAN (Aportes)</span>
        </button>
      </CardHeader>

      <CardContent class="p-6 space-y-6">
        <!-- 4 tarjetas financieras del comprador -->
        <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <div class="rounded-xl border border-border bg-muted/20 p-4">
            <span class="text-xs text-muted-foreground">Valor total escrituración</span>
            <div class="mt-1 font-mono text-lg font-bold text-foreground tabular-nums">
              {formatCOP(ownerFinancialPlan.totalUnitValueCOP)}
            </div>
            <span class="mt-1 block text-[11px] text-muted-foreground">
              Incluye {ownerUnit.parkingSpot}
            </span>
          </div>

          <div class="rounded-xl border border-emerald-500/25 bg-emerald-500/5 p-4">
            <span class="text-xs text-muted-foreground">Abonado a cuota inicial (85%)</span>
            <div class="mt-1 font-mono text-lg font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
              {formatCOP(ownerFinancialPlan.paidInitialQuotaCOP)}
            </div>
            <span class="mt-1 block text-[11px] text-muted-foreground">
              De {formatCOP(ownerFinancialPlan.initialQuotaTotalCOP)} (30% CI)
            </span>
          </div>

          <div class="rounded-xl border border-border bg-muted/20 p-4">
            <span class="text-xs text-muted-foreground">Saldo pendiente cuota inicial</span>
            <div class="mt-1 font-mono text-lg font-bold text-foreground tabular-nums">
              {formatCOP(ownerFinancialPlan.pendingInitialQuotaCOP)}
            </div>
            <span class="mt-1 block text-[11px] text-muted-foreground">
              2 cuotas restantes programadas
            </span>
          </div>

          <div class="rounded-xl border border-border bg-muted/20 p-4">
            <span class="text-xs text-muted-foreground">Saldo contra escrituración (70%)</span>
            <div class="mt-1 font-mono text-lg font-bold text-foreground tabular-nums">
              {formatCOP(ownerFinancialPlan.mortgageBalanceCOP)}
            </div>
            <span class="mt-1 block text-[11px] text-muted-foreground">
              Crédito hipotecario / Leasing preaprobado
            </span>
          </div>
        </div>

        <!-- Tabla de cuotas + Hitos de entrega del propietario -->
        <div class="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          <div class="xl:col-span-7 rounded-xl border border-border overflow-hidden">
            <div class="bg-muted/30 px-4 py-3 border-b border-border flex items-center justify-between text-xs">
              <span class="font-semibold text-foreground">Historial y cronograma de aportes al fideicomiso</span>
              <span class="font-mono text-emerald-600 dark:text-emerald-400 font-medium whitespace-nowrap">Cartera al día</span>
            </div>
            <div class="overflow-x-auto">
              <table class="w-full text-left text-xs">
                <thead>
                  <tr class="border-b border-border text-[11px] text-muted-foreground">
                    <th class="px-4 py-2.5">Concepto / Cuota</th>
                    <th class="px-3 py-2.5 whitespace-nowrap">Fecha</th>
                    <th class="px-3 py-2.5 whitespace-nowrap">Valor</th>
                    <th class="px-4 py-2.5 text-right whitespace-nowrap">Estado</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-border">
                  {#each ownerFinancialPlan.installments as inst (inst.num)}
                    <tr>
                      <td class="px-4 py-2.5">
                        <div class="font-medium text-foreground">{inst.num}</div>
                        <div class="font-mono text-[10px] text-muted-foreground">{inst.ref}</div>
                      </td>
                      <td class="px-3 py-2.5 font-mono whitespace-nowrap text-muted-foreground">{inst.date}</td>
                      <td class="px-3 py-2.5 font-mono font-semibold whitespace-nowrap text-foreground tabular-nums">
                        {formatCOP(inst.amount)}
                      </td>
                      <td class="px-4 py-2.5 text-right whitespace-nowrap">
                        {#if inst.status === 'pagado'}
                          <span class="inline-flex items-center gap-1 rounded bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium whitespace-nowrap text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 class="w-3 h-3" /> Recaudado
                          </span>
                        {:else if inst.status === 'proximo'}
                          <span class="inline-flex items-center gap-1 rounded bg-amber-500/15 px-2 py-0.5 text-[11px] font-medium whitespace-nowrap text-amber-600 dark:text-amber-400">
                            Próximo vencimiento
                          </span>
                        {:else}
                          <span class="inline-flex items-center gap-1 rounded bg-muted px-2 py-0.5 text-[11px] whitespace-nowrap text-muted-foreground">
                            Programado
                          </span>
                        {/if}
                      </td>
                    </tr>
                  {/each}
                </tbody>
              </table>
            </div>
          </div>

          <div class="xl:col-span-5 rounded-xl border border-border bg-muted/15 p-4 space-y-3">
            <div class="flex items-center justify-between border-b border-border pb-2.5">
              <span class="text-xs font-semibold text-foreground">Ruta hacia la entrega de tu apartamento</span>
              <span class="font-mono text-[11px] whitespace-nowrap text-muted-foreground">Entrega: {ownerUnit.estimatedDelivery}</span>
            </div>

            <div class="space-y-2.5 text-xs">
              <div class="flex items-start gap-2.5">
                <CheckCircle2 class="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <div class="font-semibold text-foreground">1. Vinculación fiduciaria y punto de equilibrio</div>
                  <div class="text-[11px] text-muted-foreground">Encargo {ownerUnit.fiduciaryContractCode} activo y certificado.</div>
                </div>
              </div>

              <div class="flex items-start gap-2.5">
                <CheckCircle2 class="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <div class="font-semibold text-foreground">2. Obra gris, estructura y mampostería de tu piso</div>
                  <div class="text-[11px] text-muted-foreground">Nivel {ownerUnit.floorLevel} verificado al {ownerUnit.unitProgressPercent}% por interventoría.</div>
                </div>
              </div>

              <div class="flex items-start gap-2.5">
                {#if handoverRecord}
                  <CheckCircle2 class="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                {:else}
                  <span class="w-4 h-4 rounded-full bg-[#F5A400]/20 border border-[#F5A400] flex items-center justify-center shrink-0 mt-0.5">
                    <span class="w-1.5 h-1.5 rounded-full bg-[#F5A400]"></span>
                  </span>
                {/if}
                <div>
                  <div class="font-semibold text-foreground">3. Pre-entrega técnica, Snag List y Acta de Recibo</div>
                  <div class="text-[11px] text-muted-foreground">
                    {handoverRecord
                      ? `Acta digital firmada en Stellar (${handoverRecord.signedAt}).`
                      : `${pendingOwnerSnags.length} detalle(s) por validar contigo abajo antes de firma digital.`}
                  </div>
                </div>
              </div>

              <div class="flex items-start gap-2.5">
                <span class="w-4 h-4 rounded-full bg-muted border border-border flex items-center justify-center shrink-0 mt-0.5"></span>
                <div>
                  <div class="font-semibold text-muted-foreground">4. Escrituración pública y entrega de llaves</div>
                  <div class="text-[11px] text-muted-foreground">Programada para {ownerUnit.estimatedDelivery} con póliza decenal Ley 1796.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- ========================================================================= -->
    <!-- MÓDULO DE PRE-ENTREGA, SNAG LIST (POSVENTA) Y ACTA DE RECIBO DIGITAL      -->
    <!-- ========================================================================= -->
    <Card class="bg-card border-border shadow-xs overflow-hidden">
      <CardHeader class="px-6 py-4 border-b border-border bg-muted/15 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div class="space-y-0.5">
          <div class="flex flex-wrap items-center gap-2">
            <ClipboardCheck class="w-4 h-4 text-[#F5A400]" />
            <CardTitle class="text-base font-semibold text-foreground">
              Inspección de pre-entrega, detalles posventa (Snag List) y acta digital — Apto {ownerUnit.unitNumber}
            </CardTitle>
            {#if handoverRecord}
              <span class="inline-flex items-center gap-1 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold whitespace-nowrap text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 class="w-3 h-3" /> Acta firmada en Stellar
              </span>
            {:else}
              <span class="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2 py-0.5 font-mono text-[11px] whitespace-nowrap text-muted-foreground">
                {ownerSnags.filter((s) => s.status === 'validado_propietario').length} / {ownerSnags.length} detalles validados
              </span>
            {/if}
          </div>
          <p class="text-xs text-muted-foreground">
            Valida que cada detalle estético o de acabados de tu apartamento esté resuelto a satisfacción. Tu firma digital habilita a la fiduciaria para liberar la retención de garantía (5%).
          </p>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onclick={() => (showAddSnagModal = true)}
            class="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium whitespace-nowrap text-foreground hover:bg-muted"
          >
            <Plus class="w-3.5 h-3.5" />
            <span>Reportar detalle de acabados</span>
          </button>

          {#if !handoverRecord}
            <button
              type="button"
              disabled={pendingOwnerSnags.length > 0}
              onclick={() => projectStore.signUnitHandoverAct(ownerUnit.unitNumber, ownerUnit.ownerName)}
              class="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap transition-all disabled:cursor-not-allowed disabled:opacity-50 {pendingOwnerSnags.length === 0
                ? 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-xs'
                : 'bg-muted text-muted-foreground border border-border'}"
              title={pendingOwnerSnags.length > 0
                ? 'Valida primero los detalles pendientes de tu apartamento para habilitar la firma del acta'
                : 'Firmar acta digital de entrega en Stellar'}
            >
              <Lock class="w-3.5 h-3.5" />
              <span>
                {pendingOwnerSnags.length === 0
                  ? 'Firmar Acta de Entrega en Stellar'
                  : `Valida ${pendingOwnerSnags.length} detalle(s) para firmar acta`}
              </span>
            </button>
          {/if}
        </div>
      </CardHeader>

      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="border-b border-border bg-muted/20 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
              <th class="py-3 pl-6 pr-4 whitespace-nowrap">Código y espacio</th>
              <th class="px-4 py-3">Detalle de inspección y arreglo ejecutado</th>
              <th class="px-4 py-3 whitespace-nowrap">Estado posventa</th>
              <th class="py-3 pl-4 pr-6 text-right whitespace-nowrap">Tu conformidad</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-border text-xs">
            {#each ownerSnags as snag (snag.id)}
              <tr class="transition-colors hover:bg-muted/30">
                <td class="py-3.5 pl-6 pr-4 whitespace-nowrap align-top">
                  <span class="rounded bg-muted px-2 py-0.5 font-mono text-[11px] font-bold text-foreground">
                    {snag.code}
                  </span>
                  <div class="mt-1 font-medium text-muted-foreground">{snag.roomZone}</div>
                </td>

                <td class="px-4 py-3.5 max-w-xl align-top">
                  <div class="font-semibold text-foreground text-sm">{snag.title}</div>
                  <p class="mt-0.5 text-muted-foreground leading-relaxed">{snag.description}</p>
                </td>

                <td class="px-4 py-3.5 whitespace-nowrap align-top">
                  {#if snag.status === 'validado_propietario'}
                    <span class="inline-flex items-center gap-1.5 rounded-md border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium whitespace-nowrap text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 class="w-3.5 h-3.5" />
                      Validado por ti ({snag.resolvedDate})
                    </span>
                  {:else}
                    <span class="inline-flex items-center gap-1.5 rounded-md border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-xs font-medium whitespace-nowrap text-amber-600 dark:text-amber-400">
                      Corregido por constructora · Por validar
                    </span>
                  {/if}
                </td>

                <td class="py-3.5 pl-4 pr-6 text-right whitespace-nowrap align-top">
                  {#if snag.status === 'validado_propietario'}
                    <span class="font-mono text-xs whitespace-nowrap text-muted-foreground">✓ Recibido a satisfacción</span>
                  {:else}
                    <button
                      type="button"
                      onclick={() => projectStore.validateUnitSnagItem(snag.id)}
                      class="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg bg-foreground px-3 py-1.5 text-xs font-medium whitespace-nowrap text-background transition-opacity hover:opacity-90"
                    >
                      Confirmar arreglo a satisfacción
                    </button>
                  {/if}
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>

      {#if handoverRecord}
        <div class="border-t border-emerald-500/30 bg-emerald-500/10 px-6 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div class="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-medium">
            <ShieldCheck class="w-4 h-4 shrink-0" />
            <span>
              Acta Digital de Recibo del Apartamento {ownerUnit.unitNumber} sellada en Stellar el {handoverRecord.signedAt}.
            </span>
          </div>
          <span class="font-mono text-[11px] text-foreground truncate max-w-xs">
            Tx: {handoverRecord.txHash}
          </span>
        </div>
      {/if}
    </Card>

    <!-- Sección Inferior: Desglose de acabados de tu unidad + Ubicación y Respaldo en Stellar -->
    <div class="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
      <Card class="xl:col-span-6 bg-card border-border shadow-none">
        <CardHeader class="pb-3 border-b border-border">
          <div class="flex items-center justify-between">
            <CardTitle class="text-sm font-semibold text-foreground">
              Estado por etapa constructiva — {ownerUnit.unitNumber}
            </CardTitle>
            <Badge variant="outline" class="text-[11px] font-normal bg-muted/50 border-border tabular-nums">
              Corte #{ownerProject.number}
            </Badge>
          </div>
        </CardHeader>
        <CardContent class="p-5 space-y-4">
          {#each ownerUnit.unitActivities as act}
            <div class="space-y-1.5">
              <div class="flex items-center justify-between text-xs">
                <span class="text-foreground font-medium">{act.name}</span>
                <span class="font-semibold text-foreground tabular-nums">
                  {act.percent.toFixed(1)}%
                </span>
              </div>
              <div class="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  class="h-full rounded-full transition-all {act.percent === 100
                    ? 'bg-emerald-500'
                    : 'bg-[#F5A400]'}"
                  style="width: {act.percent}%"
                ></div>
              </div>
            </div>
          {/each}

          <div class="pt-3 border-t border-border grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
            <div class="p-3 rounded-lg bg-muted/30 border border-border">
              <span class="text-[11px] text-muted-foreground block">Parqueadero y depósito asignados</span>
              <span class="font-medium text-foreground block mt-0.5">{ownerUnit.parkingSpot}</span>
            </div>
            <div class="p-3 rounded-lg bg-muted/30 border border-border">
              <span class="text-[11px] text-muted-foreground block">Respaldo criptográfico en Stellar</span>
              <span class="font-mono text-[11px] text-foreground block mt-0.5 truncate tabular-nums">
                {ownerFloorData?.hashSha256 || ownerProject.sha256Hash}
              </span>
            </div>
          </div>

          <div class="pt-1 flex justify-end">
            <Button href="/verificar" variant="outline" size="sm" class="h-8 text-xs">
              Auditar certificado en el verificador público →
            </Button>
          </div>
        </CardContent>
      </Card>

      <div class="xl:col-span-6">
        <ProjectMapCard
          projectName={ownerUnit.projectName}
          address={ownerUnit.address}
          city={ownerUnit.city}
          heightClass="h-72"
        />
      </div>
    </div>
  </div>
{/if}

<!-- Modal Amplio de Inspección Fotográfica para el Propietario -->
{#if activeModalPhoto && ownerUnit && ownerProject}
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-3 sm:p-6"
    onclick={() => (activeModalPhotoIndex = null)}
  >
    <div
      class="w-[96vw] xl:w-[90vw] max-w-[1360px] rounded-xl border border-border bg-card text-card-foreground shadow-2xl overflow-hidden"
      onclick={(e) => e.stopPropagation()}
    >
      <div class="px-6 py-4 border-b border-border flex flex-wrap items-center justify-between gap-4 bg-muted/20">
        <div class="space-y-0.5">
          <div class="flex items-center gap-2">
            <Badge variant="outline" class="text-[11px] font-medium bg-background border-border">
              {activeModalPhoto.scope === 'unit'
                ? `Interior de tu ${ownerUnit.unitNumber}`
                : 'Avance general del edificio'}
            </Badge>
            <span class="text-xs text-muted-foreground">{activeModalPhoto.roomOrArea}</span>
          </div>
          <h3 class="text-base sm:text-lg font-semibold text-foreground">{activeModalPhoto.title}</h3>
        </div>

        <div class="flex items-center gap-2">
          <div class="inline-flex items-center rounded-lg border border-border bg-background p-0.5">
            <button
              type="button"
              disabled={activeModalPhotoIndex === 0}
              onclick={() =>
                activeModalPhotoIndex !== null &&
                activeModalPhotoIndex > 0 &&
                (activeModalPhotoIndex -= 1)}
              class="px-2.5 py-1 rounded text-xs font-medium flex items-center gap-1 disabled:opacity-40 hover:bg-muted cursor-pointer"
            >
              <ChevronLeft class="w-3.5 h-3.5" />
              <span>Anterior</span>
            </button>
            <span class="text-border px-1 text-xs">|</span>
            <button
              type="button"
              disabled={activeModalPhotoIndex === filteredPhotos.length - 1}
              onclick={() =>
                activeModalPhotoIndex !== null &&
                activeModalPhotoIndex < filteredPhotos.length - 1 &&
                (activeModalPhotoIndex += 1)}
              class="px-2.5 py-1 rounded text-xs font-medium flex items-center gap-1 disabled:opacity-40 hover:bg-muted cursor-pointer"
            >
              <span>Siguiente</span>
              <ChevronRight class="w-3.5 h-3.5" />
            </button>
          </div>

          <Button
            variant="outline"
            size="icon"
            onclick={() => (activeModalPhotoIndex = null)}
            class="h-8 w-8 cursor-pointer"
          >
            <X class="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12">
        <div class="lg:col-span-8 bg-zinc-950 flex items-center justify-center max-h-[540px] overflow-hidden relative">
          <img
            src={activeModalPhoto.fullUrl}
            alt={activeModalPhoto.title}
            class="w-full h-full object-cover"
          />
          <div class="absolute bottom-3 left-3 flex flex-wrap gap-1.5">
            {#if activeModalPhoto.gpsVerified}
              <span class="px-2.5 py-1 rounded-md text-xs font-medium bg-black/75 text-white border border-white/15 flex items-center gap-1.5">
                <CheckCircle2 class="w-3.5 h-3.5 text-emerald-400" />
                GPS y fecha verificados por interventoría
              </span>
            {/if}
          </div>
        </div>

        <div class="lg:col-span-4 p-6 flex flex-col justify-between space-y-5 text-xs">
          <div class="space-y-4">
            <div class="p-3.5 rounded-lg bg-muted/30 border border-border space-y-2">
              <div class="text-[11px] text-muted-foreground font-medium">Concepto técnico de interventoría</div>
              <p class="text-xs text-foreground leading-relaxed">
                {activeModalPhoto.inspectorNote}
              </p>
              <div class="pt-2 border-t border-border/60 text-[11px] text-muted-foreground">
                Firmado por: {ownerProject.interventorName}
              </div>
            </div>

            <div class="p-3.5 rounded-lg bg-muted/30 border border-border space-y-2 tabular-nums">
              <div class="flex justify-between">
                <span class="text-muted-foreground">Inmueble</span>
                <span class="font-medium text-foreground">{ownerUnit.unitNumber} (Piso {ownerUnit.floorLevel})</span>
              </div>
              <div class="flex justify-between">
                <span class="text-muted-foreground">Espacio inspeccionado</span>
                <span class="font-medium text-foreground">{activeModalPhoto.roomOrArea}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-muted-foreground">Fecha de toma</span>
                <span class="font-medium text-foreground">{activeModalPhoto.timestamp}</span>
              </div>
            </div>

            <div class="space-y-1.5">
              <span class="text-[11px] text-muted-foreground block">Elementos validados por IA:</span>
              <div class="flex flex-wrap gap-1.5">
                {#each activeModalPhoto.aiDetectedElements as tag}
                  <Badge variant="outline" class="text-[11px] font-normal bg-muted/50 border-border">
                    {tag}
                  </Badge>
                {/each}
              </div>
            </div>

            <div class="p-3 rounded-lg bg-muted/30 border border-border space-y-1">
              <span class="text-[11px] text-muted-foreground flex items-center gap-1.5">
                <ShieldCheck class="w-3.5 h-3.5 text-emerald-500" />
                <span>Sello SHA-256 del Nivel {ownerUnit.floorLevel} en Stellar</span>
              </span>
              <div class="font-mono text-[10px] text-foreground truncate tabular-nums">
                {ownerFloorData?.hashSha256 || ownerProject.sha256Hash}
              </div>
            </div>
          </div>

          <div class="pt-3 border-t border-border flex justify-end">
            <Button
              onclick={() => (activeModalPhotoIndex = null)}
              class="h-8 px-4 bg-foreground text-background hover:bg-foreground/90 text-xs cursor-pointer"
            >
              Cerrar vista ampliada
            </Button>
          </div>
        </div>
      </div>
    </div>
  </div>
{/if}

<!-- MODAL PARA REPORTAR DETALLE DE PRE-ENTREGA / SNAG LIST -->
{#if showAddSnagModal && ownerUnit}
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    class="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4"
    onclick={() => (showAddSnagModal = false)}
  >
    <div
      class="bg-card border border-border rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden"
      onclick={(e) => e.stopPropagation()}
    >
      <div class="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/20">
        <div>
          <h3 class="text-sm font-bold text-foreground">
            Reportar detalle de pre-entrega — Apto {ownerUnit.unitNumber}
          </h3>
          <p class="text-xs text-muted-foreground">
            Registra cualquier observación estética o funcional para ajuste de la constructora.
          </p>
        </div>
        <button
          type="button"
          onclick={() => (showAddSnagModal = false)}
          class="p-1.5 rounded-lg text-muted-foreground hover:bg-muted cursor-pointer"
        >
          <X class="w-4 h-4" />
        </button>
      </div>

      <form onsubmit={handleAddOwnerSnag} class="p-6 space-y-4 text-xs">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label for="snag-room" class="block font-semibold text-foreground">Espacio del apartamento</label>
            <select
              id="snag-room"
              bind:value={newSnagRoom}
              class="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground"
            >
              <option value="Sala-Comedor y Balcón">Sala-Comedor y Balcón</option>
              <option value="Cocina Abierta + Zona Ropas">Cocina Abierta + Zona Ropas</option>
              <option value="Alcoba Principal + Vestier">Alcoba Principal + Vestier</option>
              <option value="Alcobas Auxiliares y Baño">Alcobas Auxiliares y Baño</option>
            </select>
          </div>

          <div>
            <label for="snag-cat" class="block font-semibold text-foreground">Especialidad</label>
            <select
              id="snag-cat"
              bind:value={newSnagCategory}
              class="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground"
            >
              <option value="acabados">Pintura, estuco y enchapes</option>
              <option value="carpinteria">Carpintería y herrajes</option>
              <option value="hidrosanitario">Griferías e hidrosanitarios</option>
              <option value="ventaneria">Ventanería acústica y vidrios</option>
            </select>
          </div>
        </div>

        <div>
          <label for="snag-title" class="block font-semibold text-foreground">Detalle observado *</label>
          <input
            id="snag-title"
            type="text"
            required
            bind:value={newSnagTitle}
            placeholder="Ej. Retoque de pintura en guardaescoba de sala"
            class="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground"
          />
        </div>

        <div>
          <label for="snag-desc" class="block font-semibold text-foreground">Descripción adicional</label>
          <textarea
            id="snag-desc"
            rows="2"
            bind:value={newSnagDesc}
            placeholder="Indica la ubicación exacta dentro del ambiente..."
            class="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground"
          ></textarea>
        </div>

        <div class="pt-3 border-t border-border flex justify-end gap-2">
          <button
            type="button"
            onclick={() => (showAddSnagModal = false)}
            class="rounded-lg border border-border bg-background px-4 py-2 text-xs font-medium text-foreground hover:bg-muted cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="submit"
            class="rounded-lg bg-foreground px-4 py-2 text-xs font-medium text-background hover:opacity-90 cursor-pointer"
          >
            Registrar detalle
          </button>
        </div>
      </form>
    </div>
  </div>
{/if}

<!-- MODAL: CERTIFICADO TRIBUTARIO Y ESTADO DE ENCARGO FIDUCIARIO (IMPRIMIBLE) -->
{#if showTaxCertModal && ownerUnit && ownerProject}
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    class="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4"
    onclick={() => (showTaxCertModal = false)}
  >
    <div
      class="bg-card border border-border rounded-xl max-w-2xl w-full shadow-2xl overflow-hidden"
      onclick={(e) => e.stopPropagation()}
    >
      <div class="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/20">
        <div class="flex items-center gap-2.5">
          <div class="w-9 h-9 rounded-lg bg-muted border border-border flex items-center justify-center text-foreground">
            <FileText class="w-4 h-4" />
          </div>
          <div>
            <div class="flex items-center gap-2">
              <Badge variant="outline" class="text-[10px] font-mono">CERT-DIAN-2026-{ownerUnit.unitNumber}</Badge>
              <Badge variant="outline" class="text-[10px] text-emerald-500 border-emerald-500/30 bg-emerald-500/10">Firmado Fiduciaria</Badge>
            </div>
            <h3 class="text-sm font-semibold text-foreground mt-0.5">Certificación de Aportes a Encargo Fiduciario Inmobiliario</h3>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onclick={() => window.print()}
            class="h-8 text-xs gap-1.5 cursor-pointer"
          >
            <Printer class="w-3.5 h-3.5" />
            Imprimir / Guardar PDF
          </Button>
          <button
            onclick={() => (showTaxCertModal = false)}
            class="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
          >
            <X class="w-4 h-4" />
          </button>
        </div>
      </div>

      <div class="p-6 space-y-5 max-h-[80vh] overflow-y-auto text-xs">
        <div class="p-4 rounded-xl bg-muted/20 border border-border space-y-3">
          <div class="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-3">
            <div>
              <div class="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Entidad Certificadora</div>
              <div class="text-sm font-semibold text-foreground">{ownerUnit.fiduciaryEntity}</div>
              <div class="text-[11px] text-muted-foreground">Patrimonio Autónomo {ownerProject.projectName} · NIT 901.482.391-4</div>
            </div>
            <div class="text-right">
              <div class="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Encargo Fiduciario Individual</div>
              <div class="text-sm font-mono font-bold text-foreground">{ownerUnit.fiduciaryContractCode}</div>
              <div class="text-[11px] text-muted-foreground">Año Gravable Vigente · Corte 2026</div>
            </div>
          </div>

          <p class="text-muted-foreground leading-relaxed">
            La sociedad fiduciaria certifica que el adherente / fideicomitente de vinculación <strong class="text-foreground">{ownerUnit.ownerName}</strong>,
            vinculado a la unidad inmobiliaria <strong class="text-foreground">{ownerUnit.unitNumber} (Piso {ownerUnit.floorLevel})</strong> del proyecto
            <strong class="text-foreground">{ownerProject.projectName}</strong> ({ownerProject.city}), presenta el siguiente saldo consolidado de aportes:
          </p>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div class="p-3 rounded-lg bg-muted/15 border border-border">
            <span class="text-[10px] text-muted-foreground block">Valor Total Unidad</span>
            <span class="text-xs font-bold text-foreground font-mono tabular-nums mt-0.5 block">{formatCOP(ownerFinancialPlan.totalUnitValueCOP)}</span>
          </div>
          <div class="p-3 rounded-lg bg-muted/15 border border-border">
            <span class="text-[10px] text-muted-foreground block">Cuota Inicial (30%)</span>
            <span class="text-xs font-bold text-foreground font-mono tabular-nums mt-0.5 block">{formatCOP(ownerFinancialPlan.initialQuotaTotalCOP)}</span>
          </div>
          <div class="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <span class="text-[10px] text-emerald-500 block">Aportes Recaudados</span>
            <span class="text-xs font-bold text-emerald-500 font-mono tabular-nums mt-0.5 block">{formatCOP(ownerFinancialPlan.paidInitialQuotaCOP)}</span>
          </div>
          <div class="p-3 rounded-lg bg-muted/20 border border-border">
            <span class="text-[10px] text-muted-foreground block">Rendimientos Fiduciarios</span>
            <span class="text-xs font-bold text-foreground font-mono tabular-nums mt-0.5 block">+{formatCOP(ownerFinancialPlan.fiduciaryYieldsCOP)}</span>
          </div>
        </div>

        <div class="rounded-lg border border-border overflow-hidden">
          <div class="px-3.5 py-2 bg-muted/30 border-b border-border font-semibold text-foreground">
            Relación de recaudos conciliados en el encargo
          </div>
          <div class="divide-y divide-border/60">
            {#each ownerFinancialPlan.installments.filter((i) => i.status === 'pagado') as inst}
              <div class="px-3.5 py-2 flex items-center justify-between">
                <div>
                  <span class="font-medium text-foreground">{inst.num}</span>
                  <span class="text-[11px] text-muted-foreground block">Fecha: {inst.date} · Ref: {inst.ref}</span>
                </div>
                <span class="font-mono font-semibold text-emerald-500 tabular-nums">{formatCOP(inst.amount)}</span>
              </div>
            {/each}
          </div>
        </div>

        <div class="p-3.5 rounded-lg bg-muted/25 border border-border space-y-1">
          <div class="flex items-center justify-between text-[11px]">
            <span class="text-muted-foreground flex items-center gap-1.5">
              <ShieldCheck class="w-3.5 h-3.5 text-emerald-500" />
              Sello de Integridad Documental en Stellar Soroban
            </span>
            <span class="font-mono text-emerald-500">VERIFICADO</span>
          </div>
          <div class="font-mono text-[10px] text-foreground break-all">
            {ownerProject.sha256Hash}
          </div>
        </div>
      </div>

      <div class="px-6 py-3.5 border-t border-border bg-muted/20 flex items-center justify-end gap-2">
        <Button
          variant="outline"
          onclick={() => (showTaxCertModal = false)}
          class="h-8 text-xs cursor-pointer"
        >
          Cerrar
        </Button>
        <Button
          onclick={() => window.print()}
          class="h-8 text-xs bg-foreground text-background hover:bg-foreground/90 gap-1.5 cursor-pointer"
        >
          <Printer class="w-3.5 h-3.5" />
          Imprimir Certificado
        </Button>
      </div>
    </div>
  </div>
{/if}

