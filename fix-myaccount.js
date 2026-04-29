const fs = require('fs');
const f = 'c:/Users/acer/Desktop/Integracion/Intitech-Development-main/Intitech-Development-main/src/components/MyAccount/index.tsx';
let content = fs.readFileSync(f, 'utf8');

const streetCity = '`${userProfile.shippingAddress.street}, ${userProfile.shippingAddress.city}`';
const noGuardada = "'No guardada aún'";
const old = `Dirección: {userProfile?.shippingAddress?.street ? \`, \` : ${noGuardada}}`;
const rep = `Dirección: {userProfile?.shippingAddress?.street ? ${streetCity} : ${noGuardada}}`;

const count = content.split(old).length - 1;
console.log('Matches:', count);
content = content.split(old).join(rep);
fs.writeFileSync(f, content, 'utf8');
console.log('Done');
