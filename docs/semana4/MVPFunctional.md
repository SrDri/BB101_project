# Documentación — Semana 4: MVP Functional

**Proyecto:** Tramo — Fideicomisos y Control de Obra Inmutable  
**Repositorio:** [BB101_project](https://github.com/SrDri/BB101_project)  
**Track:** Stellar Soroban Smart Contracts (Rust)  

---

## Enlaces Públicos y Evidencia Verificable en Stellar Testnet

| Recurso | Enlace Verificable | Descripción |
|---|---|---|
| **Contrato Inteligente (`corte_registry`)** | [`CB5L2JGJ...H44T` en Stellar.Expert](https://stellar.expert/explorer/testnet/contract/CB5L2JGJIAXUUORKHBJFGLS5Y3BOW6LE44WEQ23JEK3KTIN2I252H44T) | Contrato en Soroban Rust desplegado en Testnet con inmutabilidad estricta. |
| **Transacción de Despliegue e Instanciación** | [Tx `5cf2ec0b...` en Stellar.Expert](https://stellar.expert/explorer/testnet/tx/5cf2ec0be667ebebbfc41cceda850bc5cff0d09c939e9cd40399f602a011cced) | Registro del bytecode WASM e instanciación en el ledger 5264902. |
| **Transacción de Inicialización (`init`)** | [Tx `75fc5f8d...` en Stellar.Expert](https://stellar.expert/explorer/testnet/tx/75fc5f8dd3646935564a2350cffed8b48627df6799bfff95bde91ca004e62b95) | Inicialización con cuenta administradora en el ledger 5264903. |
| **Transacción de Sellado de Corte #4** | [Tx `452ef966...` en Stellar.Expert](https://stellar.expert/explorer/testnet/tx/452ef966702a172ed2be7ba0fc53ea306661bfe34900e53ad5b648dfbc33d4be) | Certificado real del Corte #4 de Torre Alameda sellado en el ledger 5264904. |
| **Cuenta Patrocinadora Relayer** | [`GC6RUZUX...` en Stellar.Expert](https://stellar.expert/explorer/testnet/account/GC6RUZUXCYOAUOAXRFICYGOCTJTYYNVYZFG4QGC4OI7FYYVQKV7MVM3S) | Cuenta pagadora para transacciones sin fricción Web3. |
| **Video Demostrativo y Pitch (máx. 3 min)** | [Video Oficial en YouTube](https://youtu.be/SEMANA4_TRAMO_DEMO_PLACEHOLDER) | Demostración funcional del MVP de extremo a extremo y pitch de negocio. |
| **Producto en Línea (Front + Back)** | [Repositorio y Guía de Ejecución Local / Vercel](https://github.com/SrDri/BB101_project) | Front en SvelteKit 5 conectado a los endpoints `/api/soroban/*`. |

---

## Integrante del Equipo y Compromiso Individual

| Integrante | Usuario de GitHub | Rol y Responsabilidad en el Entregable 4 |
|---|---|---|
| **Juan Jose Carabali** | [@SrDri](https://github.com/SrDri) | Implementación integral del contrato en Soroban Rust (`corte_registry`), tests unitarios, compilación WASM, despliegue en Testnet, arquitectura del relayer en SvelteKit y conexión en vivo del front. |

---

## 1. Aprendizajes y ajustes priorizados

Durante la construcción del MVP funcional, el equipo enfrentó la transición desde prototipos visuales hacia la interoperabilidad estricta con Stellar Soroban. El principal aprendizaje técnico radicó en la incompatibilidad entre las versiones recientes del compilador de Rust (1.82+) y el target tradicional `wasm32-unknown-unknown` dentro del ecosistema Soroban SDK v29, lo cual exigió migrar al target `wasm32v1-none` y configurar banderas de spec-shaking. Asimismo, comprendimos que registrar metadatos extensos de obra directamente en el ledger dispara los costos de almacenamiento y excede los límites de cómputo por invocación; por ende, la arquitectura óptima consiste en anclar únicamente la huella criptográfica canónica SHA-256 junto con identificadores clave (`projectId`, `corteNumber`, matrícula COPNIA, porcentaje y monto), delegando los datos enriquecidos al almacenamiento descentralizado.

Ordenando por impacto y esfuerzo, se priorizaron los siguientes ajustes antes del cierre:
1. **Alto impacto / Medio esfuerzo (Completado):** Despliegue del contrato `corte_registry` en Stellar Testnet y construcción del servicio relayer en SvelteKit (`/api/soroban/seal` y `/api/soroban/verify`), permitiendo sellar y auditar transacciones reales sin obligar al interventor ni a la fiduciaria a instalar billeteras Web3 ni custodiar tokens XLM.
2. **Alto impacto / Bajo esfuerzo (Completado):** Integración de enlaces dinámicos hacia Stellar.Expert en los módulos de Interventoría, Verificación Pública y Comité Fiduciario para verificación externa bit a bit.
3. **Medio impacto / Alto esfuerzo (Pendiente post-cierre):** Migración del relayer centralizado hacia firmas biométricas descentralizadas mediante el estándar WebAuthn/Passkeys, garantizando no repudio personal sin sacrificar la experiencia de usuario.

---

## 2. Riesgos y pendientes

A pesar de contar con un MVP operativo y conectado a Stellar Testnet, identificamos riesgos operativos y técnicos que deben gestionarse antes del escalamiento a producción:

El primer riesgo es el mecanismo de **State Archival (TTL) de Soroban**. En Stellar, las entradas de almacenamiento persistente poseen un tiempo de vida finito que requiere transacciones de renovación (*extend_ttl*). Si un patrimonio autónomo fiduciario tiene una vigencia de 36 meses y el contrato no renueva oportunamente las entradas de los primeros cortes, los registros podrían archivarse, impidiendo la verificación instantánea por parte de compradores o auditores forenses. Como pendiente técnico prioritario, se diseñará un cronjob fiduciario automatizado que extienda el TTL de todos los cortes activos previo a cada comité mensual.

El segundo riesgo corresponde a la **disponibilidad y latencia de los nodos RPC públicos**. La plataforma depende de llamadas a `soroban-testnet.stellar.org` para simular y enviar transacciones. Fluctuaciones de red o caídas temporales del endpoint público pueden degradar la experiencia de sellado en obra. Queda pendiente incorporar proveedores RPC redundantes (como QuickNode o Blockdaemon) con políticas de reintento exponencial y fallback resiliente.

El tercer riesgo radica en la **gobernanza de la clave relayer**. Actualmente, el patrocinio de transacciones se gestiona desde una cuenta controlada por el backend institucional de Tramo. Si dicha cuenta agota sus reservas de XLM o sufre un compromiso de credenciales, el flujo de sellado se interrumpe. Se implementará una arquitectura multi-firma (multisig) fiduciaria y monitoreo automatizado de saldos mínimos.

Finalmente, queda pendiente habilitar la carga masiva y descentralizada de fotografías de obra mediante bundles en IPFS/Arweave con sellado de Merkle Trees agregados.

---

## 3. Plan de validación con usuarios

Para comprobar la adopción y el valor de Tramo en el sector fiduciario e inmobiliario colombiano, ejecutaremos un plan de validación estructurado con los actores definidos en el *Problem Brief*:

### A quiénes validaremos
1. **Sociedades Fiduciarias:** 3 directores fiduciarios y 4 analistas de comités de giros encargados de patrimonios autónomos inmobiliarios.
2. **Empresas de Interventoría Técnica:** 5 ingenieros civiles certificados con matrícula profesional COPNIA activa.
3. **Compradores de Vivienda:** 8 propietarios en fase de preventa o construcción sobre planos.

### Métodos de validación
- **Pruebas de Usabilidad con el MVP Funcional:** Sesiones guiadas de 45 minutos donde el interventor audita un corte real en `/interventor` y sella la transacción en Stellar, mientras el analista fiduciario revisa el checklist normativo en `/fiduciaria` y autoriza el giro ACH.
- **Auditoría Forense Ciega (Portal Verificador):** Entrega de certificados auténticos y certificados intencionalmente alterados en un bit para evaluar si los usuarios identifican el veredicto criptográfico en `/verificar`.
- **Entrevistas Cualitativas Semiestructuradas:** Indagación sobre la percepción de seguridad jurídica frente a la Ley 1796 de 2016 (Ley de Vivienda Segura).

### Hipótesis a comprobar y criterios de éxito
1. **Hipótesis de Adopción Fiduciaria:** El registro inmutable en Soroban reduce los tiempos de revisión y aprobación de giros fiduciarios en al menos un **50%** en comparación con los informes en papel o carpetas compartidas.  
   *Criterio de éxito:* 100% de los analistas aprueba el hito en menos de 10 minutos y califica la certeza técnica con un puntaje superior a 4.5/5.0.
2. **Hipótesis de Usabilidad en Obra (Cero Fricción Cripto):** Los interventores técnicos pueden sellar avances oficiales sin requerir conocimientos sobre blockchain ni configurar billeteras.  
   *Criterio de éxito:* El 100% de los interventores completa el sellado en un solo intento sin asistencia en menos de 2 minutos.
3. **Hipótesis de Confianza del Comprador:** Los compradores valoran consultar el gemelo digital y comprobar la autenticidad del avance físico de su apartamento.  
   *Criterio de éxito:* Al menos el 80% de los usuarios manifiesta que Tramo incrementa su tranquilidad sobre la entrega de su vivienda.
