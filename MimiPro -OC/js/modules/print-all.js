(function(){
  'use strict';
  async function init(){
    try {
      // basic print CSS; no fixed positioning
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
      const raw = localStorage.getItem('printAllOrders');
      localStorage.removeItem('printAllOrders');
      if (!raw) {
        document.getElementById('content').textContent = 'No orders to print';
        return;
      }
      const payload = JSON.parse(raw);
      const date = payload.date;
      const orders = payload.orders || [];
      let sellerName = payload.sellerName || '';
      // fixed seller phone like single-print
      let sellerPhone = '01795321094';
      if (payload.sellerPhone) sellerPhone = payload.sellerPhone;
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
      // helper to build text for a single order (no seller header)
      const createOrderLines = (ord) => {
        const orderLines = [];
        // sellerName will be rendered as <h2> outside this text
        // inject phone and separator in the body, centered
        if (sellerPhone) orderLines.push(sellerPhone.padStart((WIDTH+sellerPhone.length)/2).padEnd(WIDTH));
        if (sellerPhone) orderLines.push('------------------------------------'.padEnd(WIDTH));
        // order identifier removed per request
        const dt = new Date(ord.createdAt || Date.now());
        const orderDate = String(dt.getDate()).padStart(2,'0') + '/' + String(dt.getMonth()+1).padStart(2,'0') + '/' + dt.getFullYear();
        orderLines.push('Customer: ' + (ord.customerName||'Unknown'));
        orderLines.push(('Area: ' + (ord.area || 'N/A')).padEnd(32));
        orderLines.push(('Date: ' + orderDate).padEnd(32));
        orderLines.push('');
        let header = 'Name'.padEnd(16) + 'C'.padStart(2) + ' ' + 'P'.padStart(2) + ' ' + 'Total'.padStart(10);
        orderLines.push(header.padEnd(WIDTH));
        orderLines.push(''.padEnd(WIDTH));
        // append item rows without explicit loop
        orderLines.push(...(ord.items||[]).map(item=>{
          let name=(item.productName||'Unknown').toString();
          if(name.length>16) name=name.slice(0,16);
          const cartons=(item.cartons||0).toString();
          const pcs=(item.pcs||0).toString();
          const total='৳'+Math.round(item.total||0);
          let row=name.padEnd(16)+cartons.padStart(2)+' '+pcs.padStart(2)+' '+total.padStart(10);
          return row.padEnd(WIDTH);
        }));
        orderLines.push('---------------------------------'.padEnd(WIDTH));
        const grand='৳'+Math.round(ord.total||0);
        const totalLine=''.padEnd(16)+''.padStart(2)+' '+''.padStart(2)+' '+grand.padStart(10);
        orderLines.push(totalLine.padEnd(WIDTH));
        orderLines.push('---------------------------------'.padEnd(WIDTH));
        const thank='Thank you';
        orderLines.push(thank.padStart((WIDTH+thank.length)/2).padEnd(WIDTH));
        return orderLines.join('\n');
      };


      // seller info will be injected into each order's text
      // add each order block separately, using CSS page-break
      console.log('print-all payload orders:', orders);
      orders.forEach((ord,idx)=>{
        console.log('rendering order', idx, ord);
        // if sellerName exists, add an h3 above this order
        if (sellerName) {
          const h3 = document.createElement('h3');
          h3.textContent = sellerName;
          h3.style.textAlign = 'center';
          h3.style.margin = '0';
          h3.style.fontFamily = 'monospace';
          h3.style.fontSize = '16pt';
          document.getElementById('content').appendChild(h3);
        }
        // order details
        const block = document.createElement('pre');
        block.textContent = createOrderLines(ord);
        block.style.margin = '0';
        block.style.whiteSpace = 'pre-wrap';
        block.style.fontFamily = 'monospace';
        block.style.fontSize = '10pt';
        block.style.pageBreakAfter = 'always';
        document.getElementById('content').appendChild(block);
      });

      window.print();
    } catch (e) {
      console.error('print-all error', e);
    }
  }
  window.addEventListener('DOMContentLoaded', init);
})();