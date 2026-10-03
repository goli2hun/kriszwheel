# KriszWheel konfiguráció

A játék központi konfigurációja:

`config/game-config.js`

A fájl az `app.js` előtt töltődik be, és a
`window.KRISZWHEEL_CONFIG` objektumot hozza létre.

## Fő csoportok

### gameplay

- `vowelPrice` – magánhangzó ára Ft-ban.
- `letterHitGapMs` – több azonos találat felvillanása/hangja közötti idő.

### wheel

- `image` – kerék asset.
- `canvasSize` – Phaser canvas logikai mérete.
- `wheelSize` – kerék képi mérete a canvason.
- `labelRadius` – a feliratok távolsága a középponttól.
- `startOffsetDeg` – a cikkelyek induló szöge.
- `pointerAngleDeg` – a fix mutató iránya.
- `minFullTurns`, `maxFullTurns` – teljes fordulatok száma.
- `spinDurationMs` – pörgetés időtartama.
- `easing` – Phaser tween easing.
- `resultDisplayMs` – a megállás utáni eredmény kijelzési ideje.
- `segments` – pénz / CSŐD / KIMARADSZ mezők.
- `segmentRepeat` – hányszor ismétlődjön a megadott mezősor a képi keréken.

A jelenlegi `wheel.png` 24 cikkelyes, ezért 12 mező × 2 ismétlés van beállítva.

### bot

A Bot gondolkodási ideje, megfejtési hajlandósága, magánhangzó-vásárlási
esélye és a betűválasztás időzítése.

### audio

A hangfájlok elérési útja és a fontos hangerők.

### debug

- `showTestButton` – a fejlesztői Teszt gomb megjelenítése.

## Fontos

A konfiguráció módosítása után elég újratölteni az oldalt.

A `segments` elemszám × `segmentRepeat` értékének meg kell egyeznie a
kerékgrafika tényleges cikkelyszámával, különben a feliratok és a képi
cikkelyek nem fognak pontosan illeszkedni.
