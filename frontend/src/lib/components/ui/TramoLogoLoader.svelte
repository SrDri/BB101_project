<script lang="ts">
  let { size = 64 }: { size?: number } = $props();
</script>

<div class="relative inline-flex items-center justify-center" style="width: {size}px; height: {size * 0.8}px;">
  <svg
    width={size}
    height={size * 0.8}
    viewBox="0 0 80 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    class="overflow-visible"
  >
    <g transform="translate(7 11)">
      <g transform="matrix(1 0 0 1 0 11.268)">
        <!-- Bloque 1 (Izquierdo) -->
        <g class="tramo-block-1">
          <rect
            width="19.317"
            height="16.098"
            fill="#FFFFFF"
            fill-rule="evenodd"
            stroke-width="3.5"
            stroke="#F5A400"
            stroke-linejoin="round"
            transform="matrix(1 0 0 1 0 17.707)"
          />
          <path
            d="M0 6.43903L8.04878 0L27.3659 0L19.3171 6.43903L0 6.43903Z"
            fill="#FFFFFF"
            fill-rule="evenodd"
            stroke-width="3.5"
            stroke="#F5A400"
            stroke-linejoin="round"
            transform="matrix(1 0 0 1 0 11.268)"
          />
          <path
            d="M0 6.43903L8.04878 0L8.04878 16.0976L0 22.5366L0 6.43903Z"
            fill="#FFFFFF"
            fill-rule="evenodd"
            stroke-width="3.5"
            stroke="#F5A400"
            stroke-linejoin="round"
            transform="translate(19.317 11.268)"
          />
        </g>

        <!-- Bloque 2 (Central) -->
        <g class="tramo-block-2">
          <rect
            width="19.317"
            height="27.366"
            fill="#FFFFFF"
            fill-rule="evenodd"
            stroke-width="3.5"
            stroke="#F5A400"
            stroke-linejoin="round"
            transform="matrix(1 0 0 1 19.317 6.439)"
          />
          <path
            d="M0 6.43903L8.04879 0L27.3659 0L19.3171 6.43903L0 6.43903Z"
            fill="#FFFFFF"
            fill-rule="evenodd"
            stroke-width="3.5"
            stroke="#F5A400"
            stroke-linejoin="round"
            transform="translate(19.317 0)"
          />
          <path
            d="M0 6.43903L8.04878 0L8.04878 27.3659L0 33.8049L0 6.43903Z"
            fill="#FFFFFF"
            fill-rule="evenodd"
            stroke-width="3.5"
            stroke="#F5A400"
            stroke-linejoin="round"
            transform="translate(38.634 0)"
          />
        </g>
      </g>

      <!-- Bloque 3 (Derecho Ámbar + Check) -->
      <g class="tramo-block-3">
        <g transform="matrix(1 0 0 1 38.634 0)">
          <rect
            width="19.317"
            height="38.634"
            fill="#F5A400"
            fill-rule="evenodd"
            stroke-width="3.5"
            stroke="#F5A400"
            stroke-linejoin="round"
            transform="translate(0 6.439)"
          />
          <path
            d="M0 6.43903L8.04878 0L27.3659 0L19.3171 6.43903L0 6.43903Z"
            fill="#F5A400"
            fill-rule="evenodd"
            stroke-width="3.5"
            stroke="#F5A400"
            stroke-linejoin="round"
          />
          <path
            d="M0 6.43903L8.04878 0L8.04878 38.6342L0 45.0732L0 6.43903Z"
            fill="#F5A400"
            fill-rule="evenodd"
            stroke-width="3.5"
            stroke="#F5A400"
            stroke-linejoin="round"
            transform="translate(19.317 0)"
          />
        </g>
        <path
          d="M0 6.43896L19.3171 6.43896L19.3171 45.0731M19.3171 6.43903L27.3659 0"
          fill="none"
          stroke-width="1.6"
          stroke="#F5A400"
          stroke-linecap="round"
          stroke-linejoin="round"
          transform="matrix(1 0 0 1 38.634 0)"
        />
        <path
          class="tramo-check"
          d="M0 4.82927L4.42683 9.2561L11.2683 0"
          fill="none"
          stroke-width="3.5"
          stroke="#FFFFFF"
          stroke-linecap="round"
          stroke-linejoin="round"
          transform="translate(42.659 21.732)"
        />
      </g>
    </g>
  </svg>
</div>

<style>
  .tramo-block-1 {
    animation: tramoPulse 1.5s ease-in-out infinite;
    animation-delay: 0s;
  }
  .tramo-block-2 {
    animation: tramoPulse 1.5s ease-in-out infinite;
    animation-delay: 0.22s;
  }
  .tramo-block-3 {
    animation: tramoPulse 1.5s ease-in-out infinite;
    animation-delay: 0.44s;
  }
  .tramo-check {
    stroke-dasharray: 24;
    stroke-dashoffset: 0;
    animation: tramoCheck 1.5s ease-in-out infinite;
  }

  @keyframes tramoPulse {
    0%, 100% {
      transform: translateY(0px);
      opacity: 1;
    }
    50% {
      transform: translateY(-4px);
      opacity: 0.75;
    }
  }

  @keyframes tramoCheck {
    0%, 20% {
      stroke-dashoffset: 24;
    }
    65%, 100% {
      stroke-dashoffset: 0;
    }
  }
</style>

