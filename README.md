# Shidej

**Citas a la Antigua** — una experiencia interactiva que rescata el *feeling* del cortejo predigital para ofrecer una alternativa real a las apps de citas que ya tienen frustrados a los usuarios.

Shidej no es otro feed infinito de perfiles. Es una vuelta al ritual: presentación ante una casamentera, preguntas de carácter, un retrato honesto y una llamada de línea fija con teléfono de disco.

> *"El amor verdadero no se desliza en una pantalla. Se teje con paciencia, se sella con el alma y se respeta con honor."*

---

## Por qué existe

Las apps de citas modernas optimizan el volumen: swipe, match, ghosting, fatiga. El resultado para mucha gente es agotamiento emocional y la sensación de que el romance se volvió un marketplace.

Shidej propone lo contrario:

| Dating digital típico | Shidej (era predigital) |
| --- | --- |
| Scroll infinito de caras | Pocas almas afines, presentadas con cuidado |
| Chat frío y descartable | Llamada telefónica como acto de cortejo |
| Algoritmo opaco | Casamentera humana (Yente) que interroga el carácter |
| Selfies y filtros | Un solo retrato, sin vanidad |
| Respuesta inmediata | Paciencia, insistencia y honor |

El concepto completo está en [`docs/CONCEPTO.md`](docs/CONCEPTO.md). El recorrido de pantallas está en [`docs/EXPERIENCIA.md`](docs/EXPERIENCIA.md).

---

## Demo rápida

Abre el sitio en un navegador moderno (Chrome / Edge / Firefox / Safari):

```bash
# Opción A — abrir el archivo
open index.html   # macOS
xdg-open index.html  # Linux

# Opción B — servidor local (recomendado para audio/assets)
npx --yes serve .
# o: python3 -m http.server 8080
```

Luego:

1. Acepta el audio (la experiencia es inmersiva).
2. Inicia la consulta con **Yente**.
3. Responde las cuatro preguntas con sinceridad.
4. Sube tu retrato.
5. Elige una de las tres damas compatibles.
6. Levanta el auricular, marca su número en el disco rotatorio e insiste… aunque el padre conteste primero.

---

## Estructura del proyecto

```
.
├── index.html
├── style.css
├── app.js
├── audio.js
├── assets/
├── netlify.toml
├── netlify/functions/yente.ts   # Yente (IA) — reacciona y elige matches
└── docs/
```

Sitio estático + una función serverless. En local, `npm run dev` (`netlify dev`) sirve el HTML y `/api/yente`.

---

## Stack

- HTML / CSS / JavaScript (vanilla)
- **Netlify Functions** — `/api/yente`
- **Netlify AI Gateway** (OpenAI `gpt-4o-mini`) — Yente lee las respuestas; no hace falta API key de proveedor
- **Web Audio API** — tono de marcado, timbre, busy, clics mecánicos, estática de línea
- **SpeechSynthesis** — voces del padre y de la candidata
- Tipografías: Cinzel Decorative, Cormorant Garamond, Pinyon Script

---

## Estado actual

Prototipo jugable de extremo a extremo, ahora con juicio de Yente:

- Entrevista de 4 preguntas; Yente **comenta lo que escribiste** (si el API no está, usa un guion de respaldo)
- Puede rechazar respuestas perezosas y pedir otra
- Tras el retrato, **elige y ordena** entre Sarah, Miriam y Leah — o se niega a presentar a nadie
- Teléfono rotatorio + narrativa de llamadas (padre × 3 → hija en la 4.ª)
- Tras Mazel Tov puedes volver a las otras almas **sin recargar**

Pendiente: persistencia del cortejo, más profundidad post-llamada, usuarios reales.

---

## Deploy (Netlify)

1. Entra a la carpeta del repo (no a tu home). Ejemplo:

```powershell
cd C:\Users\oscar\path\to\matchmakingyente
```

2. En **Windows PowerShell**, `npm`/`npx` suelen fallar con *running scripts is disabled*. Usa `npm.cmd` y `npx.cmd`, o abre **Símbolo del sistema (cmd)**.
3. Un deploy a producción (el AI Gateway no se activa hasta entonces).
4. En el dashboard del sitio: habilitar **AI Gateway / AI Features**.
5. No configures `OPENAI_API_KEY` propia: Netlify la inyecta.

```powershell
npm.cmd install
npx.cmd netlify login
npx.cmd netlify init
npx.cmd netlify deploy --prod
```

Si prefieres desbloquear scripts solo para tu usuario (una vez):

```powershell
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
```

---

## Licencia

Uso personal / demo por ahora. Si quieres abrir el proyecto o comercializarlo, define licencia e issues en el repositorio.
