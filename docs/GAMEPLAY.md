# KriszWheel – játékszabály és játékfolyam

Ez a dokumentum a **jelenleg implementált** játékmenetet írja le.

## 1. Játék indítása

A lobbyban legalább két játékost kell kiválasztani.

Elérhető játékosok:

- Krisz
- Adri
- Alíz
- Bot

A Bot automatikus játékos.

A `Játék indítása` után:

1. létrejön a játékoslista;
2. minden játékos `roundMoney = 0` és `totalMoney = 0` értékkel indul;
3. az első feladvány betöltődik;
4. az első játékos `spin` állapotból kezd.

## 2. Feladványok

A feladvány jelenleg két adatból áll:

```js
{
  category: "Mondás",
  text: "A KOCKA EL VAN VETVE"
}
```

Az aktuális készlet még az `app.js` fájlban található.

Új fordulónál:

- új feladvány választódik;
- a korábbi használt betűk törlődnek;
- a felfedett betűk törlődnek;
- minden játékos `roundMoney` értéke nullázódik;
- a `totalMoney` megmarad.

## 3. Pörgetés

A Pörgetés gomb a Phaser kerék-overlayt indítja.

Folyamat:

1. a játék `spinning` állapotba kerül;
2. véletlen cikkely választódik;
3. a kerék a konfigurált fordulatszámmal és easinggel a célmezőre lassul;
4. megálláskor a játék `wheelResult` állapotba kerül;
5. az eredmény nagy betűkkel megjelenik a kerék közepén;
6. a `resultDisplayMs` idő letelte után az eredmény automatikusan életbe lép.

### Pénzmező

Pénzmező után:

- `state.wheelValue` megkapja a mező értékét;
- a játék `letter` állapotba kerül;
- mássalhangzó adható meg.

### CSŐD

`CSŐD` esetén:

- az aktuális játékos `roundMoney` értéke 0 lesz;
- a kör a következő játékosra kerül.

### KIMARADSZ

`KIMARADSZ` esetén:

- nincs pénzváltozás;
- a kör azonnal a következő játékosra kerül.

## 4. Mássalhangzó

Mássalhangzó csak `letter` állapotban fogadható el.

A játék a billentyűleütést:

1. NFC Unicode-formára normalizálja;
2. `hu-HU` locale szerint nagybetűssé alakítja;
3. ellenőrzi, hogy egyetlen betű-e;
4. ellenőrzi, hogy nem magánhangzó-e;
5. ellenőrzi, hogy még nem használták-e.

Ezért például:

```text
k = K
á = Á
ő = Ő
```

### Találat

Ha a betű szerepel:

```text
nyeremény = találatok száma × wheelValue
```

Példa:

```text
kipörgetett mező: 2500 Ft
betű: L
találatok: 3
nyeremény: 7500 Ft
```

A nyeremény hozzáadódik az aktuális játékos `roundMoney` értékéhez.

Ezután ugyanaz a játékos ismét pörgethet.

### Nincs találat

Ha a betű nem szerepel:

- megszólal a `letter_miss` hang;
- a kör a következő játékosra kerül.

### Már használt betű

A már használt betű nem fogadható el újra.

## 5. Többszörös betűtalálat

Ha ugyanaz a betű több helyen szerepel:

- a cellák nem egyszerre villannak fel;
- sorban kapják a `stageLetterReveal` animációt;
- minden felfedéshez találati hang tartozik;
- a lépések közötti idő a `gameplay.letterHitGapMs` konfiguráció.

Alapérték:

```text
500 ms
```

## 6. Magánhangzó-vásárlás

A magánhangzó külön dialog nélkül, közvetlen billentyűleütéssel vásárolható.

A jelenlegi magánhangzók:

```text
A Á E É I Í O Ó Ö Ő U Ú Ü Ű
```

A vásárlás megengedett `spin` és `letter` állapotban.

Feltételek:

- emberi játékos van soron;
- elegendő `roundMoney` áll rendelkezésre;
- a betű magánhangzó;
- a betűt még nem használták.

Az alapár:

```text
5000 Ft
```

Konfiguráció:

`gameplay.vowelPrice`

A költség a találatok számától függetlenül levonódik.

### Találat

Ha van ilyen magánhangzó:

- a betű(k) felfedődnek;
- a játékos ugyanúgy `spin` állapotba kerül.

### Nincs találat

Ha nincs ilyen magánhangzó:

- a vásárlás ára már levonásra került;
- a kör a következő játékosra kerül.

## 7. Megfejtés

A `Megfejtés` gomb dialogot nyit.

A teljes választ szövegként kell megadni.

Összehasonlításkor a játék:

- NFC-normalizálást használ;
- magyar locale szerint nagybetűsít;
- a többszörös szóközöket egy szóközzé alakítja;
- levágja a szélső szóközöket.

### Sikeres megfejtés

Siker esetén:

1. minden hiányzó betű felfedődik;
2. a `roundMoney` hozzáadódik a `totalMoney` értékhez;
3. a játék `roundEnd` állapotba kerül;
4. a felfedési animáció után megjelenik a győzelmi overlay;
5. Phaser tűzijáték indul;
6. késleltetve megjelenik a `Következő feladvány` és `Játék vége` gomb.

### Hibás megfejtés

A megfejtés elküldésekor a beviteli dialog azonnal bezár.

Hibás megfejtés esetén:

- hibahang szól;
- a színpadon `HELYTELEN MEGFEJTÉS` visszajelzés jelenik meg;
- lefut a konfigurált játékosváltási szünet;
- ezután a kör a következő játékosra kerül.

### Helyes megfejtés UI-folyama

Helyes válasznál:

1. a beviteli dialog már zárva van;
2. a hiányzó betűk sorban felfedődnek;
3. a játék kivárja a legutolsó betű `stageLetterReveal` animációját;
4. csak ezután nyílik meg a győzelmi overlay.

## 8. Játékosváltási szünet

A `nextPlayer()` nem vált azonnal játékost.

Átmeneti állapot:

`playerTransition`

Alap késleltetés:

`1000 ms`

Konfiguráció:

`gameplay.playerSwitchDelayMs`

A késleltetés alatt:

- a jelenlegi avatar még látható;
- a játékgombok nem aktívak;
- a váltás oka rövid, látható színpadi üzenetként megjelenik.

Az idő letelte után:

1. `currentIndex` a következő játékosra lép;
2. `phase = "spin"`;
3. frissül az avatar/pénz panel;
4. Bot esetén elindul a Bot következő lépése.

## 9. Győzelmi képernyő

A győzelmi overlay a teljes betűfelfedés után jelenik meg.

Tartalma:

- győztes profilképe;
- győztes neve;
- megfejtett feladvány;
- forduló nyereménye;
- összesített nyeremény;
- Phaser tűzijáték.

A gombok a `victory.buttonDelayMs` után válnak aktívvá.

### Következő feladvány

Bezárja a győzelmi overlayt, leállítja a tűzijátékot, majd új fordulót indít.

### Játék vége

A győzelmi képernyő `Játék vége` gombja megerősítés nélkül közvetlenül
visszatér a lobbyba.


## 10. Bot

A Bot ugyanazt az alap játékszabályt használja.

Konfigurálható viselkedések:

- általános gondolkodási késleltetés;
- megfejtési próbálkozás küszöbe;
- megfejtési próbálkozás esélye;
- magánhangzó-vásárlási esély;
- betűválasztás késleltetései.

A Bot:

- pörget;
- pénzmező után mássalhangzót választ;
- időnként magánhangzót vásárol;
- megfelelő felfedettségnél megpróbálhatja megfejteni a feladványt.

A Bot döntései szándékosan egyszerűek; jelenleg nem használ nyelvi modellt.

## 11. Játék vége

A jobb felső `Játék vége` gomb megerősítő dialogot nyit.

Kérdés:

```text
Vége a játéknak?
```

- `Nem`: dialog bezár, állapot nem változik.
- `Igen`: timer-ek leállnak, a kerék-overlay bezár, a játék visszatér a lobbyba.

## 12. Teszt mód

A `Teszt` gomb dialogban megmutatja az aktuális megfejtést.

Konfiguráció:

```js
debug: {
  showTestButton: true
}
```

`false` esetén a gomb nem látszik.

## 13. Játékállapotok röviden

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
  └─ hiba → playerTransition → következő játékos → spin

megfejtés sikeres
  ↓
roundEnd
  ↓
következő feladvány → spin
```

A magánhangzó `spin` és `letter` állapotban is megadható.
