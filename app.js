(() => {
  "use strict";

  const VOWELS = new Set(["A", "Á", "E", "É", "I", "Í", "O", "Ó", "Ö", "Ő", "U", "Ú", "Ü", "Ű"]);
  const ALPHABET = "AÁBCDEÉFGHIÍJKLMNOÓÖŐPQRSTUÚÜŰVWXYZ".split("");
  const VOWEL_PRICE = 5000;

  // A feltöltött stúdiókép tényleges geometriája: 15 oszlop × 4 sor.
  // Ezek a koordináták közvetlenül a 1672 × 941 px háttér kék celláinak belsejére mutatnak.
  const STAGE_GRID = {
    cols: 15,
    rows: 4,
    x: [311, 388, 465, 541, 618, 694, 771, 848, 924, 1001, 1078, 1155, 1233, 1310, 1386],
    y: [192, 269, 345, 420],
    width: [69, 69, 69, 70, 69, 70, 69, 69, 70, 70, 70, 70, 69, 68, 70],
    height: [71, 69, 68, 71]
  };
  const SVG_NS = "http://www.w3.org/2000/svg";

  const PLAYER_IMAGES = {
    Krisz: "assets/images/krisz.png",
    Adri: "assets/images/adri.png",
    Aliz: "assets/images/lizus.png",
    Bot: "assets/images/bot.png"
  };

  const SFX = {
    letterHit: "assets/sound/sfx/letter_hit.wav",
    letterMiss: "assets/sound/sfx/letter_miss.wav",
    solveSuccess: "assets/sound/sfx/solve_success.wav",
    solveFail: "assets/sound/sfx/solve_fail.wav"
  };

  const sfxCache = Object.fromEntries(
    Object.entries(SFX).map(([name, src]) => {
      const audio = new Audio(src);
      audio.preload = "auto";
      return [name, audio];
    })
  );

  function playSfx(name, volume = 0.7) {
    const source = sfxCache[name];
    if (!source) return;

    const sound = source.cloneNode();
    sound.volume = volume;
    sound.play().catch(() => {
      // A böngésző blokkolhatja a hangot, amíg nincs felhasználói interakció.
    });
  }

  const LETTER_HIT_GAP_MS = 500;

  function playHitSequence(count) {
    const safeCount = Math.max(0, Number(count) || 0);

    for (let i = 0; i < safeCount; i += 1) {
      setTimeout(
        () => playSfx("letterHit", 0.72),
        i * LETTER_HIT_GAP_MS
      );
    }
  }

  function unlockSfx() {
    Object.values(sfxCache).forEach(audio => {
      const previousVolume = audio.volume;
      audio.volume = 0;
      audio.play()
        .then(() => {
          audio.pause();
          audio.currentTime = 0;
          audio.volume = previousVolume;
        })
        .catch(() => {
          audio.volume = previousVolume;
        });
    });
  }

  const PUZZLES = [
    { category: "Mondás", text: "A KOCKA EL VAN VETVE" },
    { category: "Budapest", text: "SZÉCHENYI LÁNCHÍD" },
    { category: "Természet", text: "BALATONI NAPLEMENTE" },
    { category: "Hely", text: "FŐVÁROSI ÁLLATKERT" },
    { category: "Kifejezés", text: "MINDEN KEZDET NEHÉZ" },
    { category: "Étel", text: "TÚRÓS CSUSZA SZALONNÁVAL" }
  ];

  const WHEEL_BASE_SEGMENTS = [
    { label: "1 000", type: "money", value: 1000 },
    { label: "1 500", type: "money", value: 1500 },
    { label: "2 000", type: "money", value: 2000 },
    { label: "2 500", type: "money", value: 2500 },
    { label: "3 000", type: "money", value: 3000 },
    { label: "4 000", type: "money", value: 4000 },
    { label: "CSŐD", type: "bankrupt", value: 0 },
    { label: "5 000", type: "money", value: 5000 },
    { label: "6 000", type: "money", value: 6000 },
    { label: "KIMARADSZ", type: "skip", value: 0 },
    { label: "7 500", type: "money", value: 7500 },
    { label: "10 000", type: "money", value: 10000 }
  ];

  // A feltöltött wheel.png 24 cikkelyes. A jelenlegi 12 mezős
  // játékgazdaság kétszer fut körbe, így minden képi cikkelyhez tartozik
  // egy valódi játékmező.
  const WHEEL_SEGMENTS = [
    ...WHEEL_BASE_SEGMENTS.map(segment => ({ ...segment })),
    ...WHEEL_BASE_SEGMENTS.map(segment => ({ ...segment }))
  ];

  const state = {
    players: [],
    currentIndex: 0,
    puzzle: null,
    usedLetters: new Set(),
    revealed: new Set(),
    phase: "setup",
    wheelValue: null,
    lastPuzzleIndex: -1,
    botTimer: null,
    wheelConfirmTimer: null,
    roundNumber: 0,
    justRevealed: new Set(),
    pendingWheelSegment: null,
    pendingWheelFromBot: false
  };

  const el = {
    setupScreen: document.getElementById("setupScreen"),
    gameScreen: document.getElementById("gameScreen"),
    startGameBtn: document.getElementById("startGameBtn"),
    setupError: document.getElementById("setupError"),
    playersList: document.getElementById("playersList"),
    categoryText: document.getElementById("categoryText"),
    puzzleBoard: document.getElementById("puzzleBoard"),
    usedLetters: document.getElementById("usedLetters"),
    activePlayerText: document.getElementById("activePlayerText"),
    stageCurrentAvatar: document.getElementById("stageCurrentAvatar"),
    stageCurrentPlayerName: document.getElementById("stageCurrentPlayerName"),
    stageCurrentMoney: document.getElementById("stageCurrentMoney"),
    spinBtn: document.getElementById("spinBtn"),
    consonantStageBtn: document.getElementById("consonantStageBtn"),
    solveBtn: document.getElementById("solveBtn"),
    message: document.getElementById("message"),
    wheelResult: document.getElementById("wheelResult"),
    wheelOverlay: document.getElementById("wheelOverlay"),
    wheelOverlayResult: document.getElementById("wheelOverlayResult"),
    wheelApproveBtn: document.getElementById("wheelApproveBtn"),
    testBtn: document.getElementById("testBtn"),
    testDialog: document.getElementById("testDialog"),
    testAnswerDialogText: document.getElementById("testAnswerDialogText"),
    solveDialog: document.getElementById("solveDialog"),
    solveForm: document.getElementById("solveForm"),
    solveInput: document.getElementById("solveInput"),
    solveConfirmBtn: document.getElementById("solveConfirmBtn"),
    roundDialog: document.getElementById("roundDialog"),
    roundTitle: document.getElementById("roundTitle"),
    roundText: document.getElementById("roundText"),
    nextRoundBtn: document.getElementById("nextRoundBtn"),
    endGameBtn: document.getElementById("endGameBtn"),
    endGameDialog: document.getElementById("endGameDialog"),
    endGameCancelBtn: document.getElementById("endGameCancelBtn"),
    endGameConfirmBtn: document.getElementById("endGameConfirmBtn")
  };

  const normalize = (s) =>
    s.normalize("NFC")
      .toLocaleUpperCase("hu-HU")
      .replace(/\s+/g, " ")
      .trim();

  const fmtMoney = (n) =>
    new Intl.NumberFormat("hu-HU").format(n) + " Ft";

  const currentPlayer = () => state.players[state.currentIndex];

  function pickPuzzle() {
    let idx;
    do {
      idx = Math.floor(Math.random() * PUZZLES.length);
    } while (PUZZLES.length > 1 && idx === state.lastPuzzleIndex);

    state.lastPuzzleIndex = idx;
    return { ...PUZZLES[idx], text: normalize(PUZZLES[idx].text) };
  }

  function startGame() {
    unlockSfx();

    const selected = [...document.querySelectorAll('.player-option input:checked')]
      .map(input => input.value);

    if (selected.length < 2) {
      el.setupError.classList.remove("hidden");
      return;
    }

    el.setupError.classList.add("hidden");
    state.players = selected.map(name => ({
      name,
      isBot: name === "Bot",
      roundMoney: 0,
      totalMoney: 0
    }));
    state.currentIndex = 0;
    state.roundNumber = 0;

    document.body.classList.remove("lobby-active");
    document.body.classList.add("game-active");
    el.setupScreen.classList.add("hidden");
    el.gameScreen.classList.remove("hidden");

    newRound();
  }

  function newRound() {
    clearTimeout(state.botTimer);
    state.roundNumber += 1;
    state.puzzle = pickPuzzle();
    state.usedLetters.clear();
    state.revealed.clear();
    state.justRevealed.clear();
    state.wheelValue = null;
    state.pendingWheelSegment = null;
    state.pendingWheelFromBot = false;
    clearTimeout(state.wheelConfirmTimer);
    closeWheelOverlay();

    state.phase = "spin";

    for (const p of state.players) {
      p.roundMoney = 0;
    }

    state.currentIndex = (state.roundNumber === 1) ? 0 : state.currentIndex;
    el.categoryText.textContent = state.puzzle.category;
    el.wheelResult.textContent = "–";
    el.wheelResult.classList.remove("spinning", "bankrupt", "skip", "money");
    setMessage(`${currentPlayer().name} következik. Pörgess!`);
    renderAll();
    updateControls();
    maybeRunBot();
  }

  function renderAll() {
    renderPlayers();
    renderPuzzle();
    renderUsedLetters();

    const active = currentPlayer();
    el.activePlayerText.textContent = active?.name ?? "–";

    if (active) {
      el.stageCurrentPlayerName.textContent = active.name;
      el.stageCurrentMoney.textContent = fmtMoney(active.roundMoney);
      el.stageCurrentAvatar.src = PLAYER_IMAGES[active.name] ?? PLAYER_IMAGES.Bot;
      el.stageCurrentAvatar.alt = `${active.name} profilképe`;
    } else {
      el.stageCurrentPlayerName.textContent = "–";
      el.stageCurrentMoney.textContent = fmtMoney(0);
      el.stageCurrentAvatar.src = PLAYER_IMAGES.Bot;
      el.stageCurrentAvatar.alt = "Nincs aktív játékos";
    }
  }

  function renderPlayers() {
    el.playersList.innerHTML = "";
    state.players.forEach((p, idx) => {
      const card = document.createElement("div");
      card.className = "player-card" + (idx === state.currentIndex ? " active" : "");
      card.innerHTML = `
        <div class="player-name">
          <span>${escapeHtml(p.name)}</span>
          <span>${idx === state.currentIndex ? "▶" : ""}</span>
        </div>
        <div class="money">${fmtMoney(p.roundMoney)}</div>
        <div class="total">Összesen: ${fmtMoney(p.totalMoney)}</div>
      `;
      el.playersList.appendChild(card);
    });
  }

  function layoutPuzzleRows(text) {
    const words = text.split(" ").filter(Boolean);
    const candidates = [];

    function search(wordIndex, rows) {
      if (wordIndex >= words.length) {
        candidates.push(rows);
        return;
      }

      if (rows.length >= STAGE_GRID.rows) return;

      let line = "";
      for (let i = wordIndex; i < words.length; i += 1) {
        const next = line ? `${line} ${words[i]}` : words[i];
        if ([...next].length > STAGE_GRID.cols) break;
        line = next;
        search(i + 1, [...rows, line]);
      }
    }

    search(0, []);

    if (candidates.length) {
      const minRows = Math.min(...candidates.map(rows => rows.length));
      const best = candidates
        .filter(rows => rows.length === minRows)
        .sort((a, b) => {
          const score = rows => {
            const lengths = rows.map(row => [...row].length);
            const avg = lengths.reduce((sum, n) => sum + n, 0) / lengths.length;
            const variance = lengths.reduce((sum, n) => sum + ((n - avg) ** 2), 0);
            const edgePenalty = lengths.reduce((sum, n) => sum + ((STAGE_GRID.cols - n) * .08), 0);
            return variance + edgePenalty;
          };
          return score(a) - score(b);
        })[0];

      return best;
    }

    // Biztonsági fallback nagyon hosszú, szóköz nélkül érkező feladványhoz.
    const chars = [...text];
    const rows = [];
    for (let i = 0; i < chars.length && rows.length < STAGE_GRID.rows; i += STAGE_GRID.cols) {
      rows.push(chars.slice(i, i + STAGE_GRID.cols).join(""));
    }
    return rows;
  }

  function createSvgElement(name, attrs = {}) {
    const node = document.createElementNS(SVG_NS, name);
    for (const [key, value] of Object.entries(attrs)) {
      node.setAttribute(key, String(value));
    }
    return node;
  }

  function renderPuzzle() {
    el.puzzleBoard.innerHTML = "";

    const rows = layoutPuzzleRows(state.puzzle.text);
    let revealSequenceIndex = 0;

    rows.forEach((rowText, rowIndex) => {
      const chars = [...rowText];
      const startCol = Math.max(
        0,
        Math.floor((STAGE_GRID.cols - chars.length) / 2)
      );

      chars.forEach((char, charIndex) => {
        if (char === " ") return;

        const colIndex = startCol + charIndex;
        if (colIndex < 0 || colIndex >= STAGE_GRID.cols) return;

        const x = STAGE_GRID.x[colIndex];
        const y = STAGE_GRID.y[rowIndex];
        const width = STAGE_GRID.width[colIndex];
        const height = STAGE_GRID.height[rowIndex];

        const group = createSvgElement("g", {
          class: "stage-puzzle-cell",
          "data-row": rowIndex,
          "data-col": colIndex
        });

        const tile = createSvgElement("rect", {
          x,
          y,
          width,
          height,
          rx: 7,
          ry: 7,
          class: "stage-puzzle-tile"
        });
        group.appendChild(tile);

        const isLetter = /\p{L}/u.test(char);
        const shouldShow = !isLetter || state.revealed.has(char);

        if (shouldShow) {
          const isNewReveal = state.justRevealed.has(char);
          const letter = createSvgElement("text", {
            x: x + width / 2,
            y: y + height / 2 + 1,
            class:
              "stage-puzzle-letter" +
              (isNewReveal ? " new-reveal" : "")
          });

          if (isNewReveal) {
            letter.style.setProperty(
              "--reveal-delay",
              `${revealSequenceIndex * LETTER_HIT_GAP_MS}ms`
            );
            revealSequenceIndex += 1;
          }

          letter.textContent = char;
          group.appendChild(letter);
        }

        el.puzzleBoard.appendChild(group);
      });
    });

    state.justRevealed.clear();
  }

  function renderUsedLetters() {
    const letters = [...state.usedLetters].sort((a, b) => a.localeCompare(b, "hu"));
    el.usedLetters.textContent = letters.length ? letters.join(" ") : "–";
  }

  function updateControls() {
    const p = currentPlayer();
    if (!p) return;

    const human = !p.isBot;
    el.spinBtn.disabled = !human || state.phase !== "spin";
    el.solveBtn.disabled =
      !human ||
      ["spinning", "wheelConfirm", "roundEnd", "setup"].includes(state.phase);

    // A középső képi gomb csak jelzi, hogy most betűt várunk.
    // A tényleges választás közvetlen billentyűleütéssel történik.
    el.consonantStageBtn.disabled = !(human && state.phase === "letter");
  }

  function setMessage(msg) {
    el.message.textContent = msg;
  }

  function nextPlayer(reason = "") {
    state.currentIndex = (state.currentIndex + 1) % state.players.length;
    state.phase = "spin";
    state.wheelValue = null;
    renderAll();
    updateControls();
    setMessage(
      `${reason ? reason + " " : ""}${currentPlayer().name} következik. Pörgess!`
    );
    maybeRunBot();
  }

  function countLetter(letter) {
    return [...state.puzzle.text].filter(ch => ch === letter).length;
  }

  function handleConsonant(letter, fromBot = false) {
    letter = normalize(letter);

    if (letter.length !== 1 || !/\p{L}/u.test(letter) || VOWELS.has(letter)) {
      if (!fromBot) setMessage("Egyetlen mássalhangzót adj meg.");
      return false;
    }

    if (state.usedLetters.has(letter)) {
      if (!fromBot) setMessage("Ezt a betűt már mondtátok.");
      return false;
    }

    state.usedLetters.add(letter);
    state.revealed.add(letter);

    const hits = countLetter(letter);
    if (hits > 0) {
      state.justRevealed = new Set([letter]);
      playHitSequence(hits);
      const award = hits * state.wheelValue;
      currentPlayer().roundMoney += award;
      setMessage(
        `${letter}: ${hits} találat. Nyeremény: ${fmtMoney(award)}. Pörgethetsz újra.`
      );
      state.phase = "spin";
      state.wheelValue = null;
      renderAll();
      updateControls();
      checkAutoSolved();
      maybeRunBot();
    } else {
      state.justRevealed.clear();
      playSfx("letterMiss");
      renderAll();
      nextPlayer(`${letter} nincs a feladványban.`);
    }

    return true;
  }

  function buyVowel(letter, fromBot = false) {
    const p = currentPlayer();
    letter = normalize(letter);

    if (p.roundMoney < VOWEL_PRICE) {
      if (!fromBot) setMessage("Nincs elég pénzed magánhangzóra.");
      return false;
    }

    if (letter.length !== 1 || !VOWELS.has(letter)) {
      if (!fromBot) setMessage("Magánhangzót adj meg.");
      return false;
    }

    if (state.usedLetters.has(letter)) {
      if (!fromBot) setMessage("Ezt a betűt már mondtátok.");
      return false;
    }

    p.roundMoney -= VOWEL_PRICE;
    state.usedLetters.add(letter);
    state.revealed.add(letter);

    const hits = countLetter(letter);

    if (hits > 0) {
      state.justRevealed = new Set([letter]);
      playHitSequence(hits);
      state.phase = "spin";
      renderAll();
      setMessage(`${letter}: ${hits} találat. A magánhangzó ára levonva.`);
      updateControls();
      checkAutoSolved();
      maybeRunBot();
    } else {
      state.justRevealed.clear();
      playSfx("letterMiss");
      nextPlayer(`${letter} nincs a feladványban.`);
    }

    return true;
  }

  function trySolve(answer, fromBot = false) {
    if (normalize(answer) === state.puzzle.text) {
      playSfx("solveSuccess", 0.75);
      finishRound(currentPlayer());
      return true;
    }

    playSfx("solveFail", 0.72);

    if (!fromBot) {
      nextPlayer("Hibás megfejtés.");
    } else {
      nextPlayer("A Bot megfejtése hibás volt.");
    }
    return false;
  }

  function finishRound(winner) {
    clearTimeout(state.botTimer);

    const newlyRevealed = [...new Set(
      [...state.puzzle.text].filter(
        ch => /\p{L}/u.test(ch) && !state.revealed.has(ch)
      )
    )];
    state.justRevealed = new Set(newlyRevealed);

    [...state.puzzle.text].forEach(ch => {
      if (/\p{L}/u.test(ch)) state.revealed.add(ch);
    });

    winner.totalMoney += winner.roundMoney;
    state.phase = "roundEnd";
    renderAll();
    updateControls();

    el.roundTitle.textContent = `${winner.name} megfejtette!`;
    el.roundText.textContent =
      `Feladvány: ${state.puzzle.text}. ` +
      `A forduló nyereménye: ${fmtMoney(winner.roundMoney)}. ` +
      `Összes nyeremény: ${fmtMoney(winner.totalMoney)}.`;
    el.roundDialog.showModal();
  }

  function checkAutoSolved() {
    const hiddenLetters = [...state.puzzle.text].filter(
      ch => /\p{L}/u.test(ch) && !state.revealed.has(ch)
    );
    if (hiddenLetters.length === 0) {
      finishRound(currentPlayer());
      return true;
    }
    return false;
  }

  function randomUnusedConsonant() {
    const candidates = ALPHABET.filter(
      ch => !VOWELS.has(ch) && !state.usedLetters.has(ch)
    );
    return candidates.length
      ? candidates[Math.floor(Math.random() * candidates.length)]
      : null;
  }

  function randomUnusedVowel() {
    const candidates = [...VOWELS].filter(ch => !state.usedLetters.has(ch));
    return candidates.length
      ? candidates[Math.floor(Math.random() * candidates.length)]
      : null;
  }

  function revealedRatio() {
    const letters = [...state.puzzle.text].filter(ch => /\p{L}/u.test(ch));
    const unique = [...new Set(letters)];
    if (!unique.length) return 1;
    return unique.filter(ch => state.revealed.has(ch)).length / unique.length;
  }

  function maybeRunBot() {
    clearTimeout(state.botTimer);
    const p = currentPlayer();
    if (!p?.isBot || state.phase === "roundEnd") return;

    updateControls();

    state.botTimer = setTimeout(() => {
      if (!currentPlayer()?.isBot) return;

      if (revealedRatio() >= 0.72 && Math.random() < 0.45) {
        setMessage("Bot megpróbálja megfejteni…");
        setTimeout(() => trySolve(state.puzzle.text, true), 700);
        return;
      }

      if (
        p.roundMoney >= VOWEL_PRICE &&
        Math.random() < 0.18 &&
        [...VOWELS].some(ch => !state.usedLetters.has(ch))
      ) {
        const vowel = randomUnusedVowel();
        setMessage(`Bot magánhangzót vásárol: ${vowel}`);
        setTimeout(() => buyVowel(vowel, true), 550);
        return;
      }

      if (state.phase === "spin") {
        setMessage("Bot pörget…");
        spinWheel(true);
      }
    }, 900);
  }

  function escapeHtml(str) {
    return String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  class WheelScene extends Phaser.Scene {
    constructor() {
      super("WheelScene");
      this.wheelContainer = null;
      this.rotationDeg = 0;
      this.segmentAngle = 360 / WHEEL_SEGMENTS.length;
      this.ready = false;
    }

    preload() {
      this.load.image("wheel-face", "assets/images/wheel.png");
    }

    create() {
      const cx = 300;
      const cy = 300;
      const wheelSize = 536;
      const labelRadius = 188;
      const startOffsetDeg = -90;

      this.wheelContainer = this.add.container(cx, cy);

      const wheel = this.add.image(0, 0, "wheel-face");
      wheel.setDisplaySize(wheelSize, wheelSize);
      this.wheelContainer.add(wheel);

      WHEEL_SEGMENTS.forEach((segment, index) => {
        const midDeg =
          startOffsetDeg +
          (index + 0.5) * this.segmentAngle;
        const midRad = Phaser.Math.DegToRad(midDeg);

        const x = Math.cos(midRad) * labelRadius;
        const y = Math.sin(midRad) * labelRadius;

        const text = this.add.text(x, y, segment.label, {
          fontFamily: "Arial Black, Arial, sans-serif",
          fontStyle: "bold",
          fontSize: segment.label.length > 7 ? "11px" : "15px",
          color: "#ffffff",
          stroke: "#10152f",
          strokeThickness: 4,
          align: "center"
        }).setOrigin(.5);

        // A felirat sugárirányban áll a cikkelyen és a kerékkel együtt forog.
        text.setAngle(midDeg);
        this.wheelContainer.add(text);
      });

      // Fix mutató: nem része a forgó containernek.
      const pointerShadow = this.add.triangle(
        cx + 2, 36,
        -21, -8,
        21, -8,
        0, 38,
        0x061126, .72
      );

      const pointer = this.add.triangle(
        cx, 31,
        -19, -9,
        19, -9,
        0, 35,
        0xffd45f, 1
      );
      pointer.setStrokeStyle(4, 0xffffff, .92);

      this.ready = true;
      this.events.emit("wheel-ready");
    }

    spinTo(index, onComplete) {
      if (!this.ready || !this.wheelContainer) return false;

      const localCenter = (index + 0.5) * this.segmentAngle;
      const desiredMod = (360 - localCenter) % 360;
      const currentMod = ((this.rotationDeg % 360) + 360) % 360;
      const delta = (desiredMod - currentMod + 360) % 360;
      const fullTurns = Phaser.Math.Between(5, 7);
      const target = this.rotationDeg + fullTurns * 360 + delta;

      this.tweens.killTweensOf(this.wheelContainer);

      this.tweens.add({
        targets: this.wheelContainer,
        angle: target,
        duration: 5200,
        ease: "Cubic.easeOut",
        onComplete: () => {
          this.rotationDeg = target;
          onComplete?.();
        }
      });

      return true;
    }
  }

  const phaserGame = new Phaser.Game({
    type: Phaser.AUTO,
    parent: "wheelGame",
    width: 600,
    height: 600,
    transparent: true,
    scene: [WheelScene],
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH
    },
    render: {
      antialias: true,
      transparent: true
    }
  });

  function getWheelScene() {
    return phaserGame.scene.getScene("WheelScene");
  }

  function formatWheelResult(segment) {
    return segment.type === "money"
      ? `${segment.label} Ft`
      : segment.label;
  }

  function openWheelOverlay() {
    el.wheelOverlay.classList.add("open");
    el.wheelOverlay.setAttribute("aria-hidden", "false");
    el.wheelOverlayResult.textContent = "Pörög…";
    el.wheelOverlayResult.className = "wheel-overlay-result spinning";
    el.wheelApproveBtn.disabled = true;
  }

  function closeWheelOverlay() {
    el.wheelOverlay.classList.remove("open");
    el.wheelOverlay.setAttribute("aria-hidden", "true");
    el.wheelApproveBtn.disabled = true;
  }

  function applyPendingWheelResult() {
    const segment = state.pendingWheelSegment;
    if (!segment) return;

    const fromBot = state.pendingWheelFromBot;

    clearTimeout(state.wheelConfirmTimer);
    state.pendingWheelSegment = null;
    state.pendingWheelFromBot = false;
    closeWheelOverlay();

    el.wheelResult.classList.remove("spinning", "bankrupt", "skip", "money");
    el.wheelResult.textContent = formatWheelResult(segment);

    if (segment.type === "bankrupt") {
      el.wheelResult.classList.add("bankrupt");
      currentPlayer().roundMoney = 0;
      renderAll();
      nextPlayer("CSŐD! A fordulópénz elveszett.");
      return;
    }

    if (segment.type === "skip") {
      el.wheelResult.classList.add("skip");
      nextPlayer("KIMARADSZ!");
      return;
    }

    el.wheelResult.classList.add("money");
    state.wheelValue = segment.value;
    state.phase = "letter";

    setMessage(
      `${segment.label} Ft. Nyomj le egy mássalhangzót a billentyűzeten. ` +
      `Magánhangzó billentyűvel ${fmtMoney(VOWEL_PRICE)}-ért vásárolhatsz.`
    );

    renderAll();
    updateControls();

    if (fromBot) {
      state.botTimer = setTimeout(() => {
        const consonant = randomUnusedConsonant();
        if (!consonant) {
          nextPlayer("Nincs több választható mássalhangzó.");
          return;
        }
        setMessage(`Bot betűje: ${consonant}`);
        setTimeout(() => handleConsonant(consonant, true), 550);
      }, 650);
    }
  }

  function spinWheel(fromBot = false) {
    if (state.phase !== "spin") return;

    const scene = getWheelScene();
    if (!scene?.ready || !scene.wheelContainer) {
      setMessage("A kerék még betöltődik…");
      state.botTimer = setTimeout(() => spinWheel(fromBot), 250);
      return;
    }

    state.phase = "spinning";
    state.wheelValue = null;
    state.pendingWheelSegment = null;
    state.pendingWheelFromBot = fromBot;

    const index = Math.floor(Math.random() * WHEEL_SEGMENTS.length);
    const segment = WHEEL_SEGMENTS[index];

    el.wheelResult.textContent = "Pörög…";
    el.wheelResult.classList.remove("bankrupt", "skip", "money");
    el.wheelResult.classList.add("spinning");
    setMessage("Pörög a kerék…");

    openWheelOverlay();
    updateControls();

    const started = scene.spinTo(index, () => {
      state.pendingWheelSegment = segment;
      state.phase = "wheelConfirm";

      el.wheelOverlayResult.textContent = formatWheelResult(segment);
      el.wheelOverlayResult.className =
        "wheel-overlay-result " + segment.type;
      el.wheelApproveBtn.disabled = false;

      setMessage(
        `A kerék eredménye: ${formatWheelResult(segment)}. ` +
        (fromBot ? "Bot jóváhagyja…" : "Jóváhagyásra vár.")
      );
      updateControls();

      if (fromBot) {
        state.wheelConfirmTimer = setTimeout(
          applyPendingWheelResult,
          900
        );
      }
    });

    if (!started) {
      state.phase = "spin";
      closeWheelOverlay();
      updateControls();
      setMessage("A kerék nem áll készen. Próbáld újra.");
    }
  }

  el.startGameBtn.addEventListener("click", startGame);
  el.spinBtn.addEventListener("click", () => spinWheel(false));
  el.wheelApproveBtn.addEventListener("click", () => {
    if (state.phase !== "wheelConfirm") return;
    applyPendingWheelResult();
  });

  function isTextEntryTarget(target) {
    return (
      target instanceof HTMLInputElement ||
      target instanceof HTMLTextAreaElement ||
      target instanceof HTMLSelectElement ||
      target?.isContentEditable
    );
  }

  function handleDirectLetterKey(event) {
    if (event.defaultPrevented || event.repeat) return;
    if (event.ctrlKey || event.metaKey || event.altKey) return;
    if (!document.body.classList.contains("game-active")) return;
    if (isTextEntryTarget(event.target)) return;
    if (document.querySelector("dialog[open]")) return;

    const player = currentPlayer();
    if (!player || player.isBot) return;

    const letter = normalize(event.key);
    if (letter.length !== 1 || !/\p{L}/u.test(letter)) return;

    // Magánhangzó: közvetlen vásárlás egyetlen billentyűvel.
    // Ez spin és letter fázisban is engedélyezett, ahogy a korábbi gombos
    // megoldásnál is.
    if (VOWELS.has(letter)) {
      if (!["spin", "letter"].includes(state.phase)) return;

      event.preventDefault();
      buyVowel(letter, false);
      return;
    }

    // Mássalhangzó csak sikeres pörgetés után adható meg.
    if (state.phase !== "letter") return;

    event.preventDefault();
    handleConsonant(letter, false);
  }

  document.addEventListener("keydown", handleDirectLetterKey);

  el.consonantStageBtn.addEventListener("click", () => {
    if (el.consonantStageBtn.disabled) return;
    setMessage("Nyomj le egy mássalhangzót a billentyűzeten.");
  });

  el.testBtn.addEventListener("click", () => {
    if (!state.puzzle) return;

    el.testAnswerDialogText.textContent = state.puzzle.text;
    el.testDialog.showModal();
  });

  el.solveBtn.addEventListener("click", () => {
    el.solveInput.value = "";
    el.solveDialog.showModal();
    setTimeout(() => el.solveInput.focus(), 0);
  });

  el.solveConfirmBtn.addEventListener("click", e => {
    e.preventDefault();
    const answer = el.solveInput.value;
    if (!answer.trim()) return;
    el.solveDialog.close();
    trySolve(answer, false);
  });

  el.nextRoundBtn.addEventListener("click", () => {
    state.currentIndex = (state.currentIndex + 1) % state.players.length;
    setTimeout(newRound, 0);
  });

  function returnToLobby() {
    clearTimeout(state.botTimer);
    clearTimeout(state.wheelConfirmTimer);
    state.pendingWheelSegment = null;
    state.pendingWheelFromBot = false;
    closeWheelOverlay();
    state.phase = "setup";
    document.body.classList.remove("game-active");
    document.body.classList.add("lobby-active");
    el.gameScreen.classList.add("hidden");
    el.setupScreen.classList.remove("hidden");
    el.message.textContent = "";
  }

  el.endGameBtn.addEventListener("click", () => {
    if (!document.body.classList.contains("game-active")) return;
    el.endGameDialog.showModal();
  });

  el.endGameConfirmBtn.addEventListener("click", e => {
    e.preventDefault();
    el.endGameDialog.close("confirmed");
    returnToLobby();
  });

  el.endGameCancelBtn.addEventListener("click", () => {
    // method="dialog" bezárja az ablakot; a játékállapot változatlan marad.
  });
})();
