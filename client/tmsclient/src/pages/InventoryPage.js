import React, { useEffect, useState } from "react";
import axios from "axios";
import API_BASE_URL from "../config/api";
import { useAuth } from "../contexts/AuthContext";
import InventoryReport from "../components/InventoryReport";
import InnerNavbar from "../components/InnerNavbar";
import { useNavigate } from "react-router-dom";
import "../styles/InventoryPage.css";

function TransactionItem({ tx, fetchUser, onReturn, onApprove, showReturn = true, isAdmin = false }) {
  const [player, setPlayer] = useState(null);
  useEffect(() => {
    if (tx.issuedToUserId) {
      fetchUser(tx.issuedToUserId).then(setPlayer);
    }
  }, [tx.issuedToUserId, fetchUser]);
  
  return (
    <li className="tx-item">
      <div className="tx-body">
        <div className="tx-text">
          <strong>{tx.comment}</strong>
          <div className="tx-meta">
            Item ID: {tx.inventoryItemId} | {tx.quantityChanged === 0 ? "Pending Request" : `Quantity: ${Math.abs(tx.quantityChanged)}`}
          </div>
        </div>
        <div style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
          {isAdmin && tx.quantityChanged === 0 ? (
            <button className="inv-btn-primary" style={{ padding: '6px 14px', fontSize: '0.7rem' }} onClick={() => onApprove(tx)}>PROCEED</button>
          ) : showReturn && tx.quantityChanged < 0 ? (
            <button className="inv-btn-action" onClick={() => onReturn(tx.id)}>RETURN ASSET</button>
          ) : null}
        </div>
      </div>
      {player && (
        <div className="tx-player">
          ASSIGNED TO: <span className="tx-player-badge">{player.username}</span>
        </div>
      )}
    </li>
  );
}

const InventoryPage = ({ isAdmin, userId }) => {
  const auth = useAuth();
  const navigate = useNavigate();
  const [inventory, setInventory] = useState([]);
  const [itemName, setItemName] = useState("");
  const [itemQty, setItemQty] = useState(1);
  const [itemCategory, setItemCategory] = useState("");
  const [itemCondition, setItemCondition] = useState("");
  const [editingCondition, setEditingCondition] = useState("");
  const [inlineEditId, setInlineEditId] = useState(null);
  const [inlineCondition, setInlineCondition] = useState("");
  const [transactions, setTransactions] = useState([]);
  const [issueQty, setIssueQty] = useState(1);
  const [issueComment, setIssueComment] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [playerUsername, setPlayerUsername] = useState("");
  const [userCache, setUserCache] = useState({});
  const [returnedLogs, setReturnedLogs] = useState([]);
  const [issueError, setIssueError] = useState("");
  const [showReport, setShowReport] = useState(false);

  useEffect(() => {
    fetchInventory();
    fetchTransactions();
    fetchReturnedLogs();
  }, []);

  const fetchInventory = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/inventory`, {
        headers: { Authorization: `Bearer ${auth.token}` }
      });
      setInventory(Array.isArray(res.data) ? res.data : []);
    } catch (e) {}
  };

  const fetchTransactions = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/inventory/transactions`, {
        headers: { Authorization: `Bearer ${auth.token}` }
      });
      setTransactions(Array.isArray(res.data) ? res.data : []);
    } catch (e) {}
  };

  const fetchReturnedLogs = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/inventory/returned-transactions`, {
        headers: { Authorization: `Bearer ${auth.token}` }
      });
      setReturnedLogs(Array.isArray(res.data) ? res.data : []);
    } catch (e) {}
  };

  const fetchUser = async (userIdOrUsername) => {
    if (!userIdOrUsername) return null;
    if (userCache[userIdOrUsername]) return userCache[userIdOrUsername];
    try {
      let res;
      if (/^\d+$/.test(userIdOrUsername)) {
        res = await axios.get(`${API_BASE_URL}/inventory/user/${userIdOrUsername}`, {
          headers: { Authorization: `Bearer ${auth.token}` }
        });
      } else {
        res = await axios.get(`${API_BASE_URL}/inventory/user-by-username/${userIdOrUsername}`, {
          headers: { Authorization: `Bearer ${auth.token}` }
        });
      }
      setUserCache(prev => ({ ...prev, [userIdOrUsername]: res.data }));
      return res.data;
    } catch {
      return null;
    }
  };

  const handleAddItem = async () => {
    if (!itemName) return;
    await axios.post(`${API_BASE_URL}/inventory/add`, {
      name: itemName,
      quantity: itemQty,
      category: itemCategory,
      condition: itemCondition,
      description: ""
    }, {
      headers: { Authorization: `Bearer ${auth.token}` }
    });
    setItemName(""); setItemQty(1); setItemCategory(""); setItemCondition("");
    fetchInventory();
  };

  const saveInlineCondition = async (id) => {
    await axios.put(`${API_BASE_URL}/inventory/condition/${id}`, {
      condition: inlineCondition
    }, {
      headers: { Authorization: `Bearer ${auth.token}` }
    });
    setInlineEditId(null);
    fetchInventory();
  };

  const handleDeleteItem = async (itemId) => {
    if (!window.confirm("Delete this asset?")) return;
    await axios.delete(`${API_BASE_URL}/inventory/delete/${itemId}`, {
      headers: { Authorization: `Bearer ${auth.token}` }
    });
    if (selectedItem?.id === itemId) setSelectedItem(null);
    fetchInventory();
  };

  const handleReturnTransaction = async (txId) => {
    await axios.post(`${API_BASE_URL}/inventory/return/${txId}`, {}, {
      headers: { Authorization: `Bearer ${auth.token}` }
    });
    fetchTransactions();
    fetchReturnedLogs();
  };

  const handleApproveRequest = async (tx) => {
    const item = inventory.find(i => i.id === tx.inventoryItemId);
    if (item) {
      setSelectedItem(item);
      setEditingCondition(item.condition || "");
    }
    let p = await fetchUser(tx.issuedToUserId);
    setPlayerUsername(p ? p.username : tx.issuedToUserId.toString());
    const qtyMatch = tx.comment.match(/\[Qty:\s*(\d+)\]/i);
    setIssueQty(qtyMatch ? Number(qtyMatch[1]) : 1);
    setIssueComment(tx.comment.replace(/Request\s*\[.*?\]:\s*/i, ''));
  };

  const handleIssueItem = async () => {
    let userObj = await fetchUser(playerUsername);
    if (!userObj || !userObj.id) {
      setIssueError("Player username not found.");
      return;
    }
    try {
      await axios.post(`${API_BASE_URL}/inventory/issue`, {
        inventoryItemId: selectedItem.id,
        issuedToUserId: userObj.id,
        quantity: issueQty,
        comment: issueComment,
        performedByAdminId: parseInt(userId, 10)
      }, {
        headers: { Authorization: `Bearer ${auth.token}` }
      });
      setIssueQty(1); setIssueComment(""); setPlayerUsername("");
      fetchInventory(); fetchTransactions();
    } catch (err) {
      setIssueError("Failed to issue item.");
    }
  };

  return (
    <div className="inventory-dashboard-wrapper">
      {!isAdmin && (
        <InnerNavbar
          title="Equipment Inventory"
          username={auth.user?.username}
          backTo="/dashboard"
          onLogout={() => { auth.logout(); navigate('/'); }}
        />
      )}
      <div className="inventory-dashboard">
        <div className="inventory-header">
          <h2>Inventory Management</h2>
          <div className="inventory-header-actions">
            <button className="inv-btn-report" onClick={() => setShowReport(true)}>Generate Registry</button>
            {isAdmin && (
              <div className="add-item-bar">
                <input className="inv-input" value={itemName} onChange={e => setItemName(e.target.value)} placeholder="Asset Name" />
                <input className="inv-input" type="number" style={{ width: '80px' }} value={itemQty} onChange={e => setItemQty(Number(e.target.value))} min={1} />
                <input className="inv-input" value={itemCategory} onChange={e => setItemCategory(e.target.value)} placeholder="Category" />
                <button className="inv-btn-primary" onClick={handleAddItem}>Register Item</button>
              </div>
            )}
          </div>
        </div>

        <div className="inv-grid">
          {/* Main Inventory Column */}
          <div className="inv-card">
            <h3>Available Assets Inventory</h3>
            <div className="inv-table-container">
              <table className="inv-table">
                <thead>
                  <tr>
                    <th>Asset Name</th>
                    <th>Category</th>
                    <th>Condition</th>
                    <th>Stock</th>
                    <th>Registered</th>
                    {isAdmin && <th>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {inventory.length === 0 && (
                    <tr><td colSpan={isAdmin ? "6" : "5"} className="empty-state">No assets currently registered.</td></tr>
                  )}
                  {inventory.map(item => (
                    <tr 
                      key={item.id} 
                      className={selectedItem?.id === item.id ? "selected-row" : ""} 
                      onClick={() => { setSelectedItem(item); setEditingCondition(item.condition || ""); }}
                    >
                      <td><strong>{item.name}</strong></td>
                      <td><span className="badge" style={{ background: '#e2e8f0', color: '#000040' }}>{item.category}</span></td>
                      <td>
                        {inlineEditId === item.id ? (
                          <div style={{ display: 'flex', gap: '5px' }} onClick={e => e.stopPropagation()}>
                            <input autoFocus value={inlineCondition} onChange={e => setInlineCondition(e.target.value)} className="inv-input" style={{ padding: '4px 8px', width: '120px' }} />
                            <button onClick={() => saveInlineCondition(item.id)} className="inv-btn-primary" style={{ padding: '4px 10px' }}>✓</button>
                          </div>
                        ) : (
                          <span 
                            className="badge" 
                            style={{ background: '#fef3c7', color: '#d97706', cursor: isAdmin ? 'pointer' : 'default' }}
                            onClick={(e) => {
                              if (isAdmin) {
                                e.stopPropagation();
                                setInlineEditId(item.id);
                                setInlineCondition(item.condition || "");
                              }
                            }}
                          >
                            {item.condition || "Good"} {isAdmin && " ✎"}
                          </span>
                        )}
                      </td>
                      <td><span style={{ fontWeight: 900, color: item.quantity < 5 ? '#ef4444' : 'inherit' }}>{item.quantity}</span></td>
                      <td>{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A'}</td>
                      {isAdmin && (
                        <td>
                          <button className="inv-btn-action" style={{ background: '#fee2e2', color: '#b91c1c', border: 'none' }} onClick={e => { e.stopPropagation(); handleDeleteItem(item.id); }}>DELETE</button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Action Column */}
          <div className="inv-card">
            <h3>Active Operations {selectedItem ? `- ${selectedItem.name}` : ''}</h3>
            {!selectedItem ? (
              <div className="empty-state" style={{ padding: '40px' }}>Select an asset from the master registry to initialize an operation.</div>
            ) : (
              <div className="action-form">
                <div className="action-form-title">{isAdmin ? "Issue Asset to Player" : "Request Asset Issue"}</div>
                <input className="inv-input" type="number" value={issueQty} onChange={e => setIssueQty(Number(e.target.value))} min={1} max={selectedItem.quantity} placeholder="Quantity" />
                {isAdmin && <input className="inv-input" value={playerUsername} onChange={e => setPlayerUsername(e.target.value)} placeholder="Member Username" />}
                <input className="inv-input" value={issueComment} onChange={e => setIssueComment(e.target.value)} placeholder="Reference / Details" />
                <button className="inv-btn-primary" onClick={isAdmin ? handleIssueItem : async () => {
                  let userObj = await fetchUser(userId);
                  await axios.post(`${API_BASE_URL}/inventory/request`, {
                    inventoryItemId: selectedItem.id,
                    requestedByUserId: userObj?.id || userId,
                    quantity: issueQty,
                    comment: issueComment
                  }, {
                    headers: { Authorization: `Bearer ${auth.token}` }
                  });
                  setIssueQty(1); setIssueComment(""); setSelectedItem(null);
                  fetchInventory(); fetchTransactions();
                }}>
                  {isAdmin ? "CONFIRM ISSUE" : "SUBMIT REQUEST"}
                </button>
                {issueError && <div style={{ color: '#ef4444', fontSize: '0.8rem', fontWeight: 800 }}>{issueError}</div>}
              </div>
            )}
          </div>
        </div>

        {/* Logs Section */}
        <div className="logs-grid">
          <div className="inv-card">
            <h3>Pending Approvals</h3>
            <div className="scrollable-inv-card">
              {transactions.filter(t => t.quantityChanged === 0).length === 0 ? (
                <div className="empty-state">No pending requests in queue.</div>
              ) : (
                <ul className="tx-list">
                  {transactions.filter(t => t.quantityChanged === 0).map((tx) => (
                    <TransactionItem key={tx.id} tx={tx} fetchUser={fetchUser} onReturn={handleReturnTransaction} onApprove={handleApproveRequest} showReturn={isAdmin} isAdmin={isAdmin} />
                  ))}
                </ul>
              )}
            </div>
          </div>
          <div className="inv-card">
            <h3>Active Assignments</h3>
            <div className="scrollable-inv-card">
              {transactions.filter(t => t.quantityChanged < 0).length === 0 ? (
                <div className="empty-state">No equipment currently assigned.</div>
              ) : (
                <ul className="tx-list">
                  {transactions.filter(t => t.quantityChanged < 0).map((tx) => (
                    <TransactionItem key={tx.id} tx={tx} fetchUser={fetchUser} onReturn={handleReturnTransaction} onApprove={handleApproveRequest} showReturn={isAdmin} isAdmin={isAdmin} />
                  ))}
                </ul>
              )}
            </div>
          </div>
          <div className="inv-card">
            <h3>Transaction History</h3>
            <div className="scrollable-inv-card">
              {returnedLogs.length === 0 ? (
                <div className="empty-state">Registry history is empty.</div>
              ) : (
                <ul className="tx-list">
                  {returnedLogs.map((tx) => (
                    <TransactionItem key={tx.id} tx={tx} fetchUser={fetchUser} showReturn={false} />
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>

      {showReport && (
        <InventoryReport
          inventory={inventory}
          transactions={transactions}
          returnedLogs={returnedLogs}
          isAdmin={isAdmin}
          onClose={() => setShowReport(false)}
        />
      )}
    </div>
  );
};

export default InventoryPage;
