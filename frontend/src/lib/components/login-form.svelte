<script lang="ts">
  import { goto } from '$app/navigation';
  import * as Card from '$lib/components/ui/card/index.js';
  import { Button } from '$lib/components/ui/button/index.js';
  import {
    FieldGroup,
    Field,
    FieldLabel,
    FieldSeparator,
  } from '$lib/components/ui/field/index.js';
  import { Input } from '$lib/components/ui/input/index.js';
  import TramoBrandLogo from '$lib/components/ui/TramoBrandLogo.svelte';
  import { cn } from '$lib/utils.js';
  import { projectStore, AVAILABLE_PROFILES } from '$lib/stores/projectState.svelte';
  import type { UserProfile } from '$lib/types/twin';
  import type { HTMLAttributes } from 'svelte/elements';

  let { class: className, ...restProps }: HTMLAttributes<HTMLDivElement> = $props();

  const id = $props.id();

  let email = $state('fiduciaria@bancolombia.com.co');
  let password = $state('••••••••••••');
  let isLoading = $state(false);

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    isLoading = true;
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (data.profile) {
        selectAndRedirect(data.profile);
      }
    } finally {
      isLoading = false;
    }
  }

  function selectAndRedirect(profile: UserProfile) {
    projectStore.loginWithProfile(profile);
    goto('/');
  }
</script>

<div class={cn('flex flex-col gap-6', className)} {...restProps}>
  <Card.Root class="overflow-hidden p-0 border-border shadow-lg">
    <Card.Content class="grid p-0 md:grid-cols-2">
      <!-- Columna izquierda: Formulario sobrio de banca institucional -->
      <form class="p-7 md:p-10 flex flex-col justify-between" onsubmit={handleSubmit}>
        <FieldGroup>
          <div class="flex flex-col items-start gap-1.5 text-left mb-3">
            <div class="mb-2 md:hidden">
              <TramoBrandLogo variant="full" isDark={projectStore.isDark} class="h-5 w-auto" />
            </div>
            <h1 class="text-xl font-semibold tracking-tight text-foreground">
              Iniciar sesión en Tramo
            </h1>
            <p class="text-xs text-muted-foreground">
              Ingresa tus credenciales corporativas o selecciona un perfil de prueba.
            </p>
          </div>

          <Field>
            <FieldLabel for="email-{id}" class="text-xs font-medium">Correo corporativo</FieldLabel>
            <Input
              id="email-{id}"
              type="email"
              bind:value={email}
              placeholder="nombre@entidad.com.co"
              class="h-9 text-xs"
              required
            />
          </Field>

          <Field>
            <div class="flex items-center">
              <FieldLabel for="password-{id}" class="text-xs font-medium">Contraseña</FieldLabel>
              <a href="##" class="ms-auto text-xs text-muted-foreground underline-offset-4 hover:underline">
                ¿Olvidaste tu contraseña?
              </a>
            </div>
            <Input id="password-{id}" type="password" bind:value={password} class="h-9 text-xs" required />
          </Field>

          <Field>
            <Button
              type="submit"
              disabled={isLoading}
              class="w-full h-9 bg-foreground text-background hover:bg-foreground/90 font-medium text-xs cursor-pointer"
            >
              {isLoading ? 'Verificando credenciales...' : 'Continuar'}
            </Button>
          </Field>

          <FieldSeparator class="*:data-[slot=field-separator-content]:bg-card text-[11px] text-muted-foreground">
            Acceso rápido de demostración
          </FieldSeparator>

          <!-- Selección sobria de perfiles sin bordes neón -->
          <div class="grid grid-cols-2 gap-2">
            {#each AVAILABLE_PROFILES as prof}
              <button
                type="button"
                onclick={() => selectAndRedirect(prof)}
                class="rounded-lg border border-border bg-muted/30 hover:bg-muted/70 px-3 py-2 text-left transition-colors cursor-pointer"
              >
                <div class="text-xs font-medium text-foreground capitalize">
                  {prof.role === 'admin'
                    ? 'Administrador'
                    : prof.role === 'fiduciaria'
                      ? 'Fiduciaria'
                      : prof.role === 'constructor'
                        ? 'Constructor'
                        : 'Interventor'}
                </div>
                <div class="text-[11px] text-muted-foreground truncate">
                  {prof.companyName}
                </div>
              </button>
            {/each}
          </div>

          <!-- Enlaces limpios sin iconos para propietarios y auditores -->
          <div class="pt-4 mt-1 border-t border-border/70 flex flex-col gap-1.5 text-xs text-muted-foreground">
            <span>Consultas públicas sin contraseña:</span>
            <div class="flex flex-wrap items-center gap-x-4 gap-y-1">
              <a
                href="/propietario"
                class="text-foreground font-medium underline underline-offset-4 hover:text-[#F5A400] transition-colors"
              >
                Soy propietario (consultar con cédula)
              </a>
              <span class="text-border">•</span>
              <a
                href="/verificar"
                class="text-foreground font-medium underline underline-offset-4 hover:text-[#F5A400] transition-colors"
              >
                Verificar un certificado
              </a>
            </div>
          </div>
        </FieldGroup>
      </form>

      <!-- Columna derecha: Imagen residencial cálida con gradiente sutil estilo Stripe/Enterprise -->
      <div class="relative hidden md:flex flex-col justify-between p-10 overflow-hidden bg-zinc-900 text-white">
        <!-- Fotografía arquitectónica de hogar contemporáneo -->
        <img
          src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&auto=format&fit=crop&q=85"
          alt="Hogar residencial moderno"
          class="absolute inset-0 h-full w-full object-cover object-center scale-105"
        />
        <!-- Gradiente editorial cálido y oscuro para contraste limpio -->
        <div
          class="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-zinc-950/45 to-zinc-950/30"
        ></div>
        <div
          class="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(245,164,0,0.18),transparent_55%)]"
        ></div>

        <!-- Logo superior -->
        <div class="relative z-10">
          <TramoBrandLogo variant="full" isDark={true} class="h-5.5 w-auto" />
        </div>

        <!-- Mensaje inferior conciso con ortografía natural en español -->
        <div class="relative z-10 space-y-2 max-w-sm">
          <h2 class="text-lg font-semibold tracking-tight text-white leading-snug">
            Infraestructura de confianza para fiducias inmobiliarias
          </h2>
          <p class="text-xs text-zinc-300 leading-relaxed">
            Certificación técnica de avances de obra y desembolsos protegidos para constructores, entidades financieras y compradores de vivienda.
          </p>
        </div>
      </div>
    </Card.Content>
  </Card.Root>
</div>
