<script lang="ts">
  import { ShieldCheck, CheckCircle2, ArrowRight, ExternalLink, Lock } from '@lucide/svelte';
  import { Card, CardContent } from '$lib/components/ui/card';
  import { Button } from '$lib/components/ui/button';

  interface Props {
    corteId: string;
    montoSolicitadoCOP: number;
    sha256Hash: string;
    onAuthorize: () => Promise<void>;
  }

  let { corteId, montoSolicitadoCOP, sha256Hash, onAuthorize }: Props = $props();

  let isAuthorizing = $state(false);
  let isAuthorized = $state(false);

  async function handleApprove() {
    isAuthorizing = true;
    try {
      await onAuthorize();
      isAuthorized = true;
    } finally {
      isAuthorizing = false;
    }
  }
</script>

<Card class="bg-card border-border shadow-xs">
  <CardContent class="p-6">
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-border gap-4">
      <div class="flex items-center gap-3">
        <div class="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-500">
          <ShieldCheck class="w-6 h-6" />
        </div>
        <div>
          <h3 class="text-sm font-semibold text-foreground tracking-tight">Resolución Fiduciaria de Giro</h3>
          <p class="text-xs text-muted-foreground font-mono">Corte #{corteId} • Soporte de Interventoría Avalado</p>
        </div>
      </div>
      <div class="text-left sm:text-right font-mono">
        <div class="text-xs text-muted-foreground">Monto del Tramo a Desembolsar</div>
        <div class="text-xl font-bold text-[#F5A400] tracking-tight tabular-nums">
          ${montoSolicitadoCOP.toLocaleString('es-CO')} COP
        </div>
      </div>
    </div>

    <!-- Hash Inmutable con enlace al Explorer -->
    <div class="my-4 p-3.5 bg-muted/40 rounded-lg border border-border flex flex-col md:flex-row md:items-center justify-between gap-2">
      <div class="space-y-0.5 overflow-hidden">
        <div class="text-[10px] font-mono uppercase tracking-wider text-muted-foreground flex items-center gap-1">
          <Lock class="w-3 h-3 text-emerald-500" />
          Huella Digital Criptográfica (SHA-256) en Soroban
        </div>
        <div class="text-xs font-mono text-emerald-500 tracking-wide truncate max-w-[520px]">
          {sha256Hash}
        </div>
      </div>
      <a 
        href="https://stellar.expert/explorer/testnet/tx/{sha256Hash.slice(0, 16)}" 
        target="_blank" 
        class="inline-flex items-center gap-1 text-xs font-mono text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap"
      >
        <span>Ver en Stellar Expert</span>
        <ExternalLink class="w-3.5 h-3.5" />
      </a>
    </div>

    <!-- Botón de Autorización Fiduciaria -->
    {#if !isAuthorized}
      <Button
        onclick={handleApprove}
        disabled={isAuthorizing}
        class="w-full py-5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition-all cursor-pointer gap-2"
      >
        {#if isAuthorizing}
          <div class="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
          <span>Firmando Orden de Giro en Sistema Fiduciario...</span>
        {:else}
          <span>Autorizar Desembolso de Giro (Basado en Sello Inmutable)</span>
          <ArrowRight class="w-4 h-4" />
        {/if}
      </Button>
    {:else}
      <div class="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 font-mono text-xs font-semibold">
        <CheckCircle2 class="w-4 h-4" />
        <span>GIRO AUTORIZADO • HASH REGISTRADO EN COMPROBANTE FIDUCIARIO #FBD-2026-9912</span>
      </div>
    {/if}
  </CardContent>
</Card>
