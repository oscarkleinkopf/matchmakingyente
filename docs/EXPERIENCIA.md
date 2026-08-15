# Experiencia de usuario — Shidej

Mapa del journey actual (sitio estático + función `/api/yente`).

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

- Cuatro preguntas de carácter (texto fijo en `app.js`).
- Cada respuesta se envía a `/api/yente` (`action: "react"`).
- Yente comenta algo concreto de lo escrito; si la respuesta es perezosa, **no avanza** y pide otra (un reintento por pregunta).
- Si el API no está disponible (abrir `index.html` sin Netlify), usa el guion de respaldo.
- Al terminar → pantalla de retrato.

### 3. Retrato personal

- Un solo archivo de imagen (JPG/PNG), drag & drop o click.
- Preview en marco barroco.
- CTA: **Presentar Retrato** (habilitado tras elegir imagen).

### 4. Reflexión (“Yente está reflexionando…”)

- Llama a `/api/yente` (`action: "match"`) mientras muestra el beat de suspense.
- Si hay carácter suficiente → lista de matches **ordenada y recortada** (1 a 3 de Sarah, Miriam y Leah).
- Si no → pantalla de rechazo y **Volver a consultar**.

### 5. Matches

Hasta tres perfiles fijos (Yente decide cuáles y en qué orden):

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
- CTA: **Volver a las otras almas** (no recarga la página; el progreso de llamadas se conserva).

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

- Persistir el cortejo entre visitas.
- Mejorar accesibilidad del dial en móvil (targets táctiles, instrucciones visibles).
- Una carta o segunda llamada después del Mazel Tov.
