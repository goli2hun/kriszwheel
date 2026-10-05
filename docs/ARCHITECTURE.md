# KriszWheel – architektúra

## 1. Alapelv

A projekt build nélküli frontend alkalmazás.

Technológia:

- HTML
- CSS
- vanilla JavaScript
- SVG
- Phaser 3.90

Nincs backend, bundler vagy framework.

## 2. Betöltés

```html
<script src="config/game-config.js"></script>
<script src="app.js"></script>
```

A sorrend kötelező.

A config létrehozza:

`window.KRISZWHEEL_CONFIG`

Az `app.js` aliasai:

- `CONFIG`
- `GAMEPLAY_CONFIG`
- `WHEEL_CONFIG`
- `BOT_CONFIG`
- `AUDIO_CONFIG`
- `VICTORY_CONFIG`
- `DEBUG_CONFIG`

## 3. Fő fájlok

### index.html

DOM, lobby, Beállítások nézet, overlayek, dialogok, scriptbetöltés.

### styles.css

Lobby, Beállítások UI, stage, hotspotok, puzzle, wheel overlay, feedback,
victory overlay.

### app.js

Játékszabály, state machine, render, Phaser scene-ek, Bot, hangok és a
böngészőben tárolt felhasználói beállítások kezelése.

### config/game-config.js

Hangolható paraméterek.

## 4. State

Fontos mezők:

```text
players
currentIndex
puzzle
usedLetters
revealed
phase
wheelValue
lastPuzzleIndex
botTimer
wheelConfirmTimer
playerTransitionTimer
roundEndTimer
victoryButtonTimer
feedbackTimer
roundNumber
justRevealed
pendingWheelSegment
pendingWheelFromBot
```

## 5. Phase értékek

- `setup` – lobby
- `spin` – pörgethető
- `spinning` – kerék mozog
- `wheelResult` – megállt eredmény látszik
- `letter` – mássalhangzót vár
- `playerTransition` – váltási szünet
- `roundEnd` – megfejtett forduló, felfedés / victory

## 6. Phaser scene-ek

Két külön Phaser instance fut.

### WheelScene

Feladata:

- wheel PNG betöltés;
- cikkelyfeliratok;
- fix mutató;
- célpozícióra forgatás.

### VictoryScene

Feladata:

- tűzijáték burstök;
- Phaser circle részecskék;
- tweenes kifutás és fade;
- konfigurálható színek és sűrűség.

A két scene külön canvasban működik.

## 7. Kerékmodell

Logikai mező:

```js
{
  label: "5 000",
  type: "money",
  value: 5000
}
```

Típus:

- money
- bankrupt
- skip

Tényleges cikkelyszám:

```text
segments.length × segmentRepeat
```

Jelenleg:

`12 × 2 = 24`

## 8. Kerék célpozíció

A számítás figyelembe veszi:

- `startOffsetDeg`;
- `pointerAngleDeg`;
- segment index;
- aktuális rotáció;
- teljes fordulatok.

Így a logikai eredmény és a vizuális megállás egyezik.

## 9. Puzzle render

A `STAGE_GRID` a 15 × 4 képi cella geometriája.

A `layoutPuzzleRows()` tördel.

A `renderPuzzle()`:

1. vízszintesen középre igazítja a sort;
2. a teljes sorblokkot függőlegesen középre teszi;
3. SVG rectet rajzol;
4. SVG textként rajzolja a betűt;
5. új találatnál késleltetett animációt ad.

## 10. Billentyűkezelés

Globális `keydown`.

Nem kezel betűt, ha:

- modifier aktív;
- repeat esemény;
- nem aktív a game screen;
- input/textarea/select/contentEditable aktív;
- dialog nyitva van;
- Bot van soron.

## 11. Játékosváltás

A `nextPlayer()` előbb `playerTransition` állapotba lép.

Csak a timer végén változik a `currentIndex`.

Ez megakadályozza az azonnali avatar- és turn-váltást.

## 12. Megfejtés és victory

A solve form submit:

1. bezárja a dialogot;
2. utána értékel.

Helyes válaszkor a `finishRound()` kiszámolja a még animálandó betűhelyek
számát, majd csak a felfedés után hívja a `showVictoryOverlay()` függvényt.

A `renderVictoryStandings(winner)` a `state.players` listából építi fel a
játékállást, és szándékosan csak a `totalMoney` értéket olvassa. A
`roundMoney` nem kerül bele az összesítőbe.

## 13. UI rétegrend

```text
stage PNG
  ↓
SVG puzzle
  ↓
category / used letters / player panel
  ↓
image hotspots
  ↓
feedback / debug / game end
  ↓
wheel overlay
  ↓
victory overlay
```

## 14. Hang és zene

### SFX

A rövid hanghatások `Audio` cache-ből mennek. Lejátszáskor `cloneNode()`
készül, ezért az egymást követő találati hangok nem vágják le egymást.

### Hosszú zenei sávok

A tartós sávok külön `Audio` objektumot használnak:

```text
wheelSpin
lobby
winner
game
```

A `MUSIC_TRACK_DEFS` köti össze a configot a user setting enable flaggel és
hangerővel. Fő runtime műveletek:

- `playMusicTrack()`
- `stopMusicTrack()`
- `fadeMusicTo()`
- `syncMusicForCurrentScreen()`
- `setGameMusicDucked()`

Életciklus:

```text
lobby -> lobby music
startGame -> lobby fade out + game music
spinWheel -> wheelSpin start
wheel stop -> wheelSpin stop
finishRound -> game fade out + winner fade in
newRound -> winner stop + game music
returnToLobby -> game/winner/wheel stop + lobby music
```

A game music célhangerő elsőként azt vizsgálja, hogy a voice owner van-e
soron. Ha igen:

```text
gameMusicVolume × masterVolume × voiceOwnerTurnMultiplier
```

Alapból `voiceOwnerTurnMultiplier = 0`, tehát a saját kör teljesen néma.

Más esetben aktív / induló mikrofon mellett a normál
`microphoneDuckMultiplier` érvényes.

A lobby music indulását autoplay policy blokkolhatja; az első `pointerdown`
vagy `keydown` újrapróbálja a képernyőhöz tartozó zenei szinkront.

## 15. Kompatibilitási réteg

A `.stage-logic-bridge` még megtart néhány régi, offscreen DOM elemet:

- playersList;
- activePlayerText;
- message.

Későbbi refaktorban eltávolítható.

## 16. Felhasználói beállítások

A statikus `config/game-config.js` és a felhasználói beállítások külön
fogalmak.

A felhasználói beállítások kulcsa:

`kriszwheel.user-settings.v1`

Jelenlegi mezők:

```text
soundsEnabled
masterVolume
autoSpinEnabled
puzzleMode
wheelSpinSoundEnabled
wheelSpinVolume
lobbyMusicEnabled
lobbyMusicVolume
winnerMusicEnabled
winnerMusicVolume
gameMusicEnabled
gameMusicVolume
speechRecognitionEnabled
speechProvider
speechLanguage
microphoneDeviceId
```

Betöltéskor az `app.js` biztonságos fallbacket használ, ha a
`localStorage` nem érhető el vagy hibás adatot tartalmaz.

Az `autoSpinEnabled` runtime automatizmus külön `autoSpinTimer`-t használ,
így nem ütközik a Bot `botTimer` kezelésével.

A `puzzleMode` jelenleg kizárólag perzisztált preference; a
`pickPuzzle()` nem olvassa.

A `playSfx()`:

1. figyelembe veszi a `soundsEnabled` kapcsolót;
2. az egyedi SFX hangerőt megszorozza a `masterVolume` értékkel;
3. 0–1 tartományra clampeli az eredményt.

A Hangfelismerés lobby-beállításai működnek. A játék közbeni listening
állapotot külön runtime mikrofon gomb vezérli; a hangfelismerés nem indul el
automatikusan.

## 17. Voice recognition alrendszer

Reusable modulok:

```text
config/voice-config.js
speech/provider.js
speech/browser-provider.js
speech/parsers.js
speech/voice-engine.js
```

A klasszikus `app.js` a runtime engine-et dinamikus `import()`-tal tölti,
így a fő alkalmazást nem kellett ES module-ra átírni.

Runtime állapotok a központi state-ben:

```text
voiceEngine
voiceModulePromise
voiceParseLetter
voiceMediaStream
voiceActive
voiceStartPending
voiceEngineState
voiceArmed
voiceOwnerName
voiceSessionToken
voiceInputMode
voiceIgnoreNextFinal
voiceSolveDialogOwned
```

A voice adapter kizárólag a meglévő játékműveleteket hívja:

- `spinWheel()`;
- `buyVowel()`;
- `handleConsonant()`;
- `trySolve()`.

A kiválasztott mikrofonból `getUserMedia()` stream készül. A track átadásra
kerül a BrowserSpeechProvidernek; ha az adott böngésző nem támogatja a
track-paraméteres `SpeechRecognition.start()` hívást, a provider saját
fallbackje lép életbe.

A mikrofon gomb runtime kapcsoló, a lobby
`speechRecognitionEnabled` értéke pedig master engedély.

Voice owner modell:

- manuális bekapcsoláskor `voiceOwnerName` az aktuális emberi játékos;
- `voiceArmed` megőrzi a tulajdonost akkor is, amikor a listening szünetel;
- `nextPlayer()` és `spinWheel()` preserve-arm leállítást végez;
- a Phaser kerék megállásakor `resumeVoiceAfterWheelStop()` owner esetén
  már `wheelResult` fázisban visszaindíthatja a VoiceEngine-et;
- `voiceSessionToken` megakadályozza, hogy egy későn visszatérő async
  `getUserMedia()` hívás rossz körben újraindítsa a mikrofont.

## 18. Fontos invariánsok

- config mindig az app előtt töltődjön;
- wheel segment count egyezzen a PNG cikkelyszámmal;
- stage háttércsere után koordinátákat újra kell mérni;
- timer-eket forduló/játék vége előtt törölni kell;
- Bot ne kapjon emberi inputot;
- solve dialog záródjon az értékelés előtt;
- victory csak a betűfelfedés után jelenjen meg.
