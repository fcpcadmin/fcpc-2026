/* ============================================================
   FCPC Agent Directory — Single Source of Truth
   Usage: include via <script src="agents-data.js"></script>
   Access: GLOBAL_AGENTS["agent_id"]
   ============================================================ */

const GLOBAL_AGENTS = {

  charles_scott: {
    name:        'Charles Scott',
    eyebrow:     'Founder & Senior Advisor',
    initials:    'CS',
    image:       'images/agents/charles-scott.webp',
    bio:         'Charles started FCPC in 1985 with a single conviction — that every family deserves someone in their corner. Over four decades he has personally mentored hundreds of advisors and helped thousands of families build financial peace of mind, one honest conversation at a time.',
    bioLong:     'Charles Scott founded the Financial Crisis Prevention Center in 1985 after seeing first-hand how underserved families were left without guidance during life\'s most critical financial moments. Drawing on the mentorship tradition he inherited from Joe Dudley Sr., who himself was mentored by the legendary S.B. Fuller, Charles built FCPC on a foundation of servant leadership and education-first service. Today, FCPC\'s network of licensed advisors carries that same commitment into every kitchen-table conversation — no pressure, no jargon, just honest answers and real coverage built for real lives.',
    specialties: ['Life Insurance', 'Indexed Annuities', 'Final Expense', 'Supplemental Health', 'Agency Development'],
    states:      ['MD', 'VA', 'DC', 'FL', 'GA', 'TX', 'NC', 'SC'],
    phone:       '(800) 555-FCPC',
    email:       'charles@fcpcusa.com',
    calendar:    'get-quote.html',
    location:    'Washington, DC',
    facts: [
      { label: 'Founded FCPC',    value: '1985' },
      { label: 'Advisors Mentored', value: '500+' },
      { label: 'Years in Field',  value: '40+' },
      { label: 'Home Office',     value: 'Washington, DC Metro' },
    ],
  },

  reginald_sarpong: {
    name:        'Reginald Sarpong',
    eyebrow:     'FCPC Licensed Advisor',
    initials:    'RS',
    image:       'images/agents/reginald-sarpong.webp',
    bio:         'Reginald brings a client-first approach to every consultation, guiding families through life insurance and financial protection decisions with clarity and care. He is passionate about ensuring every household he serves walks away with a plan they understand and coverage they can count on.',
    bioLong:     'Reginald Sarpong joined the FCPC family with a deep commitment to community and a background in financial education. He specializes in designing life insurance solutions for families at all stages — from young parents securing income replacement to retirees looking for final expense and supplemental health coverage. Reginald believes that financial protection should be accessible, affordable, and clearly explained — and he works tirelessly to make that a reality for every client he meets.',
    specialties: ['Life Insurance', 'Final Expense', 'Supplemental Health', 'Income Replacement'],
    states:      ['MD', 'VA', 'DC', 'GA'],
    phone:       '(240) 555-0192',
    email:       'reginald@fcpcusa.com',
    calendar:    'get-quote.html',
    location:    'MD · VA · DC',
    facts: [
      { label: 'Specialization', value: 'Life Insurance & Final Expense' },
      { label: 'Service Area',   value: 'MD · VA · DC · GA' },
      { label: 'Languages',      value: 'English' },
      { label: 'Response Time',  value: 'Same Business Day' },
    ],
  },

  jane_doe: {
    name:        'Jane Doe',
    eyebrow:     'Senior Legacy Planner',
    initials:    'JD',
    image:       'images/agents/jane_doe.webp',
    bio:         'Helping families across the region build bulletproof financial foundations and secure their peace of mind for the next generation.',
    bioLong:     '',
    specialties: ['Final Expense', 'Life Insurance', 'Supplemental Health'],
    states:      ['VA', 'MD', 'DC'],
    phone:       '(555) 123-4567',
    email:       'jdoe@fcpc.life',
    calendar:    'https://bookings.zoho.com/fcpc/jane-doe',
    location:    'VA · MD · DC',
    facts: [
      { label: 'Specialization', value: 'Final Expense & Legacy Planning' },
      { label: 'Service Area',   value: 'VA · MD · DC' },
      { label: 'Response Time',  value: 'Same Business Day' },
    ],
  },

};
