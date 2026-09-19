import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const GST_SLABS = [0, 5, 12, 18, 28];
const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana',
  'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi', 'Chandigarh',
  'Jammu & Kashmir', 'Ladakh'
];

let lineKey = 0;

function CatalogItemPicker({ line, items, onSelect, onChangeName }) {
  const [open, setOpen] = useState(false);

  const filteredItems = items.filter((it) =>
    it.name.toLowerCase().includes((line.name || '').toLowerCase())
  );

  return (
    <div
      className="position-relative"
      onFocus={() => setOpen(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) {
          setOpen(false);
        }
      }}
    >
      <div className="input-group input-group-sm">
        <input
          type="text"
          className="form-control form-control-sm"
          placeholder="Type or select item from catalog..."
          value={line.name}
          onChange={(e) => {
            onChangeName(e.target.value);
            setOpen(true);
          }}
        />
        <button
          tabIndex="-1"
          type="button"
          className="btn btn-outline-secondary px-2"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => setOpen((prev) => !prev)}
        >
          <i className={`bi bi-chevron-${open ? 'up' : 'down'}`}></i>
        </button>
      </div>

      {open && filteredItems.length > 0 && (
        <div
          className="position-absolute start-0 bg-white border rounded-3 shadow-lg overflow-auto py-1"
          style={{
            zIndex: 1050,
            maxHeight: '240px',
            top: '100%',
            left: 0,
            minWidth: '320px',
            marginTop: '4px'
          }}
        >
          {filteredItems.map((it) => (
            <div
              key={it.id}
              className="px-3 py-2 border-bottom text-start cursor-pointer hover-bg-light"
              style={{ transition: 'background 0.15s' }}
              onMouseDown={(e) => {
                e.preventDefault();
                onSelect(it);
                setOpen(false);
              }}
            >
              <div className="fw-bold text-dark small">{it.name}</div>
              <div className="d-flex align-items-center gap-2 mt-1" style={{ fontSize: '0.75rem' }}>
                <span className="text-primary fw-semibold">₹{Number(it.price).toFixed(2)}</span>
                <span className="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle py-0.5">
                  {Number(it.gst_percent)}% GST
                </span>
                {it.hsn_code && (
                  <span className="text-muted font-monospace">HSN: {it.hsn_code}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function CreateBill() {
  const navigate = useNavigate();
  const [shop, setShop] = useState({ state: 'Gujarat', shop_name: '' });
  const [parties, setParties] = useState([]);
  const [items, setItems] = useState([]);
  const [partyId, setPartyId] = useState('');
  const [discount, setDiscount] = useState(0);
  const [status, setStatus] = useState('Unpaid');
  const [notes, setNotes] = useState('');
  const [lines, setLines] = useState([]);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  // Quick Add Party Modal
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [quickForm, setQuickForm] = useState({ name: '', mobile: '', state: 'Gujarat', address: '', gstin: '', email: '' });
  const [quickError, setQuickError] = useState('');

  const loadData = async () => {
    try {
      const [shopRes, partyRes, itemRes] = await Promise.all([
        api.get('/shop'),
        api.get('/parties'),
        api.get('/items')
      ]);
      setShop(shopRes.data);
      setParties(partyRes.data);
      setItems(itemRes.data);
      if (quickForm.state !== shopRes.data.state) {
        setQuickForm((prev) => ({ ...prev, state: shopRes.data.state }));
      }
    } catch {
      setError('Failed to initialize billing data.');
    }
  };

  useEffect(() => {
    loadData();
    // Start with 1 default line
    setLines([{ key: lineKey++, itemId: '', name: '', hsnCode: '', rate: '', qty: 1, gstPercent: 18 }]);
  }, []);

  const selectedParty = parties.find((p) => String(p.id) === String(partyId));
  const shopState = shop.state || 'Gujarat';
  const sameState = selectedParty && selectedParty.state.trim().toLowerCase() === shopState.trim().toLowerCase();

  const addLine = () => {
    setLines([...lines, { key: lineKey++, itemId: '', name: '', hsnCode: '', rate: '', qty: 1, gstPercent: 18 }]);
  };

  const updateLine = (key, field, value) => {
    setLines(lines.map((l) => {
      if (l.key !== key) return l;
      if (field === 'itemId') {
        const chosen = items.find((it) => String(it.id) === String(value));
        return chosen
          ? { ...l, itemId: value, name: chosen.name, hsnCode: chosen.hsn_code || '', rate: chosen.price, gstPercent: chosen.gst_percent }
          : { ...l, itemId: value };
      }
      return { ...l, [field]: value };
    }));
  };

  const removeLine = (key) => setLines(lines.filter((l) => l.key !== key));

  const computeLine = (l) => {
    const rate = Number(l.rate) || 0;
    const qty = Number(l.qty) || 0;
    const gstPercent = Number(l.gstPercent) || 0;
    const taxableAmt = Math.round((rate * qty + Number.EPSILON) * 100) / 100;
    let cgst = 0, sgst = 0, igst = 0;
    if (sameState) {
      cgst = Math.round(((taxableAmt * (gstPercent / 2)) / 100 + Number.EPSILON) * 100) / 100;
      sgst = Math.round(((taxableAmt * (gstPercent / 2)) / 100 + Number.EPSILON) * 100) / 100;
    } else {
      igst = Math.round(((taxableAmt * gstPercent) / 100 + Number.EPSILON) * 100) / 100;
    }
    const lineTotal = Math.round((taxableAmt + cgst + sgst + igst + Number.EPSILON) * 100) / 100;
    return { taxableAmt, cgst, sgst, igst, lineTotal };
  };

  const subtotal = lines.reduce((s, l) => s + computeLine(l).taxableAmt, 0);
  const totalCgst = lines.reduce((s, l) => s + computeLine(l).cgst, 0);
  const totalSgst = lines.reduce((s, l) => s + computeLine(l).sgst, 0);
  const totalIgst = lines.reduce((s, l) => s + computeLine(l).igst, 0);
  const totalTax = totalCgst + totalSgst + totalIgst;
  const grandTotal = Math.max(0, subtotal + totalTax - Number(discount));

  const handleQuickAddPartySubmit = async (e) => {
    e.preventDefault();
    setQuickError('');
    try {
      const res = await api.post('/parties', quickForm);
      setParties([...parties, res.data]);
      setPartyId(res.data.id);
      setShowQuickAdd(false);
      setQuickForm({ name: '', mobile: '', state: shopState, address: '', gstin: '', email: '' });
    } catch (err) {
      setQuickError(err.response?.data?.error || 'Failed to add party');
    }
  };

  const handleSubmit = async () => {
    setError('');
    if (!partyId) return setError('Please select a customer / party for this bill');
    if (lines.length === 0) return setError('Please add at least one line item');
    for (const l of lines) {
      if (!l.name || !l.rate || !l.qty) return setError('Every item row requires a name, rate, and quantity');
    }
    setSaving(true);
    try {
      const payload = {
        partyId: Number(partyId),
        discount: Number(discount),
        status,
        notes,
        items: lines.map((l) => ({
          itemId: l.itemId || null,
          name: l.name,
          hsnCode: l.hsnCode,
          rate: Number(l.rate),
          qty: Number(l.qty),
          gstPercent: Number(l.gstPercent),
        })),
      };
      const res = await api.post('/bills', payload);
      navigate(`/bills/${res.data.id}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save bill');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="mb-0 fw-bold"><i className="bi bi-file-earmark-plus me-2 text-primary"></i>Create New GST Invoice</h4>
        <span className="badge bg-dark px-3 py-2">
          Shop Location: {shopState}
        </span>
      </div>

      {error && <div className="alert alert-danger shadow-sm">{error}</div>}

      {/* Party Selection Card */}
      <div className="card shadow-sm mb-4">
        <div className="card-header bg-light d-flex justify-content-between align-items-center">
          <span className="fw-bold"><i className="bi bi-person me-2"></i>Customer / Party Selection</span>
          <button type="button" className="btn btn-sm btn-primary" onClick={() => setShowQuickAdd(true)}>
            <i className="bi bi-person-plus me-1"></i> Quick Add New Party
          </button>
        </div>
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label fw-semibold">Select Customer / Party *</label>
              <select className="form-select" value={partyId} onChange={(e) => setPartyId(e.target.value)}>
                <option value="">-- Choose Party --</option>
                {parties.map((p) => (
                  <option key={p.id} value={p.id}>{p.name} ({p.mobile}) - {p.state}</option>
                ))}
              </select>
            </div>
            <div className="col-md-6">
              {selectedParty ? (
                <div className="p-3 bg-light rounded border">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <strong className="fs-6">{selectedParty.name}</strong>
                    <span className={`badge ${sameState ? 'bg-success' : 'bg-warning text-dark'}`}>
                      {sameState ? 'Same State (CGST + SGST)' : 'Inter-State (IGST)'}
                    </span>
                  </div>
                  <div className="text-muted small">
                    <div>State: {selectedParty.state} | Mobile: {selectedParty.mobile}</div>
                    {selectedParty.gstin && <div>GSTIN: <code>{selectedParty.gstin}</code></div>}
                    {selectedParty.address && <div>Address: {selectedParty.address}</div>}
                  </div>
                </div>
              ) : (
                <div className="text-muted small p-3 bg-light rounded border text-center">
                  Select a party to automatically evaluate tax rules (Intrastate vs Interstate).
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Line Items Table Card */}
      <div className="card shadow-sm mb-4" style={{ overflow: 'visible' }}>
        <div className="card-header bg-light d-flex justify-content-between align-items-center">
          <span className="fw-bold"><i className="bi bi-cart3 me-2"></i>Invoice Line Items</span>
          <button className="btn btn-sm btn-success" onClick={addLine}>
            <i className="bi bi-plus-lg me-1"></i> Add Line Item
          </button>
        </div>
        <div className="table-responsive" style={{ overflow: 'visible' }}>
          <table className="table table-bordered mb-0 align-middle">
            <thead className="table-secondary">
              <tr>
                <th style={{ minWidth: 220 }}>Item Name / Pick Catalog</th>
                <th style={{ width: 110 }}>HSN Code</th>
                <th style={{ width: 120 }}>Rate (₹)</th>
                <th style={{ width: 90 }}>Qty</th>
                <th style={{ width: 110 }}>GST %</th>
                <th className="text-end" style={{ width: 120 }}>Taxable</th>
                <th className="text-end" style={{ width: 120 }}>
                  {sameState ? 'CGST+SGST' : 'IGST'}
                </th>
                <th className="text-end" style={{ width: 130 }}>Line Total</th>
                <th style={{ width: 50 }}></th>
              </tr>
            </thead>
            <tbody>
              {lines.map((l) => {
                const c = computeLine(l);
                return (
                  <tr key={l.key}>
                    <td>
                      <CatalogItemPicker
                        line={l}
                        items={items}
                        onSelect={(chosen) => {
                          setLines(lines.map((line) => line.key === l.key ? {
                            ...line,
                            itemId: chosen.id,
                            name: chosen.name,
                            hsnCode: chosen.hsn_code || '',
                            rate: chosen.price,
                            gstPercent: chosen.gst_percent
                          } : line));
                        }}
                        onChangeName={(newName) => updateLine(l.key, 'name', newName)}
                      />
                    </td>
                    <td>
                      <input
                        className="form-control form-control-sm"
                        placeholder="HSN"
                        value={l.hsnCode}
                        onChange={(e) => updateLine(l.key, 'hsnCode', e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        step="0.01"
                        className="form-control form-control-sm"
                        value={l.rate}
                        onChange={(e) => updateLine(l.key, 'rate', e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        step="1"
                        min="1"
                        className="form-control form-control-sm"
                        value={l.qty}
                        onChange={(e) => updateLine(l.key, 'qty', e.target.value)}
                      />
                    </td>
                    <td>
                      <select
                        className="form-select form-select-sm"
                        value={l.gstPercent}
                        onChange={(e) => updateLine(l.key, 'gstPercent', e.target.value)}
                      >
                        {GST_SLABS.map((g) => <option key={g} value={g}>{g}%</option>)}
                      </select>
                    </td>
                    <td className="text-end fw-semibold">₹{c.taxableAmt.toFixed(2)}</td>
                    <td className="text-end small">
                      {sameState ? (
                        <div>
                          <div>C: ₹{c.cgst.toFixed(2)}</div>
                          <div>S: ₹{c.sgst.toFixed(2)}</div>
                        </div>
                      ) : (
                        <div>I: ₹{c.igst.toFixed(2)}</div>
                      )}
                    </td>
                    <td className="text-end fw-bold text-primary">₹{c.lineTotal.toFixed(2)}</td>
                    <td className="text-center">
                      {lines.length > 1 && (
                        <button className="text-danger fs-5 border-0 bg-transparent p-1" onClick={() => removeLine(l.key)} title="Remove Line">
                          <i className="bi bi-trash3"></i>
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary & Controls */}
      <div className="row g-4 mb-4">
        <div className="col-md-6">
          <div className="card shadow-sm h-100">
            <div className="card-header bg-light fw-bold">Additional Invoice Details</div>
            <div className="card-body">
              <div className="mb-3">
                <label className="form-label fw-semibold">Payment Status</label>
                <select className="form-select" value={status} onChange={(e) => setStatus(e.target.value)}>
                  <option value="Unpaid">Unpaid</option>
                  <option value="Paid">Paid</option>
                  <option value="Partial">Partial</option>
                </select>
              </div>
              <div className="mb-2">
                <label className="form-label fw-semibold">Notes / Terms</label>
                <textarea
                  className="form-control"
                  rows="3"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Optional payment terms or delivery notes..."
                ></textarea>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card shadow-sm border-primary">
            <div className="card-header bg-dark text-white fw-bold">Tax Summary & Total</div>
            <div className="card-body">
              <div className="d-flex justify-content-between mb-2">
                <span>Subtotal (Taxable Amount)</span>
                <span className="fw-semibold">₹{subtotal.toFixed(2)}</span>
              </div>

              {sameState ? (
                <>
                  <div className="d-flex justify-content-between mb-1 text-muted small">
                    <span>Central Tax (CGST)</span>
                    <span>₹{totalCgst.toFixed(2)}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2 text-muted small">
                    <span>State Tax (SGST)</span>
                    <span>₹{totalSgst.toFixed(2)}</span>
                  </div>
                </>
              ) : (
                <div className="d-flex justify-content-between mb-2 text-muted small">
                  <span>Integrated Tax (IGST)</span>
                  <span>₹{totalIgst.toFixed(2)}</span>
                </div>
              )}

              <div className="d-flex justify-content-between mb-2 pb-2 border-bottom">
                <span className="fw-semibold">Total Tax Amount</span>
                <span className="fw-semibold text-danger">₹{totalTax.toFixed(2)}</span>
              </div>

              <div className="d-flex justify-content-between align-items-center mb-3">
                <label className="form-label mb-0 fw-semibold">Discount (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  className="form-control form-control-sm text-end w-50"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                />
              </div>

              <div className="d-flex justify-content-between align-items-center bg-light p-3 rounded">
                <span className="fs-5 fw-bold">Grand Total</span>
                <span className="fs-4 fw-bold text-success">₹{grandTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="d-flex justify-content-end mb-5">
        <button className="btn btn-success btn-lg px-5 shadow" onClick={handleSubmit} disabled={saving}>
          {saving ? (
            <>
              <span className="spinner-border spinner-border-sm me-2"></span>
              Generating Bill...
            </>
          ) : (
            <>
              <i className="bi bi-printer me-2"></i>
              Save & Generate Invoice
            </>
          )}
        </button>
      </div>

      {/* Quick Add Party Modal */}
      {showQuickAdd && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title"><i className="bi bi-person-plus me-2"></i>Quick Add Party</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowQuickAdd(false)}></button>
              </div>
              <form onSubmit={handleQuickAddPartySubmit}>
                <div className="modal-body">
                  {quickError && <div className="alert alert-danger py-2">{quickError}</div>}
                  <div className="mb-2">
                    <label className="form-label fw-semibold">Name *</label>
                    <input className="form-control" value={quickForm.name} onChange={(e) => setQuickForm({ ...quickForm, name: e.target.value })} required />
                  </div>
                  <div className="mb-2">
                    <label className="form-label fw-semibold">Mobile *</label>
                    <input className="form-control" value={quickForm.mobile} onChange={(e) => setQuickForm({ ...quickForm, mobile: e.target.value })} required />
                  </div>
                  <div className="mb-2">
                    <label className="form-label fw-semibold">State *</label>
                    <select className="form-select" value={quickForm.state} onChange={(e) => setQuickForm({ ...quickForm, state: e.target.value })} required>
                      {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="mb-2">
                    <label className="form-label fw-semibold">GSTIN (Optional)</label>
                    <input className="form-control text-uppercase" value={quickForm.gstin} onChange={(e) => setQuickForm({ ...quickForm, gstin: e.target.value })} />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowQuickAdd(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Save Party & Use</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
