const fs = require('fs');
const css = `
/* Country Pages CSS Added */
.country-hero-title-flex { display: flex; align-items: center; gap: 20px; margin-bottom: 20px; }
.country-hero-title-flex img { width: 80px; height: auto; border-radius: 8px; box-shadow: 0 4px 10px rgba(0,0,0,0.1); border: 1px solid var(--light-gray); }
.country-hero-title-flex h1 { margin: 0; font-size: 2.5rem; color: var(--primary); }
.country-hero-facts { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 20px; margin-top: 40px; }
.fact-box { background: white; padding: 25px 20px; border-radius: 12px; border: 1px solid var(--light-gray); box-shadow: 0 4px 15px rgba(0,0,0,0.03); text-align: center; }
.fact-box h4 { font-size: 0.85rem; color: var(--gray); margin-bottom: 8px; text-transform: uppercase; letter-spacing: 1px; }
.fact-box p { font-size: 1.15rem; font-weight: 800; color: var(--primary); margin: 0; }
.programs-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 30px; margin-top: 30px; }
.program-card-pro { background: white; border-radius: 16px; border: 1px solid var(--light-gray); padding: 35px 30px; display: flex; flex-direction: column; gap: 25px; box-shadow: 0 10px 30px rgba(0,0,0,0.04); transition: var(--transition); height: 100%; justify-content: space-between; }
.program-card-pro:hover { transform: translateY(-5px); box-shadow: 0 15px 40px rgba(0,0,0,0.08); border-color: var(--primary-light); }
.program-card-pro > div:first-child { display: inline-flex; background: rgba(10, 17, 40, 0.05); color: var(--primary); font-weight: 700; font-size: 0.75rem; padding: 6px 14px; border-radius: 50px; text-transform: uppercase; letter-spacing: 1.5px; border: 1px solid rgba(10, 17, 40, 0.1); align-self: flex-start; }
.program-card-pro h3 { font-size: 1.4rem; color: var(--primary); margin-bottom: 12px; }
.program-card-pro p { color: var(--gray); font-size: 0.95rem; line-height: 1.6; margin-bottom: 0; }
.program-card-pro > div:nth-child(2) > div { margin-top: 25px; display: flex; flex-direction: column; gap: 12px; background: var(--light); padding: 15px; border-radius: 8px; }
.program-card-pro > div:nth-child(2) > div > div { display: flex; flex-direction: column; }
.program-card-pro > div:nth-child(2) > div > div span:first-child { font-size: 0.8rem; color: var(--gray); margin-bottom: 2px; }
.program-card-pro > div:nth-child(2) > div > div span:first-child i { color: var(--secondary); margin-right: 6px; }
.program-card-pro > div:nth-child(2) > div > div span:last-child { font-weight: 700; color: var(--primary); font-size: 0.95rem; }
.btn-gradient { display: inline-flex; align-items: center; justify-content: center; background: var(--gradient-orange); color: white !important; padding: 14px 28px; border-radius: 12px; font-weight: 800; text-align: center; text-decoration: none; transition: var(--transition); border: none; cursor: pointer; font-size: 1rem; width: 100%; box-shadow: 0 4px 15px rgba(234, 88, 12, 0.3); }
.btn-gradient:hover { box-shadow: 0 8px 25px rgba(234, 88, 12, 0.4); transform: translateY(-2px); }
`;
fs.appendFileSync('style-v3.css', css);
console.log('Appended country CSS to style-v3.css');
