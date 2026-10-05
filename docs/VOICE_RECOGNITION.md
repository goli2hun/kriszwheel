# KriszWheel – Voice recognition integráció

## Forrás

Az első integráció alapja:

`goli2hun/voice-recognition`

Forrás commit:

`6afec468b2231d23594c35a56b88b5273b869733`

## Átvett modulok

```text
config/voice-config.js
speech/provider.js
speech/browser-provider.js
speech/parsers.js
speech/voice-engine.js
```

A modulok célja, hogy a mikrofon / provider, a transcript értelmezése és a
játéklogika külön maradjon.

```text
Microphone
   ↓
SpeechProvider
   ↓
VoiceEngine
   ↓
command / letter parser
   ↓
unified voice event
   ↓
KriszWheel existing game action
```

## Fontos integrációs szabály

A hangvezérlés nem kaphat külön játékszabály-implementációt.

A későbbi `COMMAND: SPIN` ugyanazt a `spinWheel()` logikát hívja majd, mint
a UI. A `LETTER` esemény ugyanabba a jelenlegi betűkezelésbe kerül, a
`SOLVE` pedig a meglévő megfejtési folyamatot nyitja.

## Jelenlegi commit határa

Már elkészült:

- voice config;
- reusable provider/parser/engine modulok;
- provider támogatás ellenőrzése a lobbyban;
- hangfelismerés ki/be beállítás;
- provider és nyelv beállítás;
- mikrofonlista;
- mikrofonengedély és frissítés;
- mikrofon választás mentése.

Még nincs bekötve:

- VoiceEngine indítása játék közben;
- mikrofon stream életciklus;
- COMMAND események;
- LETTER események;
- élő transcript/debug;
- benchmark.

## Provider csere

A `VoiceEngine` stabil eseményhatára miatt később a browser provider
Whisperre cserélhető anélkül, hogy a KriszWheel játékszabályait újra kellene
írni.
