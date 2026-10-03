# Játékszínpad és overlay – technikai dokumentáció

Ez a dokumentum a Szerencsekerék jelenlegi, kép-alapú játékszínpadának működését írja le.

## 1. Cél

A játéknézet nem egy hagyományos webes panelrendszer. A
`assets/images/studo_jatekszinpad.png` egy 1672 × 941 px-es, 16:9 arányú
stúdiódíszlet, amely fölé célzott HTML/SVG interaktív rétegek kerülnek.

Az alapelv:

- a PNG adja a teljes látványt;
- az SVG rajzolja a feladvány fehér mezőit és a felfedett betűket;
- a HTML overlay írja ki a kategóriát és a már használt betűket;
- átlátszó HTML gombok ülnek a képre generált gombok fölött;
- a meglévő játéklogika továbbra is az `app.js`-ben fut.

## 2. Háttérkép és koordinátarendszer

Fájl:

`assets/images/studo_jatekszinpad.png`

Natív méret:

`1672 × 941 px`

A játéktér ugyanezt a koordinátarendszert használja. A fő SVG:

```html
<svg viewBox="0 0 1672 941" preserveAspectRatio="xMidYMid meet">
```

A `.stage-canvas` megtartja a 1672:941 képarányt. Emiatt a rajzolt elemek
együtt skálázódnak a háttérrel, és nem külön-külön reagálnak a viewport
méretére.

## 3. Feladványtábla

### 3.1 A jelenlegi kép tényleges geometriája

A háttérképen jelenleg:

- 15 oszlop;
- 4 sor;
- összesen 60 cella

található.

Ez fontos eltérés a korábbi 14 × 5 tervhez képest. A kód szándékosan a
**ténylegesen feltöltött képhez** igazodik.

Az `app.js`-ben ezt a `STAGE_GRID` konstans írja le:

```js
cols: 15
rows: 4
x: [311, 388, 465, 541, 618, 694, 771, 848, 924, 1001, 1078, 1155, 1233, 1310, 1386]
y: [192, 269, 345, 420]
```

Az oszlopszélességek és sormagasságok külön tömbökben vannak megadva,
mert a generált képen néhány cella 1-2 pixellel eltér.

### 3.2 Feladvány tördelése

A `layoutPuzzleRows()`:

1. szavanként dolgozza fel a feladványt;
2. legfeljebb 15 karakteres sorokat készít;
3. maximum 4 sort használ;
4. több lehetséges tördelés közül a kiegyensúlyozottabbat választja;
5. a sort vízszintesen középre igazítja a táblán.

### 3.3 Fehér mezők

A PNG-ben lévő kék cellát az SVG csak akkor takarja fehér mezővel, ha az
adott helyen tényleges karakter szerepel a feladványban.

A fehér mező SVG `rect`, enyhe függőleges gradienssel. Az arany keret nem
SVG-ben készül: az továbbra is a háttérképből látszik.

Ezért a vizuális rétegrend:

```text
PNG kék cella + arany keret
        ↓
SVG fehér cellabelső
        ↓
SVG betű
```

A szóközökhöz nem rajzolunk fehér mezőt.

## 4. Betűk megjelenítése

A betűk SVG `text` elemek.

Jelenlegi tipográfiai irány:

```css
font-family: "Arial Black", Arial, Helvetica, sans-serif;
font-size: 43px;
font-weight: 900;
fill: #17162d;
```

A cél az eredeti műsor táblájához hasonló, vastag, sötét, jól olvasható
TV-s karakter.

### 4.1 Találat animáció

Találatnál a betű bekerül a `state.justRevealed` halmazba.

A `stageLetterReveal` animáció:

- halványan indul;
- kb. 68%-os méretről nő;
- rövid fehér/kék glow-t kap;
- enyhén túlnő 109%-ra;
- végül visszaáll normál méretre és sötét színre.

A következő render után a `justRevealed` halmaz törlődik, így a már
korábban felfedett betűk nem animálódnak újra.

## 5. Kategória / feladványtípus

A felső, üres kék csíkba kerül a feladvány kategóriája.

DOM elem:

`#categoryText`

Pozíció a teljes 1672 × 941 színpadhoz viszonyítva:

```css
left: 27.87%;
top: 7.65%;
width: 44.38%;
height: 6.91%;
```

A kategória nagybetűs, középre igazított, arany-fehér tónusú szöveg.

Példák:

- MONDÁS
- BUDAPEST
- TERMÉSZET
- HELY
- KIFEJEZÉS
- ÉTEL

## 6. Használt betűk

A három nagy gomb feletti hosszú kék sáv a már elhasznált betűket mutatja.

DOM elem:

`#usedLetters`

A megjelenítés formája például:

```text
HASZNÁLT BETŰK    A  K  R  S  T
```

A forrás a meglévő `state.usedLetters` halmaz. A renderelést a
`renderUsedLetters()` végzi.

## 7. Képi gombok és hotspotok

A háttérkép már tartalmazza a három gomb grafikáját és feliratát. Ezért
nem rajzolunk rájuk új látható HTML gombot.

Ehelyett három átlátszó `button` ül pontosan fölöttük.

### 7.1 Pörgetés

DOM:

`#spinBtn`

Hotspot:

```css
left: 22.73%;
top: 86.29%;
width: 15.85%;
height: 7.01%;
```

A `spinWheel(false)` logikát indítja.

Jelenleg ez szándékosan **BASIC tesztmód**: nem használja a Phaser
kerékanimációt. A kattintás után:

1. a státusz `Pörög…` értékre vált;
2. 850 ms múlva véletlen `WHEEL_SEGMENTS` elem kerül kiválasztásra;
3. pénzmezőnél aktiválódik a Mássalhangzó gomb;
4. CSŐD esetén a fordulópénz nullázódik;
5. KIMARADSZ esetén a kör a következő játékosra kerül.

Az eredmény kis szöveges státuszként a gombok fölött jelenik meg.
Ez átmeneti megoldás addig, amíg az új vizuális kerék elkészül.

### 7.2 Mássalhangzó

DOM:

`#consonantStageBtn`

Hotspot:

```css
left: 40.79%;
top: 86.29%;
width: 18.42%;
height: 7.01%;
```

Csak akkor aktív, amikor a játék állapota `letter`. Kattintásra megnyitja
a `#consonantDialog` ablakot, ahol egy karakter adható meg.

### 7.3 Megfejtés

DOM:

`#solveBtn`

Hotspot:

```css
left: 61.42%;
top: 86.29%;
width: 15.85%;
height: 7.01%;
```

A meglévő megfejtés dialógust nyitja.

### 7.4 Hover

A hotspotok alapállapotban teljesen átlátszók.

Hover/fókusz esetén:

- enyhe fehér-kék fényréteg jelenik meg;
- arany glow kerül a gomb köré;
- a háttérképen lévő eredeti gomb vizuálisan világosabbnak tűnik.

A felirat továbbra is a PNG része.

## 8. Aktuális játékos panel

A színpad jobb alsó részén külön státuszpanel mutatja az éppen soron lévő
játékost.

Megjelenített adatok:

- játékos profilképe;
- játékos neve;
- aktuális fordulópénz.

Kép-hozzárendelés:

```js
const PLAYER_IMAGES = {
  Krisz: "assets/images/krisz.png",
  Adri: "assets/images/adri.png",
  Aliz: "assets/images/lizus.png",
  Bot: "assets/images/bot.png"
};
```

DOM elemek:

- `#stageCurrentAvatar`
- `#stageCurrentPlayerName`
- `#stageCurrentMoney`

A panel frissítését a `renderAll()` végzi, ezért automatikusan változik:

- játékosváltáskor;
- találat után;
- CSŐD után;
- új forduló indításakor.

A pénzmező a játékos `roundMoney` értékét mutatja, tehát az adott
fordulóban aktuálisan megszerzett összeget, nem a teljes játék összesített
nyereményét.

## 9. Teszt megfejtés

Fejlesztési segítségként a teljes aktuális megfejtés kis fehér betűkkel
megjelenik a három fő gomb alatt.

DOM:

`#testAnswerText`

Az érték minden új fordulóban:

```js
el.testAnswerText.textContent = state.puzzle.text;
```

Ez kizárólag tesztfunkció, a végleges játékban el kell távolítani vagy
debug kapcsolóhoz kell kötni.

## 10. Találati hang

Fájl:

`assets/sound/sfx/letter_hit.wav`

A hang saját generált, rövid game-show jellegű csippanás.

A `playHitSequence(count)` annyiszor indítja el a hangot, ahány
előfordulása van a megtalált betűnek.

Példa:

```text
3 találat → csipp – csipp – csipp
```

Jelenlegi időköz:

`180 ms`

A hang minden lejátszásnál külön `Audio.cloneNode()` példányon indul, ezért
a rövid hangok nem vágják le egymást.

További SFX:

- `letter_miss.wav` – nincs ilyen betű;
- `solve_success.wav` – sikeres megfejtés;
- `solve_fail.wav` – hibás megfejtés.

## 11. Rejtett kompatibilitási réteg

A jelenlegi prototípus még tartalmaz olyan korábbi logikai elemeket, amelyek
vizuálisan nem részei az új színpadnak.

A `.stage-logic-bridge` a viewporton kívül tartja többek között:

- a Phaser kerék konténerét;
- a játékoslista korábbi renderét;
- az aktív játékos szövegét;
- a magánhangzó-gombot;
- a belső státuszüzenetet.

Erre azért van szükség, hogy az új színpad fejlesztése közben a meglévő
játékmenet ne törjön el.

Ez átmeneti megoldás. A későbbi refaktorban ezeket külön állapot/UI
komponensekre érdemes bontani.

## 12. Jelenlegi korlátok és következő lépések

Jelenleg még nincs véglegesen integrálva:

1. a látványos szerencsekerék az új színpadba;
2. a teljes játékos-scoreboard véglegesítése (az aktuális játékos panel már működik);
3. a magánhangzó-vásárlás új képi vezérlése;
4. a feladványok külső JSON/SQLite adatforrása;
5. Whisper-alapú hangvezérlés;
6. mobil-specifikus játéknézet.

## 13. Fontos fejlesztési szabály

A játékszínpad pozícióit mindig a **1672 × 941-es alapképre** mérjük.

Ne használjunk külön viewport-pixel koordinátákat a puzzle cellákhoz vagy a
gombokhoz. Az SVG `viewBox` és a százalékos hotspot pozíciók biztosítják,
hogy az overlay és a háttér együtt skálázódjon.

Ha a `studo_jatekszinpad.png` képet lecseréljük olyan verzióra, amelynek
a táblageometriája eltér, a `STAGE_GRID` és a hotspot koordináták újramérése
szükséges.
