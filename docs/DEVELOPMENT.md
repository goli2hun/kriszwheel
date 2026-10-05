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
4. hangok be/ki kapcsoló menthető;
5. fő hangerő menthető és frissítés után is megmarad;
6. Vissza gomb eldobja a nem mentett módosítást;
7. Hangfelismerés támogatási státusz megjelenik;
8. mikrofonlista betölt;
9. Frissítés szükség esetén mikrofonengedélyt kér;
10. provider, nyelv, engedélyezés és mikrofon menthető;
11. játék indul;
12. puzzle közép–közép;
13. Pörgetés hover;
14. Magánhangzó hover disabled állapotban is;
15. Megfejtés hover;
16. wheel overlay feljön;
17. kerék célmezőre áll;
18. eredmény automatikusan eltűnik;
19. kis/nagybetű működik;
20. ékezetes betű működik;
21. több találat sorban villan;
22. hangok sorban szólnak;
23. magánhangzó ára levonódik;
24. hibás solve dialog azonnal bezár;
25. helytelen feedback látszik;
26. játékosváltási szünet működik;
27. helyes solve után teljes betűfelfedés lefut;
28. victory overlay megjelenik;
29. avatar és pénzek helyesek;
30. tűzijáték fut;
31. victory gombok késleltetve aktívak;
32. Következő feladvány működik;
33. victory Játék vége lobbyba visz;
34. stage Játék vége megerősítést kér;
35. Teszt gomb config szerint működik.

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
