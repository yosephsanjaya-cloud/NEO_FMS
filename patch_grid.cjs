const fs = require('fs');
let code = fs.readFileSync('src/components/dashboard/ApprovalSummaryWidgets.tsx', 'utf8');

code = code.replace(/<div className=\{\`grid grid-cols-1 md:grid-cols-\\\$\{\(showFraud && showAml && isSysAdmin\) \? '2' : '1'\} gap-6\`\}>/,
  "<div className={`grid grid-cols-1 md:grid-cols-${(!isSysAdmin && showAml && !showFraud) ? '1' : '2'} gap-6`}>");

fs.writeFileSync('src/components/dashboard/ApprovalSummaryWidgets.tsx', code);
