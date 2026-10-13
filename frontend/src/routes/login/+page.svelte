<script lang="ts">
  import LoginForm from '$lib/components/login-form.svelte';
  import { Button } from '$lib/components/ui/button';
  import { Sun, Moon } from '@lucide/svelte';
  import { projectStore } from '$lib/stores/projectState.svelte';
</script>

<div class="relative min-h-screen w-full flex flex-col items-center justify-center p-6 md:p-10 bg-background">
  <!-- Botón discreto de tema Claro / Oscuro Gris -->
  <div class="absolute top-6 right-6">
    <Button
      variant="outline"
      size="icon"
      onclick={() => projectStore.toggleTheme()}
      title={projectStore.isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro gris'}
      class="h-9 w-9 cursor-pointer"
    >
      {#if projectStore.isDark}
        <Sun class="w-4 h-4 text-[#F5A400]" />
      {:else}
        <Moon class="w-4 h-4 text-foreground" />
      {/if}
    </Button>
  </div>

  <div class="w-full max-w-4xl">
    <LoginForm />
  </div>
</div>
