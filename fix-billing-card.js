const fs = require('fs');
const f = 'c:/Users/acer/Desktop/Integracion/Intitech-Development-main/Intitech-Development-main/src/components/MyAccount/index.tsx';
let c = fs.readFileSync(f, 'utf8');
// Remove the entire Dirección de Facturación card
// Identify by the unique title text, find surrounding div boundaries
const facIdx = c.indexOf('Direcci\u00f3n de Facturaci\u00f3n');
if (facIdx === -1) { console.log('Not found'); process.exit(1); }

// Walk backwards to find the opening <div of this card
let searchPos = facIdx - 1;
let divStart = -1;
// The card starts with: \r\n\r\n              <div className="xl:max-w
const needle = '\r\n\r\n              <div className="xl:max-w-[370px] w-full bg-white shadow-1 rounded-xl">';
divStart = c.lastIndexOf(needle, facIdx);
console.log('divStart:', divStart);

// The end of this card is the </div> right before the addresses-tab-end comment
const endComment = '{/* <!-- addresses tab content end -->';
const endCommentIdx = c.indexOf(endComment);
console.log('endCommentIdx:', endCommentIdx);

// Walk backwards from endCommentIdx to find the closing </div> of the addresses tab container
// The last </div> before the comment is the container closing tag
// We want to keep that container closing tag, so our removal ends just before it
// Structure: [card2_content] + \r\n              </div>\r\n            </div>\r\n            {/* <!-- addresses tab content end */
// We need to find the </div> that closes the addresses container (one level up from card)
// Card closes with: \r\n              </div>\r\n            </div>\r\n            {/* end
const containerClose = '\r\n            </div>\r\n            {/* <!-- addresses tab content end -->';
const containerCloseIdx = c.indexOf(containerClose, facIdx);
console.log('containerCloseIdx:', containerCloseIdx);

if (divStart === -1 || containerCloseIdx === -1) {
  console.log('Markers not found');
  process.exit(1);
}

// Remove from divStart to containerCloseIdx (keep the container close)
const before = c.substring(0, divStart);
const after = c.substring(containerCloseIdx);
c = before + after;

fs.writeFileSync(f, c, 'utf8');
console.log('Done! Removed Dirección de Facturación card.');
