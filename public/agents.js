/* ============================================================
   FCPC Agent Registry — Single Source of Truth
   Serves both Find My Agent and /agent/{slug} mini-sites.
   Access: FCPC_AGENTS["slug"]
   ============================================================ */

const FCPC_AGENTS = {

  'charlie-scott': {
    // Identity
    agentCode:   'FCPC000',
    firstName:   'Charlie',
    lastName:    'Scott',
    eyebrow:     'Founder & Senior Agent',
    location:    'Washington, DC',
    photo:       'images/agents/charles-scott.webp',

    // Contact
    phone:       '(800) 555-FCPC',
    email:       'charles@fcpc.life',
    bookingLink: '',

    // Offerings
    states:      ['MD', 'VA', 'DC', 'FL', 'GA', 'TX', 'NC', 'SC'],
    products:    ['Life Insurance', 'Indexed Annuities', 'Final Expense', 'Supplemental Health'],

    // Visibility
    hidden:      true,
    noindex:     true,

    // Bio
    roots:        '',
    beforeFcpc:   '',
    whyThisWork:  '',
    whoYouServe:  [],
    serveLine:    '',
    commitments:  [],
    outsideWork:  '',
    whyJoin:      '',
  },

  'reggie-sarpong': {
    // Identity
    agentCode:   'FCPC1001',
    firstName:   'Reggie',
    lastName:    'Sarpong',
    eyebrow:     'Licensed Agent',
    location:    'VA · DC · MD',
    photo:       'images/agents/reggie-sarpong.webp',

    // Contact
    phone:       '(703) 725-0897',
    email:       'rsarpong@fcpc.life',
    bookingLink: '',

    // Offerings
    states:      ['VA', 'DC', 'MD'],
    products:    ['Life Insurance', 'Indexed Annuities', 'Final Expense', 'Supplemental Health'],

    // Visibility
    hidden:      false,
    noindex:     false,

    // Bio
    roots:        'New York.',
    beforeFcpc:   'Hooping.',
    whyThisWork:  'Helping People.',
    whoYouServe:  ['Federal employees', 'DC government employees', 'Pre-retirees and retirees'],
    serveLine:    '',
    commitments:  [
      'I\'ll explain your options in plain language.',
      'I\'ll be here long after the paperwork is signed.',
    ],
    outsideWork:  'Balling out of control.',
    whyJoin:      'You like helping people.',
  },

  'jane-sample': {
    // Identity
    agentCode:   'TEST001',
    firstName:   'Jane',
    lastName:    'Sample',
    eyebrow:     'FCPC Licensed Agent',
    location:    'MD · VA · DC',
    photo:       '',

    // Contact
    phone:       '(555) 000-0001',
    email:       'jane.sample@fcpc.life',
    bookingLink: '',

    // Offerings
    states:      ['MD', 'VA', 'DC'],
    products:    ['Life Insurance', 'Final Expense', 'Supplemental Health'],

    // Visibility
    hidden:      true,
    noindex:     true,

    // Bio
    roots:        'I grew up in Prince George\'s County, the oldest of four kids in a house where every dollar had a job.',
    beforeFcpc:   'I spent eleven years as a federal contracting specialist, so I know the benefits system from the inside.',
    whyThisWork:  'When my uncle passed, his FEGLI coverage barely covered the funeral. I watched my aunt lose the house. I decided no family I could reach would go through that unprepared.',
    whoYouServe:  ['Federal employees', 'Families with young children', 'Pre-retirees and retirees'],
    serveLine:    '',
    commitments:  [
      'I\'ll explain your options in plain language.',
      'I\'ll show you what you already have before recommending anything new.',
    ],
    outsideWork:  'Most Saturdays you\'ll find me coaching my daughter\'s soccer team.',
    whyJoin:      'This work gave me a way to help my community and build something of my own. I\'m looking for people who want the same.',
  },

};
