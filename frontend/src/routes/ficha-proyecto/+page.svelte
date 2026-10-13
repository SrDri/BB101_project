<script lang="ts">
  import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
  import { Badge } from '$lib/components/ui/badge';
  import { Button } from '$lib/components/ui/button';
  import ProjectMapCard from '$lib/components/dashboard/ProjectMapCard.svelte';
  import { projectStore } from '$lib/stores/projectState.svelte';
  import {
    Building2,
    Waves,
    Home,
    Layers,
    Car,
    BedDouble,
    Bath,
    Maximize2,
    Compass,
    Ruler,
    CheckCircle2,
    X
  } from '@lucide/svelte';

  const cut = $derived(projectStore.activeCut);
  const ficha = $derived(projectStore.activeFicha);

  let selectedTypologyId = $state<string>('typ-a');
  const activeTypology = $derived(
    ficha.typologies.find((t) => t.id === selectedTypologyId) || ficha.typologies[0]
  );

  let isBlueprintModalOpen = $state(false);
  let hoveredZoneId = $state<string | null>(null);

  // Architectural blueprint metadata per typology (supports Tipo A, Tipo B, Tipo C, Penthouse, and any custom typology)
  interface BlueprintZone {
    id: string;
    name: string;
    areaM2: string;
    dimensions: string;
    x: number;
    y: number;
    w: number;
    h: number;
    fill: string;
  }

  const typologyBlueprintSpec = $derived.by(() => {
    const code = activeTypology.code.toUpperCase();
    const bedrooms = activeTypology.bedrooms;

    if (bedrooms <= 2 || code.includes('B')) {
      // TIPO B — Ejecutivo (2 Alcobas + 2 Baños + Cocina Americana + Balcón)
      return {
        outerWidthM: '9.60 m',
        outerDepthM: '7.50 m',
        orientation: 'Fachada Oriental • Iluminación matutina',
        scaleLabel: 'Escala 1:50 • Planta Arquitectónica Tipo B (2 Alcobas)',
        zones: [
          {
            id: 'z-balcon',
            name: 'Balcón mirador cubierto',
            areaM2: '7.2 m²',
            dimensions: '5.20 m × 1.40 m',
            x: 50,
            y: 36,
            w: 360,
            h: 64,
            fill: 'rgba(14, 165, 233, 0.10)'
          },
          {
            id: 'z-social',
            name: 'Sala - Comedor integrados',
            areaM2: '21.8 m²',
            dimensions: '5.20 m × 4.20 m',
            x: 50,
            y: 100,
            w: 360,
            h: 150,
            fill: 'rgba(16, 185, 129, 0.08)'
          },
          {
            id: 'z-cocina',
            name: 'Cocina tipo isla + Ropas',
            areaM2: '12.4 m²',
            dimensions: '4.10 m × 3.00 m',
            x: 410,
            y: 36,
            w: 290,
            h: 214,
            fill: 'rgba(245, 164, 0, 0.08)'
          },
          {
            id: 'z-master',
            name: 'Alcoba principal + Vestier + Baño',
            areaM2: '18.2 m²',
            dimensions: '4.80 m × 3.80 m',
            x: 50,
            y: 250,
            w: 360,
            h: 170,
            fill: 'rgba(139, 92, 246, 0.08)'
          },
          {
            id: 'z-aux1',
            name: 'Alcoba auxiliar 2 + Baño social',
            areaM2: '12.4 m²',
            dimensions: '4.10 m × 3.10 m',
            x: 410,
            y: 250,
            w: 290,
            h: 170,
            fill: 'rgba(16, 185, 129, 0.07)'
          }
        ] as BlueprintZone[]
      };
    }

    if (bedrooms >= 4 || code.includes('PH')) {
      // PENTHOUSE DUPLEX / GRAN FORMATO (4 Alcobas + Terraza Perimetral + Family Room)
      return {
        outerWidthM: '14.50 m',
        outerDepthM: '11.40 m',
        orientation: 'Vista 360° Panorámica • Doble Altura',
        scaleLabel: 'Escala 1:75 • Planta Arquitectónica Penthouse Duplex (4 Alcobas)',
        zones: [
          {
            id: 'z-terraza',
            name: 'Terraza perimetral Lounge & Jacuzzi',
            areaM2: '28.5 m²',
            dimensions: '14.50 m × 2.10 m',
            x: 50,
            y: 36,
            w: 650,
            h: 68,
            fill: 'rgba(14, 165, 233, 0.12)'
          },
          {
            id: 'z-social',
            name: 'Gran Salón doble altura + Comedor 8 puestos',
            areaM2: '42.0 m²',
            dimensions: '7.80 m × 5.40 m',
            x: 50,
            y: 104,
            w: 350,
            h: 146,
            fill: 'rgba(16, 185, 129, 0.09)'
          },
          {
            id: 'z-cocina',
            name: 'Cocina Gourmet isla central + Cava + Ropas',
            areaM2: '24.5 m²',
            dimensions: '6.70 m × 3.70 m',
            x: 400,
            y: 104,
            w: 300,
            h: 146,
            fill: 'rgba(245, 164, 0, 0.09)'
          },
          {
            id: 'z-master',
            name: 'Master Suite + Walk-in Closet doble + Spa Bath',
            areaM2: '32.0 m²',
            dimensions: '6.40 m × 5.00 m',
            x: 50,
            y: 250,
            w: 250,
            h: 170,
            fill: 'rgba(139, 92, 246, 0.09)'
          },
          {
            id: 'z-aux1',
            name: 'Alcobas 2 y 3 con baño privado',
            areaM2: '24.0 m²',
            dimensions: '5.00 m × 4.80 m',
            x: 300,
            y: 250,
            w: 210,
            h: 170,
            fill: 'rgba(16, 185, 129, 0.07)'
          },
          {
            id: 'z-aux2',
            name: 'Alcoba 4 / Estudio + Estar de TV',
            areaM2: '14.0 m²',
            dimensions: '3.80 m × 3.70 m',
            x: 510,
            y: 250,
            w: 190,
            h: 170,
            fill: 'rgba(245, 164, 0, 0.07)'
          }
        ] as BlueprintZone[]
      };
    }

    if (code.includes('C') || activeTypology.areaBuiltM2 >= 110) {
      // TIPO C — Esquinero Panorámico (118 m² • 3 Alcobas + Estar de TV + Balcón en L)
      return {
        outerWidthM: '12.80 m',
        outerDepthM: '9.20 m',
        orientation: 'Esquinero Nororiental • Ventilación cruzada',
        scaleLabel: 'Escala 1:50 • Planta Arquitectónica Tipo C Esquinero (3 Alcobas + Estar)',
        zones: [
          {
            id: 'z-balcon',
            name: 'Balcón esquinero panorámico',
            areaM2: '12.6 m²',
            dimensions: '7.40 m × 1.70 m',
            x: 50,
            y: 36,
            w: 390,
            h: 64,
            fill: 'rgba(14, 165, 233, 0.11)'
          },
          {
            id: 'z-social',
            name: 'Sala - Comedor esquinero piso a techo',
            areaM2: '31.4 m²',
            dimensions: '6.80 m × 4.60 m',
            x: 50,
            y: 100,
            w: 390,
            h: 150,
            fill: 'rgba(16, 185, 129, 0.08)'
          },
          {
            id: 'z-cocina',
            name: 'Cocina cerrada/abierta + Alacena + Ropas',
            areaM2: '18.2 m²',
            dimensions: '4.80 m × 3.80 m',
            x: 440,
            y: 36,
            w: 260,
            h: 214,
            fill: 'rgba(245, 164, 0, 0.08)'
          },
          {
            id: 'z-master',
            name: 'Alcoba principal + Vestier + Baño doble lavamanos',
            areaM2: '24.8 m²',
            dimensions: '5.40 m × 4.60 m',
            x: 50,
            y: 250,
            w: 270,
            h: 170,
            fill: 'rgba(139, 92, 246, 0.08)'
          },
          {
            id: 'z-estar',
            name: 'Estar de TV / Estudio + Baño social',
            areaM2: '13.5 m²',
            dimensions: '3.60 m × 3.75 m',
            x: 320,
            y: 250,
            w: 175,
            h: 170,
            fill: 'rgba(14, 165, 233, 0.07)'
          },
          {
            id: 'z-aux',
            name: 'Alcobas auxiliares 2 y 3',
            areaM2: '17.5 m²',
            dimensions: '4.60 m × 3.80 m',
            x: 495,
            y: 250,
            w: 205,
            h: 170,
            fill: 'rgba(16, 185, 129, 0.07)'
          }
        ] as BlueprintZone[]
      };
    }

    // DEFAULT: TIPO A — Familiar (94 m² • 3 Alcobas + Estudio + Balcón Terraza)
    return {
      outerWidthM: '11.40 m',
      outerDepthM: '8.25 m',
      orientation: 'Fachada Principal • Asoleación controlada',
      scaleLabel: 'Escala 1:50 • Planta Arquitectónica Tipo A Familiar (3 Alcobas)',
      zones: [
        {
          id: 'z-balcon',
          name: 'Balcón terraza cubierto',
          areaM2: '8.6 m²',
          dimensions: '5.80 m × 1.50 m',
          x: 50,
          y: 36,
          w: 320,
          h: 62,
          fill: 'rgba(14, 165, 233, 0.10)'
        },
        {
          id: 'z-social',
          name: 'Sala - Comedor principal',
          areaM2: '24.4 m²',
          dimensions: '5.80 m × 4.20 m',
          x: 50,
          y: 98,
          w: 320,
          h: 152,
          fill: 'rgba(16, 185, 129, 0.08)'
        },
        {
          id: 'z-cocina',
          name: 'Cocina abierta con isla + Zona de ropas',
          areaM2: '15.8 m²',
          dimensions: '4.60 m × 3.45 m',
          x: 370,
          y: 36,
          w: 330,
          h: 214,
          fill: 'rgba(245, 164, 0, 0.08)'
        },
        {
          id: 'z-master',
          name: 'Alcoba principal + Vestier + Baño privado',
          areaM2: '22.2 m²',
          dimensions: '5.40 m × 4.10 m',
          x: 50,
          y: 250,
          w: 320,
          h: 170,
          fill: 'rgba(139, 92, 246, 0.08)'
        },
        {
          id: 'z-aux',
          name: 'Alcobas auxiliares 2 y 3 + Estudio + Baño social',
          areaM2: '23.0 m²',
          dimensions: '6.00 m × 3.85 m',
          x: 370,
          y: 250,
          w: 330,
          h: 170,
          fill: 'rgba(16, 185, 129, 0.07)'
        }
      ] as BlueprintZone[]
    };
  });

  function formatCOP(value: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0
    }).format(value);
  }

  function getAmenityCategoryLabel(cat: string) {
    switch (cat) {
      case 'recreacion':
        return 'Recreación y zonas húmedas';
      case 'bienestar':
        return 'Deporte y bienestar';
      case 'social':
        return 'Social y coworking';
      default:
        return 'Infraestructura y seguridad';
    }
  }

  const PROJECT_HERO_RENDERS: Record<string, string> = {
    'PROJ-ALAMEDA-01': 'https://lh3.googleusercontent.com/d/19fvcD9C5vOiJiz4zziXKQycwdFEigivc=w1600',
    'PROJ-MIRADOR-02': 'https://lh3.googleusercontent.com/d/1G5ZhYdXo3pK4OieWjID_0McvmO8jx1rB=w1600',
    'PROJ-SIETEMARES-03': 'https://lh3.googleusercontent.com/d/1UjtYmN90iQvI0AbL2OcfD3AcwrGh02AP=w1600',
    'PROJ-CERROS-04': 'https://lh3.googleusercontent.com/d/1iP1fWrvjH93sZq7NJmrAdcB2dVh5ZN3i=w1600',
    'PROJ-CASTELLANA-05': 'https://lh3.googleusercontent.com/d/1bUpsrIGIITWHnh9VWI6OiDuvO2XvnLNV=w1600'
  };

  const activeHeroImage = $derived(
    PROJECT_HERO_RENDERS[cut.projectId] || PROJECT_HERO_RENDERS['PROJ-ALAMEDA-01']
  );

  // Permisos de edición por rol según modelo de Fiducia Inmobiliaria (Ley 1796)
  const canEditCommercial = $derived(
    projectStore.effectiveRole === 'constructor' || projectStore.effectiveRole === 'admin'
  );
  const canEditFiduciary = $derived(
    projectStore.effectiveRole === 'fiduciaria' || projectStore.effectiveRole === 'admin'
  );
  const canCertifyAmenities = $derived(
    projectStore.effectiveRole === 'interventor' || projectStore.effectiveRole === 'admin'
  );

  let isCommercialModalOpen = $state(false);
  let editDescription = $state('');
  let editEstimatedDelivery = $state('');
  let editPropertyType = $state<typeof ficha.propertyType>('Apartamentos residenciales');
  let editStratum = $state('');
  let editSoldUnits = $state(0);
  let editReservedUnits = $state(0);

  let isFiduciaryModalOpen = $state(false);
  let editFiduciaryTrustCode = $state('');
  let editTotalBudgetCOP = $state(0);
  let editEquilibriumPercent = $state(70);
  let editLifecycleStatus = $state<typeof cut.lifecycleStatus>('in_progress');

  let saveFeedbackBanner = $state<string | null>(null);

  function openCommercialModal() {
    editDescription = ficha.description;
    editEstimatedDelivery = ficha.estimatedDelivery;
    editPropertyType = ficha.propertyType;
    editStratum = ficha.stratum;
    editSoldUnits = ficha.soldUnits;
    editReservedUnits = ficha.reservedUnits;
    isCommercialModalOpen = true;
  }

  function handleSaveCommercial(e: SubmitEvent) {
    e.preventDefault();
    projectStore.updateProjectFichaCommercial(cut.projectId, {
      description: editDescription,
      estimatedDelivery: editEstimatedDelivery,
      soldUnits: Number(editSoldUnits),
      reservedUnits: Number(editReservedUnits),
      propertyType: editPropertyType,
      stratum: editStratum
    });
    isCommercialModalOpen = false;
    saveFeedbackBanner = 'Ficha comercial e inventario de ventas actualizados y registrados en bitácora de auditoría.';
    setTimeout(() => (saveFeedbackBanner = null), 4500);
  }

  function openFiduciaryModal() {
    editFiduciaryTrustCode = cut.fiduciaryTrustCode;
    editTotalBudgetCOP = cut.totalBudgetCOP;
    editEquilibriumPercent = ficha.equilibriumPointPercent;
    editLifecycleStatus = cut.lifecycleStatus;
    isFiduciaryModalOpen = true;
  }

  function handleSaveFiduciary(e: SubmitEvent) {
    e.preventDefault();
    projectStore.updateProjectFiduciaryParams(cut.projectId, {
      fiduciaryTrustCode: editFiduciaryTrustCode,
      totalBudgetCOP: Number(editTotalBudgetCOP),
      lifecycleStatus: editLifecycleStatus,
      equilibriumPointPercent: Number(editEquilibriumPercent)
    });
    isFiduciaryModalOpen = false;
    saveFeedbackBanner = 'Parámetros del fideicomiso actualizados por Fiduciaria y registrados en bitácora.';
    setTimeout(() => (saveFeedbackBanner = null), 4500);
  }
</script>

<div class="space-y-6 w-full max-w-[1440px] mx-auto">
  <!-- Hero Cabecera de la Ficha del Proyecto con Render Arquitectónico y Gradiente -->
  <div class="relative overflow-hidden rounded-xl border border-border bg-card shadow-2xs">
    <!-- Imagen de render arquitectónico posicionada a la derecha con fusión por gradiente -->
    <div class="pointer-events-none absolute inset-y-0 right-0 w-full md:w-[65%]">
      <img
        src={activeHeroImage}
        alt="Render arquitectónico {cut.projectName}"
        referrerpolicy="no-referrer"
        class="h-full w-full object-cover object-center transition-all duration-300"
      />
      <!-- Gradiente horizontal principal para fundir el texto de la izquierda con el render -->
      <div
        class="absolute inset-0 bg-gradient-to-r from-card via-card/90 to-card/15 md:from-card md:via-card/65 md:to-transparent"
      ></div>
      <!-- Sutil viñeta vertical para integrar bordes e iluminar los botones inferiores -->
      <div
        class="absolute inset-0 bg-gradient-to-t from-card/85 via-transparent to-card/20"
      ></div>
    </div>

    <div class="relative z-10 flex min-h-[175px] flex-col justify-between gap-5 p-6 sm:p-7 lg:flex-row lg:items-end">
      <div class="max-w-2xl space-y-2">
        <div class="flex flex-wrap items-center gap-2">
          <Badge variant="outline" class="gap-1.5 border-border bg-background/85 text-[11px] font-medium text-foreground backdrop-blur-xs">
            <span class="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
            <span>{ficha.propertyType} • {ficha.stratum}</span>
          </Badge>
          <span class="rounded-md border border-border/60 bg-background/75 px-2 py-0.5 text-xs text-muted-foreground tabular-nums backdrop-blur-xs">
            {cut.code} • {cut.fiduciaryTrustCode} • {cut.city}
          </span>
        </div>

        <h1 class="text-2xl font-semibold tracking-tight text-foreground sm:text-[26px]">
          Ficha integral del proyecto — {cut.projectName}
        </h1>
        <p class="text-xs leading-relaxed text-muted-foreground sm:text-sm">
          Descripción arquitectónica, inventario de ventas, planos de tipologías de apartamentos y amenidades.
        </p>
      </div>

      <div class="flex flex-wrap items-center gap-2 shrink-0">
        {#if canEditCommercial}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onclick={openCommercialModal}
            class="h-8 border-border bg-background/90 text-xs backdrop-blur-md hover:bg-background cursor-pointer"
          >
            Editar ficha comercial
          </Button>
        {/if}

        {#if canEditFiduciary}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onclick={openFiduciaryModal}
            class="h-8 border-border bg-background/90 text-xs backdrop-blur-md hover:bg-background cursor-pointer"
          >
            Parámetros fiduciarios
          </Button>
        {/if}

        <Button
          href="/cumplimiento"
          variant="outline"
          size="sm"
          class="h-8 border-border bg-background/90 text-xs backdrop-blur-md hover:bg-background"
        >
          Cumplimiento y documentos
        </Button>
        <Button
          href="/gemelo"
          size="sm"
          class="h-8 bg-foreground text-xs text-background shadow-xs hover:bg-foreground/90"
        >
          Abrir Vista 3D
        </Button>
      </div>
    </div>
  </div>

  {#if saveFeedbackBanner}
    <div class="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2.5 text-xs text-emerald-600 dark:text-emerald-400 flex items-center justify-between">
      <span>{saveFeedbackBanner}</span>
      <button type="button" onclick={() => (saveFeedbackBanner = null)} class="text-xs underline cursor-pointer">Cerrar</button>
    </div>
  {/if}

  <!-- Barra de atribuciones del rol activo sobre la Ficha Integral -->
  <div class="rounded-xl border border-border bg-muted/25 px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
    <div class="flex flex-wrap items-center gap-2">
      <Badge variant="outline" class="bg-background text-[11px] font-medium border-border capitalize">
        Rol activo: {projectStore.effectiveRole}
      </Badge>
      <span class="text-muted-foreground">
        {#if projectStore.effectiveRole === 'constructor'}
          Atribución: Puedes editar la <strong>ficha comercial, fechas de entrega y absorción de ventas</strong>. El avance físico de obra y zonas comunes solo lo certifica Interventoría.
        {:else if projectStore.effectiveRole === 'fiduciaria'}
          Atribución: Puedes administrar los <strong>parámetros del fideicomiso, presupuesto aprobado y punto de equilibrio</strong>, o constituir nuevos proyectos en <a href="/proyectos" class="underline text-foreground">Portafolio</a>.
        {:else if projectStore.effectiveRole === 'interventor'}
          Atribución: Puedes <strong>certificar el porcentaje de avance físico real de las amenidades y zonas comunes</strong> (sección inferior) bajo firma COPNIA.
        {:else}
          Atribución Administrador: Tienes permisos completos para editar la ficha comercial (Constructora), parámetros del fideicomiso (Fiduciaria) y certificar zonas comunes (Interventoría).
        {/if}
      </span>
    </div>
  </div>

  <!-- 1. Descripción ejecutiva + Inventario de unidades y Punto de Equilibrio Comercial -->
  <div class="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">
    <Card class="xl:col-span-7 bg-card border-border shadow-none flex flex-col justify-between">
      <CardHeader class="pb-3 border-b border-border">
        <div class="flex items-center justify-between">
          <CardTitle class="text-sm font-semibold text-foreground flex items-center gap-2">
            <Building2 class="w-4 h-4 text-muted-foreground" />
            <span>Descripción general del desarrollo inmobiliario</span>
          </CardTitle>
          <span class="text-xs text-muted-foreground tabular-nums">
            Entrega estimada: <strong class="text-foreground">{ficha.estimatedDelivery}</strong>
          </span>
        </div>
      </CardHeader>

      <CardContent class="p-5 space-y-5 flex-1 flex flex-col justify-between">
        <p class="text-xs sm:text-sm text-muted-foreground leading-relaxed">
          {ficha.description}
        </p>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-border">
          <div class="p-3.5 rounded-xl bg-muted/25 border border-border space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-[11px] font-medium text-muted-foreground">Constructora responsable</span>
              <Badge variant="outline" class="text-[10px] font-medium bg-background border-border">
                {ficha.developerProfile.creditRating}
              </Badge>
            </div>
            <div class="text-sm font-semibold text-foreground">{ficha.developerProfile.name}</div>
            <div class="text-[11px] text-muted-foreground space-y-0.5 tabular-nums">
              <div>NIT: <strong class="text-foreground font-medium">{ficha.developerProfile.nit}</strong></div>
              <div>Rep. legal: {ficha.developerProfile.legalRepresentative}</div>
              <div>Trayectoria: {ficha.developerProfile.experienceYears} años • {ficha.developerProfile.completedProjectsCount} obras entregadas</div>
            </div>
          </div>

          <div class="p-3.5 rounded-xl bg-muted/25 border border-border space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-[11px] font-medium text-muted-foreground">Supervisión técnica e interventoría</span>
              <Badge variant="outline" class="text-[10px] font-medium bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/25">
                Independiente Ley 1796
              </Badge>
            </div>
            <div class="text-sm font-semibold text-foreground">{ficha.supervisorProfile.name}</div>
            <div class="text-[11px] text-muted-foreground space-y-0.5 tabular-nums">
              <div>Firma: {ficha.supervisorProfile.companyName}</div>
              <div>Matrícula: <strong class="text-foreground font-medium">{ficha.supervisorProfile.copniaLicense}</strong></div>
              <div>Póliza RC: {ficha.supervisorProfile.rcPolicyNumber} ({ficha.supervisorProfile.experienceYears} años exp.)</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <Card class="xl:col-span-5 bg-card border-border shadow-none flex flex-col justify-between">
      <CardHeader class="pb-3 border-b border-border">
        <div class="flex items-center justify-between">
          <CardTitle class="text-sm font-semibold text-foreground flex items-center gap-2">
            <Home class="w-4 h-4 text-muted-foreground" />
            <span>Inventario de unidades y ventas</span>
          </CardTitle>
          <Badge variant="outline" class="text-[11px] font-medium bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/25">
            Punto de equilibrio superado
          </Badge>
        </div>
      </CardHeader>

      <CardContent class="p-5 space-y-5 flex-1 flex flex-col justify-between">
        <div class="grid grid-cols-3 gap-3 text-center">
          <div class="p-3 rounded-xl bg-muted/30 border border-border">
            <div class="text-2xl font-semibold text-foreground tabular-nums">{ficha.totalUnits}</div>
            <div class="text-[11px] text-muted-foreground mt-0.5">Total unidades</div>
          </div>
          <div class="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25">
            <div class="text-2xl font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">
              {ficha.soldUnits}
            </div>
            <div class="text-[11px] text-muted-foreground mt-0.5">Vendidas ({ficha.currentSalesPercent}%)</div>
          </div>
          <div class="p-3 rounded-xl bg-muted/30 border border-border">
            <div class="text-2xl font-semibold text-foreground tabular-nums">
              {ficha.availableUnits + ficha.reservedUnits}
            </div>
            <div class="text-[11px] text-muted-foreground mt-0.5">
              Disponibles ({ficha.reservedUnits} sep.)
            </div>
          </div>
        </div>

        <div class="space-y-2 p-3.5 rounded-xl bg-muted/20 border border-border">
          <div class="flex items-center justify-between text-xs tabular-nums">
            <span class="font-medium text-foreground">Absorción comercial en fiduciaria</span>
            <span class="font-semibold text-foreground">{ficha.currentSalesPercent}% vendido</span>
          </div>
          <div class="relative w-full h-2.5 bg-muted rounded-full overflow-hidden">
            <div
              class="h-full bg-emerald-500 rounded-full transition-all"
              style="width: {ficha.currentSalesPercent}%"
            ></div>
            <div
              class="absolute top-0 bottom-0 w-0.5 bg-foreground"
              style="left: {ficha.equilibriumPointPercent}%"
              title="Punto de equilibrio exigido: {ficha.equilibriumPointPercent}%"
            ></div>
          </div>
          <div class="flex items-center justify-between text-[11px] text-muted-foreground tabular-nums">
            <span>Mínimo punto de equilibrio fiduciario: {ficha.equilibriumPointPercent}%</span>
            <span>Superávit: +{(ficha.currentSalesPercent - ficha.equilibriumPointPercent).toFixed(1)}%</span>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3 text-xs pt-1 border-t border-border tabular-nums">
          <div>
            <span class="text-muted-foreground block text-[11px]">Entidad fiduciaria</span>
            <span class="font-medium text-foreground">{cut.fiduciaryEntity}</span>
          </div>
          <div>
            <span class="text-muted-foreground block text-[11px]">Presupuesto total de obra</span>
            <span class="font-medium text-foreground">{formatCOP(cut.totalBudgetCOP)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>

  <!-- 2. Tipologías de Apartamentos + Visor Interactivo de Planos Arquitectónicos CAD -->
  <Card class="bg-card border-border shadow-none">
    <CardHeader class="pb-3 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-2">
      <div>
        <CardTitle class="text-base font-semibold text-foreground flex items-center gap-2">
          <Layers class="w-4 h-4 text-[#F5A400]" />
          <span>Tipologías y planos arquitectónicos ({ficha.typologies.length} configuraciones)</span>
        </CardTitle>
        <p class="text-xs text-muted-foreground mt-0.5">
          Selecciona cualquier tipología para inspeccionar su plano arquitectónico acotado, cuadro de áreas y distribución interior.
        </p>
      </div>
      <Badge variant="outline" class="text-xs font-normal bg-muted/50 border-border tabular-nums self-start sm:self-center">
        Planos técnicos acotados • Escala 1:50
      </Badge>
    </CardHeader>

    <CardContent class="p-5 space-y-6">
      <!-- Selector de Tarjetas de Tipología -->
      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {#each ficha.typologies as typ (typ.id)}
          {@const isSelected = activeTypology.id === typ.id}
          {@const soldRatio = Math.round((typ.soldUnits / typ.totalUnits) * 100)}
          <div
            role="button"
            tabindex="0"
            onclick={() => (selectedTypologyId = typ.id)}
            onkeydown={(e) => e.key === 'Enter' && (selectedTypologyId = typ.id)}
            class="p-4 rounded-xl border transition-all flex flex-col justify-between gap-4 cursor-pointer {isSelected
              ? 'bg-accent/70 border-foreground shadow-2xs ring-1 ring-foreground/15'
              : 'bg-muted/15 border-border hover:bg-muted/35'}"
          >
            <div class="space-y-2.5">
              <div class="flex items-center justify-between gap-2">
                <Badge variant="outline" class="text-[11px] font-semibold {isSelected ? 'bg-foreground text-background border-foreground' : 'bg-background border-border'}">
                  {typ.code}
                </Badge>
                <span class="text-xs text-muted-foreground tabular-nums">{typ.floorRange}</span>
              </div>

              <div>
                <h3 class="text-sm font-semibold text-foreground">{typ.name}</h3>
                <div class="mt-1 flex items-baseline gap-2 tabular-nums">
                  <span class="text-xl font-semibold text-foreground">{typ.areaBuiltM2} m²</span>
                  <span class="text-xs text-muted-foreground">({typ.areaPrivateM2} m² privados)</span>
                </div>
              </div>

              <div class="grid grid-cols-3 gap-2 pt-2 border-t border-border/60 text-[11px] text-muted-foreground tabular-nums">
                <div class="flex items-center gap-1">
                  <BedDouble class="w-3.5 h-3.5 text-foreground" />
                  <span>{typ.bedrooms} alcobas</span>
                </div>
                <div class="flex items-center gap-1">
                  <Bath class="w-3.5 h-3.5 text-foreground" />
                  <span>{typ.bathrooms} baños</span>
                </div>
                <div class="flex items-center gap-1">
                  <Car class="w-3.5 h-3.5 text-foreground" />
                  <span>{typ.parkingSpots} parq.</span>
                </div>
              </div>
            </div>

            <div class="pt-3 border-t border-border space-y-2 tabular-nums">
              <div class="flex items-center justify-between text-xs">
                <span class="text-muted-foreground">Vendidos</span>
                <span class="font-semibold text-foreground">
                  {typ.soldUnits} / {typ.totalUnits} ({soldRatio}%)
                </span>
              </div>
              <div class="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                <div class="h-full bg-emerald-500 rounded-full" style="width: {soldRatio}%"></div>
              </div>
              <div class="flex items-center justify-between text-xs pt-1">
                <span class="text-muted-foreground">Desde</span>
                <span class="font-semibold text-foreground">{formatCOP(typ.priceFromCOP)}</span>
              </div>
            </div>
          </div>
        {/each}
      </div>

      <!-- VISOR INTERACTIVO DEL PLANO ARQUITECTÓNICO DE LA TIPOLOGÍA SELECCIONADA -->
      <div class="rounded-2xl border border-border bg-muted/15 p-5">
        <div class="flex flex-col justify-between gap-3 border-b border-border pb-4 lg:flex-row lg:items-center">
          <div>
            <div class="flex flex-wrap items-center gap-2">
              <span class="rounded-md bg-foreground px-2.5 py-0.5 font-mono text-xs font-bold text-background">
                {activeTypology.code}
              </span>
              <h3 class="font-display text-base font-bold text-foreground">
                Plano arquitectónico acotado — {activeTypology.name} ({activeTypology.areaBuiltM2} m²)
              </h3>
            </div>
            <p class="mt-1 text-xs text-muted-foreground">
              {typologyBlueprintSpec.scaleLabel} • {typologyBlueprintSpec.orientation}
            </p>
          </div>

          <div class="flex flex-wrap items-center gap-2">
            <span class="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 font-mono text-xs text-foreground">
              <Ruler class="h-3.5 w-3.5 text-muted-foreground" />
              Cotas: {typologyBlueprintSpec.outerWidthM} × {typologyBlueprintSpec.outerDepthM}
            </span>
            <button
              type="button"
              onclick={() => (isBlueprintModalOpen = true)}
              class="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-foreground px-3.5 py-1.5 text-xs font-medium text-background transition-opacity hover:opacity-90"
            >
              <Maximize2 class="h-3.5 w-3.5" />
              <span>Ampliar plano técnico</span>
            </button>
          </div>
        </div>

        <div class="mt-5 grid grid-cols-1 items-start gap-6 xl:grid-cols-12">
          <!-- Lienzo CAD SVG del Plano de la Tipología (8 cols) -->
          <div class="rounded-xl border border-border bg-card p-4 shadow-2xs xl:col-span-8">
            <div class="relative w-full overflow-hidden rounded-lg border border-border/70 bg-background">
              <svg viewBox="0 0 750 455" class="h-auto w-full select-none">
                <defs>
                  <pattern id="typ-cad-grid" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path
                      d="M 20 0 L 0 0 0 20"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="0.4"
                      class="text-border/60"
                    />
                  </pattern>
                </defs>

                <!-- Retícula milimetrada CAD -->
                <rect width="750" height="455" fill="url(#typ-cad-grid)" />

                <!-- Cotas arquitectónicas exteriores superiores e izquierdas -->
                <g class="text-muted-foreground" stroke="currentColor" stroke-width="1">
                  <line x1="50" y1="18" x2="700" y2="18" />
                  <line x1="50" y1="12" x2="50" y2="24" />
                  <line x1="700" y1="12" x2="700" y2="24" />
                  <rect x="315" y="7" width="120" height="18" rx="4" class="fill-background" stroke="none" />
                  <text
                    x="375"
                    y="20"
                    text-anchor="middle"
                    class="fill-foreground font-mono text-[10px] font-semibold"
                    stroke="none"
                  >
                    ↔ {typologyBlueprintSpec.outerWidthM}
                  </text>

                  <!-- Cota vertical izquierda -->
                  <line x1="24" y1="36" x2="24" y2="420" />
                  <line x1="18" y1="36" x2="30" y2="36" />
                  <line x1="18" y1="420" x2="30" y2="420" />
                  <text
                    x="20"
                    y="230"
                    text-anchor="middle"
                    transform="rotate(-90 20 230)"
                    class="fill-foreground font-mono text-[10px] font-semibold"
                    stroke="none"
                  >
                    ↕ {typologyBlueprintSpec.outerDepthM}
                  </text>
                </g>

                <!-- Zonas coloreadas interactivas de la tipología -->
                {#each typologyBlueprintSpec.zones as z (z.id)}
                  {@const isHovered = hoveredZoneId === z.id}
                  <!-- svelte-ignore a11y_no_static_element_interactions -->
                  <g
                    onmouseenter={() => (hoveredZoneId = z.id)}
                    onmouseleave={() => (hoveredZoneId = null)}
                    class="cursor-pointer transition-opacity"
                  >
                    <rect
                      x={z.x}
                      y={z.y}
                      width={z.w}
                      height={z.h}
                      fill={z.fill}
                      stroke={isHovered ? '#10b981' : 'currentColor'}
                      stroke-width={isHovered ? '2.5' : '1.2'}
                      class="text-border"
                    />
                  </g>
                {/each}

                <!-- Mobiliario arquitectónico CAD vectorial adaptado a la planta -->
                <g stroke="currentColor" class="text-muted-foreground/55" fill="none" stroke-width="1.1">
                  <!-- Mobiliario terraza / balcón superior -->
                  <circle cx="110" cy="66" r="13" />
                  <circle cx="90" cy="66" r="4.5" />
                  <circle cx="130" cy="66" r="4.5" />
                  <rect x="60" y="46" width="16" height="16" rx="3" />

                  <!-- Sofá en L y comedor en zona social -->
                  <rect x="72" y="118" width="95" height="30" rx="4" />
                  <rect x="72" y="118" width="28" height="74" rx="4" />
                  <rect x="115" y="158" width="44" height="26" rx="2" />
                  <rect x="225" y="132" width="76" height="44" rx="4" />
                  <circle cx="242" cy="124" r="4" />
                  <circle cx="282" cy="124" r="4" />
                  <circle cx="242" cy="184" r="4" />
                  <circle cx="282" cy="184" r="4" />

                  <!-- Cocina con isla y lavaplatos -->
                  <rect x="445" y="115" width="96" height="32" rx="3" />
                  <circle cx="462" cy="156" r="5.5" />
                  <circle cx="492" cy="156" r="5.5" />
                  <circle cx="522" cy="156" r="5.5" />
                  <rect x="635" y="48" width="46" height="32" rx="3" />
                  <circle cx="658" cy="64" r="9" />

                  <!-- Cama King en Alcoba Principal + Mesas de noche + Baño privado -->
                  <rect x="70" y="264" width="66" height="58" rx="2" />
                  <line x1="70" y1="264" x2="136" y2="322" stroke-width="0.6" />
                  <line x1="136" y1="264" x2="70" y2="322" stroke-width="0.6" />
                  <rect x="170" y="315" width="92" height="92" rx="4" />
                  <rect x="178" y="380" width="34" height="18" rx="2" />
                  <rect x="220" y="380" width="34" height="18" rx="2" />

                  <!-- Camas en Alcobas Auxiliares -->
                  <rect x="555" y="320" width="76" height="86" rx="4" />
                  <rect x="565" y="380" width="56" height="18" rx="2" />
                </g>

                <!-- Muros estructurales perimetrales y ventanales acústicos -->
                <g class="text-foreground">
                  <rect x="50" y="36" width="650" height="384" fill="none" stroke="currentColor" stroke-width="5.5" />
                  <line x1="50" y1="250" x2="345" y2="250" stroke="currentColor" stroke-width="4.5" />
                  <line x1="395" y1="250" x2="700" y2="250" stroke="currentColor" stroke-width="4.5" />

                  <!-- Ventanales acústicos (azul celeste) -->
                  <line x1="60" y1="36" x2="360" y2="36" stroke="#38bdf8" stroke-width="4" />
                  <line x1="430" y1="36" x2="620" y2="36" stroke="#38bdf8" stroke-width="4" />
                  <line x1="160" y1="420" x2="290" y2="420" stroke="#38bdf8" stroke-width="4" />
                  <line x1="530" y1="420" x2="660" y2="420" stroke="#38bdf8" stroke-width="4" />
                </g>

                <!-- Etiquetas de cada ambiente con nombre y área m² -->
                {#each typologyBlueprintSpec.zones as z, idx (z.id)}
                  {@const cx = z.x + z.w / 2}
                  {@const cy = z.y + z.h / 2}
                  <g transform="translate({cx}, {cy})" class="pointer-events-none">
                    <rect
                      x="-74"
                      y="-18"
                      width="148"
                      height="36"
                      rx="8"
                      fill="#18181b"
                      fill-opacity="0.88"
                      stroke={hoveredZoneId === z.id ? '#10b981' : '#3f3f46'}
                      stroke-width="1.2"
                    />
                    <text x="0" y="-3" text-anchor="middle" class="fill-white text-[9.5px] font-semibold">
                      {idx + 1}. {z.name.length > 24 ? z.name.slice(0, 23) + '…' : z.name}
                    </text>
                    <text x="0" y="10" text-anchor="middle" class="fill-[#F5A400] font-mono text-[9.5px] font-bold">
                      {z.areaM2} • {z.dimensions}
                    </text>
                  </g>
                {/each}

                <!-- Indicador de Acceso Principal -->
                <g transform="translate(370, 250)">
                  <rect x="-28" y="-9" width="56" height="18" rx="4" fill="#10b981" />
                  <text x="0" y="3" text-anchor="middle" class="fill-zinc-950 text-[8.5px] font-bold">
                    ACCESO
                  </text>
                </g>
              </svg>
            </div>
          </div>

          <!-- Cuadro de Áreas y Especificaciones de la Tipología Seleccionada (4 cols) -->
          <div class="space-y-4 xl:col-span-4">
            <div class="rounded-xl border border-border bg-card p-4 shadow-2xs">
              <div class="flex items-center justify-between border-b border-border pb-2.5">
                <span class="text-xs font-semibold text-foreground">
                  Cuadro de áreas por ambiente
                </span>
                <span class="font-mono text-xs font-bold text-foreground">
                  Total: {activeTypology.areaBuiltM2} m²
                </span>
              </div>

              <div class="mt-3 space-y-2">
                {#each typologyBlueprintSpec.zones as z, idx (z.id)}
                  <!-- svelte-ignore a11y_no_static_element_interactions -->
                  <div
                    onmouseenter={() => (hoveredZoneId = z.id)}
                    onmouseleave={() => (hoveredZoneId = null)}
                    class="flex items-center justify-between rounded-lg border px-3 py-2 text-xs transition-colors {hoveredZoneId === z.id
                      ? 'border-emerald-500 bg-emerald-500/10'
                      : 'border-border bg-background/60'}"
                  >
                    <div class="min-w-0 pr-2">
                      <div class="truncate font-medium text-foreground">
                        {idx + 1}. {z.name}
                      </div>
                      <div class="font-mono text-[10px] text-muted-foreground">
                        Cotas: {z.dimensions}
                      </div>
                    </div>
                    <span class="shrink-0 rounded bg-muted px-2 py-0.5 font-mono text-xs font-semibold text-foreground">
                      {z.areaM2}
                    </span>
                  </div>
                {/each}
              </div>

              <div class="mt-4 border-t border-border pt-3">
                <span class="text-[11px] font-semibold text-muted-foreground">
                  Acabados y equipamiento incluidos:
                </span>
                <div class="mt-2 flex flex-wrap gap-1.5">
                  {#each activeTypology.features as feat (feat)}
                    <span class="inline-flex items-center gap-1 rounded-md border border-border bg-muted/40 px-2 py-1 text-[11px] text-foreground">
                      <CheckCircle2 class="h-3 w-3 text-emerald-500" />
                      {feat}
                    </span>
                  {/each}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>

  <!-- 3. Amenidades y Zonas Comunes del Proyecto -->
  <Card class="bg-card border-border shadow-none">
    <CardHeader class="pb-3 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-2">
      <div>
        <CardTitle class="text-base font-semibold text-foreground flex items-center gap-2">
          <Waves class="w-4 h-4 text-[#F5A400]" />
          <span>Amenidades y equipamiento de zonas comunes ({ficha.amenities.length})</span>
        </CardTitle>
        <p class="text-xs text-muted-foreground mt-0.5">
          Estado constructivo real de cada amenidad social, recreativa y de infraestructura del edificio.
          {#if canCertifyAmenities}
            <strong class="text-foreground"> • Modo Interventoría COPNIA activo: puedes calibrar el % físico de cada zona común.</strong>
          {/if}
        </p>
      </div>
      <Badge variant="outline" class="text-xs font-normal bg-muted/50 border-border tabular-nums">
        {ficha.amenities.filter((a) => a.status === 'completado').length} entregadas • {ficha.amenities.filter((a) => a.status === 'en_obra').length} en ejecución
      </Badge>
    </CardHeader>

    <CardContent class="p-5">
      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {#each ficha.amenities as amenity (amenity.id)}
          <div class="p-4 rounded-xl border border-border bg-muted/15 flex flex-col justify-between gap-3">
            <div class="space-y-2">
              <div class="flex items-center justify-between gap-2">
                <span class="text-[10px] font-medium px-2 py-0.5 rounded bg-background border border-border text-muted-foreground">
                  {getAmenityCategoryLabel(amenity.category)}
                </span>
                <span class="inline-flex items-center gap-1.5 text-[11px] font-medium tabular-nums">
                  <span
                    class="w-1.5 h-1.5 rounded-full {amenity.status === 'completado'
                      ? 'bg-emerald-500'
                      : amenity.status === 'en_obra'
                        ? 'bg-[#F5A400]'
                        : 'bg-zinc-400'}"
                  ></span>
                  <span>{amenity.progressPercent}%</span>
                </span>
              </div>

              <h4 class="text-xs sm:text-sm font-semibold text-foreground">{amenity.name}</h4>
              <p class="text-[11px] text-muted-foreground leading-relaxed">
                {amenity.description}
              </p>
            </div>

            <div class="space-y-2 pt-2 border-t border-border/60">
              <div class="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  class="h-full rounded-full transition-all {amenity.status === 'completado'
                    ? 'bg-emerald-500'
                    : amenity.status === 'en_obra'
                      ? 'bg-[#F5A400]'
                      : 'bg-zinc-400'}"
                  style="width: {amenity.progressPercent}%"
                ></div>
              </div>
              <div class="flex items-center justify-between text-[10px] text-muted-foreground">
                <span>
                  {amenity.status === 'completado'
                    ? 'Obra civil completada'
                    : amenity.status === 'en_obra'
                      ? 'En ejecución activa'
                      : 'Programada en cronograma'}
                </span>
                <span class="tabular-nums">{amenity.progressPercent}%</span>
              </div>

              {#if canCertifyAmenities}
                <div class="pt-1.5 border-t border-border/50 flex items-center justify-between gap-1.5">
                  <span class="text-[10px] font-medium text-muted-foreground">Certificar COPNIA:</span>
                  <div class="flex items-center gap-1">
                    {#each [0, 50, 75, 100] as pct (pct)}
                      <button
                        type="button"
                        onclick={() => {
                          projectStore.updateAmenityProgress(cut.projectId, amenity.id, pct);
                          saveFeedbackBanner = `Avance físico de "${amenity.name}" certificado al ${pct}% por Interventoría.`;
                          setTimeout(() => (saveFeedbackBanner = null), 4000);
                        }}
                        class="rounded px-1.5 py-0.5 text-[10px] font-mono transition-colors cursor-pointer {amenity.progressPercent === pct
                          ? 'bg-foreground text-background font-semibold'
                          : 'border border-border bg-background text-muted-foreground hover:text-foreground'}"
                      >
                        {pct}%
                      </button>
                    {/each}
                  </div>
                </div>
              {/if}
            </div>
          </div>
        {/each}
      </div>
    </CardContent>
  </Card>

  <!-- 4. Mapa de ubicación y entorno urbano -->
  <div class="w-full">
    <ProjectMapCard
      projectName={cut.projectName}
      address={cut.address}
      city={cut.city}
      heightClass="h-80"
    />
  </div>
</div>

<!-- MODAL DE EDICIÓN COMERCIAL (CONSTRUCTORA / ADMIN) -->
{#if isCommercialModalOpen}
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-4">
    <div class="w-full max-w-xl rounded-xl border border-border bg-card text-card-foreground shadow-2xl overflow-hidden">
      <div class="p-5 border-b border-border flex items-center justify-between">
        <div>
          <h3 class="text-sm font-semibold text-foreground">
            Editar ficha comercial y absorción de ventas
          </h3>
          <p class="text-xs text-muted-foreground">
            Atribución de <strong class="text-foreground">{projectStore.currentUser.companyName}</strong> ({projectStore.effectiveRole})
          </p>
        </div>
        <button
          type="button"
          onclick={() => (isCommercialModalOpen = false)}
          class="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent cursor-pointer"
        >
          <X class="w-4 h-4" />
        </button>
      </div>

      <form onsubmit={handleSaveCommercial} class="p-5 space-y-4 text-xs">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div class="space-y-1.5">
            <label for="ed-type" class="font-medium text-foreground">Tipología inmobiliaria</label>
            <select
              id="ed-type"
              bind:value={editPropertyType}
              class="w-full h-9 rounded-md border border-input bg-background px-3 text-xs text-foreground"
            >
              <option value="Apartamentos residenciales">Apartamentos residenciales</option>
              <option value="Vivienda VIS">Vivienda VIS</option>
              <option value="Uso mixto y corporativo">Uso mixto y corporativo</option>
              <option value="Casas en conjunto">Casas en conjunto</option>
            </select>
          </div>

          <div class="space-y-1.5">
            <label for="ed-stratum" class="font-medium text-foreground">Estrato socioeconómico</label>
            <select
              id="ed-stratum"
              bind:value={editStratum}
              class="w-full h-9 rounded-md border border-input bg-background px-3 text-xs text-foreground"
            >
              <option value="Estrato 3">Estrato 3</option>
              <option value="Estrato 4">Estrato 4</option>
              <option value="Estrato 5">Estrato 5</option>
              <option value="Estrato 6">Estrato 6</option>
            </select>
          </div>

          <div class="space-y-1.5">
            <label for="ed-sold" class="font-medium text-foreground">
              Unidades escrituradas / vendidas (de {ficha.totalUnits})
            </label>
            <input
              id="ed-sold"
              type="number"
              min="0"
              max={ficha.totalUnits}
              bind:value={editSoldUnits}
              class="w-full h-9 rounded-md border border-input bg-background px-3 text-xs font-mono text-foreground"
              required
            />
          </div>

          <div class="space-y-1.5">
            <label for="ed-res" class="font-medium text-foreground">
              Unidades en encargo / separadas
            </label>
            <input
              id="ed-res"
              type="number"
              min="0"
              max={Math.max(0, ficha.totalUnits - editSoldUnits)}
              bind:value={editReservedUnits}
              class="w-full h-9 rounded-md border border-input bg-background px-3 text-xs font-mono text-foreground"
              required
            />
          </div>

          <div class="space-y-1.5 sm:col-span-2">
            <label for="ed-deliv" class="font-medium text-foreground">Fecha estimada de entrega a propietarios</label>
            <input
              id="ed-deliv"
              type="text"
              bind:value={editEstimatedDelivery}
              class="w-full h-9 rounded-md border border-input bg-background px-3 text-xs text-foreground"
              required
            />
          </div>

          <div class="space-y-1.5 sm:col-span-2">
            <label for="ed-desc" class="font-medium text-foreground">Descripción general del desarrollo</label>
            <textarea
              id="ed-desc"
              bind:value={editDescription}
              rows="4"
              class="w-full rounded-md border border-input bg-background p-2.5 text-xs text-foreground leading-relaxed"
              required
            ></textarea>
          </div>
        </div>

        <div class="pt-3 border-t border-border flex items-center justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onclick={() => (isCommercialModalOpen = false)}
            class="h-8 text-xs cursor-pointer"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            size="sm"
            class="h-8 bg-foreground text-background hover:bg-foreground/90 text-xs font-medium cursor-pointer"
          >
            Guardar cambios comerciales
          </Button>
        </div>
      </form>
    </div>
  </div>
{/if}

<!-- MODAL DE PARÁMETROS DEL FIDEICOMISO (FIDUCIARIA / ADMIN) -->
{#if isFiduciaryModalOpen}
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-4">
    <div class="w-full max-w-lg rounded-xl border border-border bg-card text-card-foreground shadow-2xl overflow-hidden">
      <div class="p-5 border-b border-border flex items-center justify-between">
        <div>
          <h3 class="text-sm font-semibold text-foreground">
            Parámetros del Fideicomiso y Punto de Equilibrio
          </h3>
          <p class="text-xs text-muted-foreground">
            Administración fiduciaria por <strong class="text-foreground">{projectStore.currentUser.companyName}</strong>
          </p>
        </div>
        <button
          type="button"
          onclick={() => (isFiduciaryModalOpen = false)}
          class="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent cursor-pointer"
        >
          <X class="w-4 h-4" />
        </button>
      </div>

      <form onsubmit={handleSaveFiduciary} class="p-5 space-y-4 text-xs">
        <div class="space-y-3.5">
          <div class="space-y-1.5">
            <label for="fid-code" class="font-medium text-foreground">Código del Encargo Fiduciario / Patrimonio Autónomo</label>
            <input
              id="fid-code"
              type="text"
              bind:value={editFiduciaryTrustCode}
              class="w-full h-9 rounded-md border border-input bg-background px-3 text-xs font-mono text-foreground"
              required
            />
          </div>

          <div class="space-y-1.5">
            <label for="fid-budget" class="font-medium text-foreground">Presupuesto fiduciario total autorizado (COP)</label>
            <input
              id="fid-budget"
              type="number"
              step="100000000"
              bind:value={editTotalBudgetCOP}
              class="w-full h-9 rounded-md border border-input bg-background px-3 text-xs font-mono text-foreground"
              required
            />
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div class="space-y-1.5">
              <label for="fid-eq" class="font-medium text-foreground">Meta de Punto de Equilibrio (%)</label>
              <input
                id="fid-eq"
                type="number"
                min="30"
                max="95"
                bind:value={editEquilibriumPercent}
                class="w-full h-9 rounded-md border border-input bg-background px-3 text-xs font-mono text-foreground"
                required
              />
            </div>

            <div class="space-y-1.5">
              <label for="fid-status" class="font-medium text-foreground">Estado del fideicomiso</label>
              <select
                id="fid-status"
                bind:value={editLifecycleStatus}
                class="w-full h-9 rounded-md border border-input bg-background px-3 text-xs text-foreground"
              >
                <option value="in_progress">En ejecución activa</option>
                <option value="upcoming">Preventas / Por iniciar</option>
                <option value="completed">Obra finalizada / Liquidación</option>
              </select>
            </div>
          </div>
        </div>

        <div class="pt-3 border-t border-border flex items-center justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onclick={() => (isFiduciaryModalOpen = false)}
            class="h-8 text-xs cursor-pointer"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            size="sm"
            class="h-8 bg-foreground text-background hover:bg-foreground/90 text-xs font-medium cursor-pointer"
          >
            Guardar parámetros fiduciarios
          </Button>
        </div>
      </form>
    </div>
  </div>
{/if}

<!-- MODAL AMPLIO DE PLANO ARQUITECTÓNICO DE TIPOLOGÍA -->
{#if isBlueprintModalOpen}
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs"
    role="dialog"
    aria-modal="true"
  >
    <div class="flex max-h-[92vh] w-[96vw] max-w-6xl flex-col overflow-hidden rounded-2xl border border-border bg-card text-card-foreground shadow-2xl">
      <div class="flex items-center justify-between border-b border-border px-6 py-4">
        <div>
          <div class="flex items-center gap-2">
            <span class="rounded-md bg-foreground px-2.5 py-0.5 font-mono text-xs font-bold text-background">
              {activeTypology.code}
            </span>
            <span class="text-xs text-muted-foreground">{typologyBlueprintSpec.scaleLabel}</span>
          </div>
          <h3 class="mt-1 font-display text-lg font-bold text-foreground">
            Plano arquitectónico detallado — {activeTypology.name} ({activeTypology.areaBuiltM2} m² construidos / {activeTypology.areaPrivateM2} m² privados)
          </h3>
        </div>
        <button
          type="button"
          onclick={() => (isBlueprintModalOpen = false)}
          class="cursor-pointer rounded-lg border border-border p-2 text-muted-foreground hover:bg-muted"
        >
          <X class="h-4 w-4" />
        </button>
      </div>

      <div class="overflow-y-auto p-6">
        <div class="rounded-xl border border-border bg-background p-4">
          <svg viewBox="0 0 750 455" class="h-auto w-full select-none">
            <rect width="750" height="455" fill="url(#typ-cad-grid)" />
            {#each typologyBlueprintSpec.zones as z, idx (z.id)}
              <rect
                x={z.x}
                y={z.y}
                width={z.w}
                height={z.h}
                fill={z.fill}
                stroke="currentColor"
                stroke-width="1.5"
                class="text-border"
              />
              <g transform="translate({z.x + z.w / 2}, {z.y + z.h / 2})">
                <rect x="-82" y="-20" width="164" height="40" rx="8" fill="#18181b" stroke="#f5a400" stroke-width="1.2" />
                <text x="0" y="-4" text-anchor="middle" class="fill-white text-[10px] font-semibold">
                  {idx + 1}. {z.name.length > 26 ? z.name.slice(0, 25) + '…' : z.name}
                </text>
                <text x="0" y="11" text-anchor="middle" class="fill-[#F5A400] font-mono text-[10px] font-bold">
                  {z.areaM2} ({z.dimensions})
                </text>
              </g>
            {/each}
            <rect x="50" y="36" width="650" height="384" fill="none" stroke="currentColor" stroke-width="6" class="text-foreground" />
          </svg>
        </div>
      </div>

      <div class="flex items-center justify-between border-t border-border bg-muted/20 px-6 py-4">
        <div class="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <span>Valor de referencia desde: <strong class="font-mono text-foreground">{formatCOP(activeTypology.priceFromCOP)}</strong></span>
          <span>•</span>
          <span>Niveles: <strong class="text-foreground">{activeTypology.floorRange}</strong></span>
        </div>
        <button
          type="button"
          onclick={() => (isBlueprintModalOpen = false)}
          class="cursor-pointer rounded-lg bg-foreground px-4 py-2 text-xs font-medium text-background hover:opacity-90"
        >
          Cerrar plano
        </button>
      </div>
    </div>
  </div>
{/if}
