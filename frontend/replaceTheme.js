const fs = require('fs');
const path = require('path');

const walkSync = (dir, filelist = []) => {
    fs.readdirSync(dir).forEach(file => {
        const dirFile = path.join(dir, file);
        if (fs.statSync(dirFile).isDirectory()) {
            filelist = walkSync(dirFile, filelist);
        } else {
            if (dirFile.endsWith('.jsx') || dirFile.endsWith('.tsx') || dirFile.endsWith('.js')) {
                filelist.push(dirFile);
            }
        }
    });
    return filelist;
};

const files = walkSync('/Users/magnus/Desktop/finance-tracker/frontend/src');
let changedCount = 0;

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    // Replace slate-950 (usually page backgrounds)
    content = content.replace(/dark:bg-slate-950\/[0-9]+/g, 'dark:bg-black');
    content = content.replace(/dark:bg-slate-950/g, 'dark:bg-black');

    // Replace slate-900 (usually cards/panels)
    content = content.replace(/dark:bg-slate-900\/5/g, 'dark:bg-transparent');
    content = content.replace(/dark:bg-slate-900\/30/g, 'dark:bg-[#0a0a0a]');
    content = content.replace(/dark:bg-slate-900\/[0-9]+/g, 'dark:bg-[#050505]');
    content = content.replace(/dark:bg-slate-900/g, 'dark:bg-[#050505]');

    // Strip generic backdrop blurs in dark mode
    content = content.replace(/backdrop-blur-xl(?! dark:backdrop-blur-none)/g, 'backdrop-blur-xl dark:backdrop-blur-none');
    content = content.replace(/backdrop-blur-2xl(?! dark:backdrop-blur-none)/g, 'backdrop-blur-2xl dark:backdrop-blur-none');
    content = content.replace(/backdrop-blur-md(?! dark:backdrop-blur-none)/g, 'backdrop-blur-md dark:backdrop-blur-none');

    // Strip shadow-none (we want shadows in dark mode for skeuomorphism)
    content = content.replace(/dark:shadow-none/g, '');

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        console.log('Updated:', file);
        changedCount++;
    }
});

console.log(`Successfully updated ${changedCount} files.`);
