# KriszWheel – architektúra

## 1. Áttekintés

A projekt build lépés nélküli frontend alkalmazás.

Technológiák:

- HTML5
- CSS3
- vanilla JavaScript
- SVG
- Phaser 3.90
- statikus HTTP kiszolgálás

Nincs jelenleg:

- backend;
- adatbázis;
- Node build pipeline;
- framework;
- bundler.

## 2. Betöltési sorrend

Az `index.html` végén:

```html
<script src="config/game-config.js"></script>
<script src="app.js"></script>
```

A sorrend kötelező.

A `game-config.js` létrehozza:

```js
window.KRISZWHEEL_CONFIG
```

Az `app.js` induláskor aliasokat készít:

```js
CONFIG
GAMEPLAY_CONFIG
WHEEL_CONFIG
BOT_CONFIG
AUDIO_CONFIG
DEBUG_CONFIG
```

Ha egy konfigurációs kulcs hiányzik, az `app.js` több helyen fallback értéket
használ.

## 3. Fő fájlok

### index.html

Feladata:

- lobby DOM;
- játékszínpad DOM;
- SVG puzzle overlay;
- wheel overlay konténere;
- dialogok;
- script betöltési sorrend.

### styles.css

Feladata:

- lobby vizuális megjelenése;
- profilválasztó;
- játékszínpad;
- pixelpontos hotspotok;
- puzzle betűanimáció;
- aktuális játékos panel;
- Phaser wheel overlay;
- dialogok;
- debug és játék vége gomb.

### app.js

Feladata:

- játékállapot;
- játékosok;
- feladványok;
- pörgetés;
- Phaser WheelScene;
- betűbevitel;
- pontozás;
- magánhangzó-vásárlás;
- megfejtés;
- Bot;
- SFX;
- dialog események.

### config/game-config.js

Feladata:

- módosítható játékparaméterek;
- kerékparaméterek;
- mezőlista;
- Bot hangolása;
- audio;
- debug.

## 4. State

A központi `state` objektum fontosabb mezői:

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
roundNumber
justRevealed
pendingWheelSegment
pendingWheelFromBot
```

### phase értékek

#### setup

Lobby / nincs aktív játék.

#### spin

Az aktuális játékos pörgethet.

#### spinning

A Phaser kerék éppen mozog.

#### wheelResult

A kerék megállt, az eredmény 1,5 másodpercig látható.

#### letter

Pénzmező után mássalhangzót várunk.

#### roundEnd

A feladvány megoldódott, a fordulóvégi dialog aktív.

## 5. Fő állapotátmenetek

```text
startGame()
  → newRound()
  → spin

spinWheel()
  spin → spinning

Phaser tween onComplete
  spinning → wheelResult

applyPendingWheelResult()
  money → letter
  bankrupt → nextPlayer() → spin
  skip → nextPlayer() → spin

handleConsonant()
  hit → spin
  miss → nextPlayer() → spin

buyVowel()
  hit → spin
  miss → nextPlayer() → spin

trySolve()
  success → finishRound() → roundEnd
  fail → nextPlayer() → spin
```

## 6. Phaser kerék

### WheelScene

A `WheelScene`:

1. preloadolja a `wheel.image` konfiguráció szerinti assetet;
2. létrehozza a wheel containert;
3. ráhelyezi a Phaser Text feliratokat;
4. létrehozza a fix mutatót;
5. `spinTo(index)` segítségével célmezőre forgat.

A PNG és a feliratok ugyanabban a containerben vannak, ezért együtt forognak.

A mutató külön objektum.

### Célpozíció

A számítás figyelembe veszi:

- `startOffsetDeg`;
- `pointerAngleDeg`;
- cikkelyszám;
- aktuális kerékrotáció;
- teljes fordulatok száma.

Ez biztosítja, hogy a kiválasztott logikai mező és a mutatónál megálló képi
cikkely egyezzen.

## 7. Wheel segment modell

Egy mező:

```js
{
  label: "5 000",
  type: "money",
  value: 5000
}
```

Típusok:

- `money`
- `bankrupt`
- `skip`

A tényleges cikkelylista:

```text
segments × segmentRepeat
```

A jelenlegi kerék:

```text
12 × 2 = 24
```

## 8. Feladványtábla

A tábla SVG-alapú.

A `STAGE_GRID` tartalmazza a 15 × 4 képi cella pontos koordinátáit.

A `renderPuzzle()`:

- kiszámolja a sorokat;
- középre igazítja őket;
- csak a tényleges karakterhelyekre rajzol fehér cellát;
- felfedi a punctuation karaktereket;
- a felfedett betűket SVG `text` elemekként rajzolja.

## 9. Billentyűkezelés

A dokumentumszintű `keydown` listener kezeli a betűket.

Nem dolgozik fel billentyűt, ha:

- modifier van lenyomva;
- ismételt keydown érkezik;
- nem aktív a játéknézet;
- input/textarea/select/contentEditable kapja az eseményt;
- nyitott dialog van;
- Bot van soron.

Így a Megfejtés mező biztonságosan gépelhető.

## 10. Hangrendszer

A hangfájlok induláskor `Audio` objektumként cache-be kerülnek.

Lejátszáskor a játék:

```js
source.cloneNode()
```

példányt használ.

Ennek előnye, hogy egymást gyorsan követő találati hangok nem vágják le
egymást.

## 11. Bot

A Bot timer-alapú.

Nincs külön thread vagy worker.

Fő döntési sorrend:

1. megfejtés megkísérlése;
2. esetleges magánhangzó-vásárlás;
3. pörgetés.

Pénzmező után külön timer választ mássalhangzót.

## 12. UI rétegek

A játékszínpad rétegrendje leegyszerűsítve:

```text
studo_jatekszinpad.png
        ↓
SVG puzzle overlay
        ↓
category / used letters / player panel
        ↓
image hotspots
        ↓
debug / game end controls
        ↓
wheel overlay
```

## 13. Kompatibilitási réteg

A `.stage-logic-bridge` továbbra is tartalmaz néhány korábbi DOM elemet:

- játékoslista;
- aktív játékos szöveg;
- belső message.

Ezek vizuálisan a viewporton kívül vannak, de a régi logikai kód egy része
még használja őket.

Későbbi refaktorban eltávolíthatók.

## 14. Invariánsok

A fejlesztés során ezeket érdemes megtartani:

- `config/game-config.js` az `app.js` előtt töltődjön;
- a wheel segmentek száma egyezzen a képi cikkelyek számával;
- a stage háttér csere esetén újra kell mérni a grid/hotspot koordinátákat;
- a puzzle state változtatása után `renderAll()` / `updateControls()`
  szükséges, ahol releváns;
- minden Bot timer-t törölni kell játék- vagy fordulóváltáskor;
- a wheel result csak a megállás után alkalmazódjon.
