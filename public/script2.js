const fs = require('fs');
const path = require('path');
const dir = 'countries';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

files.forEach(f => {
    let content = fs.readFileSync(path.join(dir, f), 'utf8');
    
    // Process desktop nav
    // We want to target the <div class="nav-links">...</div> block exactly
    const navLinksRegex = /(<div class=""nav-links"">)([\s\S]*?)(<\/div>)/;
    let match = content.match(navLinksRegex);
    if (match) {
        let navLinksContent = match[2];
        
        // Remove old CTA (nav-cta or Eligibility Check button)
        navLinksContent = navLinksContent.replace(/<a[^>]*class=""nav-cta""[^>]*>[\s\S]*?<\/a>/g, '');
        navLinksContent = navLinksContent.replace(/<button[^>]*onclick=""document\.getElementById\('leadModal'\)\.style\.display='flex'""[^>]*>[\s\S]*?<\/button>/g, '');
        
        // Ensure Contact is present
        if (!navLinksContent.includes('> Contact</a>') && !navLinksContent.includes('>Contact</a>')) {
            // Insert it before the theme switcher, or at the end
            if (navLinksContent.includes('<div class=""theme-switcher-wrapper"">')) {
                navLinksContent = navLinksContent.replace('<div class=""theme-switcher-wrapper"">', '<a href=""../contact/"" class=""nav-link""><i class=""fas fa-envelope""></i> Contact</a>\n                <div class=""theme-switcher-wrapper"">');
            } else {
                navLinksContent += '\n                <a href=""../contact/"" class=""nav-link""><i class=""fas fa-envelope""></i> Contact</a>\n';
            }
        }
        
        // Add new CTA button at the end of navLinksContent
        const newCta = \n                <button onclick=\"document.getElementById('leadModal').style.display='flex'\" style=\"background:#c9a227;color:#0a1628;padding:9px 18px;border-radius:8px;font-size:13px;font-weight:700;border:none;cursor:pointer;display:inline-flex;align-items:center;gap:6px\">Free Eligibility Check</button>\n            ;
        navLinksContent += newCta;
        
        content = content.replace(navLinksRegex, $1);
    }

    // Process mobile nav
    const mobileNavRegex = /(<div class=""mobile-nav"">)([\s\S]*?)(<\/div>)/;
    let mobileMatch = content.match(mobileNavRegex);
    if (mobileMatch) {
        let mobileNavContent = mobileMatch[2];
        
        // Remove old CTA
        mobileNavContent = mobileNavContent.replace(/<a[^>]*class=""nav-cta""[^>]*>[\s\S]*?<\/a>/g, '');
        mobileNavContent = mobileNavContent.replace(/<button[^>]*onclick=""document\.getElementById\('leadModal'\)\.style\.display='flex'""[^>]*>[\s\S]*?<\/button>/g, '');
        
        // Ensure Contact is present
        if (!mobileNavContent.includes('> Contact</a>') && !mobileNavContent.includes('>Contact</a>')) {
            mobileNavContent += '\n            <a href=""../contact/"" class=""nav-link""><i class=""fas fa-envelope""></i> Contact</a>\n';
        }
        
        const newCta = \n            <button onclick=\"document.getElementById('leadModal').style.display='flex'\" style=\"background:#c9a227;color:#0a1628;padding:9px 18px;border-radius:8px;font-size:13px;font-weight:700;border:none;cursor:pointer;display:inline-flex;align-items:center;gap:6px;margin-top:10px\">Free Eligibility Check</button>\n        ;
        mobileNavContent += newCta;
        
        content = content.replace(mobileNavRegex, $1);
    }
    
    fs.writeFileSync(path.join(dir, f), content);
});
console.log('Fixed navbars');
