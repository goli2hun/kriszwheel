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

  const WHEEL_SEGMENTS = [
    { label: "1 000", type: "money", value: 1000, color: 0x3f7cff },
    { label: "1 500", type: "money", value: 1500, color: 0xff5e7a },
    { label: "2 000", type: "money", value: 2000, color: 0x8b6cff },
    { label: "2 500", type: "money", value: 2500, color: 0x24bfa4 },
    { label: "3 000", type: "money", value: 3000, color: 0xf2a93b },
    { label: "4 000", type: "money", value: 4000, color: 0x57a0ff },
    { label: "CSŐD", type: "bankrupt", value: 0, color: 0x1a1a1a },
    { label: "5 000", type: "money", value: 5000, color: 0xee657f },
    { label: "6 000", type: "money", value: 6000, color: 0x5f65d9 },
    { label: "KIMARADSZ", type: "skip", value: 0, color: 0x5c6470 },
    { label: "7 500", type: "money", value: 7500, color: 0x2fb68d },
    { label: "10 000", type: "money", value: 10000, color: 0xd79c2e }
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
    roundNumber: 0,
    justRevealed: new Set()
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
    vowelBtn: document.getElementById("vowelBtn"),
    solveBtn: document.getElementById("solveBtn"),
    letterArea: document.getElementById("letterArea"),
    letterInput: document.getElementById("letterInput"),
    letterBtn: document.getElementById("letterBtn"),
    message: document.getElementById("message"),
    wheelResult: document.getElementById("wheelResult"),
    testAnswerText: document.getElementById("testAnswerText"),
    consonantDialog: document.getElementById("consonantDialog"),
    solveDialog: document.getElementById("solveDialog"),
    solveForm: document.getElementById("solveForm"),
    solveInput: document.getElementById("solveInput"),
    solveConfirmBtn: document.getElementById("solveConfirmBtn"),
    vowelDialog: document.getElementById("vowelDialog"),
    vowelForm: document.getElementById("vowelForm"),
    vowelInput: document.getElementById("vowelInput"),
    vowelConfirmBtn: document.getElementById("vowelConfirmBtn"),
    roundDialog: document.getElementById("roundDialog"),
    roundTitle: document.getElementById("roundTitle"),
    roundText: document.getElementById("roundText"),
    nextRoundBtn: document.getElementById("nextRoundBtn"),
    endGameBtn: document.getElementById("endGameBtn")
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

    if (el.consonantDialog.open) {
      el.consonantDialog.close();
    }
    state.phase = "spin";

    for (const p of state.players) {
      p.roundMoney = 0;
    }

    state.currentIndex = (state.roundNumber === 1) ? 0 : state.currentIndex;
    el.categoryText.textContent = state.puzzle.category;
    el.testAnswerText.textContent = state.puzzle.text;
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
    el.vowelBtn.disabled =
      !human ||
      !["spin", "letter"].includes(state.phase) ||
      p.roundMoney < VOWEL_PRICE;
    el.solveBtn.disabled =
      !human ||
      ["spinning", "roundEnd", "setup"].includes(state.phase);

    const letterMode = human && state.phase === "letter";
    el.letterArea.classList.toggle("hidden", !letterMode);
    el.letterBtn.disabled = !letterMode;
    el.consonantStageBtn.disabled = !letterMode;

    if (!letterMode && el.consonantDialog.open) {
      el.consonantDialog.close();
    }
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
    renderAll();

    if (hits > 0) {
      state.justRevealed = new Set([letter]);
      playHitSequence(hits);
      state.phase = "spin";
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
    }

    create() {
      const cx = 250;
      const cy = 250;
      const radius = 205;

      this.wheelContainer = this.add.container(cx, cy);
      const graphics = this.add.graphics();
      this.wheelContainer.add(graphics);

      const startOffset = -Math.PI / 2;
      const angleRad = (Math.PI * 2) / WHEEL_SEGMENTS.length;

      WHEEL_SEGMENTS.forEach((segment, i) => {
        const start = startOffset + i * angleRad;
        const end = start + angleRad;

        graphics.fillStyle(segment.color, 1);
        graphics.beginPath();
        graphics.moveTo(0, 0);
        graphics.arc(0, 0, radius, start, end, false);
        graphics.closePath();
        graphics.fillPath();

        graphics.lineStyle(2, 0xffffff, .28);
        graphics.beginPath();
        graphics.moveTo(0, 0);
        graphics.lineTo(Math.cos(start) * radius, Math.sin(start) * radius);
        graphics.strokePath();

        const mid = start + angleRad / 2;
        const tx = Math.cos(mid) * radius * 0.66;
        const ty = Math.sin(mid) * radius * 0.66;

        const text = this.add.text(tx, ty, segment.label, {
          fontFamily: "Arial",
          fontStyle: "bold",
          fontSize: segment.label.length > 7 ? "14px" : "17px",
          color: "#ffffff",
          stroke: "#000000",
          strokeThickness: 3
        }).setOrigin(.5);

        text.setAngle(Phaser.Math.RadToDeg(mid) + 90);
        this.wheelContainer.add(text);
      });

      graphics.lineStyle(8, 0xf2f7ff, .95);
      graphics.strokeCircle(0, 0, radius);

      const hub = this.add.circle(0, 0, 28, 0x0b1930, 1);
      hub.setStrokeStyle(5, 0xffffff, .8);
      this.wheelContainer.add(hub);

      const pointer = this.add.triangle(
        cx, 31,
        -18, -4,
        18, -4,
        0, 34,
        0xffd85a, 1
      );
      pointer.setStrokeStyle(4, 0x07101f, 1);

      this.events.emit("wheel-ready");
    }

    spinTo(index, onComplete) {
      const localCenter = (index + 0.5) * this.segmentAngle;
      const desiredMod = (360 - localCenter) % 360;
      const currentMod = ((this.rotationDeg % 360) + 360) % 360;
      const delta = (desiredMod - currentMod + 360) % 360;
      const fullTurns = Phaser.Math.Between(5, 7);
      const target = this.rotationDeg + fullTurns * 360 + delta;

      this.tweens.add({
        targets: this.wheelContainer,
        angle: target,
        duration: 4500,
        ease: "Cubic.easeOut",
        onComplete: () => {
          this.rotationDeg = target;
          onComplete?.();
        }
      });
    }
  }

  const phaserGame = new Phaser.Game({
    type: Phaser.AUTO,
    parent: "wheelGame",
    width: 500,
    height: 500,
    transparent: true,
    scene: [WheelScene],
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH
    },
    render: {
      antialias: true
    }
  });

  function getWheelScene() {
    return phaserGame.scene.getScene("WheelScene");
  }

  function spinWheel(fromBot = false) {
    if (state.phase !== "spin") return;

    state.phase = "spinning";
    state.wheelValue = null;

    el.wheelResult.textContent = "Pörög…";
    el.wheelResult.classList.remove("bankrupt", "skip", "money");
    el.wheelResult.classList.add("spinning");
    setMessage("Pörög a kerék…");
    updateControls();

    const index = Math.floor(Math.random() * WHEEL_SEGMENTS.length);
    const segment = WHEEL_SEGMENTS[index];

    // Ideiglenes, stabil játékmód: nincs vizuális Phaser-pörgetés.
    // Rövid késleltetés után ugyanazt a játékszabályt alkalmazzuk,
    // mint a teljes keréknél.
    setTimeout(() => {
      el.wheelResult.classList.remove("spinning");

      if (segment.type === "bankrupt") {
        el.wheelResult.textContent = "CSŐD";
        el.wheelResult.classList.add("bankrupt");
        currentPlayer().roundMoney = 0;
        renderAll();
        nextPlayer("CSŐD! A fordulópénz elveszett.");
        return;
      }

      if (segment.type === "skip") {
        el.wheelResult.textContent = "KIMARADSZ";
        el.wheelResult.classList.add("skip");
        nextPlayer("KIMARADSZ!");
        return;
      }

      state.wheelValue = segment.value;
      state.phase = "letter";
      el.wheelResult.textContent = `${segment.label} Ft`;
      el.wheelResult.classList.add("money");

      setMessage(
        `${segment.label} Ft. Mondj egy még nem használt mássalhangzót.`
      );

      renderAll();
      updateControls();

      if (fromBot) {
        setTimeout(() => {
          const consonant = randomUnusedConsonant();
          if (!consonant) {
            nextPlayer("Nincs több választható mássalhangzó.");
            return;
          }
          setMessage(`Bot betűje: ${consonant}`);
          setTimeout(() => handleConsonant(consonant, true), 550);
        }, 450);
      }
    }, 850);
  }

  el.startGameBtn.addEventListener("click", startGame);
  el.spinBtn.addEventListener("click", () => spinWheel(false));

  el.consonantStageBtn.addEventListener("click", () => {
    if (el.consonantStageBtn.disabled) return;

    el.letterInput.value = "";
    el.consonantDialog.showModal();
    setTimeout(() => el.letterInput.focus(), 0);
  });

  el.letterBtn.addEventListener("click", () => {
    const value = el.letterInput.value;
    if (handleConsonant(value, false)) {
      el.letterInput.value = "";
      if (el.consonantDialog.open) {
        el.consonantDialog.close();
      }
    }
  });

  el.letterInput.addEventListener("keydown", e => {
    if (e.key === "Enter") {
      e.preventDefault();
      el.letterBtn.click();
    }
  });

  el.vowelBtn.addEventListener("click", () => {
    el.vowelInput.value = "";
    el.vowelDialog.showModal();
    setTimeout(() => el.vowelInput.focus(), 0);
  });

  el.vowelConfirmBtn.addEventListener("click", e => {
    e.preventDefault();
    if (buyVowel(el.vowelInput.value, false)) {
      el.vowelDialog.close();
    }
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

  el.endGameBtn.addEventListener("click", () => {
    clearTimeout(state.botTimer);
    state.phase = "setup";
    document.body.classList.remove("game-active");
    document.body.classList.add("lobby-active");
    el.gameScreen.classList.add("hidden");
    el.setupScreen.classList.remove("hidden");
    el.message.textContent = "";
  });
})();
