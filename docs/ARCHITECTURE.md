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
<script src="config/voice-config.js"></script>
<script src="config/game-config.js"></script>
<script src="app.js"></script>
```

A sorrend kötelező.

A config létrehozza:

`window.KRISZWHEEL_CONFIG`

Az `app.js` fontos config aliasai:

- `CONFIG`
- `APP_CONFIG`
- `GAMEPLAY_CONFIG`
- `PUZZLE_CONFIG`
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

Hangolható paraméterek, alkalmazás metaadatok és az éles CSV
feladványforrások mappingje.

### data/*.csv

A négy éles feladványkészlet:

- `child.csv`
- `low.csv`
- `med.csv`
- `high.csv`

Mindegyik `category,puzzle` formátumú, jelenleg 100 feladvánnyal.

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
autoSpinTimer
turnReadyTimer
letterRevealTimer
roundNumber
justRevealed
pendingWheelSegment
pendingWheelFromBot
livePuzzles
livePuzzleSource
```

## 5. Phase értékek

- `setup` – lobby
- `spin` – pörgethető
- `spinning` – kerék mozog
- `wheelResult` – megállt eredmény látszik
- `letter` – mássalhangzót vár
- `letterReveal` – sikeres találat animációja és post-delay fut
- `solveOnly` – nincs több rejtett mássalhangzó; pörgetés tiltott
- `playerTransition` – váltási szünet
- `turnReady` – a következő játékos már látszik, de input még tiltott
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
returnToLobby -> game azonnali stop + winner/wheel stop + lobby music
```

A game music célhangerő azt vizsgálja, hogy a globális mikrofon be van-e
kapcsolva és emberi játékos van-e soron. Ha igen:

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
puzzleDifficulty
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

A `puzzleMode` és `puzzleDifficulty` együtt választják ki a
feladványforrást. Teszt módban a beépített `PUZZLES` lista használódik,
Éles módban a `loadLivePuzzles()` a `puzzles.files` mapping szerinti
CSV-t tölti be. A parse eredménye a `state.livePuzzles` tömbbe kerül.

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
config/hungarian-names.js
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
voiceSessionToken
voiceInputMode
voiceIgnoreNextFinal
voiceSolveDialogOwned
```

A voice adapter kizárólag a meglévő játékműveleteket hívja. A
`currentVoiceLetterConfig()` runtime-ban összefűzi a
`config/voice-config.js` betűszabályait a
`config/hungarian-names.js` névlistájával és a mentett
`advancedNameRecognitionEnabled` kapcsolóval.

A voice adapter kizárólag ezeket a meglévő játékműveleteket hívja:

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

Globális mikrofon modell:

- `voiceArmed` jelzi, hogy a mikrofon globálisan be van kapcsolva;
- bármely emberi játékos módosíthatja ezt az állapotot;
- `currentPlayerCanUseVoice()` csak emberi játékosnál ad igaz értéket;
- Bot körében a mikrofon gomb tiltott és a listening szünetel;
- `nextPlayer()` és `spinWheel()` preserve-arm leállítást végez, így a
  globális bekapcsolt állapot megmarad;
- emberi játékosra visszaérve a VoiceEngine újraindulhat;
- a Phaser kerék megállásakor `resumeVoiceAfterWheelStop()` már
  `wheelResult` fázisban visszaindíthatja a VoiceEngine-et;
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


## 19. Build meta és lobby státusz

A `config/game-config.js` `app.version` és `app.buildDate` értékeit a
`renderLobbyBuildInfo()` jeleníti meg a lobby jobb alsó sarkában. A státusz
dinamikusan hozzáadja a `TESZT` vagy `ÉLES / <NEHÉZSÉG>` jelölést.

Éles módban a tooltip a tényleges CSV-forrást és az elvárt elemszámot is
mutatja.

## 20. Találat utáni időzítés

Sikeres mássalhangzónál a state nem vált azonnal `spin` értékre. A
`letterReveal` fázis alatt a vezérlés tiltott. A timer hossza:

```text
(hits - 1) × letterHitGapMs
+ letterRevealAnimationMs
+ letterRevealPostDelayMs
```

Csak ezután engedélyeződik újra a pörgetés és a turn automation.


## 21. Mássalhangzó-kimerülés

A `hasHiddenConsonants()` nem az ábécé fel nem használt betűit nézi, hanem
az aktuális feladványban még rejtett, nem magánhangzó karaktereket.

Ha nincs ilyen karakter:

- `enterSolveOnlyMode()` törli a Bot és Auto pörgetés timereket;
- `phase = solveOnly`;
- `wheelValue` nullázódik;
- Pörgetés letiltódik;
- megfejtés és magánhangzó-vásárlás megmarad;
- Bot esetén automatikus megfejtési kísérlet indul.

A `spinWheel()` és az Auto/Bot automatizmus külön guardot is tartalmaz,
így versenyhelyzetből sem indulhat új pörgetés.


## 22. Tartós puzzle-előzmény

A `PUZZLE_HISTORY_STORAGE_KEY` értéke:

`kriszwheel.puzzle-history.v1`

A history objektum külön tömböt tart fenn a négy nehézséghez:

```text
child
easy
medium
hard
```

Egy bejegyzés:

```js
{
  index: 42,
  text: "A NORMALIZÁLT FELADVÁNY"
}
```

A `pickPuzzle()` éles módban csak olyan indexek közül választ, amelyek
normalizált szövege még nincs az adott nehézség history-jában. A kiválasztott
feladvány azonnal bekerül a history-ba.

Az index diagnosztikai információ; az ismétlés kizárásának stabil kulcsa a
normalizált szöveg, mert az index CSV-átrendezéskor megváltozhat.

Teljes készletkimerüléskor `PUZZLE_POOL_EXHAUSTED` hiba keletkezik, amit a
`newRound()` kezel: visszalép a lobbyba és felhasználói hibaüzenetet mutat.


## 23. Haladó névfelismerés architektúrája

A névfelismerés konfigurációja külön globális objektum:

`window.KRISZWHEEL_HUNGARIAN_NAMES`

Forrás:

`config/hungarian-names.js`

A parser sorrendje betűfelismeréskor:

1. hagyományos `mint/min` connector keresése;
2. a meglévő connector-kivételek ellenőrzése;
3. connector után az első betű használata;
4. ha nincs connector-alapú találat és a Haladó névfelismerés engedélyezett,
   a transcript teljes szavainak összevetése a névlistával;
5. speciális névfelismerési kivételek kezelése, például
   `Ypszilon` / `ipszilon` → Y.

A teljes szavas egyezés csökkenti a részszavas fals pozitív találatokat.

A beállítás user preference, ezért nem a statikus configban kapcsoljuk ki/be,
hanem a `kriszwheel.user-settings.v1` objektumban tárolódik
`advancedNameRecognitionEnabled` néven.
