const fs=require('fs'); 
const path=require('path'); 
const dir = 'countries';
const files=fs.readdirSync(dir).filter(f=>f.endsWith('.html')); 
files.forEach(f => { 
    let p = path.join(dir, f); 
    let content = fs.readFileSync(p, 'utf8'); 
    content = content.replace(/<div class="theme-switcher-wrapper">[\s\S]*?<\/div>\s*/g, ''); 
    fs.writeFileSync(p, content); 
});
console.log('Removed theme switcher from countries');
