const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

if (!code.includes('import { useEffect } from')) {
    code = code.replace("import React from 'react';", "import React, { useEffect } from 'react';");
}

code = code.replace(/const FMSContent: React.FC = \(\) => \{/,
  `const FMSContent: React.FC = () => {
  const { activeTab, setActiveTab, addNotification } = useFMS();
  const { user } = useAuth();

  useEffect(() => {
    const isSysAdmin = user?.riskDomain === 'FULL ACCESS' || user?.username === 'sysadmin';
    if (!isSysAdmin) {
      const restrictedTabs = [
        'system-parameter-user-approval',
        'system-parameter-group-approval',
        'system-parameter-role-approval',
        'system-parameter-access-menu-approval',
        'system-parameter-application-approval',
        'system-parameter-udp-approval',
        'system-parameter-email-template-approval',
        'system-parameter-user-session-approval'
      ];
      
      if (restrictedTabs.includes(activeTab)) {
        setActiveTab('dashboard');
        addNotification({
          domain: 'SYSTEM',
          title: 'Access Denied',
          message: 'Access Denied: Insufficient Privileges',
          targetRole: user?.role || 'User'
        });
      }
    }
  }, [activeTab, user, setActiveTab, addNotification]);`);

// And we need to remove the duplicate `const { activeTab, setActiveTab } = useFMS();`
code = code.replace(/const \{ activeTab, setActiveTab \} = useFMS\(\);\n/, '');

fs.writeFileSync('src/App.tsx', code);
