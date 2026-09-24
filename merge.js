const fs = require('fs');
const s3_10 = JSON.parse(fs.readFileSync('scratch/surahs_3_to_10.json', 'utf8'));
const s11_20 = JSON.parse(fs.readFileSync('scratch/surahs_11_to_20.json', 'utf8'));

let original = fs.readFileSync('mobile/src/data/surahLessons.ts', 'utf8');

let newContent = '';
for (let i = 3; i <= 10; i++) {
  newContent += `  ${i}: ${JSON.stringify(s3_10[i], null, 4).replace(/\n/g, '\n  ')},\n`;
}
for (let i = 11; i <= 20; i++) {
  newContent += `  ${i}: ${JSON.stringify(s11_20[i], null, 4).replace(/\n/g, '\n  ')},\n`;
}

original = original.replace(/};\s*export default surahLessons;/, newContent + '};\nexport default surahLessons;\n');

fs.writeFileSync('mobile/src/data/surahLessons.ts', original, 'utf8');
console.log('Merged successfully!');
