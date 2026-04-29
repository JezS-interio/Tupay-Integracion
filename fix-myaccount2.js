const fs = require('fs');
const f = 'c:/Users/acer/Desktop/Integracion/Intitech-Development-main/Intitech-Development-main/src/components/MyAccount/index.tsx';
let content = fs.readFileSync(f, 'utf8');

// File uses \r\n line endings
// Find where the Billing card starts (after the first card's closing </div>)
const marker = '\r\n\r\n              <div className="xl:max-w-[370px] w-full bg-white shadow-1 rounded-xl">\r\n                <div className="flex items-center justify-between py-5 px-4 sm:pl-7.5 sm:pr-6 border-b border-gray-3">\r\n                  <p className="font-medium text-xl text-dark">\r\n                    Direcci\u00f3n de Facturaci\u00f3n';
const endMarker = '            </div>\r\n            {/* <!-- addresses tab content end -->';

const startIdx = content.indexOf(marker);
console.log('Start found at:', startIdx);

const endIdx = content.indexOf(endMarker, startIdx > -1 ? startIdx : 0);
console.log('End found at:', endIdx);

if (startIdx === -1 || endIdx === -1) { console.log('MARKERS NOT FOUND'); process.exit(1); }

const before = content.substring(0, startIdx);
const after = content.substring(endIdx);
content = before + '\r\n' + after;

fs.writeFileSync(f, content, 'utf8');
console.log('Done!');
process.exit(0);

// Find the start of the second card (Dirección de Facturación)
// It starts right after the closing </div> of the first card
const marker = '\n\n              <div className="xl:max-w-[370px] w-full bg-white shadow-1 rounded-xl">\n                <div className="flex items-center justify-between py-5 px-4 sm:pl-7.5 sm:pr-6 border-b border-gray-3">\n                  <p className="font-medium text-xl text-dark">\n                    Dirección de Facturación';

// End marker: the closing </div> before addresses tab end comment
const endMarker = '            </div>\n            {/* <!-- addresses tab content end -->';

const startIdx = content.indexOf(marker);
console.log('Start marker found at index:', startIdx);

if (startIdx === -1) {
  console.log('MARKER NOT FOUND - checking for partial match');
  const partial = 'Dirección de Facturación';
  console.log('Partial found at:', content.indexOf(partial));
  process.exit(1);
}

const endSearchFrom = startIdx;
const endIdx = content.indexOf(endMarker, endSearchFrom);
console.log('End marker found at index:', endIdx);

if (endIdx === -1) {
  console.log('END MARKER NOT FOUND');
  process.exit(1);
}

// We want to remove from startIdx to the start of endMarker
// (the endMarker closing </div> belongs to the addresses tab container, keep it)
const before = content.substring(0, startIdx);
const after = content.substring(endIdx);

content = before + '\n' + after;

fs.writeFileSync(f, content, 'utf8');
console.log('Done! Removed Dirección de Facturación card.');
