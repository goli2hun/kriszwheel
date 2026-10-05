# KriszWheel – játékszabály és játékfolyam

Ez a dokumentum a jelenleg implementált szabályokat írja le.

## 1. Játék indítása

A lobbyban legalább két játékost kell kijelölni.

Elérhető játékosok:

- Krisz
- Adri
- Alíz
- Bot
- Vendég 1
- Vendég 2

A Vendég 1 és Vendég 2 normál emberi játékosok; a Bot továbbra is az egyetlen
automatikus játékos.

A játék indulásakor:

1. létrejön a játékoslista;
2. `roundMoney = 0`;
3. `totalMoney = 0`;
4. betöltődik az első feladvány;
5. az első játékos `spin` állapotból indul.

## 2. Feladvány

A feladvány:

```js
{
  category: "Mondás",
  text: "A KOCKA EL VAN VETVE"
}
```

A készlet jelenleg az `app.js` fájlban van.

Új fordulónál törlődik:

- használt betűk;
- felfedett betűk;
- minden játékos `roundMoney` értéke.

A `totalMoney` megmarad.

## 3. Kerékpörgetés

`spin → spinning → wheelResult`

A játék véletlen célcikkelyt választ, majd Phaser fizikailag annak megfelelő
szögre forgatja a kereket.

Megálláskor:

1. nagy eredmény jelenik meg középen;
2. vár `wheel.resultDisplayMs` ideig;
3. automatikusan alkalmazza az eredményt.

### Pénzmező

`wheelValue = mező értéke`

A játék `letter` állapotba kerül.

### CSŐD

- `roundMoney = 0`
- játékosváltás

### KIMARADSZ

- pénz nem változik
- játékosváltás

## 4. Mássalhangzó

Csak `letter` állapotban fogadható el.

A billentyű:

- Unicode NFC-normalizálást kap;
- `hu-HU` locale szerint nagybetűsödik;
- nem lehet már használt;
- nem lehet magánhangzó.

Találat:

```text
roundMoney += találatok × wheelValue
```

Találat után ugyanaz a játékos újra pörget.

Nincs találat esetén játékosváltás következik.

## 5. Több azonos találat

A cellák sorban fedődnek fel.

Időköz:

`gameplay.letterHitGapMs`

Alap:

`500 ms`

A találati hang ugyanebben a ritmusban szól.

## 6. Magánhangzó

Magánhangzó közvetlen billentyűleütéssel vásárolható `spin` és `letter`
állapotban.

Magánhangzók:

```text
A Á E É I Í O Ó Ö Ő U Ú Ü Ű
```

Ár:

`gameplay.vowelPrice`

Alap:

`5000 Ft`

A költség minden esetben levonódik, akkor is, ha nincs találat.

## 7. Megfejtés

A Megfejtés gomb dialogot nyit.

Submitkor a dialog azonnal bezár.

A válasz normalizálása:

- NFC;
- magyar nagybetű;
- több szóköz → egy szóköz;
- trim.

### Hibás válasz

- hibahang;
- `HELYTELEN MEGFEJTÉS` visszajelzés;
- `playerTransition`;
- következő játékos.

### Helyes válasz

1. a dialog már zárva van;
2. a rejtett betűk sorban felfedődnek;
3. `roundMoney` hozzáadódik a `totalMoney` értékhez;
4. `phase = roundEnd`;
5. a játék kivárja a felfedési animáció végét;
6. megjelenik a győzelmi overlay.

## 8. Játékosváltás

Állapot:

`playerTransition`

Idő:

`gameplay.playerSwitchDelayMs`

Alap:

`1000 ms`

Ez alatt:

- az aktuális játékos még látható;
- új akció nem adható;
- a váltás oka színpadi üzenetként látszik.

Az idő végén lép tovább a `currentIndex`.

## 9. Győzelmi képernyő

Tartalma:

- nyertes avatar;
- nyertes neve;
- feladvány;
- forduló pénze;
- összes pénz;
- Phaser tűzijáték.

A gombok a `victory.buttonDelayMs` idő után aktiválódnak.

### Következő feladvány

- overlay bezár;
- tűzijáték leáll;
- következő kezdőjátékos;
- új puzzle;
- `roundMoney` nullázódik.

### Játék vége

A győzelmi képernyőn közvetlenül visszatér a lobbyba.

## 10. Bot

A Bot:

- pörget;
- mássalhangzót választ;
- időnként magánhangzót vásárol;
- bizonyos felfedettségnél megpróbál megfejteni.

A döntések és timer-ek konfigurálhatók.

## 11. Játék vége a színpadról

A jobb felső gomb megerősítést kér:

`Vége a játéknak?`

- Nem → játék folytatódik.
- Igen → lobby.

## 12. Teszt mód

A Teszt gomb megmutatja az aktuális megfejtést.

`debug.showTestButton = false` esetén elrejthető.

## 13. Állapotfolyam

```text
setup
  ↓
spin
  ↓
spinning
  ↓
wheelResult
  ↓
letter
  ├─ találat → spin
  └─ hiba → playerTransition → spin

hibás megfejtés
  ↓
playerTransition
  ↓
spin

helyes megfejtés
  ↓
roundEnd
  ↓
betűfelfedés
  ↓
victory overlay
  ├─ következő feladvány → spin
  └─ játék vége → setup
```
