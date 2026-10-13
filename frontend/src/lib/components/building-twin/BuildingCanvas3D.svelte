<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import * as THREE from 'three';
  import { RotateCcw, Pause, Play, Eye } from '@lucide/svelte';
  import { projectStore } from '$lib/stores/projectState.svelte';
  import type { FloorData } from '$lib/types/twin';

  interface Props {
    floors: FloorData[];
    selectedFloorId: number | null;
    onSelect: (floor: FloorData) => void;
  }

  let { floors, selectedFloorId, onSelect }: Props = $props();

  let container: HTMLDivElement;
  let renderer: THREE.WebGLRenderer | null = null;
  let scene: THREE.Scene;
  let camera: THREE.OrthographicCamera;
  let buildingGroup: THREE.Group;
  let hitTargets: { mesh: THREE.Mesh; floor: FloorData; outlineMats: THREE.LineBasicMaterial[]; highlightMeshes: THREE.Mesh[] }[] = [];
  let hoveredFloor = $state<FloorData | null>(null);
  let autoRotate = $state(true);
  let showGhostOutline = $state(true);
  let animationFrameId: number;

  // Control de órbita manual (drag & zoom)
  let isDragging = false;
  let pointerDownPos = { x: 0, y: 0 };
  let targetRotationY = 0.68;
  let currentRotationY = 0.68;
  let targetTiltX = 0.38;
  let currentTiltX = 0.38;
  let zoomLevel = $state(1.0);

  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  function getStatusMeta(status: FloorData['status']) {
    switch (status) {
      case 'certified':
        return {
          label: 'Certificado en Stellar',
          accentHex: 0x10b981,
          badgeDot: 'bg-emerald-500'
        };
      case 'reviewing':
        return {
          label: 'En calibración IA',
          accentHex: 0xf5a400,
          badgeDot: 'bg-[#F5A400]'
        };
      case 'in_progress':
        return {
          label: 'En ejecución física',
          accentHex: 0x3b82f6,
          badgeDot: 'bg-blue-500'
        };
      default:
        return {
          label: 'Proyectado (Outline)',
          accentHex: projectStore.isDark ? 0x71717a : 0x52525b,
          badgeDot: 'bg-zinc-400'
        };
    }
  }

  function resetCamera() {
    targetRotationY = 0.68;
    targetTiltX = 0.38;
    zoomLevel = 1.0;
    updateCameraProjection();
  }

  function updateCameraProjection() {
    if (!container || !camera) return;
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 580;
    const aspect = width / height;
    const d = 11.5 / zoomLevel;

    camera.left = -d * aspect;
    camera.right = d * aspect;
    camera.top = d;
    camera.bottom = -d;
    camera.updateProjectionMatrix();
  }

  function initThree() {
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 580;

    scene = new THREE.Scene();
    buildingGroup = new THREE.Group();
    scene.add(buildingGroup);

    const aspect = width / height;
    const d = 11.5;
    camera = new THREE.OrthographicCamera(-d * aspect, d * aspect, d, -d, 0.1, 1000);
    camera.position.set(0, 14, 28);
    camera.lookAt(0, 5.2, 0);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // Iluminación arquitectónica de estudio
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfffbeb, 1.15);
    sunLight.position.set(18, 32, 22);
    scene.add(sunLight);

    const fillLight = new THREE.DirectionalLight(0xe0f2fe, 0.45);
    fillLight.position.set(-20, 15, -12);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xf5a400, 0.25);
    rimLight.position.set(0, -12, -15);
    scene.add(rimLight);

    rebuildArchitecture();

    const dom = renderer.domElement;
    dom.addEventListener('pointerdown', onPointerDown);
    dom.addEventListener('pointermove', onPointerMove);
    dom.addEventListener('pointerup', onPointerUp);
    dom.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('resize', onWindowResize);

    animate();
  }

  function clearBuildingGroup() {
    if (!buildingGroup) return;
    while (buildingGroup.children.length > 0) {
      const child = buildingGroup.children[0];
      buildingGroup.remove(child);
    }
    hitTargets = [];
  }

  function rebuildArchitecture() {
    if (!scene || !buildingGroup) return;

    const isDark = projectStore.isDark;
    scene.background = new THREE.Color(isDark ? 0x141416 : 0xf4f4f6);

    clearBuildingGroup();

    const floorPitch = 1.38; // Altura continua entre piso y piso (sin huecos irreales)
    const slabThickness = 0.14;
    const towerWidth = 9.2;
    const towerDepth = 7.4;
    const totalFloors = floors.length;
    const totalTowerHeight = totalFloors * floorPitch;

    // 1. Plataforma urbana / Podium arquitectónico y grilla CAD
    const gridColorMain = isDark ? 0x2e2e34 : 0xd4d4d8;
    const gridColorSub = isDark ? 0x1f1f23 : 0xe4e4e7;
    const grid = new THREE.GridHelper(26, 26, gridColorMain, gridColorSub);
    grid.position.y = -0.35;
    buildingGroup.add(grid);

    // Plinto de concreto arquitectónico (recepción / urbanismo)
    const podiumGeom = new THREE.BoxGeometry(towerWidth + 2.8, 0.35, towerDepth + 2.6);
    const podiumMat = new THREE.MeshStandardMaterial({
      color: isDark ? 0x222226 : 0xe4e4e7,
      roughness: 0.8,
      metalness: 0.1
    });
    const podium = new THREE.Mesh(podiumGeom, podiumMat);
    podium.position.set(0, -0.175, 0);
    buildingGroup.add(podium);

    const podiumEdges = new THREE.LineSegments(
      new THREE.EdgesGeometry(podiumGeom),
      new THREE.LineBasicMaterial({
        color: isDark ? 0x3f3f46 : 0xa1a1aa,
        transparent: true,
        opacity: 0.6
      })
    );
    podiumEdges.position.copy(podium.position);
    buildingGroup.add(podiumEdges);

    // 2. Silueta Maestra / Envolvente Arquitectónica Completa (Outline del render completo)
    if (showGhostOutline) {
      const envelopeGeom = new THREE.BoxGeometry(towerWidth + 0.04, totalTowerHeight, towerDepth + 0.04);
      const envelopeEdges = new THREE.LineSegments(
        new THREE.EdgesGeometry(envelopeGeom),
        new THREE.LineBasicMaterial({
          color: isDark ? 0x52525b : 0x71717a,
          transparent: true,
          opacity: 0.35
        })
      );
      envelopeEdges.position.set(0, totalTowerHeight / 2, 0);
      buildingGroup.add(envelopeEdges);

      // Volumen de remate de cubierta / Penthouse técnico (según renders de torre residencial)
      const crownHeight = 1.05;
      const crownGeom = new THREE.BoxGeometry(towerWidth * 0.58, crownHeight, towerDepth * 0.55);
      const crownMat = new THREE.MeshStandardMaterial({
        color: isDark ? 0x27272a : 0xd4d4d8,
        transparent: true,
        opacity: 0.14,
        roughness: 0.5
      });
      const crownMesh = new THREE.Mesh(crownGeom, crownMat);
      crownMesh.position.set(-0.6, totalTowerHeight + crownHeight / 2, -0.3);
      buildingGroup.add(crownMesh);

      const crownEdges = new THREE.LineSegments(
        new THREE.EdgesGeometry(crownGeom),
        new THREE.LineBasicMaterial({
          color: isDark ? 0x52525b : 0x71717a,
          transparent: true,
          opacity: 0.45
        })
      );
      crownEdges.position.copy(crownMesh.position);
      buildingGroup.add(crownEdges);

      // Pérgola arquitectónica en terraza superior
      const pergolaGeom = new THREE.BoxGeometry(towerWidth * 0.92, 0.08, towerDepth * 0.88);
      const pergolaEdges = new THREE.LineSegments(
        new THREE.EdgesGeometry(pergolaGeom),
        new THREE.LineBasicMaterial({
          color: isDark ? 0x52525b : 0x71717a,
          transparent: true,
          opacity: 0.4
        })
      );
      pergolaEdges.position.set(0, totalTowerHeight + 0.04, 0);
      buildingGroup.add(pergolaEdges);
    }

    // Posiciones de las 10 columnas estructurales perimetrales
    const colX = [-towerWidth / 2 + 0.35, -towerWidth / 6, towerWidth / 6, towerWidth / 2 - 0.35];
    const colZ = [-towerDepth / 2 + 0.35, towerDepth / 2 - 0.35];

    // 3. Construcción realista nivel por nivel dentro de la silueta del edificio
    floors.forEach((floor, index) => {
      const yBase = index * floorPitch;
      const isSelected = selectedFloorId === floor.id;
      const isHovered = hoveredFloor?.id === floor.id;
      const isPending = floor.status === 'pending';
      const isCertified = floor.status === 'certified';
      const isReviewing = floor.status === 'reviewing';
      const isInProgress = floor.status === 'in_progress';

      const statusMeta = getStatusMeta(floor.status);
      const floorGroup = new THREE.Group();
      floorGroup.position.set(0, yBase, 0);
      buildingGroup.add(floorGroup);

      const outlineMats: THREE.LineBasicMaterial[] = [];
      const highlightMeshes: THREE.Mesh[] = [];

      const activeEdgeColor = isSelected
        ? 0xf5a400
        : isHovered
          ? 0xf5a400
          : isCertified
            ? 0x10b981
            : isReviewing
              ? 0xf5a400
              : isInProgress
                ? 0x3b82f6
                : isDark
                  ? 0x52525b
                  : 0x71717a;

      // A. Losa estructural de concreto (Piso e entrepiso)
      const slabGeom = new THREE.BoxGeometry(towerWidth, slabThickness, towerDepth);
      const slabMat = new THREE.MeshStandardMaterial({
        color: isSelected
          ? 0xf5a400
          : isPending
            ? isDark
              ? 0x27272a
              : 0xd4d4d8
            : isDark
              ? 0xd4d4d8
              : 0x52525b,
        transparent: true,
        opacity: isPending ? (showGhostOutline ? 0.14 : 0.04) : 0.95,
        roughness: 0.6,
        metalness: 0.15
      });
      const slabMesh = new THREE.Mesh(slabGeom, slabMat);
      slabMesh.position.set(0, slabThickness / 2, 0);
      floorGroup.add(slabMesh);
      highlightMeshes.push(slabMesh);

      const slabEdgeMat = new THREE.LineBasicMaterial({
        color: activeEdgeColor,
        transparent: true,
        opacity: isSelected || isHovered ? 1.0 : isPending ? 0.38 : 0.75
      });
      outlineMats.push(slabEdgeMat);

      const slabEdges = new THREE.LineSegments(new THREE.EdgesGeometry(slabGeom), slabEdgeMat);
      slabEdges.position.copy(slabMesh.position);
      floorGroup.add(slabEdges);

      // B. Balcones arquitectónicos en voladizo (frontal izquierdo y lateral derecho, como en un render residencial moderno)
      const balconyWidth = towerWidth * 0.52;
      const balconyDepth = 0.85;
      const balconySlabGeom = new THREE.BoxGeometry(balconyWidth, slabThickness * 0.85, balconyDepth);
      const balconySlab = new THREE.Mesh(balconySlabGeom, slabMat);
      balconySlab.position.set(-towerWidth * 0.18, slabThickness / 2, towerDepth / 2 + balconyDepth / 2 - 0.05);
      floorGroup.add(balconySlab);

      // Baranda de vidrio / antepecho del balcón
      const railingHeight = 0.38;
      const railingGeom = new THREE.BoxGeometry(balconyWidth, railingHeight, 0.05);
      const railingMat = new THREE.MeshStandardMaterial({
        color: isCertified ? 0xa7f3d0 : isReviewing ? 0xfde68a : 0x93c5fd,
        transparent: true,
        opacity: isPending ? 0.06 : 0.42,
        roughness: 0.2,
        metalness: 0.4
      });
      const railingMesh = new THREE.Mesh(railingGeom, railingMat);
      railingMesh.position.set(
        -towerWidth * 0.18,
        slabThickness + railingHeight / 2,
        towerDepth / 2 + balconyDepth - 0.08
      );
      floorGroup.add(railingMesh);

      const balconyEdgeMat = new THREE.LineBasicMaterial({
        color: activeEdgeColor,
        transparent: true,
        opacity: isSelected || isHovered ? 0.95 : isPending ? 0.32 : 0.65
      });
      outlineMats.push(balconyEdgeMat);
      const balconyEdges = new THREE.LineSegments(new THREE.EdgesGeometry(railingGeom), balconyEdgeMat);
      balconyEdges.position.copy(railingMesh.position);
      floorGroup.add(balconyEdges);

      // C. Núcleo central rígido (ascensores y escaleras)
      const clearHeight = floorPitch - slabThickness;
      const coreGeom = new THREE.BoxGeometry(2.4, clearHeight, 2.1);
      const coreMat = new THREE.MeshStandardMaterial({
        color: isDark ? 0x3f3f46 : 0xa1a1aa,
        transparent: true,
        opacity: isPending ? 0.08 : 0.72,
        roughness: 0.7
      });
      const coreMesh = new THREE.Mesh(coreGeom, coreMat);
      coreMesh.position.set(0.3, slabThickness + clearHeight / 2, -0.4);
      floorGroup.add(coreMesh);

      // D. Grilla de columnas estructurales perimetrales
      const colGeom = new THREE.BoxGeometry(0.28, clearHeight, 0.28);
      const colMat = new THREE.MeshStandardMaterial({
        color: isPending ? (isDark ? 0x3f3f46 : 0xa1a1aa) : isDark ? 0xe4e4e7 : 0x52525b,
        transparent: true,
        opacity: isPending ? 0.16 : 0.92,
        roughness: 0.5
      });

      for (const cx of colX) {
        for (const cz of colZ) {
          const colMesh = new THREE.Mesh(colGeom, colMat);
          colMesh.position.set(cx, slabThickness + clearHeight / 2, cz);
          floorGroup.add(colMesh);

          if (isPending && showGhostOutline) {
            const colEdges = new THREE.LineSegments(
              new THREE.EdgesGeometry(colGeom),
              balconyEdgeMat
            );
            colEdges.position.copy(colMesh.position);
            floorGroup.add(colEdges);
          }
        }
      }

      // E. Cerramiento de fachada / Ventanería arquitectónica (según el avance real del nivel)
      const glazingWidth = towerWidth - 0.35;
      const glazingDepth = towerDepth - 0.35;
      const glazingGeom = new THREE.BoxGeometry(glazingWidth, clearHeight, glazingDepth);

      // El volumen acristalado refleja si el piso está terminado, en ejecución o solo en outline
      const glassColor = isSelected
        ? 0xf5a400
        : isCertified
          ? isDark
            ? 0x10b981
            : 0x059669
          : isReviewing
            ? 0xf5a400
            : isInProgress
              ? 0x3b82f6
              : isDark
                ? 0x27272a
                : 0xe4e4e7;

      const glassOpacity = isSelected
        ? 0.42
        : isHovered
          ? 0.35
          : isCertified
            ? 0.24
            : isReviewing
              ? 0.22
              : isInProgress
                ? 0.16
                : showGhostOutline
                  ? 0.04
                  : 0.01;

      const glassMat = new THREE.MeshStandardMaterial({
        color: glassColor,
        transparent: true,
        opacity: glassOpacity,
        roughness: 0.18,
        metalness: 0.35
      });

      const glassMesh = new THREE.Mesh(glazingGeom, glassMat);
      glassMesh.position.set(0, slabThickness + clearHeight / 2, 0);
      floorGroup.add(glassMesh);

      // Contorno de fachada y modulaciones de ventanería (mullions)
      const facadeEdgeMat = new THREE.LineBasicMaterial({
        color: activeEdgeColor,
        transparent: true,
        opacity: isSelected || isHovered ? 1.0 : isPending ? (showGhostOutline ? 0.35 : 0.1) : 0.72
      });
      outlineMats.push(facadeEdgeMat);

      const facadeEdges = new THREE.LineSegments(new THREE.EdgesGeometry(glazingGeom), facadeEdgeMat);
      facadeEdges.position.copy(glassMesh.position);
      floorGroup.add(facadeEdges);

      // Volumen interno de avance físico (muestra visualmente cuánto del piso ya está ejecutado)
      if (!isPending && floor.completionPercent > 0 && floor.completionPercent < 100) {
        const progressRatio = Math.max(0.1, floor.completionPercent / 100);
        const progWidth = (glazingWidth - 0.3) * progressRatio;
        const progGeom = new THREE.BoxGeometry(progWidth, clearHeight * 0.75, glazingDepth - 0.3);
        const progMat = new THREE.MeshStandardMaterial({
          color: statusMeta.accentHex,
          transparent: true,
          opacity: 0.28,
          roughness: 0.3
        });
        const progMesh = new THREE.Mesh(progGeom, progMat);
        progMesh.position.set(
          -(glazingWidth - 0.3 - progWidth) / 2,
          slabThickness + (clearHeight * 0.75) / 2,
          0
        );
        floorGroup.add(progMesh);
      }

      // F. Caja de colisión invisible para selección precisa con el mouse
      const hitBoxGeom = new THREE.BoxGeometry(towerWidth + 0.6, floorPitch, towerDepth + 1.2);
      const hitBoxMat = new THREE.MeshBasicMaterial({
        transparent: true,
        opacity: 0,
        depthWrite: false
      });
      const hitBox = new THREE.Mesh(hitBoxGeom, hitBoxMat);
      hitBox.position.set(0, floorPitch / 2, 0.2);
      hitBox.userData = { floor };
      floorGroup.add(hitBox);

      hitTargets.push({
        mesh: hitBox,
        floor,
        outlineMats,
        highlightMeshes
      });
    });
  }

  function onPointerDown(event: PointerEvent) {
    isDragging = true;
    pointerDownPos = { x: event.clientX, y: event.clientY };
  }

  function onPointerMove(event: PointerEvent) {
    if (!container || !camera) return;

    const dx = event.clientX - pointerDownPos.x;
    const dy = event.clientY - pointerDownPos.y;

    if (isDragging && (Math.abs(dx) > 3 || Math.abs(dy) > 3)) {
      autoRotate = false;
      targetRotationY += dx * 0.008;
      targetTiltX = Math.max(0.12, Math.min(0.85, targetTiltX + dy * 0.005));
      pointerDownPos = { x: event.clientX, y: event.clientY };
      container.style.cursor = 'grabbing';
      return;
    }

    const rect = container.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(hitTargets.map((t) => t.mesh));

    if (intersects.length > 0) {
      container.style.cursor = 'pointer';
      const hitFloor = intersects[0].object.userData.floor as FloorData;
      if (hoveredFloor?.id !== hitFloor.id) {
        hoveredFloor = hitFloor;
        rebuildArchitecture();
      }
    } else {
      container.style.cursor = isDragging ? 'grabbing' : 'grab';
      if (hoveredFloor !== null) {
        hoveredFloor = null;
        rebuildArchitecture();
      }
    }
  }

  function onPointerUp(event: PointerEvent) {
    const movedDist = Math.hypot(event.clientX - pointerDownPos.x, event.clientY - pointerDownPos.y);
    isDragging = false;
    if (container) container.style.cursor = hoveredFloor ? 'pointer' : 'grab';

    if (movedDist < 5 && hoveredFloor) {
      onSelect(hoveredFloor);
    }
  }

  function onWheel(event: WheelEvent) {
    event.preventDefault();
    const delta = event.deltaY > 0 ? -0.08 : 0.08;
    zoomLevel = Math.max(0.65, Math.min(1.65, Number((zoomLevel + delta).toFixed(2))));
    updateCameraProjection();
  }

  function onWindowResize() {
    if (!container || !renderer || !camera) return;
    const width = container.clientWidth;
    const height = container.clientHeight;
    updateCameraProjection();
    renderer.setSize(width, height);
  }

  function animate() {
    animationFrameId = requestAnimationFrame(animate);
    if (buildingGroup) {
      if (autoRotate && !isDragging) {
        targetRotationY += 0.0018;
      }
      currentRotationY += (targetRotationY - currentRotationY) * 0.1;
      currentTiltX += (targetTiltX - currentTiltX) * 0.1;

      buildingGroup.rotation.y = currentRotationY;
      buildingGroup.rotation.x = currentTiltX - 0.35;
    }
    if (renderer && scene && camera) {
      renderer.render(scene, camera);
    }
  }

  $effect(() => {
    const _dark = projectStore.isDark;
    const _sel = selectedFloorId;
    const _fl = floors;
    const _ghost = showGhostOutline;
    if (scene) {
      rebuildArchitecture();
    }
  });

  onMount(() => {
    initThree();
  });

  onDestroy(() => {
    cancelAnimationFrame(animationFrameId);
    if (renderer?.domElement) {
      const dom = renderer.domElement;
      dom.removeEventListener('pointerdown', onPointerDown);
      dom.removeEventListener('pointermove', onPointerMove);
      dom.removeEventListener('pointerup', onPointerUp);
      dom.removeEventListener('wheel', onWheel);
      window.removeEventListener('resize', onWindowResize);
      renderer.dispose();
      if (container && container.contains(dom)) {
        container.removeChild(dom);
      }
    }
  });

  const activeInspectedFloor = $derived(
    hoveredFloor ?? floors.find((f) => f.id === selectedFloorId) ?? null
  );
</script>

<div class="relative w-full h-full min-h-[540px]">
  <!-- Lienzo WebGL 3D -->
  <div bind:this={container} class="w-full h-full min-h-[540px] cursor-grab"></div>

  <!-- Controles de cámara y silueta en esquina inferior derecha -->
  <div class="absolute bottom-4 right-4 z-20 flex items-center gap-1.5 bg-background/90 backdrop-blur-md p-1 rounded-lg border border-border shadow-sm">
    <button
      type="button"
      onclick={() => (showGhostOutline = !showGhostOutline)}
      class="px-2.5 py-1 rounded text-[11px] font-medium flex items-center gap-1.5 transition-colors cursor-pointer {showGhostOutline
        ? 'bg-muted text-foreground'
        : 'text-muted-foreground hover:text-foreground'}"
      title="Mostrar u ocultar el contorno proyectado de toda la torre"
    >
      <Eye class="w-3.5 h-3.5" />
      <span class="hidden sm:inline">Outline proyectado</span>
    </button>

    <button
      type="button"
      onclick={() => (autoRotate = !autoRotate)}
      class="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors cursor-pointer"
      title={autoRotate ? 'Pausar rotación automática' : 'Reanudar rotación automática'}
    >
      {#if autoRotate}
        <Pause class="w-3.5 h-3.5" />
      {:else}
        <Play class="w-3.5 h-3.5" />
      {/if}
    </button>

    <button
      type="button"
      onclick={resetCamera}
      class="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors cursor-pointer"
      title="Restablecer ángulo de cámara"
    >
      <RotateCcw class="w-3.5 h-3.5" />
    </button>
  </div>

  <!-- Selector rápido vertical de pisos (derecha media) para elegir nivel sin perder la vista 3D -->
  <div class="absolute right-4 top-16 z-20 hidden sm:flex flex-col gap-1 bg-background/85 backdrop-blur-md p-1.5 rounded-lg border border-border shadow-sm">
    <div class="text-[10px] font-medium text-muted-foreground px-1.5 pb-0.5 text-center">
      Niveles
    </div>
    {#each [...floors].reverse() as f (f.id)}
      {@const isSel = selectedFloorId === f.id || hoveredFloor?.id === f.id}
      {@const meta = getStatusMeta(f.status)}
      <button
        type="button"
        onmouseenter={() => {
          hoveredFloor = f;
          rebuildArchitecture();
        }}
        onmouseleave={() => {
          hoveredFloor = null;
          rebuildArchitecture();
        }}
        onclick={() => onSelect(f)}
        class="flex items-center justify-between gap-2 px-2 py-1 rounded text-[11px] tabular-nums transition-colors cursor-pointer {isSel
          ? 'bg-foreground text-background font-medium'
          : 'text-foreground hover:bg-muted/70'}"
      >
        <span class="flex items-center gap-1.5">
          <span class="w-1.5 h-1.5 rounded-full {meta.badgeDot}"></span>
          <span>P{f.levelNumber}</span>
        </span>
        <span class="text-[10px] opacity-80">{f.completionPercent}%</span>
      </button>
    {/each}
  </div>

  <!-- Tarjeta flotante de telemetría cuando se inspecciona un piso en 3D -->
  {#if activeInspectedFloor}
    {@const meta = getStatusMeta(activeInspectedFloor.status)}
    <div class="absolute bottom-14 left-4 z-20 w-72 bg-background/95 backdrop-blur-md p-3.5 rounded-lg border border-border shadow-md pointer-events-none transition-all">
      <div class="flex items-center justify-between gap-2 mb-1">
        <span class="inline-flex items-center gap-1.5 text-[11px] font-medium text-foreground">
          <span class="w-2 h-2 rounded-full {meta.badgeDot}"></span>
          {meta.label}
        </span>
        <span class="text-[11px] text-muted-foreground tabular-nums">
          Cota +{(activeInspectedFloor.levelNumber * 3.2).toFixed(1)}m
        </span>
      </div>
      <div class="text-xs font-semibold text-foreground truncate">
        {activeInspectedFloor.name}
      </div>
      <div class="mt-2 flex items-center justify-between text-[11px] text-muted-foreground tabular-nums">
        <span>Avance físico: <strong class="text-foreground">{activeInspectedFloor.completionPercent}%</strong></span>
        <span>Meta: {activeInspectedFloor.scheduledPercent}%</span>
        <span>{activeInspectedFloor.photos.length} fotos</span>
      </div>
      <div class="mt-1.5 w-full h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          class="h-full rounded-full transition-all duration-300 {meta.badgeDot}"
          style="width: {activeInspectedFloor.completionPercent}%"
        ></div>
      </div>
    </div>
  {/if}
</div>
