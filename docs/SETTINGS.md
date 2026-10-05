# KriszWheel – Beállítások

## 1. Cél

A lobbyból külön `Beállítások` képernyő nyitható.

Két fő szekció:

- Általános beállítások;
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

**Fontos:** ez a választás ebben a commitban csak mentődik. A
`pickPuzzle()` és a jelenlegi `PUZZLES` lista nincs rákötve erre a
beállításra.

## 3. Hangfelismerés

A voice-alrendszer alapja a külön `goli2hun/voice-recognition` laborból
érkezett, a következő forrásverzióból:

`6afec468b2231d23594c35a56b88b5273b869733`

A lobby beállítások és a játék közbeni VoiceEngine runtime is be van kötve.

### Engedélyezés

DOM:

`#speechRecognitionEnabledSetting`

Mentett mező:

`speechRecognitionEnabled`

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

## 4. Felhasználói settings objektum

Tárolási kulcs:

`kriszwheel.user-settings.v1`

Jelenlegi forma:

```json
{
  "soundsEnabled": true,
  "masterVolume": 1,
  "autoSpinEnabled": false,
  "puzzleMode": "test",
  "speechRecognitionEnabled": false,
  "speechProvider": "browser",
  "speechLanguage": "hu-HU",
  "microphoneDeviceId": ""
}
```

A régebbi settings objektumok továbbra is betölthetők; a hiányzó voice mezők
default értéket kapnak.

## 5. Vissza

A `Vissza` gomb nem menti a módosításokat. Újranyitáskor a legutóbb mentett
értékek töltődnek vissza.

## 6. Voice modulok

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

## 7. Betűfelismerési szabály

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

## 8. Játék közbeni runtime

A VoiceEngine már be van kötve a játékmenetbe.

A lobby `speechRecognitionEnabled` értéke master engedély. Játék közben az
aktuális játékos avatarja fölötti mikrofon gomb kapcsolja a tényleges
listening állapotot.

A mikrofon nem indul automatikusan.

Runtime részletek:

[VOICE_RECOGNITION.md](VOICE_RECOGNITION.md)
