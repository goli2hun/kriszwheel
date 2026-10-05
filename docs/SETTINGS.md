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

A voice owner saját körében a játékzene alapból teljesen elnémul
(`voiceOwnerTurnMultiplier = 0`). Más helyzetekben aktív mikrofon mellett
ducking alkalmazható. Paraméterek:

- `audio.music.game.microphoneDuckMultiplier`
- `audio.music.game.microphoneDuckFadeMs`
- `audio.music.game.microphoneRestoreFadeMs`

## 4. Hangfelismerés

A voice-alrendszer alapja a külön `goli2hun/voice-recognition` laborból
érkezett, a következő forrásverzióból:

`6afec468b2231d23594c35a56b88b5273b869733`

A lobby beállítások és a játék közbeni VoiceEngine runtime is be van kötve.

### Engedélyezés

DOM:

`#speechRecognitionEnabledSetting`

Mentett mező:

`speechRecognitionEnabled`

### Haladó névfelismerés

DOM:

`#advancedNameRecognitionSetting`

Mentett mező:

`advancedNameRecognitionEnabled`

Alapérték:

`false`

Bekapcsolva a parser a transcript bármely szavát összeveti a
`config/hungarian-names.js` névlistájával. Ha talál egyezést, a névhez
rendelt betűt adja vissza, ezért nem szükséges a `mint/min` szerkezet.

Példák:

```text
Anna -> A
Aladár -> A
Béla -> B
Botond -> B
Ypszilon -> Y
```

A hagyományos `mint/min` felismerés továbbra is működik.

### Provider

DOM:

`#speechProviderSetting`

Jelenleg:

`browser` → Browser SpeechRecognition.

A Whisper opció csak előkészített, még nem választható.

### Nyelv

DOM:

`#speechLanguageSetting`

Jelenlegi érték:

`hu-HU`

### Mikrofon

DOM:

- `#speechMicrophoneSetting`
- `#refreshSpeechMicrophonesBtn`
- `#speechMicrophoneHelp`

A Beállítások megnyitásakor a játék engedélykérés nélkül megpróbálja
felsorolni az audio inputokat.

A `Frissítés` gomb mikrofonengedélyt kérhet, majd újra lekéri az eszközöket.
Ez azért fontos, mert a böngésző sok esetben csak engedély után adja vissza
a mikrofonok valódi nevét.

A preferált mikrofon kiválasztási szabályai a
`config/voice-config.js` fájlban vannak.

## 5. Felhasználói settings objektum

Tárolási kulcs:

`kriszwheel.user-settings.v1`

Jelenlegi forma:

```json
{
  "soundsEnabled": true,
  "masterVolume": 1,
  "autoSpinEnabled": false,
  "puzzleMode": "test",
  "puzzleDifficulty": "easy",
  "wheelSpinSoundEnabled": true,
  "wheelSpinVolume": 0.65,
  "lobbyMusicEnabled": true,
  "lobbyMusicVolume": 0.3,
  "winnerMusicEnabled": true,
  "winnerMusicVolume": 0.75,
  "gameMusicEnabled": true,
  "gameMusicVolume": 0.2,
  "speechRecognitionEnabled": false,
  "advancedNameRecognitionEnabled": false,
  "speechProvider": "browser",
  "speechLanguage": "hu-HU",
  "microphoneDeviceId": ""
}
```

A régebbi settings objektumok továbbra is betölthetők; minden hiányzó mező
a config/default értéket kapja.

## 6. Vissza

A `Vissza` gomb nem menti a módosításokat. Újranyitáskor a legutóbb mentett
értékek töltődnek vissza.

## 7. Voice modulok

A KriszWheelbe áthozott reusable modulok:

```text
config/voice-config.js
speech/provider.js
speech/browser-provider.js
speech/parsers.js
speech/voice-engine.js
```

A benchmark és a voice-recognition demo debug UI-ja szándékosan nem része
ennek az integrációs commitnak.

## 8. Betűfelismerési szabály

A parser a konfigurált kapcsolószót keresi:

```text
B mint Balázs -> B
Cé mint Cecil -> C
akármi min Dénes -> D
```

A kapcsoló előtti rész normál esetben nem lényeges. A kapcsoló utáni szó első
betűje lesz a játékbetű.

Konfigurált kivételek:

```text
Y mint ipszilon -> Y
Duplavé mint Walter -> W
```

## 9. Játék közbeni runtime

A VoiceEngine már be van kötve a játékmenetbe.

A lobby `speechRecognitionEnabled` értéke master engedély. Játék közben az
aktuális játékos avatarja fölötti mikrofon gomb kapcsolja a tényleges
listening állapotot.

A mikrofon nem indul automatikusan.

Bekapcsoláskor az aktuális emberi játékos lesz a **voice owner**. Játékosváltás
és pörgetés alatt a listening leáll, de az owner megmarad. Ha újra az owner
köre jön, a mikrofon csak a pörgetés eredményének lezárása után indul vissza.

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
