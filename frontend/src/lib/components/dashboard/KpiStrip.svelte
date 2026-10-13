<script lang="ts">
  import { Card, CardContent } from '$lib/components/ui/card';
  import { Badge } from '$lib/components/ui/badge';
  import { projectStore } from '$lib/stores/projectState.svelte';

  let cut = $derived(projectStore.activeCut);
  let variance = $derived(+(cut.certifiedPhysicalProgress - cut.scheduledPhysicalProgress).toFixed(1));
</script>

<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
  <!-- Presupuesto total -->
  <Card class="bg-card border-border shadow-none">
    <CardContent class="p-5 space-y-1">
      <div class="text-xs text-muted-foreground font-medium">
        Presupuesto total de la obra
      </div>
      <div class="text-2xl font-semibold text-foreground tabular-nums tracking-tight">
        ${cut.totalBudgetCOP.toLocaleString('es-CO')}
      </div>
      <div class="text-[11px] text-muted-foreground">
        Encargo fiduciario mercantil (COP)
      </div>
    </CardContent>
  </Card>

  <!-- Giro solicitado -->
  <Card class="bg-card border-border shadow-none">
    <CardContent class="p-5 space-y-1">
      <div class="flex items-center justify-between">
        <span class="text-xs text-muted-foreground font-medium">Giro en evaluación</span>
        <Badge variant="outline" class="text-[10px] font-normal bg-muted/50 border-border">
          Corte #{cut.number}
        </Badge>
      </div>
      <div class="text-2xl font-semibold text-foreground tabular-nums tracking-tight">
        ${cut.cutDisbursementCOP.toLocaleString('es-CO')}
      </div>
      <div class="text-[11px] text-muted-foreground">
        Condicionado a soporte técnico
      </div>
    </CardContent>
  </Card>

  <!-- Avance físico -->
  <Card class="bg-card border-border shadow-none">
    <CardContent class="p-5 space-y-1">
      <div class="text-xs text-muted-foreground font-medium">
        Avance físico certificado
      </div>
      <div class="flex items-baseline gap-2">
        <span class="text-2xl font-semibold text-foreground tabular-nums tracking-tight">
          {cut.certifiedPhysicalProgress}%
        </span>
        <span class="text-xs text-muted-foreground tabular-nums">
          (programado: {cut.scheduledPhysicalProgress}%)
        </span>
      </div>
      <div class="text-[11px] tabular-nums {variance >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}">
        {variance >= 0 ? `+${variance}% frente al cronograma` : `${variance}% de variación`}
      </div>
    </CardContent>
  </Card>

  <!-- Estado en Stellar -->
  <Card class="bg-card border-border shadow-none">
    <CardContent class="p-5 space-y-1">
      <div class="text-xs text-muted-foreground font-medium">
        Estado de certificación
      </div>
      <div class="text-base font-semibold text-foreground flex items-center gap-2 pt-0.5">
        <span class="w-2 h-2 rounded-full {cut.status === 'certified' ? 'bg-emerald-500' : 'bg-[#F5A400]'}"></span>
        <span>{cut.status === 'certified' ? 'Sellado en Stellar' : 'En calibración técnica'}</span>
      </div>
      <div class="text-[11px] text-muted-foreground truncate pt-0.5">
        Contrato Soroban: <code class="text-foreground">corte_registry</code>
      </div>
    </CardContent>
  </Card>
</div>
