import type { SimCaptions } from '../../simulation/captions';
import type { AttackOption } from '../../simulation/positions';

/** Polish captions for rally scenes (same shape as EN_SIM_CAPTIONS). */

const OPTION: Record<AttackOption, string> = {
  outside: 'atak ze skrzydła ze strefy 4',
  middle: 'krótka piłka środkiem',
  right: 'atak z prawej strony ze strefy 2',
  pipe: 'atak z drugiej linii (pipe)',
};

export const PL_SIM_CAPTIONS: SimCaptions = {
  who: (label, ours) => (ours ? label : `${label} przeciwnika`),
  serve: (server) => `${server} zagrywa zza linii końcowej.`,
  pass: (ours) =>
    ours
      ? 'Przyjmujemy piłkę do rozgrywającego.'
      : 'Przeciwnik przyjmuje piłkę do swojego rozgrywającego.',
  switched: (ours) =>
    ours ? 'Przechodzimy na pozycje obronne.' : 'Przeciwnik przechodzi na pozycje obronne.',
  set: (setter, attacker, option) => `${setter} wystawia do ${attacker}: ${OPTION[option]}.`,
  attack: (attacker, ours, blockers) =>
    `${attacker} atakuje. ${ours ? 'Stawiamy' : 'Przeciwnik stawia'} ${
      blockers === 2 ? 'blok podwójny' : 'blok pojedynczy środkiem'
    } i broni się za blokiem; drużyna atakująca asekuruje 2-3 (dwóch blisko, trzech głęboko).`,
  dig: (ours) =>
    ours
      ? 'Bronimy. Blokujący schodzą od siatki do rozbiegu, rozgrywający biegnie do miejsca wystawy.'
      : 'Przeciwnik broni i przygotowuje kontratak.',
  freeBall: (sendingOurs) =>
    sendingOurs
      ? 'Możemy tylko przebić łatwą piłkę; przeciwnik ustawia się do przyjęcia.'
      : 'Przeciwnik może tylko przebić łatwą piłkę: nasza pierwsza linia cofa się do linii ataku, rozgrywający wychodzi do wystawy, a druga linia przyjmuje.',
  downBall: (sendingOurs) =>
    sendingOurs
      ? 'Atakujemy z miejsca (down ball); przeciwnik zostaje przy siatce bez skoku.'
      : 'Przeciwnik atakuje z miejsca (down ball): nasi blokujący zostają przy siatce bez skoku, a druga linia cofa się głębiej.',
  point: (ours, us, them) => `Punkt dla ${ours ? 'nas' : 'przeciwnika'}: ${us}:${them}.`,
  sideOut: (ours, rotation) =>
    ours
      ? `Punkt na przyjęciu: przechodzimy do ustawienia ${rotation}.`
      : 'Przeciwnik zdobywa punkt na przyjęciu i robi przejście.',
  server: (who, again) => (again ? `${who} zagrywa ponownie.` : `Teraz zagrywa ${who}.`),
  liberoIn: (middle) => `Libero wchodzi za ${middle}.`,
  liberoOut: (middle) => `${middle} wraca na boisko za libero.`,
};
