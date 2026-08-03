const fs = require('fs');
const path = require('path');

const directories = ['.', 'about', 'calculator', 'contact', 'countries', 'process', 'services'];
const baseDir = __dirname;

function processHtmlFile(filepath) {
    try {
        let content = fs.readFileSync(filepath, 'utf8');
        
        // Remove style attributes
        content = content.replace(/\sstyle="[^"]*"/g, '');
        
        // Remove style tags
        content = content.replace(/<style[\s\S]*?<\/style>/gi, '');

        fs.writeFileSync(filepath, content, 'utf8');
        console.log(`Processed: ${filepath}`);
    } catch (e) {
        console.error(`Error processing ${filepath}: ${e}`);
    }
}

directories.forEach(d => {
    const dirPath = path.join(baseDir, d);
    if (fs.existsSync(dirPath) && fs.lstatSync(dirPath).isDirectory()) {
        fs.readdirSync(dirPath).forEach(file => {
            if (file.endsWith('.html')) {
                processHtmlFile(path.join(dirPath, file));
            }
        });
    }
});
