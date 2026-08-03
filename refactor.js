const fs = require('fs');
const path = require('path');

const directories = ['.', 'about', 'calculator', 'contact', 'countries', 'process', 'services'];
const baseDir = __dirname;
let allScripts = '';

function processHtmlFile(filepath) {
    try {
        let content = fs.readFileSync(filepath, 'utf8');
        
        // Add preconnect for fonts in head if not exists
        if (!content.includes('preconnect" href="https://fonts.googleapis.com')) {
            content = content.replace('</title>', '</title>\n    <link rel="preconnect" href="https://fonts.googleapis.com">\n    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>');
        }
        
        // Add loading lazy to images (very basic heuristic: if it doesn't already have it, and is not a hero image)
        // We'll skip images that have 'hero' in src or class just to be safe for LCP.
        content = content.replace(/<img([^>]+)>/g, (match, p1) => {
            if (match.includes('loading="lazy"') || match.includes('hero')) return match;
            return `<img${p1} loading="lazy">`;
        });
        
        // Extract scripts from body
        let scriptRegex = /<script>([\s\S]*?)<\/script>/gi;
        let match;
        while ((match = scriptRegex.exec(content)) !== null) {
            allScripts += match[1] + '\n\n';
        }
        
        // Remove those inline scripts
        content = content.replace(scriptRegex, '');
        
        // Add external script link before closing body if not present
        if (!content.includes('<script src="')) {
            // Figure out relative path to root script.js
            let depth = filepath.split(path.sep).length - baseDir.split(path.sep).length - 1;
            let scriptPath = depth > 0 ? '../'.repeat(depth) + 'script.js' : 'script.js';
            content = content.replace('</body>', `    <script src="${scriptPath}" defer></script>\n</body>`);
        }

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

// Append extracted scripts + accessibility listeners to script.js
if (allScripts) {
    let scriptContent = '';
    if (fs.existsSync(path.join(baseDir, 'script.js'))) {
        scriptContent = fs.readFileSync(path.join(baseDir, 'script.js'), 'utf8') + '\n';
    }
    
    // Add mobile menu accessibility wrapper
    const a11yCode = `
// Accessibility UI/UX enhancements
document.addEventListener('DOMContentLoaded', () => {
    const menuBtn = document.querySelector('.mobile-menu-btn');
    const closeBtn = document.querySelector('.close-menu') || document.querySelector('.mobile-menu-close');
    const mobileMenu = document.querySelector('.mobile-menu');
    const overlay = document.querySelector('.mobile-menu-overlay');

    if (menuBtn && mobileMenu) {
        menuBtn.setAttribute('aria-expanded', 'false');
        menuBtn.setAttribute('aria-controls', 'mobile-menu');
        menuBtn.setAttribute('role', 'button');
        menuBtn.tabIndex = 0;
        
        const toggleMenu = () => {
            const isExpanded = menuBtn.getAttribute('aria-expanded') === 'true';
            menuBtn.setAttribute('aria-expanded', !isExpanded);
            mobileMenu.classList.toggle('active');
            if(overlay) overlay.classList.toggle('active');
        };

        menuBtn.addEventListener('click', toggleMenu);
        menuBtn.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') toggleMenu();
        });
        
        if (closeBtn) {
            closeBtn.addEventListener('click', toggleMenu);
            closeBtn.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') toggleMenu();
            });
        }
        if (overlay) overlay.addEventListener('click', toggleMenu);
    }
});
`;
    fs.writeFileSync(path.join(baseDir, 'script.js'), scriptContent + allScripts + a11yCode, 'utf8');
}
