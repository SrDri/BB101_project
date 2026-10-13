<script lang="ts">
  import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
  import { MapPin, ExternalLink } from '@lucide/svelte';

  interface Props {
    projectName: string;
    address: string;
    city: string;
    heightClass?: string;
  }

  let {
    projectName,
    address,
    city,
    heightClass = 'h-60'
  }: Props = $props();

  let mapType = $state<'m' | 'k'>('m'); // 'm' = Mapa estándar, 'k' = Satélite

  const fullQuery = $derived(`${address}, ${city}, Colombia`);
  const embedUrl = $derived(
    `https://maps.google.com/maps?q=${encodeURIComponent(fullQuery)}&t=${mapType}&z=16&output=embed&iwloc=near`
  );
  const externalMapsUrl = $derived(
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullQuery)}`
  );
</script>

<Card class="bg-card border-border shadow-none overflow-hidden">
  <CardHeader class="px-5 py-3.5 border-b border-border flex flex-row items-center justify-between gap-2">
    <div class="min-w-0">
      <CardTitle class="text-sm font-semibold text-foreground flex items-center gap-1.5">
        <MapPin class="w-4 h-4 text-muted-foreground shrink-0" />
        <span class="truncate">Ubicación del proyecto</span>
      </CardTitle>
      <p class="text-xs text-muted-foreground truncate mt-0.5">
        {address} • {city}
      </p>
    </div>

    <div class="flex items-center gap-1 bg-muted/50 p-0.5 rounded-md border border-border shrink-0">
      <button
        type="button"
        onclick={() => (mapType = 'm')}
        class="px-2 py-1 rounded text-[11px] transition-colors cursor-pointer {mapType === 'm'
          ? 'bg-background text-foreground font-medium shadow-2xs'
          : 'text-muted-foreground hover:text-foreground'}"
      >
        Mapa
      </button>
      <button
        type="button"
        onclick={() => (mapType = 'k')}
        class="px-2 py-1 rounded text-[11px] transition-colors cursor-pointer {mapType === 'k'
          ? 'bg-background text-foreground font-medium shadow-2xs'
          : 'text-muted-foreground hover:text-foreground'}"
      >
        Satélite
      </button>
    </div>
  </CardHeader>

  <CardContent class="p-0">
    <div class="relative w-full {heightClass} bg-muted">
      <iframe
        title="Mapa de {projectName}"
        src={embedUrl}
        width="100%"
        height="100%"
        style="border:0;"
        loading="lazy"
        referrerpolicy="no-referrer-when-downgrade"
        class="w-full h-full"
      ></iframe>
    </div>

    <div class="px-4 py-2.5 border-t border-border bg-muted/20 flex items-center justify-between text-xs">
      <span class="text-muted-foreground truncate">
        Geocerca de inspección GPS verificada
      </span>
      <a
        href={externalMapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        class="font-medium text-foreground underline underline-offset-4 hover:text-[#F5A400] inline-flex items-center gap-1 shrink-0"
      >
        <span>Abrir en Google Maps</span>
        <ExternalLink class="w-3 h-3" />
      </a>
    </div>
  </CardContent>
</Card>

