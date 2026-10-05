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

## 3. Hangfelismerés

A voice-alrendszer alapja a külön `goli2hun/voice-recognition` laborból
érkezett, a következő forrásverzióból:

`6afec468b2231d23594c35a56b88b5273b869733`

Ebben a lépésben a **lobby beállítások** vannak bekötve. A hang még nem vezérli
a játékot.

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

## 8. Következő integrációs lépés

A következő commitban a `VoiceEngine` példányosítása és a unified
`COMMAND` / `LETTER` események meglévő KriszWheel akciókra kötése következik.
