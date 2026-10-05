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

A lobby saját stúdió-hátteret és játékosportrékat használ.

A lobby jobb alsó sarkában build-információ látszik, például:
`v0.8.0 · 2026.10.05 · ÉLES / KÖZEPES`. Teszt módban csak `TESZT`
jelenik meg. Hoverre a konkrét feladványforrás és az elvárt elemszám is
kiolvasható.

A lobbyban külön **Beállítások** gomb található. A Beállítások nézet két
szekcióból áll:

- **Általános beállítások** – hangok, fő hangerő, Auto pörgetés és feladványmód;
- **Hangfelismerés** – előkészített hely a hamarosan érkező magyar
  hangvezérléshez.

A felhasználói beállítások böngészőnként, `localStorage`-ban mentődnek.

Az **Auto pörgetés** alapból ki van kapcsolva. Bekapcsolva emberi játékosnál,
`spin` fázisban rövid késleltetés után automatikusan elindítja a kereket.

A **Feladványmód** alapértéke `Teszt`. Teszt módban a beépített minták,
Éles módban a kiválasztott nehézséghez tartozó CSV tölthető be. Induláskor
a játék ellenőrzi, hogy az éles lista legalább a konfigurált elemszámot
tartalmazza; hibás vagy hiányzó fájlnál nem indul el csendben fallbackkel.

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

A voice owner **saját körében** a játékzene teljesen elnémul
(`audio.music.game.voiceOwnerTurnMultiplier = 0`). Más játékos körében
visszaáll a beállított hangerőre.

Az aktív mikrofon ducking továbbra is megmarad más helyzetekre; a saját kör
némítása elsőbbséget élvez.

Több azonos betűnél a felvillanások és a találati hangok sorban futnak.
Sikeres mássalhangzó után a következő pörgetés csak az összes találat teljes
felfedése után, további 1 másodperc késleltetéssel engedélyeződik
(`gameplay.letterRevealPostDelayMs`). Helyes megfejtésnél a betűfelfedési
`letter_hit` hangok megmaradnak, ezek mellé indul a győzelmi zene.

A böngésző autoplay szabályai miatt a lobby zene első indulását a böngésző
blokkolhatja. Ilyenkor az első kattintás vagy billentyű után automatikusan
újrapróbáljuk.

### Hangvezérlés

Ha a lobby Beállításokban engedélyezve van a hangfelismerés, a színpadon az
aktuális játékos avatárja fölött megjelenő mikrofon gombbal kapcsolható ki/be
az élő hangvezérlés.

Első körben támogatott:

- `Pörgetés` → ugyanazt a `spinWheel()` folyamatot indítja, mint a gomb;
- `Magánhangzó` → magánhangzó-várakozó mód;
- `Megfejtés` → a következő kimondott szöveget teljes megfejtésként értékeli;
- `B mint Balázs` / `Cé mint Cecil` jellegű betűmondás;
- közvetlen magánhangzó-betűmondás;
- élő interim/final transcript az alsó `HANG TESZT` panelen.

A mikrofon nem indul automatikusan a játék indításakor.

Bekapcsoláskor a mikrofon az aktuális emberi játékoshoz kötődik. Ha másik
játékos következik, automatikusan leáll. Amikor a tulajdonos köre újra eljön,
a mikrofon nem azonnal, hanem **a pörgetés után** kapcsol vissza.

A pörgetés alatt a mikrofon szintén automatikusan szünetel.

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
- `puzzles` – éles CSV-források és elvárt elemszám;
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
│   ├── ROADMAP.md
│   ├── SETTINGS.md
│   ├── STAGE_UI.md
│   └── VOICE_RECOGNITION.md
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
