# KriszWheel – játékszínpad és UI

## 1. Háttér és koordinátarendszer

Háttér:

`assets/images/studo_jatekszinpad.png`

Méret:

`1672 × 941 px`

Az SVG ugyanilyen `viewBox` koordinátarendszert használ.

## 2. Puzzle grid

A kép tényleges táblája:

- 15 oszlop;
- 4 sor.

A koordináták az `app.js` `STAGE_GRID` objektumában vannak.

## 3. Közép–közép elrendezés

A feladvány két dimenzióban középre kerül.

Vízszintesen:

```js
startCol = Math.floor((cols - rowLength) / 2)
```

Függőlegesen:

```js
startRow = Math.floor((rows - usedRows) / 2)
```

Példa:

```text
1 sor → 2. képi sor
2 sor → 2–3. sor
3 sor → 1–3. sor
4 sor → 1–4. sor
```

## 4. Puzzle cella

Rétegrend:

```text
háttér kék cella + arany keret
        ↓
SVG fehér rect
        ↓
SVG betű
```

Szóközre nincs fehér cella.

## 5. Betűanimáció

Új találat:

`state.justRevealed`

Az egyes találatok késleltetése:

`gameplay.letterHitGapMs`

Alap:

`500 ms`

A hang ugyanilyen ütemben fut.

## 6. Kategória

DOM:

`#categoryText`

A felső kategóriasávban jelenik meg.

## 7. Használt betűk

DOM:

`#usedLetters`

A `state.usedLetters` tartalmát rajzolja.

## 8. Fő hotspotok

### Pörgetés

`#spinBtn`

### Magánhangzó

DOM azonosító történeti okból:

`#consonantStageBtn`

A háttérképen Magánhangzó felirat látható.

A normál betűbevitel nem kattintással történik, hanem billentyűzetről.

A Magánhangzó hotspot **hoverre akkor is felvillan, ha disabled**. Ez
szándékos vizuális visszajelzés; a játékszabály nem változik.

### Megfejtés

`#solveBtn`

Megnyitja a solve dialogot.

## 9. Aktuális játékos panel

DOM:

- `#stageCurrentAvatar`
- `#stageCurrentPlayerName`
- `#stageCurrentMoney`

A `renderAll()` frissíti.

## 10. Színpadi feedback

DOM:

`#stageFeedback`

Használat:

- helytelen megfejtés;
- játékosváltás;
- rövid állapotjelzés.

Hibánál piros variáns.

## 11. Wheel overlay

DOM:

- `#wheelOverlay`
- `#wheelGame`
- `#wheelOverlayResult`

A wheel PNG és a Phaser Text feliratok együtt forognak.

Megálláskor az eredmény a kerék közepén jelenik meg.

## 12. Solve dialog

A `#solveForm` submitja kezeli a gombot és az Entert.

A dialog mindig az értékelés előtt záródik.

## 13. Victory overlay

DOM:

- `#victoryOverlay`
- `#victoryFx`
- `#victoryAvatar`
- `#victoryTitle`
- `#victoryPuzzle`
- `#victoryRoundMoney`
- `#victoryTotalMoney`
- `#victoryStandingsList`
- `#victoryActions`
- `#nextRoundBtn`
- `#victoryEndGameBtn`

A `VictoryScene` külön Phaser canvasban fut.

A victory card szélesebb, és a játékállás **egyetlen oszlopos listaként**
jelenik meg: a játékosok egymás alatt láthatók.

Minden standings sor:

- nagyobb avatar bal oldalon;
- játékosnév középen;
- nagyobb, jobbra igazított eddig megnyert összeg (`totalMoney`);
- az aktuális forduló nyertesének kiemelése.

A gombok `victory.buttonDelayMs` után aktiválódnak.

## 14. Teszt gomb

`#testBtn`

Megmutatja az aktuális megfejtést.

`debug.showTestButton` kapcsolja.

## 15. Játék vége

### Stage gomb

`#endGameBtn`

Megerősítést kér.

### Victory gomb

`#victoryEndGameBtn`

Közvetlen lobby.

## 16. Játékzene kapcsoló

DOM:

`#gameMusicToggleBtn`

Elhelyezés:

- stage bal felső sarok;
- a jobb felső `Játék vége` gomb vizuális párja.

Állapot:

- `♫ Játékzene: BE`
- `♫ Játékzene: KI`

A kapcsoló a perzisztált `gameMusicEnabled` értéket módosítja.

Aktív mikrofon alatt a játékzene automatikusan halkul, majd visszafade-el.

## 17. Hangvezérlés UI

### Mikrofon gomb

DOM:

`#voiceMicBtn`

Elhelyezés:

- az aktuális játékos avatarja fölött;
- a player panel külső geometriáját nem tolja el;
- `pointer-events: auto`, miközben a player panel többi része továbbra sem
  interaktív.

Állapotok:

- KI;
- BE;
- HALLGAT;
- ÚJRAINDUL;
- disabled / nem támogatott.

### HANG TESZT panel

DOM:

`#voiceDebugPanel`

Elhelyezés:

- stage bal alsó része;
- nem fedheti a középső fő hotspotokat.

Tartalom:

- provider állapot;
- interim/final transcript;
- felismert command vagy letter;
- hibaüzenet.

## 18. Reszponzivitás

A stage megtartja a 1672:941 arányt.

A puzzle SVG együtt skálázódik a háttérrel.

A wheel overlay saját négyzetes területet használ.

A teljes mobil-layout még nem végleges.

## 19. Háttérkép cseréje

Új háttérnél ellenőrizendő:

- grid;
- category;
- used letters;
- gomb-hotspotok;
- avatarpanel;
- feedback;
- debug/game end;
- wheel/victory vizuális arányok.
