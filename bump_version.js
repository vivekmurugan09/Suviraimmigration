const fs = require('fs');
const path = require('path');

function walkDir(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walkDir(file));
        } else {
            if (file.endsWith('.html')) {
                results.push(file);
            }
        }
    });
    return results;
}

const htmlFiles = walkDir(__dirname);
let updated = 0;

htmlFiles.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    if (content.includes('style.css?v=')) {
        content = content.replace(/style\.css\?v=\d+\.\d+/g, 'style.css?v=' + Date.now());
        fs.writeFileSync(file, content);
        updated++;
    }
});

console.log(`Updated cache buster in ${updated} HTML files.`);
