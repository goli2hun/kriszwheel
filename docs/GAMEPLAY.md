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

A `wheel_spinning.mp3` a tényleges tween indulásakor kezdődik és a kerék
megállásakor leáll. Engedélyezése és hangereje külön user setting.

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

A `finishRound()` a játékzenét leállítja/fade-eli, majd a
`winner_music.mp3` sávot nulláról fokozatosan felerősíti.

1. a dialog már zárva van;
2. a rejtett betűk sorban felfedődnek;
3. minden felfedett betűvel szinkronban a `letter_hit` hang szól;
4. külön megfejtés-sikerhang nincs;
5. `roundMoney` hozzáadódik a `totalMoney` értékhez;
6. `phase = roundEnd`;
7. a játék kivárja a felfedési animáció végét;
8. megjelenik a győzelmi overlay.

## 8. Játékosváltás

A váltás két külön fázisból áll.

### 1. playerTransition

Idő:

`gameplay.playerSwitchDelayMs`

Alap:

`1000 ms`

Ez alatt:

- az előző játékos még látható;
- új akció nem adható;
- a váltás oka színpadi üzenetként látszik.

### 2. turnReady

Ezután lép tovább a `currentIndex`, megjelenik az új játékos, de még rövid
ideig nincs aktív játék.

Idő:

`gameplay.turnReadyDelayMs`

Alap:

`1000 ms`

A `turnReady` alatt:

- az új játékos már látható;
- kézi input még nem fogadható;
- Bot és Auto pörgetés még nem indul;
- a mikrofon nem indul automatikusan vissza.

Csak a várakozás után lépünk `spin` fázisba.

## 9. Győzelmi képernyő

Tartalma:

- nyertes avatar;
- nyertes neve;
- feladvány;
- forduló pénze;
- összes pénz;
- Játék állása panel minden aktuális játékossal;
- Phaser tűzijáték.

A Játék állása játékosonként kizárólag a `totalMoney` értéket mutatja. A
folyamatban lévő `roundMoney` nem jelenik meg megszerzett pénzként.

A játékosok egymás alatt jelennek meg; az avatar és a megnyert összeg a
korábbi grid-verziónál nagyobb hangsúlyt kap.

A gombok a `victory.buttonDelayMs` idő után aktiválódnak.

### Következő feladvány

- overlay bezár;
- tűzijáték leáll;
- következő kezdőjátékos;
- új puzzle;
- `roundMoney` nullázódik.

### Játék vége

A győzelmi képernyőn közvetlenül visszatér a lobbyba.

## 10. Auto pörgetés

Beállítás:

`autoSpinEnabled`

Alap:

`false`

Ha be van kapcsolva:

1. az aktuális játékos ember;
2. a játék `spin` fázisban van;
3. `gameplay.autoSpinDelayMs` letelik;
4. a játék meghívja a meglévő `spinWheel(false)` függvényt.

A timer minden állapotváltásnál újraellenőrzi a feltételeket. Kézi gomb vagy
hangparancs esetén a timer törlődik, ezért nem indul második pörgetés.

A Botot az Auto pörgetés nem kezeli; arra továbbra is a Bot saját automatája
felel.

A `puzzleMode` beállítás jelenleg még **nem része a gameplay puzzle
választásának**.

## 11. Bot

A Bot:

- pörget;
- mássalhangzót választ;
- időnként magánhangzót vásárol;
- bizonyos felfedettségnél megpróbál megfejteni.

A döntések és timer-ek konfigurálhatók.

## 12. Játék vége a színpadról

A jobb felső gomb megerősítést kér:

`Vége a játéknak?`

- Nem → játék folytatódik.
- Igen → lobby.

## 13. Hangvezérlés

Feltétel:

- a lobby Beállításokban a Hangfelismerés engedélyezve legyen;
- támogatott böngésző és mikrofon API;
- játék közben a mikrofon gomb `BE` állapotban legyen;
- Bot körében a hangos játékműveletek figyelmen kívül maradnak.

### Mikrofon gomb

Az aktuális játékos avatárja fölött található.

- `KI` → nincs aktív voice owner;
- `BE` / `HALLGAT` → a voice owner mikrofonja aktív;
- `VÁR` → az owner megmaradt, de a listening szünetel.

Automatikus szünet:

- játékosváltáskor;
- másik játékos körében;
- a pörgetés teljes ideje alatt;
- forduló végén.

Automatikus visszakapcsolás:

- csak a voice owner körében;
- csak pénzmezős pörgetés után, amikor `phase = letter`.

Ha a voice owner köre később visszatér, a mikrofon **nem** kapcsol be már a
`spin` fázis elején; előbb pörgetni kell.

Amíg a mikrofon aktív vagy indul, a `game_music.mp3` automatikusan a
konfigurált duck hangerőre halkul. A mikrofon leállásakor fokozatosan
visszaerősödik.

### Pörgetés

Kimondható például:

```text
pörgetek
pörgetés
pörgess
```

Csak `spin` fázisban hajtódik végre.

### Mássalhangzó

A kerék pénzmezője után:

```text
B mint Balázs
Cé mint Cecil
K mint Károly
```

A parser `LETTER` eseménye a meglévő `handleConsonant()` függvénybe kerül.

### Magánhangzó

Két mód támogatott:

```text
magánhangzó
A mint Alma
```

vagy közvetlenül:

```text
A mint Alma
```

A meglévő `buyVowel()` fut, ezért az ár- és pénzszabály változatlan.

### Megfejtés

Kétlépcsős:

```text
Megfejtés
A kocka el van vetve
```

A második végleges transcript a meglévő `trySolve()` függvénybe kerül.

Egymondatos forma is elfogadott:

```text
Megfejtés A kocka el van vetve
```

### HANG TESZT panel

A stage bal alsó részén mutatja:

- interim transcript;
- final transcript;
- felismert parancs vagy betű;
- VoiceEngine állapot;
- hibákat.

## 14. Teszt mód

A Teszt gomb megmutatja az aktuális megfejtést.

`debug.showTestButton = false` esetén elrejthető.

## 15. Állapotfolyam

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
  └─ hiba → playerTransition → turnReady → spin

hibás megfejtés
  ↓
playerTransition
  ↓
turnReady
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
