/** All UI text lives here so it can be translated (Polish planned). */
export const strings = {
  appName: 'Volleyguide',
  nav: {
    home: 'Home',
    court: 'Court',
  },
  home: {
    title: 'Learn professional volleyball positioning',
    intro:
      'Volleyguide shows where each player stands in every rotation and phase of play, on an interactive court drawn to scale.',
    openCourt: 'Open the court',
  },
  court: {
    title: 'Court',
    hint: 'Drag the players. Positions are shown in meters from the left sideline (x) and our end line (y).',
    reset: 'Reset positions',
    playersHeading: 'Players',
    canvasLabel: 'Volleyball court, 9 by 18 meters, with draggable players',
    lineupLegal: 'Lineup is legal at the moment of serve.',
    lineupIllegal: 'Overlap fault at the moment of serve:',
    frontBack: (front: number, back: number) =>
      `Zone ${front} must be closer to the net than zone ${back}.`,
    leftRight: (left: number, right: number) => `Zone ${left} must be left of zone ${right}.`,
    zone: (zone: number) => `zone ${zone}`,
  },
  roles: {
    S: 'Setter',
    OH: 'Outside hitter',
    OPP: 'Opposite',
    MB: 'Middle blocker',
    L: 'Libero',
  },
  notFound: 'Page not found.',
} as const;
