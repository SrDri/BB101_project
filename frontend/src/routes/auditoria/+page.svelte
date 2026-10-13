<script lang="ts">
	import { projectStore, formatCOP } from '$lib/stores/projectState.svelte';
	import type { AuditLogEntry } from '$lib/types/twin';
	import {
		ShieldCheck,
		Search,
		Download,
		Lock,
		ArrowRight,
		Copy,
		Check,
		FileCheck2,
		Landmark,
		HardHat,
		Building2,
		Cpu,
		ExternalLink,
		History
	} from '@lucide/svelte';

	const cut = $derived(projectStore.activeCut);
	const logs = $derived(projectStore.auditLogs);

	let searchQuery = $state('');
	let selectedCategory = $state<'todos' | AuditLogEntry['category']>('todos');
	let selectedActorRole = $state<'todos' | AuditLogEntry['actorRole']>('todos');
	let selectedLogId = $state<string>('AUD-2026-008');
	let copiedHash = $state(false);

	const filteredLogs = $derived(
		logs.filter((entry) => {
			const matchCat = selectedCategory === 'todos' || entry.category === selectedCategory;
			const matchRole = selectedActorRole === 'todos' || entry.actorRole === selectedActorRole;
			const q = searchQuery.trim().toLowerCase();
			const matchSearch =
				!q ||
				entry.actionTitle.toLowerCase().includes(q) ||
				entry.summary.toLowerCase().includes(q) ||
				entry.actorName.toLowerCase().includes(q) ||
				entry.actorCompany.toLowerCase().includes(q) ||
				entry.sha256Hash.toLowerCase().includes(q) ||
				entry.id.toLowerCase().includes(q);
			return matchCat && matchRole && matchSearch;
		})
	);

	const inspectedLog = $derived(
		filteredLogs.find((item) => item.id === selectedLogId) || filteredLogs[0] || logs[0]
	);

	function getCategoryBadge(cat: AuditLogEntry['category']) {
		switch (cat) {
			case 'desembolso':
				return { label: 'Giro Fiduciario', cls: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25' };
			case 'interventoria':
				return { label: 'Interventoría Técnica', cls: 'bg-[#F5A400]/15 text-[#F5A400] border-[#F5A400]/30' };
			case 'cumplimiento':
				return { label: 'Cumplimiento Legal', cls: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/25' };
			case 'hallazgo_ncr':
				return { label: 'Hallazgo NCR', cls: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/25' };
			case 'comercial':
				return { label: 'Recaudo Comercial', cls: 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/25' };
			default:
				return { label: 'Soroban Smart Contract', cls: 'bg-zinc-500/15 text-foreground border-border' };
		}
	}

	function getRoleDot(role: AuditLogEntry['actorRole']) {
		switch (role) {
			case 'fiduciaria':
				return { label: 'Fiduciaria', dot: 'bg-emerald-500' };
			case 'interventor':
				return { label: 'Interventoría', dot: 'bg-[#F5A400]' };
			case 'constructor':
				return { label: 'Constructora', dot: 'bg-sky-500' };
			default:
				return { label: 'Oráculo / Sistema', dot: 'bg-violet-500' };
		}
	}

	function copySha256(hash: string) {
		if (typeof navigator !== 'undefined' && navigator.clipboard) {
			navigator.clipboard.writeText(hash);
		}
		copiedHash = true;
		setTimeout(() => (copiedHash = false), 2000);
	}

	function exportAuditCsv() {
		if (typeof window === 'undefined') return;
		const headers = [
			'ID',
			'Fecha_Hora',
			'Categoria',
			'Severidad',
			'Evento',
			'Actor',
			'Entidad',
			'Estado_Anterior',
			'Estado_Nuevo',
			'SHA256_Hash',
			'Ledger_Stellar'
		];
		const rows = filteredLogs.map((l) => [
			l.id,
			l.timestamp,
			l.category,
			l.severity,
			`"${l.actionTitle.replace(/"/g, '""')}"`,
			`"${l.actorName}"`,
			`"${l.actorCompany}"`,
			`"${l.previousState || ''}"`,
			`"${l.newState || ''}"`,
			l.sha256Hash,
			l.ledgerSequence
		]);
		const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
		const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `tramo_audit_log_${cut.code}_2026.csv`;
		a.click();
		URL.revokeObjectURL(url);
	}
</script>

<div class="mx-auto max-w-[1440px] space-y-6">
	<!-- 1. Cabecera Ejecutiva del Centro de Auditoría -->
	<div class="flex flex-col justify-between gap-4 border-b border-border pb-4 lg:flex-row lg:items-center">
		<div class="space-y-1">
			<div class="flex flex-wrap items-center gap-2">
				<span class="inline-flex items-center gap-1.5 rounded-md border border-border bg-muted/60 px-2.5 py-0.5 text-[11px] font-medium whitespace-nowrap text-foreground">
					<span class="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
					Trazabilidad forense inmutable · Stellar Soroban
				</span>
				<span class="font-mono text-xs whitespace-nowrap text-muted-foreground">
					{cut.code} • {cut.fiduciaryTrustCode}
				</span>
			</div>
			<h1 class="font-display text-2xl font-semibold tracking-tight text-foreground">
				Centro de auditoría e historial de acciones — {cut.projectName}
			</h1>
			<p class="text-xs text-muted-foreground">
				Bitácora cronológica inalterable de aprobaciones de giros, certificaciones de interventoría, subsanaciones técnicas y documentos legales.
			</p>
		</div>

		<div class="flex flex-wrap items-center gap-2">
			<button
				type="button"
				onclick={exportAuditCsv}
				class="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg border border-border bg-background px-3.5 py-2 text-xs font-medium whitespace-nowrap text-foreground transition-colors hover:bg-muted"
			>
				<Download class="h-3.5 w-3.5" />
				<span>Exportar log forense (CSV)</span>
			</button>
			<a
				href="/verificar"
				class="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-foreground px-3.5 py-2 text-xs font-medium whitespace-nowrap text-background shadow-2xs transition-opacity hover:opacity-90"
			>
				<ShieldCheck class="h-3.5 w-3.5" />
				<span>Verificador criptográfico</span>
			</a>
		</div>
	</div>

	<!-- 2. Cinta de Indicadores de Integridad y Gobernanza -->
	<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
		<div class="rounded-xl border border-border bg-card p-4 shadow-2xs">
			<span class="text-xs font-medium text-muted-foreground">Eventos auditados en el proyecto</span>
			<div class="mt-1.5 flex items-baseline justify-between">
				<span class="font-display text-2xl font-bold text-foreground tabular-nums">{logs.length}</span>
				<span class="rounded bg-emerald-500/10 px-2 py-0.5 font-mono text-[11px] font-semibold whitespace-nowrap text-emerald-600 dark:text-emerald-400">
					100% sellados
				</span>
			</div>
			<p class="mt-1 text-[11px] text-muted-foreground">Cero registros modificados o eliminados</p>
		</div>

		<div class="rounded-xl border border-border bg-card p-4 shadow-2xs">
			<span class="text-xs font-medium text-muted-foreground">Operaciones de alto impacto financiero</span>
			<div class="mt-1.5 flex items-baseline justify-between">
				<span class="font-display text-2xl font-bold text-foreground tabular-nums">
					{logs.filter((l) => l.severity === 'alta').length}
				</span>
				<span class="font-mono text-[11px] whitespace-nowrap text-muted-foreground">Multifirma verificada</span>
			</div>
			<p class="mt-1 text-[11px] text-muted-foreground">Giros ACH, certificados de corte y contrato</p>
		</div>

		<div class="rounded-xl border border-border bg-card p-4 shadow-2xs">
			<span class="text-xs font-medium text-muted-foreground">Entidades firmantes sincronizadas</span>
			<div class="mt-1.5 flex items-baseline justify-between">
				<span class="font-display text-2xl font-bold text-foreground tabular-nums">4 roles</span>
				<span class="font-mono text-[11px] whitespace-nowrap text-emerald-600 dark:text-emerald-400">COPNIA + SFC</span>
			</div>
			<p class="mt-1 text-[11px] text-muted-foreground">Fiduciaria, Interventoría, Constructora y Oráculo</p>
		</div>

		<div class="rounded-xl border border-border bg-card p-4 shadow-2xs">
			<span class="text-xs font-medium text-muted-foreground">Último bloque Stellar Soroban</span>
			<div class="mt-1.5 flex items-baseline justify-between">
				<span class="font-mono text-lg font-bold text-foreground tabular-nums">
					#{logs[0]?.ledgerSequence.toLocaleString('es-CO')}
				</span>
				<span class="inline-flex items-center gap-1 font-mono text-[11px] whitespace-nowrap text-emerald-600 dark:text-emerald-400">
					<span class="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
					Testnet
				</span>
			</div>
			<p class="mt-1 text-[11px] text-muted-foreground">Sincronización en tiempo real activa</p>
		</div>
	</div>

	<!-- 3. Layout Master-Detail: Tabla Despejada de Auditoría (7 cols) + Inspector Forense (5 cols) -->
	<div class="grid grid-cols-1 items-start gap-6 xl:grid-cols-12">
		<!-- Columna Izquierda (7 cols): Filtros + Tabla Limpia de Eventos -->
		<div class="overflow-hidden rounded-xl border border-border bg-card shadow-2xs xl:col-span-7">
			<!-- Barra de búsqueda y filtros por categoría y rol -->
			<div class="space-y-3 border-b border-border bg-muted/15 p-4">
				<div class="flex flex-col gap-2.5 sm:flex-row sm:items-center">
					<div class="relative flex-1">
						<Search class="pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
						<input
							type="search"
							bind:value={searchQuery}
							placeholder="Buscar por acción, actor, entidad, código NCR o hash SHA-256..."
							class="w-full rounded-lg border border-border bg-background py-1.5 pr-3 pl-8 text-xs text-foreground placeholder-muted-foreground focus:outline-none"
						/>
					</div>

					<select
						bind:value={selectedActorRole}
						aria-label="Filtrar por rol"
						class="rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground focus:outline-none"
					>
						<option value="todos">Todos los actores</option>
						<option value="fiduciaria">Rol: Fiduciaria</option>
						<option value="interventor">Rol: Interventoría</option>
						<option value="constructor">Rol: Constructora</option>
						<option value="sistema">Rol: Oráculo / Sistema</option>
					</select>
				</div>

				<!-- Píldoras de categoría con whitespace-nowrap -->
				<div class="flex flex-wrap items-center gap-1.5">
					{#each [
						{ id: 'todos', label: 'Todos los eventos' },
						{ id: 'desembolso', label: 'Desembolsos y giros' },
						{ id: 'interventoria', label: 'Interventoría' },
						{ id: 'hallazgo_ncr', label: 'Hallazgos NCR' },
						{ id: 'cumplimiento', label: 'Cumplimiento legal' },
						{ id: 'comercial', label: 'Recaudo y Soroban' }
					] as tab (tab.id)}
						<button
							type="button"
							onclick={() => (selectedCategory = tab.id as typeof selectedCategory)}
							class="cursor-pointer rounded-lg px-2.5 py-1 text-xs font-medium whitespace-nowrap transition-colors {selectedCategory === tab.id
								? 'bg-foreground text-background'
								: 'bg-background border border-border text-muted-foreground hover:text-foreground'}"
						>
							{tab.label}
						</button>
					{/each}
				</div>
			</div>

			<!-- Tabla Limpia de Auditoría (4 columnas legibles a primera vista) -->
			<div class="overflow-x-auto">
				<table class="w-full text-left border-collapse">
					<thead>
						<tr class="border-b border-border bg-muted/20 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
							<th class="py-3 pl-5 pr-3 whitespace-nowrap">Fecha / Ledger</th>
							<th class="px-3 py-3">Evento registrado</th>
							<th class="px-3 py-3 whitespace-nowrap">Actor firmante</th>
							<th class="py-3 pl-3 pr-5 text-right whitespace-nowrap">Traza</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-border text-xs">
						{#each filteredLogs as entry (entry.id)}
							{@const isSelected = inspectedLog?.id === entry.id}
							{@const catBadge = getCategoryBadge(entry.category)}
							{@const roleBadge = getRoleDot(entry.actorRole)}
							<tr
								onclick={() => (selectedLogId = entry.id)}
								class="cursor-pointer transition-colors {isSelected
									? 'bg-accent/70'
									: 'hover:bg-muted/35'}"
							>
								<!-- Columna 1: Fecha + ID/Ledger -->
								<td class="py-3.5 pl-5 pr-3 whitespace-nowrap align-top">
									<div class="font-mono font-semibold text-foreground">{entry.timestamp}</div>
									<div class="mt-0.5 font-mono text-[10px] text-muted-foreground">
										{entry.id} · #{entry.ledgerSequence}
									</div>
								</td>

								<!-- Columna 2: Acción + Categoría -->
								<td class="px-3 py-3.5 align-top">
									<div class="flex flex-wrap items-center gap-1.5">
										<span class="rounded border px-1.5 py-0.5 text-[10px] font-semibold whitespace-nowrap {catBadge.cls}">
											{catBadge.label}
										</span>
										{#if entry.amountCOP}
											<span class="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] font-bold whitespace-nowrap text-foreground">
												{formatCOP(entry.amountCOP, true)}
											</span>
										{/if}
									</div>
									<div class="mt-1 font-semibold text-foreground line-clamp-1">
										{entry.actionTitle}
									</div>
									<div class="mt-0.5 line-clamp-1 text-[11px] text-muted-foreground">
										{entry.summary}
									</div>
								</td>

								<!-- Columna 3: Actor y Entidad -->
								<td class="px-3 py-3.5 whitespace-nowrap align-top">
									<div class="inline-flex items-center gap-1.5 font-semibold text-foreground">
										<span class="h-1.5 w-1.5 shrink-0 rounded-full {roleBadge.dot}"></span>
										<span>{entry.actorName}</span>
									</div>
									<div class="mt-0.5 text-[11px] text-muted-foreground">
										{entry.actorCompany}
									</div>
								</td>

								<!-- Columna 4: Botón de inspección en 1 sola línea -->
								<td class="py-3.5 pl-3 pr-5 text-right whitespace-nowrap align-top">
									<button
										type="button"
										onclick={(e) => {
											e.stopPropagation();
											selectedLogId = entry.id;
										}}
										class="inline-flex shrink-0 cursor-pointer items-center gap-1 rounded-lg border px-2.5 py-1 text-[11px] font-medium whitespace-nowrap transition-colors {isSelected
											? 'border-foreground bg-foreground text-background'
											: 'border-border bg-background text-foreground hover:bg-muted'}"
									>
										<span>Ver traza</span>
									</button>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>

		<!-- Columna Derecha (5 cols): Inspector Forense del Evento Seleccionado -->
		<div class="xl:col-span-5 xl:sticky xl:top-20">
			{#if inspectedLog}
				{@const catBadge = getCategoryBadge(inspectedLog.category)}
				{@const roleBadge = getRoleDot(inspectedLog.actorRole)}
				<div class="overflow-hidden rounded-xl border border-border bg-card shadow-2xs">
					<div class="border-b border-border bg-muted/30 px-6 py-4">
						<div class="flex items-center justify-between gap-2">
							<span class="rounded-md bg-foreground px-2 py-0.5 font-mono text-[11px] font-bold whitespace-nowrap text-background">
								{inspectedLog.id}
							</span>
							<span class="rounded-md border px-2.5 py-0.5 text-[11px] font-semibold whitespace-nowrap {catBadge.cls}">
								{catBadge.label}
							</span>
						</div>

						<h2 class="mt-2.5 font-display text-base font-bold text-foreground">
							{inspectedLog.actionTitle}
						</h2>
						<p class="mt-1 text-xs leading-relaxed text-muted-foreground">
							{inspectedLog.summary}
						</p>
					</div>

					<div class="space-y-4 p-6 text-xs">
						<!-- Diferencial de Estado (Antes -> Después) -->
						{#if inspectedLog.previousState || inspectedLog.newState}
							<div class="rounded-xl border border-border bg-muted/20 p-3.5 space-y-2">
								<span class="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
									Transición de estado verificada (State Diff)
								</span>
								<div class="grid grid-cols-1 gap-2 sm:grid-cols-2">
									<div class="rounded-lg border border-border bg-background p-2.5">
										<span class="text-[10px] text-muted-foreground block">Estado anterior</span>
										<span class="mt-0.5 font-mono text-[11px] text-muted-foreground block">
											{inspectedLog.previousState || 'N/A'}
										</span>
									</div>
									<div class="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-2.5">
										<span class="text-[10px] text-emerald-600 dark:text-emerald-400 block">Nuevo estado sellado</span>
										<span class="mt-0.5 font-mono text-[11px] font-semibold text-foreground block">
											{inspectedLog.newState || 'Registrado'}
										</span>
									</div>
								</div>
							</div>
						{/if}

						<!-- Metadatos del Actor y Firma -->
						<div class="grid grid-cols-2 gap-3 rounded-xl border border-border bg-muted/15 p-3.5">
							<div>
								<span class="text-[10px] font-medium text-muted-foreground uppercase">Autor / Firmante</span>
								<div class="mt-0.5 flex items-center gap-1.5 font-semibold text-foreground">
									<span class="h-2 w-2 shrink-0 rounded-full {roleBadge.dot}"></span>
									<span>{inspectedLog.actorName}</span>
								</div>
							</div>
							<div>
								<span class="text-[10px] font-medium text-muted-foreground uppercase">Entidad titular</span>
								<p class="mt-0.5 font-semibold text-foreground">{inspectedLog.actorCompany}</p>
							</div>
							<div>
								<span class="text-[10px] font-medium text-muted-foreground uppercase">Acreditación / NIT</span>
								<p class="mt-0.5 font-mono text-[11px] text-foreground">{inspectedLog.actorDocument}</p>
							</div>
							<div>
								<span class="text-[10px] font-medium text-muted-foreground uppercase">Fecha y hora exacta</span>
								<p class="mt-0.5 font-mono text-[11px] text-foreground">{inspectedLog.timestamp} COT</p>
							</div>
							<div class="col-span-2 border-t border-border/60 pt-2">
								<span class="text-[10px] font-medium text-muted-foreground uppercase">Origen / Geocerca GPS / IP</span>
								<p class="mt-0.5 font-mono text-[11px] text-foreground">{inspectedLog.geofenceOrIp}</p>
							</div>
							<div class="col-span-2 border-t border-border/60 pt-2">
								<span class="text-[10px] font-medium text-muted-foreground uppercase">Mecanismo de autenticación</span>
								<p class="mt-0.5 font-medium text-emerald-600 dark:text-emerald-400">{inspectedLog.signatureMethod}</p>
							</div>
						</div>

						<!-- Sello Criptográfico en Stellar Soroban -->
						<div class="rounded-xl border border-border bg-zinc-950 p-4 text-white space-y-2.5">
							<div class="flex items-center justify-between">
								<span class="inline-flex items-center gap-1.5 text-[11px] font-medium text-zinc-300">
									<Lock class="h-3.5 w-3.5 text-emerald-400" />
									Evidencia criptográfica en Stellar
								</span>
								<span class="rounded bg-emerald-500/20 px-2 py-0.5 font-mono text-[10px] font-semibold whitespace-nowrap text-emerald-400">
									Ledger #{inspectedLog.ledgerSequence}
								</span>
							</div>

							<div>
								<div class="flex items-center justify-between text-[10px] text-zinc-400">
									<span>Huella SHA-256 del payload canónico:</span>
									<button
										type="button"
										onclick={() => copySha256(inspectedLog.sha256Hash)}
										class="inline-flex cursor-pointer items-center gap-1 text-emerald-400 hover:underline"
									>
										{#if copiedHash}
											<Check class="h-3 w-3" />
											<span>Copiado</span>
										{:else}
											<Copy class="h-3 w-3" />
											<span>Copiar hash</span>
										{/if}
									</button>
								</div>
								<div class="mt-1 rounded bg-zinc-900 px-2.5 py-1.5 font-mono text-[10.5px] break-all text-zinc-200">
									{inspectedLog.sha256Hash}
								</div>
							</div>

							<div>
								<span class="text-[10px] text-zinc-400 block">Transacción Soroban (TxHash):</span>
								<div class="mt-1 rounded bg-zinc-900 px-2.5 py-1.5 font-mono text-[10.5px] break-all text-zinc-400">
									{inspectedLog.stellarTxHash}
								</div>
							</div>
						</div>

						<div class="flex items-center justify-between gap-2 pt-1">
							<a
								href={inspectedLog.moduleRoute}
								class="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-2 text-xs font-medium whitespace-nowrap text-foreground hover:bg-muted"
							>
								<span>Ir al módulo origen ({inspectedLog.moduleRoute})</span>
								<ArrowRight class="h-3.5 w-3.5" />
							</a>
							<a
								href="/verificar"
								class="inline-flex items-center gap-1.5 rounded-lg bg-foreground px-3 py-2 text-xs font-medium whitespace-nowrap text-background hover:opacity-90"
							>
								<span>Auditar hash</span>
								<ExternalLink class="h-3.5 w-3.5" />
							</a>
						</div>
					</div>
				</div>
			{/if}
		</div>
	</div>
</div>

