(function(){
  'use strict';

  function loadCssIfNeeded(href){
    return new Promise(res=>{
      if (document.querySelector(`link[rel="stylesheet"][href*="${href.split('/').pop()}"]`)) return res();
      const l = document.createElement('link'); l.rel='stylesheet'; l.href=href; l.onload=res; l.onerror=res; document.head.appendChild(l);
      setTimeout(res, 800);
    });
  }

  // Public: show a plain-text print preview modal for the last viewed order
  window.smPrint = async function(){
    try {
      const order = window.smPrintOrder;
      if (!order) {
        console.warn('smPrint: no order available to print');
        return false;
      }

      // gather seller info (saved when the view modal was opened)
      const sellerName = window.smPrintSellerName || '';
      const sellerPhone = window.smPrintSellerPhone || '';

      // customer mobile may already be attached by view modal
      let customerPhone = order.customerMobile || '';
      // fallback to DB lookup if not provided
      if (!customerPhone && order.customerId && window.DB && typeof window.DB.getById === 'function') {
        try {
          const cust = await window.DB.getById('customers', order.customerId);
          if (cust && cust.mobile) customerPhone = cust.mobile;
        } catch(e) { /* ignore */ }
      }

      // format date/time exactly as the view modal does
      const dt = new Date(order.createdAt || Date.now());
      // date as dd/mm/yyyy
      const orderDate = String(dt.getDate()).padStart(2,'0') + '/' + String(dt.getMonth()+1).padStart(2,'0') + '/' + dt.getFullYear();
      const createdTime = ''; // no time needed

      // build plain text receipt lines
      const lines = [];
      if (sellerName) lines.push(sellerName);
      if (sellerPhone) lines.push(sellerPhone);
      if (sellerName || sellerPhone) lines.push('');
      lines.push('Customer: ' + (order.customerName || 'Unknown'));
      // always show mobile label (could be blank if unknown)
      lines.push('Cust. mobile: ' + (customerPhone || ''));
      lines.push('Area: ' + (order.area || 'N/A'));
      lines.push('Date: ' + orderDate + ' ' + createdTime);
      lines.push('Order #: ' + (order.orderNumber || 'Order #' + order.id));
      lines.push('');
      lines.push('Products:');
      lines.push('Name | C | P | Price | Total');
      (order.items || []).forEach(item => {
        lines.push(
          `${item.productName || 'Unknown'} | ${item.cartons||0} | ${item.pcs||0} | ৳${Math.round(item.price||0)} | ৳${Math.round(item.total||0)}`
        );
      });
      lines.push('');
      lines.push('Total Amount: ৳' + Math.round(order.total||0));
      // credit note no longer printed

      // load our print stylesheet (hides everything except the preview)
      Promise.all(['css/sm-print.css'].map(loadCssIfNeeded)).then(()=>{
        const ROOT_ID = 'sprint-print-root';
        const prev = document.getElementById(ROOT_ID); if (prev) prev.remove();

        const root = document.createElement('div');
        root.id = ROOT_ID;
        // full‑screen white background container
        root.style.position = 'fixed';
        root.style.top = 0;
        root.style.left = 0;
        root.style.width = '100%';
        root.style.height = '100%';
        root.style.background = 'white';
        root.style.zIndex = 9999;
        root.style.padding = '20px';
        root.style.overflow = 'auto';

        const closeBtn = document.createElement('button');
        closeBtn.textContent = 'Close';
        closeBtn.style.marginRight = '10px';
        closeBtn.addEventListener('click', cleanup);
        root.appendChild(closeBtn);

        const printBtn = document.createElement('button');
        printBtn.textContent = 'Print';
        printBtn.addEventListener('click', () => {
          try { window.print(); } catch(e){ console.error('print failed',e); }
        });
        root.appendChild(printBtn);

        const pre = document.createElement('pre');
        pre.style.margin = '20px 0 0 0';
        pre.style.whiteSpace = 'pre-wrap';
        pre.style.fontFamily = 'monospace';
        pre.style.fontSize = '14pt';
        pre.textContent = lines.join('\n');
        root.appendChild(pre);

        document.body.appendChild(root);

        function cleanup(){
          try{ root.remove(); }catch(e){}
          window.removeEventListener('afterprint', cleanup);
        }
        window.addEventListener('afterprint', cleanup);

        // open print dialog automatically after a short delay so user sees preview
        setTimeout(() => {
          try { window.print(); } catch(e){ console.error('print failed',e); }
        }, 300);
      }).catch(err=>{ console.error('smPrint: load css failed', err); });

      return true;
    } catch (err) {
      console.error('smPrint error', err);
      return false;
    }
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = { smPrint: window.smPrint };
})();
