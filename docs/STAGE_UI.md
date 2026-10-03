# KriszWheel – játékszínpad és overlay

## 1. Alapkép

Fájl:

`assets/images/studo_jatekszinpad.png`

Natív méret:

`1672 × 941 px`

A `.stage-canvas` ugyanilyen képarányt tart fenn.

A cél, hogy a háttér és az összes ráhelyezett funkcionális réteg együtt
skálázódjon.

## 2. Rétegek

```text
PNG stúdió háttér
    ↓
SVG puzzle board
    ↓
kategória + használt betűk
    ↓
aktuális játékos panel
    ↓
képi hotspotok
    ↓
Teszt / Játék vége
    ↓
Phaser wheel overlay
```

## 3. Feladványtábla

A háttér jelenlegi táblája:

- 15 oszlop;
- 4 sor;
- 60 képi cella.

A koordináták az `app.js` `STAGE_GRID` objektumában vannak.

```js
cols: 15
rows: 4
x: [311, 388, 465, 541, 618, 694, 771, 848, 924, 1001, 1078, 1155, 1233, 1310, 1386]
y: [192, 269, 345, 420]
```

A szélesség és magasság cellánként/soronként külön tárolt, mert a generált
háttér nem teljesen pixelazonos cellákat tartalmaz.

## 4. Tördelés

A `layoutPuzzleRows()`:

- szavanként tördel;
- maximum 15 karaktert enged soronként;
- legfeljebb 4 sort használ;
- kiegyensúlyozott elrendezést keres;
- minden sort vízszintesen középre igazít.

A `renderPuzzle()` ezután a teljes sorblokkot **függőlegesen is középre**
helyezi a 4 soros táblán:

```js
startRow = Math.floor((STAGE_GRID.rows - rows.length) / 2)
```

Példák:

```text
1 sor  → 2. képi sor
2 sor  → 2–3. képi sor
3 sor  → 1–3. képi sor
4 sor  → 1–4. képi sor
```

Így a feladvány alapelve **közép–közép**: a sorokon belül vízszintesen,
a teljes feladványblokknál pedig függőlegesen középre rendezünk.

Ha nincs jó szavas tördelés, fallback darabolást használ.

## 5. Cellák

Az SVG csak ott rajzol fehér mezőt, ahol tényleges karakter van.

Rétegrend:

```text
háttér kék cellája + arany keret
          ↓
SVG fehér belső rect
          ↓
SVG betű
```

A szóközök nem kapnak fehér mezőt.

Írásjelek azonnal látszanak.

## 6. Betűstílus

A felfedett betűk:

- `Arial Black` jellegűek;
- sötét színűek;
- középre igazítottak;
- SVG `text` elemek.

A jelenlegi CSS alap:

```css
font-family: "Arial Black", Arial, Helvetica, sans-serif;
font-size: 43px;
font-weight: 900;
fill: #17162d;
```

## 7. Betűfelfedési animáció

Új találatnál a betű bekerül:

`state.justRevealed`

Az animáció:

1. áttetsző / kicsi kezdés;
2. fehér-kék glow;
3. enyhe túlnövés;
4. normál sötét betű.

Több azonos betű esetén az egyes találatok sorban indulnak.

Konfiguráció:

`gameplay.letterHitGapMs`

Alapérték:

`500 ms`

A hang ugyanilyen ritmusban követi a felfedést.

## 8. Kategória

DOM:

`#categoryText`

Pozíció:

```css
left: 27.87%;
top: 7.65%;
width: 44.38%;
height: 6.91%;
```

A szöveg nagybetűs és középre igazított.

## 9. Használt betűk

DOM:

`#usedLetters`

A mező a `state.usedLetters` tartalmát jeleníti meg.

Példa:

```text
A  K  R  S  T
```

## 10. Fő képi hotspotok

### Pörgetés

DOM:

`#spinBtn`

```css
left: 22.73%;
top: 86.29%;
width: 15.85%;
height: 7.01%;
```

A `spinWheel(false)` függvényt indítja.

### Középső hotspot

DOM azonosító:

`#consonantStageBtn`

Ez történeti elnevezés.

A normál betűbevitel már nem dialogon és nem ezen a gombon keresztül történik,
hanem közvetlenül a billentyűzetről. A hotspot jelenleg csak segédüzenetet
képes kiírni, ha a játék `letter` állapotban van.

A későbbi UI-refaktorban érdemes az azonosítót és a képi funkciót egységesíteni.

### Megfejtés

DOM:

`#solveBtn`

```css
left: 61.42%;
top: 86.29%;
width: 15.85%;
height: 7.01%;
```

A megfejtés dialogot nyitja.

## 11. Aktuális játékos panel

A jobb alsó panel:

- avatart;
- nevet;
- aktuális `roundMoney` értéket

mutat.

DOM:

- `#stageCurrentAvatar`
- `#stageCurrentPlayerName`
- `#stageCurrentMoney`

A `renderAll()` frissíti.

Kép mapping:

```text
Krisz → assets/images/krisz.png
Adri  → assets/images/adri.png
Aliz  → assets/images/lizus.png
Bot   → assets/images/bot.png
```

## 12. Phaser kerék overlay

DOM:

- `#wheelOverlay`
- `#wheelGame`
- `#wheelOverlayResult`

A Phaser canvas az overlay közepén jelenik meg.

### Kerék asset

Konfiguráció:

`wheel.image`

Alap:

`assets/images/wheel.png`

### Cikkelyek

A PNG nem tartalmaz összegeket.

A feliratokat a Phaser rajzolja rá a `wheel.segments` konfigurációból.

A PNG és a text objektumok a `wheelContainer` részei, ezért együtt forognak.

### Mutató

A mutató külön Phaser objektum, így nem forog.

A célpozíció számításához használt konfiguráció:

- `wheel.startOffsetDeg`
- `wheel.pointerAngleDeg`

### Pörgetés

Konfiguráció:

- `wheel.minFullTurns`
- `wheel.maxFullTurns`
- `wheel.spinDurationMs`
- `wheel.easing`

Alap:

```text
2–3 fordulat
3600 ms
Cubic.easeOut
```

### Megállás

A megállás után:

1. `wheelResult` állapot;
2. nagy, nagybetűs eredmény középen;
3. várakozás `wheel.resultDisplayMs` ideig;
4. automatikus overlay bezárás;
5. eredmény alkalmazása.

Alap:

`1500 ms`

## 13. Színpadi visszajelzés

DOM:

`#stageFeedback`

A rövid overlay például játékosváltás vagy helytelen megfejtés esetén
jelenik meg.

Helytelen megfejtésnél piros `error` variánst használ.

A játékosváltási visszajelzés hossza:

`gameplay.playerSwitchDelayMs`

Alap:

`1000 ms`

## 14. Megfejtés dialog és felfedés

A `#solveForm` submit eseménye kezeli mind az Entert, mind a
`Megfejtem` gombot.

Érvényes, nem üres válasznál:

1. a `#solveDialog` azonnal bezár;
2. csak ezután történik a `trySolve()` kiértékelés.

Helyes megfejtésnél a `finishRound()` kiszámolja, hány rejtett betűhelyet
kell még animálni. A fordulóvégi dialog időzítése:

```text
(hiddenLetterCount - 1) × letterHitGapMs
+ 720 ms stageLetterReveal
+ 120 ms biztonsági ráhagyás
```

Így a fordulóvégi dialog nem takarja el a betűfelfedést.

## 15. Győzelmi overlay

A győzelmi képernyő a teljes stage fölé kerül.

DOM:

- `#victoryOverlay`
- `#victoryFx`
- `#victoryAvatar`
- `#victoryTitle`
- `#victoryPuzzle`
- `#victoryRoundMoney`
- `#victoryTotalMoney`
- `#victoryActions`
- `#nextRoundBtn`
- `#victoryEndGameBtn`

A `VictoryScene` Phaser kör-részecskékkel rajzol tűzijátékot. A háttér
sötétítve/blurözve marad, a nyertes avatarja és pénzei középen jelennek meg.

A gombok `victory.buttonDelayMs` késleltetéssel válnak aktívvá.

A `Játék vége` ezen a képernyőn közvetlenül a lobbyba visz.

## 16. Teszt gomb

DOM:

`#testBtn`

A gomb dialogban mutatja az aktuális megfejtést.

Konfiguráció:

`debug.showTestButton`

`false` esetén a gomb `hidden` osztályt kap.

## 17. Játék vége

DOM:

- `#endGameBtn`
- `#endGameDialog`
- `#endGameCancelBtn`
- `#endGameConfirmBtn`

`Nem`:

- csak bezárja a dialogot.

`Igen`:

- timer-ek törlése;
- wheel overlay bezárása;
- `setup` state;
- visszatérés a lobbyhoz.

## 18. Hangok

A hangok forrása és hangerői a konfigurációban vannak.

A találati hang minden előfordulásnál külön `Audio.cloneNode()` példányból
indul, így a hangok nem vágják le egymást.

## 19. Reszponzivitás

A játékszínpad a 1672:941 képarányt tartja.

A puzzle koordináták az SVG `viewBox` miatt együtt skálázódnak.

A Phaser wheel overlay saját négyzetes területet használ.

A mobil-specifikus végleges layout még nincs kész.

## 20. Háttérkép cseréje

Ha a `studo_jatekszinpad.png` képet lecseréljük, ellenőrizni kell:

1. képarány;
2. puzzle grid;
3. kategóriasáv;
4. használt betűk sáv;
5. fő gombok hotspotjai;
6. avatar panel helye;
7. debug/game-end gombok;
8. wheel overlay vizuális aránya.

Ha a grid geometriája változik, a `STAGE_GRID` újramérése kötelező.
