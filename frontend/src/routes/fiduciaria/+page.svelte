<script lang="ts">
	import { projectStore, formatCOP } from '$lib/stores/projectState.svelte';
	import type { FiduciaryMilestone } from '$lib/types/twin';
	import DisbursementActionPanel from '$lib/components/dashboard/DisbursementActionPanel.svelte';
	import InteractiveSCurveChart from '$lib/components/dashboard/InteractiveSCurveChart.svelte';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import {
		ShieldCheck,
		CheckCircle2,
		Clock,
		FileText,
		ExternalLink,
		Copy,
		Check,
		PieChart,
		AlertTriangle,
		Printer,
		FlaskConical,
		X
	} from '@lucide/svelte';

	let activeCut = $derived(projectStore.activeCut);
	const ficha = $derived(projectStore.activeFicha);
	const milestones = $derived(projectStore.milestones);
	const complianceList = $derived(projectStore.legalCompliance);
	const mandatoryDocs = $derived(projectStore.mandatoryDocs);
	const findings = $derived(projectStore.technicalFindings);
	const labTests = $derived(projectStore.materialLabTests);
	const snagItems = $derived(projectStore.unitSnagItems);
	const openSnagItems = $derived(snagItems.filter((s) => s.status !== 'validado_propietario'));

	let activeLedgerTab = $state<'hitos' | 'historial' | 'certificados' | 'posventa'>('hitos');
	let milestoneFilter = $state<'todos' | 'en_comite' | 'desembolsados'>('todos');

	const filteredMilestones = $derived(
		milestoneFilter === 'todos'
			? milestones
			: milestoneFilter === 'en_comite'
				? milestones.filter((m) => m.status === 'listo_para_giro' || m.status === 'en_ejecucion')
				: milestones.filter((m) => m.status === 'desembolsado')
	);

	const openCriticalFindings = $derived(
		findings.filter((f) => f.status === 'abierto' && f.severity === 'critica')
	);

	const disbursedMilestones = $derived(
		milestones.filter((m) => m.status === 'desembolsado')
	);
	const pendingCommitteeMilestones = $derived(
		milestones.filter((m) => m.status === 'listo_para_giro')
	);

	const totalGrossBudget = $derived(
		milestones.reduce((acc, m) => acc + m.grossAmountCOP, 0)
	);
	const totalDisbursedGross = $derived(
		disbursedMilestones.reduce((acc, m) => acc + m.grossAmountCOP, 0)
	);
	const totalRetainedGuarantee = $derived(
		disbursedMilestones.reduce((acc, m) => acc + m.retentionFivePercentCOP, 0)
	);
	const totalNetTransferred = $derived(
		disbursedMilestones.reduce((acc, m) => acc + m.netDisbursementCOP, 0)
	);

	// Fuentes de fondeo del fideicomiso (Sources of Funds)
	const fundingSources = $derived([
		{
			name: 'Aportes de compradores (Cuotas iniciales)',
			percent: 45,
			amountCOP: Math.round(activeCut.totalBudgetCOP * 0.45),
			color: 'bg-emerald-500',
			detail: `${ficha.soldUnits} encargos vinculados`
		},
		{
			name: 'Crédito constructor bancario (Línea verde)',
			percent: 38,
			amountCOP: Math.round(activeCut.totalBudgetCOP * 0.38),
			color: 'bg-sky-500',
			detail: 'Giros atados a sello Soroban'
		},
		{
			name: 'Capital propio constructora (Lote y directo)',
			percent: 17,
			amountCOP: Math.round(activeCut.totalBudgetCOP * 0.17),
			color: 'bg-[#F5A400]',
			detail: '100% aportado al fideicomiso'
		}
	]);

	let copiedLink = $state(false);
	let reviewingMilestone = $state<FiduciaryMilestone | null>(null);
	let selectedVoucher = $state<FiduciaryMilestone | null>(null);
	let submittingMilestone = $state<FiduciaryMilestone | null>(null);
	let showExecutiveReportModal = $state(false);

	// Constructor submission form state
	let invoiceNumber = $state('FE-URB-2026-0849');
	let pilaReference = $state('PILA-SOI-99482104');
	let constructorComments = $state(
		'Se adjunta factura electrónica del corte, planilla PILA pagada del mes y relación de paz y salvos de subcontratistas.'
	);

	let approvalNotes = $state(
		'Comité fiduciario verifica cumplimiento del punto de equilibrio, póliza Ley 1796 vigente, ensayos ONAC aprobados, paz y salvo PILA del mes y certificado criptográfico del interventor en Stellar.'
	);
	let isApproving = $state(false);

	async function handleAuthorizeDisbursement() {
		await new Promise((r) => setTimeout(r, 800));
	}

	async function confirmMilestoneDisbursement() {
		if (!reviewingMilestone) return;
		isApproving = true;
		await new Promise((r) => setTimeout(r, 650));
		projectStore.approveMilestoneDisbursement(reviewingMilestone.id);
		const updated = projectStore.milestones.find((m) => m.id === reviewingMilestone?.id) || null;
		isApproving = false;
		reviewingMilestone = null;
		if (updated) {
			selectedVoucher = updated;
		}
	}

	function handleConstructorSubmitForm(e: Event) {
		e.preventDefault();
		if (!submittingMilestone) return;
		projectStore.submitConstructorMilestone(submittingMilestone.id);
		submittingMilestone = null;
	}

	function copyCertLink() {
		copiedLink = true;
		setTimeout(() => (copiedLink = false), 2500);
	}

	function printExecutiveReport() {
		if (typeof window !== 'undefined') {
			window.print();
		}
	}
</script>

<div class="mx-auto max-w-[1440px] space-y-6">
	<!-- Cabecera Institucional -->
	<div class="flex flex-col justify-between gap-4 rounded-xl border border-border bg-card p-6 shadow-xs lg:flex-row lg:items-center">
		<div class="space-y-1">
			<div class="flex flex-wrap items-center gap-2">
				{#if projectStore.effectiveRole === 'constructor'}
					<span class="inline-flex items-center gap-1.5 rounded-md border border-border bg-muted/50 px-2.5 py-0.5 text-xs font-medium whitespace-nowrap text-foreground">
						<span class="h-1.5 w-1.5 rounded-full bg-sky-500"></span>
						Vista constructora · {ficha.developerProfile.name}
					</span>
				{:else}
					<span class="inline-flex items-center gap-1.5 rounded-md border border-border bg-muted/50 px-2.5 py-0.5 text-xs font-medium whitespace-nowrap text-foreground">
						<span class="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
						Comité fiduciario · {activeCut.fiduciaryEntity}
					</span>
				{/if}
				<span class="rounded-md bg-muted px-2.5 py-0.5 font-mono text-[11px] font-medium whitespace-nowrap text-muted-foreground">
					Encargo {activeCut.fiduciaryTrustCode}
				</span>
			</div>
			<h1 class="font-display text-2xl font-bold tracking-tight text-foreground">
				{#if projectStore.effectiveRole === 'constructor'}
					Radicación de hitos de obra, inteligencia financiera y desembolsos
				{:else}
					Inteligencia financiera, auditoría de hitos e historial de desembolsos
				{/if}
			</h1>
			<p class="text-sm text-muted-foreground">
				Control presupuestal interactivo (Curva S y fuentes de fondeo), comité de giros y trazabilidad ACH para <strong class="font-semibold text-foreground">{activeCut.projectName}</strong>.
			</p>
		</div>

		<div class="flex flex-wrap items-center gap-2">
			<button
				type="button"
				onclick={() => (showExecutiveReportModal = true)}
				class="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg bg-foreground px-3.5 py-2 text-xs font-medium whitespace-nowrap text-background shadow-2xs transition-opacity hover:opacity-90"
			>
				<Printer class="h-3.5 w-3.5" />
				<span>Acta oficial de comité</span>
			</button>
			<a
				href="/auditoria"
				class="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-border bg-background px-3.5 py-2 text-xs font-medium whitespace-nowrap text-foreground transition-colors hover:bg-muted"
			>
				Log de auditoría ({projectStore.auditLogs.length})
			</a>
			<a
				href="/cumplimiento"
				class="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-border bg-background px-3.5 py-2 text-xs font-medium whitespace-nowrap text-foreground transition-colors hover:bg-muted"
			>
				Expediente legal ({mandatoryDocs.length})
			</a>
		</div>
	</div>

	<!-- Alerta preventiva si existe algún hallazgo crítico abierto en Interventoría -->
	{#if openCriticalFindings.length > 0}
		<div class="flex flex-col justify-between gap-3 rounded-xl border border-rose-500/40 bg-rose-500/10 p-4 sm:flex-row sm:items-center">
			<div class="flex items-start gap-3">
				<AlertTriangle class="mt-0.5 h-5 w-5 shrink-0 text-rose-500" />
				<div class="text-xs">
					<h3 class="font-semibold text-foreground">
						Bloqueo preventivo fiduciario: {openCriticalFindings.length} hallazgo(s) técnico(s) crítico(s) abierto(s)
					</h3>
					<p class="mt-0.5 text-muted-foreground">
						La interventoría reportó una no conformidad crítica ({openCriticalFindings[0].code}: {openCriticalFindings[0].title}). Debe subsanarse antes de liberar nuevos giros.
					</p>
				</div>
			</div>
			<a
				href="/interventor"
				class="shrink-0 rounded-lg bg-rose-600 px-3.5 py-2 text-xs font-semibold whitespace-nowrap text-white hover:bg-rose-500"
			>
				Revisar en Interventoría →
			</a>
		</div>
	{/if}

	<!-- KPIs FINANCIEROS DEL FIDEICOMISO -->
	<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
		<div class="rounded-xl border border-border bg-card p-5 shadow-xs">
			<span class="text-xs font-medium text-muted-foreground">Presupuesto total en hitos</span>
			<div class="mt-2 font-display text-xl font-bold text-foreground tabular-nums">
				{formatCOP(totalGrossBudget)}
			</div>
			<p class="mt-1 text-xs text-muted-foreground">Distribuido en {milestones.length} hitos verificables</p>
		</div>

		<div class="rounded-xl border border-border bg-card p-5 shadow-xs">
			<span class="text-xs font-medium text-muted-foreground">Valor bruto causado y aprobado</span>
			<div class="mt-2 font-display text-xl font-bold text-foreground tabular-nums">
				{formatCOP(totalDisbursedGross)}
			</div>
			<p class="mt-1 text-xs text-muted-foreground">
				{disbursedMilestones.length} de {milestones.length} hitos desembolsados
			</p>
		</div>

		<div class="rounded-xl border border-border bg-card p-5 shadow-xs">
			<span class="text-xs font-medium text-muted-foreground">Fondo de retención en garantía (5%)</span>
			<div class="mt-2 font-display text-xl font-bold text-foreground tabular-nums">
				{formatCOP(totalRetainedGuarantee)}
			</div>
			<p class="mt-1 text-xs text-muted-foreground">Reserva fiduciaria para estabilidad y postventa</p>
		</div>

		<div class="rounded-xl border border-border bg-card p-5 shadow-xs">
			<span class="text-xs font-medium text-muted-foreground">Total neto girado a constructora</span>
			<div class="mt-2 font-display text-xl font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
				{formatCOP(totalNetTransferred)}
			</div>
			<p class="mt-1 text-xs text-muted-foreground">Transferencias ACH con sello Stellar</p>
		</div>
	</div>

	<!-- ========================================================================= -->
	<!-- INTELIGENCIA FINANCIERA: CURVA S INTERACTIVA (CHART.JS) + FUENTES FONDEO  -->
	<!-- ========================================================================= -->
	<div class="grid grid-cols-1 items-stretch gap-6 xl:grid-cols-12">
		<!-- 1. Curva S Interactiva con Chart.js (7 cols) -->
		<div class="xl:col-span-7">
			<InteractiveSCurveChart {milestones} totalBudgetCOP={activeCut.totalBudgetCOP} />
		</div>

		<!-- 2. Estructura de Fuentes de Fondeo del Fideicomiso (Sources & Uses) (5 cols) -->
		<div class="flex flex-col justify-between rounded-xl border border-border bg-card p-5 shadow-2xs xl:col-span-5">
			<div>
				<div class="flex items-center justify-between gap-2 border-b border-border pb-3.5">
					<div class="flex items-center gap-2">
						<PieChart class="h-4 w-4 shrink-0 text-[#F5A400]" />
						<div>
							<h2 class="font-display text-sm font-semibold text-foreground">
								Fuentes de fondeo del encargo fiduciario
							</h2>
							<p class="text-[11px] text-muted-foreground">
								Estructura de capital que respalda los desembolsos de obra
							</p>
						</div>
					</div>
					<span class="rounded-md bg-emerald-500/10 px-2 py-0.5 font-mono text-xs font-bold whitespace-nowrap text-emerald-600 dark:text-emerald-400">
						100% Fondeado
					</span>
				</div>

				<!-- Barra apilada de fuentes de fondeo -->
				<div class="mt-4 flex h-3 w-full gap-0.5 overflow-hidden rounded-full bg-muted p-0.5">
					{#each fundingSources as src (src.name)}
						<div class="h-full first:rounded-l-full last:rounded-r-full {src.color}" style="width: {src.percent}%"></div>
					{/each}
				</div>

				<div class="mt-4 space-y-2.5">
					{#each fundingSources as src (src.name)}
						<div class="rounded-xl border border-border bg-muted/20 p-3 text-xs">
							<div class="flex items-center justify-between gap-2">
								<span class="inline-flex items-center gap-2 font-semibold text-foreground">
									<span class="h-2.5 w-2.5 shrink-0 rounded-full {src.color}"></span>
									<span>{src.name}</span>
								</span>
								<span class="font-mono font-bold whitespace-nowrap text-foreground">{src.percent}%</span>
							</div>
							<div class="mt-1 flex items-center justify-between pl-4 text-[11px] text-muted-foreground">
								<span>{src.detail}</span>
								<span class="font-mono font-medium whitespace-nowrap text-foreground">{formatCOP(src.amountCOP, true)}</span>
							</div>
						</div>
					{/each}
				</div>
			</div>

			<div class="mt-4 flex items-center justify-between rounded-xl border border-border bg-background p-3 text-xs">
				<span class="text-muted-foreground">Reserva de imprevistos (4%):</span>
				<span class="font-mono font-semibold whitespace-nowrap text-emerald-600 dark:text-emerald-400">
					{formatCOP(Math.round(activeCut.totalBudgetCOP * 0.04), true)} disponible
				</span>
			</div>
		</div>
	</div>

	<!-- ========================================================================= -->
	<!-- CENTRO UNIFICADO DE HITOS, GIROS ACH Y CERTIFICADOS SOROBAN (TABBED UX)   -->
	<!-- ========================================================================= -->
	<div class="overflow-hidden rounded-xl border border-border bg-card shadow-xs">
		<!-- Barra superior con Pestañas de Vista y Filtros Rápidos -->
		<div class="flex flex-col justify-between gap-3 border-b border-border bg-muted/15 px-4 sm:px-6 py-3.5 sm:py-4 lg:flex-row lg:items-center">
			<div class="w-full lg:w-auto grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-wrap items-center gap-1 rounded-xl border border-border bg-background p-1 text-center">
				<button
					type="button"
					onclick={() => (activeLedgerTab = 'hitos')}
					class="cursor-pointer rounded-lg px-3 sm:px-3.5 py-1.5 text-xs font-medium whitespace-nowrap transition-all {activeLedgerTab === 'hitos'
						? 'bg-foreground text-background shadow-2xs'
						: 'text-muted-foreground hover:text-foreground'}"
				>
					Matriz de hitos ({milestones.length})
				</button>
				<button
					type="button"
					onclick={() => (activeLedgerTab = 'historial')}
					class="cursor-pointer rounded-lg px-3 sm:px-3.5 py-1.5 text-xs font-medium whitespace-nowrap transition-all {activeLedgerTab === 'historial'
						? 'bg-foreground text-background shadow-2xs'
						: 'text-muted-foreground hover:text-foreground'}"
				>
					Giros ACH ({disbursedMilestones.length})
				</button>
				<button
					type="button"
					onclick={() => (activeLedgerTab = 'certificados')}
					class="cursor-pointer rounded-lg px-3 sm:px-3.5 py-1.5 text-xs font-medium whitespace-nowrap transition-all {activeLedgerTab === 'certificados'
						? 'bg-foreground text-background shadow-2xs'
						: 'text-muted-foreground hover:text-foreground'}"
				>
					Certificados Soroban ({projectStore.issuedCertificates.length})
				</button>
				<button
					type="button"
					onclick={() => (activeLedgerTab = 'posventa')}
					class="cursor-pointer rounded-lg px-3 sm:px-3.5 py-1.5 text-xs font-medium whitespace-nowrap transition-all {activeLedgerTab === 'posventa'
						? 'bg-foreground text-background shadow-2xs'
						: 'text-muted-foreground hover:text-foreground'}"
				>
					Posventa y Retención ({snagItems.length})
				</button>
			</div>

			{#if activeLedgerTab === 'hitos'}
				<div class="flex flex-wrap items-center gap-2">
					<div class="flex flex-wrap items-center gap-1 rounded-lg border border-border bg-background p-0.5 text-xs">
						<button
							type="button"
							onclick={() => (milestoneFilter = 'todos')}
							class="cursor-pointer rounded-md px-2.5 py-1 text-[11px] font-medium whitespace-nowrap transition-colors {milestoneFilter === 'todos'
								? 'bg-muted font-semibold text-foreground'
								: 'text-muted-foreground hover:text-foreground'}"
						>
							Todos ({milestones.length})
						</button>
						<button
							type="button"
							onclick={() => (milestoneFilter = 'en_comite')}
							class="cursor-pointer rounded-md px-2.5 py-1 text-[11px] font-medium whitespace-nowrap transition-colors {milestoneFilter === 'en_comite'
								? 'bg-muted font-semibold text-foreground'
								: 'text-muted-foreground hover:text-foreground'}"
						>
							En comité ({milestones.filter((m) => m.status === 'listo_para_giro' || m.status === 'en_ejecucion').length})
						</button>
						<button
							type="button"
							onclick={() => (milestoneFilter = 'desembolsados')}
							class="cursor-pointer rounded-md px-2.5 py-1 text-[11px] font-medium whitespace-nowrap transition-colors {milestoneFilter === 'desembolsados'
								? 'bg-muted font-semibold text-foreground'
								: 'text-muted-foreground hover:text-foreground'}"
						>
							Desembolsados ({disbursedMilestones.length})
						</button>
					</div>

					<span class="rounded-md border border-border bg-background px-2.5 py-1 font-mono text-[11px] font-medium whitespace-nowrap text-muted-foreground">
						Retención garantía: 5.0%
					</span>
				</div>
			{:else if activeLedgerTab === 'historial'}
				<span class="rounded-md bg-emerald-500/10 px-2.5 py-1 font-mono text-xs font-semibold whitespace-nowrap text-emerald-600 dark:text-emerald-400">
					Total neto girado: {formatCOP(totalNetTransferred)}
				</span>
			{:else if activeLedgerTab === 'certificados'}
				<span class="font-mono text-xs whitespace-nowrap text-muted-foreground">
					Contrato Soroban: <strong class="text-foreground">corte_registry</strong>
				</span>
			{:else}
				<span class="rounded-md bg-amber-500/10 px-2.5 py-1 font-mono text-xs font-semibold whitespace-nowrap text-amber-600 dark:text-amber-400">
					Fondo retenido (5%): {formatCOP(totalRetainedGuarantee)}
				</span>
			{/if}
		</div>

		<!-- TAB 1: MATRIZ DESPEJADA DE HITOS (5 COLUMNAS LEGIBLES A PRIMERA VISTA) -->
		{#if activeLedgerTab === 'hitos'}
			<div class="overflow-x-auto">
				<table class="w-full text-left border-collapse">
					<thead>
						<tr class="border-b border-border bg-muted/20 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
							<th class="py-3 pl-6 pr-4">Hito y alcance técnico</th>
							<th class="px-4 py-3 whitespace-nowrap">Avance físico</th>
							<th class="px-4 py-3 text-right whitespace-nowrap">Liquidación neta (95%)</th>
							<th class="px-4 py-3 whitespace-nowrap">Estado fiduciario</th>
							<th class="py-3 pl-4 pr-6 text-right whitespace-nowrap">Acción</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-border text-sm">
						{#each filteredMilestones as m (m.id)}
							<tr class="transition-colors hover:bg-muted/30">
								<!-- Columna 1: Hito + Título + Corte/Fecha en línea secundaria limpia -->
								<td class="py-4 pl-6 pr-4 max-w-md">
									<div class="flex items-center gap-2">
										<span class="shrink-0 rounded-md bg-muted px-2 py-0.5 font-mono text-xs font-bold whitespace-nowrap text-foreground">
											Hito #{m.milestoneNumber}
										</span>
										<span class="font-semibold text-foreground truncate">{m.title}</span>
										<span class="shrink-0 font-mono text-[11px] whitespace-nowrap text-muted-foreground">
											· Corte #{m.cutNumber} ({m.dueDate})
										</span>
									</div>
									<p class="mt-1 line-clamp-1 text-xs text-muted-foreground">{m.description}</p>
								</td>

								<!-- Columna 2: Avance Físico con barra limpia -->
								<td class="px-4 py-4 whitespace-nowrap">
									<div class="flex items-center gap-2 font-mono text-xs tabular-nums">
										<span class="font-bold text-foreground">{m.certifiedPhysicalPercent}%</span>
										<span class="text-muted-foreground">/ {m.targetPhysicalPercent}% meta</span>
									</div>
									<div class="mt-1.5 h-1.5 w-28 overflow-hidden rounded-full bg-muted">
										<div
											class="h-full rounded-full {m.status === 'desembolsado'
												? 'bg-emerald-500'
												: m.status === 'listo_para_giro'
													? 'bg-amber-500'
													: 'bg-sky-500'}"
											style="width: {Math.min(100, Math.round((m.certifiedPhysicalPercent / (m.targetPhysicalPercent || 1)) * 100))}%"
										></div>
									</div>
								</td>

								<!-- Columna 3: Giro Neto destacado + Desglose Bruto y Retención en subtítulo compacto -->
								<td class="px-4 py-4 text-right whitespace-nowrap tabular-nums">
									<div class="font-mono text-sm font-bold text-foreground">
										{formatCOP(m.netDisbursementCOP)}
									</div>
									<div class="mt-0.5 font-mono text-[11px] text-muted-foreground">
										Bruto: {formatCOP(m.grossAmountCOP, true)} · Ret 5%: -{formatCOP(m.retentionFivePercentCOP, true)}
									</div>
								</td>

								<!-- Columna 4: Estado Fiduciario (Píldora en 1 sola línea garantizada) -->
								<td class="px-4 py-4 whitespace-nowrap">
									<span class="inline-flex items-center gap-1.5 rounded-md border border-border bg-muted/40 px-2.5 py-1 text-xs font-medium whitespace-nowrap text-foreground">
										<span
											class="h-1.5 w-1.5 shrink-0 rounded-full {m.status === 'desembolsado'
												? 'bg-emerald-500'
												: m.status === 'listo_para_giro'
													? 'bg-amber-500'
													: m.status === 'en_ejecucion'
														? 'bg-sky-500'
														: 'bg-zinc-400'}"
										></span>
										{m.status === 'desembolsado'
											? 'Desembolsado'
											: m.status === 'listo_para_giro'
												? 'Listo para comité'
												: m.status === 'en_ejecucion'
													? 'En ejecución'
													: 'Programado'}
									</span>
								</td>

								<!-- Columna 5: Botón de Acción (Siempre en 1 sola línea con whitespace-nowrap) -->
								<td class="py-4 pl-4 pr-6 text-right whitespace-nowrap">
									{#if m.status === 'desembolsado'}
										<button
											type="button"
											onclick={() => (selectedVoucher = m)}
											class="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium whitespace-nowrap text-foreground shadow-2xs transition-colors hover:bg-foreground hover:text-background"
										>
											Ver comprobante
										</button>
									{:else if m.status === 'listo_para_giro'}
										{#if projectStore.effectiveRole === 'constructor'}
											<span class="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-medium whitespace-nowrap text-amber-600 dark:text-amber-400">
												Radicado en comité
											</span>
										{:else}
											<button
												type="button"
												onclick={() => (reviewingMilestone = m)}
												class="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg bg-foreground px-3.5 py-1.5 text-xs font-medium whitespace-nowrap text-background shadow-xs transition-opacity hover:opacity-90"
											>
												Revisar y aprobar
											</button>
										{/if}
									{:else if m.status === 'en_ejecucion'}
										{#if projectStore.effectiveRole === 'constructor'}
											<button
												type="button"
												onclick={() => (submittingMilestone = m)}
												class="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg bg-foreground px-3 py-1.5 text-xs font-medium whitespace-nowrap text-background hover:opacity-90"
											>
												Radicar cobro
											</button>
										{:else}
											<button
												type="button"
												onclick={() => (reviewingMilestone = m)}
												class="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium whitespace-nowrap text-foreground hover:bg-muted"
											>
												Auditar avance
											</button>
										{/if}
									{:else}
										<span class="text-xs whitespace-nowrap text-muted-foreground">Pendiente de obra</span>
									{/if}
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{:else if activeLedgerTab === 'historial'}
			<!-- TAB 2: HISTORIAL DE DESEMBOLSOS EJECUTADOS (5 COLUMNAS LIMPIAS) -->
			<div class="overflow-x-auto">
				<table class="w-full text-left border-collapse">
					<thead>
						<tr class="border-b border-border bg-muted/20 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
							<th class="py-3 pl-6 pr-4 whitespace-nowrap">Fecha y referencia ACH</th>
							<th class="px-4 py-3">Hito liquidado</th>
							<th class="px-4 py-3">Cuenta beneficiaria</th>
							<th class="px-4 py-3 text-right whitespace-nowrap">Monto neto girado</th>
							<th class="py-3 pl-4 pr-6 text-right whitespace-nowrap">Sello Stellar y soporte</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-border text-sm">
						{#each disbursedMilestones as item (item.id)}
							<tr class="transition-colors hover:bg-muted/30">
								<td class="py-4 pl-6 pr-4 whitespace-nowrap">
									<div class="font-mono text-xs font-semibold text-foreground">{item.disbursedDate}</div>
									<div class="mt-0.5 font-mono text-[11px] text-muted-foreground">{item.achReference}</div>
								</td>
								<td class="px-4 py-4">
									<div class="font-semibold text-foreground">Hito #{item.milestoneNumber} · {item.title}</div>
									<div class="text-xs text-muted-foreground">Corte técnico #{item.cutNumber}</div>
								</td>
								<td class="px-4 py-4 text-xs text-muted-foreground">
									{item.beneficiaryAccount}
								</td>
								<td class="px-4 py-4 text-right font-mono text-sm font-bold whitespace-nowrap text-emerald-600 dark:text-emerald-400 tabular-nums">
									{formatCOP(item.netDisbursementCOP)}
								</td>
								<td class="py-4 pl-4 pr-6 text-right whitespace-nowrap">
									<div class="inline-flex items-center gap-2">
										<span class="rounded bg-muted px-2 py-1 font-mono text-[11px] text-muted-foreground">
											{(item.stellarTxHash || 'c4e97a82fb10').slice(0, 10)}...
										</span>
										<button
											type="button"
											onclick={() => (selectedVoucher = item)}
											class="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium whitespace-nowrap text-foreground hover:bg-foreground hover:text-background"
										>
											Ver comprobante
										</button>
									</div>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{:else if activeLedgerTab === 'certificados'}
			<!-- TAB 3: CERTIFICADOS SELLADOS EN STELLAR SOROBAN -->
			<div class="overflow-x-auto">
				<table class="w-full text-left border-collapse">
					<thead>
						<tr class="border-b border-border bg-muted/20 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
							<th class="py-3 pl-6 pr-4 whitespace-nowrap">Certificado y corte</th>
							<th class="px-4 py-3 whitespace-nowrap">Fecha de sellado</th>
							<th class="px-4 py-3 whitespace-nowrap">Avance certificado</th>
							<th class="px-4 py-3 text-right whitespace-nowrap">Monto respaldado</th>
							<th class="py-3 pl-4 pr-6 text-right whitespace-nowrap">Verificación pública</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-border text-sm tabular-nums">
						{#each projectStore.issuedCertificates as cert (cert.sha256Hash)}
							<tr class="transition-colors hover:bg-muted/30">
								<td class="py-4 pl-6 pr-4 whitespace-nowrap">
									<div class="font-semibold text-foreground">
										Corte #{cert.metadata.corteNumber} · {cert.metadata.projectName}
									</div>
									<div class="text-xs text-muted-foreground">
										ID: {cert.certificateId} · Ledger #{cert.stellarSoroban.ledgerSequence}
									</div>
								</td>
								<td class="px-4 py-4 font-mono text-xs whitespace-nowrap text-muted-foreground">
									{cert.issuedAt.split('T')[0]}
								</td>
								<td class="px-4 py-4 font-mono text-xs font-bold whitespace-nowrap text-emerald-600 dark:text-emerald-400">
									{cert.metadata.metrics.finalCertifiedProgressPercent}% físico
								</td>
								<td class="px-4 py-4 text-right font-mono text-xs font-semibold whitespace-nowrap text-foreground">
									{formatCOP(cert.metadata.financialSummary.cutDisbursementCOP)}
								</td>
								<td class="py-4 pl-4 pr-6 text-right whitespace-nowrap">
									<a
										href="/verificar"
										class="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 font-mono text-xs font-medium whitespace-nowrap text-foreground hover:bg-muted"
									>
										<span>{cert.sha256Hash.slice(0, 10)}...</span>
										<ExternalLink class="h-3 w-3" />
									</a>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{:else}
			<!-- TAB 4: ENTREGAS POSVENTA (SNAG LIST) Y LIBERACIÓN DE RETENCIÓN EN GARANTÍA (5%) -->
			<div class="border-b border-border bg-muted/10 px-6 py-4">
				<div class="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
					<div class="space-y-1">
						<div class="flex flex-wrap items-center gap-2">
							<span class="rounded-md bg-[#F5A400]/15 px-2.5 py-0.5 font-mono text-[11px] font-bold whitespace-nowrap text-amber-600 dark:text-amber-400">
								Fondo de Retención en Garantía (5%): {formatCOP(totalRetainedGuarantee)}
							</span>
							<span class="rounded-md border border-border bg-background px-2.5 py-0.5 text-xs font-medium whitespace-nowrap text-muted-foreground">
								Actas de entrega firmadas: <strong class="text-foreground">{projectStore.signedHandoverUnits.join(', ')}</strong>
							</span>
						</div>
						<p class="text-xs text-muted-foreground">
							El 5% retenido en cada corte se libera cuando las unidades cuentan con Acta de Entrega a Satisfacción firmada por el comprador y sin observaciones críticas de posventa pendientes.
						</p>
					</div>

					<div class="flex shrink-0 flex-wrap items-center gap-2">
						<a
							href="/propietario"
							class="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-2 text-xs font-medium whitespace-nowrap text-foreground hover:bg-muted"
						>
							Ir a Portal Propietario →
						</a>
						{#if projectStore.retentionReleased}
							<span class="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-2 text-xs font-semibold whitespace-nowrap text-emerald-600 dark:text-emerald-400">
								<CheckCircle2 class="h-4 w-4 shrink-0" />
								Retención 5% liberada por Comité Fiduciario
							</span>
						{:else if projectStore.effectiveRole === 'fiduciaria'}
							<button
								type="button"
								onclick={() => projectStore.releaseRetentionGuaranteeFund(totalRetainedGuarantee)}
								class="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-semibold whitespace-nowrap text-white shadow-2xs transition-colors hover:bg-emerald-500"
							>
								<ShieldCheck class="h-4 w-4 shrink-0" />
								Autorizar liberación de retención ({formatCOP(totalRetainedGuarantee, true)})
							</button>
						{/if}
					</div>
				</div>
			</div>

			<div class="overflow-x-auto">
				<table class="w-full text-left border-collapse">
					<thead>
						<tr class="border-b border-border bg-muted/20 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
							<th class="py-3 pl-6 pr-4 whitespace-nowrap">Unidad y zona</th>
							<th class="px-4 py-3">Observación posventa (Snag List)</th>
							<th class="px-4 py-3 whitespace-nowrap">Acta de entrega</th>
							<th class="px-4 py-3 whitespace-nowrap">Estado de validación</th>
							<th class="py-3 pl-4 pr-6 text-right whitespace-nowrap">Acción</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-border text-sm">
						{#each snagItems as snag (snag.id)}
							{@const isUnitSigned = projectStore.signedHandoverUnits.includes(snag.unitCode)}
							<tr class="transition-colors hover:bg-muted/30">
								<td class="py-4 pl-6 pr-4 whitespace-nowrap">
									<div class="font-semibold text-foreground">{snag.unitCode}</div>
									<div class="text-xs text-muted-foreground">{snag.zone} · {snag.reportedAt}</div>
								</td>
								<td class="px-4 py-4 max-w-md">
									<div class="font-medium text-foreground">{snag.title}</div>
									{#if snag.contractorNote}
										<div class="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
											Respuesta obra: {snag.contractorNote}
										</div>
									{/if}
								</td>
								<td class="px-4 py-4 whitespace-nowrap">
									{#if isUnitSigned}
										<span class="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium whitespace-nowrap text-emerald-600 dark:text-emerald-400">
											<CheckCircle2 class="h-3.5 w-3.5 shrink-0" />
											Acta firmada
										</span>
									{:else}
										<span class="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-medium whitespace-nowrap text-amber-600 dark:text-amber-400">
											<Clock class="h-3.5 w-3.5 shrink-0" />
											En pre-entrega
										</span>
									{/if}
								</td>
								<td class="px-4 py-4 whitespace-nowrap">
									{#if snag.status === 'validado_propietario'}
										<span class="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium whitespace-nowrap text-emerald-600 dark:text-emerald-400">
											Validado por propietario
										</span>
									{:else if snag.status === 'corregido_obra'}
										<span class="inline-flex items-center gap-1.5 rounded-full bg-sky-500/10 px-2.5 py-1 text-xs font-medium whitespace-nowrap text-sky-600 dark:text-sky-400">
											Corregido · Pendiente VoBo
										</span>
									{:else}
										<span class="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-medium whitespace-nowrap text-amber-600 dark:text-amber-400">
											En ajuste por constructora
										</span>
									{/if}
								</td>
								<td class="py-4 pl-4 pr-6 text-right whitespace-nowrap">
									{#if snag.status !== 'validado_propietario'}
										<button
											type="button"
											onclick={() => projectStore.validateUnitSnagItem(snag.id)}
											class="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium whitespace-nowrap text-foreground hover:bg-muted"
										>
											Validar arreglo
										</button>
									{:else}
										<span class="font-mono text-xs whitespace-nowrap text-muted-foreground">Cerrado</span>
									{/if}
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}
	</div>

	<!-- SECCIÓN INFERIOR: RESUMEN DEL CORTE ACTIVO Y FIRMA SOROBAN EN 2 COLUMNAS EQUILIBRADAS -->
	<div class="grid grid-cols-1 items-stretch gap-6 xl:grid-cols-12">
		<div class="xl:col-span-7">
			<Card class="h-full border-border bg-card shadow-none">
				<CardContent class="flex h-full flex-col justify-between space-y-4 p-6">
					<div class="flex flex-col justify-between gap-4 border-b border-border pb-4 md:flex-row md:items-center">
						<div>
							<div class="text-xs text-muted-foreground">
								Corte técnico activo #{activeCut.number} de {activeCut.totalCutsPlanned}
							</div>
							<div class="mt-0.5 text-lg font-semibold text-foreground">
								{activeCut.projectName} — Tramo #{activeCut.number}
							</div>
						</div>
						<div class="flex items-center gap-6 tabular-nums">
							<div class="text-left md:text-right">
								<div class="text-xs text-muted-foreground">Monto del corte</div>
								<div class="text-lg font-semibold whitespace-nowrap text-foreground">
									{formatCOP(activeCut.cutDisbursementCOP)}
								</div>
							</div>
							<div class="text-left md:text-right">
								<div class="text-[11px] text-muted-foreground uppercase">Avance</div>
								<div class="text-lg font-bold whitespace-nowrap text-emerald-600">
									{activeCut.certifiedPhysicalProgress}%
								</div>
							</div>
						</div>
					</div>

					<div class="grid grid-cols-1 gap-3 pt-1 sm:grid-cols-3">
						<div class="flex items-start gap-3 rounded-lg border border-border bg-muted/40 p-3.5">
							<ShieldCheck class="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
							<div class="space-y-0.5">
								<div class="text-xs font-semibold text-foreground">Interventoría independiente</div>
								<div class="text-[11px] text-muted-foreground">{activeCut.interventorName}</div>
								<div class="text-[10px] font-medium text-emerald-600">COPNIA verificado</div>
							</div>
						</div>

						<div class="flex items-start gap-3 rounded-lg border border-border bg-muted/40 p-3.5">
							<FlaskConical class="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
							<div class="space-y-0.5">
								<div class="text-xs font-semibold text-foreground">Laboratorio NSR-10</div>
								<div class="text-[11px] text-muted-foreground">{labTests.length} pruebas ONAC aprobadas</div>
								<div class="text-[10px] font-medium text-emerald-600">Concreto y acero 100%</div>
							</div>
						</div>

						<div class="flex items-start gap-3 rounded-lg border border-border bg-muted/40 p-3.5">
							<Clock class="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
							<div class="space-y-0.5">
								<div class="text-xs font-semibold text-foreground">Sellado inmutable</div>
								<div class="text-[11px] text-muted-foreground">Ledger Stellar Testnet</div>
								<div class="text-[10px] font-medium text-emerald-600">Sin antedatado</div>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>

		<div class="xl:col-span-5">
			{#if projectStore.effectiveRole === 'constructor'}
				<Card class="h-full border-blue-500/30 bg-card shadow-xs">
					<CardContent class="flex h-full flex-col justify-between space-y-4 p-6">
						<div class="flex items-center justify-between gap-2">
							<div>
								<h3 class="text-sm font-bold text-foreground">Soporte criptográfico para solicitud de giro</h3>
								<p class="mt-0.5 text-xs text-muted-foreground">
									Adjunta este enlace verificado en el radicado ante {activeCut.fiduciaryEntity}.
								</p>
							</div>
							<Badge variant="outline" class="shrink-0 border-emerald-500/30 bg-emerald-500/10 text-xs whitespace-nowrap text-emerald-600">
								Listo para radicar
							</Badge>
						</div>

						<div class="flex items-center justify-between gap-2 rounded-lg border border-border bg-muted/50 p-3 text-xs tabular-nums">
							<span class="truncate font-medium text-foreground">
								https://tramo.co/verificar?hash={activeCut.sha256Hash || 'a7c93e41b2e8d7541f6e2983c48520d88b489920'}
							</span>
							<Button size="sm" variant="outline" onclick={copyCertLink} class="h-7 shrink-0 cursor-pointer gap-1.5 text-xs whitespace-nowrap">
								{#if copiedLink}
									<Check class="h-3.5 w-3.5 text-emerald-500" />
									<span>Copiado</span>
								{:else}
									<Copy class="h-3.5 w-3.5" />
									<span>Copiar enlace</span>
								{/if}
							</Button>
						</div>
					</CardContent>
				</Card>
			{:else}
				<DisbursementActionPanel
					corteId={activeCut.id}
					montoSolicitadoCOP={activeCut.cutDisbursementCOP}
					sha256Hash={activeCut.sha256Hash || 'a7c93e41b2e8d7541f6e2983c48520d88b489920efbc756312a0f8d9b1c7849e'}
					onAuthorize={handleAuthorizeDisbursement}
				/>
			{/if}
		</div>
	</div>
</div>


<!-- MODAL AMPLIO DE COMITÉ FIDUCIARIO PARA REVISAR Y APROBAR UN HITO -->
{#if reviewingMilestone}
	<div
		class="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-0 sm:p-4 backdrop-blur-xs overflow-y-auto"
		role="dialog"
		aria-modal="true"
	>
		<div class="flex max-h-[94dvh] w-full sm:w-[96vw] max-w-5xl flex-col overflow-hidden rounded-t-2xl sm:rounded-2xl border border-border bg-card text-card-foreground shadow-2xl my-0 sm:my-auto">
			<div class="flex items-center justify-between border-b border-border px-4 sm:px-6 py-3.5 sm:py-4 shrink-0">
				<div>
					<div class="flex items-center gap-2">
						<span class="rounded-md bg-foreground px-2.5 py-0.5 font-mono text-xs font-bold text-background">
							Hito #{reviewingMilestone.milestoneNumber}
						</span>
						<span class="inline-flex items-center gap-1.5 rounded-md border border-border bg-muted/50 px-2.5 py-0.5 text-xs font-medium text-foreground">
							<span class="h-1.5 w-1.5 rounded-full bg-amber-500"></span>
							Comité fiduciario de desembolso
						</span>
					</div>
					<h3 class="mt-1 font-display text-sm sm:text-lg font-bold text-foreground">
						Revisión y aprobación fiduciaria — {reviewingMilestone.title}
					</h3>
				</div>
				<button
					type="button"
					onclick={() => (reviewingMilestone = null)}
					aria-label="Cerrar modal"
					class="cursor-pointer rounded-lg border border-border p-1.5 text-muted-foreground hover:bg-muted"
				>
					<X class="h-4 w-4" />
				</button>
			</div>

			<div class="grid grid-cols-1 gap-6 overflow-y-auto p-4 sm:p-6 lg:grid-cols-12 flex-1">
				<div class="space-y-4 lg:col-span-7">
					<div class="rounded-xl border border-border bg-muted/30 p-4">
						<span class="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
							Alcance técnico auditado (Corte #{reviewingMilestone.cutNumber})
						</span>
						<p class="mt-1 text-sm leading-relaxed text-foreground">
							{reviewingMilestone.description}
						</p>
						<div class="mt-3 grid grid-cols-3 gap-3 border-t border-border pt-3 text-xs">
							<div>
								<span class="text-muted-foreground">Avance exigido</span>
								<p class="font-mono font-bold text-foreground">{reviewingMilestone.targetPhysicalPercent}%</p>
							</div>
							<div>
								<span class="text-muted-foreground">Avance certificado</span>
								<p class="font-mono font-bold text-emerald-600">{reviewingMilestone.certifiedPhysicalPercent}%</p>
							</div>
							<div>
								<span class="text-muted-foreground">Ensayos ONAC</span>
								<p class="font-mono font-semibold text-emerald-600">{labTests.length}/{labTests.length} Aprobados</p>
							</div>
						</div>
					</div>

					<div class="rounded-xl border border-border p-4">
						<h4 class="font-display text-sm font-semibold text-foreground">
							Lista de chequeo de requisitos previos al giro (Ley 1796 y NSR-10)
						</h4>
						<div class="mt-3 divide-y divide-border text-xs">
							{#each complianceList.slice(0, 4) as item (item.id)}
								<div class="flex items-center justify-between py-2">
									<div>
										<span class="font-semibold text-foreground">{item.requirement}</span>
										<span class="ml-2 text-muted-foreground capitalize">({item.entityType})</span>
									</div>
									<span class="inline-flex items-center gap-1.5 rounded-md border border-border bg-muted/50 px-2 py-0.5 font-medium text-foreground">
										<span class="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
										Verificado
									</span>
								</div>
							{/each}
							<div class="flex items-center justify-between py-2">
								<div>
									<span class="font-semibold text-foreground">Estado de no conformidades críticas (NCR)</span>
								</div>
								{#if openCriticalFindings.length === 0}
									<span class="inline-flex items-center gap-1.5 rounded-md border border-emerald-500/25 bg-emerald-500/10 px-2 py-0.5 font-medium text-emerald-600 dark:text-emerald-400">
										<span class="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
										0 críticas abiertas
									</span>
								{:else}
									<span class="inline-flex items-center gap-1.5 rounded-md border border-rose-500/30 bg-rose-500/10 px-2 py-0.5 font-medium text-rose-600">
										{openCriticalFindings.length} crítica abierta
									</span>
								{/if}
							</div>
						</div>
					</div>

					<div>
						<label for="committee-notes" class="block text-xs font-semibold text-foreground">
							Acta y concepto del Comité Fiduciario
						</label>
						<textarea
							id="committee-notes"
							rows="2"
							bind:value={approvalNotes}
							class="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none"
						></textarea>
					</div>
				</div>

				<div class="flex flex-col justify-between rounded-xl border border-border bg-muted/20 p-5 lg:col-span-5">
					<div class="space-y-4">
						<div>
							<span class="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
								Liquidación financiera del desembolso
							</span>
							<h4 class="mt-1 font-display text-base font-bold text-foreground">
								Orden de giro desde Patrimonio Autónomo
							</h4>
						</div>

						<div class="space-y-2.5 rounded-xl border border-border bg-background p-4 text-xs">
							<div class="flex items-center justify-between">
								<span class="text-muted-foreground">Beneficiario:</span>
								<span class="font-semibold text-foreground">{ficha.developerProfile.name}</span>
							</div>
							<div class="flex items-center justify-between">
								<span class="text-muted-foreground">Cuenta destino:</span>
								<span class="font-mono text-foreground">{reviewingMilestone.beneficiaryAccount}</span>
							</div>
							<div class="flex items-center justify-between border-t border-border pt-2.5">
								<span class="text-muted-foreground">Valor bruto del hito:</span>
								<span class="font-mono font-semibold text-foreground">{formatCOP(reviewingMilestone.grossAmountCOP)}</span>
							</div>
							<div class="flex items-center justify-between">
								<span class="text-muted-foreground">Retención en garantía (5%):</span>
								<span class="font-mono text-rose-500">-{formatCOP(reviewingMilestone.retentionFivePercentCOP)}</span>
							</div>
							<div class="flex items-center justify-between border-t border-border pt-2.5 text-sm">
								<span class="font-semibold text-foreground">Neto a girar vía ACH:</span>
								<span class="font-mono font-bold text-emerald-600">{formatCOP(reviewingMilestone.netDisbursementCOP)}</span>
							</div>
						</div>

						<div class="rounded-xl bg-slate-900 p-4 text-xs text-white">
							<div class="flex items-center justify-between">
								<span class="text-slate-400">Aval técnico interventoría:</span>
								<span class="font-mono text-emerald-400">Firmado</span>
							</div>
							<p class="mt-1 font-medium text-white">{ficha.supervisorProfile.name} ({ficha.supervisorProfile.copniaLicense})</p>
							<p class="mt-2 font-mono text-[11px] break-all text-slate-400">
								Tx Stellar: <span class="text-slate-200">{reviewingMilestone.stellarTxHash || activeCut.stellarTxHash || 'c4e97a82fb10d3f6a2410a8234bb5812'}</span>
							</p>
						</div>
					</div>

					<div class="mt-6 space-y-2">
						<button
							type="button"
							disabled={isApproving || openCriticalFindings.length > 0}
							onclick={confirmMilestoneDisbursement}
							class="w-full cursor-pointer rounded-xl bg-foreground px-4 py-3 text-xs font-semibold text-background shadow-sm transition-opacity hover:opacity-90 disabled:opacity-50"
						>
							{openCriticalFindings.length > 0
								? 'Giro bloqueado por hallazgo crítico abierto'
								: isApproving
									? 'Procesando giro bancario ACH y sellando acta...'
									: `Aprobar hito y desembolsar ${formatCOP(reviewingMilestone.netDisbursementCOP)}`}
						</button>
						<button
							type="button"
							onclick={() => (reviewingMilestone = null)}
							class="w-full cursor-pointer rounded-xl border border-border bg-background px-4 py-2 text-xs font-medium text-foreground hover:bg-muted"
						>
							Cancelar revisión
						</button>
					</div>
				</div>
			</div>
		</div>
	</div>
{/if}

<!-- MODAL DE RADICACIÓN DE COBRO DE HITO (ROL CONSTRUCTORA) -->
{#if submittingMilestone}
	<div
		class="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-0 sm:p-4 backdrop-blur-xs overflow-y-auto"
		role="dialog"
		aria-modal="true"
	>
		<div class="flex max-h-[92dvh] w-full sm:w-[95vw] max-w-xl flex-col overflow-hidden rounded-t-2xl sm:rounded-2xl border border-border bg-card text-card-foreground shadow-2xl my-0 sm:my-auto">
			<div class="flex items-center justify-between border-b border-border px-4 sm:px-6 py-3.5 sm:py-4 shrink-0">
				<div>
					<h3 class="font-display text-sm sm:text-base font-bold text-foreground">
						Radicar solicitud formal de desembolso — Hito #{submittingMilestone.milestoneNumber}
					</h3>
					<p class="text-xs text-muted-foreground">
						Envía la cuenta de cobro y soportes de ley para habilitar el Comité Fiduciario.
					</p>
				</div>
				<button
					type="button"
					onclick={() => (submittingMilestone = null)}
					class="cursor-pointer rounded-lg border border-border p-1.5 text-muted-foreground hover:bg-muted"
				>
					<X class="h-4 w-4" />
				</button>
			</div>

			<form onsubmit={handleConstructorSubmitForm} class="space-y-4 p-4 sm:p-6 text-xs overflow-y-auto flex-1">
				<div class="rounded-xl border border-border bg-muted/30 p-3.5">
					<div class="font-semibold text-foreground">{submittingMilestone.title}</div>
					<div class="mt-1 flex justify-between text-muted-foreground">
						<span>Monto neto solicitado:</span>
						<span class="font-mono font-bold text-foreground">{formatCOP(submittingMilestone.netDisbursementCOP)}</span>
					</div>
				</div>

				<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
					<div>
						<label for="inv-num" class="block font-semibold text-foreground">Factura electrónica / Cuenta de cobro *</label>
						<input
							id="inv-num"
							type="text"
							required
							bind:value={invoiceNumber}
							class="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 font-mono text-sm text-foreground focus:outline-none"
						/>
					</div>
					<div>
						<label for="pila-ref" class="block font-semibold text-foreground">Planilla PILA seguridad social *</label>
						<input
							id="pila-ref"
							type="text"
							required
							bind:value={pilaReference}
							class="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 font-mono text-sm text-foreground focus:outline-none"
						/>
					</div>
				</div>

				<div>
					<label for="const-comm" class="block font-semibold text-foreground">Observaciones y relación de proveedores</label>
					<textarea
						id="const-comm"
						rows="3"
						bind:value={constructorComments}
						class="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none"
					></textarea>
				</div>

				<div class="flex items-center justify-end gap-2 border-t border-border pt-4 shrink-0">
					<button
						type="button"
						onclick={() => (submittingMilestone = null)}
						class="cursor-pointer rounded-lg border border-border bg-background px-4 py-2 text-xs font-medium text-foreground hover:bg-muted"
					>
						Cancelar
					</button>
					<button
						type="submit"
						class="cursor-pointer rounded-lg bg-foreground px-4 py-2 text-xs font-medium text-background hover:opacity-90"
					>
						Radicar cobro ante Fiduciaria
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}

<!-- MODAL DE ACTA OFICIAL EJECUTIVA DE COMITÉ FIDUCIARIO (IMPRIMIBLE) -->
{#if showExecutiveReportModal}
	<div
		class="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 p-0 sm:p-4 backdrop-blur-xs overflow-y-auto"
		role="dialog"
		aria-modal="true"
	>
		<div class="flex max-h-[94dvh] w-full sm:w-[96vw] max-w-4xl flex-col overflow-hidden rounded-t-2xl sm:rounded-2xl border border-border bg-card text-card-foreground shadow-2xl my-0 sm:my-auto">
			<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-border px-4 sm:px-6 py-3.5 sm:py-4 shrink-0">
				<div>
					<span class="font-mono text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase">
						Documento auditable de comité fiduciario
					</span>
					<h3 class="font-display text-sm sm:text-base font-bold text-foreground">
						Acta ejecutiva de verificación de obra y desembolsos — {activeCut.projectName}
					</h3>
				</div>
				<div class="flex items-center gap-2 self-end sm:self-auto">
					<button
						type="button"
						onclick={printExecutiveReport}
						class="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-foreground px-3.5 py-1.5 text-xs font-medium text-background hover:opacity-90"
					>
						<Printer class="h-3.5 w-3.5" />
						<span>Imprimir / PDF</span>
					</button>
					<button
						type="button"
						onclick={() => (showExecutiveReportModal = false)}
						class="cursor-pointer rounded-lg border border-border p-1.5 text-muted-foreground hover:bg-muted"
					>
						<X class="h-4 w-4" />
					</button>
				</div>
			</div>

			<div class="space-y-5 overflow-y-auto p-4 sm:p-6 text-xs flex-1">
				<div class="rounded-xl border border-border bg-background p-6 space-y-5">
					<div class="flex flex-wrap items-start justify-between gap-4 border-b border-border pb-4">
						<div>
							<div class="text-sm font-bold text-foreground">{activeCut.fiduciaryEntity}</div>
							<div class="text-muted-foreground">Patrimonio Autónomo: {activeCut.fiduciaryTrustCode}</div>
							<div class="text-muted-foreground">Proyecto: {activeCut.projectName} ({activeCut.city})</div>
						</div>
						<div class="text-right font-mono">
							<div class="font-bold text-foreground">ACTA COMITÉ #{activeCut.number}-2026</div>
							<div class="text-muted-foreground">Fecha: 12 Octubre 2026</div>
							<div class="text-emerald-600 font-semibold">Red: Stellar Soroban Testnet</div>
						</div>
					</div>

					<div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
						<div class="rounded-lg border border-border p-3">
							<span class="text-muted-foreground block text-[11px]">Avance físico certificado</span>
							<span class="font-mono text-base font-bold text-emerald-600">{activeCut.certifiedPhysicalProgress}%</span>
						</div>
						<div class="rounded-lg border border-border p-3">
							<span class="text-muted-foreground block text-[11px]">Total neto desembolsado</span>
							<span class="font-mono text-base font-bold text-foreground">{formatCOP(totalNetTransferred)}</span>
						</div>
						<div class="rounded-lg border border-border p-3">
							<span class="text-muted-foreground block text-[11px]">Retención garantía acumulada (5%)</span>
							<span class="font-mono text-base font-bold text-foreground">{formatCOP(totalRetainedGuarantee)}</span>
						</div>
					</div>

					<div class="space-y-2">
						<div class="font-semibold text-foreground">Dictamen de cumplimiento normativo (Ley 1796 de 2016 y NSR-10)</div>
						<p class="leading-relaxed text-muted-foreground">
							Se deja constancia en el comité fiduciario que la constructora <strong class="text-foreground">{ficha.developerProfile.name}</strong> mantiene vigentes las pólizas exigidas por ley y la seguridad social PILA de obra, y que la firma interventora independiente <strong class="text-foreground">{ficha.supervisorProfile.companyName}</strong> ({ficha.supervisorProfile.copniaLicense}) avaló satisfactoriamente los {labTests.length} ensayos de laboratorio ONAC y selló la huella criptográfica del corte en la red Stellar Soroban.
						</p>
					</div>

					<div class="grid grid-cols-1 gap-4 border-t border-border pt-4 sm:grid-cols-3 text-center">
						<div class="rounded-lg border border-border bg-muted/20 p-3">
							<div class="font-semibold text-foreground">{ficha.developerProfile.legalRepresentative}</div>
							<div class="text-[11px] text-muted-foreground">Representante Legal Constructora</div>
							<div class="mt-1 font-mono text-[10px] text-emerald-600">Radicado Digital Verificado</div>
						</div>
						<div class="rounded-lg border border-border bg-muted/20 p-3">
							<div class="font-semibold text-foreground">{ficha.supervisorProfile.name}</div>
							<div class="text-[11px] text-muted-foreground">Director Interventoría ({ficha.supervisorProfile.copniaLicense})</div>
							<div class="mt-1 font-mono text-[10px] text-emerald-600">Firma Criptográfica Soroban</div>
						</div>
						<div class="rounded-lg border border-border bg-muted/20 p-3">
							<div class="font-semibold text-foreground">Comité de Giros Fiduciarios</div>
							<div class="text-[11px] text-muted-foreground">{activeCut.fiduciaryEntity}</div>
							<div class="mt-1 font-mono text-[10px] text-emerald-600">Auditoría Completa</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
{/if}

<!-- MODAL AMPLIO DE COMPROBANTE OFICIAL DE GIRO FIDUCIARIO -->
{#if selectedVoucher}
	<div
		class="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-0 sm:p-4 backdrop-blur-xs overflow-y-auto"
		role="dialog"
		aria-modal="true"
	>
		<div class="flex max-h-[92dvh] w-full sm:w-[95vw] max-w-3xl flex-col overflow-hidden rounded-t-2xl sm:rounded-2xl border border-border bg-card text-card-foreground shadow-2xl my-0 sm:my-auto">
			<div class="flex items-center justify-between border-b border-border bg-slate-900 px-4 sm:px-6 py-3.5 sm:py-4 text-white shrink-0">
				<div>
					<span class="font-mono text-[11px] text-emerald-400 uppercase">
						Comprobante oficial de desembolso fiduciario
					</span>
					<h3 class="mt-0.5 font-display text-sm sm:text-base font-bold">
						Hito #{selectedVoucher.milestoneNumber} · {selectedVoucher.title}
					</h3>
				</div>
				<button
					type="button"
					onclick={() => (selectedVoucher = null)}
					aria-label="Cerrar comprobante"
					class="cursor-pointer rounded-lg border border-slate-700 p-1.5 text-slate-300 hover:bg-slate-800"
				>
					<X class="h-4 w-4" />
				</button>
			</div>

			<div class="space-y-4 sm:space-y-5 p-4 sm:p-6 overflow-y-auto flex-1">
				<div class="grid grid-cols-1 gap-3 rounded-xl border border-border bg-muted/30 p-3 sm:p-4 sm:grid-cols-3">
					<div>
						<span class="text-[11px] text-muted-foreground">Referencia ACH</span>
						<p class="mt-0.5 font-mono text-xs font-bold text-foreground">{selectedVoucher.achReference}</p>
					</div>
					<div>
						<span class="text-[11px] text-muted-foreground">Fecha efectiva de giro</span>
						<p class="mt-0.5 font-mono text-xs font-bold text-foreground">{selectedVoucher.disbursedDate}</p>
					</div>
					<div>
						<span class="text-[11px] text-muted-foreground">Fideicomiso emisor</span>
						<p class="mt-0.5 text-xs font-bold text-foreground">{activeCut.fiduciaryEntity}</p>
					</div>
				</div>

				<div class="space-y-2.5 rounded-xl border border-border p-3.5 sm:p-4 text-xs">
					<div class="flex justify-between gap-2">
						<span class="text-muted-foreground">Constructora beneficiaria:</span>
						<span class="font-semibold text-foreground text-right">{ficha.developerProfile.name} ({ficha.developerProfile.nit})</span>
					</div>
					<div class="flex justify-between gap-2">
						<span class="text-muted-foreground">Cuenta bancaria destino:</span>
						<span class="font-mono text-foreground">{selectedVoucher.beneficiaryAccount}</span>
					</div>
					<div class="flex justify-between border-t border-border pt-2">
						<span class="text-muted-foreground">Valor bruto certificado:</span>
						<span class="font-mono font-semibold text-foreground">{formatCOP(selectedVoucher.grossAmountCOP)}</span>
					</div>
					<div class="flex justify-between">
						<span class="text-muted-foreground">Retención de garantía fiduciaria (5%):</span>
						<span class="font-mono text-rose-500">-{formatCOP(selectedVoucher.retentionFivePercentCOP)}</span>
					</div>
					<div class="flex justify-between border-t border-border pt-2.5 text-sm">
						<span class="font-bold text-foreground">Valor neto desembolsado:</span>
						<span class="font-mono font-bold text-emerald-600">{formatCOP(selectedVoucher.netDisbursementCOP)}</span>
					</div>
				</div>

				<div class="rounded-xl border border-border bg-muted/30 px-3.5 py-2.5 font-mono text-xs break-all text-muted-foreground">
					Hash de auditoría Stellar Soroban: <strong class="text-foreground">{selectedVoucher.stellarTxHash || activeCut.stellarTxHash}</strong>
				</div>
			</div>

			<div class="flex items-center justify-end gap-2 border-t border-border bg-muted/20 px-4 sm:px-6 py-3 sm:py-4 shrink-0">
				<button
					type="button"
					onclick={() => (selectedVoucher = null)}
					class="cursor-pointer rounded-lg bg-foreground px-4 py-2 text-xs font-medium text-background hover:opacity-90"
				>
					Cerrar comprobante
				</button>
			</div>
		</div>
	</div>
{/if}
