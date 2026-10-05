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
2. első user gesture után lobby zene hallható, ha engedélyezett;
3. Beállításokban mind a négy zenei elem enable + hangerő értéke menthető;
4. játék indításakor lobby zene leáll;
5. engedélyezett játékzene diszkréten elindul;
6. stage `♫ Játékzene` kapcsoló azonnal ki-/bekapcsol és ment;
7. pörgetés teljes ideje alatt `wheel_spinning.mp3` szól;
8. kerék megállásakor a forgási hang leáll;
9. mikrofon bekapcsolásakor a játékzene lehalkul;
10. mikrofon szünetelésekor a játékzene visszaerősödik;
11. sikeres megfejtéskor a játékzene leáll/fade-el;
12. winner music nulláról fokozatosan felerősödik;
13. következő feladványnál winner music leáll és game music visszatér;
14. lobbyba visszatéréskor game/winner/wheel zene leáll, lobby music elindul;
15. masterVolume minden zenei sáv tényleges hangerejét szorozza;
16. zenei kapcsolók KI állapotában az adott sáv nem indul;
17. voice owner / turnReady / Auto pörgetés regresszió nélkül működik;
18. puzzle, solve, victory és játék vége flow működik.

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
