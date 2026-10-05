# KriszWheel – továbbfejlesztési ötletek

Ez a dokumentum a stabilizálás utáni lehetséges fejlesztési irányokat gyűjti.
Nem kötelező roadmap: ötlettár, amelyből később lehet sprintet választani.

## 1. Puzzle validátor

**Állapot: elkészült.**

A `tools/validate_puzzles.py` fejlesztői script ellenőrzi a négy éles CSV-t:

- fájlok és CSV fejléc;
- pontos elemszám;
- üres kategória / feladvány;
- fájlon belüli duplikáció;
- nehézségi szintek közötti duplikáció;
- túl hosszú szó;
- 15 × 4-es táblára való tördelhetőség;
- szokatlan karakterek;
- kategóriastatisztika.

A script magyarul kommunikál, nem módosít adatot, és hiba esetén 1-es exit
kóddal tér vissza.

## 2. Sessionön belüli ismétlés kizárása

Jelenleg csak a közvetlenül előző puzzle indexét kerüljük.

Jobb megoldás:

- egy sessionben ugyanaz a feladvány ne jöhessen újra;
- új játék indításakor az előzmény nullázódjon;
- ha egy teljes készlet elfogyott, csak akkor induljon új ciklus.

## 3. Teljes scoreboard játék közben

A victory képernyőn már van teljes állás, a stage-en viszont csak az aktuális
játékos látszik.

Lehetséges UI:

- kis avatar minden játékoshoz;
- összesített pénz;
- aktuális játékos kiemelése;
- opcionálisan fordulógyőzelmek száma.

## 4. Nincs több mássalhangzó – erősebb UX

A logika már tiltja a további pörgetést.

Tovább javítható:

- Pörgetés vizuális elsötétítése;
- Megfejtés gomb pulzáló / fényes kiemelése;
- rövid hangjelzés;
- külön stage felirat.

## 5. Kerék hangdesign

A vizuális élményhez sokat adna:

- indulási effekt;
- cikkelyenkénti tick;
- lassulással együtt ritkuló tick;
- külön pénzmező hang;
- CSŐD effekt;
- KIMARADSZ effekt.

## 6. Fordulók közötti TV-show átvezetés

Victory után rövid átvezetés:

- kategória felvillan;
- új tábla fokozatosan bekapcsol;
- rövid zenei átvezető;
- az aktuális játékos panel újra fókuszt kap.

## 7. Játék végi összesítő

A kézi Játék vége után opcionális összesítő képernyő:

- teljes végeredmény;
- győztes;
- össznyeremény;
- megnyert fordulók;
- legtöbb sikeres betű;
- esetleg játékidő.

## 8. Bot intelligencia

A Bot emberibbé tehető:

- magyar betűgyakoriság;
- már felfedett mintázat figyelembevétele;
- kategóriafüggő döntés;
- jobb magánhangzó-stratégia;
- túl korai megfejtés elkerülése;
- külön Bot nehézségi profilok.

## 9. Nehézségi szintek minőségi ellenőrzése

Nem csak külön CSV legyen, hanem mérhető profil:

- átlagos karakterszám;
- átlagos szószám;
- ritka szavak aránya;
- közismert vs. speciális témák;
- kategóriák eloszlása.

A validátor később ezekről statisztikát is adhat.

## 10. Mobil / tablet támogatás

Cél:

- Samsung S23;
- iPhone 15/16;
- iPad;
- desktop.

Fő feladatok:

- fekvő mobil layout;
- nagyobb hotspotok;
- virtuális magyar betűpanel;
- kerék átméretezése;
- victory overlay adaptálása;
- voice UI helyének áttervezése.

## 11. Voice UX finomhangolás

A technikai integráció működik, az élmény tovább javítható:

- látványosabb „hallgatlak” állapot;
- felismert betű rövid nagy kijelzése;
- bizonytalan transcript kezelés;
- háttérzaj-tűrés;
- solve transcript tisztítás;
- később opcionális Whisper provider.

## 12. Hall of Fame / statisztika

Backend esetén:

- játékosonként győzelmek;
- össznyeremény;
- legtöbb megnyert forduló;
- legnagyobb egyfordulós nyeremény;
- megfejtett feladványok;
- heti / havi statisztika.

## 13. Puzzle editor / admin

A CSV kézi szerkesztése helyett később külön admin felület:

- feladvány hozzáadás;
- kategória;
- nehézség;
- élő tábla-preview;
- validáció;
- duplikáció-ellenőrzés;
- export / mentés.

## 14. Release mód

Stabil verzióhoz érdemes egy egyszerű release-checklist:

- `debug.showTestButton = false`;
- puzzle-validátor sikeres;
- smoke test sikeres;
- verzió és build dátum frissítve;
- konzolhiba nincs;
- desktop + mobil alapteszt;
- dokumentáció aktualizálva.

## Javasolt sorrend

1. intenzív gameplay tesztelés;
2. validátor által talált adatproblémák javítása;
3. sessionön belüli puzzle-ismétlés kizárása;
4. scoreboard;
5. kerék hangdesign;
6. játék végi összesítő;
7. mobil / tablet;
8. Bot intelligencia;
9. voice UX;
10. admin / backend / Hall of Fame.
