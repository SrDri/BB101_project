<script lang="ts">
  import { projectStore, INITIAL_ACTIVITIES } from '$lib/stores/projectState.svelte';
  import type { TechnicalFinding } from '$lib/types/twin';
  import { computeSha256FromString } from '$lib/services/hasher';
  import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '$lib/components/ui/card';
  import { Button } from '$lib/components/ui/button';
  import { Badge } from '$lib/components/ui/badge';
  import {
    Camera,
    Cpu,
    CheckCircle2,
    ShieldCheck,
    ArrowRight,
    Lock,
    AlertTriangle,
    FlaskConical,
    Plus,
    X
  } from '@lucide/svelte';

  let activities = $state([...INITIAL_ACTIVITIES]);
  let notes = $state(
    'Inspección visual realizada en Torre Alameda conforme al Decreto 510 de 2026 y NSR-10. Se constató fraguado de losa, cumplimiento de ensayos de cilindros ONAC y avance satisfactorio en mampostería de Nivel 4.'
  );
  let isSealing = $state(false);
  let isSealed = $state(projectStore.activeCut.status === 'certified');
  let sealedTxHash = $state(projectStore.activeCut.stellarTxHash || '');
  let computedHash = $state(projectStore.activeCut.sha256Hash || '');
  let sealStep = $state<string>('');

  const findings = $derived(projectStore.technicalFindings);
  const labTests = $derived(projectStore.materialLabTests);
  const openCriticalCount = $derived(
    findings.filter((f) => f.status === 'abierto' && f.severity === 'critica').length
  );

  // Modal state for registering a new technical finding
  let activeQualityTab = $state<'hallazgos' | 'laboratorio'>('hallazgos');
  let showFindingModal = $state(false);

  let newFindingFloor = $state(4);
  let newFindingAxis = $state('Eje B-3 • Viga sísmica');
  let newFindingSeverity = $state<TechnicalFinding['severity']>('moderada');
  let newFindingTitle = $state('');
  let newFindingDesc = $state('');
  let newFindingAction = $state('');

  let calculatedPercent = $derived(
    +(activities.reduce((acc, curr) => acc + curr.calibratedPercent, 0) / activities.length).toFixed(1)
  );

  function handleCreateFinding(e: Event) {
    e.preventDefault();
    if (!newFindingTitle.trim()) return;
    projectStore.addTechnicalFinding({
      floorLevel: newFindingFloor,
      locationAxis: newFindingAxis.trim() || 'Nivel 4',
      severity: newFindingSeverity,
      title: newFindingTitle.trim(),
      description:
        newFindingDesc.trim() ||
        'Hallazgo técnico identificado durante recorrido de supervisión estructural NSR-10.',
      correctiveAction:
        newFindingAction.trim() ||
        'Ejecutar protocolo de subsanación técnica y presentar registro fotográfico para levantamiento.'
    });
    showFindingModal = false;
    newFindingTitle = '';
    newFindingDesc = '';
    newFindingAction = '';
  }

  async function handleSealCertificate() {
    isSealing = true;
    sealStep = 'Generando estructura canónica JSON del certificado...';

    const certPayload = JSON.stringify({
      projectId: projectStore.activeCut.projectId,
      corteNumber: projectStore.activeCut.number,
      interventor: projectStore.activeCut.interventorName,
      activities: activities.map((a) => ({ name: a.name, percent: a.calibratedPercent })),
      labTestsVerified: labTests.length,
      openCriticalFindings: openCriticalCount,
      totalPercent: calculatedPercent,
      timestamp: new Date().toISOString()
    });

    await new Promise((r) => setTimeout(r, 550));
    sealStep = 'Calculando huella digital SHA-256 (Web Crypto API)...';
    const hash = await computeSha256FromString(certPayload);
    computedHash = hash;

    await new Promise((r) => setTimeout(r, 750));
    sealStep = 'Enviando transacción patrocinada a Stellar Soroban Testnet...';

    await new Promise((r) => setTimeout(r, 850));
    sealStep = 'Confirmado en ledger de Stellar Testnet (Inmutable)';

    projectStore.commitCutToStellar(hash, calculatedPercent);
    sealedTxHash = projectStore.activeCut.stellarTxHash || '';
    isSealed = true;
    isSealing = false;
  }
</script>

<div class="mx-auto max-w-[1440px] space-y-6 w-full">
  <!-- Cabecera de interventoría -->
  <div class="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-border gap-4">
    <div class="space-y-1">
      <div class="flex flex-wrap items-center gap-2">
        <Badge variant="outline" class="text-[11px] font-normal bg-muted/60 text-foreground border-border gap-1.5">
          <span class="w-1.5 h-1.5 rounded-full bg-[#F5A400]"></span>
          <span>Interventoría técnica independiente (Ley 1796)</span>
        </Badge>
        <span class="text-xs text-muted-foreground">• Matrícula profesional COPNIA verificada</span>
      </div>
      <h1 class="text-2xl font-semibold text-foreground tracking-tight">
        Supervisión técnica, ensayos NSR-10 y firma — Corte #{projectStore.activeCut.number}
      </h1>
      <p class="text-xs text-muted-foreground">
        Interventor: <strong class="text-foreground">{projectStore.activeCut.interventorName}</strong> • {projectStore.activeCut.projectName}
      </p>
    </div>

    <div class="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onclick={() => (showFindingModal = true)}
        class="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-border bg-card px-3.5 py-2 text-xs font-medium text-foreground transition-colors hover:bg-accent"
      >
        <Plus class="w-3.5 h-3.5 text-[#F5A400]" />
        <span>Registrar hallazgo / NCR</span>
      </button>

      {#if isSealed}
        <Badge variant="outline" class="px-3 py-1.5 bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-medium gap-1.5">
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          <span>Corte sellado en Stellar</span>
        </Badge>
      {:else}
        <Badge variant="outline" class="px-3 py-1.5 bg-muted/60 border-border text-foreground text-xs font-normal gap-1.5">
          <span class="w-1.5 h-1.5 rounded-full bg-[#F5A400]"></span>
          <span>Calibración en curso</span>
        </Badge>
      {/if}
    </div>
  </div>

  <!-- Layout Principal: Calibración IA (7 cols) + Sellado Stellar (5 cols) -->
  <div class="grid grid-cols-1 xl:grid-cols-12 gap-6 w-full items-start">
    <div class="xl:col-span-7 space-y-6">
      <Card class="bg-card border-border shadow-xs">
        <CardHeader class="pb-3 border-b border-border">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <Cpu class="w-5 h-5 text-[#F5A400]" />
              <CardTitle class="text-base font-bold">
                Calibración asistida de avance físico (IA vs. criterio profesional)
              </CardTitle>
            </div>
            <div class="text-right font-mono">
              <span class="text-xs text-muted-foreground">Avance ponderado: </span>
              <span class="text-lg font-bold text-[#F5A400] tabular-nums">{calculatedPercent}%</span>
            </div>
          </div>
          <CardDescription class="text-xs">
            Revisa la estimación generada por visión artificial y ajusta los deslizadores según tu inspección en obra.
          </CardDescription>
        </CardHeader>

        <CardContent class="p-6 space-y-4">
          {#each activities as act (act.name)}
            <div class="p-4 bg-muted/40 rounded-lg border border-border space-y-3">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                <span class="font-semibold text-foreground">{act.name}</span>
                <div class="flex items-center gap-3 font-mono text-[11px]">
                  <span class="text-muted-foreground">Prog: {act.scheduledPercent}%</span>
                  <span class="text-sky-500">IA: {act.aiEstimatedPercent}%</span>
                  <Badge variant="outline" class="font-mono text-[11px] border-[#F5A400]/40 text-[#F5A400] bg-[#F5A400]/10">
                    Avalado: {act.calibratedPercent}%
                  </Badge>
                </div>
              </div>

              <div class="flex items-center gap-4">
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="0.5"
                  bind:value={act.calibratedPercent}
                  disabled={isSealed}
                  class="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-[#F5A400] disabled:opacity-50"
                />
                <span class="font-mono text-xs text-foreground font-semibold w-12 text-right tabular-nums">
                  {act.calibratedPercent}%
                </span>
              </div>
            </div>
          {/each}

          <div class="space-y-2 pt-2">
            <label for="interventor-notes" class="text-xs font-mono text-muted-foreground uppercase tracking-wider">
              Dictamen pericial y observaciones técnicas:
            </label>
            <textarea
              id="interventor-notes"
              bind:value={notes}
              disabled={isSealed}
              rows="3"
              class="w-full bg-background border border-border rounded-lg p-3 text-xs font-sans text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-[#F5A400] transition-colors disabled:opacity-60"
            ></textarea>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Columna Derecha (5 columnas): Evidencia Fotográfica + Sellado en Stellar -->
    <div class="xl:col-span-5 space-y-6">
      <Card class="bg-card border-border shadow-xs">
        <CardHeader class="pb-3 border-b border-border">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <Camera class="w-4 h-4 text-[#F5A400]" />
              <CardTitle class="text-sm font-bold">
                Evidencia georreferenciada (Corte #{projectStore.activeCut.number})
              </CardTitle>
            </div>
            <Badge variant="outline" class="text-[10px] font-mono text-emerald-500 border-emerald-500/30 bg-emerald-500/10">
              ✓ Geocerca GPS válida
            </Badge>
          </div>
          <CardDescription class="text-xs">
            Difuminado facial automático y control criptográfico anti-duplicado.
          </CardDescription>
        </CardHeader>

        <CardContent class="p-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div class="bg-muted/30 rounded-lg border border-border overflow-hidden">
            <div class="relative h-24 w-full">
              <img src="https://images.unsplash.com/photo-1541888946425-d0fbb186156f?w=600&auto=format&fit=crop&q=80" alt="Losa" class="w-full h-full object-cover" />
            </div>
            <div class="p-2 text-[10px] font-mono text-muted-foreground">
              <div class="text-foreground font-semibold truncate">Losa Nivel 4</div>
              <div class="text-emerald-500">Fraguado 100%</div>
            </div>
          </div>

          <div class="bg-muted/30 rounded-lg border border-border overflow-hidden">
            <div class="relative h-24 w-full">
              <img src="https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=600&auto=format&fit=crop&q=80" alt="Mampostería" class="w-full h-full object-cover" />
            </div>
            <div class="p-2 text-[10px] font-mono text-muted-foreground">
              <div class="text-foreground font-semibold truncate">Muros Eje C</div>
              <div class="text-[#F5A400]">Avance 88.2%</div>
            </div>
          </div>

          <div class="bg-muted/30 rounded-lg border border-border overflow-hidden">
            <div class="relative h-24 w-full">
              <img src="https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=600&auto=format&fit=crop&q=80" alt="Instalaciones" class="w-full h-full object-cover" />
            </div>
            <div class="p-2 text-[10px] font-mono text-muted-foreground">
              <div class="text-foreground font-semibold truncate">Redes Nivel 4</div>
              <div class="text-sky-500">Avance 68.9%</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Emisión y Sellado en Stellar Soroban -->
      <Card class="bg-card {isSealed ? 'border-emerald-500/40' : 'border-[#F5A400]/40'} shadow-md">
        <CardHeader class="pb-3 border-b border-border">
          <div class="flex items-center gap-3">
            <div class="p-2 rounded-lg {isSealed ? 'bg-emerald-500/10 text-emerald-500' : 'bg-[#F5A400]/10 text-[#F5A400]'} border border-border">
              <ShieldCheck class="w-5 h-5" />
            </div>
            <div>
              <CardTitle class="text-base font-bold">
                Emisión y sellado en Stellar Soroban
              </CardTitle>
              <CardDescription class="text-xs font-mono">
                Contrato: <code class="text-foreground">corte_registry</code> • Testnet
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent class="p-6 space-y-4">
          {#if openCriticalCount > 0}
            <div class="rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-600 dark:text-rose-400">
              <strong>Atención:</strong> Existen {openCriticalCount} hallazgo(s) crítico(s) abierto(s). Subsanar antes de autorizar giro en fiduciaria.
            </div>
          {/if}

          {#if !isSealed}
            <p class="text-xs text-muted-foreground leading-relaxed">
              Al firmar, se calcula el hash SHA-256 del certificado, los ensayos de laboratorio ONAC y las fotografías, inscribiéndolo en el contrato Soroban con gas patrocinado.
            </p>

            {#if isSealing}
              <div class="p-3.5 bg-muted/50 rounded-lg border border-[#F5A400]/30 font-mono text-xs space-y-2">
                <div class="flex items-center gap-2 text-[#F5A400]">
                  <div class="w-3.5 h-3.5 border-2 border-[#F5A400] border-t-transparent rounded-full animate-spin"></div>
                  <span>{sealStep}</span>
                </div>
                <div class="w-full bg-secondary h-1 rounded-full overflow-hidden">
                  <div class="bg-[#F5A400] h-full w-2/3 animate-pulse"></div>
                </div>
              </div>
            {/if}

            <Button
              onclick={handleSealCertificate}
              disabled={isSealing}
              class="w-full py-5 bg-[#F5A400] hover:bg-[#E09400] text-[#121212] font-bold text-sm cursor-pointer gap-2 shadow-amber-glow"
            >
              <Lock class="w-4 h-4" />
              <span>Avalar dictamen y sellar en Stellar Soroban</span>
            </Button>
          {:else}
            <div class="space-y-4 animate-ledger-commit">
              <div class="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg space-y-2 font-mono text-xs">
                <div class="flex items-center gap-2 text-emerald-500 font-semibold">
                  <CheckCircle2 class="w-4 h-4" />
                  <span>Certificado #{projectStore.activeCut.number} sellado en Stellar Testnet</span>
                </div>
                <div class="text-muted-foreground text-[11px] pt-1">
                  Huella digital inmutable (SHA-256):
                </div>
                <div class="p-2 bg-background rounded border border-border text-emerald-500 break-all select-all text-[11px]">
                  {computedHash}
                </div>
                <div class="text-muted-foreground text-[11px] pt-1">
                  Transacción Soroban:
                </div>
                <div class="p-2 bg-background rounded border border-border text-foreground break-all text-[11px]">
                  {sealedTxHash}
                </div>
              </div>

              <div class="flex flex-col sm:flex-row gap-2.5">
                <Button
                  href="/fiduciaria"
                  class="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs gap-1.5"
                >
                  <span>Ir a panel fiduciario</span>
                  <ArrowRight class="w-3.5 h-3.5" />
                </Button>
                <Button
                  href="/verificar"
                  variant="outline"
                  class="flex-1 font-mono text-xs gap-1.5"
                >
                  <ShieldCheck class="w-3.5 h-3.5 text-[#F5A400]" />
                  <span>Auditar público</span>
                </Button>
              </div>
            </div>
          {/if}
        </CardContent>
      </Card>
    </div>
  </div>

  <!-- ========================================================================= -->
  <!-- MÓDULO DE INTELIGENCIA TÉCNICA EN PESTAÑAS DE ANCHO COMPLETO (NCR + ONAC) -->
  <!-- ========================================================================= -->
  <div class="overflow-hidden rounded-xl border border-border bg-card shadow-2xs">
    <div class="flex flex-col justify-between gap-3 border-b border-border bg-muted/15 px-6 py-4 sm:flex-row sm:items-center">
      <div class="flex flex-wrap items-center gap-1.5 rounded-xl border border-border bg-background p-1">
        <button
          type="button"
          onclick={() => (activeQualityTab = 'hallazgos')}
          class="inline-flex cursor-pointer items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-medium whitespace-nowrap transition-all {activeQualityTab === 'hallazgos'
            ? 'bg-foreground text-background shadow-2xs'
            : 'text-muted-foreground hover:text-foreground'}"
        >
          <AlertTriangle class="h-3.5 w-3.5" />
          <span>Bitácora de hallazgos y no conformidades NCR ({findings.length})</span>
        </button>

        <button
          type="button"
          onclick={() => (activeQualityTab = 'laboratorio')}
          class="inline-flex cursor-pointer items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-medium whitespace-nowrap transition-all {activeQualityTab === 'laboratorio'
            ? 'bg-foreground text-background shadow-2xs'
            : 'text-muted-foreground hover:text-foreground'}"
        >
          <FlaskConical class="h-3.5 w-3.5" />
          <span>Ensayos de laboratorio y calidad NSR-10 ({labTests.length})</span>
        </button>
      </div>

      <div class="flex items-center gap-2">
        {#if activeQualityTab === 'hallazgos'}
          <span class="rounded-md border border-border bg-background px-2.5 py-1 font-mono text-xs font-medium whitespace-nowrap text-foreground">
            {findings.filter((f) => f.status === 'subsanado').length} de {findings.length} subsanados
          </span>
          <button
            type="button"
            onclick={() => (showFindingModal = true)}
            class="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg bg-foreground px-3 py-1.5 text-xs font-medium whitespace-nowrap text-background hover:opacity-90"
          >
            <Plus class="h-3.5 w-3.5" />
            <span>Reportar hallazgo</span>
          </button>
        {:else}
          <span class="inline-flex items-center gap-1.5 rounded-md border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium whitespace-nowrap text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 class="h-3.5 w-3.5" />
            100% aprobados por laboratorio ONAC
          </span>
        {/if}
      </div>
    </div>

    {#if activeQualityTab === 'hallazgos'}
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="border-b border-border bg-muted/20 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
              <th class="py-3 pl-6 pr-4 whitespace-nowrap">Código y nivel</th>
              <th class="px-4 py-3">Hallazgo técnico y acción correctiva</th>
              <th class="px-4 py-3 whitespace-nowrap">Severidad</th>
              <th class="px-4 py-3 whitespace-nowrap">Estado</th>
              <th class="py-3 pl-4 pr-6 text-right whitespace-nowrap">Acción de campo</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-border text-sm">
            {#each findings as f (f.id)}
              <tr class="transition-colors hover:bg-muted/30">
                <td class="py-4 pl-6 pr-4 whitespace-nowrap align-top">
                  <span class="rounded bg-muted px-2 py-0.5 font-mono text-xs font-bold text-foreground">
                    {f.code}
                  </span>
                  <div class="mt-1 text-xs font-medium text-muted-foreground">
                    Piso {f.floorLevel} · {f.locationAxis}
                  </div>
                </td>

                <td class="px-4 py-4 max-w-xl align-top">
                  <div class="font-semibold text-foreground">{f.title}</div>
                  <p class="mt-0.5 text-xs text-muted-foreground leading-relaxed">{f.description}</p>
                  <div class="mt-2 rounded-lg border border-border/70 bg-muted/25 px-3 py-1.5 text-[11px]">
                    <span class="font-semibold text-foreground">Acción correctiva:</span>
                    <span class="ml-1 text-muted-foreground">{f.correctiveAction}</span>
                  </div>
                </td>

                <td class="px-4 py-4 whitespace-nowrap align-top">
                  <span
                    class="inline-flex rounded-md px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap uppercase {f.severity === 'critica'
                      ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                      : f.severity === 'moderada'
                        ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                        : 'bg-sky-500/15 text-sky-600 dark:text-sky-400'}"
                  >
                    {f.severity === 'critica' ? 'Crítica (Bloquea giro)' : f.severity === 'moderada' ? 'Moderada' : 'Menor (SST)'}
                  </span>
                </td>

                <td class="px-4 py-4 whitespace-nowrap align-top">
                  {#if f.status === 'subsanado'}
                    <span class="inline-flex items-center gap-1.5 rounded-md border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium whitespace-nowrap text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 class="h-3.5 w-3.5" />
                      Subsanado ({f.resolvedDate || '2026-10-12'})
                    </span>
                  {:else}
                    <span class="inline-flex items-center gap-1.5 rounded-md border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-xs font-medium whitespace-nowrap text-amber-600 dark:text-amber-400">
                      Abierto en obra
                    </span>
                  {/if}
                </td>

                <td class="py-4 pl-4 pr-6 text-right whitespace-nowrap align-top">
                  {#if f.status === 'subsanado'}
                    <span class="font-mono text-xs whitespace-nowrap text-muted-foreground">✓ Verificado</span>
                  {:else}
                    <button
                      type="button"
                      onclick={() => projectStore.resolveTechnicalFinding(f.id)}
                      class="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg bg-foreground px-3.5 py-1.5 text-xs font-medium whitespace-nowrap text-background transition-opacity hover:opacity-90"
                    >
                      Aprobar subsanación
                    </button>
                  {/if}
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {:else}
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="border-b border-border bg-muted/20 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
              <th class="py-3 pl-6 pr-4 whitespace-nowrap">Certificado ONAC</th>
              <th class="px-4 py-3">Ensayo técnico y laboratorio acreditado</th>
              <th class="px-4 py-3 whitespace-nowrap">Especificación NSR-10</th>
              <th class="px-4 py-3 whitespace-nowrap">Resultado obtenido</th>
              <th class="py-3 pl-4 pr-6 text-right whitespace-nowrap">Cumplimiento</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-border text-sm">
            {#each labTests as test (test.id)}
              <tr class="transition-colors hover:bg-muted/30">
                <td class="py-4 pl-6 pr-4 whitespace-nowrap">
                  <span class="rounded bg-muted px-2 py-0.5 font-mono text-xs font-bold text-foreground">
                    {test.certificateCode}
                  </span>
                  <div class="mt-1 font-mono text-[11px] text-muted-foreground">
                    Nivel {test.floorLevel} · {test.sampleDate}
                  </div>
                </td>

                <td class="px-4 py-4">
                  <div class="font-semibold text-foreground">{test.title}</div>
                  <div class="mt-0.5 text-xs text-muted-foreground">{test.laboratory}</div>
                </td>

                <td class="px-4 py-4 font-mono text-xs whitespace-nowrap text-foreground">
                  {test.targetSpec}
                </td>

                <td class="px-4 py-4 font-mono text-xs font-semibold whitespace-nowrap text-emerald-600 dark:text-emerald-400">
                  {test.obtainedResult}
                </td>

                <td class="py-4 pl-4 pr-6 text-right whitespace-nowrap">
                  <span class="inline-flex items-center gap-1 rounded-md border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-1 font-mono text-xs font-bold whitespace-nowrap text-emerald-600 dark:text-emerald-400">
                    {test.compliancePercent}% · Aprobado
                  </span>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {/if}
  </div>
</div>


<!-- MODAL PARA REGISTRAR NUEVO HALLAZGO TÉCNICO / NCR -->
{#if showFindingModal}
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
    role="dialog"
    aria-modal="true"
  >
    <div class="flex w-[95vw] max-w-lg flex-col overflow-hidden rounded-2xl border border-border bg-card text-card-foreground shadow-2xl">
      <div class="flex items-center justify-between border-b border-border px-6 py-4">
        <div>
          <h3 class="font-display text-base font-bold text-foreground">
            Registrar hallazgo técnico o no conformidad (NCR)
          </h3>
          <p class="text-xs text-muted-foreground">
            Si la severidad es crítica, bloqueará preventivamente la autorización de desembolso en fiduciaria.
          </p>
        </div>
        <button
          type="button"
          onclick={() => (showFindingModal = false)}
          class="cursor-pointer rounded-lg border border-border p-1.5 text-muted-foreground hover:bg-muted"
        >
          <X class="h-4 w-4" />
        </button>
      </div>

      <form onsubmit={handleCreateFinding} class="space-y-4 p-6 text-xs">
        <div>
          <label for="ncr-title" class="block font-semibold text-foreground">
            Título del hallazgo técnico *
          </label>
          <input
            id="ncr-title"
            type="text"
            required
            bind:value={newFindingTitle}
            placeholder="Ej. Recubrimiento mínimo en refuerzo de viga eje B-3"
            class="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none"
          />
        </div>

        <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label for="ncr-floor" class="block font-semibold text-foreground">Piso / Nivel</label>
            <input
              id="ncr-floor"
              type="number"
              min="1"
              max="8"
              bind:value={newFindingFloor}
              class="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 font-mono text-sm text-foreground focus:outline-none"
            />
          </div>

          <div>
            <label for="ncr-axis" class="block font-semibold text-foreground">Eje / Ubicación</label>
            <input
              id="ncr-axis"
              type="text"
              bind:value={newFindingAxis}
              class="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none"
            />
          </div>

          <div>
            <label for="ncr-sev" class="block font-semibold text-foreground">Severidad</label>
            <select
              id="ncr-sev"
              bind:value={newFindingSeverity}
              class="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none"
            >
              <option value="menor">Menor (Observación)</option>
              <option value="moderada">Moderada (Subsanable)</option>
              <option value="critica">Crítica (Bloquea giro)</option>
            </select>
          </div>
        </div>

        <div>
          <label for="ncr-desc" class="block font-semibold text-foreground">Descripción técnica</label>
          <textarea
            id="ncr-desc"
            rows="2"
            bind:value={newFindingDesc}
            placeholder="Detalle la condición observada en obra..."
            class="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none"
          ></textarea>
        </div>

        <div>
          <label for="ncr-act" class="block font-semibold text-foreground">Acción correctiva exigida a la constructora</label>
          <textarea
            id="ncr-act"
            rows="2"
            bind:value={newFindingAction}
            placeholder="Indique el protocolo técnico requerido para cerrar la no conformidad..."
            class="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none"
          ></textarea>
        </div>

        <div class="flex items-center justify-end gap-2 border-t border-border pt-4">
          <button
            type="button"
            onclick={() => (showFindingModal = false)}
            class="cursor-pointer rounded-lg border border-border bg-background px-4 py-2 text-xs font-medium text-foreground hover:bg-muted"
          >
            Cancelar
          </button>
          <button
            type="submit"
            class="cursor-pointer rounded-lg bg-foreground px-4 py-2 text-xs font-medium text-background hover:opacity-90"
          >
            Registrar en bitácora
          </button>
        </div>
      </form>
    </div>
  </div>
{/if}
