// KriszWheel – paraméterezhető magyar keresztnév alapú betűfelismerés.
// A parser a transcript bármely szavát összeveti ezzel a listával.
// Találat esetén a kulcs lesz a felismert betű.
window.KRISZWHEEL_HUNGARIAN_NAMES = {
  namesByLetter: {
    A: ["Anna", "Aladár", "Albert", "András", "Antal", "Attila", "Anikó", "Andrea", "Anita"],
    Á: ["Ádám", "Ábel", "Ágnes", "Ágota", "Ákos", "Árpád"],
    B: ["Béla", "Botond", "Balázs", "Bence", "Benedek", "Bernadett", "Bianka", "Boglárka"],
    C: ["Cecil", "Cecília", "Cintia"],
    D: ["Dávid", "Dániel", "Dalma", "Dóra", "Dorina", "Dominik"],
    E: ["Edit", "Erika", "Ervin", "Emese", "Emma", "Endre"],
    É: ["Éva", "Édua"],
    F: ["Ferenc", "Flóra", "Fanni", "Frigyes"],
    G: ["Gábor", "Gabriella", "Gergely", "Gréta", "Gyula"],
    H: ["Hanna", "Henrik", "Huba", "Hajnalka"],
    I: ["Ilona", "Imre", "Ildikó", "István", "Iván"],
    J: ["János", "József", "Júlia", "Judit", "Jenő"],
    K: ["Károly", "Katalin", "Krisztián", "Kinga", "Kornél", "Kristóf"],
    L: ["László", "Levente", "Lajos", "Lilla", "Luca", "Laura"],
    M: ["Mária", "Márk", "Máté", "Miklós", "Melinda", "Mónika"],
    N: ["Nóra", "Norbert", "Nikolett", "Noémi", "Nándor"],
    O: ["Olivér", "Orsolya", "Ottó"],
    Ö: ["Ödön", "Örs"],
    P: ["Péter", "Pál", "Patrik", "Petra", "Piroska"],
    R: ["Róbert", "Réka", "Richárd", "Roland", "Rita"],
    S: ["Sándor", "Sarolta", "Simon", "Szabolcs", "Szilvia"],
    T: ["Tamás", "Tibor", "Tímea", "Tünde", "Teodóra"],
    U: ["Ulrik"],
    V: ["Viktor", "Viktória", "Vilmos", "Virág"],
    W: ["Walter"],
    Z: ["Zoltán", "Zsolt", "Zsófia", "Zsanett", "Zita"]
  },

  // Nem keresztnév, de a felhasználó által kért speciális kivétel.
  exceptions: [
    { value: "Y", aliases: ["ypszilon", "ipszilon"] }
  ]
};
