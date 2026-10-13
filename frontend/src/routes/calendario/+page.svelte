<script lang="ts">
	import { onMount } from 'svelte';
	import { projectStore, formatCOP } from '$lib/stores/projectState.svelte';
	import type { ProjectCalendarEvent } from '$lib/types/twin';
	import {
		Calendar as CalendarIcon,
		Clock,
		Plus,
		ChevronLeft,
		ChevronRight,
		CheckCircle2,
		UserCheck,
		ArrowUpRight,
		Layers,
		LayoutGrid,
		ListFilter,
		CalendarRange,
		X
	} from '@lucide/svelte';

	const cut = $derived(projectStore.activeCut);
	const events = $derived(projectStore.calendarEvents);
	const milestones = $derived(projectStore.milestones);

	type EventFilter = 'todos' | 'corte_obra' | 'desembolso' | 'inspeccion' | 'legal' | 'entrega';
	let activeFilter = $state<EventFilter>('todos');
	let currentCalendarView = $state<'dayGridMonth' | 'timeGridWeek' | 'listMonth'>('dayGridMonth');
	let currentTitle = $state('Octubre 2026');

	const filteredEvents = $derived(
		events.filter((ev) => {
			if (activeFilter !== 'todos' && ev.category !== activeFilter) return false;
			return true;
		})
	);

	// Selected event in the right-hand Agenda Inspector (defaults to EVT-04 or first event)
	let selectedEventId = $state<string>('EVT-04');
	const activeEvent = $derived(
		events.find((e) => e.id === selectedEventId) || filteredEvents[0] || events[0]
	);

	// Modal to schedule a new event
	let showCreateModal = $state(false);
	let newEvtDate = $state('2026-10-16');
	let newEvtTitle = $state('');
	let newEvtCategory = $state<ProjectCalendarEvent['category']>('inspeccion');
	let newEvtResponsible = $state('Juan Jose Carabali (Interventoría)');
	let newEvtDescription = $state('');

	// Deterministic hours per category for TimeGridWeek & Agenda views
	function getEventTimeSlot(ev: ProjectCalendarEvent): { startHour: string; endHour: string; label: string } {
		if (ev.category === 'desembolso') return { startHour: '14:30:00', endHour: '16:00:00', label: '02:30 PM - 04:00 PM' };
		if (ev.category === 'inspeccion') return { startHour: '09:00:00', endHour: '11:30:00', label: '09:00 AM - 11:30 AM' };
		if (ev.category === 'corte_obra') return { startHour: '10:30:00', endHour: '12:30:00', label: '10:30 AM - 12:30 PM' };
		if (ev.category === 'legal') return { startHour: '11:00:00', endHour: '12:00:00', label: '11:00 AM - 12:00 PM' };
		return { startHour: '15:00:00', endHour: '17:00:00', label: '03:00 PM - 05:00 PM' };
	}

	function getCategoryColors(cat: ProjectCalendarEvent['category']) {
		if (cat === 'desembolso') {
			return { bg: '#10b981', border: '#059669', text: '#ffffff', dot: 'bg-emerald-500', badge: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/25' };
		}
		if (cat === 'inspeccion') {
			return { bg: '#0ea5e9', border: '#0284c7', text: '#ffffff', dot: 'bg-sky-500', badge: 'text-sky-600 dark:text-sky-400 bg-sky-500/10 border-sky-500/25' };
		}
		if (cat === 'corte_obra') {
			return { bg: '#f5a400', border: '#d97706', text: '#18181b', dot: 'bg-[#F5A400]', badge: 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/25' };
		}
		if (cat === 'legal') {
			return { bg: '#8b5cf6', border: '#7c3aed', text: '#ffffff', dot: 'bg-violet-500', badge: 'text-violet-600 dark:text-violet-400 bg-violet-500/10 border-violet-500/25' };
		}
		return { bg: '#52525b', border: '#3f3f46', text: '#ffffff', dot: 'bg-zinc-500', badge: 'text-muted-foreground bg-muted border-border' };
	}

	function eventTypeLabel(t: ProjectCalendarEvent['category']): string {
		if (t === 'corte_obra') return 'Corte de obra';
		if (t === 'desembolso') return 'Comité y desembolso';
		if (t === 'inspeccion') return 'Inspección NSR-10';
		if (t === 'legal') return 'Cumplimiento legal';
		return 'Entrega de unidades';
	}

	// FullCalendar instance reference
	let calendarEl: HTMLDivElement | undefined = $state();
	let calendarInstance: any = null;

	function buildFullCalendarEvents(list: ProjectCalendarEvent[]) {
		return list.map((ev) => {
			const slot = getEventTimeSlot(ev);
			const colors = getCategoryColors(ev.category);
			return {
				id: ev.id,
				title: ev.title,
				start: `${ev.date}T${slot.startHour}`,
				end: `${ev.date}T${slot.endHour}`,
				backgroundColor: colors.bg,
				borderColor: colors.border,
				textColor: colors.text,
				extendedProps: {
					rawEvent: ev
				}
			};
		});
	}

	onMount(() => {
		let destroyed = false;

		async function initCalendar() {
			const [{ Calendar }, dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin] =
				await Promise.all([
					import('@fullcalendar/core'),
					import('@fullcalendar/daygrid'),
					import('@fullcalendar/timegrid'),
					import('@fullcalendar/list'),
					import('@fullcalendar/interaction')
				]);

			if (destroyed || !calendarEl) return;

			calendarInstance = new Calendar(calendarEl, {
				plugins: [
					dayGridPlugin.default,
					timeGridPlugin.default,
					listPlugin.default,
					interactionPlugin.default
				],
				initialView: currentCalendarView,
				initialDate: '2026-10-12',
				locale: 'es',
				firstDay: 1,
				headerToolbar: false,
				height: 'auto',
				dayMaxEvents: 3,
				navLinks: true,
				nowIndicator: true,
				slotMinTime: '07:00:00',
				slotMaxTime: '19:00:00',
				allDaySlot: false,
				events: buildFullCalendarEvents(filteredEvents),
				datesSet: (info) => {
					const rawTitle = info.view.title;
					currentTitle = rawTitle.charAt(0).toUpperCase() + rawTitle.slice(1);
				},
				eventClick: (info) => {
					info.jsEvent.preventDefault();
					selectedEventId = info.event.id;
				},
				dateClick: (info) => {
					newEvtDate = info.dateStr.split('T')[0];
					showCreateModal = true;
				}
			});

			calendarInstance.render();
		}

		initCalendar();

		return () => {
			destroyed = true;
			if (calendarInstance) {
				calendarInstance.destroy();
			}
		};
	});

	// Reactive sync when filter or events change
	$effect(() => {
		const fcEvents = buildFullCalendarEvents(filteredEvents);
		if (calendarInstance) {
			calendarInstance.removeAllEvents();
			calendarInstance.addEventSource(fcEvents);
		}
	});

	function changeView(viewName: 'dayGridMonth' | 'timeGridWeek' | 'listMonth') {
		currentCalendarView = viewName;
		if (calendarInstance) {
			calendarInstance.changeView(viewName);
		}
	}

	function navigateCalendar(action: 'prev' | 'next' | 'today') {
		if (!calendarInstance) return;
		if (action === 'prev') calendarInstance.prev();
		else if (action === 'next') calendarInstance.next();
		else calendarInstance.gotoDate('2026-10-12');
	}

	function focusEventOnCalendar(ev: ProjectCalendarEvent) {
		selectedEventId = ev.id;
		if (calendarInstance) {
			calendarInstance.gotoDate(ev.date);
		}
	}

	function handleCreateEvent(e: Event) {
		e.preventDefault();
		if (!newEvtTitle.trim()) return;
		projectStore.addCalendarEvent({
			date: newEvtDate,
			title: newEvtTitle.trim(),
			category: newEvtCategory,
			responsible: newEvtResponsible.trim() || 'Comité Técnico',
			description:
				newEvtDescription.trim() ||
				'Actividad técnica programada en el cronograma maestro del proyecto.'
		});
		const created = projectStore.calendarEvents[projectStore.calendarEvents.length - 1];
		if (created) {
			selectedEventId = created.id;
			if (calendarInstance) {
				calendarInstance.gotoDate(created.date);
			}
		}
		showCreateModal = false;
		newEvtTitle = '';
		newEvtDescription = '';
	}

	const upcomingAndActiveEvents = $derived(
		filteredEvents.filter((e) => e.status === 'en_curso' || e.status === 'programado')
	);
	const completedEvents = $derived(
		filteredEvents.filter((e) => e.status === 'completado')
	);
</script>

<div class="mx-auto max-w-[1440px] space-y-6">
	<!-- Cabecera Ejecutiva del Calendario -->
	<div class="flex flex-col justify-between gap-4 border-b border-border pb-4 lg:flex-row lg:items-center">
		<div class="space-y-1">
			<div class="flex flex-wrap items-center gap-2">
				<span class="inline-flex items-center gap-1.5 rounded-md border border-border bg-muted/60 px-2.5 py-0.5 text-[11px] font-medium text-foreground">
					<span class="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
					Motor interactivo FullCalendar · Sincronizado con Soroban
				</span>
				<span class="text-xs text-muted-foreground tabular-nums">
					{cut.code} • {cut.projectName}
				</span>
			</div>
			<h1 class="font-display text-2xl font-semibold tracking-tight text-foreground">
				Calendario maestro y agenda ejecutiva de obra
			</h1>
			<p class="text-xs text-muted-foreground">
				Explora los cortes de obra en vista mensual, semana por horas o lista, e inspecciona cada hito en la agenda lateral.
			</p>
		</div>

		<div class="flex flex-wrap items-center gap-2">
			<button
				type="button"
				onclick={() => (showCreateModal = true)}
				class="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-foreground px-3.5 py-2 text-xs font-medium text-background shadow-2xs transition-opacity hover:opacity-90"
			>
				<Plus class="h-3.5 w-3.5" />
				<span>Programar actividad</span>
			</button>
			<a
				href="/fiduciaria"
				class="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3.5 py-2 text-xs font-medium text-foreground transition-colors hover:bg-accent"
			>
				<span>Ir a comité de desembolsos</span>
				<ArrowUpRight class="h-3.5 w-3.5 text-muted-foreground" />
			</a>
		</div>
	</div>

	<!-- Barra de Controles del Calendario + Filtros por Categoría -->
	<div class="flex flex-col justify-between gap-3 rounded-xl border border-border bg-card p-3.5 shadow-2xs xl:flex-row xl:items-center">
		<!-- Controles de navegación y vista de FullCalendar -->
		<div class="flex flex-wrap items-center gap-2">
			<div class="inline-flex items-center rounded-lg border border-border bg-background p-0.5">
				<button
					type="button"
					onclick={() => navigateCalendar('prev')}
					title="Mes / Semana anterior"
					class="cursor-pointer rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
				>
					<ChevronLeft class="h-4 w-4" />
				</button>
				<button
					type="button"
					onclick={() => navigateCalendar('today')}
					class="cursor-pointer px-2.5 py-1 text-xs font-medium text-foreground transition-colors hover:bg-muted"
				>
					Hoy (12 Oct)
				</button>
				<button
					type="button"
					onclick={() => navigateCalendar('next')}
					title="Mes / Semana siguiente"
					class="cursor-pointer rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
				>
					<ChevronRight class="h-4 w-4" />
				</button>
			</div>

			<span class="min-w-[140px] px-2 font-display text-sm font-semibold text-foreground">
				{currentTitle}
			</span>

			<!-- Conmutador de Vista: Mes / Semana / Lista -->
			<div class="inline-flex items-center rounded-lg border border-border bg-muted/40 p-1">
				<button
					type="button"
					onclick={() => changeView('dayGridMonth')}
					class="inline-flex cursor-pointer items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-all {currentCalendarView === 'dayGridMonth'
						? 'bg-foreground text-background shadow-2xs'
						: 'text-muted-foreground hover:text-foreground'}"
				>
					<LayoutGrid class="h-3.5 w-3.5" />
					<span>Mes</span>
				</button>
				<button
					type="button"
					onclick={() => changeView('timeGridWeek')}
					class="inline-flex cursor-pointer items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-all {currentCalendarView === 'timeGridWeek'
						? 'bg-foreground text-background shadow-2xs'
						: 'text-muted-foreground hover:text-foreground'}"
				>
					<CalendarRange class="h-3.5 w-3.5" />
					<span>Semana</span>
				</button>
				<button
					type="button"
					onclick={() => changeView('listMonth')}
					class="inline-flex cursor-pointer items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-all {currentCalendarView === 'listMonth'
						? 'bg-foreground text-background shadow-2xs'
						: 'text-muted-foreground hover:text-foreground'}"
				>
					<ListFilter class="h-3.5 w-3.5" />
					<span>Lista</span>
				</button>
			</div>
		</div>

		<!-- Filtros de categoría con punto de color -->
		<div class="flex flex-wrap items-center gap-1.5">
			{#each [
				{ id: 'todos', label: 'Todos', dot: '' },
				{ id: 'desembolso', label: 'Comités de giro', dot: 'bg-emerald-500' },
				{ id: 'inspeccion', label: 'Interventoría', dot: 'bg-sky-500' },
				{ id: 'corte_obra', label: 'Cortes de obra', dot: 'bg-[#F5A400]' },
				{ id: 'legal', label: 'Hitos legales', dot: 'bg-violet-500' },
				{ id: 'entrega', label: 'Entregas', dot: 'bg-zinc-500' }
			] as filter (filter.id)}
				<button
					type="button"
					onclick={() => (activeFilter = filter.id as EventFilter)}
					class="inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors {activeFilter === filter.id
						? 'bg-foreground text-background'
						: 'border border-border bg-background text-muted-foreground hover:text-foreground'}"
				>
					{#if filter.dot}
						<span class="h-2 w-2 rounded-full {filter.dot}"></span>
					{/if}
					<span>{filter.label}</span>
				</button>
			{/each}
		</div>
	</div>

	<!-- Layout Principal: Lienzo FullCalendar (8 cols) + Agenda Ejecutiva Interactiva (4 cols) -->
	<div class="grid grid-cols-1 items-start gap-6 xl:grid-cols-12">
		<!-- Columna Izquierda: FullCalendar (8 cols) -->
		<div class="overflow-hidden rounded-xl border border-border bg-card p-5 shadow-2xs xl:col-span-8">
			<div bind:this={calendarEl} class="tramo-fullcalendar min-h-[560px]"></div>
			<div class="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3 text-[11px] text-muted-foreground">
				<span>Haz clic sobre un evento para inspeccionar su ficha en la agenda lateral, o haz clic en un día vacío para programar una actividad.</span>
				<span class="font-mono text-foreground">{filteredEvents.length} actividades visibles</span>
			</div>
		</div>

		<!-- Columna Derecha: Agenda Ejecutiva + Inspector de Evento Seleccionado (4 cols) -->
		<div class="space-y-4 xl:col-span-4">
			<!-- 1. Inspector del Evento Seleccionado -->
			{#if activeEvent}
				{@const colors = getCategoryColors(activeEvent.category)}
				{@const slot = getEventTimeSlot(activeEvent)}
				<div class="rounded-xl border border-border bg-card p-5 shadow-2xs">
					<div class="flex items-center justify-between gap-2">
						<span class="inline-flex items-center gap-1.5 rounded-md border px-2.5 py-0.5 text-[11px] font-medium {colors.badge}">
							<span class="h-1.5 w-1.5 rounded-full {colors.dot}"></span>
							{eventTypeLabel(activeEvent.category)}
						</span>
						<span class="rounded-md bg-muted px-2 py-0.5 font-mono text-[11px] font-medium text-muted-foreground">
							{activeEvent.id}
						</span>
					</div>

					<h2 class="mt-3 font-display text-base font-bold text-foreground">
						{activeEvent.title}
					</h2>

					<div class="mt-2 flex flex-wrap items-center gap-3 font-mono text-xs text-muted-foreground">
						<span class="inline-flex items-center gap-1 text-foreground">
							<CalendarIcon class="h-3.5 w-3.5 text-muted-foreground" />
							{activeEvent.date}
						</span>
						<span>•</span>
						<span class="inline-flex items-center gap-1">
							<Clock class="h-3.5 w-3.5 text-muted-foreground" />
							{slot.label}
						</span>
					</div>

					<p class="mt-3 rounded-lg border border-border/80 bg-muted/30 p-3 text-xs leading-relaxed text-foreground">
						{activeEvent.description}
					</p>

					<div class="mt-3 grid grid-cols-2 gap-2.5 text-xs">
						<div class="rounded-lg border border-border bg-background p-2.5">
							<span class="text-[10px] font-medium text-muted-foreground uppercase">Responsable</span>
							<p class="mt-0.5 truncate font-semibold text-foreground">{activeEvent.responsible}</p>
						</div>
						<div class="rounded-lg border border-border bg-background p-2.5">
							<span class="text-[10px] font-medium text-muted-foreground uppercase">
								{activeEvent.amountCOP ? 'Monto asociado' : 'Estado'}
							</span>
							<p class="mt-0.5 font-mono font-semibold text-foreground capitalize">
								{activeEvent.amountCOP
									? formatCOP(activeEvent.amountCOP, true)
									: activeEvent.status.replace('_', ' ')}
							</p>
						</div>
					</div>

					{#if activeEvent.category === 'desembolso'}
						<div class="mt-3 pt-1">
							<a
								href="/fiduciaria"
								class="flex w-full items-center justify-center gap-1.5 rounded-lg bg-foreground px-3 py-2 text-xs font-medium text-background transition-opacity hover:opacity-90"
							>
								<span>Abrir comité fiduciario de desembolso</span>
								<ArrowUpRight class="h-3.5 w-3.5" />
							</a>
						</div>
					{/if}
				</div>
			{/if}

			<!-- 2. Línea de Tiempo de la Agenda Ejecutiva -->
			<div class="rounded-xl border border-border bg-card shadow-2xs">
				<div class="flex items-center justify-between border-b border-border px-5 py-3.5">
					<div>
						<h3 class="font-display text-sm font-semibold text-foreground">
							Agenda cronológica del proyecto
						</h3>
						<p class="text-[11px] text-muted-foreground">
							Secuencia ordenada de próximas actividades y cortes cerrados
						</p>
					</div>
				</div>

				<div class="max-h-[430px] space-y-5 overflow-y-auto p-5">
					<!-- Grupo 1: En curso y próximas -->
					{#if upcomingAndActiveEvents.length > 0}
						<div>
							<div class="mb-2.5 flex items-center justify-between">
								<span class="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
									En curso y próximas ({upcomingAndActiveEvents.length})
								</span>
							</div>

							<div class="relative space-y-2.5 border-l-2 border-border pl-4 ml-1.5">
								{#each upcomingAndActiveEvents as ev (ev.id)}
									{@const colors = getCategoryColors(ev.category)}
									{@const slot = getEventTimeSlot(ev)}
									{@const isSelected = activeEvent?.id === ev.id}
									<button
										type="button"
										onclick={() => focusEventOnCalendar(ev)}
										class="relative block w-full cursor-pointer rounded-xl border p-3 text-left transition-all {isSelected
											? 'border-foreground bg-accent/70 shadow-2xs'
											: 'border-border bg-background/60 hover:border-foreground/30 hover:bg-accent/30'}"
									>
										<!-- Nodo en la línea de tiempo -->
										<span
											class="absolute -left-[21px] top-4 h-2.5 w-2.5 rounded-full ring-4 ring-card {colors.dot}"
										></span>

										<div class="flex items-center justify-between gap-2 text-[11px]">
											<span class="font-mono font-semibold text-foreground">
												{ev.dayNumber} {ev.monthShort} · {slot.label.split('-')[0].trim()}
											</span>
											<span class="rounded px-1.5 py-0.5 text-[10px] font-medium {ev.status === 'en_curso' ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400' : 'bg-muted text-muted-foreground'}">
												{ev.status === 'en_curso' ? 'En curso hoy' : 'Programado'}
											</span>
										</div>

										<div class="mt-1 text-xs font-semibold text-foreground">
											{ev.title}
										</div>

										<div class="mt-1.5 flex items-center justify-between text-[11px] text-muted-foreground">
											<span class="truncate">{ev.responsible}</span>
											{#if ev.amountCOP}
												<span class="font-mono font-semibold text-emerald-600 dark:text-emerald-400">
													{formatCOP(ev.amountCOP, true)}
												</span>
											{/if}
										</div>
									</button>
								{/each}
							</div>
						</div>
					{/if}

					<!-- Grupo 2: Actividades completadas -->
					{#if completedEvents.length > 0}
						<div>
							<div class="mb-2.5 flex items-center justify-between">
								<span class="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
									Ejecutadas y verificadas ({completedEvents.length})
								</span>
							</div>

							<div class="relative space-y-2 border-l-2 border-border/60 pl-4 ml-1.5">
								{#each completedEvents as ev (ev.id)}
									{@const isSelected = activeEvent?.id === ev.id}
									<button
										type="button"
										onclick={() => focusEventOnCalendar(ev)}
										class="relative block w-full cursor-pointer rounded-xl border p-2.5 text-left transition-all {isSelected
											? 'border-foreground bg-accent/70'
											: 'border-border/70 bg-muted/20 hover:bg-accent/30'}"
									>
										<span class="absolute -left-[21px] top-3.5 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-4 ring-card"></span>
										<div class="flex items-center justify-between text-[11px]">
											<span class="font-mono text-muted-foreground">{ev.dayNumber} {ev.monthShort}</span>
											<span class="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
												<CheckCircle2 class="h-3 w-3" /> Completado
											</span>
										</div>
										<div class="mt-0.5 text-xs font-medium text-foreground">{ev.title}</div>
									</button>
								{/each}
							</div>
						</div>
					{/if}
				</div>
			</div>
		</div>
	</div>

	<!-- Ruta Crítica de Hitos Fiduciarios (Hito 1 a Hito 6) -->
	<div class="rounded-xl border border-border bg-card p-6 shadow-2xs">
		<div class="flex flex-col justify-between gap-2 border-b border-border pb-4 sm:flex-row sm:items-center">
			<div>
				<h2 class="font-display text-base font-semibold text-foreground">
					Ruta crítica de hitos fiduciarios de obra (Hito 1 a Hito 6)
				</h2>
				<p class="text-xs text-muted-foreground">
					Sincronización entre el avance del cronograma maestro y la liberación escalonada de recursos.
				</p>
			</div>
			<a
				href="/fiduciaria"
				class="text-xs font-semibold text-foreground underline decoration-border underline-offset-4 hover:decoration-foreground"
			>
				Gestionar aprobaciones en Fiduciaria →
			</a>
		</div>

		<div class="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-6">
			{#each milestones as m (m.id)}
				<div class="flex flex-col justify-between rounded-xl border border-border bg-muted/20 p-4">
					<div>
						<div class="flex items-center justify-between gap-1">
							<span class="font-mono text-xs font-bold text-foreground">Hito #{m.milestoneNumber}</span>
							<span class="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2 py-0.5 text-[10px] font-medium text-foreground">
								<span
									class="h-1.5 w-1.5 rounded-full {m.status === 'desembolsado'
										? 'bg-emerald-500'
										: m.status === 'listo_para_giro'
											? 'bg-amber-500'
											: m.status === 'en_ejecucion'
												? 'bg-sky-500'
												: 'bg-zinc-400'}"
								></span>
								{m.status === 'desembolsado'
									? 'Girado'
									: m.status === 'listo_para_giro'
										? 'En comité'
										: m.status === 'en_ejecucion'
											? 'En obra'
											: 'Programado'}
							</span>
						</div>
						<h3 class="mt-2 font-display text-xs font-semibold text-foreground">
							{m.title}
						</h3>
						<p class="mt-1 text-[11px] text-muted-foreground">Corte #{m.cutNumber} · {m.dueDate}</p>
					</div>

					<div class="mt-4 border-t border-border pt-2.5">
						<div class="flex items-baseline justify-between text-[11px]">
							<span class="text-muted-foreground">Giro neto:</span>
							<span class="font-mono font-semibold text-foreground">{formatCOP(m.netDisbursementCOP, true)}</span>
						</div>
						<div class="mt-1 flex items-baseline justify-between text-[10px] text-muted-foreground">
							<span>Avance físico:</span>
							<span class="font-mono font-medium text-foreground">{m.certifiedPhysicalPercent}% / {m.targetPhysicalPercent}%</span>
						</div>
					</div>
				</div>
			{/each}
		</div>
	</div>
</div>

<!-- MODAL PARA PROGRAMAR NUEVA ACTIVIDAD EN EL CALENDARIO -->
{#if showCreateModal}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
		role="dialog"
		aria-modal="true"
	>
		<div class="flex w-[95vw] max-w-lg flex-col overflow-hidden rounded-2xl border border-border bg-card text-card-foreground shadow-2xl">
			<div class="flex items-center justify-between border-b border-border px-6 py-4">
				<div>
					<h3 class="font-display text-base font-bold text-foreground">
						Programar actividad en el calendario
					</h3>
					<p class="text-xs text-muted-foreground">
						Se agregará de inmediato al motor FullCalendar y a la agenda ejecutiva.
					</p>
				</div>
				<button
					type="button"
					onclick={() => (showCreateModal = false)}
					class="cursor-pointer rounded-lg border border-border p-1.5 text-muted-foreground hover:bg-muted"
				>
					<X class="h-4 w-4" />
				</button>
			</div>

			<form onsubmit={handleCreateEvent} class="space-y-4 p-6 text-xs">
				<div>
					<label for="evt-title" class="block font-semibold text-foreground">
						Título de la actividad o hito *
					</label>
					<input
						id="evt-title"
						type="text"
						required
						bind:value={newEvtTitle}
						placeholder="Ej. Ensayo de esclerometría y núcleos Piso 5"
						class="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none"
					/>
				</div>

				<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
					<div>
						<label for="evt-date" class="block font-semibold text-foreground">
							Fecha programada *
						</label>
						<input
							id="evt-date"
							type="date"
							required
							bind:value={newEvtDate}
							class="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 font-mono text-sm text-foreground focus:outline-none"
						/>
					</div>

					<div>
						<label for="evt-cat" class="block font-semibold text-foreground">
							Tipo de evento
						</label>
						<select
							id="evt-cat"
							bind:value={newEvtCategory}
							class="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none"
						>
							<option value="inspeccion">Inspección interventoría</option>
							<option value="corte_obra">Corte de obra</option>
							<option value="desembolso">Comité y desembolso</option>
							<option value="legal">Cumplimiento legal</option>
							<option value="entrega">Entrega de unidades</option>
						</select>
					</div>
				</div>

				<div>
					<label for="evt-resp" class="block font-semibold text-foreground">
						Entidad / Profesional responsable
					</label>
					<input
						id="evt-resp"
						type="text"
						bind:value={newEvtResponsible}
						class="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none"
					/>
				</div>

				<div>
					<label for="evt-desc" class="block font-semibold text-foreground">
						Descripción y alcance técnico
					</label>
					<textarea
						id="evt-desc"
						rows="3"
						bind:value={newEvtDescription}
						placeholder="Detalle las pruebas, actas o revisiones a realizar..."
						class="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none"
					></textarea>
				</div>

				<div class="flex items-center justify-end gap-2 border-t border-border pt-4">
					<button
						type="button"
						onclick={() => (showCreateModal = false)}
						class="cursor-pointer rounded-lg border border-border bg-background px-4 py-2 text-xs font-medium text-foreground hover:bg-muted"
					>
						Cancelar
					</button>
					<button
						type="submit"
						class="cursor-pointer rounded-lg bg-foreground px-4 py-2 text-xs font-medium text-background hover:opacity-90"
					>
						Guardar en calendario
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}

<style>
	/* Estilos Enterprise para FullCalendar adaptados a modo claro y oscuro de Tramo */
	:global(.tramo-fullcalendar) {
		--fc-border-color: var(--border);
		--fc-page-bg-color: transparent;
		--fc-neutral-bg-color: var(--muted);
		--fc-list-event-hover-bg-color: var(--accent);
		--fc-today-bg-color: rgba(16, 185, 129, 0.08);
		font-family: var(--font-sans);
	}
	:global(.tramo-fullcalendar .fc-col-header-cell) {
		padding: 8px 0;
		font-size: 11px;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--muted-foreground);
		background-color: transparent;
	}
	:global(.tramo-fullcalendar .fc-daygrid-day-number) {
		font-family: var(--font-mono);
		font-size: 12px;
		font-weight: 600;
		padding: 6px 8px;
		color: var(--foreground);
	}
	:global(.tramo-fullcalendar .fc-daygrid-day) {
		transition: background-color 0.15s ease;
		cursor: pointer;
	}
	:global(.tramo-fullcalendar .fc-daygrid-day:hover) {
		background-color: color-mix(in srgb, var(--accent) 45%, transparent);
	}
	:global(.tramo-fullcalendar .fc-event) {
		border-radius: 6px;
		padding: 2px 5px;
		font-size: 11px;
		font-weight: 600;
		cursor: pointer;
		box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08);
	}
	:global(.tramo-fullcalendar .fc-timegrid-slot-label-cushion),
	:global(.tramo-fullcalendar .fc-list-day-text),
	:global(.tramo-fullcalendar .fc-list-day-side-text) {
		font-size: 11px;
		font-family: var(--font-mono);
		color: var(--foreground);
	}
	:global(.tramo-fullcalendar .fc-list) {
		border-radius: 10px;
		overflow: hidden;
	}
</style>
