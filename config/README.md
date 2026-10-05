# KriszWheel – konfigurációs referencia

Központi játék-konfiguráció:

`config/game-config.js`

Hangfelismerési konfiguráció:

`config/voice-config.js`

A fájl az `app.js` előtt töltődik be, és ezt hozza létre:

```js
window.KRISZWHEEL_CONFIG
```

## 1. Betöltés

`index.html`:

```html
<script src="config/voice-config.js"></script>
<script src="config/game-config.js"></script>
<script src="app.js"></script>
```

A sorrend kötelező.

## 2. app

### app.version

```js
version: "0.8.0"
```

A lobby jobb alsó build-információjában megjelenő alkalmazásverzió.

### app.buildDate

```js
buildDate: "2026.10.05"
```

A build / tesztcsomag dátuma. A verzióval együtt jelenik meg a lobbyban.

## 3. gameplay

### gameplay.vowelPrice

Típus: szám.

Alap:

```js
vowelPrice: 5000
```

A magánhangzó-vásárlás ára Ft-ban.

A vásárlás az aktuális játékos `roundMoney` értékéből vonódik le.

### gameplay.letterHitGapMs

Típus: szám, ms.

Alap:

```js
letterHitGapMs: 500
```

Ha ugyanaz a betű többször szerepel, az egyes cellák felvillanása és a
találati hang között ennyi idő telik el.

### gameplay.letterRevealAnimationMs

Típus: szám, ms.

Alap:

```js
letterRevealAnimationMs: 720
```

Egy újonnan felfedett betű animációjának hossza.

### gameplay.letterRevealPostDelayMs

Típus: szám, ms.

Alap:

```js
letterRevealPostDelayMs: 1000
```

Sikeres mássalhangzó után a következő pörgetés csak akkor engedélyezett,
amikor az összes találat felfedési animációja befejeződött, majd ez a
további várakozási idő is letelt.

### gameplay.playerSwitchDelayMs

Típus: szám, ms.

Alap:

```js
playerSwitchDelayMs: 1000
```

Játékosváltáskor ennyi ideig maradunk `playerTransition` állapotban,
mielőtt a következő játékos aktív lesz.

Ez alatt a színpad látható visszajelzést mutat, a játékgombok pedig nem
fogadnak új akciót.

### gameplay.turnReadyDelayMs

Típus: szám, ms.

Alap:

```js
turnReadyDelayMs: 1000
```

Miután a következő játékos neve már megjelent, ennyi ideig maradunk
`turnReady` állapotban. Ez alatt még nincs kézi input, Bot-akció vagy Auto
pörgetés.

### gameplay.autoSpinDelayMs

Típus: szám, ms.

Alap:

```js
autoSpinDelayMs: 900
```

Ha a felhasználó bekapcsolta az **Auto pörgetés** beállítást, ennyi idővel
az emberi játékos `spin` fázisba kerülése után indul automatikusan a kerék.

A beállítás maga `localStorage`-ban van; ez a config csak a késleltetést
adja meg.

## 4. puzzles

### puzzles.files

Éles módban a nehézségválasztó ezekre a fájlokra mutat:

```js
files: {
  child: "data/child.csv",
  easy: "data/low.csv",
  medium: "data/med.csv",
  hard: "data/high.csv"
}
```

A CSV formátuma:

```csv
category,puzzle
"Állat","PIROS KATICA"
```

### puzzles.expectedCountPerDifficulty

```js
expectedCountPerDifficulty: 100
```

Éles játék indításakor a betöltött lista legalább ennyi érvényes sort kell,
hogy tartalmazzon. Ha a fájl nem érhető el vagy rövidebb, a játék a lobbyban
hibát jelez és nem indul el.

A jelenlegi négy lista egyenként 100 egyedi feladványból áll.

## 5. wheel

### wheel.image

```js
image: "assets/images/wheel.png"
```

A Phaser által betöltött kerékgrafika.

Javasolt:

- négyzetes kép;
- frontális kerék;
- átlátszó háttér;
- ne tartalmazzon beégetett összegeket.

### wheel.canvasSize

```js
canvasSize: 600
```

A Phaser scene logikai szélessége és magassága.

### wheel.scale

```js
scale: 1.10
```

A teljes forgó kerék méretszorzója, beleértve a kerékgrafikát és a
cikkelyfeliratokat is.

- `1.00` = eredeti méret;
- `1.10` = 10%-kal nagyobb;
- `0.90` = 10%-kal kisebb.

A jelenlegi `wheelSize: 536` mellett a `scale: 1.10` kb. 590 px-es
megjelenített kerékátmérőt ad.

### wheel.wheelSize

```js
wheelSize: 536
```

A keréksprite alapmérete a Phaser canvason. A tényleges megjelenített méretet
a `wheel.scale` szorozza fel.

### wheel.labelRadius

```js
labelRadius: 188
```

A cikkelyfeliratok távolsága a kerék középpontjától.

### wheel.startOffsetDeg

```js
startOffsetDeg: -90
```

A 0. cikkely kezdő szöge.

A jelenlegi assethez -90 fok illeszkedik.

### wheel.pointerAngleDeg

```js
pointerAngleDeg: -90
```

A fix mutató iránya.

-90 fok = felül.

### wheel.minFullTurns / wheel.maxFullTurns

```js
minFullTurns: 2,
maxFullTurns: 3
```

Pörgetésenként véletlenül választott teljes fordulatszám tartománya.

A kisebb fordulatszám lassabb vizuális érzetet ad ugyanazon időtartam mellett.

### wheel.spinDurationMs

```js
spinDurationMs: 3600
```

A tween teljes időtartama ms-ban.

### wheel.easing

```js
easing: "Cubic.easeOut"
```

Phaser tween easing név.

A `easeOut` karakter miatt a kerék a végén fokozatosan lassul.

### wheel.resultDisplayMs

```js
resultDisplayMs: 1500
```

Megállás után ennyi ideig látszik a nagy középső eredmény.

Utána az overlay automatikusan bezár és az eredmény alkalmazódik.

### wheel.retryDelayMs

```js
retryDelayMs: 250
```

Ha a Phaser scene még nem áll készen, ennyi idő után próbáljuk újra a
pörgetést.

### Feliratbeállítások

```js
labelFontFamily: "Arial Black, Arial, sans-serif",
labelFontSizePx: 15,
longLabelFontSizePx: 11,
longLabelThreshold: 7,
labelColor: "#ffffff",
labelStrokeColor: "#10152f",
labelStrokeThickness: 4
```

`longLabelThreshold` fölött a kisebb `longLabelFontSizePx` használódik.

### wheel.segmentRepeat

```js
segmentRepeat: 2
```

A `segments` tömb hányszor ismétlődjön a teljes keréken.

### wheel.segments

Példa:

```js
{ label: "5 000", type: "money", value: 5000 }
```

Típusok:

#### money

```js
{ label: "5 000", type: "money", value: 5000 }
```

`value` lesz a mássalhangzó találatonkénti alapösszeg.

#### bankrupt

```js
{ label: "CSŐD", type: "bankrupt", value: 0 }
```

Nullázza az aktuális `roundMoney` értéket és játékost vált.

#### skip

```js
{ label: "KIMARADSZ", type: "skip", value: 0 }
```

Pénzmódosítás nélkül játékost vált.

### Kritikus kerékszabály

```text
segments.length × segmentRepeat = képi cikkelyek száma
```

Jelenleg:

```text
12 × 2 = 24
```

Ha ez nem igaz, a logikai és képi mezők elcsúsznak.

## 6. bot

### bot.actionDelayMs

```js
actionDelayMs: 900
```

A Bot általános gondolkodási késleltetése.

### bot.solveRevealRatio

```js
solveRevealRatio: 0.72
```

Ekkora felfedettségi aránytól próbálhat megfejteni.

0–1 tartomány.

### bot.solveChance

```js
solveChance: 0.45
```

A megfejtési kísérlet valószínűsége, ha a küszöb teljesül.

### bot.solveDelayMs

```js
solveDelayMs: 700
```

A megfejtés bejelentése és végrehajtása közti késleltetés.

### bot.vowelBuyChance

```js
vowelBuyChance: 0.18
```

Magánhangzó-vásárlás esélye, ha van elég pénze.

### bot.vowelDelayMs

```js
vowelDelayMs: 550
```

A Bot magánhangzó-választásának késleltetése.

### bot.consonantAfterWheelDelayMs

```js
consonantAfterWheelDelayMs: 650
```

Pénzmező után ennyi idő múlva választ mássalhangzót.

### bot.consonantSubmitDelayMs

```js
consonantSubmitDelayMs: 550
```

A kiválasztott betű bejelentése és tényleges beadása közti idő.

## 7. audio

### Rövid SFX

```js
defaultVolume: 0.70,
letterHitVolume: 0.72,
solveFailVolume: 0.72
```

A `soundsEnabled` a rövid SFX-eket kapcsolja. A `masterVolume` az SFX-re
és a zenei sávokra egyaránt érvényes.

### audio.music.wheelSpin

```js
file: "assets/sound/sfx/wheel_spinning.mp3",
defaultEnabled: true,
defaultVolume: 0.65,
loop: true,
fadeOutMs: 120
```

### audio.music.lobby

```js
file: "assets/sound/sfx/lobby_music.mp3",
defaultEnabled: true,
defaultVolume: 0.30,
loop: true,
fadeInMs: 650,
fadeOutMs: 350
```

### audio.music.winner

```js
file: "assets/sound/sfx/winner_music.mp3",
defaultEnabled: true,
defaultVolume: 0.75,
loop: true,
fadeInMs: 2600,
fadeOutMs: 300
```

### audio.music.game

```js
file: "assets/sound/sfx/game_music.mp3",
defaultEnabled: true,
defaultVolume: 0.20,
loop: true,
fadeInMs: 700,
fadeOutMs: 350,
microphoneDuckMultiplier: 0.10,
microphoneDuckFadeMs: 220,
microphoneRestoreFadeMs: 650,
voiceOwnerTurnMultiplier: 0,
voiceOwnerTurnFadeMs: 180
```

Voice owner saját körében a célhangerő:

```text
gameMusicVolume × masterVolume × voiceOwnerTurnMultiplier
```

Alapból a multiplier `0`, tehát teljes csend.

Más esetben aktív mikrofon mellett:

```text
gameMusicVolume × masterVolume × microphoneDuckMultiplier
```

A `defaultEnabled` és `defaultVolume` csak hiányzó user setting esetén
alapérték. A tényleges választás `localStorage`-ban tárolódik.

## 8. victory

### victory.fireworks

```js
fireworks: true
```

Kapcsolja a Phaser tűzijátékot.

### victory.minimumCelebrationMs

```js
minimumCelebrationMs: 3000
```

A sikeres megfejtés utáni ünneplés garantált minimum ideje. A tűzijáték
generálása legalább eddig tart, és a victory gombok sem válhatnak aktívvá
korábban.

### victory.fireworksDurationMs

```js
fireworksDurationMs: 3500
```

Ennyi ideig indulnak új burstök.

### victory.burstIntervalMs

```js
burstIntervalMs: 480
```

A burstök közötti idő.

### victory.particlesPerBurst

```js
particlesPerBurst: 28
```

Egy burst Phaser-részecskéinek száma.

### victory.buttonDelayMs

```js
buttonDelayMs: 1800
```

A két győzelmi gomb nominális késleltetése. A tényleges késleltetés a
`buttonDelayMs` és a `minimumCelebrationMs` közül a nagyobb érték.

### victory.colors

A tűzijáték hex színpalettája.

## 9. debug

### debug.showTestButton

```js
showTestButton: true
```

- `true`: látszik a Teszt gomb;
- `false`: a gomb `hidden` osztályt kap.

## 10. Példák

### Lassabb kerék

```js
minFullTurns: 1,
maxFullTurns: 2,
spinDurationMs: 4200
```

### Gyorsabb eredmény-eltűnés

```js
resultDisplayMs: 800
```

### Drágább magánhangzó

```js
vowelPrice: 8000
```

### Teszt gomb elrejtése

```js
showTestButton: false
```

## 11. Módosítás után

Nincs build lépés.

Mentés után frissítsd a böngészőt.

Ha cache miatt nem látszik:

```text
Ctrl+F5
```

## 12. Amit ne tegyél

Ne változtasd úgy a `segments` / `segmentRepeat` kombinációt, hogy ne
egyezzen a wheel asset tényleges cikkelyszámával.

Ne töltsd az `app.js`-t a config előtt.

Ne tegyél titkos adatot ebbe a fájlba: kliensoldali JavaScript, minden
böngészőből olvasható.


## 13. voice-config.js

A voice config a `voice-recognition` labor runtime konfigurációjának
KriszWheel-változata.

Fő csoportok:

- `recognition` – nyelv, continuous, interim, alternatívák, restart delay;
- `microphone` – preferált eszköznév szabályok;
- `letters` – `mint/min` parser és kivételek;
- `commands` – SPIN, SOLVE, VOWEL, GAME aliasok;
- `runtime.commandFeedbackMs` – a rövid voice stage feedback hossza.

A lobbyban módosítható értékek `localStorage`-ba kerülnek, nem írják át ezt
a fájlt.

## 14. Kapcsolódó roadmap

A következő tervezett konfigurációs bővítések:

- teljes játék / session szabályok;
- scoreboard;
- Bot nehézségi profilok;
- mobil input.

Részletek:

[../docs/ROADMAP.md](../docs/ROADMAP.md)
