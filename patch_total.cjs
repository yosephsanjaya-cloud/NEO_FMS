const fs = require('fs');
let code = fs.readFileSync('src/components/dashboard/ApprovalSummaryWidgets.tsx', 'utf8');

code = code.replace(/const grandTotalPending = sysParamTotal \+ fraudDomainTotal \+ amlDomainTotal;/,
  `let grandTotalPending = 0;
  if (isSysAdmin) grandTotalPending += sysParamTotal;
  if (showFraud) grandTotalPending += fraudDomainTotal;
  if (showAml) grandTotalPending += amlDomainTotal;`);

fs.writeFileSync('src/components/dashboard/ApprovalSummaryWidgets.tsx', code);
