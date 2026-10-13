<script lang="ts">
	import { projectStore } from '$lib/stores/projectState.svelte';
	import type { MandatoryDocument } from '$lib/types/twin';
	import {
		FileCheck2,
		ShieldCheck,
		Building2,
		HardHat,
		Search,
		Plus,
		CheckCircle2,
		ArrowUpRight,
		FileText,
		Lock,
		Calendar,
		X
	} from '@lucide/svelte';

	const cut = $derived(projectStore.activeCut);
	const ficha = $derived(projectStore.activeFicha);
	const complianceList = $derived(projectStore.legalCompliance);
	const docsList = $derived(projectStore.mandatoryDocs);

	const constructoraCompliance = $derived(
		complianceList.filter((item) => item.entityType === 'constructora')
	);
	const interventorCompliance = $derived(
		complianceList.filter((item) => item.entityType === 'interventor')
	);

	// Clean view tabs: 'documentos' (Master-Detail clean explorer) vs 'entidades' (Constructora & Interventor compliance)
	let activeSectionTab = $state<'documentos' | 'entidades'>('documentos');

	type DocCategoryFilter = 'todos' | 'licencias' | 'polizas' | 'fiduciarios' | 'tecnicos';
	let activeCategory = $state<DocCategoryFilter>('todos');
	let searchQuery = $state('');

	const filteredDocs = $derived(
		docsList.filter((doc) => {
			if (activeCategory !== 'todos' && doc.category !== activeCategory) return false;
			if (searchQuery.trim() !== '') {
				const q = searchQuery.toLowerCase();
				return (
					doc.title.toLowerCase().includes(q) ||
					doc.issuer.toLowerCase().includes(q) ||
					doc.documentNumber.toLowerCase().includes(q)
				);
			}
			return true;
		})
	);

	// Selected document in the right-hand inspector panel
	let selectedDocId = $state<string>('DOC-LIC-01');
	const inspectedDoc = $derived(
		filteredDocs.find((d) => d.id === selectedDocId) || filteredDocs[0] || docsList[0]
	);

	let showUploadModal = $state(false);

	// New document form state
	let newDocTitle = $state('');
	let newDocCategory = $state<MandatoryDocument['category']>('licencias');
	let newDocIssuer = $state('');
	let newDocNumber = $state('');
	let newDocExpiry = $state('2027-10-12');
	let newDocResponsible = $state<MandatoryDocument['responsibleEntity']>('Constructora');
	let newDocSummary = $state('');

	function handleUploadDocument(e: Event) {
		e.preventDefault();
		if (!newDocTitle.trim() || !newDocIssuer.trim()) return;

		projectStore.addMandatoryDocument({
			title: newDocTitle.trim(),
			category: newDocCategory,
			issuer: newDocIssuer.trim(),
			documentNumber:
				newDocNumber.trim() || `RAD-2026-${Math.floor(1000 + Math.random() * 9000)}`,
			issueDate: '2026-10-12',
			expiryDate: newDocExpiry || 'Permanente',
			responsibleEntity: newDocResponsible,
			summary:
				newDocSummary.trim() ||
				'Documento obligatorio radicado por la constructora y sellado criptográficamente en el expediente fiduciario.'
		});

		const newest = projectStore.mandatoryDocs[0];
		if (newest) {
			selectedDocId = newest.id;
		}
		showUploadModal = false;
		newDocTitle = '';
		newDocIssuer = '';
		newDocNumber = '';
		newDocSummary = '';
	}

	function categoryLabel(cat: MandatoryDocument['category']): string {
		if (cat === 'licencias') return 'Licencia urbanística';
		if (cat === 'polizas') return 'Póliza y garantías';
		if (cat === 'fiduciarios') return 'Contrato fiduciario';
		return 'Estudio y norma técnica';
	}
</script>

<div class="mx-auto max-w-[1440px] space-y-6">
	<!-- 1. Cabecera Minimalista con Conmutador de Vista y Estado Global -->
	<div class="flex flex-col justify-between gap-4 border-b border-border pb-4 lg:flex-row lg:items-center">
		<div class="space-y-1">
			<div class="flex flex-wrap items-center gap-2">
				<span class="inline-flex items-center gap-1.5 rounded-md border border-border bg-muted/60 px-2.5 py-0.5 text-[11px] font-medium text-foreground">
					<span class="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
					Ley 1796 de 2016 · Debida diligencia al 100%
				</span>
				<span class="text-xs text-muted-foreground tabular-nums">
					{cut.code} • {cut.projectName}
				</span>
			</div>
			<h1 class="font-display text-2xl font-semibold tracking-tight text-foreground">
				Cumplimiento legal y expediente documental
			</h1>
			<p class="text-xs text-muted-foreground">
				Consulta de forma limpia los documentos obligatorios radicados y la habilitación jurídica de la constructora e interventoría.
			</p>
		</div>

		<div class="flex flex-wrap items-center gap-2">
			<!-- Conmutador limpio entre Expediente Documental y Cumplimiento de Entidades -->
			<div class="inline-flex rounded-xl border border-border bg-muted/40 p-1">
				<button
					type="button"
					onclick={() => (activeSectionTab = 'documentos')}
					class="inline-flex cursor-pointer items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-medium transition-all {activeSectionTab === 'documentos'
						? 'bg-foreground text-background shadow-2xs'
						: 'text-muted-foreground hover:text-foreground'}"
				>
					<FileText class="h-3.5 w-3.5" />
					<span>Documentos obligatorios ({docsList.length})</span>
				</button>
				<button
					type="button"
					onclick={() => (activeSectionTab = 'entidades')}
					class="inline-flex cursor-pointer items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-medium transition-all {activeSectionTab === 'entidades'
						? 'bg-foreground text-background shadow-2xs'
						: 'text-muted-foreground hover:text-foreground'}"
				>
					<ShieldCheck class="h-3.5 w-3.5" />
					<span>Cumplimiento constructora e interventor ({complianceList.length})</span>
				</button>
			</div>

			<button
				type="button"
				onclick={() => (showUploadModal = true)}
				class="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-foreground px-3.5 py-2 text-xs font-medium text-background shadow-2xs transition-opacity hover:opacity-90"
			>
				<Plus class="h-3.5 w-3.5" />
				<span>Radicar documento</span>
			</button>
		</div>
	</div>

	<!-- 2. Cinta compacta de estado jurídico (sin saturar la pantalla) -->
	<div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
		<div class="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3.5">
			<div class="flex items-center gap-3 min-w-0">
				<div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-muted/50">
					<Building2 class="h-4 w-4 text-foreground" />
				</div>
				<div class="min-w-0">
					<div class="text-[11px] text-muted-foreground">Constructora titular</div>
					<div class="truncate text-xs font-semibold text-foreground">{ficha.developerProfile.name}</div>
				</div>
			</div>
			<span class="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
				<CheckCircle2 class="h-3.5 w-3.5" />
				SARLAFT y pólizas al día
			</span>
		</div>

		<div class="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3.5">
			<div class="flex items-center gap-3 min-w-0">
				<div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-muted/50">
					<HardHat class="h-4 w-4 text-foreground" />
				</div>
				<div class="min-w-0">
					<div class="text-[11px] text-muted-foreground">Supervisor técnico independiente</div>
					<div class="truncate text-xs font-semibold text-foreground">{ficha.supervisorProfile.companyName}</div>
				</div>
			</div>
			<span class="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
				<CheckCircle2 class="h-3.5 w-3.5" />
				COPNIA e independencia
			</span>
		</div>

		<div class="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3.5">
			<div class="flex items-center gap-3 min-w-0">
				<div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-muted/50">
					<FileCheck2 class="h-4 w-4 text-foreground" />
				</div>
				<div class="min-w-0">
					<div class="text-[11px] text-muted-foreground">Habilitación para desembolsos</div>
					<div class="truncate text-xs font-semibold text-foreground">{cut.fiduciaryEntity}</div>
				</div>
			</div>
			<a
				href="/fiduciaria"
				class="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-foreground hover:underline"
			>
				<span>Ir a giros</span>
				<ArrowUpRight class="h-3.5 w-3.5" />
			</a>
		</div>
	</div>

	<!-- ========================================================================= -->
	<!-- VISTA A: EXPEDIENTE DE DOCUMENTOS OBLIGATORIOS (Master-Detail Limpio)     -->
	<!-- ========================================================================= -->
	{#if activeSectionTab === 'documentos'}
		<div class="grid grid-cols-1 items-start gap-6 xl:grid-cols-12">
			<!-- Columna Izquierda (7 cols): Lista limpia y filtrable de documentos -->
			<div class="rounded-xl border border-border bg-card shadow-2xs xl:col-span-7 overflow-hidden">
				<!-- Barra de búsqueda y píldoras de categoría -->
				<div class="space-y-3 border-b border-border p-4">
					<div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
						<div class="relative flex-1">
							<Search class="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
							<input
								type="search"
								bind:value={searchQuery}
								placeholder="Filtrar por nombre de documento, curaduría, aseguradora o radicado..."
								class="w-full rounded-lg border border-border bg-background py-1.5 pr-3 pl-8 text-xs text-foreground placeholder-muted-foreground focus:outline-none"
							/>
						</div>
					</div>

					<div class="flex flex-wrap items-center gap-1.5">
						{#each [
							{ id: 'todos', label: 'Todos' },
							{ id: 'licencias', label: 'Licencias urbanísticas' },
							{ id: 'polizas', label: 'Pólizas Ley 1796' },
							{ id: 'fiduciarios', label: 'Contratos fiduciarios' },
							{ id: 'tecnicos', label: 'Estudios técnicos' }
						] as tab (tab.id)}
							<button
								type="button"
								onclick={() => (activeCategory = tab.id as DocCategoryFilter)}
								class="cursor-pointer rounded-lg px-2.5 py-1 text-xs font-medium transition-colors {activeCategory === tab.id
									? 'bg-foreground text-background'
									: 'bg-muted/50 text-muted-foreground hover:text-foreground'}"
							>
								{tab.label}
							</button>
						{/each}
					</div>
				</div>

				<!-- Lista limpia de documentos (Master List) -->
				<div class="divide-y divide-border">
					{#each filteredDocs as doc (doc.id)}
						{@const isSelected = inspectedDoc?.id === doc.id}
						<button
							type="button"
							onclick={() => (selectedDocId = doc.id)}
							class="flex w-full cursor-pointer items-center justify-between gap-4 px-5 py-3.5 text-left transition-colors {isSelected
								? 'bg-accent/70'
								: 'hover:bg-muted/40'}"
						>
							<div class="flex items-start gap-3.5 min-w-0">
								<div
									class="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition-colors {isSelected
										? 'border-foreground bg-foreground text-background'
										: 'border-border bg-muted/40 text-muted-foreground'}"
								>
									<FileText class="h-4 w-4" />
								</div>

								<div class="min-w-0">
									<div class="flex flex-wrap items-center gap-2">
										<span class="truncate text-sm font-semibold text-foreground">
											{doc.title}
										</span>
									</div>
									<div class="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
										<span>{doc.issuer}</span>
										<span>•</span>
										<span class="font-mono text-[11px] text-foreground/80">{doc.documentNumber}</span>
									</div>
								</div>
							</div>

							<div class="flex shrink-0 flex-col items-end gap-1">
								<span class="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2 py-0.5 text-[11px] font-medium text-foreground">
									<span
										class="h-1.5 w-1.5 rounded-full {doc.status === 'vigente'
											? 'bg-emerald-500'
											: doc.status === 'en_renovacion'
												? 'bg-amber-500'
												: 'bg-rose-500'}"
									></span>
									{doc.status === 'vigente' ? 'Vigente' : doc.status === 'en_renovacion' ? 'En renovación' : 'Pendiente'}
								</span>
								<span class="font-mono text-[10px] text-muted-foreground">
									Vence: {doc.expiryDate}
								</span>
							</div>
						</button>
					{/each}
				</div>
			</div>

			<!-- Columna Derecha (5 cols): Visor / Inspector Limpio del Documento Seleccionado -->
			<div class="xl:col-span-5 xl:sticky xl:top-20">
				{#if inspectedDoc}
					<div class="overflow-hidden rounded-xl border border-border bg-card shadow-2xs">
						<!-- Encabezado tipo hoja oficial -->
						<div class="border-b border-border bg-muted/30 px-6 py-4">
							<div class="flex items-center justify-between gap-2">
								<span class="rounded-md bg-muted px-2 py-0.5 font-mono text-[11px] font-semibold text-foreground">
									{inspectedDoc.id}
								</span>
								<span class="rounded-md border border-border bg-background px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">
									{categoryLabel(inspectedDoc.category)}
								</span>
							</div>

							<h2 class="mt-2.5 font-display text-base font-bold text-foreground">
								{inspectedDoc.title}
							</h2>
							<p class="mt-0.5 text-xs text-muted-foreground">
								Emitido por <strong class="font-medium text-foreground">{inspectedDoc.issuer}</strong>
							</p>
						</div>

						<!-- Cuerpo del documento -->
						<div class="space-y-4 p-6 text-xs">
							<div class="grid grid-cols-2 gap-3 rounded-xl border border-border bg-muted/20 p-3.5">
								<div>
									<span class="text-[10px] font-medium text-muted-foreground uppercase">Radicado / Póliza</span>
									<p class="mt-0.5 font-mono text-xs font-semibold text-foreground">{inspectedDoc.documentNumber}</p>
								</div>
								<div>
									<span class="text-[10px] font-medium text-muted-foreground uppercase">Entidad responsable</span>
									<p class="mt-0.5 font-semibold text-foreground">{inspectedDoc.responsibleEntity}</p>
								</div>
								<div>
									<span class="text-[10px] font-medium text-muted-foreground uppercase">Fecha de expedición</span>
									<p class="mt-0.5 font-mono text-foreground">{inspectedDoc.issueDate}</p>
								</div>
								<div>
									<span class="text-[10px] font-medium text-muted-foreground uppercase">Vigencia certificada</span>
									<p class="mt-0.5 font-mono font-semibold text-emerald-600 dark:text-emerald-400">{inspectedDoc.expiryDate}</p>
								</div>
							</div>

							<div class="space-y-1.5">
								<span class="text-[11px] font-semibold text-foreground">
									Alcance jurídico y técnico verificado
								</span>
								<p class="rounded-xl border border-border bg-background p-4 text-xs leading-relaxed text-muted-foreground">
									{inspectedDoc.summary}
								</p>
							</div>

							<!-- Respaldo Criptográfico en Stellar -->
							<div class="rounded-xl border border-border bg-zinc-950 p-4 text-white">
								<div class="flex items-center justify-between">
									<span class="inline-flex items-center gap-1.5 text-[11px] font-medium text-zinc-300">
										<Lock class="h-3.5 w-3.5 text-emerald-400" />
										Sello inmutable en Stellar Soroban
									</span>
									<span class="rounded bg-emerald-500/20 px-2 py-0.5 font-mono text-[10px] font-semibold text-emerald-400">
										SHA-256 Activo
									</span>
								</div>
								<div class="mt-2 rounded bg-zinc-900 px-3 py-2 font-mono text-[11px] break-all text-zinc-300">
									{inspectedDoc.sha256Hash}
								</div>
							</div>
						</div>
					</div>
				{/if}
			</div>
		</div>
	{:else}
		<!-- ========================================================================= -->
		<!-- VISTA B: MATRIZ LIMPIA DE CUMPLIMIENTO (Constructora vs. Interventor)     -->
		<!-- ========================================================================= -->
		<div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
			<!-- Columna Constructora -->
			<div class="rounded-xl border border-border bg-card shadow-2xs overflow-hidden">
				<div class="border-b border-border bg-muted/20 px-6 py-4">
					<div class="flex items-center justify-between">
						<span class="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
							Constructora y promotora
						</span>
						<span class="inline-flex items-center gap-1.5 rounded-md border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
							<CheckCircle2 class="h-3.5 w-3.5" />
							{constructoraCompliance.length} de {constructoraCompliance.length} requisitos cumplidos
						</span>
					</div>
					<h2 class="mt-1 font-display text-base font-bold text-foreground">
						{ficha.developerProfile.name}
					</h2>
					<p class="mt-0.5 text-xs text-muted-foreground">
						NIT {ficha.developerProfile.nit} • Rep. Legal: {ficha.developerProfile.legalRepresentative}
					</p>
				</div>

				<div class="divide-y divide-border p-5">
					{#each constructoraCompliance as item (item.id)}
						<div class="py-3.5 first:pt-0 last:pb-0">
							<div class="flex items-start justify-between gap-3">
								<div class="flex items-start gap-2.5">
									<CheckCircle2 class="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
									<div>
										<h3 class="text-xs font-semibold text-foreground">{item.requirement}</h3>
										<p class="mt-1 text-xs leading-relaxed text-muted-foreground">
											{item.notes}
										</p>
										<div class="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
											<span class="rounded bg-muted px-2 py-0.5 font-mono text-foreground">{item.regulationRef}</span>
											<span>•</span>
											<span>Auditado por {item.verifiedBy}</span>
											<span>•</span>
											<span class="font-mono">{item.verificationDate}</span>
										</div>
									</div>
								</div>
							</div>
						</div>
					{/each}
				</div>
			</div>

			<!-- Columna Interventor / Supervisor Técnico -->
			<div class="rounded-xl border border-border bg-card shadow-2xs overflow-hidden">
				<div class="border-b border-border bg-muted/20 px-6 py-4">
					<div class="flex items-center justify-between">
						<span class="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
							Supervisor técnico independiente
						</span>
						<span class="inline-flex items-center gap-1.5 rounded-md border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
							<CheckCircle2 class="h-3.5 w-3.5" />
							{interventorCompliance.length} de {interventorCompliance.length} requisitos cumplidos
						</span>
					</div>
					<h2 class="mt-1 font-display text-base font-bold text-foreground">
						{ficha.supervisorProfile.companyName}
					</h2>
					<p class="mt-0.5 text-xs text-muted-foreground">
						Director: {ficha.supervisorProfile.name} • Matrícula {ficha.supervisorProfile.copniaLicense}
					</p>
				</div>

				<div class="divide-y divide-border p-5">
					{#each interventorCompliance as item (item.id)}
						<div class="py-3.5 first:pt-0 last:pb-0">
							<div class="flex items-start justify-between gap-3">
								<div class="flex items-start gap-2.5">
									<CheckCircle2 class="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
									<div>
										<h3 class="text-xs font-semibold text-foreground">{item.requirement}</h3>
										<p class="mt-1 text-xs leading-relaxed text-muted-foreground">
											{item.notes}
										</p>
										<div class="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
											<span class="rounded bg-muted px-2 py-0.5 font-mono text-foreground">{item.regulationRef}</span>
											<span>•</span>
											<span>Auditado por {item.verifiedBy}</span>
											<span>•</span>
											<span class="font-mono">{item.verificationDate}</span>
										</div>
									</div>
								</div>
							</div>
						</div>
					{/each}
				</div>
			</div>
		</div>
	{/if}
</div>

<!-- MODAL PARA RADICAR NUEVO DOCUMENTO OBLIGATORIO -->
{#if showUploadModal}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
		role="dialog"
		aria-modal="true"
	>
		<div class="flex w-[95vw] max-w-xl flex-col overflow-hidden rounded-2xl border border-border bg-card text-card-foreground shadow-2xl">
			<div class="flex items-center justify-between border-b border-border px-6 py-4">
				<div>
					<h3 class="font-display text-base font-bold text-foreground">
						Radicar documento obligatorio
					</h3>
					<p class="text-xs text-muted-foreground">
						El documento quedará sellado con hash criptográfico en el expediente fiduciario.
					</p>
				</div>
				<button
					type="button"
					onclick={() => (showUploadModal = false)}
					aria-label="Cerrar modal"
					class="cursor-pointer rounded-lg border border-border p-1.5 text-muted-foreground hover:bg-muted"
				>
					<X class="h-4 w-4" />
				</button>
			</div>

			<form onsubmit={handleUploadDocument} class="space-y-4 p-6 text-xs">
				<div>
					<label for="doc-title" class="block font-semibold text-foreground">
						Título del documento obligatorio *
					</label>
					<input
						id="doc-title"
						type="text"
						required
						bind:value={newDocTitle}
						placeholder="Ej. Paz y salvo impuesto de delineación urbana"
						class="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none"
					/>
				</div>

				<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
					<div>
						<label for="doc-category" class="block font-semibold text-foreground">
							Categoría normativa
						</label>
						<select
							id="doc-category"
							bind:value={newDocCategory}
							class="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none"
						>
							<option value="licencias">Licencia urbanística</option>
							<option value="polizas">Póliza y garantías</option>
							<option value="fiduciarios">Contrato fiduciario</option>
							<option value="tecnicos">Estudio y norma técnica</option>
						</select>
					</div>

					<div>
						<label for="doc-issuer" class="block font-semibold text-foreground">
							Entidad emisora / Aseguradora *
						</label>
						<input
							id="doc-issuer"
							type="text"
							required
							bind:value={newDocIssuer}
							placeholder="Ej. Secretaría de Hacienda / Seguros Sura"
							class="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none"
						/>
					</div>
				</div>

				<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
					<div>
						<label for="doc-radicado" class="block font-semibold text-foreground">
							Número de radicado / Póliza
						</label>
						<input
							id="doc-radicado"
							type="text"
							bind:value={newDocNumber}
							placeholder="Ej. RES-2026-8841"
							class="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 font-mono text-sm text-foreground focus:outline-none"
						/>
					</div>

					<div>
						<label for="doc-expiry" class="block font-semibold text-foreground">
							Fecha de vencimiento
						</label>
						<input
							id="doc-expiry"
							type="date"
							bind:value={newDocExpiry}
							class="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 font-mono text-sm text-foreground focus:outline-none"
						/>
					</div>
				</div>

				<div>
					<label for="doc-summary" class="block font-semibold text-foreground">
						Resumen y alcance del documento
					</label>
					<textarea
						id="doc-summary"
						rows="3"
						bind:value={newDocSummary}
						placeholder="Describa el alcance legal o técnico certificado por este documento..."
						class="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none"
					></textarea>
				</div>

				<div class="flex items-center justify-end gap-2.5 border-t border-border pt-4">
					<button
						type="button"
						onclick={() => (showUploadModal = false)}
						class="cursor-pointer rounded-lg border border-border bg-background px-4 py-2 text-xs font-medium text-foreground hover:bg-muted"
					>
						Cancelar
					</button>
					<button
						type="submit"
						class="cursor-pointer rounded-lg bg-foreground px-4 py-2 text-xs font-medium text-background hover:opacity-90"
					>
						Firmar y radicar en expediente
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}
