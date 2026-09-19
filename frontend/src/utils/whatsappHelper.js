/**
 * WhatsApp Helper Utilities for GSTKhata Billing System
 */

/**
 * Formats a clean, high-impact, professional WhatsApp invoice text message.
 * Includes bold markdown, emojis, payment status, item breakdown, and direct PDF download links.
 */
export function formatWhatsAppInvoiceMessage(bill, shop = {}) {
  if (!bill) return '';

  const shopName = shop.shop_name || bill.shop?.shop_name || 'Darshan Electronics & Retail';
  const shopPhone = shop.phone || bill.shop?.phone || '';
  const partyName = bill.party_name || 'Customer';
  const invoiceNo = bill.invoice_no || `INV-${bill.id}`;
  const invoiceDate = bill.invoice_date
    ? new Date(bill.invoice_date).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })
    : new Date().toLocaleDateString('en-IN');
  
  const grandTotal = `₹${Number(bill.grand_total || 0).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

  // Items breakdown (up to 4 items)
  let itemsSection = '';
  if (Array.isArray(bill.items) && bill.items.length > 0) {
    const itemLines = bill.items.slice(0, 4).map(
      (item) => `• ${item.name} (${item.qty} x ₹${Number(item.rate).toFixed(2)})`
    );
    const extraCount = bill.items.length - 4;
    itemsSection = `\n*Purchased Items:*\n${itemLines.join('\n')}${
      extraCount > 0 ? `\n...and ${extraCount} more item(s)` : ''
    }\n`;
  }

  // Fetch production or local environment URLs
  const getBackendHost = () => {
    const apiEnv = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL;
    if (apiEnv && apiEnv.startsWith('http')) {
      return apiEnv.replace(/\/api\/?$/, '');
    }
    if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
      return 'http://localhost:5000';
    }
    return typeof window !== 'undefined' ? window.location.origin : '';
  };

  const getFrontendHost = () => {
    const appEnv = import.meta.env.VITE_APP_URL;
    if (appEnv && appEnv.startsWith('http')) {
      return appEnv.replace(/\/$/, '');
    }
    return typeof window !== 'undefined' ? window.location.origin : '';
  };

  const backendHost = getBackendHost();
  const frontendHost = getFrontendHost();

  const viewUrl = `${frontendHost}/bills/${bill.id}`;
  const pdfDownloadUrl = `${backendHost}/api/bills/public/${bill.id}/pdf`;

  return (
`*TAX INVOICE - ${shopName}*
━━━━━━━━━━━━━━━━━━━━━
*Customer:* ${partyName}
*Invoice No:* ${invoiceNo}
*Date:* ${invoiceDate}
*Grand Total:* ${grandTotal}
*Payment Status:* ${bill.status}${itemsSection}
*View Online Invoice:*
${viewUrl}

*Download PDF Invoice File:*
${pdfDownloadUrl}

${shopPhone ? `*Support:* ${shopPhone}\n` : ''}Thank you for your business!`
  );
}

/**
 * Cleans phone number to international WhatsApp format (defaults to India 91 prefix).
 */
export function formatPhoneNumberForWhatsApp(mobile) {
  if (!mobile) return '';
  const cleaned = String(mobile).replace(/\D/g, '');
  if (cleaned.length === 10) return `91${cleaned}`;
  return cleaned;
}

/**
 * Generates the full WhatsApp API web URL with phone prefilled if available.
 */
export function getWhatsAppWebUrl(bill, shop = {}) {
  const text = formatWhatsAppInvoiceMessage(bill, shop);
  const encodedText = encodeURIComponent(text);
  const mobile = bill?.party_mobile || bill?.party?.mobile || '';
  const formattedPhone = formatPhoneNumberForWhatsApp(mobile);

  if (formattedPhone) {
    return `https://api.whatsapp.com/send?phone=${formattedPhone}&text=${encodedText}`;
  }
  return `https://api.whatsapp.com/send?text=${encodedText}`;
}

/**
 * Shares PDF file natively using the Web Share API (attaches .pdf file directly in WhatsApp/Apps).
 */
export async function shareInvoicePdfNative(api, bill, shop = {}) {
  const invoiceNo = bill?.invoice_no || `INV-${bill.id}`;
  const text = formatWhatsAppInvoiceMessage(bill, shop);

  try {
    const res = await api.get(`/bills/${bill.id}/pdf`, { responseType: 'blob' });
    const pdfBlob = new Blob([res.data], { type: 'application/pdf' });
    const file = new File([pdfBlob], `Invoice_${invoiceNo}.pdf`, { type: 'application/pdf' });

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({
        title: `Tax Invoice ${invoiceNo}`,
        text: text,
        files: [file],
      });
      return { success: true, method: 'web_share' };
    } else {
      // Fallback to downloading PDF and opening WhatsApp
      const blobUrl = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.setAttribute('download', `Invoice_${invoiceNo}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);

      const whatsappUrl = getWhatsAppWebUrl(bill, shop);
      window.open(whatsappUrl, '_blank');
      return { success: true, method: 'download_and_whatsapp' };
    }
  } catch (err) {
    console.error('Error sharing PDF:', err);
    throw err;
  }
}
