# Guión Oficial y Estructura — Video Demostrativo y Pitch (Máximo 3 Minutos)

**Proyecto:** Tramo — Fe Pública Digital para Fideicomisos y Obras con Stellar Soroban  
**Duración objetivo:** 2 minutos y 50 segundos (límite máximo permitido: 3 minutos).  
**Formato sugerido:** Grabación de pantalla con cámara web del presentador (Juan José Carabalí) en esquina inferior (vía OBS Studio o Loom), resolución 1080p, audio nítido.

---

## Estructura Minuto a Minuto

```
0:00 ── [Pitch del Problema & Tesis] ── 0:40
0:40 ── [Demo: Consola Interventor & Sello Soroban] ── 1:30
1:30 ── [Demo: Consola Fiduciaria & Giros ACH] ── 2:10
2:10 ── [Demo: Portal Verificador Criptográfico On-Chain] ── 2:35
2:35 ── [Cierre: Valor de Stellar, Negocio y Visión] ── 2:55
```

---

## Bloque 1: Problema, Oportunidad y Presentación (0:00 – 0:40)
* **Pantalla:** Portada de la aplicación (`/`) con el Gemelo Digital 3D interactivo visible de fondo.
* **Voz en off / Presentador a cámara:**
  > *"Hola a todos. En Colombia y Latinoamérica, miles de familias temen que los ahorros de su vida se queden atrapados en un proyecto sobre planos paralizado. Al mismo tiempo, las sociedades fiduciarias y los bancos gestionan billones de pesos en desembolsos respaldados en carpetas de fotos desordenadas e informes en PDF fácilmente manipulables.*  
  > *La desconfianza entre constructor, interventor y fiduciaria retrasa los giros, encarece el crédito y pone en riesgo las obras.*  
  > *Para resolverlo creamos **Tramo**: la plataforma que transforma el avance de obra en un registro de fe pública inmutable anclado en **Stellar Soroban**, garantizando que cada peso del encargo fiduciario solo se gire contra evidencia técnica auténtica y verificable."*

---

## Bloque 2: Consola de Interventoría Técnica y Sellado Soroban en Vivo (0:40 – 1:30)
* **Pantalla:** Navegar a `/interventor` (Supervisión técnica del Corte #4).
* **Acciones en pantalla:**
  1. Mostrar la matriz de pisos con el contraste entre el porcentaje estimado por IA y la calibración del interventor humano.
  2. Mostrar la pestaña de **Laboratorio NSR-10** (cilindros de concreto aprobados ONAC) y la ausencia de hallazgos críticos de bloqueo.
  3. Hacer clic en el botón **"Certificar y Sellar en Stellar Soroban"**.
  4. Mostrar la animación de cálculo de huella SHA-256 (`Web Crypto API`) y el envío de la transacción patrocinada al RPC de Testnet.
  5. Señalar el resultado: `Sellado inmutable confirmado en Stellar Testnet #5264904` y abrir el enlace de **Stellar.Expert** en una pestaña para mostrar la transacción real en el explorador.
* **Voz en off:**
  > *"Aquí vemos la consola del interventor acreditado por COPNIA. El ingeniero revisa las evidencias fotográficas, valida los ensayos sismorresistentes NSR-10 y avala el avance físico real. Al certificar, Tramo genera la huella canónica SHA-256 y la ancla en nuestro contrato inteligente `corte_registry` en Stellar.*  
  > *Gracias al patrocinio de transacciones, el interventor no necesita una billetera Web3 ni tokens XLM; la experiencia es 100% fluida, pero el registro queda grabado de manera inmutable en el ledger público de Stellar."*

---

## Bloque 3: Inteligencia Fiduciaria, Curva S y Desembolsos ACH (1:30 – 2:10)
* **Pantalla:** Navegar a `/fiduciaria` (Comité de Giros Fiduciarios).
* **Acciones en pantalla:**
  1. Mostrar la **Curva S interactiva** comparando avance programado vs. avance físico certificado en Soroban vs. desembolso real.
  2. Mostrar la tabla de **Hitos**, con el cálculo automático del 5% de retención en garantía y el 95% de giro neto.
  3. Ir a la pestaña **Certificados Soroban** y destacar el Contract ID `CB5L2JGJ...H44T` y el inventario de certificados auditables con enlace a Stellar.Expert.
* **Voz en off:**
  > *"Del lado de la fiduciaria, el comité de desembolsos no tiene que adivinar. La Curva S contrasta el avance programado contra el avance sellado en blockchain. Al auditar el hito, el sistema calcula la retención de ley del 5% y autoriza el desembolso ACH vinculado al hash criptográfico de la red. Nadie puede antedatar ni inflar porcentajes para liberar recursos indebidamente."*

---

## Bloque 4: Verificador Criptográfico Público Bit a Bit (2:10 – 2:35)
* **Pantalla:** Navegar a `/verificar` (Portal abierto).
* **Acciones en pantalla:**
  1. Arrastrar el archivo del certificado o pegar el hash `a7c93e41b2e8d7541f6e2983c48520d88b489920efbc756312a0f8d9b1c7849e`.
  2. Mostrar el veredicto en verde: *"Certificado auténtico e inalterado"*, número de bloque y enlace al contrato en Stellar Testnet.
* **Voz en off:**
  > *"Y lo más potente: cualquier comprador, banco o auditor puede entrar al portal público de verificación, cargar su certificado y contrastarlo en tiempo real contra el contrato Soroban. Si un solo byte fuera alterado, la firma no coincide y la plataforma alerta de inmediato."*

---

## Bloque 5: Valor del Ecosistema Stellar y Cierre (2:35 – 2:55)
* **Pantalla:** Regresar a la consola principal o cámara completa del presentador.
* **Voz en off / Presentador a cámara:**
  > *"Elegimos Stellar por su costo de transacción despreciable, su velocidad de confirmación en segundos y la seguridad formal de Soroban en Rust.*  
  > *Con Tramo estamos llevando fe pública criptográfica a una de las industrias que más la necesita, protegiendo el patrimonio de las personas y garantizando que las obras se terminen.*  
  > *Muchas gracias."*

---

## Checklist de Grabación y Publicación

1. [ ] **Grabación:** Grabar con micrófono de solapa o audífonos (evitar eco ambiental).
2. [ ] **Control de Tiempo:** Comprobar que el video final no supere los 3 minutos (máximo 2:59).
3. [ ] **Subida a YouTube:**
   - Título: `Tramo — MVP Functional (Entregable 4 Hackathon Stellar SCF)`
   - Visibilidad: Público o No listado (Unlisted).
   - Calidad mínima: 1080p.
4. [ ] **Actualizar Enlace en Documentación:**
   - Reemplazar `https://youtu.be/SEMANA4_TRAMO_DEMO_PLACEHOLDER` en [`docs/semana4/MVPFunctional.md`](./MVPFunctional.md) con el enlace definitivo de YouTube.
5. [ ] **Bono de Redes Sociales (Opcional):**
   - Publicar clip o enlace en X (Twitter) o LinkedIn etiquetando a los organizadores (@StellarOrg / Stellar Development Foundation) y adjuntar el enlace en el README o documentación.
