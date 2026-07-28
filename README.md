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
├── index.html          # Pantallas y UI del teléfono rotatorio (SVG)
├── style.css           # Estética vintage (terciopelo, oro, pergamino)
├── app.js              # Flujo narrativo, matches y física del dial
├── audio.js            # Síntesis Web Audio + SpeechSynthesis
├── assets/             # Retratos (Yente, Sarah, Miriam, Leah)
└── docs/
    ├── CONCEPTO.md     # Visión de producto y posicionamiento
    └── EXPERIENCIA.md  # Mapa del journey del usuario
```

No hay backend ni dependencias de build: es un sitio estático puro.

---

## Stack

- HTML / CSS / JavaScript (vanilla)
- **Web Audio API** — tono de marcado, timbre, busy, clics mecánicos, estática de línea
- **SpeechSynthesis** — voces del padre y de la candidata
- Tipografías: Cinzel Decorative, Cormorant Garamond, Pinyon Script

---

## Estado actual

Prototipo jugable de extremo a extremo:

- Entrevista scripted con Yente (4 preguntas)
- Upload local de retrato
- Tres matches fijos con números de 4 dígitos
- Teléfono rotatorio interactivo
- Narrativa de llamadas (padre × 3 → hija en la 4.ª)

Pendiente para una versión de producto: matching dinámico, IA para Yente, persistencia, más perfiles y despliegue en hosting (p. ej. Netlify).

---

## Licencia

Uso personal / demo por ahora. Si quieres abrir el proyecto o comercializarlo, define licencia e issues en el repositorio.
