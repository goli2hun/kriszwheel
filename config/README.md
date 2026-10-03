# KriszWheel – konfigurációs referencia

Központi konfiguráció:

`config/game-config.js`

A fájl az `app.js` előtt töltődik be, és ezt hozza létre:

```js
window.KRISZWHEEL_CONFIG
```

## 1. Betöltés

`index.html`:

```html
<script src="config/game-config.js"></script>
<script src="app.js"></script>
```

A sorrend kötelező.

## 2. gameplay

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

## 3. wheel

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

### wheel.wheelSize

```js
wheelSize: 536
```

A keréksprite megjelenített mérete a Phaser canvason.

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

## 4. bot

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

## 5. audio

### audio.defaultVolume

```js
defaultVolume: 0.70
```

Általános fallback hangerő.

### Specifikus hangerők

```js
letterHitVolume: 0.72,
solveSuccessVolume: 0.75,
solveFailVolume: 0.72
```

0–1 tartomány ajánlott.

### audio.files

```js
files: {
  letterHit: "assets/sound/sfx/letter_hit.wav",
  letterMiss: "assets/sound/sfx/letter_miss.wav",
  solveSuccess: "assets/sound/sfx/solve_success.wav",
  solveFail: "assets/sound/sfx/solve_fail.wav"
}
```

A fájlutak a repo gyökeréhez képest értendők.

## 6. victory

### victory.fireworks

```js
fireworks: true
```

Kapcsolja a Phaser tűzijátékot.

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

Ennyi idő után jelenik meg és válik aktívvá a két győzelmi gomb.

### victory.colors

A tűzijáték hex színpalettája.

## 7. debug

### debug.showTestButton

```js
showTestButton: true
```

- `true`: látszik a Teszt gomb;
- `false`: a gomb `hidden` osztályt kap.

## 8. Példák

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

## 9. Módosítás után

Nincs build lépés.

Mentés után frissítsd a böngészőt.

Ha cache miatt nem látszik:

```text
Ctrl+F5
```

## 10. Amit ne tegyél

Ne változtasd úgy a `segments` / `segmentRepeat` kombinációt, hogy ne
egyezzen a wheel asset tényleges cikkelyszámával.

Ne töltsd az `app.js`-t a config előtt.

Ne tegyél titkos adatot ebbe a fájlba: kliensoldali JavaScript, minden
böngészőből olvasható.


## 11. Kapcsolódó roadmap

A következő tervezett konfigurációs bővítések:

- puzzle adatforrás;
- teljes játék / session szabályok;
- scoreboard;
- Bot nehézségi profilok;
- mobil input.

Részletek:

[../docs/ROADMAP.md](../docs/ROADMAP.md)
