const fs = require('fs');
let code = fs.readFileSync('src/components/dashboard/ApprovalSummaryWidgets.tsx', 'utf8');

code = code.replace(/\{showAml && \(\s*\{\/\* ========================================== \*\/\}\s*\{\/\* ROW 2 - COL 2: AML DOMAIN APPROVAL         \*\/\}/,
  `{showAml && (
    <>
        {/* ========================================== */}
        {/* ROW 2 - COL 2: AML DOMAIN APPROVAL         */}`);

code = code.replace(/<\/div>\s*\)\}\s*<\/div>\s*<\/div>\s*\);\s*\};\s*$/g,
  `</div>
          </>
        )}
      </div>
    </div>
  );
};
`);

fs.writeFileSync('src/components/dashboard/ApprovalSummaryWidgets.tsx', code);
