<script lang="ts">
  import { onMount } from 'svelte';
  import { 
    RotateCcw, 
    Eye, 
    EyeOff, 
    Maximize, 
    Sun, 
    Moon, 
    ShieldCheck,
    Layers,
    Type,
    Sparkles,
    Check
  } from '@lucide/svelte';

  // Estados de control de la toma del Outro
  let animationKey = $state(0);
  let isPlaying = $state(true);
  let speed = $state<number>(1); // 0.75, 1, 1.25
  let theme = $state<'dark' | 'light' | 'chroma'>('dark');
  let layout = $state<'horizontal' | 'vertical'>('horizontal');
  let sloganStyle = $state<'editorial' | 'caps'>('editorial');
  let showUrl = $state(true);
  let showStellarBadge = $state(true);
  let hideControls = $state(false);
  let mouseIdle = $state(false);
  let idleTimeout: any;

  function restartAnimation() {
    isPlaying = false;
    setTimeout(() => {
      animationKey += 1;
      isPlaying = true;
    }, 120);
  }

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.code === 'Space') {
      e.preventDefault();
      restartAnimation();
    } else if (e.key.toLowerCase() === 'h') {
      hideControls = !hideControls;
    } else if (e.key.toLowerCase() === 'f') {
      toggleFullscreen();
    } else if (e.key.toLowerCase() === 'd') {
      theme = theme === 'dark' ? 'light' : 'dark';
    } else if (e.key.toLowerCase() === 'c') {
      theme = theme === 'chroma' ? 'dark' : 'chroma';
    } else if (e.key.toLowerCase() === 'l') {
      layout = layout === 'horizontal' ? 'vertical' : 'horizontal';
    } else if (e.key.toLowerCase() === 's') {
      sloganStyle = sloganStyle === 'editorial' ? 'caps' : 'editorial';
    }
  }

  function onMouseMove() {
    mouseIdle = false;
    clearTimeout(idleTimeout);
    idleTimeout = setTimeout(() => {
      mouseIdle = true;
    }, 2600);
  }

  onMount(() => {
    idleTimeout = setTimeout(() => {
      mouseIdle = true;
    }, 3200);

    return () => clearTimeout(idleTimeout);
  });
</script>

<svelte:window onkeydown={handleKeydown} onmousemove={onMouseMove} />

<!-- Contenedor maestro de pantalla completa -->
<div 
  class="relative h-[100dvh] w-full flex flex-col items-center justify-center overflow-hidden transition-colors duration-500 select-none {
    theme === 'dark' 
      ? 'bg-[#08080A] text-white' 
      : theme === 'light' 
        ? 'bg-[#F9FAFB] text-zinc-900' 
        : 'bg-[#00FF00] text-black'
  }"
>
  <!-- Efectos de luz volumétrica cinemática -->
  {#if theme !== 'chroma'}
    <div class="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <!-- Glow central ámbar cálido (energía de Tramo) -->
      <div 
        class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[720px] h-[520px] rounded-full blur-[140px] transition-opacity duration-1000 {
          theme === 'dark' ? 'bg-[#F5A400]/16' : 'bg-[#F5A400]/22'
        }"
      ></div>

      <!-- Glow secundario esmeralda (validación Stellar Soroban) -->
      <div 
        class="absolute top-1/2 left-1/2 -translate-x-1/3 -translate-y-2/3 w-[520px] h-[420px] rounded-full blur-[150px] transition-opacity duration-1000 {
          theme === 'dark' ? 'bg-emerald-500/10' : 'bg-emerald-500/15'
        }"
      ></div>

      <!-- Retícula arquitectónica de precisión milimétrica -->
      <div 
        class="absolute inset-0 [mask-image:radial-gradient(ellipse_65%_55%_at_50%_50%,#000_25%,transparent_100%)] {
          theme === 'dark' 
            ? 'bg-[linear-gradient(to_right,rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.035)_1px,transparent_1px)]' 
            : 'bg-[linear-gradient(to_right,rgba(0,0,0,0.045)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.045)_1px,transparent_1px)]'
        } bg-[size:48px_48px]"
      ></div>
    </div>
  {/if}

  <!-- Contenedor animado del Outro -->
  {#key animationKey}
    <div 
      class="relative z-10 flex flex-col items-center justify-center px-6 transition-transform duration-700 max-w-5xl w-full text-center"
    >
      <!-- ========================================== -->
      <!-- MODO 1: LAYOUT HORIZONTAL (PREDETERMINADO) -->
      <!-- ========================================== -->
      {#if layout === 'horizontal'}
        <div class="flex flex-col items-center">
          
          <!-- LOGOTIPO COMPLETO (ISOTIPO + WORDMARK) -->
          <svg 
            viewBox="4 6 259 51" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            class="w-[330px] sm:w-[460px] md:w-[580px] lg:w-[680px] h-auto overflow-visible drop-shadow-2xl"
          >
            <g class="outro-logo-group">
              
              <!-- 1. ISOTIPO ISOMÉTRICO (Posición x=7, y=9) -->
              <g transform="translate(7 9)">
                <g transform="matrix(1 0 0 1 0 11.268)">
                  <!-- Pilar 1 (Inferior) -->
                  <g class="anim-pillar-1" style="animation-delay: {0.1 / speed}s;">
                    <rect width="19.317" height="16.098" fill={theme === 'dark' ? '#FFFFFF' : '#18181B'} stroke-width="3.5" stroke="#F5A400" stroke-linejoin="round" transform="matrix(1 0 0 1 0 17.707)" />
                    <path d="M0 6.43903L8.04878 0L27.3659 0L19.3171 6.43903L0 6.43903Z" fill={theme === 'dark' ? '#FFFFFF' : '#18181B'} stroke-width="3.5" stroke="#F5A400" stroke-linejoin="round" transform="matrix(1 0 0 1 0 11.268)" />
                    <path d="M0 6.43903L8.04878 0L8.04878 16.0976L0 22.5366L0 6.43903Z" fill={theme === 'dark' ? '#FFFFFF' : '#18181B'} stroke-width="3.5" stroke="#F5A400" stroke-linejoin="round" transform="matrix(1 0 0 1 19.317 11.268)" />
                  </g>

                  <!-- Pilar 2 (Medio) -->
                  <g class="anim-pillar-2" style="animation-delay: {0.35 / speed}s;">
                    <rect width="19.317" height="27.366" fill={theme === 'dark' ? '#FFFFFF' : '#18181B'} stroke-width="3.5" stroke="#F5A400" stroke-linejoin="round" transform="matrix(1 0 0 1 19.317 6.439)" />
                    <path d="M0 6.43903L8.04878 0L27.3659 0L19.3171 6.43903L0 6.43903Z" fill={theme === 'dark' ? '#FFFFFF' : '#18181B'} stroke-width="3.5" stroke="#F5A400" stroke-linejoin="round" transform="matrix(1 0 0 1 19.317 0)" />
                    <path d="M0 6.43903L8.04878 0L8.04878 27.3659L0 33.8049L0 6.43903Z" fill={theme === 'dark' ? '#FFFFFF' : '#18181B'} stroke-width="3.5" stroke="#F5A400" stroke-linejoin="round" transform="translate(38.634 0)" />
                  </g>
                </g>

                <!-- Pilar 3 (Superior Dorado Ámbar) -->
                <g transform="matrix(1 0 0 1 38.634 0)">
                  <g class="anim-pillar-3" style="animation-delay: {0.6 / speed}s;">
                    <rect width="19.317" height="38.634" fill="#F5A400" stroke-width="3.5" stroke="#F5A400" stroke-linejoin="round" transform="translate(0 6.439)" />
                    <path d="M0 6.43903L8.04878 0L27.3659 0L19.3171 6.43903L0 6.43903Z" fill="#F5A400" stroke-width="3.5" stroke="#F5A400" stroke-linejoin="round" transform="translate(0 0)" />
                    <path d="M0 6.43903L8.04878 0L8.04878 38.6342L0 45.0732L0 6.43903Z" fill="#F5A400" stroke-width="3.5" stroke="#F5A400" stroke-linejoin="round" transform="matrix(1 0 0 1 19.317 0)" />
                    <path d="M0 6.43901L19.3171 6.43901L19.3171 45.0732M19.3171 6.43903L27.3659 0" fill="none" stroke-width="1.6" stroke="#F5A400" stroke-linecap="round" stroke-linejoin="round" />
                  </g>
                </g>

                <!-- Checkmark Blanco de Verificación -->
                <path 
                  d="M0 4.82927L4.42683 9.2561L11.2683 0" 
                  fill="none" 
                  stroke-width="3.5" 
                  stroke="#FFFFFF" 
                  stroke-linecap="round" 
                  stroke-linejoin="round" 
                  transform="translate(42.659 21.732)" 
                  class="anim-checkmark"
                  style="animation-delay: {0.85 / speed}s;"
                />
              </g>

              <!-- 2. WORDMARK "tramo" -->
              <g transform="translate(90 9)">
                <g class="anim-wordmark-inner" style="animation-delay: {1.05 / speed}s;">
                  <path 
                    d="M22.656 44.16C20.7147 44.5653 18.8 44.7253 16.912 44.64C15.024 44.5547 13.3387 44.1493 11.856 43.424C10.3733 42.6987 9.248 41.568 8.48 40.032C7.86134 38.752 7.52533 37.456 7.472 36.144C7.41867 34.832 7.392 33.3333 7.392 31.648L7.392 0L12.064 0L12.064 31.456C12.064 32.9067 12.08 34.1173 12.112 35.088C12.144 36.0587 12.3627 36.9173 12.768 37.664C13.536 39.0933 14.7573 39.9467 16.432 40.224C18.1067 40.5013 20.1813 40.4373 22.656 40.032L22.656 44.16ZM0 13.632L0 9.6L22.656 9.6L22.656 13.632L0 13.632ZM29.472 44.16L29.472 9.6L33.696 9.6L33.696 17.92L32.864 16.832C33.248 15.808 33.7493 14.864 34.368 14C34.9867 13.136 35.6587 12.4267 36.384 11.872C37.28 11.0827 38.3253 10.48 39.52 10.064C40.7147 9.648 41.92 9.40267 43.136 9.328C44.352 9.25334 45.4613 9.344 46.464 9.6L46.464 14.016C45.2053 13.696 43.8293 13.6213 42.336 13.792C40.8427 13.9627 39.4667 14.56 38.208 15.584C37.056 16.48 36.192 17.552 35.616 18.8C35.04 20.048 34.656 21.3707 34.464 22.768C34.272 24.1653 34.176 25.5467 34.176 26.912L34.176 44.16L29.472 44.16ZM61.152 45.12C58.5493 45.12 56.368 44.6507 54.608 43.712C52.848 42.7733 51.5307 41.5253 50.656 39.968C49.7813 38.4107 49.344 36.7147 49.344 34.88C49.344 33.0027 49.7227 31.3973 50.48 30.064C51.2373 28.7307 52.272 27.6373 53.584 26.784C54.896 25.9307 56.416 25.28 58.144 24.832C59.8933 24.4053 61.8293 24.0267 63.952 23.696C66.0747 23.3653 68.1547 23.0773 70.192 22.832C72.2293 22.5867 74.016 22.3467 75.552 22.112L73.888 23.136C73.952 19.7227 73.2907 17.1947 71.904 15.552C70.5173 13.9093 68.1067 13.088 64.672 13.088C62.304 13.088 60.304 13.6213 58.672 14.688C57.04 15.7547 55.8933 17.44 55.232 19.744L50.656 18.4C51.4453 15.3067 53.0347 12.9067 55.424 11.2C57.8133 9.49334 60.9173 8.64001 64.736 8.64C67.8933 8.64001 70.576 9.23201 72.784 10.416C74.992 11.6 76.5547 13.312 77.472 15.552C77.8987 16.5547 78.176 17.6747 78.304 18.912C78.432 20.1493 78.496 21.408 78.496 22.688L78.496 44.16L74.304 44.16L74.304 35.488L75.52 36C74.3467 38.9653 72.5227 41.2267 70.048 42.784C67.5733 44.3413 64.608 45.12 61.152 45.12L61.152 45.12ZM61.696 41.056C63.8933 41.056 65.8133 40.6613 67.456 39.872C69.0987 39.0827 70.4213 38 71.424 36.624C72.4267 35.248 73.0773 33.696 73.376 31.968C73.632 30.8587 73.7707 29.6373 73.792 28.304C73.8133 26.9707 73.824 25.9733 73.824 25.312L75.616 26.24C74.016 26.4533 72.2827 26.6667 70.416 26.88C68.5493 27.0933 66.7147 27.3387 64.912 27.616C63.1093 27.8933 61.4827 28.224 60.032 28.608C59.0507 28.8853 58.1013 29.2747 57.184 29.776C56.2667 30.2773 55.5147 30.944 54.928 31.776C54.3413 32.608 54.048 33.6427 54.048 34.88C54.048 35.8827 54.2987 36.8533 54.8 37.792C55.3013 38.7307 56.112 39.5093 57.232 40.128C58.352 40.7467 59.84 41.056 61.696 41.056L61.696 41.056ZM128.032 44.16L128.064 21.472C128.064 18.8053 127.323 16.7093 125.84 15.184C124.357 13.6587 122.475 12.896 120.192 12.896C118.891 12.896 117.621 13.1947 116.384 13.792C115.147 14.3893 114.128 15.3493 113.328 16.672C112.528 17.9947 112.128 19.7227 112.128 21.856L109.344 21.056C109.28 18.5813 109.765 16.416 110.8 14.56C111.835 12.704 113.264 11.2587 115.088 10.224C116.912 9.18934 118.976 8.672 121.28 8.672C124.757 8.672 127.541 9.744 129.632 11.888C131.723 14.032 132.768 16.928 132.768 20.576L132.736 44.16L128.032 44.16ZM86.784 44.16L86.784 9.6L91.008 9.6L91.008 18.112L91.52 18.112L91.52 44.16L86.784 44.16ZM107.456 44.16L107.488 21.792C107.488 19.04 106.757 16.8693 105.296 15.28C103.835 13.6907 101.909 12.896 99.52 12.896C97.1307 12.896 95.2 13.712 93.728 15.344C92.256 16.976 91.52 19.1467 91.52 21.856L88.704 20.32C88.704 18.1013 89.2267 16.112 90.272 14.352C91.3173 12.592 92.7467 11.2053 94.56 10.192C96.3733 9.17867 98.432 8.672 100.736 8.672C102.933 8.672 104.891 9.14134 106.608 10.08C108.325 11.0187 109.675 12.384 110.656 14.176C111.637 15.968 112.128 18.144 112.128 20.704L112.096 44.16L107.456 44.16ZM155.296 45.12C151.861 45.12 148.928 44.3413 146.496 42.784C144.064 41.2267 142.197 39.072 140.896 36.32C139.595 33.568 138.944 30.4107 138.944 26.848C138.944 23.2213 139.605 20.0427 140.928 17.312C142.251 14.5813 144.133 12.4533 146.576 10.928C149.019 9.40267 151.925 8.64001 155.296 8.64C158.752 8.64001 161.701 9.41334 164.144 10.96C166.587 12.5067 168.453 14.6507 169.744 17.392C171.035 20.1333 171.68 23.2853 171.68 26.848C171.68 30.4747 171.029 33.6587 169.728 36.4C168.427 39.1413 166.549 41.28 164.096 42.816C161.643 44.352 158.709 45.12 155.296 45.12L155.296 45.12ZM155.296 40.608C159.136 40.608 161.995 39.3333 163.872 36.784C165.749 34.2347 166.688 30.9227 166.688 26.848C166.688 22.6667 165.744 19.3387 163.856 16.864C161.968 14.3893 159.115 13.152 155.296 13.152C152.715 13.152 150.587 13.7333 148.912 14.896C147.237 16.0587 145.989 17.6693 145.168 19.728C144.347 21.7867 143.936 24.16 143.936 26.848C143.936 31.008 144.896 34.3413 146.816 36.848C148.736 39.3547 151.563 40.608 155.296 40.608L155.296 40.608Z" 
                    fill={theme === 'dark' ? '#FFFFFF' : '#121212'} 
                  />
                </g>
              </g>

            </g>
          </svg>

          <!-- SEPARADOR CINEMÁTICO SUTIL -->
          <div 
            class="mt-8 sm:mt-10 w-24 h-0.5 rounded-full bg-gradient-to-r from-transparent via-[#F5A400]/70 to-transparent anim-separator"
            style="animation-delay: {1.4 / speed}s;"
          ></div>

          <!-- SLOGAN PRINCIPAL: "CONSTRUYENDO CONFIANZA BLOQUE A BLOQUE" -->
          <div 
            class="mt-6 sm:mt-8 flex flex-col items-center gap-4 text-center anim-slogan"
            style="animation-delay: {1.65 / speed}s;"
          >
            {#if sloganStyle === 'editorial'}
              <h1 class="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight text-balance leading-tight {
                theme === 'dark' ? 'text-zinc-100' : 'text-zinc-900'
              }">
                Construyendo confianza, <span class="bg-gradient-to-r from-[#F5A400] via-[#FFB733] to-[#F5A400] bg-clip-text text-transparent font-bold">bloque a bloque</span>.
              </h1>
            {:else}
              <h1 class="text-lg sm:text-xl md:text-2xl lg:text-3xl font-extrabold tracking-[0.25em] uppercase text-balance leading-snug {
                theme === 'dark' ? 'text-zinc-100' : 'text-zinc-900'
              }">
                CONSTRUYENDO CONFIANZA <span class="text-[#F5A400]">BLOQUE A BLOQUE</span>
              </h1>
            {/if}

            <!-- Sublema Institucional Secundario -->
            <p class="text-xs sm:text-sm font-medium tracking-[0.18em] uppercase max-w-xl {
              theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'
            }">
              Infraestructura fiduciaria verificada en tiempo real
            </p>

            <!-- Sellos de confianza y enlace web -->
            <div class="mt-4 flex flex-wrap items-center justify-center gap-3">
              {#if showStellarBadge}
                <div class="flex items-center gap-2 px-4 py-1.5 rounded-full border backdrop-blur-md shadow-sm {
                  theme === 'dark' 
                    ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400' 
                    : 'border-emerald-600/30 bg-emerald-600/10 text-emerald-700'
                }">
                  <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span class="text-[11px] font-mono font-semibold tracking-wider">
                    RED STELLAR SOROBAN
                  </span>
                  <ShieldCheck class="w-3.5 h-3.5" />
                </div>
              {/if}

              {#if showUrl}
                <div class="flex items-center gap-2 px-4 py-1.5 rounded-full border backdrop-blur-md shadow-sm {
                  theme === 'dark' 
                    ? 'border-white/10 bg-white/5 text-zinc-300' 
                    : 'border-zinc-300 bg-white text-zinc-700'
                }">
                  <Sparkles class="w-3 h-3 text-[#F5A400]" />
                  <span class="text-[12px] font-mono font-medium tracking-wider">
                    tramo.co
                  </span>
                </div>
              {/if}
            </div>
          </div>
        </div>

      <!-- ========================================== -->
      <!-- MODO 2: LAYOUT VERTICAL HERO (MONOLITO)   -->
      <!-- ========================================== -->
      {:else}
        <div class="flex flex-col items-center">
          <!-- ISOTIPO GIGANTE -->
          <svg 
            viewBox="3 4 72 51" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            class="w-[200px] sm:w-[280px] md:w-[340px] h-auto overflow-visible drop-shadow-[0_20px_50px_rgba(245,164,0,0.35)]"
          >
            <g transform="translate(6 7)" class="outro-hero-group">
              <g transform="matrix(1 0 0 1 0 11.268)">
                <g class="anim-pillar-1" style="animation-delay: {0.1 / speed}s;">
                  <rect width="19.317" height="16.098" fill={theme === 'dark' ? '#FFFFFF' : '#18181B'} stroke-width="3.5" stroke="#F5A400" stroke-linejoin="round" transform="matrix(1 0 0 1 0 17.707)" />
                  <path d="M0 6.43903L8.04878 0L27.3659 0L19.3171 6.43903L0 6.43903Z" fill={theme === 'dark' ? '#FFFFFF' : '#18181B'} stroke-width="3.5" stroke="#F5A400" stroke-linejoin="round" transform="matrix(1 0 0 1 0 11.268)" />
                  <path d="M0 6.43903L8.04878 0L8.04878 16.0976L0 22.5366L0 6.43903Z" fill={theme === 'dark' ? '#FFFFFF' : '#18181B'} stroke-width="3.5" stroke="#F5A400" stroke-linejoin="round" transform="matrix(1 0 0 1 19.317 11.268)" />
                </g>

                <g class="anim-pillar-2" style="animation-delay: {0.35 / speed}s;">
                  <rect width="19.317" height="27.366" fill={theme === 'dark' ? '#FFFFFF' : '#18181B'} stroke-width="3.5" stroke="#F5A400" stroke-linejoin="round" transform="matrix(1 0 0 1 19.317 6.439)" />
                  <path d="M0 6.43903L8.04878 0L27.3659 0L19.3171 6.43903L0 6.43903Z" fill={theme === 'dark' ? '#FFFFFF' : '#18181B'} stroke-width="3.5" stroke="#F5A400" stroke-linejoin="round" transform="matrix(1 0 0 1 19.317 0)" />
                  <path d="M0 6.43903L8.04878 0L8.04878 27.3659L0 33.8049L0 6.43903Z" fill={theme === 'dark' ? '#FFFFFF' : '#18181B'} stroke-width="3.5" stroke="#F5A400" stroke-linejoin="round" transform="translate(38.634 0)" />
                </g>
              </g>

              <g transform="matrix(1 0 0 1 38.634 0)">
                <g class="anim-pillar-3" style="animation-delay: {0.6 / speed}s;">
                  <rect width="19.317" height="38.634" fill="#F5A400" stroke-width="3.5" stroke="#F5A400" stroke-linejoin="round" transform="translate(0 6.439)" />
                  <path d="M0 6.43903L8.04878 0L27.3659 0L19.3171 6.43903L0 6.43903Z" fill="#F5A400" stroke-width="3.5" stroke="#F5A400" stroke-linejoin="round" transform="translate(0 0)" />
                  <path d="M0 6.43903L8.04878 0L8.04878 38.6342L0 45.0732L0 6.43903Z" fill="#F5A400" stroke-width="3.5" stroke="#F5A400" stroke-linejoin="round" transform="matrix(1 0 0 1 19.317 0)" />
                  <path d="M0 6.43901L19.3171 6.43901L19.3171 45.0732M19.3171 6.43903L27.3659 0" fill="none" stroke-width="1.6" stroke="#F5A400" stroke-linecap="round" stroke-linejoin="round" />
                </g>
              </g>

              <path 
                d="M0 4.82927L4.42683 9.2561L11.2683 0" 
                fill="none" 
                stroke-width="3.5" 
                stroke="#FFFFFF" 
                stroke-linecap="round" 
                stroke-linejoin="round" 
                transform="translate(42.659 21.732)" 
                class="anim-checkmark" 
                style="animation-delay: {0.85 / speed}s;" 
              />
            </g>
          </svg>

          <!-- TRAMO TIPOGRAFÍA GRANDE -->
          <div class="mt-6 text-center anim-wordmark-inner" style="animation-delay: {1.1 / speed}s;">
            <span class="text-3xl sm:text-4xl md:text-5xl font-black tracking-[0.2em] uppercase font-mono {
              theme === 'dark' ? 'text-white' : 'text-zinc-950'
            }">
              TRAMO
            </span>
          </div>

          <!-- SLOGAN VERTICAL -->
          <div 
            class="mt-6 flex flex-col items-center gap-3 text-center anim-slogan"
            style="animation-delay: {1.45 / speed}s;"
          >
            <h2 class="text-xl sm:text-2xl md:text-3xl font-semibold tracking-tight {
              theme === 'dark' ? 'text-zinc-200' : 'text-zinc-800'
            }">
              Construyendo confianza, <span class="text-[#F5A400] font-bold">bloque a bloque</span>.
            </h2>

            <div class="mt-3 flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-mono {
              theme === 'dark' 
                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400' 
                : 'border-emerald-600/30 bg-emerald-600/10 text-emerald-700'
            }">
              <ShieldCheck class="w-3.5 h-3.5" />
              <span>Stellar Soroban · tramo.co</span>
            </div>
          </div>
        </div>
      {/if}
    </div>
  {/key}

  <!-- ========================================== -->
  <!-- BARRA DE CONTROL DEL DIRECTOR / GRABACIÓN -->
  <!-- ========================================== -->
  <div 
    class="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 {
      hideControls || mouseIdle 
        ? 'opacity-0 pointer-events-none translate-y-6' 
        : 'opacity-100 translate-y-0'
    }"
  >
    <div class="flex items-center gap-2 p-2 rounded-2xl border border-white/10 bg-zinc-900/90 backdrop-blur-2xl shadow-2xl text-white text-xs">
      
      <!-- Reproducir / Reiniciar -->
      <button 
        onclick={restartAnimation}
        title="Reiniciar toma (Espacio)"
        class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F5A400] text-zinc-950 font-semibold hover:bg-[#F5A400]/90 transition-all cursor-pointer shadow-sm active:scale-95"
      >
        <RotateCcw class="w-3.5 h-3.5" />
        <span>Reproducir</span>
        <kbd class="ml-1 text-[10px] bg-black/20 px-1.5 py-0.5 rounded font-mono font-normal">Espacio</kbd>
      </button>

      <div class="h-4 w-px bg-white/15 mx-1"></div>

      <!-- Selector de Fondo -->
      <div class="flex items-center gap-1 bg-black/35 p-1 rounded-xl">
        <button 
          onclick={() => (theme = 'dark')} 
          class="px-2 py-1 rounded-lg transition-colors cursor-pointer {theme === 'dark' ? 'bg-white/20 text-white font-medium' : 'text-zinc-400 hover:text-white'}"
          title="Fondo Oscuro OLED"
        >
          <Moon class="w-3.5 h-3.5 inline mr-1" />
          Oscuro
        </button>
        <button 
          onclick={() => (theme = 'light')} 
          class="px-2 py-1 rounded-lg transition-colors cursor-pointer {theme === 'light' ? 'bg-white/20 text-white font-medium' : 'text-zinc-400 hover:text-white'}"
          title="Fondo Claro Minimalista"
        >
          <Sun class="w-3.5 h-3.5 inline mr-1" />
          Claro
        </button>
        <button 
          onclick={() => (theme = 'chroma')} 
          class="px-2 py-1 rounded-lg transition-colors cursor-pointer {theme === 'chroma' ? 'bg-emerald-500 text-black font-semibold' : 'text-zinc-400 hover:text-white'}"
          title="Chroma Key Verde para Superposición"
        >
          Chroma
        </button>
      </div>

      <div class="h-4 w-px bg-white/15 mx-1"></div>

      <!-- Selector de Layout (Horizontal vs Vertical) -->
      <div class="flex items-center gap-1 bg-black/35 p-1 rounded-xl">
        <button 
          onclick={() => (layout = 'horizontal')} 
          class="px-2 py-1 rounded-lg transition-colors cursor-pointer {layout === 'horizontal' ? 'bg-white/20 text-white font-medium' : 'text-zinc-400 hover:text-white'}"
          title="Layout Horizontal Oficial"
        >
          Horizontal
        </button>
        <button 
          onclick={() => (layout = 'vertical')} 
          class="px-2 py-1 rounded-lg transition-colors cursor-pointer {layout === 'vertical' ? 'bg-white/20 text-white font-medium' : 'text-zinc-400 hover:text-white'}"
          title="Layout Vertical Monolito"
        >
          Vertical
        </button>
      </div>

      <div class="h-4 w-px bg-white/15 mx-1"></div>

      <!-- Selector de Estilo de Slogan -->
      <button 
        onclick={() => (sloganStyle = sloganStyle === 'editorial' ? 'caps' : 'editorial')} 
        class="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-black/35 hover:bg-white/10 transition-colors text-zinc-300 hover:text-white cursor-pointer"
        title="Alternar estilo tipográfico del slogan (S)"
      >
        <Type class="w-3 h-3 text-[#F5A400]" />
        <span>{sloganStyle === 'editorial' ? 'Minúsculas' : 'MAYÚSCULAS'}</span>
      </button>

      <div class="h-4 w-px bg-white/15 mx-1"></div>

      <!-- Selector de Velocidad -->
      <div class="flex items-center gap-1 bg-black/35 p-1 rounded-xl">
        <button 
          onclick={() => { speed = 0.75; restartAnimation(); }} 
          class="px-2 py-1 rounded-lg transition-colors cursor-pointer {speed === 0.75 ? 'bg-white/20 text-white font-medium' : 'text-zinc-400 hover:text-white'}"
          title="0.75x Slow-Motion"
        >
          0.75x
        </button>
        <button 
          onclick={() => { speed = 1; restartAnimation(); }} 
          class="px-2 py-1 rounded-lg transition-colors cursor-pointer {speed === 1 ? 'bg-white/20 text-white font-medium' : 'text-zinc-400 hover:text-white'}"
          title="1.0x Normal"
        >
          1.0x
        </button>
      </div>

      <div class="h-4 w-px bg-white/15 mx-1"></div>

      <!-- Pantalla Completa & Ocultar -->
      <button 
        onclick={toggleFullscreen}
        title="Pantalla completa (F)"
        class="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
      >
        <Maximize class="w-3.5 h-3.5" />
      </button>

      <button 
        onclick={() => (hideControls = true)}
        title="Ocultar barra para grabar limpio (H)"
        class="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
      >
        <EyeOff class="w-3.5 h-3.5" />
      </button>

    </div>
  </div>

  <!-- Botón flotante sutil para recuperar controles si se ocultaron -->
  {#if hideControls}
    <button 
      onclick={() => (hideControls = false)}
      class="fixed top-4 right-4 z-50 p-2 rounded-full bg-black/40 hover:bg-black/80 text-white/50 hover:text-white backdrop-blur-md transition-all cursor-pointer text-xs flex items-center gap-1.5 opacity-30 hover:opacity-100"
      title="Mostrar controles (H)"
    >
      <Eye class="w-3.5 h-3.5" />
      <span>Mostrar controles (H)</span>
    </button>
  {/if}
</div>

<style>
  /* ============================================================== */
  /* KEYFRAMES CINEMÁTICOS DE REVEAL TIPO APPLE KEYNOTE            */
  /* ============================================================== */

  /* 1. Pilares Isométricos */
  @keyframes risePillar {
    0% {
      opacity: 0;
      transform: translateY(28px) scale(0.94);
      filter: blur(5px);
    }
    65% {
      opacity: 1;
      transform: translateY(-2px) scale(1.02);
      filter: blur(0px);
    }
    100% {
      opacity: 1;
      transform: translateY(0) scale(1);
      filter: blur(0px);
    }
  }

  .anim-pillar-1 {
    opacity: 0;
    transform-origin: bottom center;
    animation: risePillar 0.85s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }

  .anim-pillar-2 {
    opacity: 0;
    transform-origin: bottom center;
    animation: risePillar 0.85s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }

  .anim-pillar-3 {
    opacity: 0;
    transform-origin: bottom center;
    animation: risePillar 0.95s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    filter: drop-shadow(0 0 28px rgba(245, 164, 0, 0.5));
  }

  /* 2. Trazo del Checkmark */
  @keyframes drawCheckmark {
    0% {
      stroke-dashoffset: 35;
      opacity: 0;
    }
    30% {
      opacity: 1;
    }
    100% {
      stroke-dashoffset: 0;
      opacity: 1;
    }
  }

  .anim-checkmark {
    stroke-dasharray: 35;
    stroke-dashoffset: 35;
    opacity: 0;
    animation: drawCheckmark 0.65s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }

  /* 3. Despliegue del Wordmark "tramo" */
  @keyframes wordmarkSlideIn {
    0% {
      opacity: 0;
      transform: translateX(-24px);
      filter: blur(6px);
    }
    100% {
      opacity: 1;
      transform: translateX(0);
      filter: blur(0px);
    }
  }

  .anim-wordmark-inner {
    opacity: 0;
    animation: wordmarkSlideIn 0.9s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }

  /* 4. Separador cinemático */
  @keyframes expandSeparator {
    0% {
      opacity: 0;
      transform: scaleX(0);
    }
    100% {
      opacity: 1;
      transform: scaleX(1);
    }
  }

  .anim-separator {
    opacity: 0;
    animation: expandSeparator 0.75s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }

  /* 5. Reveal del Slogan "Construyendo confianza, bloque a bloque" */
  @keyframes sloganFadeUp {
    0% {
      opacity: 0;
      transform: translateY(18px);
      filter: blur(5px);
    }
    100% {
      opacity: 1;
      transform: translateY(0);
      filter: blur(0px);
    }
  }

  .anim-slogan {
    opacity: 0;
    animation: sloganFadeUp 0.95s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }

  /* 6. Respiración armónica tras el ensamble */
  @keyframes outroBreathe {
    0%, 100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-3.5px);
    }
  }

  .outro-logo-group,
  .outro-hero-group {
    animation: outroBreathe 6.5s ease-in-out infinite 2.4s;
  }
</style>
