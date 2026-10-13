# TRAMO — Certificación de Avances de Obra y Control Fiduciario en Stellar Soroban

**TRAMO** es una plataforma de infraestructura fiduciaria y auditoría técnica para proyectos inmobiliarios en Colombia. Conecta el **Gemelo Digital 3D (BIM)** de la obra, las actas de **Interventoría Técnica (COPNIA)**, el cumplimiento normativo (**NSR-10 / Ley 1796 de 2016**) y la liberación de desembolsos del **Patrimonio Autónomo Fiduciario** mediante sellos criptográficos inmutables (`SHA-256`) anclados en la red **Stellar Soroban**.

---

## Ecosistema y Flujo de Negocio

La plataforma articula en un solo flujo verificable a los cinco actores de un proyecto inmobiliario:

1. **Constructora (Promotor / Desarrollador):** Radicación de hitos de obra, soporte de seguridad social (PILA), carga de evidencias georreferenciadas y atención de posventa.
2. **Interventoría Técnica (COPNIA):** Inspección de avance físico por piso en el modelo 3D, validación de ensayos de laboratorio ONAC (concreto y acero) y sellado criptográfico del corte en **Stellar Soroban**.
3. **Sociedad Fiduciaria (Comité de Giros):** Control presupuestal mediante Curva S, verificación de expediente legal, autorización de giros ACH (con retención en garantía del 5%) y liberación posventa.
4. **Propietario / Comprador:** Seguimiento personalizado del avance real de su apartamento sobre plano arquitectónico interactivo, comparador visual *Antes vs. Después* y firma digital del acta de entrega.
5. **Verificador Público:** Consulta abierta para auditar que cualquier certificado JSON o hash `SHA-256` coincida con el registro inmutable en la blockchain.

---

## Estructura del Repositorio

Cada módulo del proyecto cuenta con su propia documentación y guía específica dentro de su directorio correspondiente:

```text
BB101_project/
├── docs/                  # Documentación de negocio, arquitectura y entregables por semana
│   ├── semana1/           # Problem Brief y definición del caso de uso blockchain
│   ├── semana2/           # Product Blueprint, Lean Canvas y diseño de arquitectura
│   └── semana3/           # Especificación funcional y flujo técnico-fiduciario
├── frontend/              # Aplicación web interactiva (SvelteKit + Three.js + Chart.js + Soroban)
│   └── README.md          # Guía de instalación, comandos, rutas y arquitectura del frontend
├── .gitignore             # Reglas de exclusión del repositorio
└── README.md              # Visión general e índice maestro del proyecto
```

---

## Navegación Rápida

| Recurso | Ubicación | Contenido |
| :--- | :--- | :--- |
| **Semana 1 — Problem Brief** | [`docs/semana1/ProblemBrief.md`](./docs/semana1/ProblemBrief.md) | Problemática del sector fiduciario/inmobiliario y tesis de solución |
| **Semana 2 — Product Blueprint** | [`docs/semana2/ProductBlueprint.md`](./docs/semana2/ProductBlueprint.md) | Modelo de negocio, arquitectura y flujo de datos on-chain / off-chain |
| **Semana 3 — Documentación** | [`docs/semana3/Documentacion.md`](./docs/semana3/Documentacion.md) | Profundización funcional, contratos y trazabilidad de cortes de obra |
| **Aplicación Web (Frontend)** | [`frontend/README.md`](./frontend/README.md) | **Requisitos, guía de instalación (`npm install` / `npm run dev`), rutas y arquitectura** |
