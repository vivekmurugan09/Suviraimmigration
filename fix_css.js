const fs = require('fs');

const filePath = 'd:\\Suviraimmigration\\Suviraimmigration-dev\\style.css';
let contentBuf = fs.readFileSync(filePath);

// We need to fix the UTF-16LE appended to a UTF-8 file.
// Let's find the index of "P R E M I U M".
let contentStr = fs.readFileSync(filePath, 'utf8');

// The easiest way to fix it is to replace null bytes (0x00) with empty strings.
let newBuf = Buffer.alloc(contentBuf.length);
let newLen = 0;

for (let i = 0; i < contentBuf.length; i++) {
    if (contentBuf[i] !== 0x00) {
        newBuf[newLen++] = contentBuf[i];
    }
}

// Slice to actual length
let fixedBuf = newBuf.slice(0, newLen);

fs.writeFileSync(filePath, fixedBuf);
console.log('Fixed CSS null bytes');
