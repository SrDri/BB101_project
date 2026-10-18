<script lang="ts">
  import { ShieldCheck, ExternalLink } from '@lucide/svelte';
  import { Card, CardContent } from '$lib/components/ui/card';
  import { Badge } from '$lib/components/ui/badge';

  interface Props {
    isValid: boolean;
    corteNumber: number;
    projectName: string;
    interventorName: string;
    blockTimestamp: string;
    computedHash: string;
    onchainHash: string;
    ledgerSequence?: number;
    contractId?: string;
  }

  let {
    corteNumber,
    projectName,
    interventorName,
    blockTimestamp,
    onchainHash,
    ledgerSequence = 5264904,
    contractId = 'CB5L2JGJIAXUUORKHBJFGLS5Y3BOW6LE44WEQ23JEK3KTIN2I252H44T'
  }: Props = $props();
</script>

<Card class="bg-card border-border shadow-sm w-full">
  <CardContent class="p-6 space-y-6">
    <!-- Cabecera del veredicto -->
    <div class="flex items-center gap-3.5 pb-5 border-b border-border">
      <div class="w-11 h-11 rounded-lg bg-muted border border-border flex items-center justify-center text-emerald-500 shrink-0">
        <ShieldCheck class="w-6 h-6" />
      </div>
      <div class="space-y-1">
        <div class="flex items-center gap-2">
          <Badge variant="outline" class="text-[11px] font-normal bg-muted/60 text-foreground border-border gap-1.5">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span>Coincidencia criptográfica verificada</span>
          </Badge>
          <span class="text-xs text-muted-foreground">• Stellar Soroban</span>
        </div>
        <h2 class="text-lg font-semibold text-foreground tracking-tight">
          Certificado auténtico e inalterado
        </h2>
      </div>
    </div>

    <!-- Detalles de auditoría -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
      <div class="p-3.5 bg-muted/30 rounded-lg border border-border space-y-1">
        <span class="text-[11px] text-muted-foreground block">Proyecto y corte</span>
        <div class="font-semibold text-foreground">{projectName}</div>
        <div class="text-muted-foreground tabular-nums">Corte #{corteNumber}</div>
      </div>

      <div class="p-3.5 bg-muted/30 rounded-lg border border-border space-y-1">
        <span class="text-[11px] text-muted-foreground block">Interventor firmante</span>
        <div class="font-semibold text-foreground">{interventorName}</div>
        <div class="text-muted-foreground">Matrícula profesional validada</div>
      </div>

      <div class="p-3.5 bg-muted/30 rounded-lg border border-border space-y-1">
        <span class="text-[11px] text-muted-foreground block">Fecha de sellado en ledger</span>
        <div class="font-semibold text-foreground tabular-nums truncate">{blockTimestamp}</div>
        <div class="text-muted-foreground tabular-nums">Bloque #{ledgerSequence}</div>
      </div>

      <div class="p-3.5 bg-muted/30 rounded-lg border border-border space-y-1">
        <span class="text-[11px] text-muted-foreground block">Integridad del documento</span>
        <div class="font-semibold text-foreground">Coincidencia exacta (256 bits)</div>
        <div class="text-muted-foreground">Hash local idéntico al registro en red</div>
      </div>
    </div>

    <!-- Huella SHA-256 -->
    <div class="space-y-1.5 p-3.5 bg-muted/30 rounded-lg border border-border text-xs">
      <div class="flex items-center justify-between text-muted-foreground text-[11px]">
        <span>Huella SHA-256 inscrita en el contrato Soroban</span>
        <a
          href="https://stellar.expert/explorer/testnet/contract/{contractId}"
          target="_blank"
          rel="noopener noreferrer"
          class="text-foreground underline underline-offset-4 hover:text-[#F5A400] flex items-center gap-1"
        >
          <span>Ver en explorador</span>
          <ExternalLink class="w-3 h-3" />
        </a>
      </div>
      <div class="text-foreground font-mono break-all select-all text-[11px] bg-background p-2.5 rounded border border-border tabular-nums">
        {onchainHash}
      </div>
    </div>
  </CardContent>
</Card>
