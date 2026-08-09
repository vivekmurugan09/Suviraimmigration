const fs = require('fs');
const path = require('path');

const indexHtmlPath = path.join(__dirname, 'index.html');
let indexHtml = fs.readFileSync(indexHtmlPath, 'utf8');

indexHtml = indexHtml.replace(
    /<!-- Absolute exact logo overlay on the blank wall -->\s*<img src="images\/suvira-logo-transparent\.png" class="overlay-logo" alt="Suvira Immigration">/g,
    ''
);

fs.writeFileSync(indexHtmlPath, indexHtml);
console.log('Removed overlay logo');
