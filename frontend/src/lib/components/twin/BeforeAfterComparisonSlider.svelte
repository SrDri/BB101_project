<script lang="ts">
	import { ShieldCheck, SlidersHorizontal, Sparkles, Calendar, CheckCircle2 } from '@lucide/svelte';

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
		aiDeltaNote: string;
	}

	const scenes: ComparisonScene[] = [
		{
			id: 'sala-balcon',
			label: '1. Sala-Comedor y Balcón',
			zoneName: 'Zona social y ventanería piso a techo',
			beforeCut: 'Corte #2 · Obra Gris',
			beforeDate: '2026-08-18',
			beforePercent: 28,
			beforeTitle: 'Fundición de losa, desencofre de vigas y parales de apuntalamiento',
			beforeImage:
				'https://images.unsplash.com/photo-1541888946425-d0fbb186156f?w=1200&auto=format&fit=crop&q=80',
			beforeHash: '8d192a47c3f0...4821f',
			afterCut: 'Corte #4 · Actual',
			afterDate: '2026-10-12',
			afterPercent: 85,
			afterTitle: 'Mampostería estucada, marco de ventanal acústico y nivelación de piso',
			afterImage:
				'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&auto=format&fit=crop&q=80',
			afterHash: 'a7c93e41b2e8...7849e',
			aiDeltaNote: '+57% de evolución física verificada por visión artificial entre Corte #2 y Corte #4.'
		},
		{
			id: 'cocina-redes',
			label: '2. Cocina e Hidrosanitarios',
			zoneName: 'Cocina abierta con isla y zona de ropas',
			beforeCut: 'Corte #2 · Redes base',
			beforeDate: '2026-08-22',
			beforePercent: 22,
			beforeTitle: 'Trazado de regatas, pases de losa y tubería hidrosanitaria expuesta',
			beforeImage:
				'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=1200&auto=format&fit=crop&q=80',
			beforeHash: '4b910e28a1c4...9102a',
			afterCut: 'Corte #4 · Actual',
			afterDate: '2026-10-12',
			afterPercent: 70,
			afterTitle: 'Pañete hidrófugo, prueba a 200 PSI aprobada y puntos eléctricos de isla',
			afterImage:
				'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=1200&auto=format&fit=crop&q=80',
			afterHash: 'a7c93e41b2e8...7849e',
			aiDeltaNote: '+48% de avance: cierre de regatas tras superar protocolo hidrostático ONAC.'
		},
		{
			id: 'alcoba-master',
			label: '3. Alcoba Principal y Baño',
			zoneName: 'Suite principal, walk-in closet y baño privado',
			beforeCut: 'Corte #2 · Mampostería',
			beforeDate: '2026-08-25',
			beforePercent: 18,
			beforeTitle: 'Replanteo de muros divisorios en bloque de arcilla y columnetas',
			beforeImage:
				'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=1200&auto=format&fit=crop&q=80',
			beforeHash: '9c102f83d4a1...3319b',
			afterCut: 'Corte #4 · Actual',
			afterDate: '2026-10-12',
			afterPercent: 60,
			afterTitle: 'Impermeabilización de ducha, ductos de extracción y estuco plástico',
			afterImage:
				'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=1200&auto=format&fit=crop&q=80',
			afterHash: 'a7c93e41b2e8...7849e',
			aiDeltaNote: '+42% de avance: mampostería 100% recibida por interventoría y alistamiento de enchapes.'
		},
		{
			id: 'fachada-torre',
			label: '4. Estructura General Torre',
			zoneName: 'Elevación estructural y cerramiento perimetral',
			beforeCut: 'Corte #2 · Nivel 2',
			beforeDate: '2026-08-15',
			beforePercent: 25,
			beforeTitle: 'Armado de acero y vaciado de columnas en primeros niveles',
			beforeImage:
				'https://images.unsplash.com/photo-1590674899484-d5640e854abe?w=1200&auto=format&fit=crop&q=80',
			beforeHash: '8d192a47c3f0...4821f',
			afterCut: 'Corte #4 · Nivel 4',
			afterDate: '2026-10-12',
			afterPercent: 52.4,
			afterTitle: 'Cuatro niveles estructurales fundidos, desencofrados y sellados en Stellar',
			afterImage:
				'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&auto=format&fit=crop&q=80',
			afterHash: 'a7c93e41b2e8...7849e',
			aiDeltaNote: '+27.4% en el global del edificio con 100% de cilindros de concreto aprobados.'
		}
	];

	let selectedSceneId = $state('sala-balcon');
	let sliderPercent = $state(52);

	const activeScene = $derived(
		scenes.find((s) => s.id === selectedSceneId) || scenes[0]
	);
</script>

<div class="overflow-hidden rounded-xl border border-border bg-card shadow-2xs">
	<!-- Cabecera del Comparador Antes vs. Después -->
	<div class="flex flex-col justify-between gap-3 border-b border-border bg-muted/15 px-5 py-4 lg:flex-row lg:items-center">
		<div class="flex items-center gap-2.5">
			<div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#F5A400]/30 bg-[#F5A400]/10 text-[#F5A400]">
				<SlidersHorizontal class="h-4 w-4" />
			</div>
			<div>
				<div class="flex flex-wrap items-center gap-2">
					<h3 class="font-display text-sm font-semibold text-foreground">
						Comparador Time-Lapse: Antes (Obra Gris) vs. Ahora (Avance Actual)
					</h3>
					<span class="rounded-md border border-border bg-background px-2 py-0.5 font-mono text-[10px] font-semibold whitespace-nowrap text-muted-foreground">
						{unitLabel}
					</span>
				</div>
				<p class="text-[11px] text-muted-foreground">
					Desliza la barra central de izquierda a derecha para contrastar la evolución constructiva real entre cortes sellados en Stellar.
				</p>
			</div>
		</div>

		<!-- Selector de Espacio / Ambiente -->
		<div class="flex flex-wrap items-center gap-1.5">
			{#each scenes as sc (sc.id)}
				<button
					type="button"
					onclick={() => (selectedSceneId = sc.id)}
					class="cursor-pointer rounded-lg px-2.5 py-1.5 text-xs font-medium whitespace-nowrap transition-colors {selectedSceneId === sc.id
						? 'bg-foreground text-background shadow-2xs'
						: 'border border-border bg-background text-muted-foreground hover:text-foreground'}"
				>
					{sc.label}
				</button>
			{/each}
		</div>
	</div>

	<div class="p-5 space-y-4">
		<!-- Visor Interactivo Split-Screen con Cortina Deslizante -->
		<div
			class="relative w-full select-none overflow-hidden rounded-xl border border-border bg-zinc-950 {compact
				? 'h-[310px] sm:h-[360px]'
				: 'h-[340px] sm:h-[420px]'}"
		>
			<!-- CAPA FONDO (DERECHA / DESPUÉS - CORTE #4 ACTUAL) -->
			<img
				src={activeScene.afterImage}
				alt={activeScene.afterTitle}
				class="h-full w-full object-cover"
				draggable="false"
			/>

			<!-- Overlay informativo lado DERECHO (AHORA - Corte #4) -->
			<div class="pointer-events-none absolute top-3.5 right-3.5 z-10 flex flex-col items-end gap-1">
				<span class="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/40 bg-zinc-950/85 px-3 py-1 text-xs font-semibold whitespace-nowrap text-emerald-400 backdrop-blur-md">
					<CheckCircle2 class="h-3.5 w-3.5" />
					AHORA · {activeScene.afterCut} ({activeScene.afterPercent}%)
				</span>
				<span class="rounded bg-zinc-950/75 px-2 py-0.5 font-mono text-[10px] whitespace-nowrap text-zinc-300 backdrop-blur-xs">
					{activeScene.afterDate} · Sello {activeScene.afterHash}
				</span>
			</div>

			<!-- CAPA RECORTADA (IZQUIERDA / ANTES - CORTE #2 OBRA GRIS) -->
			<div
				class="pointer-events-none absolute inset-0 overflow-hidden"
				style="clip-path: inset(0 {100 - sliderPercent}% 0 0);"
			>
				<img
					src={activeScene.beforeImage}
					alt={activeScene.beforeTitle}
					class="h-full w-full object-cover filter-[sepia(18%)_contrast(105%)_brightness(90%)]"
					draggable="false"
				/>
				<!-- Etiqueta superior izquierda (ANTES - Corte #2) -->
				<div class="absolute top-3.5 left-3.5 flex flex-col items-start gap-1">
					<span class="inline-flex items-center gap-1.5 rounded-lg border border-amber-500/40 bg-zinc-950/85 px-3 py-1 text-xs font-semibold whitespace-nowrap text-amber-400 backdrop-blur-md">
						<Calendar class="h-3.5 w-3.5" />
						ANTES · {activeScene.beforeCut} ({activeScene.beforePercent}%)
					</span>
					<span class="rounded bg-zinc-950/75 px-2 py-0.5 font-mono text-[10px] whitespace-nowrap text-zinc-300 backdrop-blur-xs">
						{activeScene.beforeDate} · Sello {activeScene.beforeHash}
					</span>
				</div>
			</div>

			<!-- LÍNEA DIVISORIA VERTICAL Y MANIJA CENTRAL -->
			<div
				class="pointer-events-none absolute inset-y-0 z-20 w-0.5 bg-white shadow-[0_0_12px_rgba(0,0,0,0.9)]"
				style="left: {sliderPercent}%;"
			>
				<div class="absolute top-1/2 -left-5 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white bg-zinc-950/90 text-white shadow-xl">
					<SlidersHorizontal class="h-4 w-4 text-[#F5A400]" />
				</div>
			</div>

			<!-- INPUT RANGE INVISIBLE QUE CAPTURA EL ARRASTRE EN TODO EL LIENZO -->
			<input
				type="range"
				min="4"
				max="96"
				step="1"
				bind:value={sliderPercent}
				aria-label="Deslizador de comparación Antes vs Después"
				class="absolute inset-0 z-30 h-full w-full cursor-ew-resize opacity-0"
			/>

			<!-- Barra inferior superpuesta con descripción comparativa -->
			<div class="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex flex-col justify-between gap-2 bg-gradient-to-t from-black/90 via-black/70 to-transparent p-4 text-xs text-white sm:flex-row sm:items-end">
				<div class="max-w-md">
					<span class="text-[10px] font-semibold tracking-wider text-amber-400 uppercase block">
						Estado en {activeScene.beforeCut}
					</span>
					<p class="font-medium text-zinc-200 line-clamp-1">{activeScene.beforeTitle}</p>
				</div>
				<div class="max-w-md sm:text-right">
					<span class="text-[10px] font-semibold tracking-wider text-emerald-400 uppercase block">
						Estado en {activeScene.afterCut}
					</span>
					<p class="font-medium text-white line-clamp-1">{activeScene.afterTitle}</p>
				</div>
			</div>
		</div>

		<!-- Pie de control rápido y dictamen de evolución IA -->
		<div class="flex flex-col justify-between gap-3 rounded-xl border border-border bg-muted/20 px-4 py-3 text-xs sm:flex-row sm:items-center">
			<div class="flex items-center gap-2 text-muted-foreground">
				<Sparkles class="h-4 w-4 shrink-0 text-[#F5A400]" />
				<span>
					<strong class="font-semibold text-foreground">{activeScene.zoneName}:</strong>
					{activeScene.aiDeltaNote}
				</span>
			</div>

			<div class="flex shrink-0 items-center gap-1.5">
				<button
					type="button"
					onclick={() => (sliderPercent = 88)}
					class="cursor-pointer rounded-md border border-border bg-background px-2.5 py-1 text-[11px] font-medium whitespace-nowrap text-foreground hover:bg-muted"
				>
					Ver Antes (Corte #2)
				</button>
				<button
					type="button"
					onclick={() => (sliderPercent = 50)}
					class="cursor-pointer rounded-md border border-border bg-background px-2.5 py-1 text-[11px] font-medium whitespace-nowrap text-foreground hover:bg-muted"
				>
					50% / 50%
				</button>
				<button
					type="button"
					onclick={() => (sliderPercent = 12)}
					class="cursor-pointer rounded-md border border-border bg-background px-2.5 py-1 text-[11px] font-medium whitespace-nowrap text-foreground hover:bg-muted"
				>
					Ver Ahora (Corte #4)
				</button>
			</div>
		</div>
	</div>
</div>

