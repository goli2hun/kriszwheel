# KriszWheel – Beállítások

## 1. Cél

A lobbyból külön `Beállítások` képernyő nyitható.

Három fő szekció:

- Általános beállítások;
- Zene és hangulat;
- Hangfelismerés.

A képernyő alján:

- `Vissza`;
- `Mentés`.

## 2. Általános beállítások

### Hangok engedélyezése

DOM:

`#soundsEnabledSetting`

Ha ki van kapcsolva, a `playSfx()` nem indít hangot.

### Fő hangerő

DOM:

- `#masterVolumeSetting`
- `#masterVolumeValue`

Tartomány:

`0–100%`

Belső tárolás:

`0.0–1.0`

### Auto pörgetés

DOM:

`#autoSpinEnabledSetting`

Mentett mező:

`autoSpinEnabled`

Alapérték:

`false`

Bekapcsolva csak **emberi játékosnál**, `spin` fázisban ütemez automatikus
pörgetést. A Bot továbbra is a saját Bot-logikáját használja.

A késleltetés:

`gameplay.autoSpinDelayMs`

Kézi vagy hangvezérelt pörgetéskor a függő auto-pörgetés timer törlődik.

### Feladványmód

DOM:

`#puzzleModeSetting`

Mentett mező:

`puzzleMode`

Értékek:

- `test` – Teszt feladványok;
- `live` – Éles feladványok.

Alapérték:

`test`

A választás aktívan vezérli a feladványforrást. `test` módban a beépített
`PUZZLES` lista használódik, `live` módban pedig a lobbyban kiválasztott
nehézséghez tartozó CSV töltődik be.

### Lobby nehézség

A nehézség nem a Beállítások képernyőn, hanem közvetlenül a lobby
játékindító nézetében választható.

DOM:

`#difficultySelector`

Mentett mező:

`puzzleDifficulty`

Értékek:

- `child` – Gyerek;
- `easy` – Könnyű;
- `medium` – Közepes;
- `hard` – Nehéz.

Alapérték:

`easy`

A választás azonnal perzisztálódik. `puzzleMode = live` esetén a mapping:

- `child` → `data/child.csv`
- `easy` → `data/low.csv`
- `medium` → `data/med.csv`
- `hard` → `data/high.csv`

A fájlutak a `config/game-config.js` `puzzles.files` blokkban
paraméterezhetők.

## 3. Zene és hangulat

Minden zenei sávhoz két felhasználói beállítás tartozik:

- engedélyezés;
- egyedi hangerő 0–100% között.

A tényleges hangerő:

```text
egyedi hangerő × masterVolume
```

### Kerék forgási hang

DOM:

- `#wheelSpinSoundEnabledSetting`
- `#wheelSpinVolumeSetting`
- `#wheelSpinVolumeValue`

Mentett mezők:

- `wheelSpinSoundEnabled`
- `wheelSpinVolume`

Csak a Phaser kerék tween tényleges futása alatt szól.

### Lobby zene

DOM:

- `#lobbyMusicEnabledSetting`
- `#lobbyMusicVolumeSetting`
- `#lobbyMusicVolumeValue`

Mentett mezők:

- `lobbyMusicEnabled`
- `lobbyMusicVolume`

A lobbyban és a Beállítások képernyőjén loopol. Autoplay-blokkolás esetén az
első user gesture után automatikusan újrapróbáljuk.

### Győzelmi zene

DOM:

- `#winnerMusicEnabledSetting`
- `#winnerMusicVolumeSetting`
- `#winnerMusicVolumeValue`

Mentett mezők:

- `winnerMusicEnabled`
- `winnerMusicVolume`

A `finishRound()` indítja, nulláról a konfigurált fade-idő alatt erősödik fel.

### Játékzene

DOM a Beállításokban:

- `#gameMusicEnabledSetting`
- `#gameMusicVolumeSetting`
- `#gameMusicVolumeValue`

Stage runtime kapcsoló:

`#gameMusicToggleBtn`

Mentett mezők:

- `gameMusicEnabled`
- `gameMusicVolume`

A stage kapcsoló ugyanazt a `gameMusicEnabled` értéket módosítja és azonnal
perzisztálja.

A mikrofon runtime kapcsolója globális a játékban. Bármely emberi játékos
ki- vagy bekapcsolhatja, és az állapot játékosváltáskor megmarad. Bot körében
a mikrofon gomb letiltott és a listening szünetel.

Ha a globális mikrofon be van kapcsolva és emberi játékos van soron, a
játékzene alapból teljesen elnémul (`voiceOwnerTurnMultiplier = 0`).
A pörgetés idejére a mikrofon szünetel, majd a kerék megállásakor újraindul.

Runtime részletek:

[VOICE_RECOGNITION.md](VOICE_RECOGNITION.md)


## 10. Lobby build-információ

A lobby jobb alsó sarkában a `#lobbyBuildInfo` elem mutatja az alkalmazás
verzióját, build dátumát és az aktív feladványmódot.

Példák:

```text
v0.8.0 · 2026.10.05 · TESZT
v0.8.0 · 2026.10.05 · ÉLES / KÖZEPES
```

A verzió és dátum a `config/game-config.js` `app` blokkjából jön. Éles
módban hoverre a konkrét CSV-forrás és az elvárt elemszám is látszik.
