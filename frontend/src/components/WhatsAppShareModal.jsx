import { useState } from 'react';
import api from '../api/axios';
import {
  formatWhatsAppInvoiceMessage,
  getWhatsAppWebUrl,
  formatPhoneNumberForWhatsApp,
  shareInvoicePdfNative,
} from '../utils/whatsappHelper';

export default function WhatsAppShareModal({ bill, shop, show, onClose }) {
  const [copied, setCopied] = useState(false);
  const [sharingNative, setSharingNative] = useState(false);

  if (!show || !bill) return null;

  const formattedMessage = formatWhatsAppInvoiceMessage(bill, shop);
  const whatsappUrl = getWhatsAppWebUrl(bill, shop);
  const partyPhone = bill.party_mobile || bill.party?.mobile || '';
  const formattedPhone = formatPhoneNumberForWhatsApp(partyPhone);

  const handleCopy = () => {
    navigator.clipboard.writeText(formattedMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleNativeShare = async () => {
    setSharingNative(true);
    try {
      await shareInvoicePdfNative(api, bill, shop);
    } catch {
      alert('Could not attach PDF file via browser share.');
    } finally {
      setSharingNative(false);
    }
  };

  return (
    <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)', zIndex: 1060 }}>
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
          {/* Modal Header */}
          <div className="modal-header bg-success text-white py-3 px-4">
            <h5 className="modal-title fw-bold d-flex align-items-center gap-2">
              <i className="bi bi-whatsapp fs-4"></i> Share Tax Invoice via WhatsApp
            </h5>
            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
          </div>

          {/* Modal Body */}
          <div className="modal-body p-4 bg-light">
            <div className="row g-4">
              {/* Left Column: Actions */}
              <div className="col-md-5 d-flex flex-column gap-3">
                <div className="p-3 bg-white border rounded-3 shadow-sm">
                  <div className="small text-muted fw-bold text-uppercase mb-2">Recipient Customer</div>
                  <div className="fw-bold fs-6 text-dark mb-1">{bill.party_name}</div>
                  {partyPhone ? (
                    <div className="badge bg-success-subtle text-success-emphasis border border-success-subtle px-2 py-1">
                      <i className="bi bi-telephone-fill me-1"></i> +{formattedPhone}
                    </div>
                  ) : (
                    <div className="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle">
                      <i className="bi bi-exclamation-triangle me-1"></i> No Phone Number Saved
                    </div>
                  )}
                </div>

                <div className="d-flex flex-column gap-2">
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-success btn-lg fw-bold d-flex align-items-center justify-content-center gap-2 shadow-sm py-2.5"
                  >
                    <i className="bi bi-whatsapp fs-5"></i>
                    <span>{partyPhone ? `Send to +${formattedPhone}` : 'Open WhatsApp Share'}</span>
                  </a>

                  <button
                    type="button"
                    className="btn btn-dark fw-bold d-flex align-items-center justify-content-center gap-2 py-2.5"
                    onClick={handleNativeShare}
                    disabled={sharingNative}
                  >
                    {sharingNative ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-1"></span> Preparing PDF...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-paperclip fs-5"></i> Attach PDF Document & Share
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    className={`btn ${copied ? 'btn-outline-success' : 'btn-outline-secondary'} fw-semibold py-2`}
                    onClick={handleCopy}
                  >
                    <i className={`bi ${copied ? 'bi-check-lg' : 'bi-clipboard'} me-1`}></i>
                    {copied ? 'Message Copied!' : 'Copy Formatted Text'}
                  </button>
                </div>
              </div>

              {/* Right Column: Live Message Preview */}
              <div className="col-md-7">
                <div className="small text-muted fw-bold text-uppercase mb-2">WhatsApp Message Preview</div>
                <div
                  className="p-3 border rounded-3 bg-white font-monospace text-dark shadow-inner overflow-auto"
                  style={{
                    maxHeight: '300px',
                    fontSize: '0.82rem',
                    whiteSpace: 'pre-wrap',
                    lineHeight: '1.45',
                    backgroundColor: '#efeae2', // WhatsApp chat background color tint
                    borderColor: '#cbd5e1'
                  }}
                >
                  {formattedMessage}
                </div>
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="modal-footer bg-white border-top py-2 px-4 justify-content-between">
            <span className="text-muted small">
              <i className="bi bi-shield-check text-success me-1"></i> Includes direct PDF download link
            </span>
            <button type="button" className="btn btn-secondary btn-sm px-4" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
