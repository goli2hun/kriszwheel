# KriszWheel – fejlesztői útmutató

## 1. Előfeltételek

- Git
- Python 3
- modern böngésző
- internet a Phaser CDN miatt

Nincs szükség Node.js-re vagy buildre.

## 2. Indítás

Windows:

`start.bat`

Kézzel:

```powershell
git pull --ff-only origin main
python -m http.server 8080
```

URL:

`http://localhost:8080`

## 3. Teljes smoke test

Módosítás után:

1. lobby JavaScript hiba nélkül betölt;
2. nehézségválasztó 4 gombja megjelenik;
3. egyszerre pontosan egy nehézség aktív;
4. első induláskor a Könnyű aktív;
5. Gyerek / Könnyű / Közepes / Nehéz választás kattintható;
6. a választás frissítés után megmarad;
7. Teszt módban a beépített mintafeladványokból választ;
8. Éles módban Gyerek / Könnyű / Közepes / Nehéz rendre a
   `child.csv` / `low.csv` / `med.csv` / `high.csv` fájlból tölt;
9. mind a négy éles CSV 100 érvényes és egyedi feladványt tartalmaz;
10. hiányzó vagy rövid éles CSV esetén a játék hibát jelez és nem indul;
11. a lobby jobb alsó build-információja frissül mód- és nehézségváltáskor;
12. játékosválasztás és játékindítás regresszió nélkül működik;
13. voice / zene / Auto pörgetés flow működik;
14. sikeres mássalhangzó után nincs pörgetés az utolsó felfedés + post-delay előtt;
15. puzzle, solve, victory és játék vége flow működik.

## 4. Beállítások tesztelése

Ellenőrzés:

1. rövid SFX ki/be és fő hangerő menthető;
2. mind a négy zenei sáv enable + hangerő menthető;
3. 50% master × 30% lobby = kb. 15% tényleges célhangerő;
4. kerékhang kikapcsolható úgy, hogy a többi zene megmarad;
5. stage Játékzene gomb ki-/bekapcsol és perzisztál;
6. mikrofon alatt game music ducking hallható;
7. módosítás mentés nélkül + Vissza esetén a korábbi mentett érték tér vissza.

Részletek:

- [SETTINGS.md](SETTINGS.md)
- [VOICE_RECOGNITION.md](VOICE_RECOGNITION.md)

## 5. Config-first szabály

Hangolás előtt mindig nézd meg:

`config/game-config.js`

Ne hardcode-olj olyan értéket az `app.js`-be, ami configból kezelhető.

## 6. Kerék csere

Új assetnél:

1. asset az `assets/images/` alá;
2. `wheel.image`;
3. cikkelyszám;
4. `segments.length × segmentRepeat`;
5. `startOffsetDeg`;
6. `pointerAngleDeg`;
7. `labelRadius`;
8. több célmező tesztje.

## 7. Stage háttér csere

Újramérendő:

- STAGE_GRID;
- category;
- used letters;
- fő hotspotok;
- avatarpanel;
- feedback;
- debug/game-end.

## 8. Puzzle validátor

Minden feladványmódosítás után futtasd:

```powershell
python tools/validate_puzzles.py
```

A hibás feladványsorok automatikus törléséhez:

```powershell
python tools/validate_puzzles.py --javitas
```

A javító mód után mindig nézd meg az elemszámot is: a törölt sorokat új,
érvényes feladványokkal pótolni kell, hogy minden éles lista ismét elérje a
100 elemet.

A script magyar kimenetet ad. A `[HIBA]` jelölések javítandók; ezeknél a
folyamat exit kódja 1. A szintek közötti ismétlések
`[FIGYELMEZTETÉS]` szinten jelennek meg.

A validátor a játék `layoutPuzzleRows()` logikájának 15 × 4-es
korlátozását modellezi, így kiszúrja azokat a feladványokat is, amelyek
runtime fallbackkel csonkolódnának.

## 9. Új puzzle

Tesztfeladványt az `app.js` `PUZZLES` tömbjébe lehet tenni.

Éles feladványt a megfelelő CSV-be kell felvenni:

- `data/child.csv`
- `data/low.csv`
- `data/med.csv`
- `data/high.csv`

CSV fejléc:

```csv
category,puzzle
```

Fontos:

- maradjon meg a fejléc;
- minden sorban legyen kategória és feladvány;
- ne legyen duplikált feladvány ugyanabban a listában;
- férjen el 15 × 4 cellán;
- hosszú szó esetén tördelést tesztelni;
- a lista érje el a `puzzles.expectedCountPerDifficulty` minimumot.

## 10. Új játékos

Módosítandó:

- index.html lobby;
- portré asset;
- `PLAYER_IMAGES` mapping.

A jelenlegi játékosok:

- Krisz
- Adri
- Alíz
- Bot
- Vendég 1
- Vendég 2

A két vendég PNG avatart használ:

- `assets/images/guest1.png`
- `assets/images/guest2.png`

A Vendég 1 és Vendég 2 avatarjai ugyanarra a képkivágásra és méretre
készülnek, mint Krisz, Adri, Alíz és Bot. Nem használnak külön crop,
zoom, pozíció vagy guest-specifikus CSS szabályt; minden avatar ugyanazt
az `.avatar-photo`, stage és victory megjelenítést kapja.

A Bot felismerése továbbra is:

```js
isBot: name === "Bot"
```

Ezért a Vendég 1 és Vendég 2 automatikusan emberi játékosként működik.

## 11. Hangcsere

A fájlutak és fontos hangerők configból állíthatók.

## 12. Victory tuning

Config:

- fireworks;
- fireworksDurationMs;
- burstIntervalMs;
- particlesPerBurst;
- buttonDelayMs;
- colors.

## 13. Debug

`debug.showTestButton`

Release-jellegű tesztnél célszerű false.

## 14. Gyakori hibák

### Rossz mezőn áll meg a kerék

Ellenőrizd:

- cikkelyszám;
- repeat;
- startOffsetDeg;
- pointerAngleDeg.

### Stage hotspot elcsúszik

Háttérgeometria változott.

### Phaser nem indul

Ellenőrizd a CDN-t és a console-t.

### start.bat nem pullol

A `--ff-only` szándékosan nem írja felül a helyi munkát.

## 15. Dokumentációs szabály

Funkciómódosításnál:

- README – felhasználói szint;
- GAMEPLAY – szabály;
- ARCHITECTURE – state / technika;
- STAGE_UI – UI / koordináta;
- DEVELOPMENT – fejlesztői workflow;
- SETTINGS – lobby és felhasználói beállítások;
- config/README – statikus config kulcs;
- ROADMAP – terv változás.


## 16. Verziózás

A lobbyban megjelenő verzió és build dátum:

`config/game-config.js -> app.version / app.buildDate`

Új tesztelési csomagnál ezt a két értéket érdemes együtt frissíteni.


## 17. Puzzle-előzmény nullázása

A böngészős puzzle-history közvetlenül Pythonból nem írható megbízhatóan.
Ezért a projekt reset marker mechanizmust használ.

Új feladványcsomag kiadásakor futtasd:

```powershell
python tools/reset_puzzle_history.py
```

A script új `resetId` értéket ír ide:

`data/puzzle-history-reset.json`

A játék következő indításakor összeveti ezt a böngészőben utoljára alkalmazott
reset azonosítóval. Ha új resetet talál:

1. törli a `kriszwheel.puzzle-history.v1` localStorage kulcsot;
2. üres előzményt hoz létre;
3. eltárolja az alkalmazott reset ID-t;
4. a resetet ugyanabban a böngészőben nem futtatja le újra.

Ha minden telepítésen / gépen nullázni szeretnéd az előzményt, a
`data/puzzle-history-reset.json` módosítását is commitolni és deployolni kell.


## 18. Haladó névfelismerés bővítése

A névlista itt található:

`config/hungarian-names.js`

Új magyar keresztnév felvételéhez a megfelelő betű tömbjéhez add hozzá a
nevet:

```js
B: ["Béla", "Botond", "Balázs"]
```

Parserkód módosítása nem szükséges.

Speciális, nem normál keresztnév-alapú alakot az `exceptions` tömbben adj
meg:

```js
{ value: "Y", aliases: ["ypszilon", "ipszilon"] }
```

Smoke test új név vagy parsermódosítás után:

1. Haladó névfelismerés KI → az önálló név ne adjon LETTER eseményt;
2. Haladó névfelismerés BE → `Anna` → A;
3. ugyanarra a betűre több név működjön;
4. `Ypszilon` → Y;
5. a régi `B mint Balázs` forma továbbra is működjön;
6. magánhangzó módban például `Magánhangzó Anna` → A;
7. részszó ne váltson ki téves találatot.
