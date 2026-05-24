const fs = require('fs');

const data = JSON.parse(fs.readFileSync('public/data/subjects.json', 'utf8'));
const subjects = data.subjects || [];

console.log(`Total subjects in subjects.json: ${subjects.length}`);
console.log("\nSome subjects (first 30):");
subjects.slice(0, 30).forEach(s => {
  console.log(`- "${s.name}" (major: ${s.major}, year: ${s.year}, link: ${s.link})`);
});
