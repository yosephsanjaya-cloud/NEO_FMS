const fs = require('fs');
let code = fs.readFileSync('src/components/profile/CustomerProfileDetail.tsx', 'utf8');

const oldDecl = `export const CustomerProfileDetail: React.FC<CustomerProfileDetailProps> = ({
  customer,
  onBackToList
}) => {`;

const newDecl = `export const CustomerProfileDetail: React.FC<CustomerProfileDetailProps> = ({
  customer,
  onBackToList,
  searchedAccount
}) => {`;

code = code.replace(oldDecl, newDecl);

fs.writeFileSync('src/components/profile/CustomerProfileDetail.tsx', code);
