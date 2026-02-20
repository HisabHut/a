(function(){
  'use strict';
  async function init(){
    try {
      // add basic print styles (no fixed header, text flows normally)
      const style = document.createElement('style');
      style.textContent = `
@page { margin: 16mm 0 6mm 0; }
@media print {
  body { padding-top: 0; margin-left: 10mm; }
  html, body { background: #fff; }
  h3 { text-align: center; font-family: monospace; font-size: 16pt; margin: 0; }
}
`;
      document.head.appendChild(style);
      // decide which storage key to use (possible 'key' query param)
      const params = new URLSearchParams(window.location.search);
      const storageKey = params.get('key') || 'printOrder';
      const raw = localStorage.getItem(storageKey);
      localStorage.removeItem(storageKey);
      if (!raw) {
        document.getElementById('content').textContent = 'No order data available';
        return;
      }
      const order = JSON.parse(raw);
      let sellerName = order.sellerName || '';
      // fixed seller phone as requested (will render in h5 / 8pt font)
      let sellerPhone = '01795321094';
      // fall back to settings/db only if constant is missing (won't happen because hardcoded)
      if ((!sellerName || !sellerPhone) && window.DB && typeof window.DB.getSetting === 'function') {
        try {
          const phoneSetting = await window.DB.getSetting('sellerPhone');
          const nameSetting = await window.DB.getSetting('sellerName');
          if (!sellerPhone && phoneSetting) sellerPhone = phoneSetting;
          if (!sellerName && nameSetting) sellerName = nameSetting;
        } catch(e) { /* ignore */ }
        const sessionStr = localStorage.getItem('companySession');
        if ((!sellerName || !sellerPhone) && sessionStr) {
          try {
            const session = JSON.parse(sessionStr);
            if (!sellerPhone && session.phone) sellerPhone = session.phone;
            if (!sellerName && session.name) sellerName = session.name;
          } catch(e){}
        }
      }

      // attempt to fetch customer phone using id
      let customerPhone = '';
// customer mobile not needed for print

      const dt = new Date(order.createdAt || Date.now());
      // format date as dd/mm/yyyy
      const orderDate = String(dt.getDate()).padStart(2,'0') + '/' + String(dt.getMonth()+1).padStart(2,'0') + '/' + dt.getFullYear();
      const createdTime = ''; // time no longer used
      // header separator and seller info will be included in text below
      const lines = [];
      // use same width constant for centering
      const WIDTH = 42;
      // seller name will be rendered as <h3> above the <pre>
      // include phone and separator in the text content
      if (sellerPhone) lines.push(sellerPhone.padStart((WIDTH+sellerPhone.length)/2).padEnd(WIDTH));
      if (sellerPhone) lines.push('------------------------------------------'.padEnd(WIDTH));
      // customer name will be inserted later after header block
      // order identifier removed per request
      // ensure area text uses fixed width
      lines.push(('Area: ' + (order.area || 'N/A')).padEnd(32));
      lines.push(('Date: ' + orderDate).padEnd(32));
      // order id removed as requested
      lines.push('');
      // use full width for 80mm paper
      // smaller columns to accommodate larger font
      let header = 'Name'.padEnd(16) +
                   'C'.padStart(2) + ' ' +
                   'P'.padStart(2) + ' ' +
                   'Total'.padStart(10);
      lines.push(header.padEnd(WIDTH));
      // blank row below header
      lines.push(''.padEnd(WIDTH));
      // append item rows using map/join instead of loop
      lines.push(...(order.items || []).map(item => {
        let name = (item.productName || 'Unknown').toString();
        if (name.length > 16) name = name.slice(0, 16);
        const cartons = (item.cartons || 0).toString();
        const pcs = (item.pcs || 0).toString();
        const total = '৳' + Math.round(item.total||0);
        let row = name.padEnd(16) +
                  cartons.padStart(2) + ' ' +
                  pcs.padStart(2) + ' ' +
                  total.padStart(10);
        return row.padEnd(WIDTH);
      }));
      // separator before grand total (shortened by 10 dashes)
      lines.push('---------------------------------'.padEnd(42));
      // align total amount under "Total" column
      const grand = '৳' + Math.round(order.total||0);
      const totalLine = ''.padEnd(16) + ''.padStart(2) + ' ' + ''.padStart(2) + ' ' + grand.padStart(10);
      lines.push(totalLine.padEnd(42));
      // extra separator and thank you centered
      lines.push('---------------------------------'.padEnd(42));
      const thank = 'Thank you';
      lines.push(thank.padStart((42 + thank.length)/2).padEnd(42));
      // credit note removed per request
      // (header already inserted earlier; no duplicate needed)
      // create <h3> for seller name if provided
      if (sellerName) {
        const h3 = document.createElement('h3');
        h3.textContent = sellerName;
        h3.style.textAlign = 'center';
        h3.style.margin = '0';
        h3.style.fontFamily = 'monospace';
        h3.style.fontSize = '16pt';
        document.getElementById('content').appendChild(h3);
      }
      const pre = document.createElement('pre');
      pre.textContent = lines.join('\n');
      pre.style.margin = '0';
      pre.style.whiteSpace = 'pre-wrap';
      pre.style.fontFamily = 'monospace';
      pre.style.fontSize = '10pt';
      document.getElementById('content').appendChild(pre);
      window.print();
    } catch (e) {
      console.error('print-single error', e);
    }
  }
  window.addEventListener('DOMContentLoaded', init);
})();