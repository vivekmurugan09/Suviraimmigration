const fs = require('fs');
const path = require('path');

// 1. Rename style.css to style-v2.css
if (fs.existsSync('style.css')) {
    fs.renameSync('style.css', 'style-v2.css');
}

// 2. Find all HTML files
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

// 3. Replace style.css with style-v2.css
htmlFiles.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    // Regex to match href="style.css?v=..." or href="../style.css?v=..."
    // We will just replace style.css?v=17861... with style-v2.css
    // To be safe, just replace style.css?v=... or style.css with style-v2.css
    
    let original = content;
    // Replace style.css with cache buster
    content = content.replace(/style\.css(\?v=\d+)?/g, 'style-v2.css');
    
    if (original !== content) {
        fs.writeFileSync(file, content);
        updated++;
    }
});

console.log(`Renamed style.css to style-v2.css and updated ${updated} HTML files.`);
