export default function DeleteConfirmModal({
  show,
  title = 'Confirm Delete',
  message = 'Are you sure you want to delete this record?',
  itemName,
  onConfirm,
  onCancel,
  loading = false,
  confirmBtnText = 'Yes, Delete',
}) {
  if (!show) return null;

  return (
    <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1070 }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
          <div className="modal-header bg-danger text-white py-3">
            <h5 className="modal-title fw-bold">
              <i className="bi bi-exclamation-triangle-fill me-2"></i>
              {title}
            </h5>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={onCancel}
              disabled={loading}
              aria-label="Close"
            ></button>
          </div>

          <div className="modal-body p-4 text-center">
            <div className="mb-3 text-danger">
              <i className="bi bi-trash3-fill" style={{ fontSize: '3rem' }}></i>
            </div>
            <h5 className="fw-bold text-dark mb-2">{message}</h5>
            {itemName && (
              <div className="p-2.5 bg-light rounded border text-dark fw-bold mb-3 small">
                "{itemName}"
              </div>
            )}
            <p className="text-muted small mb-0">
              This action will permanently delete this record from the database.
            </p>
          </div>

          <div className="modal-footer bg-light p-3 d-flex gap-2">
            <button
              type="button"
              className="btn btn-secondary flex-grow-1 fw-bold rounded-pill"
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-danger flex-grow-1 fw-bold shadow-sm rounded-pill"
              onClick={onConfirm}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  Deleting...
                </>
              ) : (
                <>
                  <i className="bi bi-trash3 me-1"></i> {confirmBtnText}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
