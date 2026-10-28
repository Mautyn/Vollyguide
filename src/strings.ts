import { formatDecimal, polishPlural, type Locale } from './i18n/locale';
import { useLocaleStore } from './state/localeStore';

/** English UI text. Polish (`pl`) below has exactly the same shape. */
const en = {
  appName: 'Volleyguide',
  nav: {
    home: 'Home',
    court: 'Court',
    lessons: 'Lessons',
    practice: 'Practice',
    tactics: 'Tactics',
  },
  home: {
    eyebrow: 'Interactive volleyball positioning',
    title: 'Learn professional volleyball positioning',
    intro:
      'Volleyguide shows where each player stands in every rotation and phase of play, on an interactive court drawn to scale.',
    openCourt: 'Open the court',
    browseLessons: 'Browse lessons',
    features: [
      {
        title: 'Rotations',
        body: 'Step through all six rotations of a 5-1 system and see who stands where.',
      },
      {
        title: 'Serve receive',
        body: 'Watch players move from base positions into a serve-receive formation.',
      },
      {
        title: 'Overlap rule',
        body: 'Drag players and get instant feedback on overlap faults at the moment of serve.',
      },
    ],
  },
  court: {
    title: 'Court',
    hint: 'Drag the players. Positions are measured from the team’s own left sideline and from the net: 0 m at the net, 3 m at the attack line, 9 m at the end line.',
    /** How every position is shown to users (see toNetRelative). */
    position: (fromLeft: number, fromNet: number) =>
      `${fromLeft.toFixed(1)} m from left · ${fromNet.toFixed(1)} m from net`,
    reset: 'Reset positions',
    playersHeading: 'Players',
    formationHeading: 'Formation',
    legendHeading: 'Roles',
    canvasLabel: 'Volleyball court, 9 by 18 meters, with draggable players',
    canvasLabelReadOnly: 'Volleyball court, 9 by 18 meters, showing player positions',
    lineupLegal: 'Lineup is legal at the moment of serve.',
    lineupIllegal: 'Overlap fault at the moment of serve:',
    frontBack: (front: number, back: number) =>
      `Zone ${front} must be closer to the net than zone ${back}.`,
    leftRight: (left: number, right: number) => `Zone ${left} must be left of zone ${right}.`,
    zone: (zone: number) => `zone ${zone}`,
    phaseGroup: 'Phase',
    phases: {
      base: 'Base',
      receive: 'Receive',
    },
    phaseHint: 'Receive shows where players stand when the opponent serves.',
    useLibero: 'Use libero',
    liberoHint: 'The libero replaces the back-row middle blocker and never plays in the front row.',
    bench: 'Bench',
    showOpponent: 'Show opponent',
    opponentHint:
      'Shows the opponent’s serving lineup (a 5-1 in rotation 1) on the far side of the net.',
    opponentOnlyInReceive: 'Available in the receive phase.',
    opponentHeading: 'Opponent',
    systemGroup: 'System',
    systemHints: {
      '5-1': 'One setter sets in all six rotations; the opposite plays opposite them.',
      '6-2':
        'Two setters: the one in the back row sets, the one in the front row attacks on the right. Rotations 4–6 repeat 1–3 with the setters swapped.',
      '4-2':
        'Two setters: the one in the front row sets from zone 3, so only two front-row players attack. Rotations 4–6 repeat 1–3 with the setters swapped.',
    },
    rotationGroup: 'Rotation',
    rotation: (rotation: number) => `Rotation ${rotation}`,
    previousRotation: 'Previous rotation',
    nextRotation: 'Next rotation',
    rotationHint:
      'Rotation number = the zone the setter (S1 with two setters) stands in. Played in the order 1, 6, 5, 4, 3, 2.',
  },
  lessons: {
    title: 'Lessons',
    intro: 'Short guided lessons. Each step explains one idea on the court.',
    stepCount: (count: number) => `${count} steps`,
    start: 'Start lesson',
    allLessons: 'All lessons',
    stepOf: (step: number, count: number) => `Step ${step} of ${count}`,
    previous: 'Previous',
    next: 'Next',
    finish: 'Back to lessons',
    stepsNav: 'Lesson steps',
    goToStep: (step: number) => `Go to step ${step}`,
  },
  practice: {
    title: 'Practice',
    hint: 'Pick a task, drag the players from the bench to where they should stand at the moment of serve, then check.',
    taskHeading: 'Task',
    task: (system: string, rotation: number, phase: string) =>
      `${system}, rotation ${rotation}, ${phase.toLowerCase()}`,
    randomTask: 'Random task',
    check: 'Check',
    showAnswer: 'Show answer',
    tryAgain: 'Try again',
    resultHeading: 'Result',
    result: (correct: number, total: number, legal: boolean) =>
      `${correct} of ${total} correct, lineup ${legal ? 'legal' : 'illegal'}`,
    correct: 'on the spot',
    off: (meters: number) => `${meters.toFixed(1)} m off`,
    tolerance: (meters: number) => `A player counts as correct within ${meters} m of their spot.`,
  },
  tactics: {
    title: 'Tactics',
    intro:
      'Game situations played out step by step: where every player stands, what they do, and why.',
    topicsNav: 'Topics',
    situationsNav: 'Situations',
    moment: (moment: number, count: number) => `Moment ${moment} of ${count}`,
    progress: 'Progress',
    play: 'Play',
    pause: 'Pause',
    restart: 'Restart',
    previous: 'Previous moment',
    next: 'Next moment',
    speed: 'Speed',
    speedOption: (speed: number) => `${speed}×`,
    positioning: 'Positioning',
    execution: 'Execution',
    principles: 'Key principles',
    whoIsAttacking: 'Who is attacking?',
  },
  roles: {
    S: 'Setter',
    OH: 'Outside hitter',
    OPP: 'Opposite',
    MB: 'Middle blocker',
    L: 'Libero',
  },
  notFound: 'Page not found.',
  language: 'Language',
  languages: { en: 'English', pl: 'Polski' },
};

export type Strings = typeof en;

const dec = (value: number) => formatDecimal(value, 1, 'pl');
const plain = (value: number) => String(value).replace('.', ',');

/** Polish UI text. TypeScript checks it has every key of the English text. */
const pl: Strings = {
  appName: 'Volleyguide',
  nav: {
    home: 'Start',
    court: 'Boisko',
    lessons: 'Lekcje',
    practice: 'Trening',
    tactics: 'Taktyka',
  },
  home: {
    eyebrow: 'Interaktywne ustawienie w siatkówce',
    title: 'Naucz się profesjonalnego ustawienia w siatkówce',
    intro:
      'Volleyguide pokazuje, gdzie stoi każdy zawodnik w każdym ustawieniu i każdej fazie gry, na interaktywnym boisku narysowanym w skali.',
    openCourt: 'Otwórz boisko',
    browseLessons: 'Przeglądaj lekcje',
    features: [
      {
        title: 'Ustawienia',
        body: 'Przejdź przez wszystkie sześć ustawień systemu 5-1 i zobacz, kto gdzie stoi.',
      },
      {
        title: 'Przyjęcie zagrywki',
        body: 'Zobacz, jak zawodnicy przechodzą z pozycji wyjściowych do ustawienia w przyjęciu.',
      },
      {
        title: 'Błąd ustawienia',
        body: 'Przeciągaj zawodników i od razu zobacz, czy w momencie zagrywki nie ma błędu ustawienia.',
      },
    ],
  },
  court: {
    title: 'Boisko',
    hint: 'Przeciągaj zawodników. Pozycje mierzymy od lewej linii bocznej danej drużyny i od siatki: 0 m przy siatce, 3 m na linii ataku, 9 m na linii końcowej.',
    position: (fromLeft: number, fromNet: number) =>
      `${dec(fromLeft)} m od lewej · ${dec(fromNet)} m od siatki`,
    reset: 'Przywróć pozycje',
    playersHeading: 'Zawodnicy',
    formationHeading: 'Formacja',
    legendHeading: 'Funkcje',
    canvasLabel: 'Boisko do siatkówki 9 na 18 metrów z zawodnikami, których można przeciągać',
    canvasLabelReadOnly: 'Boisko do siatkówki 9 na 18 metrów z pozycjami zawodników',
    lineupLegal: 'Ustawienie w momencie zagrywki jest prawidłowe.',
    lineupIllegal: 'Błąd ustawienia w momencie zagrywki:',
    frontBack: (front: number, back: number) =>
      `Zawodnik ze strefy ${front} musi być bliżej siatki niż zawodnik ze strefy ${back}.`,
    leftRight: (left: number, right: number) =>
      `Zawodnik ze strefy ${left} musi być na lewo od zawodnika ze strefy ${right}.`,
    zone: (zone: number) => `strefa ${zone}`,
    phaseGroup: 'Faza',
    phases: {
      base: 'Wyjściowe',
      receive: 'Przyjęcie',
    },
    phaseHint: 'Przyjęcie pokazuje, gdzie stoją zawodnicy, gdy zagrywa przeciwnik.',
    useLibero: 'Gra z libero',
    liberoHint: 'Libero zastępuje środkowego z drugiej linii i nigdy nie gra w pierwszej linii.',
    bench: 'Ławka',
    showOpponent: 'Pokaż przeciwnika',
    opponentHint:
      'Pokazuje ustawienie przeciwnika przy jego zagrywce (5-1, ustawienie 1) po drugiej stronie siatki.',
    opponentOnlyInReceive: 'Dostępne w fazie przyjęcia.',
    opponentHeading: 'Przeciwnik',
    systemGroup: 'System',
    systemHints: {
      '5-1':
        'Jeden rozgrywający wystawia we wszystkich sześciu ustawieniach; atakujący stoi naprzeciwko niego.',
      '6-2':
        'Dwóch rozgrywających: wystawia ten z drugiej linii, a ten z pierwszej linii atakuje z prawej strony. Ustawienia 4–6 powtarzają 1–3 z zamienionymi rozgrywającymi.',
      '4-2':
        'Dwóch rozgrywających: wystawia ten z pierwszej linii, ze strefy 3, więc atakuje tylko dwóch zawodników z pierwszej linii. Ustawienia 4–6 powtarzają 1–3 z zamienionymi rozgrywającymi.',
    },
    rotationGroup: 'Ustawienie',
    rotation: (rotation: number) => `Ustawienie ${rotation}`,
    previousRotation: 'Poprzednie ustawienie',
    nextRotation: 'Następne ustawienie',
    rotationHint:
      'Numer ustawienia = strefa, w której stoi rozgrywający (R1 przy dwóch rozgrywających). Kolejność w meczu: 1, 6, 5, 4, 3, 2.',
  },
  lessons: {
    title: 'Lekcje',
    intro: 'Krótkie lekcje z przewodnikiem. Każdy krok wyjaśnia jedną rzecz na boisku.',
    stepCount: (count: number) => `${count} ${polishPlural(count, 'krok', 'kroki', 'kroków')}`,
    start: 'Zacznij lekcję',
    allLessons: 'Wszystkie lekcje',
    stepOf: (step: number, count: number) => `Krok ${step} z ${count}`,
    previous: 'Wstecz',
    next: 'Dalej',
    finish: 'Wróć do lekcji',
    stepsNav: 'Kroki lekcji',
    goToStep: (step: number) => `Przejdź do kroku ${step}`,
  },
  practice: {
    title: 'Trening',
    hint: 'Wybierz zadanie, przeciągnij zawodników z ławki tam, gdzie powinni stać w momencie zagrywki, i sprawdź.',
    taskHeading: 'Zadanie',
    task: (system: string, rotation: number, phase: string) =>
      `${system}, ustawienie ${rotation}, ${phase.toLowerCase()}`,
    randomTask: 'Losowe zadanie',
    check: 'Sprawdź',
    showAnswer: 'Pokaż odpowiedź',
    tryAgain: 'Od nowa',
    resultHeading: 'Wynik',
    result: (correct: number, total: number, legal: boolean) =>
      `${correct} z ${total} poprawnie, ustawienie ${legal ? 'prawidłowe' : 'nieprawidłowe'}`,
    correct: 'na miejscu',
    off: (meters: number) => `${dec(meters)} m obok`,
    tolerance: (meters: number) =>
      `Zawodnik jest na miejscu, jeśli stoi najwyżej ${plain(meters)} m od swojej pozycji.`,
  },
  tactics: {
    title: 'Taktyka',
    intro: 'Sytuacje meczowe krok po kroku: gdzie stoi każdy zawodnik, co robi i dlaczego.',
    topicsNav: 'Tematy',
    situationsNav: 'Sytuacje',
    moment: (moment: number, count: number) => `Moment ${moment} z ${count}`,
    progress: 'Postęp',
    play: 'Odtwórz',
    pause: 'Pauza',
    restart: 'Od początku',
    previous: 'Poprzedni moment',
    next: 'Następny moment',
    speed: 'Prędkość',
    speedOption: (speed: number) => `${plain(speed)}×`,
    positioning: 'Ustawienie',
    execution: 'Wykonanie',
    principles: 'Najważniejsze zasady',
    whoIsAttacking: 'Kto atakuje?',
  },
  roles: {
    S: 'Rozgrywający',
    OH: 'Przyjmujący',
    OPP: 'Atakujący',
    MB: 'Środkowy',
    L: 'Libero',
  },
  notFound: 'Nie znaleziono strony.',
  language: 'Język',
  languages: { en: 'English', pl: 'Polski' },
};

export const STRINGS: Readonly<Record<Locale, Strings>> = { en, pl };

/**
 * All UI text, in the active language. Reads resolve at render time; the layout re-mounts
 * the page when the language changes, so every component picks up the new text.
 */
export const strings: Strings = new Proxy({} as Strings, {
  get: (_, key) => STRINGS[useLocaleStore.getState().locale][key as keyof Strings],
});
