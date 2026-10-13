<script lang="ts">
  import CertificateDropzone from '$lib/components/verification/CertificateDropzone.svelte';
  import VerificationVerdictCard from '$lib/components/verification/VerificationVerdictCard.svelte';
  import TramoLogoLoader from '$lib/components/ui/TramoLogoLoader.svelte';
  import { Card, CardContent } from '$lib/components/ui/card';
  import { Badge } from '$lib/components/ui/badge';
  import { Button } from '$lib/components/ui/button';
  import { ArrowLeft } from '@lucide/svelte';

  interface VerificationResult {
    isValid: boolean;
    corteNumber: number;
    projectName: string;
    interventorName: string;
    blockTimestamp: string;
    computedHash: string;
    onchainHash: string;
  }

  let result = $state<VerificationResult | null>(null);
  let isVerifying = $state(false);
  let loadingStep = $state('');
  let loadingProgress = $state(0);

  async function handleVerificationResult(res: VerificationResult) {
    isVerifying = true;
    loadingProgress = 30;
    loadingStep = 'Calculando huella digital SHA-256 en el navegador...';

    await new Promise((r) => setTimeout(r, 850));
    loadingProgress = 70;
    loadingStep = 'Consultando registro del contrato en Stellar Soroban...';

    await new Promise((r) => setTimeout(r, 850));
    loadingProgress = 100;
    loadingStep = 'Comparando integridad bit a bit...';

    await new Promise((r) => setTimeout(r, 700));
    result = res;
    isVerifying = false;
  }
</script>

{#if isVerifying}
  <!-- Animación de verificación centrada con el isotipo de Tramo -->
  <div class="min-h-[calc(100vh-180px)] w-full flex flex-col items-center justify-center px-4">
    <Card class="w-full max-w-md bg-card border-border shadow-sm">
      <CardContent class="p-8 flex flex-col items-center text-center space-y-5">
        <TramoLogoLoader size={68} />

        <div class="space-y-1.5 w-full">
          <h2 class="text-sm font-semibold text-foreground">
            Verificando autenticidad del certificado
          </h2>
          <p class="text-xs text-muted-foreground">
            {loadingStep}
          </p>
        </div>

        <div class="w-full h-1.5 rounded-full bg-muted overflow-hidden">
          <div
            class="h-full bg-foreground rounded-full transition-all duration-300"
            style="width: {loadingProgress}%"
          ></div>
        </div>
      </CardContent>
    </Card>
  </div>
{:else}
  <!-- Contenedor centrado tanto para el verificador como para el resultado -->
  <div class="min-h-[calc(100vh-180px)] w-full flex flex-col items-center justify-center px-4 py-8">
    <div class="w-full max-w-xl space-y-6">
      <div class="text-center space-y-2">
        <div class="inline-flex justify-center">
          <Badge variant="outline" class="text-[11px] font-normal bg-muted/60 text-foreground border-border gap-1.5">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span>Verificación pública en Stellar</span>
          </Badge>
        </div>
        <h1 class="text-2xl font-semibold text-foreground tracking-tight">
          Verificador criptográfico de certificados
        </h1>
        <p class="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
          Comprueba de manera independiente que un certificado de avance de obra es auténtico y no ha sido modificado.
        </p>
      </div>

      {#if !result}
        <Card class="bg-card border-border shadow-sm">
          <CardContent class="p-6">
            <CertificateDropzone onVerificationResult={handleVerificationResult} />
          </CardContent>
        </Card>
      {:else}
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onclick={() => (result = null)}
              class="h-8 text-xs gap-1.5 cursor-pointer"
            >
              <ArrowLeft class="w-3.5 h-3.5" />
              <span>Verificar otro certificado</span>
            </Button>
          </div>

          <VerificationVerdictCard
            isValid={result.isValid}
            corteNumber={result.corteNumber}
            projectName={result.projectName}
            interventorName={result.interventorName}
            blockTimestamp={result.blockTimestamp}
            computedHash={result.computedHash}
            onchainHash={result.onchainHash}
          />
        </div>
      {/if}
    </div>
  </div>
{/if}
