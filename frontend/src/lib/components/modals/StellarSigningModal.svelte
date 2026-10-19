<script lang="ts">
  import { 
    ShieldCheck, 
    CheckCircle2, 
    Lock, 
    ExternalLink, 
    Copy, 
    Check, 
    FileText, 
    X,
    Cpu,
    ArrowRight
  } from '@lucide/svelte';
  import { Button } from '$lib/components/ui/button';
  import { Badge } from '$lib/components/ui/badge';

  interface Props {
    open: boolean;
    projectName: string;
    corteNumber: number;
    interventorName: string;
    copniaLicense: string;
    physicalPercent: number;
    disbursementCOP: number;
    computedHash: string;
    sealedTxHash: string;
    isSealing: boolean;
    isSealed: boolean;
    sealStep: string;
    onSign: () => void;
    onClose: () => void;
    onOpenPdf: () => void;
  }

  let {
    open,
    projectName,
    corteNumber,
    interventorName,
    copniaLicense,
    physicalPercent,
    disbursementCOP,
    computedHash,
    sealedTxHash,
    isSealing,
    isSealed,
    sealStep,
    onSign,
    onClose,
    onOpenPdf
  }: Props = $props();

  let copiedHash = $state(false);
  let copiedTx = $state(false);

  function copyToClipboard(text: string, type: 'hash' | 'tx') {
    navigator.clipboard.writeText(text);
    if (type === 'hash') {
      copiedHash = true;
      setTimeout(() => (copiedHash = false), 2000);
    } else {
      copiedTx = true;
      setTimeout(() => (copiedTx = false), 2000);
    }
  }

  function formatCOP(amount: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0
    }).format(amount);
  }
</script>

{#if open}
  <div class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6">
    <!-- Backdrop con desenfoque de estudio cinematográfico -->
    <div 
      class="fixed inset-0 bg-black/75 backdrop-blur-md transition-opacity duration-300"
      onclick={onClose}
      role="presentation"
    ></div>

    <!-- Tarjeta del Modal -->
    <div 
      class="relative w-full max-w-xl rounded-2xl border border-border bg-card text-card-foreground shadow-2xl overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200"
    >
      <!-- Cabecera Institucional con Gradiente de Red Stellar -->
      <div class="relative px-6 py-5 border-b border-border bg-gradient-to-r from-muted/50 via-card to-muted/30">
        <button
          type="button"
          onclick={onClose}
          class="absolute top-4 right-4 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors cursor-pointer"
        >
          <X class="w-4 h-4" />
        </button>

        <div class="flex items-center gap-2.5 mb-1.5">
          <div class="p-1.5 rounded-lg bg-[#F5A400]/15 text-[#F5A400]">
            <Cpu class="w-4 h-4" />
          </div>
          <Badge variant="outline" class="text-[11px] font-mono border-border bg-background/80">
            Stellar Soroban Testnet
          </Badge>
          <span class="text-xs text-muted-foreground">• Contrato Inteligente</span>
        </div>

        <h3 class="text-lg font-bold text-foreground tracking-tight">
          {#if isSealed}
            Transacción Confirmada en Stellar Soroban
          {:else if isSealing}
            Transmitiendo Dictamen a la Red Stellar...
          {:else}
            Firma Digital & Sellado Criptográfico en Blockchain
          {/if}
        </h3>
        <p class="text-xs text-muted-foreground">
          {projectName} · Corte #{corteNumber} · Dictamen de Interventoría Ley 1796
        </p>
      </div>

      <!-- Cuerpo del Modal -->
      <div class="p-6 space-y-5">
        
        <!-- ESTADO 1: PREVIO A LA FIRMA (RESUMEN AUDITABLE) -->
        {#if !isSealed && !isSealing}
          <div class="grid grid-cols-2 gap-3">
            <div class="p-3 rounded-xl border border-border bg-muted/20">
              <span class="text-[10px] uppercase font-semibold text-muted-foreground block">Avance Físico Avalado</span>
              <span class="text-lg font-mono font-bold text-foreground mt-0.5 block">{physicalPercent.toFixed(1)}%</span>
            </div>
            <div class="p-3 rounded-xl border border-border bg-muted/20">
              <span class="text-[10px] uppercase font-semibold text-muted-foreground block">Giro Habilitado</span>
              <span class="text-lg font-mono font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 block">{formatCOP(disbursementCOP)}</span>
            </div>
          </div>

          <div class="rounded-xl border border-border bg-muted/10 p-3.5 space-y-2 text-xs">
            <div class="flex justify-between items-center text-muted-foreground pb-2 border-b border-border/60">
              <span>Interventor Titular:</span>
              <strong class="text-foreground">{interventorName}</strong>
            </div>
            <div class="flex justify-between items-center text-muted-foreground pb-2 border-b border-border/60">
              <span>Matrícula COPNIA:</span>
              <span class="font-mono text-foreground">{copniaLicense}</span>
            </div>
            <div class="flex justify-between items-center text-muted-foreground pb-2 border-b border-border/60">
              <span>Ensayos de Concreto NSR-10:</span>
              <span class="text-emerald-600 font-semibold flex items-center gap-1">
                <CheckCircle2 class="w-3.5 h-3.5" /> 100% Calibrados
              </span>
            </div>
            <div class="flex justify-between items-center text-muted-foreground">
              <span>Comisión de Red (Gas):</span>
              <span class="font-mono text-foreground">0.00001 XLM (Patrocinado por Tramo)</span>
            </div>
          </div>

          <div class="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-[11px] text-amber-800 dark:text-amber-300 leading-relaxed">
            Al confirmar, se generará la huella matemática SHA-256 de todas las pruebas de laboratorio y fotos de obra, registrándolas de forma irreversible en el contrato Soroban.
          </div>

          <Button
            onclick={onSign}
            class="w-full py-5 bg-[#F5A400] hover:bg-[#E09400] text-[#121212] font-bold text-xs sm:text-sm cursor-pointer gap-2 shadow-amber-glow"
          >
            <Lock class="w-4 h-4" />
            <span>Firmar Dictamen y Transmitir a Soroban</span>
          </Button>

        <!-- ESTADO 2: PROCESANDO TRANSACCIÓN EN SOROBAN -->
        {:else if isSealing}
          <div class="py-6 space-y-5 text-center">
            <!-- Spinner Pulsante -->
            <div class="relative mx-auto w-16 h-16 flex items-center justify-center">
              <div class="absolute inset-0 rounded-full border-4 border-[#F5A400]/20 animate-ping"></div>
              <div class="w-16 h-16 rounded-full border-4 border-[#F5A400] border-t-transparent animate-spin"></div>
              <Cpu class="w-6 h-6 text-[#F5A400] absolute" />
            </div>

            <div class="space-y-1.5">
              <h4 class="text-base font-semibold text-foreground tracking-tight">
                Inscribiendo en Ledger Descentralizado
              </h4>
              <p class="text-xs font-mono text-[#F5A400] animate-pulse">
                {sealStep}
              </p>
            </div>

            <!-- Pasos del ciclo de consenso -->
            <div class="max-w-xs mx-auto text-left space-y-2 text-[11px] font-mono text-muted-foreground pt-2">
              <div class="flex items-center gap-2 text-foreground">
                <CheckCircle2 class="w-3.5 h-3.5 text-emerald-500" />
                <span>Huella SHA-256 canónica generada</span>
              </div>
              <div class="flex items-center gap-2 text-foreground">
                <CheckCircle2 class="w-3.5 h-3.5 text-emerald-500" />
                <span>Firma profesional COPNIA verificada</span>
              </div>
              <div class="flex items-center gap-2 text-[#F5A400]">
                <div class="w-3.5 h-3.5 rounded-full border border-[#F5A400] border-t-transparent animate-spin"></div>
                <span>Invocando contrato Soroban (RPC)</span>
              </div>
              <div class="flex items-center gap-2 text-muted-foreground/60">
                <span class="w-3.5 h-3.5 rounded-full border border-border"></span>
                <span>Consenso de validadores Stellar</span>
              </div>
            </div>
          </div>

        <!-- ESTADO 3: SELLADO CONFIRMADO CON ÉXITO (INMUTABLE) -->
        {:else}
          <div class="space-y-4">
            <!-- Banner de Éxito -->
            <div class="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 flex items-center gap-3">
              <div class="p-2 rounded-full bg-emerald-500 text-black shrink-0">
                <Check class="w-5 h-5 stroke-[3]" />
              </div>
              <div>
                <h4 class="text-sm font-bold text-emerald-800 dark:text-emerald-300">
                  Dictamen Sellado e Inmutable
                </h4>
                <p class="text-xs text-muted-foreground">
                  Inscrito en el bloque de Stellar Testnet con fe pública digital.
                </p>
              </div>
            </div>

            <!-- Datos Criptográficos Verificables -->
            <div class="space-y-2.5 font-mono text-xs">
              <div class="p-3 rounded-lg border border-border bg-muted/20 space-y-1">
                <div class="flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>Huella Digital del Expediente (SHA-256):</span>
                  <button 
                    type="button" 
                    onclick={() => copyToClipboard(computedHash, 'hash')}
                    class="text-xs hover:text-foreground flex items-center gap-1 cursor-pointer"
                  >
                    {#if copiedHash}
                      <Check class="w-3 h-3 text-emerald-500" />
                      <span class="text-[10px] text-emerald-500 font-semibold">Copiado</span>
                    {:else}
                      <Copy class="w-3 h-3" />
                      <span class="text-[10px]">Copiar</span>
                    {/if}
                  </button>
                </div>
                <div class="text-[11px] text-emerald-600 dark:text-emerald-400 break-all select-all">
                  {computedHash}
                </div>
              </div>

              <div class="p-3 rounded-lg border border-border bg-muted/20 space-y-1">
                <div class="flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>Hash de Transacción Soroban:</span>
                  <a 
                    href="https://stellar.expert/explorer/testnet/tx/{sealedTxHash}"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="text-xs text-[#F5A400] hover:underline flex items-center gap-1"
                  >
                    <span>Stellar.Expert</span>
                    <ExternalLink class="w-3 h-3" />
                  </a>
                </div>
                <div class="text-[11px] text-foreground break-all select-all">
                  {sealedTxHash}
                </div>
              </div>
            </div>

            <!-- Botones de Acción -->
            <div class="flex flex-col sm:flex-row gap-2 pt-2">
              <Button
                onclick={onOpenPdf}
                class="flex-1 bg-foreground text-background hover:opacity-90 font-mono text-xs gap-1.5 cursor-pointer shadow-sm"
              >
                <FileText class="w-3.5 h-3.5" />
                <span>Ver Certificado PDF con QR</span>
              </Button>

              <Button
                href="/fiduciaria"
                class="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs gap-1.5"
              >
                <span>Proceder a Giro en Fiduciaria</span>
                <ArrowRight class="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        {/if}

      </div>
    </div>
  </div>
{/if}
