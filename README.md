# Szerencsekerék – Basic Prototype

Első játszható böngészős prototípus.

## Mit tud?

- Játékosválasztás: Krisz, Adri, Aliz, Bot
- Minimum 2 játékos
- Alapértelmezés: Krisz + Bot
- Végtelen számú feladvány/forduló
- Pörgetés
- Pénzmezők
- CSŐD
- KIMARADSZ
- Mássalhangzó megadása
- Találatonkénti pénzjóváírás
- Magánhangzó vásárlása 5 000 Ft-ért
- Megfejtés
- Hibás betű / hibás megfejtés után körváltás
- Egyszerű automatikus Bot
- Phaser 3 kerékanimáció
- Reszponzív alap UI
- Alap SFX hangok a `assets/sound/sfx/` könyvtárból
  - minden betűtalálatnál annyi rövid hang, ahányszor a betű szerepel
  - külön hang nulla találatra
  - külön hang sikeres és sikertelen megfejtésre

## Indítás

A legegyszerűbb lokális indítás:

```powershell
cd szerencsekerek-basic
python -m http.server 8080
```

Majd böngészőben:

```text
http://localhost:8080
```

A Phaser 3 jelenleg CDN-ről töltődik be, ezért az első betöltéshez internetkapcsolat kell.

## Jelenlegi architektúra

- `index.html` – UI szerkezet
- `styles.css` – megjelenés
- `app.js` – játékszabályok, állapotgép, Bot, Phaser kerék, SFX vezérlés
- `assets/sound/sfx/letter_hit.wav` – betűtalálat
- `assets/sound/sfx/letter_miss.wav` – nincs ilyen betű
- `assets/sound/sfx/solve_success.wav` – sikeres megfejtés
- `assets/sound/sfx/solve_fail.wav` – sikertelen megfejtés

Ez még kizárólag frontend prototípus. FastAPI, SQLite és Whisper nincs bekötve.

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
