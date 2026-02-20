(function(){
  'use strict';
  async function init(){
    try {
      // basic print styles similar to single-print
      const style = document.createElement('style');
      style.textContent = `
@page { margin: 16mm 0 6mm 0; }
@media print {
  body { padding-top: 0; margin-left: 10mm; }
  html, body { background: #fff; }
  h3 { text-align: center; font-family: monospace; font-size: 16pt; margin: 0; }
  pre { white-space: pre; font-family: monospace; font-size: 14pt; display: inline-block; width: 42ch; margin: 0 auto; }
}
`;
      document.head.appendChild(style);
      const params = new URLSearchParams(window.location.search);
      const storageKey = params.get('key') || 'printSummary';
      const raw = localStorage.getItem(storageKey);
      localStorage.removeItem(storageKey);
      if (!raw) {
        document.getElementById('content').textContent = 'No summary data';
        return;
      }
      const payload = JSON.parse(raw);
      const date = payload.date;
      const ordersCount = payload.ordersCount;
      const summaryArray = payload.summaryArray || [];
      const grandTotal = payload.grandTotal;
      let sellerName = payload.sellerName || '';
      let sellerPhone = payload.sellerPhone || '';
      if ((!sellerName || !sellerPhone) && window.DB && typeof window.DB.getSetting === 'function') {
        try {
          const phoneSetting = await window.DB.getSetting('sellerPhone');
          const nameSetting = await window.DB.getSetting('sellerName');
          if (!sellerPhone && phoneSetting) sellerPhone = phoneSetting;
          if (!sellerName && nameSetting) sellerName = nameSetting;
        } catch(e){}
        const sessionStr = localStorage.getItem('companySession');
        if ((!sellerName || !sellerPhone) && sessionStr) {
          try {
            const session = JSON.parse(sessionStr);
            if (!sellerPhone && session.phone) sellerPhone = session.phone;
            if (!sellerName && session.name) sellerName = session.name;
          } catch(e){}
        }
      }
      const WIDTH = 42;
      const lines = [];
      // header
      lines.push('ORDER SUMMARY'.padStart((WIDTH+'ORDER SUMMARY'.length)/2).padEnd(WIDTH));
      // seller info moves outside pre as <h3>
      if (sellerPhone) lines.push(sellerPhone.padStart((WIDTH+sellerPhone.length)/2).padEnd(WIDTH));
      if (sellerPhone) lines.push('------------------------------------------'.padEnd(WIDTH));
      // report info
      lines.push(('Date: ' + date).padEnd(WIDTH));
      lines.push(('Orders: ' + ordersCount).padEnd(WIDTH));
      lines.push('');
      // table header
      lines.push('Product'.padEnd(16) + ' | ' + 'C'.padStart(2) + ' | ' + 'P'.padStart(2) + ' | ' + 'Total'.padStart(10));
      summaryArray.forEach(item => {
        const prod = (item.productName||'').toString().slice(0,16);
        const c = Math.round(item.cartons||0).toString();
        const p = Math.round(item.pcs||0).toString();
        const t = '৳' + Math.round(item.total||0);
        lines.push(prod.padEnd(16) + ' | ' + c.padStart(2) + ' | ' + p.padStart(2) + ' | ' + t.padStart(10));
      });
      lines.push('');
      lines.push(('Grand Total: ৳' + Math.round(grandTotal||0)).padEnd(WIDTH));
      // render seller name h3
      if (sellerName) {
        const h3 = document.createElement('h3');
        h3.textContent = sellerName;
        document.getElementById('content').appendChild(h3);
      }
      const pre = document.createElement('pre');
      pre.textContent = lines.join('\n');
      pre.style.margin = '0';
      document.getElementById('content').appendChild(pre);
      window.print();
    } catch (e) {
      console.error('print-summary error', e);
    }
  }
  window.addEventListener('DOMContentLoaded', init);
})();