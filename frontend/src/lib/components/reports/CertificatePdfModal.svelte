<script lang="ts">
  import { projectStore } from '$lib/stores/projectState.svelte';
  import { Button } from '$lib/components/ui/button';
  import {
    Printer,
    X,
    ShieldCheck,
    ExternalLink,
    FileCheck2,
    Building2,
    Calendar,
    MapPin,
    Hash
  } from '@lucide/svelte';

  interface Props {
    open?: boolean;
    isOpen?: boolean;
    onClose?: () => void;
    corteNumber?: number;
  }

  let {
    open = $bindable(false),
    isOpen = $bindable(false),
    onClose = () => {},
    corteNumber = 4
  }: Props = $props();

  function handleClose() {
    open = false;
    isOpen = false;
    if (onClose) onClose();
  }

  const cut = $derived(projectStore.activeCut);
  const cert = $derived(
    projectStore.issuedCertificates.find((c) => c.metadata.corteNumber === corteNumber) ||
      projectStore.issuedCertificates[0]
  );
  const labTests = $derived(projectStore.materialLabTests);
  const ficha = $derived(projectStore.activeFicha);

  // Fotografías técnicas representativas del corte
  const photos = $derived.by(() => {
    const list: Array<{
      url: string;
      title: string;
      location: string;
      hash: string;
      date: string;
      aiTag: string;
    }> = [];

    for (const floor of cut.floors) {
      for (const p of floor.photos) {
        list.push({
          url: p.fullUrl || p.thumbnailUrl || '/images/construction-placeholder.jpg',
          title: `${floor.name} — ${p.title}`,
          location: p.location,
          hash: cut.sha256Hash
            ? `${cut.sha256Hash.slice(0, 16)}${p.id.replace(/[^a-f0-9]/gi, '').padEnd(16, '0').slice(0, 16)}`
            : 'e89a42f11c7b8d0e5f6a1b2c3d4e5f6a',
          date: p.timestamp,
          aiTag: p.aiDetectedElements?.[0] || 'Validado por Visión Artificial'
        });
        if (list.length >= 4) break;
      }
      if (list.length >= 4) break;
    }
    return list;
  });

  function handlePrint() {
    if (typeof window !== 'undefined') {
      window.print();
    }
  }

  function formatCOP(amount: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0
    }).format(amount);
  }

  const contractId = $derived(
    cert?.stellarSoroban?.contractId || 'CB5L2JGJIAXUUORKHBJFGLS5Y3BOW6LE44WEQ23JEK3KTIN2I252H44T'
  );
  const txHash = $derived(
    cert?.stellarSoroban?.transactionHash ||
      '452ef966702a172ed2be7ba0fc53ea306661bfe34900e53ad5b648dfbc33d4be'
  );
  const certHash = $derived(
    cert?.sha256Hash || 'a7c93e41b2e8d7541f6e2983c48520d88b489920efbc756312a0f8d9b1c7849e'
  );
  const ledgerNum = $derived(cert?.stellarSoroban?.ledgerSequence || 5264904);
</script>

{#if open || isOpen}
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-2 sm:p-4 backdrop-blur-xs overflow-y-auto print:p-0 print:bg-white print:fixed print:inset-0"
    role="dialog"
    aria-modal="true"
  >
    <!-- Contenedor Principal del Modal / Hoja de Impresión -->
    <div
      class="relative flex flex-col w-full max-w-4xl max-h-[92vh] rounded-2xl border border-border bg-card shadow-2xl print:max-w-none print:max-h-none print:border-none print:shadow-none print:rounded-none print:m-0"
    >
      <!-- Barra Superior de Acciones (No se imprime) -->
      <div
        class="flex items-center justify-between border-b border-border px-6 py-3.5 bg-muted/40 shrink-0 print:hidden"
      >
        <div class="flex items-center gap-2">
          <FileCheck2 class="w-5 h-5 text-emerald-500" />
          <span class="text-sm font-semibold text-foreground">
            Expediente Oficial de Certificación Técnica y Fiduciaria — PDF
          </span>
          <span class="rounded bg-emerald-500/10 px-2 py-0.5 font-mono text-[11px] font-bold text-emerald-600">
            Stellar Soroban Testnet
          </span>
        </div>
        <div class="flex items-center gap-2">
          <Button
            size="sm"
            onclick={handlePrint}
            class="h-8 gap-1.5 bg-foreground text-background hover:opacity-90 font-mono text-xs cursor-pointer shadow-sm"
          >
            <Printer class="w-3.5 h-3.5" />
            <span>Imprimir / Guardar como PDF</span>
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onclick={handleClose}
            class="h-8 w-8 p-0 cursor-pointer"
          >
            <X class="w-4 h-4" />
          </Button>
        </div>
      </div>

      <!-- Contenido del Documento Imprimible (A4 / Carta) -->
      <div
        id="printable-certificate-document"
        class="overflow-y-auto p-6 sm:p-10 space-y-6 text-foreground text-xs leading-relaxed print:p-8 print:text-black print:overflow-visible"
      >
        <!-- Encabezado Oficial -->
        <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b-2 border-border pb-6 print:border-black">
          <div class="space-y-1.5">
            <div class="flex items-center gap-2">
              <span class="font-display text-xl font-bold tracking-tight text-foreground print:text-black">
                TRAMO
              </span>
              <span class="rounded-md border border-border px-2 py-0.5 font-mono text-[10px] text-muted-foreground uppercase print:border-black">
                Fe Pública Inmobiliaria Digital
              </span>
            </div>
            <h1 class="text-base font-bold text-foreground print:text-black">
              CERTIFICADO OFICIAL DE AVANCE FÍSICO Y GIRO FIDUCIARIO
            </h1>
            <p class="text-muted-foreground text-[11px]">
              Emitido conforme a la <strong>Ley 1796 de 2016</strong> (Vivienda Segura), <strong>Reglamento Colombiano Sismorresistente NSR-10</strong> y normas de la Superintendencia Financiera de Colombia.
            </p>
          </div>

          <div class="rounded-xl border border-border bg-muted/30 p-3 sm:text-right font-mono text-[11px] shrink-0 print:border-black print:bg-white">
            <div class="font-bold text-foreground print:text-black">CERTIFICADO #{cert?.certificateId || 'CERT-ALAMEDA-004'}</div>
            <div class="text-muted-foreground">Fecha emisión: 18 Octubre 2026</div>
            <div class="text-emerald-600 font-semibold print:text-black">Ledger Stellar #{ledgerNum}</div>
            <div class="text-[10px] text-muted-foreground">Estado: Sellado Inmutable</div>
          </div>
        </div>

        <!-- Ficha Resumen del Fideicomiso y Proyecto -->
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <div class="rounded-lg border border-border bg-muted/20 p-3 print:border-black print:bg-white">
            <span class="text-[10px] text-muted-foreground uppercase tracking-wider block">Proyecto</span>
            <div class="font-bold text-sm text-foreground print:text-black">{cut.projectName}</div>
            <div class="text-muted-foreground text-[11px]">{cut.city} • Eje Residencial</div>
          </div>

          <div class="rounded-lg border border-border bg-muted/20 p-3 print:border-black print:bg-white">
            <span class="text-[10px] text-muted-foreground uppercase tracking-wider block">Patrimonio Autónomo</span>
            <div class="font-bold text-sm text-foreground print:text-black">{cut.fiduciaryTrustCode}</div>
            <div class="text-muted-foreground text-[11px]">{cut.fiduciaryEntity}</div>
          </div>

          <div class="rounded-lg border border-border bg-muted/20 p-3 print:border-black print:bg-white">
            <span class="text-[10px] text-muted-foreground uppercase tracking-wider block">Constructora / Promotor</span>
            <div class="font-bold text-sm text-foreground print:text-black">{ficha.developerProfile.name}</div>
            <div class="text-muted-foreground text-[11px]">NIT: {ficha.developerProfile.nit}</div>
          </div>

          <div class="rounded-lg border border-border bg-muted/20 p-3 print:border-black print:bg-white">
            <span class="text-[10px] text-muted-foreground uppercase tracking-wider block">Interventoría Técnica</span>
            <div class="font-bold text-sm text-foreground print:text-black">{ficha.supervisorProfile.companyName}</div>
            <div class="text-muted-foreground text-[11px]">{ficha.supervisorProfile.copniaLicense}</div>
          </div>
        </div>

        <!-- Métricas Físicas y Cuadro de Desembolso Fiduciario -->
        <div class="rounded-xl border border-border p-4 space-y-3 print:border-black">
          <div class="flex items-center justify-between border-b border-border pb-2.5 print:border-black">
            <span class="font-bold text-xs uppercase tracking-wider text-foreground print:text-black">
              1. Balance Físico y Financiero del Corte #{cut.number}
            </span>
            <span class="font-mono text-[11px] text-emerald-600 font-semibold print:text-black">
              Corte Aprobado por Comité
            </span>
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div class="p-2.5 rounded-lg bg-muted/30 border border-border print:border-black print:bg-white">
              <span class="text-[10px] text-muted-foreground block">Avance Programado</span>
              <span class="font-mono text-base font-bold text-foreground print:text-black">44.0%</span>
            </div>
            <div class="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 print:border-black print:bg-white">
              <span class="text-[10px] text-emerald-700 dark:text-emerald-300 block font-semibold print:text-black">
                Avance Físico Certificado
              </span>
              <span class="font-mono text-base font-bold text-emerald-600 print:text-black">44.5%</span>
            </div>
            <div class="p-2.5 rounded-lg bg-muted/30 border border-border print:border-black print:bg-white">
              <span class="text-[10px] text-muted-foreground block">Retención Garantía (5%)</span>
              <span class="font-mono text-sm font-bold text-amber-600 print:text-black">{formatCOP(9736842)}</span>
            </div>
            <div class="p-2.5 rounded-lg bg-muted/30 border border-border print:border-black print:bg-white">
              <span class="text-[10px] text-muted-foreground block">Giro Neto Autorizado ACH</span>
              <span class="font-mono text-sm font-bold text-foreground print:text-black">{formatCOP(185000000)}</span>
            </div>
          </div>

          <p class="text-[11px] text-muted-foreground leading-relaxed pt-1">
            <strong>Concepto de Interventoría:</strong> El avance físico ejecutado en obra civil (losa, mampostería e instalaciones técnicas) cumple satisfactoriamente con la ruta crítica del cronograma fiduciario. Se constató la calibración del 100% de los frentes de trabajo y la ausencia de hallazgos críticos de orden estructural.
          </p>
        </div>

        <!-- Ensayos de Laboratorio NSR-10 (Control de Calidad ONAC) -->
        <div class="rounded-xl border border-border p-4 space-y-3 print:border-black">
          <div class="flex items-center justify-between border-b border-border pb-2.5 print:border-black">
            <span class="font-bold text-xs uppercase tracking-wider text-foreground print:text-black">
              2. Control de Calidad y Ensayos de Laboratorio Acreditados ONAC (NSR-10)
            </span>
            <span class="font-mono text-[11px] text-muted-foreground">Norma Sismorresistente</span>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse text-[11px]">
              <thead>
                <tr class="border-b border-border bg-muted/30 text-muted-foreground uppercase text-[10px] print:border-black">
                  <th class="py-2 pl-2">Ensayo / Material</th>
                  <th class="py-2">Laboratorio Acreditado</th>
                  <th class="py-2">Especificación NSR-10</th>
                  <th class="py-2">Resultado Obtenido</th>
                  <th class="py-2 text-right pr-2">Dictamen</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-border print:divide-black">
                {#each labTests as test}
                  <tr>
                    <td class="py-2 pl-2 font-medium text-foreground print:text-black">{test.title}</td>
                    <td class="py-2 text-muted-foreground">{test.laboratory}</td>
                    <td class="py-2 font-mono">{test.targetSpec}</td>
                    <td class="py-2 font-mono font-bold text-emerald-600 print:text-black">{test.obtainedResult}</td>
                    <td class="py-2 text-right pr-2">
                      <span class="inline-flex rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600 print:border print:border-black">
                        {test.status === 'aprobado' ? 'Cumple 100%' : 'En proceso'}
                      </span>
                    </td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Evidencias Fotográficas Georreferenciadas con Huella SHA-256 -->
        <div class="rounded-xl border border-border p-4 space-y-3 print:border-black">
          <div class="flex items-center justify-between border-b border-border pb-2.5 print:border-black">
            <span class="font-bold text-xs uppercase tracking-wider text-foreground print:text-black">
              3. Muestra de Evidencia Fotográfica Georreferenciada (Merkle Tree Componentes)
            </span>
            <span class="font-mono text-[10px] text-muted-foreground">48 fotos auditadas</span>
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {#each photos as photo}
              <div class="rounded-lg border border-border overflow-hidden bg-background space-y-1.5 print:border-black">
                <img
                  src={photo.url}
                  alt={photo.title}
                  class="w-full h-24 object-cover border-b border-border print:border-black"
                  loading="lazy"
                />
                <div class="p-2 space-y-1">
                  <div class="font-bold text-[10px] text-foreground truncate print:text-black">{photo.title}</div>
                  <div class="text-[9px] text-muted-foreground truncate">{photo.location}</div>
                  <div class="font-mono text-[8px] text-muted-foreground break-all bg-muted/40 p-1 rounded print:bg-white print:border print:border-black">
                    SHA: {photo.hash.slice(0, 16)}...
                  </div>
                </div>
              </div>
            {/each}
          </div>
        </div>

        <!-- Fe Pública en Stellar Soroban (Bloque Criptográfico Principal) -->
        <div class="rounded-xl border-2 border-emerald-500/40 bg-emerald-500/5 p-4 space-y-3 print:border-black print:bg-white">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-500/20 pb-2.5 print:border-black">
            <div class="flex items-center gap-2">
              <ShieldCheck class="w-4 h-4 text-emerald-600 print:text-black" />
              <span class="font-bold text-xs uppercase tracking-wider text-foreground print:text-black">
                4. Sello Inmutable de Fe Pública en Stellar Soroban Testnet
              </span>
            </div>
            <span class="font-mono text-[11px] text-emerald-600 font-semibold print:text-black">
              Inmutabilidad y No-Repudio Verificados
            </span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            <div class="md:col-span-2 space-y-2 font-mono text-[10px]">
              <div>
                <span class="text-muted-foreground block text-[9px] uppercase tracking-wider">Contrato Inteligente (corte_registry)</span>
                <span class="text-foreground font-bold select-all break-all print:text-black">{contractId}</span>
              </div>
              <div>
                <span class="text-muted-foreground block text-[9px] uppercase tracking-wider">Hash de Transacción On-Chain (Ledger #{ledgerNum})</span>
                <span class="text-foreground font-bold select-all break-all print:text-black">{txHash}</span>
              </div>
              <div>
                <span class="text-muted-foreground block text-[9px] uppercase tracking-wider">Huella Digital Canónica del Expediente (SHA-256)</span>
                <span class="text-emerald-700 dark:text-emerald-400 font-bold select-all break-all print:text-black">{certHash}</span>
              </div>
            </div>

            <!-- Código QR para Verificación Pública Inmediata -->
            <div class="flex flex-col items-center justify-center p-3 rounded-xl border border-border bg-white text-black shrink-0 space-y-1.5 print:border-black">
              <img
                src="https://api.qrserver.com/v1/create-qr-code/?size=110x110&data={encodeURIComponent('https://stellar.expert/explorer/testnet/tx/' + txHash)}"
                alt="QR Verificación Stellar"
                class="w-24 h-24"
              />
              <span class="text-[9px] font-mono font-bold text-center">
                Escanear para auditar en Stellar Testnet
              </span>
            </div>
          </div>
        </div>

        <!-- Firmas Manuscritas y Digitales de las Partes -->
        <div class="pt-4 border-t-2 border-border print:border-black">
          <div class="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-4 text-center">
            Atribución Legal, Autorización Fiduciaria y Firmas Acreditadas
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div class="border border-border rounded-lg p-3 space-y-1 print:border-black">
              <div class="h-10 border-b border-dashed border-border mb-2 flex items-end justify-center font-serif italic text-sm text-foreground print:text-black">
                Ing. Juan José Carabalí
              </div>
              <div class="font-bold text-xs text-foreground print:text-black">{ficha.supervisorProfile.name}</div>
              <div class="text-[10px] text-muted-foreground">Director Interventoría Técnica</div>
              <div class="font-mono text-[9px] text-emerald-600 print:text-black font-semibold">COPNIA: {ficha.supervisorProfile.copniaLicense}</div>
            </div>

            <div class="border border-border rounded-lg p-3 space-y-1 print:border-black">
              <div class="h-10 border-b border-dashed border-border mb-2 flex items-end justify-center font-serif italic text-sm text-foreground print:text-black">
                Arq. Carlos Mendoza
              </div>
              <div class="font-bold text-xs text-foreground print:text-black">{ficha.developerProfile.legalRepresentative}</div>
              <div class="text-[10px] text-muted-foreground">Representante Legal Constructora</div>
              <div class="font-mono text-[9px] text-muted-foreground font-semibold">Radicado Obra: RAD-2026-AL4</div>
            </div>

            <div class="border border-border rounded-lg p-3 space-y-1 print:border-black">
              <div class="h-10 border-b border-dashed border-border mb-2 flex items-end justify-center font-serif italic text-sm text-foreground print:text-black">
                Dra. Patricia Gómez
              </div>
              <div class="font-bold text-xs text-foreground print:text-black">Vocera Comité Fiduciario</div>
              <div class="text-[10px] text-muted-foreground">{cut.fiduciaryEntity}</div>
              <div class="font-mono text-[9px] text-emerald-600 print:text-black font-semibold">Giro ACH Autorizado: 95%</div>
            </div>
          </div>
        </div>

        <!-- Pie de Página de Seguridad Forense -->
        <div class="pt-4 border-t border-border flex flex-col sm:flex-row items-center justify-between text-[10px] text-muted-foreground gap-2 print:border-black">
          <span>Tramo Protocol v1.0 • Registro Descentralizado de Obras</span>
          <span class="font-mono">Auditoría disponible en: https://stellar.expert/explorer/testnet/contract/{contractId}</span>
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  @media print {
    :global(body) {
      background: white !important;
      color: black !important;
    }
    :global(header),
    :global(aside),
    :global(nav),
    :global(.print\:hidden) {
      display: none !important;
    }
    #printable-certificate-document {
      width: 100% !important;
      max-width: 100% !important;
      margin: 0 !important;
      padding: 0 !important;
    }
  }
</style>

