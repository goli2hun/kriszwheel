# KriszWheel

Böngészős, magyar nyelvű Szerencsekerék-játék saját lobbyval, TV-stúdió jellegű
játékszínpaddal, Phaser 3 kerékanimációval, billentyűzetes betűbevitellel és
konfigurálható játékszabályokkal.

A projekt jelenleg frontend-alapú prototípus: nincs még backend, adatbázis vagy
Whisper integráció.

## Jelenlegi funkciók

### Lobby és játékosok

- Választható játékosok: Krisz, Adri, Alíz és Bot.
- Minimum 2 játékos szükséges.
- Alapértelmezett kijelölés: Krisz + Bot.
- Minden játékoshoz saját profilkép tartozik.
- A kijelölt játékosok arany-kék fénygyűrűt kapnak.
- A Bot automatikusan játszik.

### Játékszínpad

A fő háttér:

`assets/images/studo_jatekszinpad.png`

Natív mérete: **1672 × 941 px**.

A kép fölött külön HTML/SVG/Phaser rétegek működnek:

- 15 × 4-es feladványtábla;
- kategória;
- használt betűk;
- aktuális játékos avatarja, neve és fordulópénze;
- Pörgetés / középső képi hotspot / Megfejtés vezérlés;
- jobb felső `Játék vége`;
- alsó `Teszt` debug gomb;
- Phaser kerék-overlay.

### Szerencsekerék

A kerék asset:

`assets/images/wheel.png`

A jelenlegi beállítás:

- 24 képi cikkely;
- 12 logikai mező × 2 ismétlés;
- Phaser rajzolja rá a feliratokat;
- 2–3 teljes fordulat;
- 3600 ms animáció;
- `Cubic.easeOut` lassulás;
- megálláskor nagy eredmény a kerék közepén;
- az eredmény 1500 ms után automatikusan életbe lép;
- pénzmező, `CSŐD` és `KIMARADSZ` támogatott.

A fenti értékek nem hardcode-olt beállításként kezelendők: a
`config/game-config.js` fájlban módosíthatók.

### Betűbevitel

A normál betűbevitel közvetlenül a fizikai billentyűzetről történik.

- kis- és nagybetű között nincs különbség;
- a kód magyar locale szerint nagybetűsít;
- ékezetes magyar betűk támogatottak;
- mássalhangzó csak sikeres pénzmezős pörgetés után adható meg;
- magánhangzó közvetlen billentyűleütéssel vásárolható;
- a magánhangzó alapára 5000 Ft;
- a Megfejtés dialog szövegmezőjének gépelését a globális billentyűkezelő
  nem zavarja.

### Pénz és fordulók

Játékosváltáskor az új játékos nem azonnal válik aktívvá. Az alap
átmeneti szünet **1000 ms**, a `gameplay.playerSwitchDelayMs`
konfigurációval módosítható. Ezalatt látható visszajelzés jelenik meg.

Mássalhangzó-találatnál:

```text
nyeremény = találatok száma × kipörgetett összeg
```

A játék két pénzértéket tart fenn játékosonként:

- `roundMoney` – az aktuális feladványban megszerzett összeg;
- `totalMoney` – a már megnyert fordulók összesített nyereménye.

Sikeres megfejtéskor a `roundMoney` hozzáadódik a `totalMoney` értékhez.

### Hangok

Jelenlegi SFX-ek:

- `assets/sound/sfx/letter_hit.wav`
- `assets/sound/sfx/letter_miss.wav`
- `assets/sound/sfx/solve_success.wav`
- `assets/sound/sfx/solve_fail.wav`

Többszörös betűtalálatnál a cellák felvillanása és a találati hang egymás után
következik. Az alap időköz 500 ms, konfigurálható.

### Megfejtés UI

A megfejtés elküldésekor a beviteli dialog **azonnal bezár**.

- helytelen megfejtésnél látható `HELYTELEN MEGFEJTÉS` visszajelzés jelenik meg;
- helyes megfejtésnél előbb végigfut a hiányzó betűk felfedése;
- a fordulóvégi dialog csak a felfedési animáció után jelenik meg;
- Enter és a `Megfejtem` gomb ugyanazt a submit folyamatot használja.

### Játék vége és tesztfunkció

- `Játék vége`: megerősítő dialog után visszatérés a lobbyba.
- `Nem`: a játékállapot változatlan marad.
- `Teszt`: dialogban mutatja az aktuális megfejtést.
- A `Teszt` gomb konfigurációból elrejthető.

## Indítás

### Windows – ajánlott

A repo gyökerében:

```text
start.bat
```

A script:

1. a repository gyökerére vált;
2. ellenőrzi a Git elérhetőségét;
3. lefuttatja a `git pull --ff-only origin main` parancsot;
4. sikeres frissítés után elindítja a lokális HTTP szervert a 8080 porton;
5. először a `python`, utána a `py -3` parancsot próbálja.

Elérés:

```text
http://localhost:8080
```

Leállítás:

```text
Ctrl+C
```

A script nem használ `git reset --hard` parancsot, tehát nem törli
automatikusan a helyi módosításokat.

### Kézi indítás

```powershell
cd kriszwheel
git pull --ff-only origin main
python -m http.server 8080
```

A Phaser 3 CDN-ről töltődik be, ezért az első betöltéshez internetkapcsolat
szükséges.

## Konfiguráció

Központi konfiguráció:

```text
config/game-config.js
```

Fő csoportok:

- `gameplay`
- `wheel`
- `bot`
- `audio`
- `debug`

Részletes leírás:

- [Konfigurációs referencia](config/README.md)

## Dokumentáció

- [Játékszabály és játékfolyam](docs/GAMEPLAY.md)
- [Architektúra és state machine](docs/ARCHITECTURE.md)
- [Játékszínpad és overlay](docs/STAGE_UI.md)
- [Fejlesztői útmutató](docs/DEVELOPMENT.md)
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
│   └── STAGE_UI.md
└── assets/
    ├── images/
    │   ├── adri.png
    │   ├── bot.png
    │   ├── krisz.png
    │   ├── lizus.png
    │   ├── studio_lobby.png
    │   ├── studo_jatekszinpad.png
    │   └── wheel.png
    └── sound/
        └── sfx/
```

## Betöltési sorrend

Az `index.html` végén:

```html
<script src="config/game-config.js"></script>
<script src="app.js"></script>
```

Ez fontos: az `app.js` indulásakor már rendelkezésre kell állnia a
`window.KRISZWHEEL_CONFIG` objektumnak.

## Jelenlegi technológia

- HTML5
- CSS3
- vanilla JavaScript
- SVG
- Phaser 3.90
- statikus HTTP szerver

Nincs szükség build lépésre vagy Node.js-re.

## Ismert korlátok / következő nagyobb lépések

- a feladványok még az `app.js`-ben vannak;
- nincs SQLite/FastAPI backend;
- nincs teljes scoreboard;
- nincs Whisper hangvezérlés;
- a mobilnézet még nem végleges;
- a jelenlegi hangok prototípus-hangok;
- a színpad néhány HTML azonosítója történeti okból régi elnevezést visel.

A következő fejlesztések előtt érdemes a dokumentáció megfelelő részét is
frissíteni.
