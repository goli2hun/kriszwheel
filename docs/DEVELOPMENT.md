# KriszWheel – fejlesztői útmutató

## 1. Előfeltételek

Lokális futtatáshoz:

- Git
- Python 3
- modern böngésző
- internetkapcsolat a Phaser CDN első betöltéséhez

Nincs szükség:

- Node.js-re;
- npm-re;
- build parancsra;
- adatbázisra.

## 2. Repository frissítése és indítás

### start.bat

Windows alatt a legegyszerűbb:

```text
start.bat
```

A script:

```text
cd a repo gyökerére
→ git pull --ff-only origin main
→ python -m http.server 8080
```

Ha `python` nincs, `py -3` fallbacket próbál.

### Kézzel

```powershell
git pull --ff-only origin main
python -m http.server 8080
```

Böngésző:

```text
http://localhost:8080
```

## 3. Gyors ellenőrzési lista

Módosítás után érdemes végigpróbálni:

1. lobby betöltődik;
2. legalább két játékos kiválasztható;
3. játék indul;
4. puzzle megjelenik;
5. pörgetés overlay feljön;
6. kerék megáll és eredményt mutat;
7. overlay automatikusan bezár;
8. kisbetű/nagybetű egyaránt működik;
9. több találat sorban villan fel;
10. pontozás helyes;
11. magánhangzó ára levonódik;
12. megfejtés elküldésekor a dialog azonnal bezár;
13. helytelen megfejtés látható visszajelzést ad;
14. helyes megfejtésnél a betűk a fordulóvégi dialog előtt fedődnek fel;
15. játékosváltás előtt lefut a konfigurált szünet;
16. forduló vége működik;
17. Játék vége visszavisz a lobbyba;
18. Teszt gomb csak akkor látszik, ha engedélyezett.

## 4. Konfiguráció módosítása

A legtöbb hangolási feladathoz ne az `app.js`-t módosítsd.

Először nézd meg:

`config/game-config.js`

Például pörgetés:

```js
wheel: {
  minFullTurns: 2,
  maxFullTurns: 3,
  spinDurationMs: 3600,
  easing: "Cubic.easeOut",
  resultDisplayMs: 1500
}
```

Módosítás után böngészőfrissítés elegendő.

## 5. Kerék asset cseréje

Új kerék esetén:

1. tedd az assetet az `assets/images/` könyvtárba;
2. állítsd a `wheel.image` értéket;
3. számold meg a cikkelyeket;
4. ellenőrizd:
   `segments.length × segmentRepeat = képi cikkelyszám`;
5. szükség esetén állítsd:
   - `startOffsetDeg`;
   - `pointerAngleDeg`;
   - `labelRadius`;
   - `wheelSize`;
6. tesztelj több célmezőt.

## 6. Kerék feliratok

A PNG-be ne égess pénzösszegeket, ha nem szükséges.

A projekt jelenlegi elve:

- PNG → csak vizuális kerék;
- config → logikai mezők;
- Phaser Text → feliratok.

Ez biztosítja, hogy a kerék vizuálisan cserélhető maradjon.

## 7. Stúdió háttér cseréje

A stage háttér erősen koordinátafüggő.

Csere után újra kell ellenőrizni:

- `STAGE_GRID`;
- kategóriasáv;
- használt betűk;
- gomb-hotspotok;
- avatarpanel;
- játék vége;
- Teszt gomb.

A stage koordináták dokumentációja:

[STAGE_UI.md](STAGE_UI.md)

## 8. Új feladvány hozzáadása

Jelenleg az `app.js` `PUZZLES` tömbjéhez adj új elemet:

```js
{ category: "Film", text: "VALAMILYEN FELADVÁNY" }
```

Fontos:

- a szöveg nagybetűs legyen a jelenlegi adatkészlet konvenciója szerint;
- férjen el 15 × 4 cellán;
- hosszú szavak esetén teszteld a tördelést.

Későbbi terv: külön JSON/SQLite adatforrás.

## 9. Új játékos hozzáadása

Jelenleg több helyen kell módosítani:

- lobby checkbox az `index.html`-ben;
- profilkép az `assets/images/` alatt;
- `PLAYER_IMAGES` mapping az `app.js`-ben.

A Bot speciális:

```js
isBot: name === "Bot"
```

Új bot-típushoz ez a logika refaktorálandó.

## 10. Hangok cseréje

A fájlok elérési útja konfigurálható:

```js
audio: {
  files: {
    letterHit: "...",
    letterMiss: "...",
    solveSuccess: "...",
    solveFail: "..."
  }
}
```

A hangerők szintén konfigurálhatók.

## 11. Debug

A Teszt gomb:

```js
debug: {
  showTestButton: true
}
```

Release-jellegű tesztnél állítsd `false`-ra.

## 12. Gyakori hibák

### A wheel overlay nem jelenik meg

Ellenőrizd:

- Phaser CDN betöltődött-e;
- `wheel.image` útvonal helyes-e;
- böngésző console hibáit;
- az asset elérhető-e HTTP-n.

### A kerék rossz mezőn áll meg

Ellenőrizd:

- képi cikkelyszám;
- `segments × segmentRepeat`;
- `startOffsetDeg`;
- `pointerAngleDeg`.

### A feliratok nem a cikkelyek közepén vannak

Állítsd:

- `labelRadius`;
- `startOffsetDeg`.

### A stage gomb nem ott kattintható, ahol látszik

A háttérkép geometria megváltozott. A CSS hotspot koordinátákat újra kell mérni.

### A start.bat nem frissít

A `git pull --ff-only` szándékosan megáll, ha a branch nem frissíthető
fast-forward módon. Ez védi a helyi munkát.

## 13. Dokumentációs szabály

Funkciómódosításnál frissítsd:

- `README.md` – ha felhasználói szinten változik;
- `docs/GAMEPLAY.md` – ha szabály változik;
- `docs/ARCHITECTURE.md` – ha state/fájlstruktúra változik;
- `docs/STAGE_UI.md` – ha UI/koordináta/Phaser változik;
- `config/README.md` – ha config kulcs változik.
