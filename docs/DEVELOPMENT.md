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
6. Auto pörgetés alapból KI;
7. Auto pörgetés menthető és frissítés után megmarad;
8. Feladványmód alapból Teszt;
9. Feladványmód Teszt / Éles választása menthető;
10. Feladványmód választás még nem változtatja meg a betöltött PUZZLES forrást;
11. Vissza gomb eldobja a nem mentett módosítást;
12. Hangfelismerés támogatási státusz megjelenik;
13. mikrofonlista betölt;
14. Frissítés szükség esetén mikrofonengedélyt kér;
15. provider, nyelv, engedélyezés és mikrofon menthető;
16. játék indul;
17. Auto pörgetés KI mellett emberi spin fázisban nem indul automatikus kerék;
18. Auto pörgetés BE mellett emberi spin fázisban automatikus kerék indul;
19. kézi pörgetés törli a függő auto-pörgetést, nincs dupla spin;
20. Bot körében az Auto pörgetés nem avatkozik be;
21. mikrofon gomb látható az aktuális avatar fölött;
22. hangfelismerés tiltott settings esetén a mikrofon gomb disabled;
23. engedélyezett settings mellett a mikrofon gomb bekapcsolható;
24. HANG TESZT panel interim transcriptet mutat;
25. HANG TESZT panel final transcriptet mutat;
26. `Pörgetés` hangparancs spin fázisban elindítja a kereket;
27. pénzmező után `B mint Balázs` mássalhangzót ad be;
28. `Magánhangzó` után `A mint Alma` vásárlást indít;
29. közvetlen `A mint Alma` is működik spin/letter fázisban;
30. `Megfejtés` után a következő transcript válaszként értékelődik;
31. `Megfejtés <teljes válasz>` egymondatos forma működik;
32. Bot körében voice esemény nem hajt végre játékakciót;
33. mikrofon KI után nincs voice akció;
34. lobbyba visszatérés leállítja a mikrofon streamet;
35. puzzle közép–közép;
36. Pörgetés hover;
37. Magánhangzó hover disabled állapotban is;
38. Megfejtés hover;
39. wheel overlay feljön;
40. kerék célmezőre áll;
41. eredmény automatikusan eltűnik;
42. kis/nagybetű működik;
43. ékezetes betű működik;
44. több találat sorban villan;
45. hangok sorban szólnak;
46. magánhangzó ára levonódik;
47. hibás solve dialog azonnal bezár;
48. helytelen feedback látszik;
49. játékosváltási szünet működik;
50. helyes solve után teljes betűfelfedés és letter_hit hangsor lefut;
51. victory overlay megjelenik;
52. győztes avatarja és pénzei helyesek;
53. Játék állása minden aktuális játékost egymás alatt jelenít meg;
54. standings csak `totalMoney` értéket mutat, folyó `roundMoney`-t nem;
55. standings avatarok és nyeremények nagyobb méretben látszanak, a forduló nyertese kiemelve;
56. victory / játék vége folyamat működik.

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
