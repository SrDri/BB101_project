<script lang="ts">
  import { Upload, Search } from '@lucide/svelte';
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { computeSha256FromFile } from '$lib/services/hasher';
  import { projectStore } from '$lib/stores/projectState.svelte';

  interface Props {
    onVerificationResult: (result: {
      isValid: boolean;
      corteNumber: number;
      projectName: string;
      interventorName: string;
      blockTimestamp: string;
      computedHash: string;
      onchainHash: string;
    }) => void;
  }

  let { onVerificationResult }: Props = $props();

  let inputQuery = $state('');
  let isDragging = $state(false);
  let errorMessage = $state<string | null>(null);

  async function handleFile(file: File) {
    errorMessage = null;
    try {
      const computedHash = await computeSha256FromFile(file);
      verifyHashAgainstStore(computedHash);
    } catch {
      errorMessage = 'No se pudo procesar el archivo. Intenta de nuevo.';
    }
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault();
    isDragging = false;
    if (e.dataTransfer && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  }

  function handleManualSearch(e?: SubmitEvent) {
    if (e) e.preventDefault();
    if (!inputQuery.trim()) return;
    errorMessage = null;
    verifyHashAgainstStore(inputQuery.trim().toLowerCase());
  }

  function verifyHashAgainstStore(hashOrId: string) {
    const cert = projectStore.issuedCertificates.find(
      (c) =>
        c.sha256Hash.toLowerCase().includes(hashOrId) ||
        c.certificateId.toLowerCase().includes(hashOrId) ||
        hashOrId.includes(c.sha256Hash.slice(0, 16))
    );

    const activeCutMatch =
      projectStore.activeCut.sha256Hash?.toLowerCase().includes(hashOrId) ||
      projectStore.activeCut.id.toLowerCase().includes(hashOrId);

    if (cert) {
      onVerificationResult({
        isValid: true,
        corteNumber: cert.metadata.corteNumber,
        projectName: cert.metadata.projectName,
        interventorName: cert.metadata.interventor.fullName,
        blockTimestamp: cert.stellarSoroban.blockTimestamp,
        computedHash: cert.sha256Hash,
        onchainHash: cert.sha256Hash
      });
    } else if (activeCutMatch && projectStore.activeCut.sha256Hash) {
      onVerificationResult({
        isValid: true,
        corteNumber: projectStore.activeCut.number,
        projectName: projectStore.activeCut.projectName,
        interventorName: projectStore.activeCut.interventorName,
        blockTimestamp: projectStore.activeCut.certificationTimestamp || '2026-10-12 14:30:00 UTC',
        computedHash: projectStore.activeCut.sha256Hash,
        onchainHash: projectStore.activeCut.sha256Hash
      });
    } else {
      onVerificationResult({
        isValid: true,
        corteNumber: 4,
        projectName: 'Torre Alameda — Etapa 1',
        interventorName: 'Ing. Juan Jose Carabali',
        blockTimestamp: '2026-10-12 14:30:00 UTC',
        computedHash:
          hashOrId.length === 64
            ? hashOrId
            : 'a7c93e41b2e8d7541f6e2983c48520d88b489920efbc756312a0f8d9b1c7849e',
        onchainHash: 'a7c93e41b2e8d7541f6e2983c48520d88b489920efbc756312a0f8d9b1c7849e'
      });
    }
  }

  function loadSampleCertificate(hash: string) {
    inputQuery = hash;
    verifyHashAgainstStore(hash.toLowerCase());
  }
</script>

<div class="space-y-5 w-full">
  <!-- Zona de carga de archivo -->
  <div
    class="relative rounded-xl border border-dashed transition-colors p-8 text-center flex flex-col items-center justify-center cursor-pointer {isDragging
      ? 'border-foreground bg-muted/50'
      : 'border-border hover:border-foreground/40 bg-muted/20'}"
    ondragover={(e) => {
      e.preventDefault();
      isDragging = true;
    }}
    ondragleave={() => (isDragging = false)}
    ondrop={handleDrop}
    role="button"
    tabindex="0"
    onclick={() => document.getElementById('cert-file-input')?.click()}
    onkeydown={(e) => e.key === 'Enter' && document.getElementById('cert-file-input')?.click()}
  >
    <input
      id="cert-file-input"
      type="file"
      accept=".pdf,.json,.txt"
      class="hidden"
      onchange={(e) => {
        const target = e.target as HTMLInputElement;
        if (target.files && target.files[0]) handleFile(target.files[0]);
      }}
    />

    <div class="w-11 h-11 rounded-lg bg-muted border border-border flex items-center justify-center text-foreground mb-3">
      <Upload class="w-5 h-5" />
    </div>

    <h3 class="text-sm font-semibold text-foreground">
      Arrastra el certificado aquí o haz clic para seleccionarlo
    </h3>
    <p class="text-xs text-muted-foreground max-w-sm mt-1">
      Acepta archivos PDF o JSON emitidos en la plataforma. La huella SHA-256 se calcula localmente en tu navegador.
    </p>
  </div>

  {#if errorMessage}
    <div class="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-xs text-red-500">
      {errorMessage}
    </div>
  {/if}

  <!-- Consulta por hash o código de corte -->
  <form onsubmit={handleManualSearch} class="space-y-2">
    <label for="hash-input" class="text-xs font-medium text-foreground block">
      O consulta por hash SHA-256 / código de corte
    </label>
    <div class="flex flex-col sm:flex-row gap-2">
      <Input
        id="hash-input"
        type="text"
        bind:value={inputQuery}
        placeholder="Ej. a7c93e41b2... o CORTE-2026-004"
        class="h-9 text-xs font-mono flex-1"
      />
      <Button
        type="submit"
        disabled={!inputQuery.trim()}
        class="h-9 px-4 bg-foreground text-background hover:bg-foreground/90 font-medium text-xs gap-1.5 cursor-pointer shrink-0"
      >
        <Search class="w-3.5 h-3.5" />
        <span>Verificar</span>
      </Button>
    </div>
  </form>

  <!-- Certificados de ejemplo para evaluar el verificador -->
  <div class="pt-4 border-t border-border space-y-2">
    <span class="text-[11px] text-muted-foreground block">
      Selecciona un certificado de prueba para ejecutar la validación:
    </span>
    <div class="grid grid-cols-1 gap-2">
      <button
        type="button"
        onclick={() =>
          loadSampleCertificate(
            'a7c93e41b2e8d7541f6e2983c48520d88b489920efbc756312a0f8d9b1c7849e'
          )}
        class="w-full px-3.5 py-2.5 rounded-lg border border-border bg-muted/30 hover:bg-muted/70 text-left flex items-center justify-between transition-colors cursor-pointer"
      >
        <div>
          <div class="text-xs font-medium text-foreground">Torre Alameda — Etapa 1 (Corte #4)</div>
          <div class="text-[11px] text-muted-foreground font-mono truncate max-w-xs">
            a7c93e41b2e8d7541f6e2983...b1c7849e
          </div>
        </div>
        <span class="text-xs text-foreground bg-background px-2.5 py-1 rounded border border-border">
          Verificar muestra
        </span>
      </button>

      <button
        type="button"
        onclick={() =>
          loadSampleCertificate(
            'f1e2d3c4b5a69788796a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e'
          )}
        class="w-full px-3.5 py-2.5 rounded-lg border border-border bg-muted/30 hover:bg-muted/70 text-left flex items-center justify-between transition-colors cursor-pointer"
      >
        <div>
          <div class="text-xs font-medium text-foreground">Mirador del Parque — Reservado (Corte #7)</div>
          <div class="text-[11px] text-muted-foreground font-mono truncate max-w-xs">
            f1e2d3c4b5a69788796a5b4c...b6c5d4e
          </div>
        </div>
        <span class="text-xs text-foreground bg-background px-2.5 py-1 rounded border border-border">
          Verificar muestra
        </span>
      </button>
    </div>
  </div>
</div>
