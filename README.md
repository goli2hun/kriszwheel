# KriszWheel

Magyar nyelvű, böngészős Szerencsekerék-játék saját lobbyval, TV-stúdió jellegű
játékszínpaddal, Phaser 3 kerékanimációval, billentyűzetes betűbevitellel,
Bot-játékossal, győzelmi effektekkel és központi konfigurációval.

A projekt jelenleg frontend-only prototípus: nincs még backend, adatbázis vagy
Whisper integráció.

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

A lobby saját stúdió-hátteret és játékosportrékat használ.

A lobbyban külön **Beállítások** gomb található. A Beállítások nézet két
szekcióból áll:

- **Általános beállítások** – hangok be/ki és fő hangerő;
- **Hangfelismerés** – előkészített hely a hamarosan érkező magyar
  hangvezérléshez.

Az általános felhasználói beállítások böngészőnként, `localStorage`-ban
mentődnek. A hangfelismerés vezérlői az első verzióban még inaktívak.

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
- Phaser tűzijáték.

A gombok késleltetve válnak aktívvá:

- `Következő feladvány`
- `Játék vége`

A győzelmi képernyő `Játék vége` gombja közvetlenül a lobbyba visz.

### Játék vége

Két út van:

1. jobb felső `Játék vége` → megerősítő dialog;
2. győzelmi képernyő `Játék vége` → közvetlen lobby.

### Hangok

Jelenlegi SFX:

- `letter_hit.wav`
- `letter_miss.mp3`
- `solve_success.wav`
- `solve_fail.wav`

Több azonos találatnál a felvillanások és a találati hangok sorban futnak.

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

- `gameplay`
- `wheel`
- `bot`
- `audio`
- `victory`
- `debug`

Részletes referencia:

[config/README.md](config/README.md)

## Dokumentáció

- [Játékszabály és játékfolyam](docs/GAMEPLAY.md)
- [Architektúra](docs/ARCHITECTURE.md)
- [Játékszínpad és UI](docs/STAGE_UI.md)
- [Fejlesztői útmutató](docs/DEVELOPMENT.md)
- [Beállítások](docs/SETTINGS.md)
- [Roadmap](docs/ROADMAP.md)
- [Konfigurációs referencia](config/README.md)

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
│   └── README.md
├── docs/
│   ├── ARCHITECTURE.md
│   ├── DEVELOPMENT.md
│   ├── GAMEPLAY.md
│   ├── ROADMAP.md
│   ├── SETTINGS.md
│   └── STAGE_UI.md
└── assets/
    ├── images/
    │   ├── adri.png
    │   ├── bot.png
    │   ├── guest1.svg
    │   ├── guest2.svg
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
