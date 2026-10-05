# KriszWheel

Magyar nyelvű, böngészős Szerencsekerék-játék saját lobbyval, TV-stúdió jellegű
játékszínpaddal, Phaser 3 kerékanimációval, billentyűzetes betűbevitellel,
Bot-játékossal, győzelmi effektekkel és központi konfigurációval.

A projekt jelenleg frontend-only alkalmazás: nincs backend vagy adatbázis.
A böngészős hangvezérlés már integrált; a Whisper provider későbbi bővítési
lehetőség.

## Jelenlegi állapot

### Lobby

Választható játékosok:

- Krisz
- Adri
- Alíz
- Bot
- Vendég 1
- Vendég 2

Minimum két játékos szükséges. Alapértelmezett kijelölés: Krisz + Bot.

A lobbyban külön nehézségválasztó is van:

- Gyerek
- Könnyű
- Közepes
- Nehéz

Alapértelmezés: **Könnyű**.

A választás `puzzleDifficulty` néven azonnal mentődik. **Éles** feladványmódban
ez választja ki a betöltött CSV-adatforrást:

- Gyerek → `data/child.csv`
- Könnyű → `data/low.csv`
- Közepes → `data/med.csv`
- Nehéz → `data/high.csv`

Mind a négy éles lista jelenleg 100 egyedi feladványt tartalmaz.

Az éles feladványokhoz tartós kijátszási előzmény tartozik. Ha egy feladvány
egyszer már megjelent, ugyanazon böngészőben többé nem kerül újra kiválasztásra.
Az előzmény nehézségenként külön tárolódik, és az index mellett a normalizált
feladványszöveget is megőrzi, így CSV-átrendezés után sem tér vissza egy már
látott feladvány.

Új feladványkészlet kiadásakor az előzmény globálisan nullázható a
`python tools/reset_puzzle_history.py` paranccsal létrehozott új reset marker
commitolásával.

A lobby saját stúdió-hátteret és játékosportrékat használ.

A lobby jobb alsó sarkában build-információ látszik, például:
`v0.8.0 · 2026.10.05 · ÉLES / KÖZEPES`. Teszt módban csak `TESZT`
jelenik meg. Hoverre a konkrét feladványforrás látszik, és betöltés után az
aktuálisan betöltött feladványszám is megjelenik.

A lobbyban külön **Beállítások** gomb található. A Beállítások nézet két
szekcióból áll:

- **Általános beállítások** – hangok, fő hangerő, Auto pörgetés és feladványmód;
- **Hangfelismerés** – előkészített hely a hamarosan érkező magyar
  hangvezérléshez.

A felhasználói beállítások böngészőnként, `localStorage`-ban mentődnek.

Az **Auto pörgetés** alapból ki van kapcsolva. Bekapcsolva emberi játékosnál,
`spin` fázisban rövid késleltetés után automatikusan elindítja a kereket.

A **Feladványmód** alapértéke `Teszt`. Teszt módban a beépített minták,
Éles módban a kiválasztott nehézséghez tartozó CSV töltődik be. Induláskor
a játék csak azt ellenőrzi, hogy legalább 1 érvényes feladvány legyen benne;
hibás, hiányzó vagy üres fájlnál nem indul el csendben fallbackkel.

A Hangfelismerés szekció kezeli az engedélyezést, a Browser SpeechRecognition
providert, a magyar nyelvet, a mikrofon kiválasztását és a böngészőtámogatás
visszajelzését. A voice modulok a játékmenetre is rá vannak kötve.

### Játékszínpad

Háttér:

`assets/images/studo_jatekszinpad.png`

Natív méret:

`1672 × 941 px`

A háttér fölött külön HTML, SVG és Phaser rétegek működnek.

Jelenlegi funkciók:

- 15 × 4-es feladványtábla;
- vízszintes és függőleges **közép–közép** elrendezés;
- kategória;
- használt betűk;
- aktuális játékos avatarja, neve és fordulópénze;
- Pörgetés;
- Magánhangzó képi hotspot;
- Megfejtés;
- jobb felső Játék vége;
- Teszt debug gomb;
- Phaser kerék-overlay;
- színpadi visszajelzések;
- teljes győzelmi overlay Phaser tűzijátékkal.

### Szerencsekerék

Asset:

`assets/images/wheel.png`

A jelenlegi konfiguráció:

- 24 képi cikkely;
- 12 logikai mező × 2 ismétlés;
- a feliratokat Phaser rajzolja rá;
- 2–3 teljes fordulat;
- 3600 ms pörgetés;
- `Cubic.easeOut`;
- megállás után nagy eredmény középen;
- 1500 ms után automatikus eredményalkalmazás.

A kerék viselkedése a `config/game-config.js` fájlból állítható.

### Betűbevitel

A betűket közvetlenül a fizikai billentyűzetről adjuk meg.

- kisbetű = nagybetű;
- magyar ékezetes betűk támogatottak;
- mássalhangzó pénzmezős pörgetés után adható meg;
- magánhangzó közvetlen billentyűleütéssel vásárolható;
- nincs külön betűbeviteli dialog.

A látható Magánhangzó gomb hoverre akkor is felvillan, ha logikailag éppen
disabled. Ez kizárólag vizuális visszajelzés.

### Megfejtés

A Megfejtés dialog submit után azonnal bezár.

- hibás válasz: `HELYTELEN MEGFEJTÉS` színpadi visszajelzés;
- helyes válasz: előbb végigfut a hiányzó betűk felfedése;
- csak ezután jelenik meg a győzelmi képernyő.

### Játékosváltás

A játékosváltás nem azonnali.

Alap szünet:

`1000 ms`

Konfiguráció:

`gameplay.playerSwitchDelayMs`

A szünet alatt a vezérlés tiltott és rövid színpadi visszajelzés látható.

### Győzelmi képernyő

Sikeres megfejtés után:

- győztes avatar;
- győztes neve;
- megfejtett feladvány;
- forduló nyereménye;
- összesített nyeremény;
- az aktuális játék teljes állása minden résztvevő eddig megnyert pénzével;
- Phaser tűzijáték.

A játékállás kizárólag a `totalMoney` értéket mutatja. A még futó forduló
`roundMoney` értéke nem számít megszerzett pénznek.

A gombok késleltetve válnak aktívvá:

- `Következő feladvány`
- `Játék vége`

A győzelmi képernyő `Játék vége` gombja közvetlenül a lobbyba visz.

### Játék vége

Két út van:

1. jobb felső `Játék vége` → megerősítő dialog;
2. győzelmi képernyő `Játék vége` → közvetlen lobby.

### Hangok és zene

Jelenlegi SFX:

- `letter_hit.wav`
- `letter_miss.mp3`
- `solve_fail.wav`

Zenei / atmoszféra sávok:

- `wheel_spinning.mp3` – csak a tényleges kerékforgás alatt;
- `lobby_music.mp3` – lobby és Beállítások;
- `winner_music.mp3` – sikeres megfejtéskor fokozatos fade-innel;
- `game_music.mp3` – diszkrét, loopolt játékzene.

A négy sáv külön engedélyezhető és külön hangerőt kap a Beállításokban. A
`masterVolume` mindegyikre közös szorzó.

A játékzene a stage bal felső `♫ Játékzene` gombjával játék közben is
azonnal ki-/bekapcsolható; ez a választás mentődik.

A mikrofon runtime állapota globális a játékban: bármely emberi játékos
ki- vagy bekapcsolhatja, és az állapot játékosváltáskor megmarad. Bot körében
a mikrofon gomb le van tiltva és a listening szünetel; a következő emberi
játékosnál a globális mikrofonállapot ismét érvényesül.

Ha a globális mikrofon be van kapcsolva és emberi játékos van soron, a
játékzene a voice konfiguráció szerint némítható. Pörgetés közben a mikrofon
szünetel, majd a kerék megállásakor visszakapcsol.

Alap ritmus:

`500 ms`

## Pénzmodell

Játékosonként:

- `roundMoney` – aktuális feladványban megszerzett pénz;
- `totalMoney` – már megnyert fordulók összesített pénze.

Mássalhangzó-találat:

```text
találatok száma × kipörgetett összeg
```

Sikeres megfejtéskor a `roundMoney` hozzáadódik a `totalMoney` értékhez.

## Indítás

### Windows

```text
start.bat
```

A script:

1. a repository mappájára vált;
2. `git pull --ff-only origin main`;
3. elindítja a webszervert 8080 porton;
4. `python`, majd `py -3` fallbacket használ.

Elérés:

```text
http://localhost:8080
```

Leállítás:

`Ctrl+C`

### Kézzel

```powershell
git pull --ff-only origin main
python -m http.server 8080
```

## Konfiguráció

Központi fájl:

`config/game-config.js`

Fő csoportok:

- `app` – verzió és build dátum;
- `gameplay`;
- `puzzles` – éles CSV-források;
- `wheel`;
- `bot`;
- `audio`;
- `victory`;
- `debug`.

Részletes referencia:

[config/README.md](config/README.md)

## Dokumentáció

- [Játékszabály és játékfolyam](docs/GAMEPLAY.md)
- [Architektúra](docs/ARCHITECTURE.md)
- [Játékszínpad és UI](docs/STAGE_UI.md)
- [Fejlesztői útmutató](docs/DEVELOPMENT.md)
- [Beállítások](docs/SETTINGS.md)
- [Voice recognition integráció](docs/VOICE_RECOGNITION.md)
- [Roadmap](docs/ROADMAP.md)
- [Továbbfejlesztési ötletek](docs/IDEAS.md)
- [Konfigurációs referencia](config/README.md)
- [Feladványadatok és CSV-formátum](data/README.md)

## Projektstruktúra

```text
kriszwheel/
├── app.js
├── index.html
├── styles.css
├── start.bat
├── README.md
├── config/
│   ├── game-config.js
│   ├── voice-config.js
│   ├── hungarian-names.js
│   └── README.md
├── data/
│   ├── child.csv
│   ├── low.csv
│   ├── med.csv
│   ├── high.csv
│   └── README.md
├── docs/
│   ├── ARCHITECTURE.md
│   ├── DEVELOPMENT.md
│   ├── GAMEPLAY.md
│   ├── IDEAS.md
│   ├── ROADMAP.md
│   ├── SETTINGS.md
│   ├── STAGE_UI.md
│   └── VOICE_RECOGNITION.md
├── tools/
│   ├── validate_puzzles.py
│   └── reset_puzzle_history.py
├── speech/
│   ├── provider.js
│   ├── browser-provider.js
│   ├── parsers.js
│   └── voice-engine.js
└── assets/
    ├── images/
    │   ├── adri.png
    │   ├── bot.png
    │   ├── guest1.png
    │   ├── guest2.png
    │   ├── krisz.png
    │   ├── lizus.png
    │   ├── studio_lobby.png
    │   ├── studo_jatekszinpad.png
    │   └── wheel.png
    └── sound/
        └── sfx/
```

## Technológia

- HTML5
- CSS3
- vanilla JavaScript
- SVG
- Phaser 3.90
- statikus HTTP szerver

Nincs build lépés és nincs Node.js-függőség.

## Következő lépések

A részletes, priorizált terv:

[docs/ROADMAP.md](docs/ROADMAP.md)
