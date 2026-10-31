/** The same serve note for all six rotations of a system. */
function serveNotes(system: string, note: string): Record<string, string> {
  return Object.fromEntries([1, 2, 3, 4, 5, 6].map((r) => [`${system}-r${r}-serve`, note]));
}

/** Polish formation notes, keyed by formation id. */
export const PL_NOTES: Readonly<Record<string, string>> = {
  '5-1-r1-receive':
    'Rozgrywający w strefie 1 musi stać za przyjmującym z prawej strony pierwszej linii, więc ma najdłuższą drogę do siatki.',
  '5-1-r2-receive':
    'Rozgrywający w strefie 2 stoi już w miejscu wystawy, więc to najłatwiejsze ustawienie.',
  '5-1-r3-receive':
    'Rozgrywający w strefie 3 zaczyna przy siatce; atakujący z drugiej linii chowa się tuż za nim.',
  '5-1-r4-receive':
    'Rozgrywający w strefie 4 jest już w pierwszej linii i przesuwa się wzdłuż siatki w prawo.',
  '5-1-r5-receive':
    'Rozgrywający w strefie 5 musi stać dalej od siatki niż środkowy z lewej strony pierwszej linii i na lewo od środkowego przyjmującego, a potem biegnie wzdłuż siatki.',
  '5-1-r6-receive':
    'Rozgrywający w strefie 6 chowa się tuż za atakującym przy siatce i wychodzi do przodu, żeby wystawić.',
  '6-2-r1-receive':
    'R1 wystawia ze strefy 1 i musi stać za przyjmującym z prawej strony pierwszej linii; R2 jest w pierwszej linii i atakuje z prawej strony.',
  '6-2-r2-receive':
    'Ustawienie 5 z zamienionymi rozgrywającymi: R2 wystawia ze strefy 5 i biegnie wzdłuż siatki.',
  '6-2-r3-receive':
    'Ustawienie 6 z zamienionymi rozgrywającymi: R2 wystawia ze strefy 6, chowając się za R1 przy siatce.',
  '6-2-r4-receive':
    'Ustawienie 1 z zamienionymi rozgrywającymi: R2 wystawia ze strefy 1, a R1 atakuje z prawej strony.',
  '6-2-r5-receive':
    'R1 wystawia ze strefy 5: stoi dalej od siatki niż środkowy z lewej strony pierwszej linii i na lewo od środkowego przyjmującego, a potem biegnie wzdłuż siatki.',
  '6-2-r6-receive':
    'R1 wystawia ze strefy 6, chowając się tuż za R2 przy siatce; R2 atakuje z prawej strony.',
  '4-2-r1-receive':
    'R2 wystawia z pierwszej linii: zaczyna w strefie 4, musi stać na lewo od środkowego, a potem przesuwa się w prawo do strefy 3.',
  '4-2-r2-receive':
    'Ustawienie 5 z zamienionymi rozgrywającymi: R1 zaczyna w strefie 2 i przesuwa się w lewo do strefy 3, żeby wystawić.',
  '4-2-r3-receive':
    'Ustawienie 6 z zamienionymi rozgrywającymi: R1 jest już w strefie 3 i stamtąd wystawia.',
  '4-2-r4-receive':
    'Ustawienie 1 z zamienionymi rozgrywającymi: R1 zaczyna w strefie 4 i przesuwa się w prawo do strefy 3, żeby wystawić.',
  '4-2-r5-receive':
    'R2 zaczyna w strefie 2, musi stać na prawo od środkowego przyjmującego, a potem przesuwa się w lewo do strefy 3.',
  '4-2-r6-receive':
    'R2 jest już w strefie 3 i wystawia z miejsca; R1 stoi głęboko, poza torami przyjęcia.',
  ...serveNotes(
    '5-1',
    'Zagrywa zawodnik ze strefy 1 zza linii końcowej; z libero zagrywa libero w kolejce Ś1 (przepisy USAV/NCAA, nie FIVB). Po zagrywce pierwsza linia przechodzi: P na lewo, Ś na środek, A lub R na prawo; druga linia: libero lub Ś na lewo, P na środek, R lub A na prawo.',
  ),
  ...serveNotes(
    '6-2',
    'Zagrywa zawodnik ze strefy 1 zza linii końcowej; z libero zagrywa libero w kolejce Ś1 (przepisy USAV/NCAA, nie FIVB). Po zagrywce pierwsza linia przechodzi: P na lewo, Ś na środek, rozgrywający z pierwszej linii na prawo (atakuje jak atakujący); druga linia: libero lub Ś na lewo, P na środek, rozgrywający na prawo.',
  ),
  ...serveNotes(
    '4-2',
    'Zagrywa zawodnik ze strefy 1 zza linii końcowej; z libero zagrywa libero w kolejce Ś1 (przepisy USAV/NCAA, nie FIVB). Po zagrywce pierwsza linia przechodzi: P na lewo, rozgrywający z pierwszej linii na środek (wystawia ze strefy 3), Ś na prawo; druga linia: libero lub Ś na lewo, P na środek, rozgrywający na prawo.',
  ),
};
