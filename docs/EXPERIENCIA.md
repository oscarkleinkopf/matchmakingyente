# Experiencia de usuario — Shidej

Mapa del journey actual del prototipo (sitio estático, sin backend).

## Flujo completo

```text
[Audio] → [Bienvenida] → [Consulta Yente] → [Retrato]
    → [Reflexión] → [Matches] → [Teléfono] → [Mazel Tov]
```

## Pantallas

### 0. Modal de audio

- Propósito: desbloquear Web Audio con un gesto del usuario.
- CTA: **Entrar con Audio**.
- Sin este paso, el teléfono y las voces no cobran vida.

### 1. Bienvenida

- Presenta la marca **Shidej** y el tono de época.
- Explica el rol de Yente y que el canal “respetable” es llamar a casa.
- CTA: **Iniciar Consulta**.

### 2. Entrevista con Yente

- Cuatro preguntas de carácter (script fijo en `app.js`).
- Efecto máquina de escribir + indicador de escritura.
- El texto del usuario se acepta; en el prototipo **no se analiza** (feedback narrativo prefijado).
- Al terminar → pantalla de retrato.

### 3. Retrato personal

- Un solo archivo de imagen (JPG/PNG), drag & drop o click.
- Preview en marco barroco.
- CTA: **Presentar Retrato** (habilitado tras elegir imagen).

### 4. Reflexión (“Yente está reflexionando…”)

- Beat de suspense (~pocos segundos).
- Transición a la lista de almas compatibles.

### 5. Matches

Tres perfiles fijos:

| Nombre | Teléfono | Notas |
| --- | --- | --- |
| Sarah | `4812` | Alma tranquila, jalá y Spinoza |
| Miriam | `9357` | Poesía, historia, debate con respeto |
| Leah | `7604` | Violín, alegría, lealtad |

Click en una tarjeta → pantalla de telefonía con ese match seleccionado.

### 6. Telefonía (disco rotatorio)

1. **Levantar el auricular** (click en el receptor SVG) → tono de marcado.
2. **Marcar 4 dígitos** arrastrando los agujeros del disco hasta el tope.
3. Si el número no coincide → busy / sin señal.
4. Si coincide → timbre → conexión.

#### Arco narrativo de llamadas (por match)

| Intento | Quién contesta | Resultado |
| --- | --- | --- |
| 1–3 | El padre, cada vez más furioso | Cuelga; busy tone |
| 4+ | La candidata | Conversación breve → **Mazel Tov** |

El contador es por persona (`sarah` / `miriam` / `leah`), no global.

### 7. Mazel Tov

- Confirmación de encuentro concertado.
- CTA: **Buscar otra unión** (recarga la página y reinicia el estado).

## Diseño de sonido (resumen)

Implementado en `audio.js`:

- Tono de marcado (350 Hz + 440 Hz)
- Timbre de campana vintage (cadencia ring / silencio)
- Busy tone pulsado
- Clics del dial (wind-up + retorno)
- Estática / crackle de línea
- Slam del auricular
- Voces vía `SpeechSynthesis` (padre vs. hija)

## Notas de UX para futuras iteraciones

- Feedback de Yente debería depender del contenido real de la respuesta.
- Tras “Mazel Tov”, permitir volver a matches sin `location.reload()`.
- Mejorar accesibilidad del dial en móvil (targets táctiles, instrucciones visibles).
- Dejar explícito en UI que la insistencia frente al padre es **juego narrativo**, no consejo de vida real.
