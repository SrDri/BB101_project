<script lang="ts">
	import { ChevronsLeftRight } from '@lucide/svelte';

	let {
		unitLabel = 'Apto 402 · Nivel 4',
		compact = false
	}: {
		unitLabel?: string;
		compact?: boolean;
	} = $props();

	interface ComparisonScene {
		id: string;
		label: string;
		zoneName: string;
		beforeCut: string;
		beforeDate: string;
		beforePercent: number;
		beforeTitle: string;
		beforeImage: string;
		beforeHash: string;
		afterCut: string;
		afterDate: string;
		afterPercent: number;
		afterTitle: string;
		afterImage: string;
		afterHash: string;
		technicalNote: string;
	}

	const scenes: ComparisonScene[] = [
		{
			id: 'sala-balcon',
			label: 'Sala-Comedor y Balcón',
			zoneName: 'Zona social y ventanería piso a techo',
			beforeCut: 'Corte #2 · Obra gris',
			beforeDate: '2026-08-18',
			beforePercent: 28,
			beforeTitle: 'Fundición de losa, desencofre de vigas y parales de apuntalamiento',
			beforeImage:
				'https://lh3.googleusercontent.com/d/1Kp-8B22PuBpFKfpF5RxVrd_PpG1TC9Jl=w1600',
			beforeHash: '8d192a47c3f0...4821f',
			afterCut: 'Corte #4 · Actual',
			afterDate: '2026-10-12',
			afterPercent: 85,
			afterTitle: 'Mampostería estucada, marco de ventanal acústico y nivelación de piso',
			afterImage:
				'https://lh3.googleusercontent.com/d/1hxW0B3feomD0CZ8FvMPF9XGfR6PzJ_tN=w1600',
			afterHash: 'a7c93e41b2e8...7849e',
			technicalNote: 'Variación física certificada de +57.0 puntos porcentuales entre el Corte #2 y el Corte #4.'
		},
		{
			id: 'cocina-redes',
			label: 'Cocina e Hidrosanitarios',
			zoneName: 'Cocina abierta con isla y zona de ropas',
			beforeCut: 'Corte #2 · Redes base',
			beforeDate: '2026-08-22',
			beforePercent: 22,
			beforeTitle: 'Trazado de regatas, pases de losa y tubería hidrosanitaria expuesta',
			beforeImage:
				'https://lh3.googleusercontent.com/d/1H2kaVQGKbuMmEA1QcrOjWbodzDCq-jOd=w1600',
			beforeHash: '4b910e28a1c4...9102a',
			afterCut: 'Corte #4 · Actual',
			afterDate: '2026-10-12',
			afterPercent: 70,
			afterTitle: 'Pañete hidrófugo, prueba a 200 PSI aprobada y puntos eléctricos de isla',
			afterImage:
				'https://lh3.googleusercontent.com/d/1Z4Xoaeemx9XhqktcsrUA5qIUc2pNhbQ4=w1600',
			afterHash: 'a7c93e41b2e8...7849e',
			technicalNote: 'Cierre de regatas y pañete tras aprobación del protocolo de estanqueidad y presión (ONAC).'
		},
		{
			id: 'alcoba-master',
			label: 'Alcoba Principal y Baño',
			zoneName: 'Suite principal, walk-in closet y baño privado',
			beforeCut: 'Corte #2 · Mampostería',
			beforeDate: '2026-08-25',
			beforePercent: 18,
			beforeTitle: 'Replanteo de muros divisorios en bloque de arcilla y columnetas',
			beforeImage:
				'https://lh3.googleusercontent.com/d/1faR4XSvGxDfiiHt1gyAlDAhacEIuiAtC=w1600',
			beforeHash: '9c102f83d4a1...3319b',
			afterCut: 'Corte #4 · Actual',
			afterDate: '2026-10-12',
			afterPercent: 60,
			afterTitle: 'Impermeabilización de ducha, ductos de extracción y estuco plástico',
			afterImage:
				'https://lh3.googleusercontent.com/d/1Vhy6LnJrQtPqGwvc_WpJD3HQ50jDdP4r=w1600',
			afterHash: 'a7c93e41b2e8...7849e',
			technicalNote: 'Mampostería recibida al 100% por interventoría y alistamiento de superficies para enchape.'
		},
		{
			id: 'fachada-torre',
			label: 'Estructura General',
			zoneName: 'Elevación estructural y cerramiento perimetral',
			beforeCut: 'Corte #2 · Nivel 2',
			beforeDate: '2026-08-15',
			beforePercent: 25,
			beforeTitle: 'Armado de acero y vaciado de columnas en primeros niveles',
			beforeImage:
				'https://lh3.googleusercontent.com/d/1iCa9-A_O96Nj2uv4FUOShiGXlEAbLXRg=w1600',
			beforeHash: '8d192a47c3f0...4821f',
			afterCut: 'Corte #4 · Nivel 4',
			afterDate: '2026-10-12',
			afterPercent: 52.4,
			afterTitle: 'Cuatro niveles estructurales fundidos, desencofrados y certificados',
			afterImage:
				'https://lh3.googleusercontent.com/d/1P-UKxizly3GpUDdolvOFCVllsdJAxYsM=w1600',
			afterHash: 'a7c93e41b2e8...7849e',
			technicalNote: 'Avance estructural acumulado de +27.4% con ensayos de resistencia de concreto aprobados.'
		}
	];

	let selectedSceneId = $state('sala-balcon');
	let sliderPercent = $state(50);

	const activeScene = $derived(
		scenes.find((s) => s.id === selectedSceneId) || scenes[0]
	);
</script>

<div class="overflow-hidden rounded-xl border border-border bg-card">
	<!-- Cabecera limpia y corporativa -->
	<div class="flex flex-col justify-between gap-3 border-b border-border px-5 py-4 lg:flex-row lg:items-center">
		<div class="space-y-0.5">
			<div class="flex flex-wrap items-center gap-2">
				<h3 class="text-sm font-semibold text-foreground">
					Registro comparativo de avance físico
				</h3>
				<span class="rounded border border-border bg-muted/50 px-2 py-0.5 font-mono text-[11px] font-medium whitespace-nowrap text-muted-foreground">
					{unitLabel}
				</span>
			</div>
			<p class="text-xs text-muted-foreground">
				Contraste fotográfico de interventoría entre el estado inicial de obra gris y el corte vigente.
			</p>
		</div>

		<!-- Selector de ambiente tipo control segmentado sobrio (2x2 en móvil, fila en escritorio) -->
		<div class="grid grid-cols-2 sm:inline-flex sm:flex-wrap items-center gap-1 rounded-lg border border-border bg-muted/40 p-1 w-full sm:w-auto">
			{#each scenes as sc (sc.id)}
				<button
					type="button"
					onclick={() => (selectedSceneId = sc.id)}
					class="cursor-pointer rounded-md px-2 sm:px-2.5 py-1.5 sm:py-1 text-[11px] sm:text-xs font-medium truncate text-center transition-colors {selectedSceneId === sc.id
						? 'bg-background text-foreground shadow-2xs border border-border/60'
						: 'text-muted-foreground hover:text-foreground'}"
				>
					{sc.label}
				</button>
			{/each}
		</div>
	</div>

	<!-- Lienzo comparador sin saturación ni elementos neón -->
	<div
		class="relative w-full select-none overflow-hidden bg-zinc-950 {compact
			? 'h-[260px] sm:h-[380px]'
			: 'h-[280px] sm:h-[440px]'}"
	>
		<!-- CAPA DERECHA (ESTADO ACTUAL - CORTE #4) -->
		<img
			src={activeScene.afterImage}
			alt={activeScene.afterTitle}
			referrerpolicy="no-referrer"
			class="h-full w-full object-cover"
			draggable="false"
		/>

		<!-- Etiqueta discreta superior derecha (Estado actual) -->
		<div class="pointer-events-none absolute top-2.5 right-2.5 sm:top-3.5 sm:right-3.5 z-10">
			<div class="inline-flex items-center gap-1.5 sm:gap-2 rounded-md border border-white/15 bg-zinc-950/75 px-2 sm:px-2.5 py-1 text-[10px] sm:text-[11px] font-medium text-white backdrop-blur-md">
				<span class="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
				<span>{activeScene.afterCut}</span>
				<span class="font-mono text-zinc-300 tabular-nums">{activeScene.afterPercent}%</span>
			</div>
		</div>

		<!-- CAPA IZQUIERDA RECORTADA (ESTADO ANTERIOR - CORTE #2) -->
		<div
			class="pointer-events-none absolute inset-0 overflow-hidden"
			style="clip-path: inset(0 {100 - sliderPercent}% 0 0);"
		>
			<img
				src={activeScene.beforeImage}
				alt={activeScene.beforeTitle}
				referrerpolicy="no-referrer"
				class="h-full w-full object-cover"
				draggable="false"
			/>

			<!-- Etiqueta discreta superior izquierda (Estado anterior) -->
			<div class="absolute top-2.5 left-2.5 sm:top-3.5 sm:left-3.5">
				<div class="inline-flex items-center gap-1.5 sm:gap-2 rounded-md border border-white/15 bg-zinc-950/75 px-2 sm:px-2.5 py-1 text-[10px] sm:text-[11px] font-medium text-zinc-100 backdrop-blur-md">
					<span class="h-1.5 w-1.5 rounded-full bg-zinc-400"></span>
					<span>{activeScene.beforeCut}</span>
					<span class="font-mono text-zinc-300 tabular-nums">{activeScene.beforePercent}%</span>
				</div>
			</div>
		</div>

		<!-- LÍNEA DIVISORIA SUTIL Y CONTROL TÁCTIL NEUTRO -->
		<div
			class="pointer-events-none absolute inset-y-0 z-20 w-[1.5px] bg-white/90 shadow-[0_0_8px_rgba(0,0,0,0.45)]"
			style="left: {sliderPercent}%;"
		>
			<div class="absolute top-1/2 -left-[18px] flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-800 shadow-md">
				<ChevronsLeftRight class="h-4 w-4" />
			</div>
		</div>

		<!-- INPUT RANGE INVISIBLE PARA ARRASTRAR -->
		<input
			type="range"
			min="4"
			max="96"
			step="1"
			bind:value={sliderPercent}
			aria-label="Deslizador de comparación Antes vs Después"
			class="absolute inset-0 z-30 h-full w-full cursor-ew-resize opacity-0 touch-pan-y"
		/>
	</div>

	<!-- Ficha técnica comparativa estructurada en 2 columnas debajo de la imagen -->
	<div class="grid grid-cols-1 divide-y divide-border border-t border-border bg-muted/10 md:grid-cols-2 md:divide-x md:divide-y-0">
		<div class="p-4 space-y-1">
			<div class="flex items-center justify-between text-[11px] text-muted-foreground">
				<span class="font-medium uppercase tracking-wider">Registro base · {activeScene.beforeCut}</span>
				<span class="font-mono tabular-nums">{activeScene.beforeDate} · {activeScene.beforePercent}%</span>
			</div>
			<p class="text-xs font-medium text-foreground">{activeScene.beforeTitle}</p>
			<div class="font-mono text-[10px] text-muted-foreground">
				SHA-256: {activeScene.beforeHash}
			</div>
		</div>

		<div class="p-4 space-y-1">
			<div class="flex items-center justify-between text-[11px] text-muted-foreground">
				<span class="font-medium uppercase tracking-wider text-foreground">Registro vigente · {activeScene.afterCut}</span>
				<span class="font-mono font-medium text-emerald-600 dark:text-emerald-400 tabular-nums">
					{activeScene.afterDate} · {activeScene.afterPercent}% (+{(activeScene.afterPercent - activeScene.beforePercent).toFixed(1)}%)
				</span>
			</div>
			<p class="text-xs font-medium text-foreground">{activeScene.afterTitle}</p>
			<div class="font-mono text-[10px] text-muted-foreground">
				SHA-256: {activeScene.afterHash}
			</div>
		</div>
	</div>

	<!-- Barra inferior de notas de inspección y atajos de posición -->
	<div class="flex flex-col justify-between gap-3 border-t border-border bg-muted/25 px-4 py-2.5 text-xs sm:flex-row sm:items-center">
		<div class="text-muted-foreground">
			<span class="font-medium text-foreground">{activeScene.zoneName}:</span>
			{activeScene.technicalNote}
		</div>

		<div class="flex shrink-0 items-center gap-1">
			<button
				type="button"
				onclick={() => (sliderPercent = 90)}
				class="cursor-pointer rounded border border-border bg-background px-2 py-1 text-[11px] font-medium whitespace-nowrap text-muted-foreground transition-colors hover:text-foreground"
			>
				Corte #2
			</button>
			<button
				type="button"
				onclick={() => (sliderPercent = 50)}
				class="cursor-pointer rounded border border-border bg-background px-2 py-1 text-[11px] font-medium whitespace-nowrap text-muted-foreground transition-colors hover:text-foreground"
			>
				50 / 50
			</button>
			<button
				type="button"
				onclick={() => (sliderPercent = 10)}
				class="cursor-pointer rounded border border-border bg-background px-2 py-1 text-[11px] font-medium whitespace-nowrap text-muted-foreground transition-colors hover:text-foreground"
			>
				Corte #4
			</button>
		</div>
	</div>
</div>


