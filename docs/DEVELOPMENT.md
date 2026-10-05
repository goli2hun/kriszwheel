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
7. `pickPuzzle()` továbbra sem használja a `puzzleDifficulty` értéket;
8. játékosválasztás és játékindítás regresszió nélkül működik;
9. voice / zene / Auto pörgetés flow működik;
10. puzzle, solve, victory és játék vége flow működik.

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

## 8. Új puzzle

Jelenleg az `app.js` `PUZZLES` tömbjébe kerül.

Fontos:

- férjen el 15 × 4 cellán;
- hosszú szó esetén tördelést tesztelni;
- kategóriát megadni.

## 9. Új játékos

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

## 10. Hangcsere

A fájlutak és fontos hangerők configból állíthatók.

## 11. Victory tuning

Config:

- fireworks;
- fireworksDurationMs;
- burstIntervalMs;
- particlesPerBurst;
- buttonDelayMs;
- colors.

## 12. Debug

`debug.showTestButton`

Release-jellegű tesztnél célszerű false.

## 13. Gyakori hibák

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

## 14. Dokumentációs szabály

Funkciómódosításnál:

- README – felhasználói szint;
- GAMEPLAY – szabály;
- ARCHITECTURE – state / technika;
- STAGE_UI – UI / koordináta;
- DEVELOPMENT – fejlesztői workflow;
- SETTINGS – lobby és felhasználói beállítások;
- config/README – statikus config kulcs;
- ROADMAP – terv változás.
