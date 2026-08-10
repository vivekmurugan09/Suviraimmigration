const fs = require('fs');

function runTest() {
    console.log('Running test: Check country page CSS existence');
    const css = fs.readFileSync('style-v3.css', 'utf8');

    const requiredClasses = [
        '.country-hero-title-flex',
        '.country-hero-facts',
        '.fact-box',
        '.programs-grid',
        '.program-card-pro'
    ];

    let passed = true;
    for (const cls of requiredClasses) {
        if (!css.includes(cls)) {
            console.error(`FAIL: Missing class ${cls} in style-v3.css`);
            passed = false;
        } else {
            console.log(`PASS: Found class ${cls}`);
        }
    }

    if (passed) {
        console.log('ALL TESTS PASSED: Country page CSS is successfully integrated.');
        process.exit(0);
    } else {
        console.error('TESTS FAILED.');
        process.exit(1);
    }
}

runTest();
