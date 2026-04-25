const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

// Helper to map tailwind spacing
function mapSpacing(cls) {
    const match = cls.match(/^(-?[a-z]+)-(\d+(?:\.\d+)?|px)$/);
    if (!match) return cls;
    let prop = match[1];
    let val = match[2];

    if (val === 'px') return cls;
    let num = parseFloat(val);

    if (num <= 2) num = 2; // 8px
    else if (num <= 4) num = 4; // 16px
    else if (num <= 6) num = 6; // 24px
    else num = 8; // 32px max

    return `${prop}-${num}`;
}

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');

    // 1. Shadows
    // Map existing --shadow-sm, --shadow-md, --shadow-xl custom classes to standard tailwind shadows
    content = content.replace(/shadow-\[--shadow-sm\]/g, 'shadow-sm');
    content = content.replace(/shadow-\[--shadow-md\]/g, 'shadow-md');
    // shadow-xl -> shadow-md if hovering, else maybe removing
    content = content.replace(/shadow-\[--shadow-xl\]/g, 'shadow-md');
    content = content.replace(/shadow-2xl/g, 'shadow-lg');
    content = content.replace(/shadow-xl/g, 'shadow-md');
    // Remove colored shadows entirely, they add visual clutter. E.g. shadow-primary/20
    content = content.replace(/shadow-[a-z]+(?:-[0-9]+)?(?:\/[0-9]+)?/g, function(match){
        if(match === 'shadow-sm' || match === 'shadow-md' || match === 'shadow-lg') return match;
        return ''; // remove custom shadow colors like shadow-slate-200/40
    });

    // 2. Blur / Backdrop
    content = content.replace(/blur-\[\d+px\]/g, ''); // Remove inline blur blobs
    content = content.replace(/backdrop-blur-(sm|md|lg|xl|2xl|3xl)/g, ''); // Remove backdrop blurs
    content = content.replace(/animate-pulse/g, ''); // removing pulse clatter

    // 3. Spacing (map 0-40 into 2,4,6,8)
    // We target p, px, py, pt, pb, pl, pr, m, mx, my, mt, mb, ml, mr, gap
    const spacingRegex = /(?<![a-zA-Z0-9-])(-?(?:p|px|py|pt|pb|pl|pr|m|mx|my|mt|mb|ml|mr|gap)-(\d+(?:\.\d+)?))(?![a-zA-Z0-9-])/g;
    content = content.replace(spacingRegex, (fullMatch, cls, val) => {
        return mapSpacing(cls);
    });

    // 4. Focus
    // Replace ring-4 ring-primary/20 with ring-2 ring-primary/30 outline-none
    content = content.replace(/ring-4 ring-primary\/[0-9]+/g, 'ring-2 ring-primary/30 outline-none');
    content = content.replace(/focus:ring-4/g, 'focus:ring-2 outline-none');

    // 5. Borders (Radii)
    // Cards -> rounded-xl (12px) or rounded-2xl (16px)
    // Buttons/Inputs -> rounded-lg (8px) or rounded-xl (12px)
    // We already use custom --radius-lg etc., let's replace them completely.
    content = content.replace(/rounded-\[--radius-lg\]/g, 'rounded-lg');
    content = content.replace(/rounded-\[--radius-xl\]/g, 'rounded-xl');
    content = content.replace(/rounded-\[.*?\]/g, 'rounded-xl'); // blanket other absolute units
    // Standardize existing rounded-2xl/3xl to rounded-2xl
    content = content.replace(/rounded-3xl/g, 'rounded-2xl');
    content = content.replace(/rounded-full/g, 'rounded-full'); // Keep full for icons/pills

    // 6. Transitions (Hover/Active)
    content = content.replace(/hover:-translate-y-(0\.5|1|1\.5|2)/g, ''); // No Y translation
    content = content.replace(/duration-300|duration-500|duration-700/g, 'duration-200');

    // Remove empty classes (multiple spaces) leaving single space
    content = content.replace(/ +/g, ' ');

    fs.writeFileSync(filePath, content, 'utf8');
}

// target files
const filesToProcess = ['index.css', 'App.jsx', 'Dashboard.jsx', 'AvailableCars.jsx'].map(f => path.join(srcDir, f));

filesToProcess.forEach(processFile);
console.log('Processed UI standardizations successfully.');
