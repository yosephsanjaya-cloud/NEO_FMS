const fs = require('fs');
let code = fs.readFileSync('src/components/dashboard/ApprovalSummaryWidgets.tsx', 'utf8');
code = code.replace(/<div className=\{`grid grid-cols-1 md:grid-cols-.* gap-6`\}>/, 
  "<div className={`grid grid-cols-1 gap-6 ${(!isSysAdmin && showAml && !showFraud) ? 'md:grid-cols-1' : 'md:grid-cols-2'}`}>");
fs.writeFileSync('src/components/dashboard/ApprovalSummaryWidgets.tsx', code);

let caseCode = fs.readFileSync('src/components/dashboard/CaseApprovalWidget.tsx', 'utf8');
caseCode = caseCode.replace(/<div className=\{`grid grid-cols-1 md:grid-cols-.* gap-6`\}>/, 
  "<div className={`grid grid-cols-1 gap-6 ${(showFraud && showAml) ? 'md:grid-cols-2' : 'md:grid-cols-1'}`}>");
fs.writeFileSync('src/components/dashboard/CaseApprovalWidget.tsx', caseCode);
