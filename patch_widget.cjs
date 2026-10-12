const fs = require('fs');
let code = fs.readFileSync('src/components/dashboard/ApprovalSummaryWidgets.tsx', 'utf8');

code = code.replace(/\{\/\* ROW 1 - COL 1: SYSTEM PARAMETER CONFIG     \*\/\}/,
  `{isSysAdmin && (
          <>
        {/* ROW 1 - COL 1: SYSTEM PARAMETER CONFIG     */}`);

code = code.replace(/<\/div>\s*\{showFraud && \(/,
  `</div>
          </>
        )}

        {showFraud && (`);

fs.writeFileSync('src/components/dashboard/ApprovalSummaryWidgets.tsx', code);
