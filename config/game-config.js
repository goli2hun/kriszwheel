window.KRISZWHEEL_CONFIG = {
  gameplay: {
    // Egy magánhangzó ára.
    vowelPrice: 5000,

    // Több azonos betű esetén ennyi idő telik el az egyes
    // felvillanások és hangok között.
    letterHitGapMs: 500,

    // Játékosváltáskor ennyi ideig marad látható a visszajelzés,
    // mielőtt a következő játékos aktívvá válik.
    playerSwitchDelayMs: 1000
  },

  wheel: {
    // Grafika és Phaser canvas.
    image: "assets/images/wheel.png",
    canvasSize: 600,
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
