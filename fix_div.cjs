const fs = require('fs');
let code = fs.readFileSync('src/components/investigation/InvestigationHistoryDetailModal.tsx', 'utf8');

let rightColStart = code.indexOf('{/* ===================================================================\n                RIGHT COLUMN SECTION');

if (rightColStart !== -1) {
  // Let's check how many divs close before it.
  // We need to add one div.
  code = code.substring(0, rightColStart) + '            </div>\n\n            ' + code.substring(rightColStart);
}

fs.writeFileSync('src/components/investigation/InvestigationHistoryDetailModal.tsx', code);
