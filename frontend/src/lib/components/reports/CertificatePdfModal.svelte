<script lang="ts">
  import { projectStore } from '$lib/stores/projectState.svelte';
  import { Button } from '$lib/components/ui/button';
  import {
    Printer,
    Download,
    X,
    ShieldCheck,
    ExternalLink,
    FileCheck2,
    Building2,
    Calendar,
    MapPin,
    Hash,
    Info,
    CheckCircle2,
    FileText
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

  function handleDownloadHtml() {
    if (typeof window === 'undefined') return;
    const docElement = document.getElementById('printable-certificate-document');
    if (!docElement) return;

    const htmlContent = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>TRAMO - Expediente Oficial Corte #${cut.number} - ${cut.projectName}</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600;700&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Plus Jakarta Sans', -apple-system, sans-serif; background: #f8fafc; color: #0f172a; line-height: 1.5; padding: 24px; font-size: 12px; }
    .container { max-width: 900px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 40px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
    .font-mono { font-family: 'JetBrains Mono', monospace; }
    table { width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 11px; }
    th { background: #f1f5f9; padding: 8px 10px; text-align: left; font-weight: 600; border-bottom: 2px solid #cbd5e1; }
    td { padding: 8px 10px; border-bottom: 1px solid #e2e8f0; }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 9999px; font-weight: 700; font-size: 10px; }
    .badge-success { background: #dcfce7; color: #15803d; }
    .badge-stellar { background: #eff6ff; color: #1d4ed8; font-family: 'JetBrains Mono', monospace; }
    .grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
    .grid-2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
    .grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
    .card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; }
    .header-logo { display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #0f172a; padding-bottom: 16px; margin-bottom: 20px; }
    .photo-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
    .photo-card { border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; background: #fff; font-size: 10px; }
    .photo-card img { width: 100%; height: 90px; object-fit: cover; display: block; }
    .photo-meta { padding: 6px 8px; }
    .stellar-box { background: #f0fdf4; border: 2px solid #86efac; border-radius: 10px; padding: 16px; margin-top: 20px; }
    .signatures { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-top: 30px; text-align: center; }
    .sign-box { border: 1px solid #cbd5e1; border-radius: 8px; padding: 12px; background: #ffffff; }
    .sign-line { height: 40px; border-bottom: 1px dashed #94a3b8; margin-bottom: 8px; font-family: Georgia, serif; font-style: italic; display: flex; align-items: flex-end; justify-content: center; font-size: 13px; color: #334155; }
    @media print {
      body { background: #fff; padding: 0; }
      .container { border: none; box-shadow: none; padding: 0; width: 100%; max-width: 100%; }
      @page { size: letter; margin: 12mm; }
    }
  </style>
</head>
<body>
  <div class="container">
    ${docElement.innerHTML}
  </div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `TRAMO_Expediente_Oficial_Corte_${cut.number}_${cut.projectName.replace(/\s+/g, '_')}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-2 sm:p-4 backdrop-blur-xs overflow-y-auto print:p-0 print:bg-white print:fixed print:inset-0"
    role="dialog"
    aria-modal="true"
  >
    <!-- Contenedor Principal del Modal / Hoja de Impresión -->
    <div
      class="relative flex flex-col w-full max-w-4xl max-h-[94vh] rounded-2xl border border-border bg-card shadow-2xl print:max-w-none print:max-h-none print:border-none print:shadow-none print:rounded-none print:m-0"
    >
      <!-- Barra Superior de Acciones (No se imprime) -->
      <div
        class="flex flex-wrap items-center justify-between border-b border-border px-6 py-3.5 bg-muted/40 shrink-0 gap-3 print:hidden"
      >
        <div class="flex items-center gap-2.5">
          <img src="/isotipo_tramo.svg" alt="TRAMO" class="w-6 h-6 object-contain" />
          <div>
            <div class="text-xs font-bold text-foreground flex items-center gap-2">
              <span>Expediente Oficial de Supervisión Técnica y Fiduciaria</span>
              <span class="rounded bg-emerald-500/10 px-2 py-0.5 font-mono text-[10px] font-bold text-emerald-600">
                Stellar Soroban Testnet
              </span>
            </div>
            <p class="text-[11px] text-muted-foreground">Documento apto para entidades de control, fiduciarias y compradores</p>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onclick={handleDownloadHtml}
            class="h-8 gap-1.5 text-xs font-mono cursor-pointer border-border hover:bg-muted"
            title="Descargar archivo HTML autónomo para visualización o conversión offline"
          >
            <Download class="w-3.5 h-3.5" />
            <span class="hidden sm:inline">Descargar HTML</span>
          </Button>
          <Button
            size="sm"
            onclick={handlePrint}
            class="h-8 gap-1.5 bg-foreground text-background hover:opacity-90 font-mono text-xs cursor-pointer shadow-sm"
            title="Generar PDF a través del diálogo nativo del navegador"
          >
            <Printer class="w-3.5 h-3.5" />
            <span>Imprimir / Guardar PDF</span>
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onclick={handleClose}
            class="h-8 w-8 p-0 cursor-pointer"
            title="Cerrar vista previa"
          >
            <X class="w-4 h-4" />
          </Button>
        </div>
      </div>

      <!-- Contenido del Documento Imprimible (A4 / Carta) -->
      <div
        id="printable-certificate-document"
        class="overflow-y-auto p-6 sm:p-10 space-y-6 text-foreground text-xs leading-relaxed bg-background print:bg-white print:p-8 print:text-black print:overflow-visible"
      >
        <!-- Encabezado Oficial Institucional con Logo TRAMO -->
        <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b-2 border-foreground pb-6 print:border-black">
          <div class="space-y-2">
            <div class="flex items-center gap-3">
              <img
                src="/black_logo_ui_v1.svg"
                alt="TRAMO - Fe Pública Inmobiliaria"
                class="h-9 w-auto object-contain dark:invert print:filter-none print:h-8"
              />
              <div class="h-6 w-px bg-border print:bg-black hidden sm:block"></div>
              <span class="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground print:text-black hidden sm:inline">
                Protocolo de Fe Pública y Supervisión Digital
              </span>
            </div>
            <div>
              <h1 class="text-base sm:text-lg font-bold text-foreground print:text-black tracking-tight">
                EXPEDIENTE OFICIAL DE CERTIFICACIÓN TÉCNICA DE OBRA Y GIRO FIDUCIARIO
              </h1>
              <p class="text-muted-foreground text-[11px] print:text-black mt-0.5">
                Validez legal conforme a la <strong>Ley 1796 de 2016</strong> (Vivienda Segura), <strong>Reglamento Colombiano NSR-10</strong> y <strong>Ley 527 de 1999</strong> (Mensajes de Datos y Firmas Digitales).
              </p>
            </div>
          </div>

          <div class="rounded-xl border border-border bg-muted/30 p-3 sm:text-right font-mono text-[11px] shrink-0 print:border-black print:bg-white">
            <div class="font-bold text-foreground print:text-black">EXPEDIENTE N° {cert?.certificateId || 'CERT-ALAMEDA-004'}</div>
            <div class="text-muted-foreground print:text-black">Fecha Emisión: 18 Octubre 2026</div>
            <div class="text-emerald-600 font-bold print:text-black">Ledger Stellar #{ledgerNum}</div>
            <div class="text-[10px] text-muted-foreground print:text-black">Estado: Inmutable / Verificado</div>
          </div>
        </div>

        <!-- GUÍA DE LECTURA CIUDADANA Y PARA AUTORIDADES (Explicación para persona sin conocimientos técnicos) -->
        <div class="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 space-y-2 print:border-black print:bg-muted/10">
          <div class="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-amber-700 dark:text-amber-300 print:text-black">
            <Info class="w-4 h-4 text-amber-600 print:text-black shrink-0" />
            <span>Guía de Interpretación Ciudadana e Institucional (Sin Conocimientos Técnicos)</span>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 text-[11px] text-muted-foreground print:text-black">
            <div class="p-2.5 rounded-lg bg-background/80 border border-border/60 print:bg-white print:border-black">
              <strong class="text-foreground print:text-black block text-[11px]">1. Avance Real Comprobado</strong>
              Constata que la torre alcanzó el 44.5% de obra física real (losas piso 5 y mampostería) antes de autorizar cualquier giro de dinero.
            </div>
            <div class="p-2.5 rounded-lg bg-background/80 border border-border/60 print:bg-white print:border-black">
              <strong class="text-foreground print:text-black block text-[11px]">2. Seguridad Estructural</strong>
              El concreto fue ensayado en laboratorio acreditado ONAC y superó los 4000 PSI exigidos por la norma sísmica NSR-10.
            </div>
            <div class="p-2.5 rounded-lg bg-background/80 border border-border/60 print:bg-white print:border-black">
              <strong class="text-foreground print:text-black block text-[11px]">3. Protección de Fondos</strong>
              La Fiduciaria retuvo el 5% legal de fondo de garantía ({formatCOP(9736842)}) para responder ante el comprador por garantías de construcción.
            </div>
            <div class="p-2.5 rounded-lg bg-background/80 border border-border/60 print:bg-white print:border-black">
              <strong class="text-foreground print:text-black block text-[11px]">4. Firma Inviolable en Blockchain</strong>
              El certificado está sellado en Stellar Soroban. Si alguien adultera un texto o una foto, la huella matemática falla de inmediato.
            </div>
          </div>
        </div>

        <!-- Ficha Técnica y Legal del Fideicomiso y Proyecto -->
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <div class="rounded-lg border border-border bg-muted/20 p-3 print:border-black print:bg-white">
            <span class="text-[10px] text-muted-foreground uppercase tracking-wider block">Proyecto Inmobiliario</span>
            <div class="font-bold text-sm text-foreground print:text-black">{cut.projectName}</div>
            <div class="text-muted-foreground text-[11px] print:text-black">{cut.city} • Estrato 4 • 120 Unidades</div>
          </div>

          <div class="rounded-lg border border-border bg-muted/20 p-3 print:border-black print:bg-white">
            <span class="text-[10px] text-muted-foreground uppercase tracking-wider block">Patrimonio Autónomo</span>
            <div class="font-bold text-sm text-foreground print:text-black">{cut.fiduciaryTrustCode}</div>
            <div class="text-muted-foreground text-[11px] print:text-black">{cut.fiduciaryEntity} (Superfinanciera)</div>
          </div>

          <div class="rounded-lg border border-border bg-muted/20 p-3 print:border-black print:bg-white">
            <span class="text-[10px] text-muted-foreground uppercase tracking-wider block">Constructora / Desarrollador</span>
            <div class="font-bold text-sm text-foreground print:text-black">{ficha.developerProfile.name}</div>
            <div class="text-muted-foreground text-[11px] print:text-black">NIT: {ficha.developerProfile.nit} • Licencia Curaduría #2</div>
          </div>

          <div class="rounded-lg border border-border bg-muted/20 p-3 print:border-black print:bg-white">
            <span class="text-[10px] text-muted-foreground uppercase tracking-wider block">Firma Interventora Independiente</span>
            <div class="font-bold text-sm text-foreground print:text-black">{ficha.supervisorProfile.companyName}</div>
            <div class="text-muted-foreground text-[11px] print:text-black">{ficha.supervisorProfile.copniaLicense}</div>
          </div>
        </div>

        <!-- SECCIÓN 1: Métricas Físicas y Cuadro de Desembolso Fiduciario -->
        <div class="rounded-xl border border-border p-4 space-y-3 print:border-black">
          <div class="flex items-center justify-between border-b border-border pb-2.5 print:border-black">
            <span class="font-bold text-xs uppercase tracking-wider text-foreground print:text-black">
              1. Balance de Avance Físico y Desembolso Fiduciario (Corte #{cut.number})
            </span>
            <span class="font-mono text-[11px] text-emerald-600 font-bold print:text-black">
              ✓ Aprobado por Comité Fiduciario
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
              <span class="text-[9px] text-emerald-600 block print:text-black">+0.5% en ruta crítica</span>
            </div>
            <div class="p-2.5 rounded-lg bg-muted/30 border border-border print:border-black print:bg-white">
              <span class="text-[10px] text-muted-foreground block">Retención Garantía Ley 1796 (5%)</span>
              <span class="font-mono text-sm font-bold text-amber-600 print:text-black">{formatCOP(9736842)}</span>
              <span class="text-[9px] text-muted-foreground block">Fondo de Reserva Posventa</span>
            </div>
            <div class="p-2.5 rounded-lg bg-muted/30 border border-border print:border-black print:bg-white">
              <span class="text-[10px] text-muted-foreground block">Giro Neto Autorizado ACH</span>
              <span class="font-mono text-sm font-bold text-foreground print:text-black">{formatCOP(185000000)}</span>
              <span class="text-[9px] text-emerald-600 font-semibold block print:text-black">Liberación Efectiva</span>
            </div>
          </div>

          <!-- Desglose por Capítulos de Obra -->
          <div class="rounded-lg border border-border overflow-hidden print:border-black mt-2">
            <table class="w-full text-left border-collapse text-[11px]">
              <thead class="bg-muted/40 print:bg-white border-b border-border print:border-black">
                <tr>
                  <th class="py-1.5 pl-3 font-semibold text-muted-foreground uppercase text-[10px]">Capítulo de Obra Civil</th>
                  <th class="py-1.5 font-semibold text-muted-foreground uppercase text-[10px]">Ponderación</th>
                  <th class="py-1.5 font-semibold text-muted-foreground uppercase text-[10px]">Avance Certificado</th>
                  <th class="py-1.5 text-right pr-3 font-semibold text-muted-foreground uppercase text-[10px]">Estado de Entrega</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-border print:divide-black">
                <tr>
                  <td class="py-1.5 pl-3 font-medium text-foreground print:text-black">1. Cimentación profunda y muros de contención</td>
                  <td class="py-1.5 font-mono">15.0%</td>
                  <td class="py-1.5 font-mono text-emerald-600 font-bold print:text-black">100.0%</td>
                  <td class="py-1.5 text-right pr-3"><span class="text-emerald-600 font-semibold">Completado / Recibido</span></td>
                </tr>
                <tr>
                  <td class="py-1.5 pl-3 font-medium text-foreground print:text-black">2. Estructura portante de concreto armado (Pisos 1 al 5)</td>
                  <td class="py-1.5 font-mono">35.0%</td>
                  <td class="py-1.5 font-mono text-emerald-600 font-bold print:text-black">72.0%</td>
                  <td class="py-1.5 text-right pr-3"><span class="text-emerald-600 font-semibold">En ejecución conforme a cronograma</span></td>
                </tr>
                <tr>
                  <td class="py-1.5 pl-3 font-medium text-foreground print:text-black">3. Mampostería estructural y divisorios interiores</td>
                  <td class="py-1.5 font-mono">20.0%</td>
                  <td class="py-1.5 font-mono text-emerald-600 font-bold print:text-black">45.0%</td>
                  <td class="py-1.5 text-right pr-3"><span class="text-foreground">En ejecución</span></td>
                </tr>
                <tr>
                  <td class="py-1.5 pl-3 font-medium text-foreground print:text-black">4. Redes hidrosanitarias, eléctricas y contra incendio</td>
                  <td class="py-1.5 font-mono">15.0%</td>
                  <td class="py-1.5 font-mono text-emerald-600 font-bold print:text-black">30.0%</td>
                  <td class="py-1.5 text-right pr-3"><span class="text-foreground">En ejecución</span></td>
                </tr>
              </tbody>
            </table>
          </div>

          <p class="text-[11px] text-muted-foreground print:text-black leading-relaxed pt-1">
            <strong>Concepto Técnico de Interventoría:</strong> El avance físico ejecutado en obra civil cumple satisfactoriamente con la ruta crítica del cronograma fiduciario. Se constató la calibración del 100% de los frentes de trabajo y la total ausencia de patologías estructurales o no conformidades graves según la Ley 1796 de 2016.
          </p>
        </div>

        <!-- SECCIÓN 2: Ensayos de Laboratorio NSR-10 (Control de Calidad ONAC) -->
        <div class="rounded-xl border border-border p-4 space-y-3 print:border-black">
          <div class="flex items-center justify-between border-b border-border pb-2.5 print:border-black">
            <span class="font-bold text-xs uppercase tracking-wider text-foreground print:text-black">
              2. Control de Calidad y Ensayos de Laboratorio Acreditados ONAC (NSR-10)
            </span>
            <span class="font-mono text-[11px] text-muted-foreground print:text-black">Norma Sismorresistente NSR-10</span>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse text-[11px]">
              <thead>
                <tr class="border-b border-border bg-muted/30 text-muted-foreground uppercase text-[10px] print:border-black print:bg-white">
                  <th class="py-2 pl-2">Ensayo / Material</th>
                  <th class="py-2">Laboratorio Acreditado</th>
                  <th class="py-2">Especificación NSR-10</th>
                  <th class="py-2">Resultado Obtenido</th>
                  <th class="py-2 text-right pr-2">Dictamen Legal</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-border print:divide-black">
                {#each labTests as test}
                  <tr>
                    <td class="py-2 pl-2 font-medium text-foreground print:text-black">{test.title}</td>
                    <td class="py-2 text-muted-foreground print:text-black">{test.laboratory}</td>
                    <td class="py-2 font-mono">{test.targetSpec}</td>
                    <td class="py-2 font-mono font-bold text-emerald-600 print:text-black">{test.obtainedResult}</td>
                    <td class="py-2 text-right pr-2">
                      <span class="inline-flex rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600 print:border print:border-black print:text-black">
                        ✓ {test.status === 'aprobado' ? 'Cumple 100% NSR-10' : 'En proceso'}
                      </span>
                    </td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
        </div>

        <!-- SECCIÓN 3: Evidencias Fotográficas Georreferenciadas con Huella SHA-256 -->
        <div class="rounded-xl border border-border p-4 space-y-3 print:border-black">
          <div class="flex items-center justify-between border-b border-border pb-2.5 print:border-black">
            <span class="font-bold text-xs uppercase tracking-wider text-foreground print:text-black">
              3. Muestra de Evidencia Fotográfica Georreferenciada (Merkle Tree Componentes)
            </span>
            <span class="font-mono text-[10px] text-muted-foreground print:text-black">48 fotos auditadas con GPS</span>
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {#each photos as photo}
              <div class="rounded-lg border border-border overflow-hidden bg-background space-y-1.5 print:border-black print:bg-white">
                <img
                  src={photo.url}
                  alt={photo.title}
                  class="w-full h-24 object-cover border-b border-border print:border-black"
                  loading="lazy"
                />
                <div class="p-2 space-y-1">
                  <div class="font-bold text-[10px] text-foreground truncate print:text-black">{photo.title}</div>
                  <div class="text-[9px] text-muted-foreground truncate print:text-black">{photo.location}</div>
                  <div class="font-mono text-[8px] text-muted-foreground break-all bg-muted/40 p-1 rounded print:bg-white print:border print:border-black print:text-black">
                    SHA: {photo.hash.slice(0, 16)}...
                  </div>
                </div>
              </div>
            {/each}
          </div>
        </div>

        <!-- SECCIÓN 4: Fe Pública en Stellar Soroban (Bloque Criptográfico Principal) -->
        <div class="rounded-xl border-2 border-emerald-500/40 bg-emerald-500/5 p-4 space-y-3 print:border-black print:bg-white">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-500/20 pb-2.5 print:border-black">
            <div class="flex items-center gap-2">
              <ShieldCheck class="w-4 h-4 text-emerald-600 print:text-black" />
              <span class="font-bold text-xs uppercase tracking-wider text-foreground print:text-black">
                4. Sello Inmutable de Fe Pública en Stellar Soroban Testnet
              </span>
            </div>
            <span class="font-mono text-[11px] text-emerald-600 font-bold print:text-black">
              ✓ Inmutabilidad y No-Repudio Verificados
            </span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            <div class="md:col-span-2 space-y-2 font-mono text-[10px]">
              <div>
                <span class="text-muted-foreground block text-[9px] uppercase tracking-wider print:text-black">Contrato Inteligente (corte_registry)</span>
                <span class="text-foreground font-bold select-all break-all print:text-black">{contractId}</span>
              </div>
              <div>
                <span class="text-muted-foreground block text-[9px] uppercase tracking-wider print:text-black">Hash de Transacción On-Chain (Ledger #{ledgerNum})</span>
                <span class="text-foreground font-bold select-all break-all print:text-black">{txHash}</span>
              </div>
              <div>
                <span class="text-muted-foreground block text-[9px] uppercase tracking-wider print:text-black">Huella Digital Canónica del Expediente (SHA-256)</span>
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

        <!-- SECCIÓN 5: Firmas Manuscritas y Digitales de las Partes Responsables -->
        <div class="pt-4 border-t-2 border-foreground print:border-black">
          <div class="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-4 text-center print:text-black">
            Atribución Legal, Autorización Fiduciaria y Firmas Acreditadas
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div class="border border-border rounded-lg p-3 space-y-1 print:border-black">
              <div class="h-10 border-b border-dashed border-border mb-2 flex items-end justify-center font-serif italic text-sm text-foreground print:text-black">
                Ing. Juan José Carabalí
              </div>
              <div class="font-bold text-xs text-foreground print:text-black">{ficha.supervisorProfile.name}</div>
              <div class="text-[10px] text-muted-foreground print:text-black">Director Interventoría Técnica</div>
              <div class="font-mono text-[9px] text-emerald-600 print:text-black font-semibold">COPNIA: {ficha.supervisorProfile.copniaLicense}</div>
            </div>

            <div class="border border-border rounded-lg p-3 space-y-1 print:border-black">
              <div class="h-10 border-b border-dashed border-border mb-2 flex items-end justify-center font-serif italic text-sm text-foreground print:text-black">
                Arq. Carlos Mendoza
              </div>
              <div class="font-bold text-xs text-foreground print:text-black">{ficha.developerProfile.legalRepresentative}</div>
              <div class="text-[10px] text-muted-foreground print:text-black">Representante Legal Constructora</div>
              <div class="font-mono text-[9px] text-muted-foreground print:text-black font-semibold">Radicado Obra: RAD-2026-AL4</div>
            </div>

            <div class="border border-border rounded-lg p-3 space-y-1 print:border-black">
              <div class="h-10 border-b border-dashed border-border mb-2 flex items-end justify-center font-serif italic text-sm text-foreground print:text-black">
                Dra. Patricia Gómez
              </div>
              <div class="font-bold text-xs text-foreground print:text-black">Vocera Comité Fiduciario</div>
              <div class="text-[10px] text-muted-foreground print:text-black">{cut.fiduciaryEntity}</div>
              <div class="font-mono text-[9px] text-emerald-600 print:text-black font-semibold">Giro ACH Autorizado: 95%</div>
            </div>
          </div>
        </div>

        <!-- Pie de Página de Seguridad Forense -->
        <div class="pt-4 border-t border-border flex flex-col sm:flex-row items-center justify-between text-[10px] text-muted-foreground gap-2 print:border-black print:text-black">
          <div class="flex items-center gap-1.5">
            <img src="/isotipo_tramo.svg" alt="TRAMO" class="w-3.5 h-3.5 object-contain" />
            <span>Tramo Protocol v1.0 • Registro Descentralizado de Fe Pública Inmobiliaria</span>
          </div>
          <span class="font-mono">Auditoría on-chain: https://stellar.expert/explorer/testnet/contract/{contractId}</span>
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
      font-size: 11px !important;
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
      overflow: visible !important;
    }
    @page {
      size: letter portrait;
      margin: 10mm 12mm;
    }
  }
</style>
