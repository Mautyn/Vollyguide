import { ROTATION_ORDER } from '../../rotations';
import type { LessonText } from '../types';
import { PL_NOTES } from './notes';

/** Polish lessons, keyed by lesson id. */
export const PL_LESSONS: Readonly<Record<string, LessonText>> = {
  'court-zones-rotation': {
    title: 'Boisko, strefy i kolejność ustawień',
    summary: 'Linie boiska, sześć stref i to, jak drużyna wykonuje rotację.',
    steps: [
      {
        title: 'Boisko',
        body: [
          'Boisko do siatkówki ma 9 m szerokości i 18 m długości. Siatka dzieli je na dwie połowy 9 × 9 m.',
          'Na każdej połowie linia ataku biegnie 3 m od siatki. Oddziela strefę ataku od strefy obrony.',
        ],
      },
      {
        title: 'Sześć stref',
        body: [
          'Każda połowa ma sześć stref, numerowanych przeciwnie do ruchu wskazówek zegara od prawej tylnej: 1 prawa tylna, 2 prawa przednia, 3 środkowa przednia, 4 lewa przednia, 5 lewa tylna, 6 środkowa tylna.',
          'Jasne cyfry na naszej połowie boiska pokazują, gdzie jest każda strefa.',
        ],
      },
      {
        title: 'Pierwsza i druga linia',
        body: [
          'Strefy 2, 3 i 4 tworzą pierwszą linię; strefy 1, 5 i 6 – drugą linię.',
          'Tylko zawodnicy pierwszej linii mogą blokować albo atakować piłkę powyżej górnej krawędzi siatki sprzed linii ataku.',
        ],
      },
      {
        title: 'Rozgrywający wyznacza ustawienie',
        body: [
          'Ustawienie nazywamy od strefy, w której w momencie zagrywki stoi rozgrywający.',
          'Tutaj rozgrywający jest w strefie 1, więc to ustawienie 1.',
        ],
      },
      {
        title: 'Rotacja zgodnie z ruchem wskazówek zegara',
        body: [
          'Gdy drużyna odbiera przeciwnikowi zagrywkę, każdy zawodnik przechodzi o jedną strefę zgodnie z ruchem wskazówek zegara: 2 → 1, 1 → 6, 6 → 5, 5 → 4, 4 → 3 i 3 → 2.',
          'Rozgrywający przechodzi ze strefy 1 do strefy 6, więc drużyna jest teraz w ustawieniu 6.',
        ],
      },
      {
        title: 'Kolejność ustawień',
        body: [
          'Kolejna rotacja przenosi rozgrywającego do strefy 5. W secie drużyna gra ustawienia w kolejności 1, 6, 5, 4, 3, 2, a potem znowu 1.',
        ],
      },
    ],
  },
  'overlap-rule': {
    title: 'Błąd ustawienia',
    summary: 'Co sędzia sprawdza w momencie zagrywki – na prawidłowych i błędnych przykładach.',
    steps: [
      {
        title: 'Kiedy obowiązuje przepis',
        body: [
          'Ustawienie ocenia się tylko w momencie uderzenia piłki przy zagrywce, według położenia stóp zawodników. Po zagrywce zawodnicy mogą poruszać się dowolnie.',
          'Każdego zawodnika porównuje się z sąsiadami: z zawodnikiem przed nim lub za nim oraz z zawodnikami po lewej i po prawej.',
        ],
      },
      {
        title: 'Przód kontra tył',
        body: [
          'Każdy zawodnik pierwszej linii musi być bliżej siatki niż zawodnik drugiej linii stojący bezpośrednio za nim: strefa 4 przed 5, 3 przed 6 i 2 przed 1.',
          'Tutaj atakujący w strefie 4 jest bliżej siatki niż przyjmujący w strefie 5.',
        ],
      },
      {
        title: 'Lewo kontra prawo',
        body: [
          'W każdej linii trzeba zachować kolejność od lewej do prawej: 4-3-2 w pierwszej linii i 5-6-1 w drugiej.',
          'Zawodnicy muszą być tylko na lewo lub na prawo od sąsiadów. Nie muszą stać w prostej linii.',
        ],
      },
      {
        title: 'Prawidłowa kryjówka',
        body: [
          'W przyjęciu zagrywki rozgrywający ze strefy 1 stoi tuż za zawodnikiem ze strefy 2, trochę na prawo od niego.',
          'Wygląda to nietypowo, ale każda para zachowuje kolejność, więc ustawienie jest prawidłowe.',
        ],
      },
      {
        title: 'Błąd: rozgrywający wychodzi za wcześnie',
        body: [
          'Tutaj rozgrywający ruszył do siatki przed zagrywką i jest teraz bliżej siatki niż zawodnik z prawej strony pierwszej linii.',
          'To błąd ustawienia między strefami 2 i 1 – sędzia przyznałby punkt drużynie zagrywającej.',
        ],
      },
      {
        title: 'Błąd: zamienieni sąsiedzi',
        body: [
          'Tutaj zawodnik z lewej strony drugiej linii (strefa 5) przesunął się na prawo od zawodnika ze środka drugiej linii (strefa 6).',
          'Druga linia nie zachowuje już kolejności 5-6-1, więc to także błąd ustawienia.',
        ],
      },
    ],
  },
  '5-1-serve-receive': {
    title: 'Przyjęcie zagrywki w systemie 5-1',
    summary:
      'Gdzie stoi każdy zawodnik przy przyjęciu zagrywki, we wszystkich sześciu ustawieniach.',
    steps: [
      {
        title: 'Trzech przyjmujących',
        body: [
          'W systemie 5-1 zagrywkę przyjmuje trzech zawodników: obaj przyjmujący i środkowy, który jest w drugiej linii.',
          'Stoją w jednej linii około 4 m od linii końcowej, każdy w swoim torze. Pozostali schodzą im z drogi, nadal zachowując prawidłowe ustawienie.',
        ],
      },
      ...ROTATION_ORDER.map((rotation) => ({
        title: `Ustawienie ${rotation}`,
        body: [PL_NOTES[`5-1-r${rotation}-receive`]!],
      })),
    ],
  },
};
