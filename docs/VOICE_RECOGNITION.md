# KriszWheel – Voice recognition integráció

## Forrás

Az integráció alapja:

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

## Adatfolyam

```text
mikrofon
  ↓
BrowserSpeechProvider
  ↓
VoiceEngine
  ↓
COMMAND / LETTER
  ↓
KriszWheel voice adapter az app.js-ben
  ↓
meglévő játékművelet
```

A hangvezérlés nem tart fenn külön játékszabályokat.

## Runtime életciklus

A lobby `speechRecognitionEnabled` beállítása master kapcsoló.

Játék közben az avatár fölötti:

`#voiceMicBtn`

kapcsolja a tényleges listening állapotot.

A mikrofon **nem indul automatikusan**.

Bekapcsoláskor:

1. dinamikusan importálódik a `VoiceEngine` és a parser;
2. a mentett mikrofon `deviceId` alapján `getUserMedia()` stream indul;
3. a kiválasztott audio track átadásra kerül a providernek;
4. a VoiceEngine callbacks aktívvá válnak.

Kézi kikapcsoláskor:

- provider stop/abort;
- audio trackek stop;
- a globális mikrofon runtime állapot törlődik;
- függő voice input mód törlődik.

Automatikus szüneteltetéskor a provider és az audio track leáll, de a
`voiceOwnerName` és a `voiceArmed` megmarad.

Automatikus szünet történik:

- játékosváltáskor;
- pörgetés indulásakor;
- forduló végén.

A Phaser kerék tween befejezésekor, tehát **a kerék fizikai megállásának
pillanatában**, a VoiceEngine automatikusan visszaindul, ha az aktuális
játékos a voice owner. Ekkor a phase még `wheelResult` lehet.

A mikrofon nem várja meg a `wheel.resultDisplayMs` leteltét. A
játékműveletek ettől függetlenül továbbra is saját phase-validációt használnak.

Játékosváltáskor a globális mikrofonállapot megmarad. Emberi játékosnál a
mikrofon használható, Bot körében viszont automatikusan szünetel és a gomb
letiltott. A következő emberi játékosnál a globális bekapcsolt állapot újra
érvényesül.

Lobbyba visszalépéskor a voice runtime és a globális mikrofonállapot teljesen
leáll.

## COMMAND események

### SPIN / Pörgetés

A meglévő:

`spinWheel(false)`

fut.

Csak `spin` fázisban érvényes.

### VOWEL / Magánhangzó

A játék magánhangzó-várakozó módba lép.

Ha ugyanabban a transcriptben már van betű:

```text
magánhangzó A mint Alma
```

akkor azonnal megpróbálja a vásárlást.

Egyébként a következő `LETTER` eseményt várja.

### SOLVE / Megfejtés

A solve dialog voice módban megnyílik.

A következő final transcript teljes válaszként kerül a:

`trySolve(answer, false)`

függvénybe.

Az egymondatos:

```text
Megfejtés A kocka el van vetve
```

forma is támogatott.

### GAME

A parserből örökölt command jelenleg csak debug-visszajelzést ad; nincs
játékművelethez rendelve.

## LETTER események

A parser szabálya:

```text
B mint Balázs -> B
Cé mint Cecil -> C
Y mint ipszilon -> Y
Duplavé mint Walter -> W
```

Ha a betű magánhangzó, a meglévő `buyVowel()` hívódik.

Ha mássalhangzó:

- csak `letter` fázisban fogadható;
- a meglévő `handleConsonant()` hívódik.

## Bot kör

A VoiceEngine továbbra is hallgathat, de játékműveletet Bot körében nem hajt
végre.

A debug panel ilyenkor:

`VÁRAKOZÁS · BOT KÖRE`

állapotot mutat.

## HANG TESZT panel

DOM:

- `#voiceDebugPanel`
- `#voiceDebugState`
- `#voiceDebugText`
- `#voiceDebugEvent`

Megjeleníti az interim/final transcriptet, az értelmezett eseményt és a
provider állapotát.

Ez kifejezetten a következő finomhangolási körökhöz készült.

## Hibakezelés

Fatal provider hiba esetén:

- `voiceActive = false`;
- mikrofon stream leáll;
- panel piros hibastátuszt kap;
- stage feedback megjelenik.

Nem fatal hiba esetén a browser provider újraindulhat.

## Következő finomhangolások

Tervezett:

- command aliasok bővítése;
- magyar betűfelismerés pontosságának hangolása;
- solve transcript tisztítás;
- háttérzaj-tűrés;
- mikrofon/provider viselkedés összehasonlítása;
- később Whisper provider.


## Játékzene és globális mikrofon

Ha a globális mikrofon be van kapcsolva és emberi játékos van soron, a
játékzene célhangereje alapértelmezés szerint a
`voiceOwnerTurnMultiplier` értékével szorzódik. A jelenlegi alapérték 0,
tehát ilyenkor a játékzene néma. Bot körében ez a szabály nem aktív.

Az aktív mikrofon-ducking ettől külön mechanizmus.

A pörgetés alatt a mikrofon szünetel, majd a kerék fizikai megállásakor azonnal
visszakapcsolhat, miközben a zene továbbra is a globális mikrofon szabály szerint
marad némítva.


## Haladó névfelismerés

A Beállításokban külön kapcsoló:

`Haladó névfelismerés`

Mentett kulcs:

`advancedNameRecognitionEnabled`

Bekapcsolva a parser a final transcript minden szavát összeveti a
`config/hungarian-names.js` listával. Egyezésnél a konfigurált betű lesz a
LETTER esemény értéke.

Példák:

```text
Anna -> A
Aladár -> A
Béla -> B
Botond -> B
Krisztián -> K
Ypszilon -> Y
```

Ez kiegészítő mechanizmus: a meglévő `B mint Balázs`, `Cé mint Cecil`
és más `mint/min` formák változatlanul működnek.

A névlista külön konfigurációs fájlban van:

`config/hungarian-names.js`

Struktúra:

```js
namesByLetter: {
  A: ["Anna", "Aladár"],
  B: ["Béla", "Botond"]
}
```

Speciális aliasok külön kivétellistában adhatók meg. Jelenleg:

```text
Ypszilon / ipszilon -> Y
```

A felismerés teljes szavas egyezést használ, így egy név részlete nem vált ki
téves betűeseményt.
