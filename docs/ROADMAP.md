# KriszWheel – Roadmap

Ez a dokumentum a jelenlegi állapotból indul ki. A korábban tervezett
feladvány-adatforrás és a böngészős hangvezérlés már megvalósult, ezért ezek
nem jövőbeli feladatként szerepelnek.

## Elkészült alapok

Jelenleg működik:

- lobby több játékossal és Bot támogatással;
- Gyerek / Könnyű / Közepes / Nehéz nehézségválasztó;
- Teszt / Éles feladványmód;
- 4 külön CSV-adatforrás, egyenként 100 feladvánnyal;
- Phaser kerék és konfigurálható méretezés;
- billentyűzetes mássalhangzó- és magánhangzóbevitel;
- Browser SpeechRecognition alapú hangvezérlés;
- Bot;
- fordulópénz és összesített pénz;
- győzelmi overlay és tűzijáték;
- külön lobby-, játék-, kerék- és győzelmi zene;
- voice-owner körben automatikusan némuló játékzene;
- Auto pörgetés;
- konfigurálható játékidőzítések;
- lobby build/verzió információ.

## P0 – Stabilitási és intenzív tesztelési kör

A következő szakasz elsődleges célja a jelenlegi játék kemény tesztelése.

Kiemelten ellenőrizendő:

- hosszú játék több egymást követő fordulóval;
- Játék vége minden állapotból;
- lobby ↔ játék zenei életciklus;
- voice owner váltások;
- mikrofon visszakapcsolása kerékmegálláskor;
- Auto pörgetés és kézi/hangos pörgetés ütközése;
- több azonos mássalhangzó felfedési sorrendje;
- utolsó felfedés + 1 s utáni pörgetés;
- CSŐD és KIMARADSZ;
- hibás/helyes megfejtés;
- Bot körök;
- éles CSV-k mind a négy nehézségen;
- hosszú vagy nehezen tördelhető feladványok.

## P0 – Puzzle validátor

Az éles CSV-betöltés már ellenőrzi az elvárt minimális elemszámot, de kell
egy teljes fejlesztői validátor is.

Javasolt ellenőrzések:

- pontos / minimális elemszám;
- duplikált feladványok;
- üres kategória vagy szöveg;
- 15 × 4-es táblába való illeszthetőség;
- túl hosszú szó;
- támogatott magyar karakterek;
- hibás CSV idézőjelezés;
- kategóriastatisztika.

A validátor lehet külön fejlesztői script, hogy a runtime egyszerű maradjon.

## P1 – Teljes scoreboard

Az aktuális játékos panel működik, a victory képernyőn pedig már látszik a
teljes állás. Játék közben azonban nincs folyamatos teljes eredménytábla.

Lehetséges megoldás:

- minden játékos kis avatarja;
- totalMoney;
- aktuális játékos kiemelése;
- opcionálisan megnyert fordulók száma.

## P1 – Hangok finomítása

A jelenlegi hangrendszer működőképes, de tovább gazdagítható:

- kerék indulási hang;
- sebességfüggő tick;
- pénzmező visszajelzés;
- külön CSŐD / KIMARADSZ effekt;
- külön victory fanfare;
- finomabb átmenetek.

## P1 – Magánhangzó UX véglegesítése

A háttérképen Magánhangzó gomb látszik, de a DOM ID történeti okból még
`consonantStageBtn`.

Javasolt:

- átnevezés `vowelStageBtn`-re;
- egyértelmű elég pénz / nincs elég pénz állapot;
- mobilon külön virtuális input;
- kattintásos magánhangzó-várakozó mód finomítása.

## P1 – Feladvány-adatbázis bővítése

A jelenlegi 4 × 100 CSV jó első éles készlet.

Következő lépések:

- kategóriánként kiegyensúlyozottabb eloszlás;
- duplikáció-ellenőrzés szintek között is;
- több száz / több ezer feladvány;
- opcionális kategóriaszűrés;
- később admin vagy generáló workflow.

## P2 – Game session / végső győztes

Most tetszőleges számú fordulót játszunk, és minden forduló nyertesét külön
ünnepeljük.

Lehetséges session szabályok:

- X forduló;
- célösszeg;
- időlimit;
- kézi Játék vége után végső összesítés.

Ezután külön teljes-játék győztes képernyő készülhetne.

## P2 – Bot fejlesztés

A jelenlegi Bot valószínűségi alapú.

Fejlesztési irányok:

- magyar betűgyakoriság;
- látható mintázatok figyelembevétele;
- kategóriafüggő döntések;
- jobb magánhangzó-vásárlási stratégia;
- külön easy / normal / hard Bot profilok.

## P2 – Mobil / tablet layout

Célplatformok:

- Samsung S23;
- iPhone 15/16;
- iPad;
- Full HD desktop.

Feladatok:

- portrait/landscape stratégia;
- hotspotok méretezése;
- victory card;
- kerék overlay;
- virtuális betűpanel;
- voice UI helyigénye.

## P2 – Voice finomhangolás

A Browser SpeechRecognition runtime már működik.

Következő lépések:

- command aliasok bővítése;
- háttérzaj-tűrés;
- solve transcript tisztítás;
- betűfelismerési edge case-ek;
- mikrofon/provider összehasonlítás;
- opcionális Whisper provider.

A jelenlegi `mint/min` parser és a konfigurálható kivételek megtartandók.

## P3 – Backend

Ha a statikus frontendet kinőjük:

- FastAPI;
- SQLite;
- puzzle adatbázis;
- játékstatisztika;
- Hall of Fame;
- felhasználók;
- session mentés.

A jelenlegi működéshez backend nem szükséges.

## P3 – app.js refaktor

Az `app.js` már nagy, ezért stabilizálás után érdemes modulokra bontani:

```text
src/
├── config.js
├── game-state.js
├── puzzle.js
├── wheel.js
├── victory.js
├── bot.js
├── audio.js
├── voice.js
└── ui.js
```

A refaktort csak stabil gameplay után érdemes elkezdeni.

## Ajánlott sorrend

1. intenzív teszt + regressziójavítás;
2. puzzle validátor;
3. scoreboard;
4. feladványadatbázis bővítése;
5. hangok és UX finomhangolása;
6. mobil / tablet;
7. Bot fejlesztés;
8. game-session;
9. voice / Whisper további finomítás;
10. moduláris refaktor;
11. opcionális backend.

## Következő sprint

A jelenlegi állapotban a legjobb rövid sprint:

**intenzív tesztelés + puzzle validátor + hibajavítások**.

Ez stabil alapot ad az adatbázis további bővítéséhez és a mobilos körhöz.
