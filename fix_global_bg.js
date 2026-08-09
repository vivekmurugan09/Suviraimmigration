const fs = require('fs');
let css = fs.readFileSync('style.css', 'utf8');

const oldBg = "background: linear-gradient(rgba(3, 17, 105, 0.95), rgba(3, 17, 105, 0.9)), url('https://images.unsplash.com/photo-1511895426328-dc8714191300?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80');\r\n    background-size: cover;\r\n    background-position: center;";

const oldBgLF = "background: linear-gradient(rgba(3, 17, 105, 0.95), rgba(3, 17, 105, 0.9)), url('https://images.unsplash.com/photo-1511895426328-dc8714191300?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80');\n    background-size: cover;\n    background-position: center;";

// Only replace the first three occurrences (html, body, .main-content), leave .footer alone.
for (let i = 0; i < 3; i++) {
    css = css.replace(oldBg, 'background: #f8fafc;');
    css = css.replace(oldBgLF, 'background: #f8fafc;');
}

// Add rule for country pages
if (!css.includes('.country-hero-pro + section')) {
    css += `\n\n/* Fix country pages background inheritance */\n.country-hero-pro + section {\n    background: #f8fafc;\n}\n`;
}

fs.writeFileSync('style.css', css);
console.log('Fixed global backgrounds in style.css');
