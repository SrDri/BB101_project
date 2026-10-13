# Documentación — Semana 3: Functional Proof

**Proyecto:** Tramo  
**Repositorio:** [BB101_project](https://github.com/SrDri/BB101_project)  

---

## 1. Front construido

Para este entregable se diseñó e implementó la aplicación web completa de **Tramo** en la carpeta [`frontend/`](../../frontend/README.md), construida con **SvelteKit (Svelte 5 Runes)**, **TypeScript**, **Tailwind CSS v4**, **Three.js** y **Chart.js**. La plataforma materializa de extremo a extremo el flujo de negocio fiduciario, técnico e inmobiliario definido en el *Product Blueprint*, conectando en tiempo real a los cinco actores del ecosistema: **Constructora**, **Interventoría Técnica (COPNIA)**, **Sociedad Fiduciaria (Comité de Giros)**, **Propietario / Comprador** y **Verificador Público**.

A continuación se detallan los módulos y pantallas implementadas, su lógica operativa y cómo responden a las historias de usuario del Blueprint:

### 1.1. Consola Principal, Gemelo Digital 3D (BIM) y Ficha del Proyecto (`/`, `/gemelo`, `/ficha-proyecto`)
- **Conexión con el Blueprint:** Materializa la visualización espacial del avance físico por nivel constructivo y la transparencia técnica del proyecto frente al encargo fiduciario.
- **Funcionalidad implementada:**
  - **Gemelo Digital 3D Interactivo (`Three.js`):** Modelo tridimensional de la torre donde cada piso se colorea dinámicamente según su estado real de certificación (*Certificado en Soroban*, *En revisión de interventoría*, *En ejecución* o *Programado*). Incluye cámara orbital, separación vertical de niveles (*exploded view*), modo rayos X y cajón/modal ancho de inspección detallada por piso y por unidad.
  - **Dashboard Ejecutivo (`/`):** KPIs consolidados del corte activo, barra de progreso físico vs. financiero, vista previa interactiva del modelo 3D y matriz resumida de pisos sin desbordamiento visual.
  - **Ficha Integral del Proyecto (`/ficha-proyecto`):** Punto de equilibrio comercial (unidades vendidas vs. meta fiduciaria), amenidades, perfil de trayectoria de la constructora y visor de **planos arquitectónicos por tipología de apartamento** (`Tipo A`, `Tipo B`, `Penthouse`).

### 1.2. Evidencias Fotográficas y Comparador Visual "Antes vs. Después" (`/evidencias`)
- **Conexión con el Blueprint:** Corresponde a la **Historia de Usuario #3** (*"Como interventor de obra quiero capturar y auditar fotos guiadas por piso o frente..."*) y a los Pasos 1 y 2 del flujo del MVP.
- **Funcionalidad implementada:**
  - **Galería Técnica Georreferenciada:** Inspección de evidencias fotográficas clasificadas por piso y frente constructivo, con validación de metadatos GPS, fecha/hora de captura, huella `SHA-256` individual y estado de validación por visión artificial.
  - **Comparador Interactivo "Antes vs. Después" (*Time-Lapse Split Slider*):** Cortina deslizante interactiva (`0%` a `100%`) que superpone el estado de un mismo frente de obra en un corte anterior frente al corte actual, mostrando los hashes `SHA-256` de ambas capturas para comprobar visualmente la evolución física real antes de autorizar desembolsos.

### 1.3. Consola de Interventoría Técnica, Laboratorio NSR-10 y Sellado Soroban (`/interventor`)
- **Conexión con el Blueprint:** Cumple la **Historia de Usuario #1** (*"Como interventor quiero revisar, corregir y firmar el certificado de avance..."*) y la **Historia de Usuario #5** (*"Estimación del avance calculada a partir de fotos para preparar el informe"*), cubriendo los Pasos 3, 4 y 5 del flujo.
- **Funcionalidad implementada:**
  - **Espacio de trabajo estructurado en 3 pestañas técnicas:**
    1. **Matriz de Aprobación por Piso:** Contrasta el porcentaje estimado por IA frente al avance físico calibrado y avalado por el interventor humano, permitiendo aprobar niveles individuales con 1 clic.
    2. **Control de Calidad y Laboratorio NSR-10 (`ONAC`):** Registro y auditoría de pruebas críticas de materiales exigidas por la norma sismorresistente colombiana (ensayos de compresión de cilindros de concreto en `MPa` y pruebas de tracción de acero de refuerzo), vinculadas al corte activo.
    3. **Hallazgos Técnicos y No Conformidades:** Gestión de observaciones de obra clasificadas por severidad (*Crítica*, *Mayor*, *Menor*). La existencia de un hallazgo crítico abierto activa automáticamente una alerta de **bloqueo preventivo** en la vista fiduciaria.
  - **Firma COPNIA y Sellado Criptográfico en Stellar Soroban:** Al certificar el corte, la aplicación estructura el payload canónico JSON, calcula localmente su huella `SHA-256` mediante `Web Crypto API` y registra el sello inmutable asociado al contrato `corte_registry` en **Stellar Testnet**.

### 1.4. Inteligencia Financiera, Comité Fiduciario y Giros ACH (`/fiduciaria`)
- **Conexión con el Blueprint:** Cumple la **Historia de Usuario #4** (*"Como analista de una fiduciaria quiero consultar el certificado de cada corte con su evidencia para decidir si apruebo el giro"*) y la **Historia de Usuario #6** (*"Como constructor quiero ver el estado de verificación de cada corte y radicar cobros"*), abarcando los Pasos 6 y 7 del flujo.
- **Funcionalidad implementada:**
  - **Curva S Interactiva (`Chart.js`) y Flujo de Caja:** Gráfico dinámico con selector de modo (*Curva S Acumulada `%`* vs. *Flujo de Caja por Hito `COP`*) que compara el avance programado, el avance físico certificado en Soroban y el desembolso financiero real, acompañado de la estructura de **Fuentes de Fondeo** del fideicomiso (aportes de compradores, crédito constructor bancario y capital propio).
  - **Centro Unificado de Control Fiduciario en 4 pestañas:**
    1. **Matriz de Hitos y Aprobaciones:** Desglose de cada hito con cálculo automático del **Valor Bruto**, **Retención en Garantía (5%)** y **Giro Neto (95%)**. Permite a la constructora radicar facturas electrónicas y planillas PILA, y a la fiduciaria auditar el checklist normativo y autorizar el desembolso ACH.
    2. **Historial de Giros ACH:** Relación de transferencias ejecutadas con comprobante descargable/imprimible y referencia al hash de Stellar.
    3. **Certificados Soroban:** Inventario de certificados criptográficos emitidos por corte con acceso directo al verificador.
    4. **Posventa y Retención 5%:** Control de actas de entrega firmadas por propietarios, seguimiento de detalles locativos (*Snag List*) y botón de **autorización de liberación del Fondo de Retención en Garantía (5%)**.
  - **Acta Oficial de Comité Fiduciario:** Generación de reporte ejecutivo listo para impresión/PDF.

### 1.5. Cumplimiento Legal, Calendario Operativo y Bitácora Forense de Auditoría (`/cumplimiento`, `/calendario`, `/auditoria`)
- **Conexión con el Blueprint:** Refuerza la gobernanza institucional del patrimonio autónomo y la trazabilidad completa de las decisiones técnicas y financieras.
- **Funcionalidad implementada:**
  - **Cumplimiento y Bóveda Documental (`/cumplimiento`):** Semáforo de vigencia para requisitos legales obligatorios (Licencia de Construcción, Póliza Decenal Ley 1796 de 2016, Póliza Todo Riesgo Constructor, Paz y Salvo PILA y Punto de Equilibrio) y repositorio de documentos con hash `SHA-256` verificable.
  - **Calendario y Agenda (`/calendario`):** Calendario mensual interactivo con filtros por categoría (visitas de interventoría, comités fiduciarios, cortes de obra, vencimientos de pólizas y entregas) y creación de nuevos eventos.
  - **Auditoría y Bitácora Forense (`/auditoria`):** Registro cronológico inmutable de todas las acciones ejecutadas en la plataforma (aprobación de pisos, radicación de hitos, desembolsos ACH, cierre de hallazgos, actas posventa y sellos Soroban), con **inspector de diferencias de estado (*State Diff*: `Valor Anterior → Valor Nuevo`)**, filtros por rol y exportación a CSV.

### 1.6. Portales Públicos Aislados: Propietario y Verificador Criptográfico (`/propietario`, `/verificar`)
- **Conexión con el Blueprint:** Materializa la **Historia de Usuario #2** (*"Como cualquier interesado quiero verificar un certificado para comprobar que no fue alterado ni antedatado"* — Paso 8 del flujo) y extiende la transparencia al comprador final de vivienda.
- **Funcionalidad implementada:**
  - **Portal del Propietario (`/propietario`):** Cabecera con saludo personalizado (*"Hola, Estimado Propietario"*), consulta específica de su piso y apartamento (`Apto 802`), **plano arquitectónico real e interactivo de la unidad** con puntos estratégicos de inspección fotográfica (Cocina, Sala-Comedor, Balcón, Alcoba Principal, Alcobas Auxiliares y Zona de Ropas), comparador *Antes vs. Después* de su inmueble, y módulo de **Pre-entrega, Snag List Posventa y Firma Digital del Acta de Entrega a Satisfacción**.
  - **Verificador Criptográfico Público (`/verificar`):** Interfaz abierta sin necesidad de inicio de sesión con doble mecanismo de auditoría:
    1. **Consulta directa por Hash `SHA-256` o ID de corte:** Contrasta en tiempo real contra los registros sellados en el contrato `corte_registry`.
    2. **Verificación local de archivo JSON (*Dropzone*):** Recalcula en el navegador el hash `SHA-256` del archivo cargado y emite el veredicto criptográfico (*Certificado Auténtico e Íntegro* vs. *Documento Alterado o No Registrado*), mostrando número de ledger, timestamp inmutable y clave pública del interventor firmante.

### 1.7. Navegación, Multitenencia por Rol y Bandeja de Firmas (`/login` y Topbar)
- **Menú Vertical Colapsable (`AppSidebar`):** Diseño limpio adaptado a la identidad visual de Tramo (con transición fluida a isotipo al colapsar) y **Selector de Rol en Vivo** (*Constructora*, *Interventoría*, *Fiduciaria* y *Admin*) para recorrer todas las perspectivas durante la demostración.
- **Topbar Contextual:** Integra el **Selector Rápido de Proyecto Activo** y el **Centro de Notificaciones y Firma Pendiente (*Action Inbox*)**, que alerta dinámicamente a cada rol sobre giros listos para firma, hallazgos críticos abiertos, cortes por certificar o detalles posventa pendientes.

---

## 2. Decisión técnica

**Opción elegida:** **Opción A. Contrato propio (Soroban en Rust)**.

### Justificación de la decisión
En el Product Blueprint definimos que el propósito fundamental de Tramo es resolver la desconfianza entre constructor, fiduciaria, banco y compradores mediante un registro neutral que garantice que la evidencia de avance de obra no pueda ser alterada, sustituida ni antedatada. Para satisfacer este requerimiento con rigor técnico y legal, elegimos desarrollar un contrato inteligente propio en Soroban (el entorno de smart contracts en WebAssembly de Stellar) por las siguientes razones:

1. **Lógica de negocio y reglas de inmutabilidad estrictas:**  
   Un contrato propio permite programar una estructura de datos formal para el registro de cortes que vincula el identificador único del proyecto, el número secuencial del corte, el hash SHA-256 del certificado técnico, la marca temporal oficial del ledger y la identidad criptográfica del interventor acreditado. Crucialmente, el contrato impone a nivel de código una regla inviolable: una vez que un corte específico de un proyecto ha sido registrado y sellado, el contrato rechaza cualquier intento posterior de sobrescritura o modificación para ese mismo corte. Esta garantía previene cualquier manipulación retroactiva en auditorías o litigios.

2. **Capacidad de indexación y consulta on-chain:**  
   El contrato personalizado expone funciones públicas de solo lectura (como `get_certificate(project_id, corte_id)` y `verify_hash(corte_hash)`) que devuelven la estructura completa del registro. Esto permite que el portal de verificación y los sistemas fiduciarios auditen el historial completo de un proyecto de forma directa y determinística desde el estado de la red, sin depender de bases de datos intermedias controladas por ninguna de las partes.

### Qué opciones se descartaron y por qué
- **Memos de transacciones nativas de Stellar:** Se descartó utilizar el campo memo (de 28 o 32 bytes) en transacciones convencionales de pago. Aunque un memo prueba existencia, no posee estructura de datos relacional, no permite hacer consultas directas por proyecto ni corte, y no puede imponer validaciones lógicas para impedir registros duplicados o conflictivos para un mismo hito de obra.
- **Herramientas existentes o tokens no fungibles (NFTs) genéricos:** Se descartó acuñar certificados como tokens o usar plataformas preconstruidas de trazabilidad genéricas del ecosistema. Los certificados de avance fiduciario no son activos transferibles ni coleccionables; requieren un registro de fe pública inmutable con roles claros de firma y almacenamiento eficiente en Soroban, optimizado para costos de almacenamiento (State Archival) y libre de dependencias operativas de terceros.

---

## 3. Participación del equipo

| Integrante | Usuario de GitHub | Aporte y responsabilidad en el entregable |
|---|---|---|
| **Juan Jose Carabali** | [@SrDri](https://github.com/SrDri) | Arquitectura y desarrollo integral del frontend en **SvelteKit 5 / TypeScript / Three.js / Chart.js** (Gemelo Digital 3D por niveles, consola de interventoría técnica con laboratorio NSR-10 y hallazgos, inteligencia financiera fiduciaria con Curva S y giros ACH, cumplimiento legal, calendario, bitácora forense de auditoría, portal interactivo del propietario con plano y posventa, y verificador público criptográfico SHA-256). Redacción de la documentación técnica y diseño del esquema de contrato para Stellar Soroban. |

---

## 4. Bloqueos y siguiente paso

### Bloqueos identificados
- **Integración de transacciones patrocinadas sin fricción:** Para garantizar que el interventor de obra firme y selle certificados sin requerir una billetera Web3 ni saldo en XLM, se requiere orquestar el envío a través de un servicio de patrocinio (Launchtube o servidor con cuenta pagadora propia). La configuración de la cuenta relayer para Testnet y el manejo de firmas biométricas mediante WebAuthn/Passkeys se encuentra en fase de diseño de arquitectura para no agregar complejidad al front de esta semana.

### Siguiente paso hacia el MVP
- Implementar el contrato inteligente en Rust para Soroban (`corte_registry`), definiendo las estructuras `CertificateRecord`, las funciones de almacenamiento `register_certificate` y de consulta `get_certificate`.
- Desplegar el contrato en Stellar Testnet y conectar el cliente frontend mediante `@stellar/stellar-sdk` para que el sellado y la verificación operen de manera 100% interactiva contra la red.
