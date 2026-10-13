<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { projectStore, formatCOP } from '$lib/stores/projectState.svelte';
	import type { FiduciaryMilestone } from '$lib/types/twin';
	import { TrendingUp, BarChart3 } from '@lucide/svelte';

	let {
		milestones,
		totalBudgetCOP
	}: {
		milestones: FiduciaryMilestone[];
		totalBudgetCOP: number;
	} = $props();

	let chartMode = $state<'scurve' | 'cashflow'>('scurve');
	let canvasEl = $state<HTMLCanvasElement | null>(null);
	let chartInstance: any = null;
	let ChartConstructor: any = null;

	// Puntos acumulados de la Curva S desde Inicio (M0) hasta Hito 6 (M12)
	const sCurveLabels = [
		'Inicio (M0)',
		'Hito 1 (M2)',
		'Hito 2 (M4)',
		'Hito 3 (M6)',
		'Hito 4 · Actual',
		'Hito 5 (Proy.)',
		'Hito 6 · Entrega'
	];

	const plannedSeries = [0, 12.0, 24.0, 35.0, 50.0, 74.0, 100.0];
	const physicalSeries = [0, 12.5, 25.0, 36.2, 52.4, null, null];
	const financialSeries = [0, 11.8, 24.0, 35.0, 49.5, null, null];

	function buildOrUpdateChart() {
		if (!ChartConstructor || !canvasEl) return;

		if (chartInstance) {
			chartInstance.destroy();
			chartInstance = null;
		}

		const ctx = canvasEl.getContext('2d');
		if (!ctx) return;

		const isDark = projectStore.isDark;
		const gridColor = isDark ? 'rgba(255, 255, 255, 0.07)' : 'rgba(15, 23, 42, 0.08)';
		const tickColor = isDark ? '#a1a1aa' : '#64748b';
		const tooltipBg = isDark ? '#18181b' : '#0f172a';

		if (chartMode === 'scurve') {
			const emeraldGrad = ctx.createLinearGradient(0, 0, 0, 240);
			emeraldGrad.addColorStop(0, 'rgba(16, 185, 129, 0.24)');
			emeraldGrad.addColorStop(1, 'rgba(16, 185, 129, 0.0)');

			const amberGrad = ctx.createLinearGradient(0, 0, 0, 240);
			amberGrad.addColorStop(0, 'rgba(245, 164, 0, 0.16)');
			amberGrad.addColorStop(1, 'rgba(245, 164, 0, 0.0)');

			chartInstance = new ChartConstructor(ctx, {
				type: 'line',
				data: {
					labels: sCurveLabels,
					datasets: [
						{
							label: 'Avance físico certificado (Stellar)',
							data: physicalSeries,
							borderColor: '#10b981',
							backgroundColor: emeraldGrad,
							borderWidth: 3,
							pointBackgroundColor: '#10b981',
							pointBorderColor: isDark ? '#18181b' : '#ffffff',
							pointBorderWidth: 2,
							pointRadius: 5,
							pointHoverRadius: 7,
							tension: 0.35,
							fill: true,
							spanGaps: false
						},
						{
							label: 'Giro financiero causado',
							data: financialSeries,
							borderColor: '#f5a400',
							backgroundColor: amberGrad,
							borderWidth: 2.5,
							pointBackgroundColor: '#f5a400',
							pointBorderColor: isDark ? '#18181b' : '#ffffff',
							pointBorderWidth: 1.5,
							pointRadius: 4.5,
							pointHoverRadius: 6.5,
							tension: 0.35,
							fill: true,
							spanGaps: false
						},
						{
							label: 'Cronograma base programado',
							data: plannedSeries,
							borderColor: '#94a3b8',
							backgroundColor: 'transparent',
							borderWidth: 2,
							borderDash: [6, 4],
							pointBackgroundColor: '#94a3b8',
							pointRadius: 3.5,
							pointHoverRadius: 5.5,
							tension: 0.35,
							fill: false
						}
					]
				},
				options: {
					responsive: true,
					maintainAspectRatio: false,
					interaction: {
						mode: 'index',
						intersect: false
					},
					plugins: {
						legend: {
							display: true,
							position: 'bottom',
							labels: {
								color: tickColor,
								usePointStyle: true,
								pointStyle: 'circle',
								padding: 16,
								font: {
									family: 'Inter, system-ui, sans-serif',
									size: 11,
									weight: '500'
								}
							}
						},
						tooltip: {
							backgroundColor: tooltipBg,
							titleColor: '#ffffff',
							bodyColor: '#e4e4e7',
							borderColor: 'rgba(255,255,255,0.12)',
							borderWidth: 1,
							padding: 12,
							cornerRadius: 10,
							displayColors: true,
							callbacks: {
								label: (context: any) => {
									const val = context.parsed.y;
									if (val === null || val === undefined) return `${context.dataset.label}: Proyectado`;
									const eqCOP = Math.round((val / 100) * totalBudgetCOP);
									return ` ${context.dataset.label}: ${val.toFixed(1)}% (${formatCOP(eqCOP, true)})`;
								}
							}
						}
					},
					scales: {
						x: {
							grid: {
								color: gridColor
							},
							ticks: {
								color: tickColor,
								font: {
									family: 'ui-monospace, SFMono-Regular, monospace',
									size: 10
								}
							}
						},
						y: {
							min: 0,
							max: 100,
							grid: {
								color: gridColor
							},
							ticks: {
								color: tickColor,
								stepSize: 25,
								callback: (value: any) => `${value}%`,
								font: {
									family: 'ui-monospace, SFMono-Regular, monospace',
									size: 10
								}
							}
						}
					}
				}
			});
		} else {
			// Modo Flujo de Giros por Hito (Bar Chart en Millones COP)
			const labels = milestones.map((m) => `Hito #${m.milestoneNumber}`);
			const grossValues = milestones.map((m) => Math.round(m.grossAmountCOP / 1_000_000));
			const netValues = milestones.map((m) => Math.round(m.netDisbursementCOP / 1_000_000));
			const retentionValues = milestones.map((m) => Math.round(m.retentionFivePercentCOP / 1_000_000));

			chartInstance = new ChartConstructor(ctx, {
				type: 'bar',
				data: {
					labels,
					datasets: [
						{
							label: 'Giro Neto a Constructora (95%)',
							data: netValues,
							backgroundColor: '#10b981',
							borderRadius: 6
						},
						{
							label: 'Valor Bruto del Hito (100%)',
							data: grossValues,
							backgroundColor: '#38bdf8',
							borderRadius: 6
						},
						{
							label: 'Retención en Garantía (5%)',
							data: retentionValues,
							backgroundColor: '#f5a400',
							borderRadius: 6
						}
					]
				},
				options: {
					responsive: true,
					maintainAspectRatio: false,
					interaction: {
						mode: 'index',
						intersect: false
					},
					plugins: {
						legend: {
							display: true,
							position: 'bottom',
							labels: {
								color: tickColor,
								usePointStyle: true,
								pointStyle: 'rectRounded',
								padding: 16,
								font: {
									family: 'Inter, system-ui, sans-serif',
									size: 11,
									weight: '500'
								}
							}
						},
						tooltip: {
							backgroundColor: tooltipBg,
							titleColor: '#ffffff',
							bodyColor: '#e4e4e7',
							borderColor: 'rgba(255,255,255,0.12)',
							borderWidth: 1,
							padding: 12,
							cornerRadius: 10,
							callbacks: {
								label: (context: any) => {
									const valMM = context.parsed.y;
									return ` ${context.dataset.label}: $${valMM.toLocaleString('es-CO')} MM COP`;
								}
							}
						}
					},
					scales: {
						x: {
							grid: { display: false },
							ticks: {
								color: tickColor,
								font: {
									family: 'ui-monospace, SFMono-Regular, monospace',
									size: 10
								}
							}
						},
						y: {
							grid: { color: gridColor },
							ticks: {
								color: tickColor,
								callback: (value: any) => `$${value}M`,
								font: {
									family: 'ui-monospace, SFMono-Regular, monospace',
									size: 10
								}
							}
						}
					}
				}
			});
		}
	}

	onMount(async () => {
		const chartModule = await import('chart.js/auto');
		ChartConstructor = chartModule.default || chartModule.Chart;
		buildOrUpdateChart();
	});

	$effect(() => {
		// Re-render when mode, theme, or milestones change
		const _mode = chartMode;
		const _dark = projectStore.isDark;
		const _len = milestones.length;
		if (ChartConstructor && canvasEl) {
			buildOrUpdateChart();
		}
	});

	onDestroy(() => {
		if (chartInstance) {
			chartInstance.destroy();
		}
	});
</script>

<div class="flex h-full flex-col justify-between rounded-xl border border-border bg-card p-5 shadow-2xs">
	<div class="flex flex-col justify-between gap-3 border-b border-border pb-3.5 sm:flex-row sm:items-center">
		<div class="flex items-center gap-2.5">
			<div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-emerald-500/25 bg-emerald-500/10 text-emerald-500">
				{#if chartMode === 'scurve'}
					<TrendingUp class="h-4 w-4" />
				{:else}
					<BarChart3 class="h-4 w-4" />
				{/if}
			</div>
			<div>
				<h2 class="font-display text-sm font-semibold text-foreground">
					{chartMode === 'scurve'
						? 'Curva S interactiva de ejecución (Earned Value Management)'
						: 'Flujo de desembolsos y retenciones por hito (MM COP)'}
				</h2>
				<p class="text-[11px] text-muted-foreground">
					Pasa el cursor sobre cualquier corte para inspeccionar valores exactos y haz clic en la leyenda para filtrar series.
				</p>
			</div>
		</div>

		<!-- Selector de vista de gráfico + Indicadores EVM -->
		<div class="flex flex-wrap items-center gap-2">
			<div class="inline-flex rounded-lg border border-border bg-muted/50 p-0.5">
				<button
					type="button"
					onclick={() => (chartMode = 'scurve')}
					class="cursor-pointer rounded-md px-2.5 py-1 text-[11px] font-medium whitespace-nowrap transition-colors {chartMode === 'scurve'
						? 'bg-foreground text-background shadow-2xs'
						: 'text-muted-foreground hover:text-foreground'}"
				>
					Curva S (%)
				</button>
				<button
					type="button"
					onclick={() => (chartMode = 'cashflow')}
					class="cursor-pointer rounded-md px-2.5 py-1 text-[11px] font-medium whitespace-nowrap transition-colors {chartMode === 'cashflow'
						? 'bg-foreground text-background shadow-2xs'
						: 'text-muted-foreground hover:text-foreground'}"
				>
					Flujo por hito ($)
				</button>
			</div>

			<span class="rounded-md border border-emerald-500/25 bg-emerald-500/10 px-2 py-1 font-mono text-[11px] font-semibold whitespace-nowrap text-emerald-600 dark:text-emerald-400">
				SPI: 1.05
			</span>
			<span class="rounded-md border border-border bg-muted/50 px-2 py-1 font-mono text-[11px] font-semibold whitespace-nowrap text-foreground">
				CPI: 1.03
			</span>
		</div>
	</div>

	<!-- Contenedor interactivo Chart.js -->
	<div class="relative my-4 h-[265px] w-full rounded-xl border border-border/60 bg-muted/10 p-3">
		<canvas bind:this={canvasEl}></canvas>
	</div>

	<div class="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3 text-xs">
		<span class="text-muted-foreground">
			Corte activo: <strong class="font-semibold text-foreground">Hito #4 (52.4% físico vs. 49.5% girado)</strong>
		</span>
		<span class="font-mono text-[11px] whitespace-nowrap text-emerald-600 dark:text-emerald-400">
			✓ Sin sobrecostos (Avance físico respalda el 100% del capital girado)
		</span>
	</div>
</div>

