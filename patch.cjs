const fs = require('fs');
let code = fs.readFileSync('src/components/dashboard/ApprovalSummaryWidgets.tsx', 'utf8');

// Inject useAuth
code = code.replace(/import \{ useFMS \} from '\.\.\/\.\.\/context\/FMSContext';/, 
  "import { useFMS } from '../../context/FMSContext';\nimport { useAuth } from '../../context/AuthContext';");

// Update Component start
code = code.replace(/const \{ ruleApprovalTickets, setActiveTab, userRole, setUserRole \} = useFMS\(\);/,
  `const { ruleApprovalTickets, setActiveTab, userRole, setUserRole } = useFMS();
  const { user } = useAuth();
  const isSysAdmin = user?.riskDomain === 'FULL ACCESS' || user?.username === 'sysadmin';
  const showFraud = isSysAdmin || user?.riskDomain === 'FRAUD ONLY' || user?.username?.includes('afc');
  const showAml = isSysAdmin || user?.riskDomain === 'AML ONLY' || user?.username?.includes('analyst');`);

// Conditionally render Fraud Row 1 Col 2
code = code.replace(/\{\/\* ========================================== \*\/\}\s*\{\/\* ROW 1 - COL 2: FRAUD RULES & RISK ENGINE   \*\/\}/, 
  `{showFraud && (
          <>
        {/* ========================================== */}
        {/* ROW 1 - COL 2: FRAUD RULES & RISK ENGINE   */}`);

code = code.replace(/<\/div>\s*\{\/\* ========================================== \*\/\}\s*\{\/\* ROW 2 - COL 1: FRAUD LIST REGISTRY       \*\/\}/, 
  `</div>
          </>
        )}
        
        {showFraud && (
          <>
        {/* ========================================== */}
        {/* ROW 2 - COL 1: FRAUD LIST REGISTRY       */}`);

code = code.replace(/<\/div>\s*\{\/\* ========================================== \*\/\}\s*\{\/\* ROW 2 - COL 2: AML DOMAIN APPROVAL         \*\/\}/, 
  `</div>
          </>
        )}

        {showAml && (
        {/* ========================================== */}
        {/* ROW 2 - COL 2: AML DOMAIN APPROVAL         */}`);

code = code.replace(/<\/div>\s*<\/div>\s*<\/div>\s*\);\s*\};\s*$/g,
  `</div>
        )}
      </div>
    </div>
  );
};
`);

fs.writeFileSync('src/components/dashboard/ApprovalSummaryWidgets.tsx', code);
