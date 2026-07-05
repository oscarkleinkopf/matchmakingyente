/**
 * Shidej - Main Application Controller
 * Manages Chat, File Upload, Rotary Dial Physics, and Telephony Call State.
 */
document.addEventListener("DOMContentLoaded", () => {
  // Audio state
  const audio = window.shidejAudio;
  
  // App views
  const screens = {
    audio: document.getElementById("screen-audio"),
    welcome: document.getElementById("screen-welcome"),
    chat: document.getElementById("screen-chat"),
    upload: document.getElementById("screen-upload"),
    thinking: document.getElementById("screen-thinking"),
    matches: document.getElementById("screen-matches"),
    telephony: document.getElementById("screen-telephony")
  };

  // State Variables
  let currentScreen = "audio";
  let userPortraitUrl = null;
  let selectedMatch = null;
  let dialedNumber = "";
  
  // Call count tracker per match to manage the threatening father interactions
  const matchCallCounts = {
    sarah: 0,
    miriam: 0,
    leah: 0
  };

  // Match Database
  const matchesData = {
    sarah: {
      id: "sarah",
      name: "Sarah",
      age: "23 años",
      bio: "Un alma tranquila y reflexiva. Ama hornear jalá los viernes, lee filosofía de Spinoza y busca a alguien con quien compartir conversaciones profundas y silencios cálidos frente al fuego.",
      phone: "4812",
      image: "assets/sarah.png"
    },
    miriam: {
      id: "miriam",
      name: "Miriam",
      age: "25 años",
      bio: "De mirada expresiva e intelecto vivaz. Escribe poesía, enseña historia y anhela encontrar un hombre de principios sólidos, que valore la familia y debata con pasión pero con respeto.",
      phone: "9357",
      image: "assets/miriam.png"
    },
    leah: {
      id: "leah",
      name: "Leah",
      age: "24 años",
      bio: "Una presencia encantadora y alegre. Le fascina la música clásica, toca el violín y busca un espíritu noble que la acompañe con lealtad y traiga risas a un hogar lleno de valores tradicionales.",
      phone: "7604",
      image: "assets/leah.png"
    }
  };

  // Conversation script with Yente
  const yenteInterview = [
    {
      question: "Shalom, joven. Pasa, siéntate. Soy Yente. El amor no es un juego de azar, es un tejido sagrado. Dime... ¿Qué buscas realmente en un alma gemela? ¿Alguien que te complemente con dulzura, o alguien que te desafíe a ser mejor?",
      feedback: "Ah... una respuesta honesta. El desafío templa el carácter, pero la dulzura sana las heridas del día a día. Sigamos."
    },
    {
      question: "Dime ahora, con la mano en el corazón: ¿cuál es el valor más sagrado que aprendiste de tu familia y que jamás estarías dispuesto a negociar en tu propio hogar?",
      feedback: "Hermoso. Un hombre sin raíces es como un árbol que el viento derriba fácilmente. Quien respeta su origen sabrá guiar su futuro."
    },
    {
      question: "Imagina que la vejez nos ha alcanzado. El vigor de la juventud se ha desvanecido y la belleza física es solo un recuerdo lejano. Sentados frente al fuego... ¿qué conversación te gustaría seguir teniendo con ella?",
      feedback: "Sabio de tu parte. Cuando los ojos se cansan de ver, es la mente y el alma lo que nos mantiene unidos. Has reflexionado bien."
    },
    {
      question: "La belleza exterior es como la flor del campo: hoy florece y mañana se marchita. ¿Qué es aquello en el carácter de una mujer que consideras que nunca perderá su perfume?",
      feedback: "Excelente. Has respondido con madurez. Veo que no buscas una distracción, sino una compañera para toda la vida."
    }
  ];

  let currentQuestionIndex = 0;

  // Initialize App
  function showScreen(screenId) {
    Object.keys(screens).forEach(key => {
      if (key === screenId) {
        screens[key].classList.remove("hidden");
        // Force reflow
        screens[key].offsetHeight;
        screens[key].classList.add("active");
      } else {
        screens[key].classList.remove("active");
        screens[key].classList.add("hidden");
      }
    });
    currentScreen = screenId;
  }

  // AUDIO INITIALIZATION MODAL
  document.getElementById("btn-accept-audio").addEventListener("click", async () => {
    await audio.init();
    showScreen("welcome");
  });

  // WELCOME SCREEN
  document.getElementById("btn-start-consultation").addEventListener("click", () => {
    showScreen("chat");
    startInterview();
  });

  // INTERVIEW NARRATIVE FLOW
  const chatMessages = document.getElementById("chat-messages");
  const chatInput = document.getElementById("chat-input");
  const btnSend = document.getElementById("btn-send");

  function startInterview() {
    currentQuestionIndex = 0;
    chatMessages.innerHTML = "";
    askQuestion();
  }

  function appendMessage(text, sender) {
    const msgDiv = document.createElement("div");
    msgDiv.classList.add("message", sender);
    
    if (sender === "yente") {
      // Typewriter effect for Yente's voice
      msgDiv.innerHTML = "";
      chatMessages.appendChild(msgDiv);
      chatMessages.scrollTop = chatMessages.scrollHeight;
      
      let i = 0;
      btnSend.disabled = true;
      chatInput.disabled = true;
      
      // Add typing dots indicator
      const typingIndicator = document.createElement("div");
      typingIndicator.className = "typing-indicator";
      typingIndicator.innerHTML = "<span></span><span></span><span></span>";
      chatMessages.appendChild(typingIndicator);
      
      const timer = setInterval(() => {
        if (i < text.length) {
          msgDiv.innerHTML += text.charAt(i);
          i++;
          chatMessages.scrollTop = chatMessages.scrollHeight;
        } else {
          clearInterval(timer);
          typingIndicator.remove();
          btnSend.disabled = false;
          chatInput.disabled = false;
          chatInput.focus();
        }
      }, 15);
    } else {
      msgDiv.textContent = text;
      chatMessages.appendChild(msgDiv);
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }
  }

  function askQuestion() {
    if (currentQuestionIndex < yenteInterview.length) {
      appendMessage(yenteInterview[currentQuestionIndex].question, "yente");
    } else {
      // Transition to photo upload after last question
      appendMessage("Bien. Tus palabras muestran una profundidad que me agrada. Ahora, entrégame tu retrato. Uno solo. Sin filtros, sin pretensiones. Que tu mirada hable por ti.", "yente");
      setTimeout(() => {
        showScreen("upload");
      }, 4000);
    }
  }

  function handleUserAnswer() {
    const answerText = chatInput.value.trim();
    if (!answerText) return;

    chatInput.value = "";
    appendMessage(answerText, "user");

    // Disable inputs
    btnSend.disabled = true;
    chatInput.disabled = true;

    // Yente reacts and then asks the next question
    setTimeout(() => {
      const feedbackText = yenteInterview[currentQuestionIndex].feedback;
      appendMessage(feedbackText, "yente");
      currentQuestionIndex++;
      
      setTimeout(() => {
        askQuestion();
      }, 3500);
    }, 1500);
  }

  btnSend.addEventListener("click", handleUserAnswer);
  chatInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleUserAnswer();
    }
  });

  // PORTRAIT UPLOAD SCREEN
  const baroqueFrame = document.getElementById("baroque-frame");
  const uploadInput = document.getElementById("upload-input");
  const uploadPrompt = document.getElementById("upload-prompt");
  const btnSubmitPortrait = document.getElementById("btn-submit-portrait");

  baroqueFrame.addEventListener("click", () => {
    uploadInput.click();
  });

  // Drag and drop events
  baroqueFrame.addEventListener("dragover", (e) => {
    e.preventDefault();
    baroqueFrame.style.borderColor = "#fff";
  });

  baroqueFrame.addEventListener("dragleave", () => {
    baroqueFrame.style.borderColor = "var(--accent-gold)";
  });

  baroqueFrame.addEventListener("drop", (e) => {
    e.preventDefault();
    baroqueFrame.style.borderColor = "var(--accent-gold)";
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  });

  uploadInput.addEventListener("change", (e) => {
    if (e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  });

  function handleFile(file) {
    if (!file.type.startsWith("image/")) {
      alert("Por favor, sube una imagen válida.");
      return;
    }

    userPortraitUrl = URL.createObjectURL(file);
    
    // Render uploaded image inside baroque frame
    baroqueFrame.innerHTML = `<img src="${userPortraitUrl}" class="uploaded-portrait" alt="Tu retrato vintage">`;
    btnSubmitPortrait.disabled = false;
  }

  btnSubmitPortrait.addEventListener("click", () => {
    if (!userPortraitUrl) return;
    
    // Step 4: Show matchmaker assessment ("Thinking")
    showScreen("thinking");
    
    // Simulate Yente deep analysis
    setTimeout(() => {
      showScreen("matches");
      renderMatches();
    }, 5000);
  });

  // MATCHES LIST SCREEN
  const matchesGrid = document.getElementById("matches-grid");
  
  function renderMatches() {
    matchesGrid.innerHTML = "";
    
    Object.keys(matchesData).forEach(key => {
      const match = matchesData[key];
      const card = document.createElement("div");
      card.className = "match-card";
      card.innerHTML = `
        <div class="match-photo-container">
          <img src="${match.image}" class="match-photo" alt="${match.name}">
        </div>
        <div class="match-name">${match.name}</div>
        <div class="match-age">${match.age}</div>
        <div class="match-divider"></div>
        <div class="match-bio">"${match.bio}"</div>
        <div class="match-phone-tag">Tel: ${match.phone}</div>
      `;
      
      card.addEventListener("click", () => {
        setupTelephonyScreen(match);
      });
      
      matchesGrid.appendChild(card);
    });
  }

  // TELEPHONY ROTARY DIAL INTERFACE
  const dialDigitsScreen = document.getElementById("dialed-digits");
  const receiver = document.getElementById("phone-receiver");
  const callStatusText = document.getElementById("call-status-text");
  const pulseWaves = document.getElementById("pulse-waves");
  
  // Call dashboard details
  const dashboardPortrait = document.getElementById("dashboard-match-portrait");
  const dashboardName = document.getElementById("dashboard-match-name");
  const dashboardPhone = document.getElementById("dashboard-match-phone");
  const btnHangup = document.getElementById("btn-hangup");
  const btnBackMatches = document.getElementById("btn-back-matches");

  let isReceiverOffHook = false;
  let activeCallState = "idle"; // idle, ringing, speaking, disconnected, finished

  function setupTelephonyScreen(match) {
    selectedMatch = match;
    dialedNumber = "";
    dialDigitsScreen.textContent = "----";
    callStatusText.textContent = "Levanta el auricular para marcar";
    pulseWaves.classList.remove("active");
    
    // Reset receiver position
    receiver.setAttribute("class", "");
    isReceiverOffHook = false;
    activeCallState = "idle";
    
    // Populate dashboard
    dashboardPortrait.src = match.image;
    dashboardName.textContent = match.name;
    dashboardPhone.textContent = `Línea fija: ${match.phone}`;
    
    btnHangup.classList.add("hidden");
    btnBackMatches.classList.remove("hidden");
    
    showScreen("telephony");
  }

  // Handle Off-Hook / On-Hook clicking on the receiver
  receiver.addEventListener("click", () => {
    if (activeCallState === "finished") return;

    if (!isReceiverOffHook) {
      // Pick up the receiver!
      liftReceiver();
    } else {
      // Put receiver back (hang up)
      hangupReceiver();
    }
  });

  function liftReceiver() {
    isReceiverOffHook = true;
    receiver.setAttribute("class", "receiver-off-hook");
    
    // Start analog dial tone immediately
    audio.playDialTone();
    audio.playLineCrackle();
    
    dialedNumber = "";
    dialDigitsScreen.textContent = "";
    callStatusText.textContent = "Escuchando línea... Disca el número";
    
    btnHangup.classList.remove("hidden");
    btnBackMatches.classList.add("hidden");
    activeCallState = "dialing";
  }

  function hangupReceiver() {
    isReceiverOffHook = false;
    receiver.setAttribute("class", ""); // resets to cradle
    
    // Stop voices & tones
    audio.stopVoice();
    audio.stopDialTone();
    audio.stopRingTone();
    audio.stopBusyTone();
    
    // Play slam sfx
    audio.playReceiverSlam();
    
    dialedNumber = "";
    dialDigitsScreen.textContent = "----";
    callStatusText.textContent = "Auricular colgado";
    pulseWaves.classList.remove("active");
    
    btnHangup.classList.add("hidden");
    btnBackMatches.classList.remove("hidden");
    activeCallState = "idle";
  }

  btnHangup.addEventListener("click", hangupReceiver);
  btnBackMatches.addEventListener("click", () => {
    audio.stopVoice();
    audio.stopDialTone();
    audio.stopRingTone();
    audio.stopBusyTone();
    showScreen("matches");
  });

  // ROTARY DIAL MATH & DRAGGING (SVG COORDINATES)
  const dialWheel = document.getElementById("dial-wheel");
  const dialHoles = document.querySelectorAll(".dial-hole");
  
  // Rotary stop bracket position is at ~135 degrees (mathematically 2.35 rad)
  const DIAL_CENTER = { x: 200, y: 240 };
  const STOP_ANGLE = 135; // degrees relative to 12 o'clock (0 deg)
  
  // Digits to angular layout mapping (each finger hole center has an initial angle on the wheel)
  // These are physical angles on the antique telephone SVG dial face
  const digitAngles = {
    1: 95,
    2: 65,
    3: 35,
    4: 5,
    5: 335,
    6: 305,
    7: 275,
    8: 245,
    9: 215,
    0: 185
  };

  let draggingDigit = null;
  let startDragAngle = 0;
  let currentWheelRotation = 0;
  let reachedStop = false;

  dialHoles.forEach(hole => {
    hole.addEventListener("mousedown", (e) => startDialDrag(e, hole));
    hole.addEventListener("touchstart", (e) => startDialDrag(e, hole));
  });

  function startDialDrag(e, hole) {
    if (!isReceiverOffHook || activeCallState !== "dialing") return;
    e.preventDefault();

    const digit = parseInt(hole.getAttribute("data-digit"));
    draggingDigit = digit;
    reachedStop = false;
    
    // Play click
    audio.playMechanicalClick(true);
    
    // Calculate initial click angle from center
    const clientX = e.clientX || e.touches[0].clientX;
    const clientY = e.clientY || e.touches[0].clientY;
    startDragAngle = getAngleFromCenter(clientX, clientY);
    currentWheelRotation = 0;
    
    // Add drag listeners
    document.addEventListener("mousemove", handleDialDrag);
    document.addEventListener("touchmove", handleDialDrag, { passive: false });
    document.addEventListener("mouseup", endDialDrag);
    document.addEventListener("touchend", endDialDrag);
  }

  function handleDialDrag(e) {
    if (draggingDigit === null) return;
    e.preventDefault();

    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);
    if (!clientX || !clientY) return;

    const currentAngle = getAngleFromCenter(clientX, clientY);
    
    // Calculate rotational displacement (clockwise dragging)
    let deltaAngle = currentAngle - startDragAngle;
    
    // Handle wrap-around
    if (deltaAngle < -180) deltaAngle += 360;
    if (deltaAngle > 180) deltaAngle -= 360;

    // Only allow clockwise rotation (delta > 0)
    if (deltaAngle < 0) deltaAngle = 0;

    // Calculate maximum rotation needed to hit the metal stop
    // Stop is at ~135 degrees. The digit starts at digitAngles[draggingDigit].
    // Target rotation is: (Stop - StartAngle)
    // On our classic dial, the metal stop is at 135 deg. The digit holes are spaced:
    // Digit 1: rotates ~35 degrees to reach stop
    // Digit 2: rotates ~65 degrees
    // ...
    // Digit 0: rotates ~305 degrees
    const requiredRotation = (360 + STOP_ANGLE - digitAngles[draggingDigit]) % 360;
    
    // Limit rotation so it cannot spin past the mechanical stop
    if (deltaAngle >= requiredRotation) {
      deltaAngle = requiredRotation;
      if (!reachedStop) {
        reachedStop = true;
        // Mechanical thud SFX when hitting metal stop
        audio.playMechanicalClick(true);
      }
    } else {
      reachedStop = false;
    }

    currentWheelRotation = deltaAngle;
    dialWheel.style.transform = `rotate(${currentWheelRotation}deg)`;
    dialWheel.style.transformOrigin = `${DIAL_CENTER.x}px ${DIAL_CENTER.y}px`;
  }

  function endDialDrag() {
    if (draggingDigit === null) return;
    
    document.removeEventListener("mousemove", handleDialDrag);
    document.removeEventListener("touchmove", handleDialDrag);
    document.removeEventListener("mouseup", endDialDrag);
    document.removeEventListener("touchend", endDialDrag);

    const digit = draggingDigit;
    const finalRotation = currentWheelRotation;
    draggingDigit = null;

    // Spin back animate
    dialWheel.style.transition = "transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)";
    dialWheel.style.transform = `rotate(0deg)`;

    // Play ratchet clicking gear sounds as wheel returns to zero!
    // Number of clicks proportional to rotation distance
    const clicksCount = digit === 0 ? 10 : digit;
    
    if (reachedStop) {
      // Successfully dialed!
      audio.playMechanicalClick(false, clicksCount);
      registerDialedDigit(digit);
    } else {
      // Let go early - snap back silently
      audio.playMechanicalClick(false, 2);
    }

    // Reset transition once animation completes
    setTimeout(() => {
      dialWheel.style.transition = "none";
    }, 450);
  }

  function getAngleFromCenter(clientX, clientY) {
    const rect = screens.telephony.querySelector(".rotary-phone-svg").getBoundingClientRect();
    
    // Scale factor to map client mouse coordinates to SVG internal viewBox scale
    const svgWidth = rect.width;
    const svgHeight = rect.height;
    
    const scaleX = svgWidth / 400;
    const scaleY = svgHeight / 450;

    const centerCanvasX = rect.left + DIAL_CENTER.x * scaleX;
    const centerCanvasY = rect.top + DIAL_CENTER.y * scaleY;

    const dx = clientX - centerCanvasX;
    const dy = clientY - centerCanvasY;

    // Angle in degrees from 12 o'clock, positive clockwise
    let angle = Math.atan2(dx, -dy) * (180 / Math.PI);
    if (angle < 0) angle += 360;
    return angle;
  }

  function registerDialedDigit(digit) {
    // Stop dial tone on first dialed digit
    if (dialedNumber.length === 0) {
      audio.stopDialTone();
    }

    dialedNumber += digit.toString();
    dialDigitsScreen.textContent = dialedNumber;

    console.log(`Dialed digit: ${digit}. Current number: ${dialedNumber}`);

    // If fully dialed 4 digits, trigger call!
    if (dialedNumber.length === 4) {
      activeCallState = "ringing";
      triggerCallOut();
    }
  }

  // CALL OUTGOING & NARRATIVE LOGIC
  function triggerCallOut() {
    callStatusText.textContent = "Conectando...";
    
    // Validate if dialed number matches the selected candidate
    if (dialedNumber !== selectedMatch.phone) {
      setTimeout(() => {
        callStatusText.textContent = "NÚMERO EQUIVOCADO / SIN SEÑAL";
        audio.playBusyTone();
        activeCallState = "disconnected";
      }, 1500);
      return;
    }

    // Dialed correctly!
    console.log(`Calling match ${selectedMatch.name} at fixed line ${selectedMatch.phone}...`);
    callStatusText.textContent = "Llamando...";
    
    // Wobble receiver off hook to show vibration waves
    receiver.classList.add("receiver-vibrating");

    // Ring-ring 2 times (approx 7 seconds total) to build suspense!
    let ringCount = 0;
    audio.playRingTone(() => {
      ringCount++;
      if (ringCount >= 2) {
        // Answer call!
        audio.stopRingTone();
        receiver.classList.remove("receiver-vibrating");
        connectCall();
      }
    });
  }

  function connectCall() {
    activeCallState = "speaking";
    pulseWaves.classList.add("active");
    callStatusText.textContent = "LLAMADA EN CURSO";
    
    // Increment specific match call counter
    matchCallCounts[selectedMatch.id]++;
    const currentCallIndex = matchCallCounts[selectedMatch.id];
    
    console.log(`Connection established. Call attempt count: ${currentCallIndex}`);
    
    let textToSpeak = "";
    let isFather = true;

    if (currentCallIndex === 1) {
      // Attempt 1: The Angry Father answers
      textToSpeak = "¡¿HOLA?! ¡DEJA DE LLAMAR A MI HIJA! ¡Si vuelves a marcar este número, te buscaré y lo lamentarás!";
    } else if (currentCallIndex === 2) {
      // Attempt 2: Even angrier
      textToSpeak = "¡¿OTRA VEZ TÚ?! ¡Te he dicho que te mantengas alejado de ella! ¡No tienes honor ni vergüenza! ¡NO LLAMES MÁS!";
    } else if (currentCallIndex === 3) {
      // Attempt 3: Final threat
      textToSpeak = "¡¿QUÉ PARTE DE 'NO LLAMES' NO ENTENDISTE?! ¡Soy su padre y no permitiré que un insolente como tú la moleste! ¡ALÉJATE PARA SIEMPRE!";
    } else {
      // Attempt 4+: The sweet daughter answers!
      isFather = false;
      textToSpeak = `¿Hola?... ¡Hola! Menos mal que insististe... Qué valiente eres. Mi padre acaba de salir al mercado. Me he enterado de tu retrato con Yente y me parece encantador. ¡Hablemos rápido antes de que regrese!`;
    }

    // Play synthesis voice
    audio.speakVoice(
      textToSpeak, 
      isFather, 
      // On voice starts speaking
      () => {
        console.log(`Speech started: "${textToSpeak}"`);
      },
      // On voice ends speaking
      () => {
        pulseWaves.classList.remove("active");
        if (isFather) {
          // Father slams down receiver angrily!
          audio.playReceiverSlam();
          audio.playBusyTone();
          callStatusText.textContent = "CONEXIÓN CORTADA POR EL PADRE";
          activeCallState = "disconnected";
        } else {
          // Daughter successfully talks and hangs up sweetly
          triggerRomanceSuccess();
        }
      }
    );
  }

  function triggerRomanceSuccess() {
    activeCallState = "finished";
    callStatusText.textContent = "¡COMPATIBILIDAD CONFIRMADA!";
    audio.playLineCrackle();
    
    setTimeout(() => {
      // Visual golden sparks/fireworks or romantic vintage celebration card!
      screens.telephony.querySelector(".call-dashboard").innerHTML = `
        <div class="welcome-logo">Mazel Tov!</div>
        <div class="call-title">¡Se ha concertado tu encuentro!</div>
        <div class="match-divider" style="background:#dfb15b; width: 80%;"></div>
        <p class="welcome-text" style="font-size: 1.2rem; color: #f4ebd0; margin-top: 1rem;">
          Has insistido con valentía frente al temperamento de su padre. <br>
          <strong>${selectedMatch.name}</strong> está ansiosa por conocerte cara a cara.
        </p>
        <div class="call-portrait-mini" style="width: 180px; height: 180px; border: 4px double var(--accent-gold); border-radius: 8px; margin: 1.5rem auto;">
          <img src="${selectedMatch.image}" style="border-radius:0;" alt="${selectedMatch.name}">
        </div>
        <button id="btn-restart" class="vintage-btn" style="margin-top: 1rem;">Buscar otra unión</button>
      `;
      
      document.getElementById("btn-restart").addEventListener("click", () => {
        location.reload();
      });
    }, 2000);
  }
});
