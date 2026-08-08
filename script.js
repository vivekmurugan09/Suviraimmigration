const fs = require('fs');
const path = require('path');
const dir = 'countries';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

files.forEach(f => {
    let content = fs.readFileSync(path.join(dir, f), 'utf8');
    
    // Fix 1: CSS path
    // Match <link rel="stylesheet" href="style.css"> and replace with ../style-v2.css
    content = content.replace(/href=""?style\.css""?/g, 'href="../style-v2.css"');
    
    // Fix 2: Replace nav-cta button
    // This regex looks for an <a> or <button> with Book Consultation or Eligibility Check in the desktop nav
    // We will target the specific <a href="../contact/" class="nav-cta">...</a> or similar
    const buttonHtml = '<button onclick=\"document.getElementById(\'leadModal\').style.display=\'flex\'\" style=\"background:#c9a227;color:#0a1628;padding:9px 18px;border-radius:8px;font-size:13px;font-weight:700;border:none;cursor:pointer;display:inline-flex;align-items:center;gap:6px\">Free Eligibility Check</button>';
    content = content.replace(/<a[^>]*class="nav-cta"[^>]*>[\s\S]*?<\/a>/g, buttonHtml);
    
    // Fix 4: Add Contact link after Process if missing
    if (!content.includes('Contact</a>') && !content.includes('Contact</a') || !content.match(/<a[^>]*>.*?Contact.*?<\/a>/i)) {
        // Find process link
        content = content.replace(/(<a[^>]*>.*?Process.*?<\/a>)/i, '\n                <a href="../contact/" class="nav-link"><i class="fas fa-envelope"></i> Contact</a>');
    }
    
    // ensure contact is in the nav-links div
    const navLinksRegex = /(<div class="nav-links">[\s\S]*?)(<div class="theme-switcher-wrapper">|<a[^>]*class="nav-cta"[^>]*>|<button[^>]*>Free Eligibility)/;
    if (content.match(navLinksRegex)) {
        let navLinksMatch = content.match(navLinksRegex)[1];
        if (!navLinksMatch.includes('Contact')) {
            content = content.replace(/(<a[^>]*>.*?Process.*?<\/a>)/, '\n                <a href="../contact/" class="nav-link"><i class="fas fa-envelope"></i> Contact</a>');
        }
    }

    fs.writeFileSync(path.join(dir, f), content);
});
console.log('Processed files');
