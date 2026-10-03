# Szerencsekerék – Basic Prototype

Első játszható böngészős prototípus.

## Mit tud?

- Játékosválasztás: Krisz, Adri, Alíz, Bot
  - saját profilképek a `assets/images/` könyvtárból
  - kijelöléskor kör alakú arany-kék fénygyűrű
  - kijelölés nélkül a fénygyűrű teljesen eltűnik
- Minimum 2 játékos
- Alapértelmezés: Krisz + Bot
- Végtelen számú feladvány/forduló
- Pörgetés
  - jelenleg stabil, ideiglenes BASIC sorsolás vizuális kerék nélkül
  - rövid „Pörög…” állapot után pénz / CSŐD / KIMARADSZ eredmény
- Pénzmezők
- CSŐD
- KIMARADSZ
- Mássalhangzó megadása
  - sikeres pörgetés után közvetlenül a billentyűzeten
  - nincs külön beviteli dialógus
- Találatonkénti pénzjóváírás
- Magánhangzó vásárlása 5 000 Ft-ért
  - a kívánt magánhangzó billentyűjének lenyomásával
  - nincs külön beviteli dialógus
- Megfejtés
- Hibás betű / hibás megfejtés után körváltás
- Egyszerű automatikus Bot
- Phaser 3 kerékanimáció
- Reszponzív alap UI
- Stúdió lobby háttér: `assets/images/studio_lobby.png`
- A jobb oldali kerék nagy izzóin reszponzív SVG/CSS váltott fényanimáció
- Pixelpontos játékszínpad overlay a `studo_jatekszinpad.png` képre
  - a feltöltött háttér tényleges 15 × 4 cellájára illesztett SVG feladvány
  - a feladvány aktív cellái fehérre váltanak, a betűk finom fényanimációval jelennek meg
  - felül a kategória/feladványtípus jelenik meg
  - a gombok feletti kék sávban a már használt betűk látszanak
  - a képen lévő Pörgetés / Mássalhangzó / Megfejtés gombok kattinthatók és hoverre kivilágosodnak
  - legalul egy kis `Teszt` gomb nyitja meg dialogban az aktuális megfejtést
  - a megfejtés már nem látszik állandóan a játékszínpadon
  - jobb felül `Játék vége` gomb: megerősítés után visszatérés a lobbyba
  - `Nem` választásnál a játék változatlan állapotból folytatódik
  - jobb alul az aktuális játékos profilképe, neve és fordulópénze látszik
  - a panel játékosváltáskor és pénzváltozáskor automatikusan frissül
- Alap SFX hangok a `assets/sound/sfx/` könyvtárból
  - minden betűtalálatnál annyi rövid, game-show jellegű csippanás szól, ahányszor a betű szerepel
  - több találatnál a felvillanások és csippanások 0,5 másodperces lépésekben követik egymást
  - külön hang nulla találatra
  - külön hang sikeres és sikertelen megfejtésre

## Indítás

A legegyszerűbb lokális indítás:

```powershell
cd kriszwheel
python -m http.server 8080
```

Majd böngészőben:

```text
http://localhost:8080
```

A Phaser 3 jelenleg CDN-ről töltődik be, ezért az első betöltéshez internetkapcsolat kell.

## Dokumentáció

A játékszínpad pixelpontos felépítése, koordinátái, gomb-hotspotjai,
betűfelfedése és hanglogikája külön dokumentumban található:

- [Játékszínpad és overlay technikai leírás](docs/STAGE_UI.md)

## Jelenlegi architektúra

- `index.html` – UI szerkezet
- `styles.css` – lobby, pixelpontos játékszínpad overlay, profilképek és fényanimációk
- `app.js` – játékszabályok, állapotgép, Bot, Phaser kerék, SFX vezérlés
- `assets/sound/sfx/letter_hit.wav` – betűtalálat
- `assets/sound/sfx/letter_miss.wav` – nincs ilyen betű
- `assets/sound/sfx/solve_success.wav` – sikeres megfejtés
- `assets/sound/sfx/solve_fail.wav` – sikertelen megfejtés

Ez még kizárólag frontend prototípus. FastAPI, SQLite és Whisper nincs bekötve.

Fontos: a jelenlegi `studo_jatekszinpad.png` ténylegesen **15 × 4** kék cellát tartalmaz,
ezért a mostani SVG overlay ehhez a geometriához igazodik.

## Következő fejlesztési fázis

1. Játékszabályok finomítása és konfigurációs fájl
2. Jobb Bot
3. Saját feladvány-adatbázis
4. FastAPI backend + SQLite
5. Lobby / közös belépés integráció
6. Hangvezérlés Whisperrel:
   - „Pörgetek!”
   - „K mint Károly”
   - „Magánhangzó”
   - „Megfejtem”
7. Hangok, mutató kattogás, vizuális effektek
