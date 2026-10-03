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
3. játék indul;
4. puzzle közép–közép;
5. Pörgetés hover;
6. Magánhangzó hover disabled állapotban is;
7. Megfejtés hover;
8. wheel overlay feljön;
9. kerék célmezőre áll;
10. eredmény automatikusan eltűnik;
11. kis/nagybetű működik;
12. ékezetes betű működik;
13. több találat sorban villan;
14. hangok sorban szólnak;
15. magánhangzó ára levonódik;
16. hibás solve dialog azonnal bezár;
17. helytelen feedback látszik;
18. játékosváltási szünet működik;
19. helyes solve után teljes betűfelfedés lefut;
20. victory overlay megjelenik;
21. avatar és pénzek helyesek;
22. tűzijáték fut;
23. victory gombok késleltetve aktívak;
24. Következő feladvány működik;
25. victory Játék vége lobbyba visz;
26. stage Játék vége megerősítést kér;
27. Teszt gomb config szerint működik.

## 4. Config-first szabály

Hangolás előtt mindig nézd meg:

`config/game-config.js`

Ne hardcode-olj olyan értéket az `app.js`-be, ami configból kezelhető.

## 5. Kerék csere

Új assetnél:

1. asset az `assets/images/` alá;
2. `wheel.image`;
3. cikkelyszám;
4. `segments.length × segmentRepeat`;
5. `startOffsetDeg`;
6. `pointerAngleDeg`;
7. `labelRadius`;
8. több célmező tesztje.

## 6. Stage háttér csere

Újramérendő:

- STAGE_GRID;
- category;
- used letters;
- fő hotspotok;
- avatarpanel;
- feedback;
- debug/game-end.

## 7. Új puzzle

Jelenleg az `app.js` `PUZZLES` tömbjébe kerül.

Fontos:

- férjen el 15 × 4 cellán;
- hosszú szó esetén tördelést tesztelni;
- kategóriát megadni.

## 8. Új játékos

Módosítandó:

- index.html lobby;
- portré asset;
- `PLAYER_IMAGES` mapping.

## 9. Hangcsere

A fájlutak és fontos hangerők configból állíthatók.

## 10. Victory tuning

Config:

- fireworks;
- fireworksDurationMs;
- burstIntervalMs;
- particlesPerBurst;
- buttonDelayMs;
- colors.

## 11. Debug

`debug.showTestButton`

Release-jellegű tesztnél célszerű false.

## 12. Gyakori hibák

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

## 13. Dokumentációs szabály

Funkciómódosításnál:

- README – felhasználói szint;
- GAMEPLAY – szabály;
- ARCHITECTURE – state / technika;
- STAGE_UI – UI / koordináta;
- DEVELOPMENT – fejlesztői workflow;
- config/README – config kulcs;
- ROADMAP – terv változás.
