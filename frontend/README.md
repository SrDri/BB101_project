# TRAMO Frontend — Gemelo Digital 3D, Control Fiduciario y Auditoría en Stellar Soroban

Aplicación web desarrollada con **SvelteKit (Svelte 5 Runes)**, **Tailwind CSS v4**, **Three.js** y **Chart.js** para la gestión integral de patrimonios autónomos inmobiliarios, interventoría técnica NSR-10 y trazabilidad criptográfica de desembolsos sobre **Stellar Soroban**.

---

## 1. Requisitos Previos

- **[Node.js](https://nodejs.org/)** v18.18+ o v20+ (LTS recomendado)
- **[npm](https://www.npmjs.com/)** v9 o superior

---

## 2. Instalación y Ejecución Local

1. **Ubicarse en la carpeta del frontend:**
   ```bash
   cd frontend
   ```

2. **Instalar las dependencias del proyecto:**
   ```bash
   npm install
   ```

3. **(Opcional) Configurar variables de entorno:**
   Puedes tomar como referencia el archivo `.env.example` si deseas conectar servicios externos:
   ```bash
   cp .env.example .env
   ```

4. **Iniciar el servidor de desarrollo:**
   ```bash
   npm run dev
   ```

5. **Abrir en el navegador:**
   Ingresa a `http://localhost:5173`.

---

## 3. Scripts Disponibles

| Comando | Descripción |
| :--- | :--- |
| `npm run dev` | Inicia el servidor de desarrollo local con recarga en caliente (HMR). |
| `npm run check` | Ejecuta `svelte-check` y valida el tipado estático de TypeScript. |
| `npm run build` | Compila la aplicación optimizada para producción en `.svelte-kit/` y `build/`. |
| `npm run preview` | Levanta un servidor local para probar la versión compilada de producción. |

---

## 4. Perfiles de Demostración Interactiva

Desde la pantalla de inicio de sesión (`/login`) o usando el **Selector de Rol en Vivo** en la parte inferior del menú vertical izquierdo, puedes cambiar en cualquier momento entre los actores del flujo fiduciario:

| Rol | Entidad Simulada | Vistas Principales |
| :--- | :--- | :--- |
| **Administrador** | Consola Global TRAMO | Acceso total, cambio de vista en vivo y bitácora forense (`/auditoria`) |
| **Fiduciaria** | Alianza Fiduciaria S.A. | Curva S (`Chart.js`), Comité de Giros ACH, Retención 5% (`/fiduciaria`) |
| **Interventor** | Proyectos & Diseños S.A.S. | Matriz por piso, Laboratorio NSR-10, Hallazgos y Sello Soroban (`/interventor`) |
| **Constructor** | Constructora Bolívar / Marval | Radicación de hitos, PILA, Evidencias y Portafolio (`/proyectos`, `/fiduciaria`) |
| **Propietario** | Portal Público Comprador | Plano interactivo del apartamento, Time-Lapse y Acta Posventa (`/propietario`) |

---

## 5. Stack Tecnológico

- **Framework Principal:** [SvelteKit 2](https://svelte.dev/docs/kit) + **Svelte 5** (`$state`, `$derived`, `$effect`).
- **Estilos y UI:** [Tailwind CSS v4](https://tailwindcss.com/) con soporte para tema claro/oscuro institucional (`dark`), scrollbars personalizados y componentes modulares.
- **Visualización 3D (Gemelo Digital BIM):** [Three.js](https://threejs.org/) con cámara orbital interactiva, explosión de niveles, inspección por piso y semáforo de certificación.
- **Inteligencia Financiera:** [Chart.js](https://www.chartjs.org/) para la **Curva S Interactiva** (avance programado vs. físico certificado vs. desembolso financiero) e histograma de flujo de caja por hito.
- **Criptografía y Blockchain:** API nativa `Web Crypto (SHA-256)` para el cálculo determinista de hashes de certificados de obra y simulación de anclaje en el contrato `corte_registry` de **Stellar Soroban Testnet**.
- **Iconografía:** [`@lucide/svelte`](https://lucide.dev/).

---

## 6. Mapa de Rutas y Módulos

### Consola Corporativa (Menú Vertical Colapsable + Topbar con Bandeja de Firmas)
| Ruta | Módulo | Descripción Funcional |
| :--- | :--- | :--- |
| `/` | **Inicio (Dashboard)** | Resumen ejecutivo del corte activo, KPIs de avance, vista previa del Gemelo 3D y tabla resumida por pisos. |
| `/ficha-proyecto` | **Ficha del Proyecto** | Perfil comercial y técnico: punto de equilibrio, amenidades, constructora y planos arquitectónicos por tipología. |
| `/gemelo` | **Vista 3D (BIM)** | Visor 3D interactivo a pantalla completa con filtros por estado, modo rayos X y modal detallado por piso. |
| `/evidencias` | **Evidencias Fotográficas** | Galería georreferenciada con metadatos EXIF/hash y **Comparador Visual Antes vs. Después (Time-Lapse Slider)**. |
| `/interventor` | **Interventoría Técnica** | Consola en pestañas: Matriz de aprobación por piso, Laboratorio de Materiales NSR-10 (concreto/acero), Hallazgos y Firma Soroban. |
| `/fiduciaria` | **Fiduciaria y Giros** | Curva S (`Chart.js`), Fuentes de Fondeo, Matriz de Hitos, Historial ACH, Certificados Soroban y Liberación de Retención (5%). |
| `/cumplimiento` | **Cumplimiento Legal** | Semáforo de pólizas (Ley 1796 de 2016, Todo Riesgo Construcción), licencias urbanísticas y bóveda documental verificada. |
| `/calendario` | **Calendario y Agenda** | Calendario mensual avanzado con filtro por tipo de evento, agenda cronológica e integración para agendar nuevos hitos. |
| `/auditoria` | **Auditoría y Bitácora** | Registro forense inmutable de acciones por rol con inspector de cambios de estado (*State Diff*: `Valor Anterior → Valor Nuevo`) y exportación CSV. |
| `/proyectos` | **Portafolio de Obras** | Gestión multi-proyecto (obras en ejecución vs. finalizadas) y formulario para registrar nuevos fideicomisos inmobiliarios. |

### Portales Públicos Aislados y Autenticación
| Ruta | Módulo | Descripción Funcional |
| :--- | :--- | :--- |
| `/propietario` | **Portal del Propietario** | Saludo personalizado, avance de su apartamento, plano arquitectónico con pines fotográficos, comparador Antes/Después, **Snag List Posventa** y firma digital del **Acta de Entrega**. |
| `/verificar` | **Verificador Público** | Validador abierto de certificados JSON y hashes `SHA-256` contra el ledger de Stellar Soroban. |
| `/login` | **Acceso Corporativo** | Inicio de sesión con selector rápido de los 4 perfiles corporativos de demostración. |

---

## 7. Arquitectura de Directorios (`src/`)

```text
frontend/src/
├── lib/
│   ├── components/
│   │   ├── building-twin/                        # Visor 3D (Three.js), cajón de inspección por piso y vistas isométricas
│   │   ├── dashboard/                            # Curva S (Chart.js), KPIs, mapa y panel de desembolsos fiduciarios
│   │   ├── layout/                               # AppSidebar colapsable y PublicHeader
│   │   ├── twin/                                 # Comparador visual Antes/Después (BeforeAfterComparisonSlider)
│   │   ├── ui/                                   # Componentes base de interfaz (Card, Badge, Button, Table, Tabs)
│   │   └── verification/                         # Dropzone y tarjeta de veredicto criptográfico SHA-256
│   ├── services/
│   │   └── hasher.ts                             # Motor de cálculo SHA-256 determinista y generación de certificados
│   ├── stores/
│   │   ├── businessData.ts                       # Datos semilla (Hitos, Pólizas, Laboratorio, Snag List, Auditoría)
│   │   └── projectState.svelte.ts                # Estado global reactivo (Svelte 5 Runes) y mutaciones de negocio
│   └── types/
│       ├── certificate.ts                        # Esquema del certificado criptográfico anclado en Soroban
│       └── twin.ts                               # Interfaces TypeScript del dominio fiduciario, técnico y posventa
└── routes/                                       # Rutas de SvelteKit (+layout.svelte, +page.svelte y endpoints API)
```
