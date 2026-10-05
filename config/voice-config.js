// KriszWheel voice-recognition configuration.
// Integrated from goli2hun/voice-recognition @ 6afec468b2231d23594c35a56b88b5273b869733.
window.KRISZWHEEL_VOICE_CONFIG = {
  recognition: {
    language: "hu-HU",
    continuous: true,
    interimResults: true,
    maxAlternatives: 3,
    restartDelayMs: 250
  },

  microphone: {
    preferenceRules: [
      { contains: "mikrofon", score: 30 },
      { contains: "microphone", score: 30 },
      { contains: " mic", score: 30 },
      { contains: "webcam", score: 20 },
      { contains: "c270", score: 20 },
      { contains: "logi", score: 10 },
      { contains: "logitech", score: 10 },
      { contains: "sztereo kevero", score: -100 },
      { contains: "stereo mix", score: -100 },
      { contains: "what u hear", score: -100 },
      { contains: "loopback", score: -100 }
    ],
    defaultDevicePenalty: 2
  },

  runtime: {
    commandFeedbackMs: 1400
  },

  letters: {
    enabled: true,
    connectors: ["mint", "min"],
    exceptions: [
      { value: "Y", after: ["ipszilon"] },
      {
        value: "W",
        before: ["duplavé", "dupla vé"],
        after: ["walter"]
      }
    ]
  },

  commands: [
    {
      id: "SPIN",
      label: "Pörgetés",
      aliases: ["pörgetek", "pörgetnék", "pörgetni", "pörgess", "pörgetés"]
    },
    {
      id: "SOLVE",
      label: "Megfejtés",
      aliases: ["megfejtés", "megfejtem", "megfejteni", "megoldás"]
    },
    {
      id: "VOWEL",
      label: "Magánhangzó",
      aliases: ["magánhangzó", "magánhangzót"]
    },
    {
      id: "GAME",
      label: "Játék",
      aliases: ["játék"]
    }
  ]
};
