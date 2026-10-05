(() => {
  "use strict";

  const CONFIG = window.KRISZWHEEL_CONFIG ?? {};
  const GAMEPLAY_CONFIG = CONFIG.gameplay ?? {};
  const PUZZLE_CONFIG = CONFIG.puzzles ?? {};
  const WHEEL_CONFIG = CONFIG.wheel ?? {};
  const BOT_CONFIG = CONFIG.bot ?? {};
  const AUDIO_CONFIG = CONFIG.audio ?? {};
  const MUSIC_CONFIG = AUDIO_CONFIG.music ?? {};
  const VICTORY_CONFIG = CONFIG.victory ?? {};
  const DEBUG_CONFIG = CONFIG.debug ?? {};
  const VOICE_CONFIG = window.KRISZWHEEL_VOICE_CONFIG ?? {};

  const USER_SETTINGS_STORAGE_KEY = "kriszwheel.user-settings.v1";
  const DEFAULT_USER_SETTINGS = Object.freeze({
    soundsEnabled: true,
    masterVolume: 1,
    autoSpinEnabled: false,
    puzzleMode: "test",
    puzzleDifficulty: "easy",

    wheelSpinSoundEnabled:
      MUSIC_CONFIG.wheelSpin?.defaultEnabled !== false,
    wheelSpinVolume:
      Number(MUSIC_CONFIG.wheelSpin?.defaultVolume ?? 0.65),
    lobbyMusicEnabled:
      MUSIC_CONFIG.lobby?.defaultEnabled !== false,
    lobbyMusicVolume:
      Number(MUSIC_CONFIG.lobby?.defaultVolume ?? 0.30),
    winnerMusicEnabled:
      MUSIC_CONFIG.winner?.defaultEnabled !== false,
    winnerMusicVolume:
      Number(MUSIC_CONFIG.winner?.defaultVolume ?? 0.75),
    gameMusicEnabled:
      MUSIC_CONFIG.game?.defaultEnabled !== false,
    gameMusicVolume:
      Number(MUSIC_CONFIG.game?.defaultVolume ?? 0.20),

    speechRecognitionEnabled: false,
    speechProvider: "browser",
    speechLanguage: VOICE_CONFIG.recognition?.language ?? "hu-HU",
    microphoneDeviceId: ""
  });

  const clamp01 = value =>
    Math.min(1, Math.max(0, Number(value) || 0));

  function loadUserSettings() {
    try {
      const stored = JSON.parse(
        localStorage.getItem(USER_SETTINGS_STORAGE_KEY) || "{}"
      );

      return {
        soundsEnabled:
          typeof stored.soundsEnabled === "boolean"
            ? stored.soundsEnabled
            : DEFAULT_USER_SETTINGS.soundsEnabled,
        masterVolume:
          stored.masterVolume == null
            ? DEFAULT_USER_SETTINGS.masterVolume
            : clamp01(stored.masterVolume),
        autoSpinEnabled:
          typeof stored.autoSpinEnabled === "boolean"
            ? stored.autoSpinEnabled
            : DEFAULT_USER_SETTINGS.autoSpinEnabled,
        puzzleMode:
          ["test", "live"].includes(stored.puzzleMode)
            ? stored.puzzleMode
            : DEFAULT_USER_SETTINGS.puzzleMode,
        puzzleDifficulty:
          ["child", "easy", "medium", "hard"].includes(
            stored.puzzleDifficulty
          )
            ? stored.puzzleDifficulty
            : DEFAULT_USER_SETTINGS.puzzleDifficulty,

        wheelSpinSoundEnabled:
          typeof stored.wheelSpinSoundEnabled === "boolean"
            ? stored.wheelSpinSoundEnabled
            : DEFAULT_USER_SETTINGS.wheelSpinSoundEnabled,
        wheelSpinVolume:
          stored.wheelSpinVolume == null
            ? DEFAULT_USER_SETTINGS.wheelSpinVolume
            : clamp01(stored.wheelSpinVolume),
        lobbyMusicEnabled:
          typeof stored.lobbyMusicEnabled === "boolean"
            ? stored.lobbyMusicEnabled
            : DEFAULT_USER_SETTINGS.lobbyMusicEnabled,
        lobbyMusicVolume:
          stored.lobbyMusicVolume == null
            ? DEFAULT_USER_SETTINGS.lobbyMusicVolume
            : clamp01(stored.lobbyMusicVolume),
        winnerMusicEnabled:
          typeof stored.winnerMusicEnabled === "boolean"
            ? stored.winnerMusicEnabled
            : DEFAULT_USER_SETTINGS.winnerMusicEnabled,
        winnerMusicVolume:
          stored.winnerMusicVolume == null
            ? DEFAULT_USER_SETTINGS.winnerMusicVolume
            : clamp01(stored.winnerMusicVolume),
        gameMusicEnabled:
          typeof stored.gameMusicEnabled === "boolean"
            ? stored.gameMusicEnabled
            : DEFAULT_USER_SETTINGS.gameMusicEnabled,
        gameMusicVolume:
          stored.gameMusicVolume == null
            ? DEFAULT_USER_SETTINGS.gameMusicVolume
            : clamp01(stored.gameMusicVolume),

        speechRecognitionEnabled:
          typeof stored.speechRecognitionEnabled === "boolean"
            ? stored.speechRecognitionEnabled
            : DEFAULT_USER_SETTINGS.speechRecognitionEnabled,
        speechProvider:
          stored.speechProvider === "browser"
            ? stored.speechProvider
            : DEFAULT_USER_SETTINGS.speechProvider,
        speechLanguage:
          typeof stored.speechLanguage === "string" && stored.speechLanguage
            ? stored.speechLanguage
            : DEFAULT_USER_SETTINGS.speechLanguage,
        microphoneDeviceId:
          typeof stored.microphoneDeviceId === "string"
            ? stored.microphoneDeviceId
            : DEFAULT_USER_SETTINGS.microphoneDeviceId
      };
    } catch {
      return { ...DEFAULT_USER_SETTINGS };
    }
  }

  function persistUserSettings(settings) {
    try {
      localStorage.setItem(
        USER_SETTINGS_STORAGE_KEY,
        JSON.stringify(settings)
      );
      return true;
    } catch {
      return false;
    }
  }

  const userSettings = loadUserSettings();

  const VOWELS = new Set(["A", "Á", "E", "É", "I", "Í", "O", "Ó", "Ö", "Ő", "U", "Ú", "Ü", "Ű"]);
  const ALPHABET = "AÁBCDEÉFGHIÍJKLMNOÓÖŐPQRSTUÚÜŰVWXYZ".split("");
  const VOWEL_PRICE = Number(GAMEPLAY_CONFIG.vowelPrice ?? 5000);

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
    Bot: "assets/images/bot.png",
    "Vendég 1": "assets/images/guest1.png",
    "Vendég 2": "assets/images/guest2.png"
  };

  function setPlayerAvatar(imageElement, playerName, altText = null) {
    const safeName = PLAYER_IMAGES[playerName] ? playerName : "Bot";
    imageElement.src = PLAYER_IMAGES[safeName];
    imageElement.alt = altText ?? `${playerName} profilképe`;
  }

  const SFX = {
    letterHit: AUDIO_CONFIG.files?.letterHit ?? "assets/sound/sfx/letter_hit.wav",
    letterMiss: AUDIO_CONFIG.files?.letterMiss ?? "assets/sound/sfx/letter_miss.mp3",
    solveFail: AUDIO_CONFIG.files?.solveFail ?? "assets/sound/sfx/solve_fail.wav"
  };

  const sfxCache = Object.fromEntries(
    Object.entries(SFX).map(([name, src]) => {
      const audio = new Audio(src);
      audio.preload = "auto";
      return [name, audio];
    })
  );

  function playSfx(name, volume = Number(AUDIO_CONFIG.defaultVolume ?? 0.7)) {
    if (!userSettings.soundsEnabled) return;

    const source = sfxCache[name];
    if (!source) return;

    const sound = source.cloneNode();
    sound.volume = clamp01(
      Number(volume) * userSettings.masterVolume
    );
    sound.play().catch(() => {
      // A böngésző blokkolhatja a hangot, amíg nincs felhasználói interakció.
    });
  }

  const LETTER_HIT_GAP_MS = Number(GAMEPLAY_CONFIG.letterHitGapMs ?? 500);

  function playHitSequence(count) {
    const safeCount = Math.max(0, Number(count) || 0);

    for (let i = 0; i < safeCount; i += 1) {
      setTimeout(
        () => playSfx("letterHit", Number(AUDIO_CONFIG.letterHitVolume ?? 0.72)),
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

  const MUSIC_TRACK_DEFS = {
    wheelSpin: {
      config: MUSIC_CONFIG.wheelSpin ?? {},
      enabledSetting: "wheelSpinSoundEnabled",
      volumeSetting: "wheelSpinVolume"
    },
    lobby: {
      config: MUSIC_CONFIG.lobby ?? {},
      enabledSetting: "lobbyMusicEnabled",
      volumeSetting: "lobbyMusicVolume"
    },
    winner: {
      config: MUSIC_CONFIG.winner ?? {},
      enabledSetting: "winnerMusicEnabled",
      volumeSetting: "winnerMusicVolume"
    },
    game: {
      config: MUSIC_CONFIG.game ?? {},
      enabledSetting: "gameMusicEnabled",
      volumeSetting: "gameMusicVolume"
    }
  };

  const musicTracks = Object.fromEntries(
    Object.entries(MUSIC_TRACK_DEFS).map(([name, def]) => {
      const audio = new Audio(def.config.file ?? "");
      audio.preload = "auto";
      audio.loop = def.config.loop !== false;
      audio.volume = 0;
      return [name, audio];
    })
  );

  const musicFadeFrames = Object.create(null);

  function cancelMusicFade(name) {
    const frame = musicFadeFrames[name];
    if (frame) {
      cancelAnimationFrame(frame);
      musicFadeFrames[name] = null;
    }
  }

  function musicTrackEnabled(name) {
    const def = MUSIC_TRACK_DEFS[name];
    return Boolean(
      def &&
      userSettings[def.enabledSetting]
    );
  }

  function baseMusicVolume(name) {
    const def = MUSIC_TRACK_DEFS[name];
    if (!def) return 0;

    return clamp01(
      Number(userSettings[def.volumeSetting]) *
      userSettings.masterVolume
    );
  }

  function targetMusicVolume(name) {
    let volume = baseMusicVolume(name);

    if (
      name === "game" &&
      state.voiceArmed &&
      voiceOwnerIsCurrentPlayer()
    ) {
      volume *= clamp01(
        Number(
          MUSIC_CONFIG.game?.voiceOwnerTurnMultiplier ?? 0
        )
      );
    } else if (name === "game" && state.gameMusicDucked) {
      volume *= clamp01(
        Number(
          MUSIC_CONFIG.game?.microphoneDuckMultiplier ?? 0.10
        )
      );
    }

    return clamp01(volume);
  }

  function fadeMusicTo(
    name,
    target,
    durationMs,
    {
      pauseWhenDone = false,
      resetWhenDone = false
    } = {}
  ) {
    const audio = musicTracks[name];
    if (!audio) return;

    cancelMusicFade(name);

    const safeTarget = clamp01(target);
    const duration = Math.max(0, Number(durationMs) || 0);

    if (duration === 0) {
      audio.volume = safeTarget;

      if (pauseWhenDone) {
        audio.pause();
        if (resetWhenDone) {
          try {
            audio.currentTime = 0;
          } catch {
            // A média még nem biztos, hogy seekelhető.
          }
        }
      }
      return;
    }

    const startVolume = audio.volume;
    const startedAt = performance.now();

    const step = now => {
      const progress = Math.min(
        1,
        (now - startedAt) / duration
      );
      const eased = 1 - Math.pow(1 - progress, 3);

      audio.volume =
        startVolume + (safeTarget - startVolume) * eased;

      if (progress < 1) {
        musicFadeFrames[name] = requestAnimationFrame(step);
        return;
      }

      musicFadeFrames[name] = null;
      audio.volume = safeTarget;

      if (pauseWhenDone) {
        audio.pause();
        if (resetWhenDone) {
          try {
            audio.currentTime = 0;
          } catch {
            // A média még nem biztos, hogy seekelhető.
          }
        }
      }
    };

    musicFadeFrames[name] = requestAnimationFrame(step);
  }

  function playMusicTrack(
    name,
    {
      restart = false,
      fadeMs = 0
    } = {}
  ) {
    const audio = musicTracks[name];
    const def = MUSIC_TRACK_DEFS[name];

    if (!audio || !def || !musicTrackEnabled(name)) {
      return;
    }

    cancelMusicFade(name);

    if (restart) {
      try {
        audio.currentTime = 0;
      } catch {
        // Betöltés előtt a seek nem minden böngészőben elérhető.
      }
    }

    const target = targetMusicVolume(name);
    audio.volume = fadeMs > 0 ? 0 : target;

    audio.play()
      .then(() => {
        if (fadeMs > 0) {
          fadeMusicTo(name, target, fadeMs);
        }
      })
      .catch(() => {
        // Autoplay policy esetén az első user gesture újrapróbálja.
      });
  }

  function stopMusicTrack(
    name,
    {
      fadeMs = 0,
      reset = true
    } = {}
  ) {
    const audio = musicTracks[name];
    if (!audio) return;

    if (audio.paused) {
      cancelMusicFade(name);
      if (reset) {
        try {
          audio.currentTime = 0;
        } catch {
          // Nincs teendő.
        }
      }
      return;
    }

    if (fadeMs > 0) {
      fadeMusicTo(name, 0, fadeMs, {
        pauseWhenDone: true,
        resetWhenDone: reset
      });
      return;
    }

    cancelMusicFade(name);
    audio.pause();

    if (reset) {
      try {
        audio.currentTime = 0;
      } catch {
        // Nincs teendő.
      }
    }
  }

  function updateGameMusicToggleUi() {
    const enabled = Boolean(userSettings.gameMusicEnabled);

    el.gameMusicToggleBtn.classList.toggle("is-on", enabled);
    el.gameMusicToggleBtn.setAttribute(
      "aria-pressed",
      enabled ? "true" : "false"
    );
    el.gameMusicToggleBtn.textContent =
      enabled ? "♫ Játékzene: BE" : "♫ Játékzene: KI";
    el.gameMusicToggleBtn.title =
      enabled ? "Játékzene kikapcsolása" : "Játékzene bekapcsolása";
    el.gameMusicToggleBtn.setAttribute(
      "aria-label",
      el.gameMusicToggleBtn.title
    );
  }

  function refreshActiveMusicVolumes() {
    for (const name of Object.keys(musicTracks)) {
      if (!musicTrackEnabled(name)) {
        stopMusicTrack(name, {
          fadeMs: 120,
          reset: name !== "game"
        });
        continue;
      }

      const audio = musicTracks[name];
      if (!audio.paused) {
        fadeMusicTo(name, targetMusicVolume(name), 180);
      }
    }

    updateGameMusicToggleUi();
  }

  function setGameMusicDucked(ducked) {
    const next = Boolean(ducked);
    if (state.gameMusicDucked === next) return;

    state.gameMusicDucked = next;

    const audio = musicTracks.game;
    if (!audio || audio.paused) return;

    const fadeMs = next
      ? Number(MUSIC_CONFIG.game?.microphoneDuckFadeMs ?? 220)
      : Number(MUSIC_CONFIG.game?.microphoneRestoreFadeMs ?? 650);

    fadeMusicTo(
      "game",
      targetMusicVolume("game"),
      fadeMs
    );
  }

  function syncGameMusicForCurrentPlayer() {
    const audio = musicTracks.game;
    if (!audio || audio.paused || !musicTrackEnabled("game")) {
      return;
    }

    fadeMusicTo(
      "game",
      targetMusicVolume("game"),
      Number(MUSIC_CONFIG.game?.voiceOwnerTurnFadeMs ?? 180)
    );
  }

  function startLobbyMusic() {
    stopMusicTrack("winner", { fadeMs: 180, reset: true });

    // A lobbyban soha ne szóljon át a játékzene.
    stopMusicTrack("game", { fadeMs: 0, reset: false });
    stopMusicTrack("wheelSpin", { fadeMs: 80, reset: true });

    playMusicTrack("lobby", {
      fadeMs: Number(MUSIC_CONFIG.lobby?.fadeInMs ?? 650)
    });
  }

  function startGameMusic() {
    stopMusicTrack("lobby", {
      fadeMs: Number(MUSIC_CONFIG.lobby?.fadeOutMs ?? 350),
      reset: false
    });

    if (
      document.body.classList.contains("game-active") &&
      state.phase !== "roundEnd"
    ) {
      playMusicTrack("game", {
        fadeMs: Number(MUSIC_CONFIG.game?.fadeInMs ?? 700)
      });
    }
  }

  function startWinnerMusic() {
    stopMusicTrack("game", {
      fadeMs: Number(MUSIC_CONFIG.game?.fadeOutMs ?? 350),
      reset: false
    });

    playMusicTrack("winner", {
      restart: true,
      fadeMs: Number(MUSIC_CONFIG.winner?.fadeInMs ?? 2600)
    });
  }

  function stopWinnerMusic() {
    stopMusicTrack("winner", {
      fadeMs: Number(MUSIC_CONFIG.winner?.fadeOutMs ?? 300),
      reset: true
    });
  }

  function startWheelSpinSound() {
    playMusicTrack("wheelSpin", {
      restart: true
    });
  }

  function stopWheelSpinSound() {
    stopMusicTrack("wheelSpin", {
      fadeMs: Number(MUSIC_CONFIG.wheelSpin?.fadeOutMs ?? 120),
      reset: true
    });
  }

  function syncMusicForCurrentScreen() {
    updateGameMusicToggleUi();

    if (document.body.classList.contains("lobby-active")) {
      startLobbyMusic();
      return;
    }

    if (document.body.classList.contains("game-active")) {
      stopMusicTrack("lobby", { fadeMs: 220, reset: false });

      if (state.phase === "roundEnd") {
        startWinnerMusic();
      } else {
        stopWinnerMusic();
        startGameMusic();
      }
    }
  }

  const PUZZLES = [
    { category: "Mondás", text: "A KOCKA EL VAN VETVE" },
    { category: "Budapest", text: "SZÉCHENYI LÁNCHÍD" },
    { category: "Természet", text: "BALATONI NAPLEMENTE" },
    { category: "Hely", text: "FŐVÁROSI ÁLLATKERT" },
    { category: "Kifejezés", text: "MINDEN KEZDET NEHÉZ" },
    { category: "Étel", text: "TÚRÓS CSUSZA SZALONNÁVAL" }
  ];

  const LIVE_PUZZLE_FILES = {
    child: PUZZLE_CONFIG.files?.child ?? "data/child.csv",
    easy: PUZZLE_CONFIG.files?.easy ?? "data/low.csv",
    medium: PUZZLE_CONFIG.files?.medium ?? "data/med.csv",
    hard: PUZZLE_CONFIG.files?.hard ?? "data/high.csv"
  };

  function parseCsvRow(line) {
    const values = [];
    let current = "";
    let quoted = false;

    for (let i = 0; i < line.length; i += 1) {
      const char = line[i];

      if (char === '"') {
        if (quoted && line[i + 1] === '"') {
          current += '"';
          i += 1;
        } else {
          quoted = !quoted;
        }
        continue;
      }

      if (char === "," && !quoted) {
        values.push(current);
        current = "";
        continue;
      }

      current += char;
    }

    values.push(current);
    return values;
  }

  function parsePuzzleCsv(csvText) {
    const lines = String(csvText ?? "")
      .replace(/^\uFEFF/, "")
      .split(/\r?\n/)
      .filter(line => line.trim());

    if (lines.length < 2) return [];

    return lines.slice(1)
      .map(parseCsvRow)
      .map(([category, puzzle]) => ({
        category: String(category ?? "").trim(),
        text: normalize(String(puzzle ?? ""))
      }))
      .filter(item => item.category && item.text);
  }

  async function loadLivePuzzles() {
    const difficulty = userSettings.puzzleDifficulty;
    const path = LIVE_PUZZLE_FILES[difficulty] ?? LIVE_PUZZLE_FILES.easy;

    const response = await fetch(path, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(
        `Nem sikerült betölteni a feladványokat: ${path} (HTTP ${response.status})`
      );
    }

    const puzzles = parsePuzzleCsv(await response.text());
    const expectedCount = Math.max(
      1,
      Number(PUZZLE_CONFIG.expectedCountPerDifficulty ?? 100)
    );

    if (puzzles.length < expectedCount) {
      throw new Error(
        `A feladványlista hiányos: ${path} (${puzzles.length}/${expectedCount})`
      );
    }

    state.livePuzzles = puzzles;
    state.livePuzzleSource = path;
    state.lastPuzzleIndex = -1;
  }

  const DEFAULT_WHEEL_SEGMENTS = [
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

  const WHEEL_BASE_SEGMENTS =
    Array.isArray(WHEEL_CONFIG.segments) && WHEEL_CONFIG.segments.length
      ? WHEEL_CONFIG.segments
      : DEFAULT_WHEEL_SEGMENTS;

  const WHEEL_SEGMENT_REPEAT = Math.max(
    1,
    Math.floor(Number(WHEEL_CONFIG.segmentRepeat ?? 2))
  );

  const WHEEL_SEGMENTS = Array.from(
    { length: WHEEL_SEGMENT_REPEAT },
    () => WHEEL_BASE_SEGMENTS.map(segment => ({ ...segment }))
  ).flat();

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
    playerTransitionTimer: null,
    roundEndTimer: null,
    victoryButtonTimer: null,
    feedbackTimer: null,
    autoSpinTimer: null,
    turnReadyTimer: null,
    letterRevealTimer: null,
    roundNumber: 0,
    justRevealed: new Set(),
    pendingWheelSegment: null,
    pendingWheelFromBot: false,
    livePuzzles: [],
    livePuzzleSource: null,

    voiceEngine: null,
    voiceModulePromise: null,
    voiceParseLetter: null,
    voiceMediaStream: null,
    voiceActive: false,
    voiceStartPending: false,
    voiceEngineState: "idle",
    voiceArmed: false,
    voiceOwnerName: null,
    voiceSessionToken: 0,
    voiceInputMode: null,
    voiceIgnoreNextFinal: false,
    voiceSolveDialogOwned: false,

    gameMusicDucked: false
  };

  const el = {
    setupScreen: document.getElementById("setupScreen"),
    settingsScreen: document.getElementById("settingsScreen"),
    gameScreen: document.getElementById("gameScreen"),
    startGameBtn: document.getElementById("startGameBtn"),
    settingsBtn: document.getElementById("settingsBtn"),
    settingsBackBtn: document.getElementById("settingsBackBtn"),
    settingsSaveBtn: document.getElementById("settingsSaveBtn"),
    settingsSaveStatus: document.getElementById("settingsSaveStatus"),
    soundsEnabledSetting: document.getElementById("soundsEnabledSetting"),
    masterVolumeSetting: document.getElementById("masterVolumeSetting"),
    masterVolumeValue: document.getElementById("masterVolumeValue"),

    wheelSpinSoundEnabledSetting: document.getElementById("wheelSpinSoundEnabledSetting"),
    wheelSpinVolumeSetting: document.getElementById("wheelSpinVolumeSetting"),
    wheelSpinVolumeValue: document.getElementById("wheelSpinVolumeValue"),
    lobbyMusicEnabledSetting: document.getElementById("lobbyMusicEnabledSetting"),
    lobbyMusicVolumeSetting: document.getElementById("lobbyMusicVolumeSetting"),
    lobbyMusicVolumeValue: document.getElementById("lobbyMusicVolumeValue"),
    winnerMusicEnabledSetting: document.getElementById("winnerMusicEnabledSetting"),
    winnerMusicVolumeSetting: document.getElementById("winnerMusicVolumeSetting"),
    winnerMusicVolumeValue: document.getElementById("winnerMusicVolumeValue"),
    gameMusicEnabledSetting: document.getElementById("gameMusicEnabledSetting"),
    gameMusicVolumeSetting: document.getElementById("gameMusicVolumeSetting"),
    gameMusicVolumeValue: document.getElementById("gameMusicVolumeValue"),
    gameMusicToggleBtn: document.getElementById("gameMusicToggleBtn"),

    autoSpinEnabledSetting: document.getElementById("autoSpinEnabledSetting"),
    puzzleModeSetting: document.getElementById("puzzleModeSetting"),
    speechRecognitionEnabledSetting: document.getElementById("speechRecognitionEnabledSetting"),
    speechProviderSetting: document.getElementById("speechProviderSetting"),
    speechLanguageSetting: document.getElementById("speechLanguageSetting"),
    speechMicrophoneSetting: document.getElementById("speechMicrophoneSetting"),
    refreshSpeechMicrophonesBtn: document.getElementById("refreshSpeechMicrophonesBtn"),
    speechMicrophoneHelp: document.getElementById("speechMicrophoneHelp"),
    speechSupportBadge: document.getElementById("speechSupportBadge"),
    speechSupportText: document.getElementById("speechSupportText"),
    setupError: document.getElementById("setupError"),
    difficultySelector: document.getElementById("difficultySelector"),
    playersList: document.getElementById("playersList"),
    categoryText: document.getElementById("categoryText"),
    puzzleBoard: document.getElementById("puzzleBoard"),
    usedLetters: document.getElementById("usedLetters"),
    activePlayerText: document.getElementById("activePlayerText"),
    stageCurrentAvatar: document.getElementById("stageCurrentAvatar"),
    stageCurrentPlayerName: document.getElementById("stageCurrentPlayerName"),
    stageCurrentMoney: document.getElementById("stageCurrentMoney"),
    stageFeedback: document.getElementById("stageFeedback"),
    voiceMicBtn: document.getElementById("voiceMicBtn"),
    voiceMicBtnLabel: document.getElementById("voiceMicBtnLabel"),
    voiceDebugPanel: document.getElementById("voiceDebugPanel"),
    voiceDebugState: document.getElementById("voiceDebugState"),
    voiceDebugText: document.getElementById("voiceDebugText"),
    voiceDebugEvent: document.getElementById("voiceDebugEvent"),
    spinBtn: document.getElementById("spinBtn"),
    consonantStageBtn: document.getElementById("consonantStageBtn"),
    solveBtn: document.getElementById("solveBtn"),
    message: document.getElementById("message"),
    wheelResult: document.getElementById("wheelResult"),
    wheelOverlay: document.getElementById("wheelOverlay"),
    wheelOverlayResult: document.getElementById("wheelOverlayResult"),
    testBtn: document.getElementById("testBtn"),
    testDialog: document.getElementById("testDialog"),
    testAnswerDialogText: document.getElementById("testAnswerDialogText"),
    solveDialog: document.getElementById("solveDialog"),
    solveForm: document.getElementById("solveForm"),
    solveInput: document.getElementById("solveInput"),
    solveConfirmBtn: document.getElementById("solveConfirmBtn"),
    victoryOverlay: document.getElementById("victoryOverlay"),
    victoryFx: document.getElementById("victoryFx"),
    victoryAvatar: document.getElementById("victoryAvatar"),
    victoryTitle: document.getElementById("victoryTitle"),
    victoryPuzzle: document.getElementById("victoryPuzzle"),
    victoryRoundMoney: document.getElementById("victoryRoundMoney"),
    victoryTotalMoney: document.getElementById("victoryTotalMoney"),
    victoryStandingsList: document.getElementById("victoryStandingsList"),
    victoryActions: document.getElementById("victoryActions"),
    nextRoundBtn: document.getElementById("nextRoundBtn"),
    victoryEndGameBtn: document.getElementById("victoryEndGameBtn"),
    endGameBtn: document.getElementById("endGameBtn"),
    endGameDialog: document.getElementById("endGameDialog"),
    endGameCancelBtn: document.getElementById("endGameCancelBtn"),
    endGameConfirmBtn: document.getElementById("endGameConfirmBtn")
  };

  el.testBtn.classList.toggle(
    "hidden",
    DEBUG_CONFIG.showTestButton === false
  );
  updateVoiceRuntimeUi();
  updateGameMusicToggleUi();

  let firstAudioGestureHandled = false;
  const handleFirstAudioGesture = () => {
    if (firstAudioGestureHandled) return;
    firstAudioGestureHandled = true;
    unlockSfx();
    syncMusicForCurrentScreen();
  };

  document.addEventListener(
    "pointerdown",
    handleFirstAudioGesture,
    { once: true, capture: true }
  );
  document.addEventListener(
    "keydown",
    handleFirstAudioGesture,
    { once: true, capture: true }
  );

  syncMusicForCurrentScreen();

  function updateMasterVolumeLabel() {
    el.masterVolumeValue.textContent =
      `${Math.round(Number(el.masterVolumeSetting.value))}%`;
  }

  function updateMusicVolumeLabels() {
    const pairs = [
      [el.wheelSpinVolumeSetting, el.wheelSpinVolumeValue],
      [el.lobbyMusicVolumeSetting, el.lobbyMusicVolumeValue],
      [el.winnerMusicVolumeSetting, el.winnerMusicVolumeValue],
      [el.gameMusicVolumeSetting, el.gameMusicVolumeValue]
    ];

    pairs.forEach(([input, output]) => {
      output.textContent =
        `${Math.round(Number(input.value))}%`;
    });
  }

  function normalizeMicrophoneLabel(value) {
    return String(value ?? "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLocaleLowerCase("hu-HU");
  }

  function speechRecognitionSupported() {
    return Boolean(
      window.SpeechRecognition || window.webkitSpeechRecognition
    );
  }

  function microphoneApiSupported() {
    return Boolean(
      navigator.mediaDevices?.enumerateDevices &&
      navigator.mediaDevices?.getUserMedia
    );
  }

  function microphonePreferenceScore(device) {
    const label = normalizeMicrophoneLabel(device.label);
    let score = 0;

    for (const rule of VOICE_CONFIG.microphone?.preferenceRules ?? []) {
      const token = normalizeMicrophoneLabel(rule.contains);
      if (token && label.includes(token)) {
        score += Number(rule.score) || 0;
      }
    }

    if (device.deviceId === "default") {
      score -= Number(VOICE_CONFIG.microphone?.defaultDevicePenalty ?? 0);
    }

    return score;
  }

  function choosePreferredMicrophone(devices, preferredId = "") {
    if (
      preferredId &&
      devices.some(device => device.deviceId === preferredId)
    ) {
      return preferredId;
    }

    return [...devices]
      .sort(
        (a, b) =>
          microphonePreferenceScore(b) -
          microphonePreferenceScore(a)
      )[0]?.deviceId ?? "";
  }

  function renderSpeechSupportState() {
    const recognitionOk = speechRecognitionSupported();
    const microphoneOk = microphoneApiSupported();
    const supported = recognitionOk && microphoneOk;

    el.speechSupportBadge.dataset.state =
      supported ? "ready" : "unavailable";
    el.speechSupportBadge.textContent =
      supported ? "Elérhető" : "Nem támogatott";

    if (supported) {
      el.speechSupportText.textContent =
        "A böngésző SpeechRecognition és mikrofon API-ja elérhető. A beállítások menthetők; a játékvezérlés bekötése a következő lépés.";
    } else if (!microphoneOk) {
      el.speechSupportText.textContent =
        "A böngésző mikrofon API-ja nem érhető el. Használj localhostot vagy HTTPS-t modern böngészőben.";
    } else {
      el.speechSupportText.textContent =
        "A mikrofon API elérhető, de a böngésző SpeechRecognition providere nem támogatott. Chrome vagy Edge ajánlott.";
    }

    el.speechRecognitionEnabledSetting.disabled = !supported;
    el.refreshSpeechMicrophonesBtn.disabled = !microphoneOk;
    el.speechMicrophoneSetting.disabled = !microphoneOk;
  }

  async function requestSpeechMicrophonePermission() {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: false
    });
    stream.getTracks().forEach(track => track.stop());
  }

  async function refreshSpeechMicrophones({
    requestPermission = false,
    preferredId = null
  } = {}) {
    renderSpeechSupportState();

    if (!microphoneApiSupported()) {
      el.speechMicrophoneSetting.replaceChildren();
      const option = document.createElement("option");
      option.value = "";
      option.textContent = "Mikrofon API nem érhető el";
      el.speechMicrophoneSetting.append(option);
      return;
    }

    el.refreshSpeechMicrophonesBtn.disabled = true;
    el.speechMicrophoneHelp.textContent = requestPermission
      ? "Mikrofonengedély kérése és eszközlista frissítése…"
      : "Mikrofonlista frissítése…";

    try {
      if (requestPermission) {
        await requestSpeechMicrophonePermission();
      }

      const devices = await navigator.mediaDevices.enumerateDevices();
      const audioInputs = devices.filter(
        device => device.kind === "audioinput"
      );

      const currentId =
        preferredId ??
        el.speechMicrophoneSetting.value ??
        userSettings.microphoneDeviceId;

      el.speechMicrophoneSetting.replaceChildren();

      if (audioInputs.length === 0) {
        const option = document.createElement("option");
        option.value = "";
        option.textContent = "Nem található mikrofon";
        el.speechMicrophoneSetting.append(option);
        el.speechMicrophoneHelp.textContent =
          "A böngésző nem adott vissza audio bemenetet.";
        return;
      }

      audioInputs.forEach((device, index) => {
        const option = document.createElement("option");
        option.value = device.deviceId;
        option.textContent =
          device.label || `Mikrofon ${index + 1}`;
        el.speechMicrophoneSetting.append(option);
      });

      const selectedId = choosePreferredMicrophone(
        audioInputs,
        currentId
      );

      if (selectedId) {
        el.speechMicrophoneSetting.value = selectedId;
      }

      const labelsVisible = audioInputs.some(device => device.label);
      el.speechMicrophoneHelp.textContent = labelsVisible
        ? "Válaszd ki azt a mikrofont, amelyet a hangfelismerés használjon."
        : "Az eszközök elérhetők, de a neveikhez mikrofonengedély szükséges. Nyomd meg a Frissítés gombot.";
    } catch (error) {
      el.speechMicrophoneHelp.textContent =
        error?.name === "NotAllowedError"
          ? "A mikrofonengedélyt a böngészőben letiltottad vagy nem adtad meg."
          : `A mikrofonlista nem frissíthető: ${error?.message ?? error}`;
    } finally {
      el.refreshSpeechMicrophonesBtn.disabled =
        !microphoneApiSupported();
    }
  }

  function populateSettingsForm() {
    el.soundsEnabledSetting.checked = userSettings.soundsEnabled;
    el.masterVolumeSetting.value =
      String(Math.round(userSettings.masterVolume * 100));
    el.autoSpinEnabledSetting.checked =
      userSettings.autoSpinEnabled;
    el.puzzleModeSetting.value =
      userSettings.puzzleMode;

    el.wheelSpinSoundEnabledSetting.checked =
      userSettings.wheelSpinSoundEnabled;
    el.wheelSpinVolumeSetting.value =
      String(Math.round(userSettings.wheelSpinVolume * 100));
    el.lobbyMusicEnabledSetting.checked =
      userSettings.lobbyMusicEnabled;
    el.lobbyMusicVolumeSetting.value =
      String(Math.round(userSettings.lobbyMusicVolume * 100));
    el.winnerMusicEnabledSetting.checked =
      userSettings.winnerMusicEnabled;
    el.winnerMusicVolumeSetting.value =
      String(Math.round(userSettings.winnerMusicVolume * 100));
    el.gameMusicEnabledSetting.checked =
      userSettings.gameMusicEnabled;
    el.gameMusicVolumeSetting.value =
      String(Math.round(userSettings.gameMusicVolume * 100));

    el.speechRecognitionEnabledSetting.checked =
      userSettings.speechRecognitionEnabled;
    el.speechProviderSetting.value =
      userSettings.speechProvider;
    el.speechLanguageSetting.value =
      userSettings.speechLanguage;
    updateMasterVolumeLabel();
    updateMusicVolumeLabels();
    renderSpeechSupportState();
    el.settingsSaveStatus.textContent = "";
  }

  function renderDifficultySelector() {
    const valid = new Set(["child", "easy", "medium", "hard"]);
    const selected = valid.has(userSettings.puzzleDifficulty)
      ? userSettings.puzzleDifficulty
      : "easy";

    el.difficultySelector
      .querySelectorAll("[data-difficulty]")
      .forEach(button => {
        const active =
          button.dataset.difficulty === selected;

        button.classList.toggle("is-active", active);
        button.setAttribute(
          "aria-pressed",
          active ? "true" : "false"
        );
      });
  }

  function setPuzzleDifficulty(value) {
    if (!["child", "easy", "medium", "hard"].includes(value)) {
      return;
    }

    userSettings.puzzleDifficulty = value;
    persistUserSettings(userSettings);
    renderDifficultySelector();
  }

  function showSettingsScreen() {
    populateSettingsForm();
    el.setupScreen.classList.add("hidden");
    el.settingsScreen.classList.remove("hidden");
    el.settingsSaveBtn.focus();

    void refreshSpeechMicrophones({
      requestPermission: false,
      preferredId: userSettings.microphoneDeviceId
    });
  }

  function showSetupScreen() {
    el.settingsScreen.classList.add("hidden");
    el.setupScreen.classList.remove("hidden");
    el.settingsSaveStatus.textContent = "";
    renderDifficultySelector();
    el.settingsBtn.focus();
  }

  function saveSettings() {
    userSettings.soundsEnabled = el.soundsEnabledSetting.checked;
    userSettings.masterVolume = clamp01(
      Number(el.masterVolumeSetting.value) / 100
    );
    userSettings.autoSpinEnabled =
      el.autoSpinEnabledSetting.checked;
    userSettings.puzzleMode =
      ["test", "live"].includes(el.puzzleModeSetting.value)
        ? el.puzzleModeSetting.value
        : "test";

    userSettings.wheelSpinSoundEnabled =
      el.wheelSpinSoundEnabledSetting.checked;
    userSettings.wheelSpinVolume =
      clamp01(Number(el.wheelSpinVolumeSetting.value) / 100);
    userSettings.lobbyMusicEnabled =
      el.lobbyMusicEnabledSetting.checked;
    userSettings.lobbyMusicVolume =
      clamp01(Number(el.lobbyMusicVolumeSetting.value) / 100);
    userSettings.winnerMusicEnabled =
      el.winnerMusicEnabledSetting.checked;
    userSettings.winnerMusicVolume =
      clamp01(Number(el.winnerMusicVolumeSetting.value) / 100);
    userSettings.gameMusicEnabled =
      el.gameMusicEnabledSetting.checked;
    userSettings.gameMusicVolume =
      clamp01(Number(el.gameMusicVolumeSetting.value) / 100);

    userSettings.speechRecognitionEnabled =
      el.speechRecognitionEnabledSetting.checked;
    userSettings.speechProvider =
      el.speechProviderSetting.value || "browser";
    userSettings.speechLanguage =
      el.speechLanguageSetting.value ||
      VOICE_CONFIG.recognition?.language ||
      "hu-HU";

    if (el.speechMicrophoneSetting.value) {
      userSettings.microphoneDeviceId =
        el.speechMicrophoneSetting.value;
    }

    const persisted = persistUserSettings(userSettings);

    el.settingsSaveStatus.textContent = persisted
      ? "Beállítások elmentve."
      : "A beállítások erre a munkamenetre érvényesek, de a böngésző nem engedte a tartós mentést.";

    if (userSettings.soundsEnabled) {
      unlockSfx();
    }

    refreshActiveMusicVolumes();
    syncMusicForCurrentScreen();
  }

  populateSettingsForm();
  renderDifficultySelector();

  const normalize = (s) =>
    s.normalize("NFC")
      .toLocaleUpperCase("hu-HU")
      .replace(/\s+/g, " ")
      .trim();

  const fmtMoney = (n) =>
    new Intl.NumberFormat("hu-HU").format(n) + " Ft";

  function currentPlayer() {
    return state.players[state.currentIndex];
  }

  function pickPuzzle() {
    const pool =
      userSettings.puzzleMode === "live"
        ? state.livePuzzles
        : PUZZLES;

    if (!pool.length) {
      throw new Error("Nincs betöltött feladvány.");
    }

    let idx;
    do {
      idx = Math.floor(Math.random() * pool.length);
    } while (pool.length > 1 && idx === state.lastPuzzleIndex);

    state.lastPuzzleIndex = idx;
    return { ...pool[idx], text: normalize(pool[idx].text) };
  }

  async function startGame() {
    const selected = [...document.querySelectorAll('.player-option input:checked')]
      .map(input => input.value);

    if (selected.length < 2) {
      el.setupError.textContent = "Legalább két játékos szükséges.";
      el.setupError.classList.remove("hidden");
      return;
    }

    el.setupError.classList.add("hidden");
    el.startGameBtn.disabled = true;

    try {
      if (userSettings.puzzleMode === "live") {
        el.startGameBtn.textContent = "Feladványok betöltése…";
        await loadLivePuzzles();
      } else {
        state.livePuzzles = [];
        state.livePuzzleSource = null;
        state.lastPuzzleIndex = -1;
      }
    } catch (error) {
      console.error(error);
      el.setupError.textContent =
        "Az éles feladványok betöltése nem sikerült. Ellenőrizd a data mappát.";
      el.setupError.classList.remove("hidden");
      return;
    } finally {
      el.startGameBtn.disabled = false;
      el.startGameBtn.textContent = "Játék indítása";
    }

    unlockSfx();
    stopMusicTrack("lobby", {
      fadeMs: Number(MUSIC_CONFIG.lobby?.fadeOutMs ?? 350),
      reset: false
    });
    stopWinnerMusic();

    state.players = selected.map(name => ({
      name,
      isBot: name === "Bot",
      roundMoney: 0,
      totalMoney: 0
    }));
    state.currentIndex = 0;
    state.roundNumber = 0;
    state.lastPuzzleIndex = -1;

    document.body.classList.remove("lobby-active");
    document.body.classList.add("game-active");
    el.setupScreen.classList.add("hidden");
    el.gameScreen.classList.remove("hidden");

    resetVoiceRuntimeForGame();
    newRound();
  }

  function newRound() {
    stopWinnerMusic();
    stopWheelSpinSound();
    state.gameMusicDucked = false;

    state.voiceInputMode = null;
    state.voiceIgnoreNextFinal = false;
    clearTimeout(state.botTimer);
    clearTimeout(state.autoSpinTimer);
    clearTimeout(state.turnReadyTimer);
    clearTimeout(state.letterRevealTimer);
    state.autoSpinTimer = null;
    state.turnReadyTimer = null;
    state.letterRevealTimer = null;
    clearTimeout(state.playerTransitionTimer);
    clearTimeout(state.roundEndTimer);
    clearTimeout(state.victoryButtonTimer);
    clearTimeout(state.feedbackTimer);
    hideVictoryOverlay();
    hideStageFeedback();
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
    startGameMusic();

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
    maybeRunTurnAutomation();
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
      setPlayerAvatar(el.stageCurrentAvatar, active.name);
    } else {
      el.stageCurrentPlayerName.textContent = "–";
      el.stageCurrentMoney.textContent = fmtMoney(0);
      setPlayerAvatar(
        el.stageCurrentAvatar,
        "Bot",
        "Nincs aktív játékos"
      );
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

    // A teljes feladványblokk függőlegesen is középre kerül a 4 soros
    // táblán. Például 2 sor → a 2. és 3. képi sor.
    const startRow = Math.max(
      0,
      Math.floor((STAGE_GRID.rows - rows.length) / 2)
    );

    let revealSequenceIndex = 0;

    rows.forEach((rowText, rowIndex) => {
      const gridRowIndex = startRow + rowIndex;
      const chars = [...rowText];
      const startCol = Math.max(
        0,
        Math.floor((STAGE_GRID.cols - chars.length) / 2)
      );

      chars.forEach((char, charIndex) => {
        if (char === " ") return;

        const colIndex = startCol + charIndex;
        if (colIndex < 0 || colIndex >= STAGE_GRID.cols) return;

        if (
          gridRowIndex < 0 ||
          gridRowIndex >= STAGE_GRID.rows
        ) return;

        const x = STAGE_GRID.x[colIndex];
        const y = STAGE_GRID.y[gridRowIndex];
        const width = STAGE_GRID.width[colIndex];
        const height = STAGE_GRID.height[gridRowIndex];

        const group = createSvgElement("g", {
          class: "stage-puzzle-cell",
          "data-row": gridRowIndex,
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
      ["spinning", "wheelResult", "letterReveal", "playerTransition", "roundEnd", "setup"].includes(state.phase);

    // A középső képi gomb csak jelzi, hogy most betűt várunk.
    // A tényleges választás közvetlen billentyűleütéssel történik.
    el.consonantStageBtn.disabled = !(human && state.phase === "letter");
    updateVoiceRuntimeUi();
  }

  function hideStageFeedback() {
    clearTimeout(state.feedbackTimer);
    el.stageFeedback.className = "stage-feedback";
    el.stageFeedback.textContent = "";
  }

  function showStageFeedback(message, type = "info", durationMs = 0) {
    clearTimeout(state.feedbackTimer);

    el.stageFeedback.textContent = String(message)
      .toLocaleUpperCase("hu-HU");
    el.stageFeedback.className = `stage-feedback show ${type}`;

    if (durationMs > 0) {
      state.feedbackTimer = setTimeout(
        hideStageFeedback,
        durationMs
      );
    }
  }

  function setMessage(msg) {
    el.message.textContent = msg;
  }

  function voiceFeedback(message, type = "info") {
    showStageFeedback(
      message,
      type,
      Number(VOICE_CONFIG.runtime?.commandFeedbackMs ?? 1400)
    );
  }

  function setVoiceDebugText(text, { interim = false } = {}) {
    el.voiceDebugText.textContent = String(text || "–");
    el.voiceDebugText.classList.toggle("is-interim", interim);
  }

  function setVoiceDebugEvent(text = "–") {
    el.voiceDebugEvent.textContent = String(text || "–");
  }

  function voiceOwnerIsCurrentPlayer() {
    const player = currentPlayer();
    return Boolean(
      player &&
      !player.isBot &&
      state.voiceOwnerName &&
      player.name === state.voiceOwnerName
    );
  }

  function voiceRuntimeCanStart() {
    return Boolean(
      document.body.classList.contains("game-active") &&
      voiceOwnerIsCurrentPlayer() &&
      ![
        "spinning",
        "wheelResult",
        "playerTransition",
        "turnReady",
        "roundEnd",
        "setup"
      ].includes(state.phase)
    );
  }

  function updateVoiceRuntimeUi() {
    const apiSupported =
      speechRecognitionSupported() &&
      microphoneApiSupported();
    const enabled =
      Boolean(userSettings.speechRecognitionEnabled) &&
      apiSupported;
    const player = currentPlayer();
    const currentHuman = Boolean(player && !player.isBot);
    const ownerIsCurrent = voiceOwnerIsCurrentPlayer();
    const listening =
      state.voiceActive &&
      state.voiceEngineState === "listening";

    setGameMusicDucked(
      state.voiceActive || state.voiceStartPending
    );
    syncGameMusicForCurrentPlayer();

    const temporarilyBlocked = [
      "spinning",
      "wheelResult",
      "playerTransition",
      "turnReady",
      "roundEnd",
      "setup"
    ].includes(state.phase);

    el.voiceMicBtn.disabled =
      !enabled ||
      state.voiceStartPending ||
      !currentHuman ||
      temporarilyBlocked ||
      (state.voiceArmed && !ownerIsCurrent);

    el.voiceMicBtn.classList.toggle(
      "is-active",
      state.voiceActive
    );
    el.voiceMicBtn.classList.toggle(
      "is-listening",
      listening
    );
    el.voiceMicBtn.classList.toggle(
      "is-loading",
      state.voiceStartPending ||
      ["starting", "restarting"].includes(state.voiceEngineState)
    );

    el.voiceMicBtn.setAttribute(
      "aria-pressed",
      state.voiceActive ? "true" : "false"
    );

    el.voiceMicBtnLabel.textContent =
      state.voiceActive
        ? "BE"
        : state.voiceArmed
          ? "VÁR"
          : "KI";

    let title;

    if (!userSettings.speechRecognitionEnabled) {
      title = "Hangfelismerés kikapcsolva a Beállításokban";
    } else if (!apiSupported) {
      title = "A böngésző nem támogatja a hangfelismerést";
    } else if (state.voiceActive) {
      title = "Hangvezérlés kikapcsolása";
    } else if (state.voiceArmed && !ownerIsCurrent) {
      title = `${state.voiceOwnerName} mikrofonja a saját körére vár`;
    } else if (state.voiceArmed && ownerIsCurrent) {
      title = "A mikrofon a pörgetés utáni visszakapcsolásra vár";
    } else {
      title = "Hangvezérlés bekapcsolása";
    }

    el.voiceMicBtn.title = title;
    el.voiceMicBtn.setAttribute("aria-label", title);

    let panelState = "idle";
    let stateLabel = "KI";

    if (!apiSupported) {
      panelState = "error";
      stateLabel = "NEM ELÉRHETŐ";
    } else if (listening) {
      panelState = "listening";
      stateLabel = "HALLGAT";
    } else if (state.voiceActive) {
      panelState = "active";
      stateLabel =
        state.voiceEngineState === "restarting"
          ? "ÚJRAINDUL"
          : "AKTÍV";
    } else if (state.voiceArmed) {
      panelState = "active";
      stateLabel = "VÁR";
    }

    el.voiceDebugPanel.dataset.state = panelState;
    el.voiceDebugState.textContent = stateLabel;
  }

  function stopVoiceMediaStream() {
    state.voiceMediaStream?.getTracks().forEach(track => {
      try {
        track.stop();
      } catch {
        // A track már leállhatott.
      }
    });
    state.voiceMediaStream = null;
  }

  function closeVoiceSolveMode() {
    const ownedDialog = state.voiceSolveDialogOwned;
    state.voiceInputMode = null;
    state.voiceSolveDialogOwned = false;
    state.voiceIgnoreNextFinal = false;

    if (ownedDialog && el.solveDialog.open) {
      el.solveDialog.close("voice-cancelled");
    }

    el.solveInput.placeholder = "";
  }

  function stopVoiceListening({
    abort = false,
    preserveArm = false
  } = {}) {
    state.voiceSessionToken += 1;
    closeVoiceSolveMode();

    try {
      if (abort) {
        state.voiceEngine?.abort();
      } else {
        state.voiceEngine?.stop();
      }
    } catch {
      // A recognizer már állhat.
    }

    stopVoiceMediaStream();
    state.voiceActive = false;
    state.voiceStartPending = false;
    state.voiceEngineState = "stopped";

    if (!preserveArm) {
      state.voiceArmed = false;
      state.voiceOwnerName = null;
    }

    updateVoiceRuntimeUi();
  }

  function suspendVoiceListening(message = "") {
    if (
      state.voiceActive ||
      state.voiceStartPending
    ) {
      stopVoiceListening({
        abort: true,
        preserveArm: true
      });
    }

    if (state.voiceArmed && message) {
      setVoiceDebugText(message);
    }

    updateVoiceRuntimeUi();
  }

  function handleVoiceEngineState(nextState) {
    state.voiceEngineState = String(nextState || "idle");

    if (
      ["starting", "listening", "restarting"].includes(
        state.voiceEngineState
      ) &&
      state.voiceArmed &&
      voiceOwnerIsCurrentPlayer()
    ) {
      state.voiceActive = true;
    }

    if (
      state.voiceEngineState === "stopped" &&
      !state.voiceStartPending
    ) {
      state.voiceActive = false;
      stopVoiceMediaStream();
    }

    updateVoiceRuntimeUi();
  }

  function handleVoiceError(error) {
    const code = error?.code ?? "ismeretlen";
    setVoiceDebugText(`Hangfelismerési hiba: ${code}`);
    setVoiceDebugEvent(
      error?.fatal
        ? "HIBA · A MIKROFON LEÁLLT"
        : "HIBA · ÚJRAPRÓBÁLKOZÁS"
    );

    el.voiceDebugPanel.dataset.state = "error";

    if (error?.fatal) {
      state.voiceSessionToken += 1;
      state.voiceActive = false;
      state.voiceArmed = false;
      state.voiceOwnerName = null;
      state.voiceInputMode = null;
      stopVoiceMediaStream();
      updateVoiceRuntimeUi();
      voiceFeedback(
        `Hangfelismerési hiba: ${code}`,
        "error"
      );
    }
  }

  function extractInlineSolveAnswer(transcript) {
    const words = String(transcript ?? "")
      .trim()
      .split(/\s+/)
      .filter(Boolean);

    return words.length > 1
      ? words.slice(1).join(" ")
      : "";
  }

  function voiceActionAllowed() {
    if (!document.body.classList.contains("game-active")) {
      return false;
    }

    const player = currentPlayer();
    if (!player || player.isBot) {
      setVoiceDebugEvent("VÁRAKOZÁS · BOT KÖRE");
      return false;
    }

    if (
      !state.voiceOwnerName ||
      player.name !== state.voiceOwnerName
    ) {
      setVoiceDebugEvent(
        "VÁRAKOZÁS · NEM A MIKROFON TULAJDONOSÁNAK KÖRE"
      );
      return false;
    }

    return true;
  }

  function voiceSolveAllowed() {
    return ![
      "spinning",
      "wheelResult",
      "playerTransition",
      "turnReady",
      "roundEnd",
      "setup"
    ].includes(state.phase);
  }

  function openVoiceSolveMode() {
    state.voiceInputMode = "solve";
    state.voiceSolveDialogOwned = true;
    el.solveInput.value = "";
    el.solveInput.placeholder = "Mondd be a megfejtést…";

    if (!el.solveDialog.open) {
      el.solveDialog.showModal();
    }

    voiceFeedback("Mondd a megfejtést!");
    setVoiceDebugEvent("VÁRAKOZÁS · MEGFEJTÉS");
  }

  function submitVoiceSolve(answer) {
    const value = String(answer ?? "").trim();
    if (!value) return false;

    state.voiceInputMode = null;
    state.voiceSolveDialogOwned = false;
    el.solveInput.value = value;
    el.solveInput.placeholder = "";

    if (el.solveDialog.open) {
      el.solveDialog.close("voice-answer");
    }

    hideStageFeedback();

    requestAnimationFrame(() => {
      trySolve(value, false);
    });

    return true;
  }

  function handleVoiceLetter(event) {
    if (!voiceActionAllowed()) return;

    const letter = normalize(event.value);
    if (letter.length !== 1 || !/\p{L}/u.test(letter)) {
      return;
    }

    setVoiceDebugEvent(`BETŰ · ${letter}`);

    if (state.voiceInputMode === "vowel") {
      if (!VOWELS.has(letter)) {
        voiceFeedback("Magánhangzót mondj!", "error");
        return;
      }

      state.voiceInputMode = null;
      buyVowel(letter, false);
      return;
    }

    if (VOWELS.has(letter)) {
      if (!["spin", "letter"].includes(state.phase)) {
        voiceFeedback(
          "Most nem vásárolható magánhangzó.",
          "error"
        );
        return;
      }

      buyVowel(letter, false);
      return;
    }

    if (state.phase !== "letter") {
      voiceFeedback("Előbb pörgess!", "error");
      return;
    }

    handleConsonant(letter, false);
  }

  function handleVoiceCommand(event) {
    if (!voiceActionAllowed()) return;

    switch (event.command) {
      case "SPIN":
        state.voiceInputMode = null;
        setVoiceDebugEvent("PARANCS · PÖRGETÉS");

        if (state.phase !== "spin") {
          voiceFeedback("Most nem lehet pörgetni.", "error");
          return;
        }

        spinWheel(false);
        return;

      case "VOWEL": {
        setVoiceDebugEvent("PARANCS · MAGÁNHANGZÓ");

        if (!["spin", "letter"].includes(state.phase)) {
          voiceFeedback(
            "Most nem vásárolható magánhangzó.",
            "error"
          );
          return;
        }

        if (currentPlayer().roundMoney < VOWEL_PRICE) {
          voiceFeedback(
            "Nincs elég pénzed magánhangzóra.",
            "error"
          );
          return;
        }

        const inlineLetter = state.voiceParseLetter?.(
          event.transcript,
          VOICE_CONFIG.letters
        );

        if (inlineLetter && VOWELS.has(normalize(inlineLetter.value))) {
          state.voiceInputMode = null;
          buyVowel(normalize(inlineLetter.value), false);
          return;
        }

        state.voiceInputMode = "vowel";
        voiceFeedback("Mondd a magánhangzót!");
        setVoiceDebugEvent("VÁRAKOZÁS · MAGÁNHANGZÓ");
        return;
      }

      case "SOLVE": {
        setVoiceDebugEvent("PARANCS · MEGFEJTÉS");

        if (!voiceSolveAllowed()) {
          voiceFeedback("Most nem lehet megfejteni.", "error");
          return;
        }

        state.voiceIgnoreNextFinal = true;
        const inlineAnswer = extractInlineSolveAnswer(
          event.transcript
        );

        if (inlineAnswer) {
          state.voiceInputMode = null;
          state.voiceSolveDialogOwned = false;
          submitVoiceSolve(inlineAnswer);
          return;
        }

        openVoiceSolveMode();
        return;
      }

      case "GAME":
        setVoiceDebugEvent("PARANCS · JÁTÉK");
        voiceFeedback(
          "A Játék hangparancs még nincs hozzárendelve."
        );
        return;

      default:
        setVoiceDebugEvent(
          `ISMERETLEN PARANCS · ${event.command}`
        );
    }
  }

  function handleVoiceEvent(event) {
    if (!state.voiceActive || !event) return;

    // Megfejtés módban a következő teljes transcript maga a válasz.
    if (state.voiceInputMode === "solve") {
      return;
    }

    if (event.type === "COMMAND") {
      handleVoiceCommand(event);
      return;
    }

    if (event.type === "LETTER") {
      handleVoiceLetter(event);
    }
  }

  function handleVoiceInterim(payload) {
    if (!state.voiceActive) return;

    const transcript = payload?.transcript ?? "";
    if (!transcript) return;

    setVoiceDebugText(transcript, { interim: true });

    if (
      state.voiceInputMode === "solve" &&
      el.solveDialog.open
    ) {
      el.solveInput.value = transcript;
    }
  }

  function handleVoiceFinal(payload) {
    if (!state.voiceActive) return;

    const transcript =
      payload?.alternatives?.[0]?.transcript?.trim() ?? "";

    if (transcript) {
      setVoiceDebugText(transcript);
    }

    if (state.voiceIgnoreNextFinal) {
      state.voiceIgnoreNextFinal = false;
      return;
    }

    if (
      state.voiceInputMode === "solve" &&
      transcript
    ) {
      setVoiceDebugEvent("MEGFEJTÉS · FELISMERVE");
      submitVoiceSolve(transcript);
    }
  }

  async function ensureVoiceEngine() {
    if (state.voiceEngine) {
      return state.voiceEngine;
    }

    if (!state.voiceModulePromise) {
      state.voiceModulePromise = Promise.all([
        import("./speech/voice-engine.js"),
        import("./speech/parsers.js")
      ]);
    }

    const [engineModule, parserModule] =
      await state.voiceModulePromise;

    state.voiceParseLetter = parserModule.parseLetter;

    const runtimeConfig = {
      ...VOICE_CONFIG,
      recognition: {
        ...VOICE_CONFIG.recognition,
        language:
          userSettings.speechLanguage ||
          VOICE_CONFIG.recognition?.language ||
          "hu-HU"
      }
    };

    state.voiceEngine = new engineModule.VoiceEngine(
      runtimeConfig,
      {
        onState: handleVoiceEngineState,
        onInterim: handleVoiceInterim,
        onFinal: handleVoiceFinal,
        onVoiceEvent: handleVoiceEvent,
        onError: handleVoiceError
      }
    );

    return state.voiceEngine;
  }

  async function createVoiceAudioTrack() {
    const preferredId = userSettings.microphoneDeviceId;
    let stream = null;

    if (preferredId) {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            deviceId: { exact: preferredId }
          },
          video: false
        });
      } catch (error) {
        if (error?.name !== "OverconstrainedError" &&
            error?.name !== "NotFoundError") {
          throw error;
        }
      }
    }

    if (!stream) {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false
      });
    }

    state.voiceMediaStream = stream;
    return stream.getAudioTracks()[0] ?? null;
  }

  async function startVoiceListening({
    automatic = false
  } = {}) {
    if (state.voiceActive || state.voiceStartPending) {
      return;
    }

    if (!state.voiceArmed || !voiceOwnerIsCurrentPlayer()) {
      return;
    }

    if (
      automatic &&
      !["wheelResult", "letter"].includes(state.phase)
    ) {
      return;
    }

    if (!automatic && !voiceRuntimeCanStart()) {
      return;
    }

    if (!userSettings.speechRecognitionEnabled) {
      voiceFeedback(
        "Kapcsold be a hangfelismerést a Beállításokban.",
        "error"
      );
      return;
    }

    if (
      !speechRecognitionSupported() ||
      !microphoneApiSupported()
    ) {
      voiceFeedback(
        "A böngésző nem támogatja a hangfelismerést.",
        "error"
      );
      return;
    }

    const sessionToken = ++state.voiceSessionToken;
    state.voiceStartPending = true;
    state.voiceEngineState = "starting";
    setVoiceDebugText(
      automatic
        ? "Mikrofon automatikus visszakapcsolása…"
        : "Mikrofon indítása…"
    );
    setVoiceDebugEvent("–");
    updateVoiceRuntimeUi();

    try {
      const engine = await ensureVoiceEngine();

      if (!engine.isSupported()) {
        throw new Error(
          "A SpeechRecognition provider nem támogatott."
        );
      }

      const track = await createVoiceAudioTrack();

      if (
        sessionToken !== state.voiceSessionToken ||
        !state.voiceArmed ||
        !voiceOwnerIsCurrentPlayer() ||
        (
          automatic &&
          !["wheelResult", "letter"].includes(state.phase)
        )
      ) {
        stopVoiceMediaStream();
        return;
      }

      state.voiceActive = true;
      engine.start(track);
      setVoiceDebugEvent(
        automatic
          ? "MIKROFON · VISSZAKAPCSOLVA"
          : "MIKROFON · BEKAPCSOLVA"
      );
      updateVoiceRuntimeUi();
    } catch (error) {
      if (sessionToken !== state.voiceSessionToken) {
        return;
      }

      state.voiceActive = false;
      state.voiceEngineState = "error";
      stopVoiceMediaStream();
      setVoiceDebugText(
        `Mikrofonindítási hiba: ${error?.message ?? error}`
      );
      setVoiceDebugEvent("HIBA · INDÍTÁS");
      el.voiceDebugPanel.dataset.state = "error";
      voiceFeedback(
        "Nem sikerült elindítani a mikrofont.",
        "error"
      );
    } finally {
      if (sessionToken === state.voiceSessionToken) {
        state.voiceStartPending = false;
        updateVoiceRuntimeUi();
      }
    }
  }

  async function resumeVoiceAfterWheelStop() {
    if (
      !state.voiceArmed ||
      !voiceOwnerIsCurrentPlayer() ||
      !["wheelResult", "letter"].includes(state.phase)
    ) {
      updateVoiceRuntimeUi();
      return;
    }

    await startVoiceListening({ automatic: true });
  }

  async function toggleVoiceListening() {
    const player = currentPlayer();

    if (!player || player.isBot) {
      return;
    }

    if (state.voiceActive) {
      stopVoiceListening({ abort: true });
      setVoiceDebugText("Mikrofon kikapcsolva.");
      setVoiceDebugEvent("–");
      return;
    }

    if (
      state.voiceArmed &&
      state.voiceOwnerName === player.name
    ) {
      await startVoiceListening({ automatic: false });
      return;
    }

    stopVoiceListening({ abort: true });
    state.voiceArmed = true;
    state.voiceOwnerName = player.name;
    setVoiceDebugText(
      `${player.name} mikrofonja bekapcsolásra kész.`
    );
    await startVoiceListening({ automatic: false });
  }

  function resetVoiceRuntimeForGame() {
    stopVoiceListening({ abort: true });
    state.voiceEngine = null;
    state.voiceEngineState = "idle";
    state.voiceArmed = false;
    state.voiceOwnerName = null;
    state.voiceSessionToken += 1;
    state.voiceInputMode = null;
    state.voiceIgnoreNextFinal = false;
    state.voiceSolveDialogOwned = false;

    setVoiceDebugText(
      userSettings.speechRecognitionEnabled
        ? "Mikrofon kikapcsolva. Kattints a mikrofon gombra."
        : "Hangfelismerés kikapcsolva a Beállításokban."
    );
    setVoiceDebugEvent("–");
    updateVoiceRuntimeUi();
  }

  function nextPlayer(reason = "") {
    state.voiceInputMode = null;
    state.voiceIgnoreNextFinal = false;
    clearTimeout(state.playerTransitionTimer);
    clearTimeout(state.turnReadyTimer);
    clearTimeout(state.botTimer);
    clearTimeout(state.autoSpinTimer);
    state.autoSpinTimer = null;
    state.turnReadyTimer = null;

    suspendVoiceListening(
      "Mikrofon szünetel a következő saját körig."
    );

    const delayMs = Math.max(
      0,
      Number(GAMEPLAY_CONFIG.playerSwitchDelayMs ?? 1000)
    );
    const readyDelayMs = Math.max(
      0,
      Number(GAMEPLAY_CONFIG.turnReadyDelayMs ?? 1000)
    );

    state.phase = "playerTransition";
    state.wheelValue = null;
    updateControls();

    showStageFeedback(
      reason || "Játékosváltás…",
      /helytelen|hibás/i.test(reason) ? "error" : "info",
      delayMs
    );

    setMessage(
      `${reason ? reason + " " : ""}Játékosváltás…`
    );

    state.playerTransitionTimer = setTimeout(() => {
      state.currentIndex =
        (state.currentIndex + 1) % state.players.length;
      state.phase = "turnReady";

      syncGameMusicForCurrentPlayer();
      renderAll();
      updateControls();

      const nextName = currentPlayer().name;
      showStageFeedback(
        `${nextName} következik.`,
        "info",
        readyDelayMs
      );
      setMessage(
        `${nextName} következik. Egy pillanat…`
      );

      if (
        state.voiceArmed &&
        state.voiceOwnerName !== nextName
      ) {
        setVoiceDebugEvent(
          `VÁR · ${state.voiceOwnerName} KÖRÉRE`
        );
      } else if (
        state.voiceArmed &&
        state.voiceOwnerName === nextName
      ) {
        setVoiceDebugEvent(
          "VÁR · PÖRGETÉS UTÁN VISSZAKAPCSOL"
        );
      }

      state.turnReadyTimer = setTimeout(() => {
        state.turnReadyTimer = null;

        if (state.phase !== "turnReady") return;

        state.phase = "spin";
        hideStageFeedback();
        updateControls();

        setMessage(
          `${currentPlayer().name} következik. Pörgess!`
        );

        // Szándékosan nem indítjuk vissza itt a mikrofont.
        // A voice owner körében is csak a pörgetés UTÁN aktiválódik.
        maybeRunTurnAutomation();
      }, readyDelayMs);
    }, delayMs);
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

      state.phase = "letterReveal";
      state.wheelValue = null;
      setMessage(
        `${letter}: ${hits} találat. Nyeremény: ${fmtMoney(award)}. Betűk felfedése…`
      );

      renderAll();
      updateControls();

      if (checkAutoSolved()) {
        return true;
      }

      const revealAnimationMs = Math.max(
        0,
        Number(GAMEPLAY_CONFIG.letterRevealAnimationMs ?? 720)
      );
      const postRevealDelayMs = Math.max(
        0,
        Number(GAMEPLAY_CONFIG.letterRevealPostDelayMs ?? 1000)
      );
      const revealDurationMs =
        ((hits - 1) * LETTER_HIT_GAP_MS) + revealAnimationMs;

      clearTimeout(state.letterRevealTimer);
      state.letterRevealTimer = setTimeout(() => {
        state.letterRevealTimer = null;

        if (state.phase !== "letterReveal") return;

        state.phase = "spin";
        setMessage(
          `${letter}: ${hits} találat. Nyeremény: ${fmtMoney(award)}. Pörgethetsz újra.`
        );
        updateControls();
        maybeRunTurnAutomation();
      }, revealDurationMs + postRevealDelayMs);
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
      maybeRunTurnAutomation();
    } else {
      state.justRevealed.clear();
      playSfx("letterMiss");
      nextPlayer(`${letter} nincs a feladványban.`);
    }

    return true;
  }

  function trySolve(answer, fromBot = false) {
    if (normalize(answer) === state.puzzle.text) {
      finishRound(currentPlayer());
      return true;
    }

    playSfx("solveFail", Number(AUDIO_CONFIG.solveFailVolume ?? 0.72));

    if (!fromBot) {
      nextPlayer("Helytelen megfejtés.");
    } else {
      nextPlayer("A Bot megfejtése hibás volt.");
    }
    return false;
  }

  function finishRound(winner) {
    state.voiceInputMode = null;
    state.voiceIgnoreNextFinal = false;
    suspendVoiceListening(
      "Forduló vége. Mikrofon szünetel."
    );
    startWinnerMusic();
    clearTimeout(state.botTimer);
    clearTimeout(state.turnReadyTimer);
    clearTimeout(state.letterRevealTimer);
    state.turnReadyTimer = null;
    state.letterRevealTimer = null;
    clearTimeout(state.playerTransitionTimer);
    clearTimeout(state.roundEndTimer);
    hideStageFeedback();

    const hiddenLetterCount = [...state.puzzle.text].filter(
      ch => /\p{L}/u.test(ch) && !state.revealed.has(ch)
    ).length;

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

    // Helyes megfejtésnél nincs külön sikerhang.
    // A hátralévő betűk ugyanabban a ritmusban kapják a letter_hit SFX-et,
    // mint ahogy a reveal animáció lefut.
    if (hiddenLetterCount > 0) {
      playHitSequence(hiddenLetterCount);
    }

    renderAll();
    updateControls();

    const revealDurationMs = hiddenLetterCount > 0
      ? ((hiddenLetterCount - 1) * LETTER_HIT_GAP_MS) + 720
      : 0;

    state.roundEndTimer = setTimeout(() => {
      if (state.phase !== "roundEnd") return;
      showVictoryOverlay(winner);
    }, revealDurationMs + 120);
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

  function maybeAutoSpin() {
    clearTimeout(state.autoSpinTimer);
    state.autoSpinTimer = null;

    if (!userSettings.autoSpinEnabled) return;
    if (!document.body.classList.contains("game-active")) return;

    const player = currentPlayer();
    if (!player || player.isBot || state.phase !== "spin") return;

    const delayMs = Math.max(
      0,
      Number(GAMEPLAY_CONFIG.autoSpinDelayMs ?? 900)
    );

    state.autoSpinTimer = setTimeout(() => {
      state.autoSpinTimer = null;

      const activePlayer = currentPlayer();
      if (
        !userSettings.autoSpinEnabled ||
        !activePlayer ||
        activePlayer.isBot ||
        state.phase !== "spin" ||
        !document.body.classList.contains("game-active")
      ) {
        return;
      }

      setMessage(
        `${activePlayer.name}: automatikus pörgetés…`
      );
      spinWheel(false);
    }, delayMs);
  }

  function maybeRunTurnAutomation() {
    maybeRunBot();
    maybeAutoSpin();
  }

  function maybeRunBot() {
    clearTimeout(state.botTimer);
    const p = currentPlayer();
    if (!p?.isBot || state.phase === "roundEnd") return;

    updateControls();

    state.botTimer = setTimeout(() => {
      if (!currentPlayer()?.isBot) return;

      if (revealedRatio() >= Number(BOT_CONFIG.solveRevealRatio ?? 0.72) && Math.random() < Number(BOT_CONFIG.solveChance ?? 0.45)) {
        setMessage("Bot megpróbálja megfejteni…");
        setTimeout(() => trySolve(state.puzzle.text, true), Number(BOT_CONFIG.solveDelayMs ?? 700));
        return;
      }

      if (
        p.roundMoney >= VOWEL_PRICE &&
        Math.random() < Number(BOT_CONFIG.vowelBuyChance ?? 0.18) &&
        [...VOWELS].some(ch => !state.usedLetters.has(ch))
      ) {
        const vowel = randomUnusedVowel();
        setMessage(`Bot magánhangzót vásárol: ${vowel}`);
        setTimeout(() => buyVowel(vowel, true), Number(BOT_CONFIG.vowelDelayMs ?? 550));
        return;
      }

      if (state.phase === "spin") {
        setMessage("Bot pörget…");
        spinWheel(true);
      }
    }, Number(BOT_CONFIG.actionDelayMs ?? 900));
  }

  function escapeHtml(str) {
    return String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  class VictoryScene extends Phaser.Scene {
    constructor() {
      super("VictoryScene");
      this.burstEvent = null;
      this.stopEvent = null;
      this.ready = false;
    }

    create() {
      this.ready = true;
    }

    createBurst() {
      const width = this.scale.width;
      const height = this.scale.height;
      const colors = Array.isArray(VICTORY_CONFIG.colors) &&
        VICTORY_CONFIG.colors.length
          ? VICTORY_CONFIG.colors
          : ["#FFD85A", "#FFF4C2", "#64B5FF", "#4BE0D1"];

      const cx = Phaser.Math.Between(
        Math.round(width * .14),
        Math.round(width * .86)
      );
      const cy = Phaser.Math.Between(
        Math.round(height * .10),
        Math.round(height * .50)
      );
      const count = Math.max(
        8,
        Math.floor(Number(VICTORY_CONFIG.particlesPerBurst ?? 28))
      );

      for (let i = 0; i < count; i += 1) {
        const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
        const distance = Phaser.Math.Between(90, 225);
        const radius = Phaser.Math.FloatBetween(2.2, 5.4);
        const colorHex = colors[i % colors.length];
        const color = Phaser.Display.Color.HexStringToColor(colorHex).color;

        const particle = this.add.circle(cx, cy, radius, color, 1);
        const targetX = cx + Math.cos(angle) * distance;
        const targetY =
          cy + Math.sin(angle) * distance + Phaser.Math.Between(12, 80);

        this.tweens.add({
          targets: particle,
          x: targetX,
          y: targetY,
          alpha: 0,
          scale: .2,
          duration: Phaser.Math.Between(760, 1320),
          ease: "Cubic.easeOut",
          onComplete: () => particle.destroy()
        });
      }
    }

    startCelebration() {
      this.stopCelebration();

      if (VICTORY_CONFIG.fireworks === false) return;

      const burstIntervalMs = Math.max(
        180,
        Number(VICTORY_CONFIG.burstIntervalMs ?? 480)
      );
      const durationMs = Math.max(
        burstIntervalMs,
        Number(VICTORY_CONFIG.fireworksDurationMs ?? 3500)
      );

      this.createBurst();
      this.time.delayedCall(180, () => this.createBurst());

      this.burstEvent = this.time.addEvent({
        delay: burstIntervalMs,
        loop: true,
        callback: () => this.createBurst()
      });

      this.stopEvent = this.time.delayedCall(durationMs, () => {
        if (this.burstEvent) {
          this.burstEvent.remove(false);
          this.burstEvent = null;
        }
        this.stopEvent = null;
      });
    }

    stopCelebration() {
      if (this.burstEvent) {
        this.burstEvent.remove(false);
        this.burstEvent = null;
      }

      if (this.stopEvent) {
        this.stopEvent.remove(false);
        this.stopEvent = null;
      }

      this.tweens.killAll();

      [...this.children.list].forEach(child => child.destroy());
    }
  }

  const victoryGame = new Phaser.Game({
    type: Phaser.AUTO,
    parent: "victoryFx",
    width: 1000,
    height: 600,
    transparent: true,
    scene: [VictoryScene],
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH
    },
    render: {
      antialias: true,
      transparent: true
    }
  });

  function getVictoryScene() {
    return victoryGame.scene.getScene("VictoryScene");
  }

  function renderVictoryStandings(winner) {
    el.victoryStandingsList.replaceChildren();

    state.players.forEach(player => {
      const card = document.createElement("article");
      card.className = "victory-standing-player";

      if (player === winner) {
        card.classList.add("is-winner");
      }

      const avatar = document.createElement("div");
      avatar.className = "victory-standing-avatar";

      const image = document.createElement("img");
      setPlayerAvatar(image, player.name);
      avatar.appendChild(image);

      const copy = document.createElement("div");
      copy.className = "victory-standing-copy";

      const nameRow = document.createElement("div");
      nameRow.className = "victory-standing-name-row";

      const name = document.createElement("strong");
      name.className = "victory-standing-name";
      name.textContent = player.name;
      nameRow.appendChild(name);

      if (player === winner) {
        const badge = document.createElement("span");
        badge.className = "victory-standing-badge";
        badge.textContent = "FORDULÓ NYERTESE";
        nameRow.appendChild(badge);
      }

      const money = document.createElement("strong");
      money.className = "victory-standing-money";
      money.textContent = fmtMoney(player.totalMoney);

      const caption = document.createElement("span");
      caption.className = "victory-standing-caption";
      caption.textContent = "EDDIG MEGNYERT PÉNZ";

      copy.append(nameRow, money, caption);
      card.append(avatar, copy);
      el.victoryStandingsList.appendChild(card);
    });
  }

  function showVictoryOverlay(winner) {
    clearTimeout(state.victoryButtonTimer);

    setPlayerAvatar(el.victoryAvatar, winner.name);
    el.victoryTitle.textContent =
      `${winner.name} MEGFEJTETTE!`.toLocaleUpperCase("hu-HU");
    el.victoryPuzzle.textContent = state.puzzle.text;
    el.victoryRoundMoney.textContent = fmtMoney(winner.roundMoney);
    el.victoryTotalMoney.textContent = fmtMoney(winner.totalMoney);

    // A standings csak a már megnyert összeget mutatja.
    // Az aktuális, még meg nem nyert roundMoney nem kerül bele.
    renderVictoryStandings(winner);

    el.victoryActions.classList.remove("ready");
    el.victoryOverlay.classList.add("open");
    el.victoryOverlay.setAttribute("aria-hidden", "false");

    getVictoryScene()?.startCelebration();

    const buttonDelayMs = Math.max(
      0,
      Number(VICTORY_CONFIG.buttonDelayMs ?? 1800)
    );

    state.victoryButtonTimer = setTimeout(() => {
      if (state.phase !== "roundEnd") return;
      el.victoryActions.classList.add("ready");
    }, buttonDelayMs);
  }

  function hideVictoryOverlay() {
    clearTimeout(state.victoryButtonTimer);
    el.victoryActions.classList.remove("ready");
    el.victoryOverlay.classList.remove("open");
    el.victoryOverlay.setAttribute("aria-hidden", "true");
    getVictoryScene()?.stopCelebration();
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
      this.load.image("wheel-face", WHEEL_CONFIG.image ?? "assets/images/wheel.png");
    }

    create() {
      const canvasSize = Number(WHEEL_CONFIG.canvasSize ?? 600);
      const cx = canvasSize / 2;
      const cy = canvasSize / 2;
      const wheelSize = Number(WHEEL_CONFIG.wheelSize ?? 536);
      const labelRadius = Number(WHEEL_CONFIG.labelRadius ?? 188);
      const wheelScale = Math.max(0.1, Number(WHEEL_CONFIG.scale ?? 1));
      const startOffsetDeg = Number(WHEEL_CONFIG.startOffsetDeg ?? -90);

      this.wheelContainer = this.add.container(cx, cy);
      this.wheelContainer.setScale(wheelScale);

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
          fontFamily: WHEEL_CONFIG.labelFontFamily ?? "Arial Black, Arial, sans-serif",
          fontStyle: "bold",
          fontSize:
            segment.label.length > Number(WHEEL_CONFIG.longLabelThreshold ?? 7)
              ? `${Number(WHEEL_CONFIG.longLabelFontSizePx ?? 11)}px`
              : `${Number(WHEEL_CONFIG.labelFontSizePx ?? 15)}px`,
          color: WHEEL_CONFIG.labelColor ?? "#ffffff",
          stroke: WHEEL_CONFIG.labelStrokeColor ?? "#10152f",
          strokeThickness: Number(WHEEL_CONFIG.labelStrokeThickness ?? 4),
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

      const startOffsetDeg = Number(WHEEL_CONFIG.startOffsetDeg ?? -90);
      const pointerAngleDeg = Number(WHEEL_CONFIG.pointerAngleDeg ?? -90);
      const localCenter =
        startOffsetDeg + (index + 0.5) * this.segmentAngle;
      const desiredMod =
        ((pointerAngleDeg - localCenter) % 360 + 360) % 360;
      const currentMod = ((this.rotationDeg % 360) + 360) % 360;
      const delta = (desiredMod - currentMod + 360) % 360;
      const minFullTurns = Math.max(0, Math.floor(Number(WHEEL_CONFIG.minFullTurns ?? 2)));
      const maxFullTurns = Math.max(
        minFullTurns,
        Math.floor(Number(WHEEL_CONFIG.maxFullTurns ?? 3))
      );
      const fullTurns = Phaser.Math.Between(minFullTurns, maxFullTurns);
      const target = this.rotationDeg + fullTurns * 360 + delta;

      this.tweens.killTweensOf(this.wheelContainer);

      this.tweens.add({
        targets: this.wheelContainer,
        angle: target,
        duration: Number(WHEEL_CONFIG.spinDurationMs ?? 3600),
        ease: WHEEL_CONFIG.easing ?? "Cubic.easeOut",
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
    width: Number(WHEEL_CONFIG.canvasSize ?? 600),
    height: Number(WHEEL_CONFIG.canvasSize ?? 600),
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
    el.wheelOverlayResult.textContent = "";
    el.wheelOverlayResult.className = "wheel-overlay-result";
  }

  function closeWheelOverlay() {
    el.wheelOverlay.classList.remove("open");
    el.wheelOverlay.setAttribute("aria-hidden", "true");
    el.wheelOverlayResult.textContent = "";
    el.wheelOverlayResult.className = "wheel-overlay-result";
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
        setTimeout(
          () => handleConsonant(consonant, true),
          Number(BOT_CONFIG.consonantSubmitDelayMs ?? 550)
        );
      }, Number(BOT_CONFIG.consonantAfterWheelDelayMs ?? 650));
    }
  }

  function spinWheel(fromBot = false) {
    if (state.phase !== "spin") return;

    clearTimeout(state.autoSpinTimer);
    state.autoSpinTimer = null;

    if (!fromBot) {
      suspendVoiceListening(
        "Pörgetés alatt a mikrofon automatikusan kikapcsolt."
      );
    }

    state.voiceInputMode = null;
    state.voiceIgnoreNextFinal = false;

    const scene = getWheelScene();
    if (!scene?.ready || !scene.wheelContainer) {
      setMessage("A kerék még betöltődik…");
      state.botTimer = setTimeout(() => spinWheel(fromBot), Number(WHEEL_CONFIG.retryDelayMs ?? 250));
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
    startWheelSpinSound();

    const started = scene.spinTo(index, () => {
      stopWheelSpinSound();
      state.pendingWheelSegment = segment;
      state.phase = "wheelResult";

      const resultText = formatWheelResult(segment)
        .toLocaleUpperCase("hu-HU");

      el.wheelOverlayResult.textContent = resultText;
      el.wheelOverlayResult.className =
        "wheel-overlay-result show " + segment.type;

      setMessage(
        `A kerék eredménye: ${formatWheelResult(segment)}.`
      );
      updateControls();

      if (!fromBot) {
        void resumeVoiceAfterWheelStop();
      }

      clearTimeout(state.wheelConfirmTimer);
      state.wheelConfirmTimer = setTimeout(
        applyPendingWheelResult,
        Number(WHEEL_CONFIG.resultDisplayMs ?? 1500)
      );
    });

    if (!started) {
      stopWheelSpinSound();
      state.phase = "spin";
      closeWheelOverlay();
      updateControls();
      setMessage("A kerék nem áll készen. Próbáld újra.");

      if (
        !fromBot &&
        state.voiceArmed &&
        voiceOwnerIsCurrentPlayer()
      ) {
        void startVoiceListening({ automatic: false });
      }
    }
  }

  el.difficultySelector.addEventListener("click", event => {
    const button = event.target.closest("[data-difficulty]");
    if (!button || !el.difficultySelector.contains(button)) {
      return;
    }

    setPuzzleDifficulty(button.dataset.difficulty);
  });

  el.startGameBtn.addEventListener("click", startGame);

  el.gameMusicToggleBtn.addEventListener("click", () => {
    userSettings.gameMusicEnabled =
      !userSettings.gameMusicEnabled;

    persistUserSettings(userSettings);
    updateGameMusicToggleUi();

    if (userSettings.gameMusicEnabled) {
      startGameMusic();
    } else {
      stopMusicTrack("game", {
        fadeMs: Number(MUSIC_CONFIG.game?.fadeOutMs ?? 350),
        reset: false
      });
    }
  });

  el.voiceMicBtn.addEventListener(
    "click",
    () => void toggleVoiceListening()
  );
  el.settingsBtn.addEventListener("click", showSettingsScreen);
  el.settingsBackBtn.addEventListener("click", () => {
    populateSettingsForm();
    showSetupScreen();
  });
  el.settingsSaveBtn.addEventListener("click", saveSettings);
  el.masterVolumeSetting.addEventListener(
    "input",
    updateMasterVolumeLabel
  );

  [
    el.wheelSpinVolumeSetting,
    el.lobbyMusicVolumeSetting,
    el.winnerMusicVolumeSetting,
    el.gameMusicVolumeSetting
  ].forEach(input => {
    input.addEventListener("input", updateMusicVolumeLabels);
  });
  el.refreshSpeechMicrophonesBtn.addEventListener(
    "click",
    () => void refreshSpeechMicrophones({
      requestPermission: true
    })
  );

  navigator.mediaDevices?.addEventListener?.(
    "devicechange",
    () => {
      if (!el.settingsScreen.classList.contains("hidden")) {
        void refreshSpeechMicrophones({
          requestPermission: false
        });
      }
    }
  );

  el.spinBtn.addEventListener("click", () => spinWheel(false));

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
    state.voiceInputMode = null;
    state.voiceSolveDialogOwned = false;
    state.voiceIgnoreNextFinal = false;
    el.solveInput.value = "";
    el.solveInput.placeholder = "";
    el.solveDialog.showModal();
    setTimeout(() => el.solveInput.focus(), 0);
  });

  el.solveForm.addEventListener("submit", e => {
    e.preventDefault();

    const answer = el.solveInput.value;
    if (!answer.trim()) return;

    state.voiceInputMode = null;
    state.voiceSolveDialogOwned = false;
    state.voiceIgnoreNextFinal = false;
    el.solveInput.placeholder = "";
    el.solveDialog.close();

    requestAnimationFrame(() => {
      trySolve(answer, false);
    });
  });

  el.solveDialog.addEventListener("close", () => {
    if (state.voiceInputMode === "solve") {
      state.voiceInputMode = null;
      state.voiceSolveDialogOwned = false;
      state.voiceIgnoreNextFinal = false;
      el.solveInput.placeholder = "";
      hideStageFeedback();
      setVoiceDebugEvent("MEGFEJTÉS · MEGSZAKÍTVA");
    }
  });

  el.nextRoundBtn.addEventListener("click", () => {
    hideVictoryOverlay();
    state.currentIndex = (state.currentIndex + 1) % state.players.length;
    setTimeout(newRound, 0);
  });

  el.victoryEndGameBtn.addEventListener("click", () => {
    hideVictoryOverlay();
    returnToLobby();
  });

  function returnToLobby() {
    stopVoiceListening({ abort: true });
    state.voiceEngine = null;

    stopWheelSpinSound();
    stopWinnerMusic();
    stopMusicTrack("game", {
      fadeMs: Number(MUSIC_CONFIG.game?.fadeOutMs ?? 350),
      reset: false
    });
    clearTimeout(state.botTimer);
    clearTimeout(state.autoSpinTimer);
    clearTimeout(state.turnReadyTimer);
    clearTimeout(state.letterRevealTimer);
    state.autoSpinTimer = null;
    state.turnReadyTimer = null;
    state.letterRevealTimer = null;
    clearTimeout(state.wheelConfirmTimer);
    clearTimeout(state.playerTransitionTimer);
    clearTimeout(state.roundEndTimer);
    clearTimeout(state.victoryButtonTimer);
    clearTimeout(state.feedbackTimer);
    hideVictoryOverlay();
    hideStageFeedback();
    state.pendingWheelSegment = null;
    state.pendingWheelFromBot = false;
    closeWheelOverlay();
    state.phase = "setup";
    document.body.classList.remove("game-active");
    document.body.classList.add("lobby-active");
    el.gameScreen.classList.add("hidden");
    el.settingsScreen.classList.add("hidden");
    el.setupScreen.classList.remove("hidden");
    el.message.textContent = "";
    updateVoiceRuntimeUi();
    startLobbyMusic();
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
