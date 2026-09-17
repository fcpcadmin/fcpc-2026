const sharp = require('./node_modules/sharp');
const files = [
  'supplementalhealth_hero_fcpcsite',
  'supplementalhealth_cancerinsurance_fcpcsite',
  'supplementalhealth_criticalillness_fcpcsite',
  'supplementalhealth_disability_fcpcsite',
  'supplementalhealth_life&supp_fcpcsite',
  'supplementalhealth_cta_fcpcsite',
];
(async () => {
  for (const f of files) {
    await sharp(`${f}.png`).webp({ quality: 82 }).toFile(`${f}.webp`);
    console.log(`✓ ${f}.webp`);
  }
})();
