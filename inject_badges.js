const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const badgesHtml = `
<!-- Trust Badges Section -->
<div class="trust-badges" style="background-color: #FFFFFF; padding: 40px 24px; border-top: 1px solid #E2E8F0; border-bottom: 1px solid #E2E8F0;">
    <div style="max-width: 1280px; margin: 0 auto; display: flex; flex-wrap: wrap; justify-content: center; gap: 40px; text-align: center;">
        <div style="display: flex; flex-direction: column; align-items: center; gap: 10px; transition: transform 0.3s;" onmouseover="this.style.transform='translateY(-5px)'" onmouseout="this.style.transform='translateY(0)'">
            <i class="fas fa-certificate" style="font-size: 2.5rem; color: #0724A8;"></i>
            <span style="font-weight: 700; color: #0F172A; font-size: 1.1rem;">Certified Experts</span>
        </div>
        <div style="display: flex; flex-direction: column; align-items: center; gap: 10px; transition: transform 0.3s;" onmouseover="this.style.transform='translateY(-5px)'" onmouseout="this.style.transform='translateY(0)'">
            <i class="fas fa-history" style="font-size: 2.5rem; color: #F87034;"></i>
            <span style="font-weight: 700; color: #0F172A; font-size: 1.1rem;">18+ Years Legacy</span>
        </div>
        <div style="display: flex; flex-direction: column; align-items: center; gap: 10px; transition: transform 0.3s;" onmouseover="this.style.transform='translateY(-5px)'" onmouseout="this.style.transform='translateY(0)'">
            <i class="fas fa-star" style="font-size: 2.5rem; color: #F59E0B;"></i>
            <span style="font-weight: 700; color: #0F172A; font-size: 1.1rem;">5-Star Rated</span>
        </div>
        <div style="display: flex; flex-direction: column; align-items: center; gap: 10px; transition: transform 0.3s;" onmouseover="this.style.transform='translateY(-5px)'" onmouseout="this.style.transform='translateY(0)'">
            <i class="fas fa-shield-alt" style="font-size: 2.5rem; color: #10B981;"></i>
            <span style="font-weight: 700; color: #0F172A; font-size: 1.1rem;">100% Transparent</span>
        </div>
    </div>
</div>
`;

const walkSync = (dir, filelist = []) => {
    fs.readdirSync(dir).forEach(file => {
        if (file === '.git' || file === 'node_modules' || file === 'images') return;
        const filepath = path.join(dir, file);
        if (fs.statSync(filepath).isDirectory()) {
            filelist = walkSync(filepath, filelist);
        } else if (file.endsWith('.html')) {
            filelist.push(filepath);
        }
    });
    return filelist;
};

const htmlFiles = walkSync(__dirname);

htmlFiles.forEach(file => {
    const html = fs.readFileSync(file, 'utf8');
    if (!html.includes('Trust Badges Section')) {
        const $ = cheerio.load(html, { recognizeSelfClosing: true, decodeEntities: false });
        if ($('footer.footer').length) {
            $('footer.footer').before(badgesHtml);
            fs.writeFileSync(file, $.html());
            console.log('Injected trust badges into: ' + file);
        } else if ($('footer').length) {
            $('footer').before(badgesHtml);
            fs.writeFileSync(file, $.html());
            console.log('Injected trust badges into: ' + file);
        }
    }
});
console.log('Done injecting trust badges.');
