const fs = require('fs');
let code = fs.readFileSync('src/types/fms.ts', 'utf8');

code = code.replace(/childRules: AmlChildRuleHistoryItem\[\];\n  cases\?: FraudCase\[\];\n\}/, 
  `childRules: AmlChildRuleHistoryItem[];
  cases?: FraudCase[];

  // Post-Closure Analysis Attachments
  postClosureAttachments?: Array<{
    id: string;
    fileName: string;
    fileSize: number;
    uploadedBy: string;
    uploadedRole: string;
    timestamp: string;
  }>;
}`);

fs.writeFileSync('src/types/fms.ts', code);
