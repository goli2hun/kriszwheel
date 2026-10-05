window.KRISZWHEEL_CONFIG = {
  app: {
    version: "0.8.0",
    buildDate: "2026.10.05"
  },

  gameplay: {
    // Egy magánhangzó ára.
    vowelPrice: 5000,

    // Több azonos betű esetén ennyi idő telik el az egyes
    // felvillanások és hangok között.
    letterHitGapMs: 500,

    // Egy betű felfedési animációjának hossza.
    letterRevealAnimationMs: 720,

    // Sikeres mássalhangzó után, az utolsó betű teljes felfedését követően
    // még ennyit várunk, mielőtt újra engedélyezzük / automatizáljuk a pörgetést.
    letterRevealPostDelayMs: 1000,

    // Játékosváltáskor ennyi ideig marad látható az előző kör visszajelzése,
    // mielőtt a következő játékos neve megjelenik.
    playerSwitchDelayMs: 1000,

    // Miután a következő játékos már megjelent, még ennyi ideig várunk,
    // mielőtt a spin fázis és az automatizmusok ténylegesen aktívak lesznek.
    turnReadyDelayMs: 1000,

    // Bekapcsolt Auto pörgetésnél ennyit várunk, mielőtt egy emberi
    // játékos spin fázisában automatikusan elindul a kerék.
    autoSpinDelayMs: 900
  },

  puzzles: {
    // Éles módban a lobby nehézségválasztója ezekre a CSV-kre mutat.
    // UI mapping: Gyerek -> child, Könnyű -> easy, Közepes -> medium, Nehéz -> hard.
    files: {
      child: "data/child.csv",
      easy: "data/low.csv",
      medium: "data/med.csv",
      hard: "data/high.csv"
    },

    // Induláskor legalább ennyi érvényes feladványt várunk a kiválasztott fájlban.
    expectedCountPerDifficulty: 100
  },

  wheel: {
    // Grafika és Phaser canvas.
    image: "assets/images/wheel.png",
    canvasSize: 600,

    // A teljes kerék (grafika + feliratok) méretszorzója.
    // 1.00 = eredeti méret, 1.10 = 10%-kal nagyobb.
    scale: 1.10,

    wheelSize: 536,
    labelRadius: 188,

    // A képi cikkelyek tájolása. -90 fok = a 0. cikkely felül indul.
    startOffsetDeg: -90,
    pointerAngleDeg: -90,

    // Pörgetés karaktere.
    minFullTurns: 2,
    maxFullTurns: 3,
    spinDurationMs: 3600,
    easing: "Cubic.easeOut",

    // Megállás után ennyi ideig látszik középen az eredmény.
    resultDisplayMs: 1500,

    // Ha a Phaser scene még nem áll készen, ennyi idő múlva próbálja újra.
    retryDelayMs: 250,

    // A Phaserrel rárajzolt mezőfeliratok.
    labelFontFamily: "Arial Black, Arial, sans-serif",
    labelFontSizePx: 15,
    longLabelFontSizePx: 11,
    longLabelThreshold: 7,
    labelColor: "#ffffff",
    labelStrokeColor: "#10152f",
    labelStrokeThickness: 4,

    // A 24 képi cikkelyhez a 12 mező kétszer fut körbe.
    // Más kerék esetén a repeat és a segments együtt módosítható.
    segmentRepeat: 2,
    segments: [
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
    ]
  },

  bot: {
    // Általános gondolkodási késleltetés.
    actionDelayMs: 900,

    // Ekkora felfedettségtől próbálkozhat megfejtéssel.
    solveRevealRatio: 0.72,
    solveChance: 0.45,
    solveDelayMs: 700,

    // Magánhangzó-vásárlás esélye.
    vowelBuyChance: 0.18,
    vowelDelayMs: 550,

    // Kerék után a mássalhangzó kiválasztásának ütemezése.
    consonantAfterWheelDelayMs: 650,
    consonantSubmitDelayMs: 550
  },

  audio: {
    defaultVolume: 0.70,
    letterHitVolume: 0.72,
    solveFailVolume: 0.72,

    files: {
      letterHit: "assets/sound/sfx/letter_hit.wav",
      letterMiss: "assets/sound/sfx/letter_miss.mp3",
      solveFail: "assets/sound/sfx/solve_fail.wav"
    },

    music: {
      wheelSpin: {
        file: "assets/sound/sfx/wheel_spinning.mp3",
        defaultEnabled: true,
        defaultVolume: 0.65,
        loop: true,
        fadeOutMs: 120
      },

      lobby: {
        file: "assets/sound/sfx/lobby_music.mp3",
        defaultEnabled: true,
        defaultVolume: 0.30,
        loop: true,
        fadeInMs: 650,
        fadeOutMs: 350
      },

      winner: {
        file: "assets/sound/sfx/winner_music.mp3",
        defaultEnabled: true,
        defaultVolume: 0.75,
        loop: true,
        fadeInMs: 2600,
        fadeOutMs: 300
      },

      game: {
        file: "assets/sound/sfx/game_music.mp3",
        defaultEnabled: true,
        defaultVolume: 0.20,
        loop: true,
        fadeInMs: 700,
        fadeOutMs: 350,

        // Aktív mikrofon mellett a játékzene ennyiszeres hangerőre halkul.
        microphoneDuckMultiplier: 0.10,
        microphoneDuckFadeMs: 220,
        microphoneRestoreFadeMs: 650,

        // Ha a voice owner van soron, a játékzene teljesen elnémul.
        // 0 = néma, 1 = normál hangerő.
        voiceOwnerTurnMultiplier: 0,
        voiceOwnerTurnFadeMs: 180
      }
    }
  },

  victory: {
    // Phaser tűzijáték a győzelmi képernyő mögött.
    fireworks: true,
    fireworksDurationMs: 3500,
    burstIntervalMs: 480,
    particlesPerBurst: 28,

    // A győzelmi képernyő gombjai csak ennyi idő után válnak aktívvá.
    buttonDelayMs: 1800,

    colors: [
      "#FFD85A",
      "#FFF4C2",
      "#64B5FF",
      "#4BE0D1",
      "#A98BFF",
      "#FF7E9E"
    ]
  },

  debug: {
    // false esetén a Teszt gomb eltűnik a játékszínpadról.
    showTestButton: true
  }
};
