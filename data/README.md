# KriszWheel – feladványadatok

Az éles feladványok nehézségenként külön CSV-fájlban vannak.

## Fájlok

| UI nehézség | Belső érték | Fájl |
| --- | --- | --- |
| Gyerek | `child` | `data/child.csv` |
| Könnyű | `easy` | `data/low.csv` |
| Közepes | `medium` | `data/med.csv` |
| Nehéz | `hard` | `data/high.csv` |

Mind a négy fájl jelenleg 100 egyedi feladványt tartalmaz.

## CSV formátum

Kötelező fejléc:

```csv
category,puzzle
```

Példa:

```csv
"Állat","PIROS KATICA"
"Étel","ALMÁS PITE"
```

A parser támogatja az idézőjelezett mezőket és a duplázott idézőjelet.

## Betöltés

Teszt módban ezek a fájlok nem használódnak.

Éles módban a játék indulásakor a lobbyban kiválasztott nehézséghez tartozó
CSV betöltődik a `state.livePuzzles` tömbbe. A mapping és az elvárt minimális
elemszám a `config/game-config.js` `puzzles` blokkjában található.

Ha a kérés hibára fut vagy a lista rövidebb a
`puzzles.expectedCountPerDifficulty` értéknél, a játék a lobbyban marad és
hibaüzenetet mutat.

## Szerkesztési szabályok

Új feladványnál:

- mindig legyen kategória;
- a feladvány ne legyen üres;
- ne legyen duplikált ugyanabban a fájlban;
- magyar ékezetek UTF-8-ban maradjanak;
- lehetőleg férjen el a 15 × 4-es táblán;
- nagyon hosszú egybefüggő szót külön tesztelni kell;
- a CSV fejlécét ne módosítsd.

## Kategóriák

A listák vegyes kategóriákat tartalmazhatnak, például:

- Közmondás;
- Szólás;
- Film;
- Sorozat;
- Dal;
- Híres ember;
- Foglalkozás;
- Étel;
- Hely;
- Tárgy;
- Állat;
- Növény;
- Mit csinál?;
- Mi ez?;
- Magyarország.

A nehézségi szintet elsősorban a feladvány ismertsége, hossza, szóhasználata
és megfejthetősége határozza meg, nem pusztán a kategória.

## Validátor

A repository tartalmaz külön fejlesztői ellenőrzőt:

`tools/validate_puzzles.py`

Futtatás a repository gyökeréből:

```powershell
python tools/validate_puzzles.py
```

A script magyarul írja ki az eredményt, és ellenőrzi:

- a négy CSV meglétét és fejlécét;
- a pontos 100-as elemszámot;
- az üres mezőket;
- a fájlon belüli duplikációkat;
- a nehézségi szintek közötti duplikációkat;
- a 15 karakternél hosszabb szavakat;
- a játék 15 × 4-es tördelési logikájával való elférést;
- a szokatlan karaktereket;
- a kategóriák eloszlását.

A `[HIBA]` problémák 1-es exit kódot eredményeznek. A
`[FIGYELMEZTETÉS]` elemek nem teszik sikertelenné a futást, de kézi
áttekintést igényelnek.

A script csak olvas: CSV-t soha nem módosít automatikusan.

## Bővítés

Később a validátor további minőségi statisztikákkal bővíthető, például
átlagos hossz, szószám és nehézségi profil szerint.
