import React from "react";
import "../styles/InventoryReport.css";

const escapeHtml = (value) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const getQuantity = (value) => Number(value) || 0;

const InventoryReport = ({
  inventory = [],
  transactions = [],
  returnedLogs = [],
  isAdmin = false,
  onClose,
}) => {
  const totalItems = inventory.length;
  const totalQuantity = inventory.reduce((sum, item) => sum + getQuantity(item.quantity), 0);
  const uniqueCategories = new Set(inventory.map((item) => item.category).filter(Boolean)).size;
  const pendingRequests = transactions.filter((tx) => tx.quantityChanged === 0);
  const activeIssues = transactions.filter((tx) => tx.quantityChanged < 0);
  const returnedEntries = returnedLogs.filter((tx) => tx.quantityChanged > 0);
  const lowStockItems = inventory.filter((item) => getQuantity(item.quantity) > 0 && getQuantity(item.quantity) <= 3);
  const emptyStockItems = inventory.filter((item) => getQuantity(item.quantity) === 0);

  const categoryMap = inventory.reduce((accumulator, item) => {
    const category = item.category || "Uncategorized";
    if (!accumulator[category]) {
      accumulator[category] = { count: 0, quantity: 0 };
    }
    accumulator[category].count += 1;
    accumulator[category].quantity += getQuantity(item.quantity);
    return accumulator;
  }, {});

  const categoryRows = Object.entries(categoryMap)
    .sort((first, second) => second[1].quantity - first[1].quantity)
    .map(([category, metrics]) => {
      return `
        <tr>
          <td><strong>${escapeHtml(category)}</strong></td>
          <td class="ir-text-right">${metrics.count}</td>
          <td class="ir-text-right">${metrics.quantity}</td>
        </tr>
      `;
    })
    .join("");

  const inventoryRows = inventory
    .map((item, index) => {
      const stockClass = getQuantity(item.quantity) === 0 ? "ir-chip-danger" : getQuantity(item.quantity) <= 3 ? "ir-chip-warn" : "ir-chip-good";
      return `
        <tr>
          <td class="ir-text-right">${index + 1}</td>
          <td><strong>${escapeHtml(item.name)}</strong></td>
          <td>${escapeHtml(item.category || "Uncategorized")}</td>
          <td><span class="ir-chip ${stockClass}">${escapeHtml(item.condition || "Good")}</span></td>
          <td class="ir-text-right">${getQuantity(item.quantity)}</td>
          <td>${escapeHtml(formatDate(item.createdAt))}</td>
          <td>${escapeHtml(formatDate(item.updatedAt))}</td>
        </tr>
      `;
    })
    .join("");

  const pendingRows = pendingRequests
    .map((tx, index) => {
      return `
        <tr>
          <td class="ir-text-right">${index + 1}</td>
          <td>${escapeHtml(tx.inventoryItemId)}</td>
          <td>${escapeHtml(tx.issuedToUserId || "Pending")}</td>
          <td>${escapeHtml(tx.comment || "Request")}</td>
          <td>${escapeHtml(formatDate(tx.timestamp))}</td>
        </tr>
      `;
    })
    .join("");

  const activeRows = activeIssues
    .map((tx, index) => {
      return `
        <tr>
          <td class="ir-text-right">${index + 1}</td>
          <td>${escapeHtml(tx.inventoryItemId)}</td>
          <td>${escapeHtml(tx.issuedToUserId || "N/A")}</td>
          <td>${escapeHtml(tx.quantityChanged)}</td>
          <td>${escapeHtml(tx.comment || "Issued asset")}</td>
          <td>${escapeHtml(formatDate(tx.timestamp))}</td>
        </tr>
      `;
    })
    .join("");

  const returnedRows = returnedEntries
    .map((tx, index) => {
      return `
        <tr>
          <td class="ir-text-right">${index + 1}</td>
          <td>${escapeHtml(tx.inventoryItemId)}</td>
          <td>${escapeHtml(tx.quantityChanged)}</td>
          <td>${escapeHtml(tx.comment || "Returned asset")}</td>
          <td>${escapeHtml(formatDate(tx.timestamp))}</td>
        </tr>
      `;
    })
    .join("");

  const buildPrintHTML = () => `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Inventory Report</title>
<style>
  * { box-sizing: border-box; }
  body { margin: 0; font-family: 'Inter', 'Segoe UI', Arial, sans-serif; color: #102033; background: #ffffff; }
  @page { size: A4; margin: 14mm; }
  .ir-print-page { padding: 0; }
  .ir-print-header { background: #102033; color: #fff; padding: 28px 28px 22px; }
  .ir-print-kicker { color: #7dd3fc; text-transform: uppercase; letter-spacing: 1.8px; font-size: 11px; font-weight: 800; margin-bottom: 8px; }
  .ir-print-title { font-size: 28px; font-weight: 800; margin: 0 0 6px; }
  .ir-print-subtitle { color: #bfd6ea; font-size: 13px; margin: 0; }
  .ir-print-meta { display: flex; gap: 18px; flex-wrap: wrap; margin-top: 18px; font-size: 12px; color: #dbeafe; }
  .ir-print-strip { background: #eaf2f8; border-bottom: 1px solid #d6e1ea; padding: 12px 28px; display: flex; gap: 18px; flex-wrap: wrap; font-size: 12px; color: #334155; }
  .ir-print-strip strong { color: #102033; }
  .ir-print-section { padding: 18px 28px 0; }
  .ir-print-section-title { font-size: 12px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase; color: #102033; border-bottom: 2px solid #102033; padding-bottom: 6px; margin-bottom: 14px; }
  .ir-print-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
  .ir-print-stat { border: 1px solid #dbe4ec; border-top: 3px solid #102033; border-radius: 8px; padding: 12px 10px; background: #f8fbfd; text-align: center; }
  .ir-print-stat-num { font-size: 24px; font-weight: 800; color: #102033; line-height: 1; }
  .ir-print-stat-lbl { margin-top: 5px; font-size: 10px; text-transform: uppercase; letter-spacing: 0.7px; color: #516274; font-weight: 700; }
  .ir-print-table { width: 100%; border-collapse: collapse; font-size: 11px; }
  .ir-print-table thead th { background: #102033; color: #fff; padding: 9px 10px; text-align: left; font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; }
  .ir-print-table tbody td { border-bottom: 1px solid #e5ecf2; padding: 8px 10px; vertical-align: top; }
  .ir-print-table tbody tr:nth-child(even) { background: #f8fbfd; }
  .ir-text-right { text-align: right; }
  .ir-chip { display: inline-block; padding: 2px 9px; border-radius: 999px; font-size: 10px; font-weight: 700; }
  .ir-chip-good { background: #dcfce7; color: #15803d; }
  .ir-chip-warn { background: #fef3c7; color: #b45309; }
  .ir-chip-danger { background: #fee2e2; color: #b91c1c; }
  .ir-print-footer { margin: 20px 28px 0; padding-top: 10px; border-top: 2px solid #102033; font-size: 10px; color: #5b6876; display: flex; justify-content: space-between; gap: 12px; }
</style>
</head>
<body>
  <div class="ir-print-page">
    <div class="ir-print-header">
      <div class="ir-print-kicker">Inventory Report</div>
      <h1 class="ir-print-title">Inventory Management Summary</h1>
      <p class="ir-print-subtitle">Current stock, active issues, and request history.</p>
      <div class="ir-print-meta">
        <span>Generated: ${escapeHtml(new Date().toLocaleString())}</span>
        <span>Access: ${isAdmin ? "Admin" : "User"}</span>
      </div>
    </div>

    <div class="ir-print-strip">
      <div><strong>Items:</strong> ${totalItems}</div>
      <div><strong>Total Quantity:</strong> ${totalQuantity}</div>
      <div><strong>Categories:</strong> ${uniqueCategories}</div>
      <div><strong>Pending Requests:</strong> ${pendingRequests.length}</div>
      <div><strong>Active Issues:</strong> ${activeIssues.length}</div>
      <div><strong>Returned Entries:</strong> ${returnedEntries.length}</div>
    </div>

    <div class="ir-print-section">
      <div class="ir-print-section-title">Overview</div>
      <div class="ir-print-stats">
        <div class="ir-print-stat"><div class="ir-print-stat-num">${totalItems}</div><div class="ir-print-stat-lbl">Inventory Items</div></div>
        <div class="ir-print-stat"><div class="ir-print-stat-num">${totalQuantity}</div><div class="ir-print-stat-lbl">Units in Stock</div></div>
        <div class="ir-print-stat"><div class="ir-print-stat-num">${lowStockItems.length}</div><div class="ir-print-stat-lbl">Low Stock Items</div></div>
        <div class="ir-print-stat"><div class="ir-print-stat-num">${emptyStockItems.length}</div><div class="ir-print-stat-lbl">Out of Stock</div></div>
      </div>
    </div>

    <div class="ir-print-section">
      <div class="ir-print-section-title">Inventory by Category</div>
      <table class="ir-print-table">
        <thead><tr><th>Category</th><th class="ir-text-right">Items</th><th class="ir-text-right">Quantity</th></tr></thead>
        <tbody>${categoryRows || `<tr><td colspan="3">No inventory data available.</td></tr>`}</tbody>
      </table>
    </div>

    <div class="ir-print-section">
      <div class="ir-print-section-title">Current Inventory</div>
      <table class="ir-print-table">
        <thead>
          <tr>
            <th class="ir-text-right">#</th>
            <th>Item</th>
            <th>Category</th>
            <th>Condition</th>
            <th class="ir-text-right">Qty</th>
            <th>Created</th>
            <th>Updated</th>
          </tr>
        </thead>
        <tbody>${inventoryRows || `<tr><td colspan="7">No inventory data available.</td></tr>`}</tbody>
      </table>
    </div>

    <div class="ir-print-section">
      <div class="ir-print-section-title">Pending Requests</div>
      <table class="ir-print-table">
        <thead>
          <tr>
            <th class="ir-text-right">#</th>
            <th>Item ID</th>
            <th>Requested By</th>
            <th>Comment</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>${pendingRows || `<tr><td colspan="5">No pending requests.</td></tr>`}</tbody>
      </table>
    </div>

    <div class="ir-print-section">
      <div class="ir-print-section-title">Active Issued Assets</div>
      <table class="ir-print-table">
        <thead>
          <tr>
            <th class="ir-text-right">#</th>
            <th>Item ID</th>
            <th>Issued To</th>
            <th>Qty</th>
            <th>Comment</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>${activeRows || `<tr><td colspan="6">No active issued assets.</td></tr>`}</tbody>
      </table>
    </div>

    <div class="ir-print-section">
      <div class="ir-print-section-title">Returned History</div>
      <table class="ir-print-table">
        <thead>
          <tr>
            <th class="ir-text-right">#</th>
            <th>Item ID</th>
            <th>Qty</th>
            <th>Comment</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>${returnedRows || `<tr><td colspan="5">No returned items yet.</td></tr>`}</tbody>
      </table>
    </div>

    <div class="ir-print-footer">
      <span>Generated from the Tournament Management System.</span>
      <span>Page 1</span>
    </div>
  </div>
</body>
</html>`;

  const handlePrint = () => {
    const printWindow = window.open("", "_blank", "width=1200,height=900");
    if (!printWindow) return;
    printWindow.document.open();
    printWindow.document.write(buildPrintHTML());
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  return (
    <div className="ir-overlay" role="dialog" aria-modal="true" aria-label="Inventory report">
      <div className="ir-modal">
        <div className="ir-toolbar">
          <div className="ir-toolbar-left">
            <div className="ir-toolbar-icon">▣</div>
            <div>
              <div className="ir-toolbar-title">Inventory Report</div>
              <div className="ir-toolbar-subtitle">Printable snapshot of stock and movements</div>
            </div>
          </div>
          <div className="ir-toolbar-right">
            <button className="ir-print-btn" onClick={handlePrint}>Print Report</button>
            <button className="ir-close-btn" onClick={onClose} aria-label="Close inventory report">✕</button>
          </div>
        </div>

        <div className="ir-body">
          <div className="ir-hdr">
            <div>
              <div className="ir-hdr-badge">Official Inventory Report</div>
              <div className="ir-hdr-title">Inventory Management Summary</div>
              <div className="ir-hdr-sub">A consolidated view of stock, requests, issues, and returns.</div>
            </div>
            <div className="ir-hdr-right">
              <div className="ir-hdr-meta-label">Generated</div>
              <div className="ir-hdr-meta-value">{new Date().toLocaleString()}</div>
              <div className="ir-hdr-meta-label" style={{ marginTop: "12px" }}>Access</div>
              <div className="ir-hdr-meta-value">{isAdmin ? "Admin" : "User"}</div>
            </div>
          </div>

          <div className="ir-info-strip">
            <div className="ir-info-item"><strong>Items:</strong> {totalItems}</div>
            <div className="ir-info-item"><strong>Total Qty:</strong> {totalQuantity}</div>
            <div className="ir-info-item"><strong>Categories:</strong> {uniqueCategories}</div>
            <div className="ir-info-item"><strong>Pending:</strong> {pendingRequests.length}</div>
            <div className="ir-info-item"><strong>Issued:</strong> {activeIssues.length}</div>
            <div className="ir-info-item"><strong>Returned:</strong> {returnedEntries.length}</div>
          </div>

          <div className="ir-section">
            <div className="ir-section-title">Overview</div>
            <div className="ir-stats-row">
              <div className="ir-stat ir-stat-blue">
                <div className="ir-stat-num">{totalItems}</div>
                <div className="ir-stat-lbl">Inventory Items</div>
              </div>
              <div className="ir-stat ir-stat-teal">
                <div className="ir-stat-num">{totalQuantity}</div>
                <div className="ir-stat-lbl">Units in Stock</div>
              </div>
              <div className="ir-stat ir-stat-amber">
                <div className="ir-stat-num">{lowStockItems.length}</div>
                <div className="ir-stat-lbl">Low Stock</div>
              </div>
              <div className="ir-stat ir-stat-red">
                <div className="ir-stat-num">{emptyStockItems.length}</div>
                <div className="ir-stat-lbl">Out of Stock</div>
              </div>
            </div>
          </div>

          <div className="ir-section">
            <div className="ir-section-title">Category Snapshot</div>
            {Object.keys(categoryMap).length === 0 ? (
              <div className="ir-empty">No inventory data available.</div>
            ) : (
              <div className="ir-chip-grid">
                {Object.entries(categoryMap)
                  .sort((first, second) => second[1].quantity - first[1].quantity)
                  .map(([category, metrics]) => (
                    <div className="ir-category-chip" key={category}>
                      <span className="ir-category-name">{category}</span>
                      <span className="ir-category-meta">{metrics.count} items</span>
                      <span className="ir-category-meta">{metrics.quantity} qty</span>
                    </div>
                  ))}
              </div>
            )}
          </div>

          <div className="ir-section">
            <div className="ir-section-title">Current Inventory</div>
            <div className="ir-table-wrap">
              <table className="ir-table">
                <thead>
                  <tr>
                    <th className="ir-text-right">#</th>
                    <th>Item</th>
                    <th>Category</th>
                    <th>Condition</th>
                    <th className="ir-text-right">Qty</th>
                    <th>Created</th>
                    <th>Updated</th>
                  </tr>
                </thead>
                <tbody>
                  {inventory.length === 0 ? (
                    <tr><td colSpan="7" className="ir-empty-row">No inventory data available.</td></tr>
                  ) : (
                    inventory.map((item, index) => {
                      const stockClass = getQuantity(item.quantity) === 0 ? "ir-chip-danger" : getQuantity(item.quantity) <= 3 ? "ir-chip-warn" : "ir-chip-good";
                      return (
                        <tr key={item.id}>
                          <td className="ir-text-right">{index + 1}</td>
                          <td><strong>{item.name}</strong></td>
                          <td>{item.category || "Uncategorized"}</td>
                          <td><span className={`ir-chip ${stockClass}`}>{item.condition || "Good"}</span></td>
                          <td className="ir-text-right">{getQuantity(item.quantity)}</td>
                          <td>{formatDate(item.createdAt)}</td>
                          <td>{formatDate(item.updatedAt)}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="ir-section">
            <div className="ir-section-title">Pending Requests</div>
            <div className="ir-table-wrap">
              <table className="ir-table">
                <thead>
                  <tr>
                    <th className="ir-text-right">#</th>
                    <th>Item ID</th>
                    <th>Requested By</th>
                    <th>Comment</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingRequests.length === 0 ? (
                    <tr><td colSpan="5" className="ir-empty-row">No pending requests.</td></tr>
                  ) : (
                    pendingRequests.map((tx, index) => (
                      <tr key={tx.id}>
                        <td className="ir-text-right">{index + 1}</td>
                        <td>{tx.inventoryItemId}</td>
                        <td>{tx.issuedToUserId || "Pending"}</td>
                        <td>{tx.comment || "Request"}</td>
                        <td>{formatDate(tx.timestamp)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="ir-section">
            <div className="ir-section-title">Active Issued Assets</div>
            <div className="ir-table-wrap">
              <table className="ir-table">
                <thead>
                  <tr>
                    <th className="ir-text-right">#</th>
                    <th>Item ID</th>
                    <th>Issued To</th>
                    <th>Qty</th>
                    <th>Comment</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {activeIssues.length === 0 ? (
                    <tr><td colSpan="6" className="ir-empty-row">No active issued assets.</td></tr>
                  ) : (
                    activeIssues.map((tx, index) => (
                      <tr key={tx.id}>
                        <td className="ir-text-right">{index + 1}</td>
                        <td>{tx.inventoryItemId}</td>
                        <td>{tx.issuedToUserId || "N/A"}</td>
                        <td>{tx.quantityChanged}</td>
                        <td>{tx.comment || "Issued asset"}</td>
                        <td>{formatDate(tx.timestamp)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="ir-section">
            <div className="ir-section-title">Returned History</div>
            <div className="ir-table-wrap">
              <table className="ir-table">
                <thead>
                  <tr>
                    <th className="ir-text-right">#</th>
                    <th>Item ID</th>
                    <th>Qty</th>
                    <th>Comment</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {returnedEntries.length === 0 ? (
                    <tr><td colSpan="5" className="ir-empty-row">No returned items yet.</td></tr>
                  ) : (
                    returnedEntries.map((tx, index) => (
                      <tr key={tx.id}>
                        <td className="ir-text-right">{index + 1}</td>
                        <td>{tx.inventoryItemId}</td>
                        <td>{tx.quantityChanged}</td>
                        <td>{tx.comment || "Returned asset"}</td>
                        <td>{formatDate(tx.timestamp)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryReport;