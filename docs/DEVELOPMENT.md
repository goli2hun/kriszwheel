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

1. lobby betölt;
2. játékosválasztás működik;
3. Beállítások nézet megnyílik;
4. Auto pörgetés és Feladványmód menthető;
5. játék indul;
6. manuális mikrofon BE az aktuális emberi játékost voice ownerként eltárolja;
7. pörgetés indulásakor a mikrofon automatikusan leáll, owner megmarad;
8. pénzmező után owner körében a mikrofon automatikusan visszakapcsol;
9. játékosváltáskor a mikrofon azonnal leáll;
10. másik játékos körében a mikrofon nem indul vissza;
11. owner következő körében a mikrofon spin előtt nem indul vissza;
12. owner következő körében a mikrofon csak a pörgetés után indul vissza;
13. következő játékos megjelenése után `turnReadyDelayMs` várakozás történik;
14. `turnReady` alatt kézi vezérlés, Bot és Auto pörgetés nem indul;
15. Auto pörgetés KI/BE viselkedése helyes;
16. kézi pörgetés törli a függő auto-pörgetést;
17. Bot körében az Auto pörgetés nem avatkozik be;
18. HANG TESZT panel interim/final transcriptet mutat;
19. `Pörgetés` hangparancs működik;
20. `B mint Balázs` mássalhangzó működik;
21. `Magánhangzó` + betű működik;
22. `Megfejtés` voice flow működik;
23. lobbyba visszatérés leállítja a mikrofont és törli az ownert;
24. puzzle és kerék flow működik;
25. hibás/helyes solve flow működik;
26. victory overlay és standings működik;
27. játék vége flow működik.

## 4. Beállítások tesztelése

A lobby Beállítások nézete nem a statikus configot módosítja.

Ellenőrzés:

1. kapcsold ki a hangokat, Mentés, indíts játékot;
2. ellenőrizd, hogy nincs SFX;
3. menj vissza a lobbyba, nyisd meg újra a Beállításokat;
4. az állapot maradjon meg;
5. állítsd a fő hangerőt például 25%-ra, Mentés;
6. indíts játékot és ellenőrizd a halkabb SFX-et;
7. módosíts értéket mentés nélkül, majd Vissza;
8. újranyitva a legutóbb mentett érték jelenjen meg.

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
