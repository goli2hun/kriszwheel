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

Az egyedi SFX hangerő és a fő hangerő összeszorzódik.

## 3. Mentés

Tárolási kulcs:

`kriszwheel.user-settings.v1`

Jelenlegi objektum:

```json
{
  "soundsEnabled": true,
  "masterVolume": 1
}
```

A mentés böngészőnként történik `localStorage` használatával.

Ha a tartós tárolás nem érhető el, a beállítás az aktuális munkamenetben
továbbra is működik, és a UI erről visszajelzést ad.

## 4. Vissza

A `Vissza` gomb:

1. nem menti az aktuális módosításokat;
2. újratölti a formot a legutóbbi mentett/runtime értékekből;
3. visszatér a lobby játékosválasztó képernyőjére.

A kiválasztott lobby-játékosok nem vesznek el, mert ugyanaz a DOM marad
meg, csak a nézetek láthatósága változik.

## 5. Hangfelismerés

A szekció UI-ja elkészült, de még nem aktív.

Előkészített DOM:

- `#speechRecognitionEnabledSetting`;
- `#speechLanguageSetting`.

Első nyelv:

`Magyar (hu-HU)`

Tervezett későbbi beállítások:

- hangfelismerés engedélyezése;
- mikrofon;
- felismerési motor;
- érzékenység;
- trigger/parancsok;
- betűfelismerési kivételek.

A jelenlegi vezérlők szándékosan `disabled` állapotúak.

## 6. Statikus config és felhasználói settings

A két rendszer különböző:

### config/game-config.js

Fejlesztői/játékparaméterek:

- kerék;
- Bot;
- időzítések;
- assetek;
- victory;
- alap SFX hangerők.

### localStorage settings

A játékos által a lobbyból módosítható preferenciák.

Ezt a szétválasztást a hangfelismerés integrációjánál is meg kell tartani:
a technikai defaultok mehetnek configba, a felhasználó által választott
mikrofon/engedélyezés/érzékenység pedig a settings rendszerbe.
