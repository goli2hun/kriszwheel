# KriszWheel – Roadmap

Ez a dokumentum a következő fejlesztési irányokat priorizálja.

## P0 – Következő érdemi lépés: feladvány-adatforrás

A legnagyobb jelenlegi technikai adósság, hogy a puzzle-ok az `app.js`-ben
hardcode-olva vannak.

Javasolt első lépés:

`data/puzzles.json`

Példa:

```json
[
  {
    "category": "Mondás",
    "text": "A KOCKA EL VAN VETVE"
  }
]
```

Cél:

- több száz feladvány kezelhető legyen;
- kódmódosítás nélkül lehessen puzzle-t hozzáadni;
- kategóriák bővíthetők legyenek;
- később SQLite/backend felé egyszerű legyen továbblépni.

## P1 – Scoreboard / teljes játékállás

Az aktuális játékos panel már működik, de nincs egyszerre látható teljes
eredménytábla.

Javaslat:

- minden játékos avatarja;
- totalMoney;
- aktuális játékos kiemelése;
- opcionálisan megnyert fordulók száma.

Ezt a jobb oldalra vagy egy alsó keskeny sávba lehetne tenni.

## P1 – Hangok újratervezése

A jelenlegi hangok prototípusok.

Érdemes külön készlet:

- kerék indulás;
- lassuló tick;
- pénzmező;
- CSŐD;
- KIMARADSZ;
- találat;
- nincs találat;
- helyes megfejtés;
- hibás megfejtés;
- victory fanfare.

A kerék tick hangja sebességfüggően ritkulhatna a vizuális lassulással együtt.

## P1 – Magánhangzó UX véglegesítése

A háttérképen már Magánhangzó gomb látszik, de a DOM ID történeti okból
`consonantStageBtn`.

Javasolt refaktor:

- `vowelStageBtn`;
- kattintásra „Nyomj le egy magánhangzót” mód;
- billentyűzet továbbra is közvetlenül működjön;
- vizuális state: elég pénz / nincs elég pénz.

## P1 – Puzzle validátor

Automatikus induláskori vagy fejlesztői validáció:

- belefér-e 15 × 4-be;
- nincs-e túl hosszú szó;
- ismert kategória-e;
- nincs-e duplikált puzzle;
- magyar karakterek rendben vannak-e.

Ez különösen fontos lesz külső JSON esetén.

## P2 – Game session / végső győztes

Most egy forduló nyertesét ünnepeljük.

Később lehet valódi játék-vége:

- X forduló;
- célösszeg;
- időlimit;
- kézi „Játék vége”.

Ezután külön **teljes játék győztese** screen jelenhetne meg totalMoney alapján.

## P2 – Bot fejlesztés

Jelenlegi Bot egyszerű valószínűségi logika.

Fejlesztések:

- magyar betűgyakoriság;
- már látható mintázatok alapján jobb betűválasztás;
- kategóriafüggő döntések;
- ne vásároljon értelmetlen magánhangzót;
- külön easy / normal / hard Bot profil.

## P2 – Mobil / tablet layout

Célplatformok:

- Samsung S23
- iPhone 15/16
- iPad
- Full HD desktop

Feladat:

- portrait/landscape döntés;
- hotspot méretek;
- victory card mobilon;
- kerék méretezése;
- billentyűzet nélküli mobil input.

Mobilon virtuális betűpanelre lesz szükség.

## P2 – Keyboard UX

Desktopon hasznos:

- képernyőn röviden mutatni a lenyomott betűt;
- már használt betűnél külön feedback;
- nincs elég pénz magánhangzóra → külön üzenet;
- billentyűzet shortcut súgó.

## P3 – Backend

Ha a statikus frontend kinőhető:

- FastAPI;
- SQLite;
- puzzle adatbázis;
- játékstatisztika;
- Hall of Fame;
- felhasználók;
- session mentés.

A jelenlegi játékhoz még nem szükséges.

## P3 – Hangvezérlés / Whisper

A lobbyban már elkészült a **Hangfelismerés** beállítási szekció. Jelenleg
placeholder, a vezérlők inaktívak. A Whisper-integráció során ezt kell
funkcionálisan bekötni.

Tervezett magyar parancsok:

- „Pörgetek”
- „K mint Károly”
- „A betű”
- „Megfejtem”
- teljes megfejtés diktálása

Javasolt architektúra:

```text
browser
  ↓ audio
local / server Whisper
  ↓ normalized command
game input API
```

A hangvezérlést érdemes csak a billentyűzetes input teljes stabilizálása után
bevezetni.

## P3 – Refaktor

Az `app.js` egyre nagyobb.

Javasolt későbbi bontás:

```text
src/
├── config.js
├── game-state.js
├── puzzle.js
├── wheel.js
├── victory.js
├── bot.js
├── audio.js
└── ui.js
```

Ezt csak akkor érdemes megtenni, amikor a fő játékmenet már stabil.

## Ajánlott sorrend

1. `data/puzzles.json` + validátor
2. teljes scoreboard
3. hangok / kerék tick
4. Magánhangzó UI refaktor
5. game-session / végső győztes
6. mobil input és reszponzivitás
7. Bot fejlesztés
8. app.js moduláris refaktor
9. backend / SQLite
10. Whisper hangvezérlés

## Rövid következő sprint

A következő kis, jól lezárható fejlesztési csomag szerintem:

**Puzzle adatforrás + validáció + scoreboard**

Ez már látványosan javítaná a játék használhatóságát, miközben nem kell
megbolygatni a most stabil kerék / solve / victory folyamatot.
