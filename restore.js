const fs = require('fs');
const https = require('https');
const path = require('path');

const baseUrl = 'https://dev.suviraimmigration.com/';
const files = [
    'index.html',
    'about/index.html',
    'calculator/index.html',
    'contact/index.html',
    'countries/index.html',
    'process/index.html',
    'services/index.html'
];
const baseDir = __dirname;

function downloadFile(url, dest) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(dest);
        https.get(url, (response) => {
            response.pipe(file);
            file.on('finish', () => {
                file.close(resolve);
            });
        }).on('error', (err) => {
            fs.unlink(dest, () => {});
            reject(err);
        });
    });
}

async function restoreFiles() {
    for (const file of files) {
        const destPath = path.join(baseDir, file);
        // Ensure dir exists
        const dir = path.dirname(destPath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        console.log(`Downloading ${file}...`);
        await downloadFile(baseUrl + file, destPath);
        console.log(`Restored ${file}`);
    }
}

restoreFiles();
