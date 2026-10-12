const fs = require('fs');
let code = fs.readFileSync('src/context/FMSContext.tsx', 'utf8');

if (!code.includes('updateInvestigationHistoryItem:')) {
  // Add to type
  code = code.replace(/addAmlCifHistoryGroup\?: \(group: AmlCifHistoryGroup\) => void;/, 
    `addAmlCifHistoryGroup?: (group: AmlCifHistoryGroup) => void;
  updateInvestigationHistoryItem: (updatedItem: InvestigationHistoryItem | AmlCifHistoryGroup) => void;`);
  
  // Add implementation
  const implStr = `const updateInvestigationHistoryItem = (updatedItem: InvestigationHistoryItem | AmlCifHistoryGroup) => {
    setInvestigationHistory(prev => {
      const idx = prev.findIndex(item => item.id === updatedItem.id);
      if (idx !== -1) {
        const newHist = [...prev];
        newHist[idx] = updatedItem as InvestigationHistoryItem;
        return newHist;
      }
      return prev;
    });
    setAmlInvestigationHistory(prev => {
      const idx = prev.findIndex(item => item.id === updatedItem.id);
      if (idx !== -1) {
        const newHist = [...prev];
        newHist[idx] = updatedItem;
        return newHist;
      }
      return prev;
    });
  };`;

  code = code.replace(/const updateCifStatus = \(cifNumber: string, newStatus: InvestigationStatus\) => \{/, 
    `${implStr}\n\n  const updateCifStatus = (cifNumber: string, newStatus: InvestigationStatus) => {`);

  code = code.replace(/updateCifStatus,/, 
    `updateCifStatus,\n        updateInvestigationHistoryItem,`);
}

fs.writeFileSync('src/context/FMSContext.tsx', code);
