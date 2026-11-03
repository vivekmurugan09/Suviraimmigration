const fs = require('fs');
const path = require('path');
const dir = 'countries';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

const desktopNewBtn = `<button onclick="document.getElementById('leadModal').style.display='flex'" style="background:#c9a227;color:#0a1628;padding:9px 18px;border-radius:8px;font-size:13px;font-weight:700;border:none;cursor:pointer;display:inline-flex;align-items:center;gap:6px">Free Eligibility Check</button>`;
const mobileNewBtn = `<button onclick="document.getElementById('leadModal').style.display='flex'" style="background:#c9a227;color:#0a1628;padding:9px 18px;border-radius:8px;font-size:13px;font-weight:700;border:none;cursor:pointer;display:inline-flex;align-items:center;gap:6px;margin-top:10px">Free Eligibility Check</button>`;

files.forEach(f => {
    let content = fs.readFileSync(path.join(dir, f), 'utf8');
    
    // Fix 1
    content = content.replace(/href="style\.css"/g, 'href="../style-v2.css"');
    content = content.replace(/href="\.\.\/style\.css"/g, 'href="../style-v2.css"');
    
    // Fix 2: Replace nav-cta completely
    content = content.replace(/<a href="\.\.\/contact\/" class="nav-cta">[\s\S]*?<\/a>/g, desktopNewBtn);
    content = content.replace(/<button onclick="document\.getElementById\('leadModal'\)\.style\.display='flex'" style="background:#c9a227;color:#0a1628;padding:9px 18px;border-radius:8px;font-size:13px;font-weight:700;border:none;cursor:pointer">Eligibility Check<\/button>/g, desktopNewBtn);
    
    // Fix 4: Add contact link if missing in desktop nav.
    // The link should be added right after Process</a>
    if (content.match(/<a href="\.\.\/index\.html#process" class="nav-link"><i class="fas fa-list-ol"><\/i> Process<\/a>\s*<div class="theme-switcher-wrapper">/)) {
        content = content.replace(
            /(<a href="\.\.\/index\.html#process" class="nav-link"><i class="fas fa-list-ol"><\/i> Process<\/a>)/, 
            '$1\n                <a href="../contact/" class="nav-link"><i class="fas fa-envelope"></i> Contact</a>'
        );
    }
    
    fs.writeFileSync(path.join(dir, f), content);
});
console.log('Replacements completed.');
