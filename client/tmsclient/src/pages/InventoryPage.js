import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";
import "../styles/InventoryPage.css";

function TransactionItem({ tx, fetchUser, onReturn, onApprove, showReturn = true, isAdmin = false }) {
  const [player, setPlayer] = useState(null);
  useEffect(() => {
    if (tx.issuedToUserId) {
      fetchUser(tx.issuedToUserId).then(setPlayer);
    }
  }, [tx.issuedToUserId]);
  
  return (
    <li className="tx-item">
      <div className="tx-body">
        <div className="tx-text">
          <strong>{tx.comment}</strong>
          <div className="tx-meta">
            Item ID: {tx.inventoryItemId} | {tx.quantityChanged === 0 ? "Status: Pending Request" : `Qty: ${tx.quantityChanged}`}
          </div>
        </div>
        {isAdmin && tx.quantityChanged === 0 ? (
          <button className="inv-btn-primary" onClick={() => onApprove(tx)}>Review</button>
        ) : showReturn && tx.quantityChanged < 0 ? (
          <button className="inv-btn-action" onClick={() => onReturn(tx.id)}>Return</button>
        ) : null}
      </div>
      {player && (
        <div className="tx-player">
          Assigned to: <span className="tx-player-badge">{player.username}</span>
        </div>
      )}
    </li>
  );
}

const InventoryPage = ({ isAdmin, userId }) => {
  const auth = useAuth();
  const [inventory, setInventory] = useState([]);
  const [itemName, setItemName] = useState("");
  const [itemQty, setItemQty] = useState(1);
  const [itemCategory, setItemCategory] = useState("");
  const [transactions, setTransactions] = useState([]);
  const [issueQty, setIssueQty] = useState(1);
  const [issueComment, setIssueComment] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [playerUsername, setPlayerUsername] = useState("");
  const [userCache, setUserCache] = useState({});
  const [returnedLogs, setReturnedLogs] = useState([]);
  const [issueError, setIssueError] = useState("");

  useEffect(() => {
    fetchInventory();
    fetchTransactions();
    fetchReturnedLogs();
  }, []);

  const fetchInventory = async () => {
    const res = await axios.get("/api/inventory", {
      headers: { Authorization: `Bearer ${auth.token}` }
    });
    setInventory(Array.isArray(res.data) ? res.data : []);
  };

  const fetchTransactions = async () => {
    const res = await axios.get("/api/inventory/transactions", {
      headers: { Authorization: `Bearer ${auth.token}` }
    });
    setTransactions(Array.isArray(res.data) ? res.data : []);
  };

  const fetchReturnedLogs = async () => {
    const res = await axios.get("/api/inventory/returned-transactions", {
      headers: { Authorization: `Bearer ${auth.token}` }
    });
    setReturnedLogs(Array.isArray(res.data) ? res.data : []);
  };

  const fetchUser = async (userIdOrUsername) => {
    if (!userIdOrUsername) return null;
    // If it's a number, treat as ID, else as username
    if (userCache[userIdOrUsername]) return userCache[userIdOrUsername];
    try {
      let res;
      if (/^\d+$/.test(userIdOrUsername)) {
        res = await axios.get(`/api/inventory/user/${userIdOrUsername}`, {
          headers: { Authorization: `Bearer ${auth.token}` }
        });
      } else {
        res = await axios.get(`/api/inventory/user-by-username/${userIdOrUsername}`, {
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
    await axios.post("/api/inventory/add", {
      name: itemName,
      quantity: itemQty,
      category: itemCategory,
      description: ""
    }, {
      headers: { Authorization: `Bearer ${auth.token}` }
    });
    setItemName("");
    setItemQty(1);
    setItemCategory("");
    fetchInventory();
  };

  const handleDeleteItem = async (itemId) => {
    await axios.delete(`/api/inventory/delete/${itemId}`, {
      headers: { Authorization: `Bearer ${auth.token}` }
    });
    if (selectedItem?.id === itemId) setSelectedItem(null);
    fetchInventory();
  };

  const handleReturnTransaction = async (txId) => {
    await axios.post(`/api/inventory/return/${txId}`, {}, {
      headers: { Authorization: `Bearer ${auth.token}` }
    });
    fetchTransactions();
    fetchReturnedLogs();
  };

  const handleApproveRequest = async (tx) => {
    const item = inventory.find(i => i.id === tx.inventoryItemId);
    if (item) setSelectedItem(item);
    
    let p = await fetchUser(tx.issuedToUserId);
    setPlayerUsername(p ? p.username : tx.issuedToUserId.toString());
    
    const qtyMatch = tx.comment.match(/\[Qty:\s*(\d+)\]/i);
    if (qtyMatch) setIssueQty(Number(qtyMatch[1]));
    else setIssueQty(1);

    setIssueComment(tx.comment.replace(/Request\s*\[.*?\]:\s*/i, ''));
  };

  const handleIssueItem = async () => {
    setIssueError("");
    // Look up user by username
    let userObj = await fetchUser(playerUsername);
    if (!userObj || !userObj.id) {
      setIssueError("Player username not found.");
      return;
    }
    const issuedToUserId = userObj.id;
    const performedByAdminId = parseInt(userId, 10);
    if (isNaN(issuedToUserId) || isNaN(performedByAdminId)) {
      setIssueError("Player User ID and Admin User ID must be valid numbers.");
      return;
    }
    try {
      await axios.post("/api/inventory/issue", {
        inventoryItemId: selectedItem.id,
        issuedToUserId,
        quantity: issueQty,
        comment: issueComment,
        performedByAdminId
      }, {
        headers: { Authorization: `Bearer ${auth.token}` }
      });
      setIssueQty(1);
      setIssueComment("");
      setPlayerUsername("");
      fetchInventory();
      fetchTransactions();
    } catch (err) {
      setIssueError("Failed to issue item: " + (err.response?.data || err.message));
    }
  };

  return (
    <div className="inventory-dashboard">
      <div className="inventory-header">
        <h2>Inventory Management</h2>
        {isAdmin && (
          <div className="add-item-bar">
            <input className="inv-input" value={itemName} onChange={e => setItemName(e.target.value)} placeholder="Item Name" />
            <input className="inv-input" type="number" style={{width: '80px'}} value={itemQty} onChange={e => setItemQty(Number(e.target.value))} min={1} />
            <input className="inv-input" value={itemCategory} onChange={e => setItemCategory(e.target.value)} placeholder="Category" />
            <button className="inv-btn-primary" onClick={handleAddItem}>Add Item</button>
          </div>
        )}
      </div>

      <div className="inv-grid">
        {/* Main Inventory Column */}
        <div className="inv-card">
          <h3>Available Assets</h3>
          <div className="inv-table-container">
            <table className="inv-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Qty</th>
                  <th>Added</th>
                  {isAdmin && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {inventory.length === 0 && (
                  <tr><td colSpan={isAdmin ? "5" : "4"} className="empty-state">No items found in inventory.</td></tr>
                )}
                {inventory.map(item => (
                  <tr 
                    key={item.id} 
                    className={selectedItem?.id === item.id ? "selected-row" : ""} 
                    onClick={() => setSelectedItem(item)}
                  >
                    <td><strong>{item.name}</strong></td>
                    <td><span className="badge">{item.category}</span></td>
                    <td>{item.quantity}</td>
                    <td>{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A'}</td>
                    {isAdmin && (
                      <td>
                        <button 
                          className="inv-btn-danger" 
                          onClick={e => { e.stopPropagation(); handleDeleteItem(item.id); }}
                        >
                          Delete
                        </button>
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
          <h3>Actions {selectedItem ? `- ${selectedItem.name}` : ''}</h3>
          
          {!selectedItem && (
             <div className="empty-state">Select an item from the table to take action.</div>
          )}

          {isAdmin && selectedItem && (
            <div className="action-form">
              <div className="action-form-title">Issue Asset</div>
              <input className="inv-input" type="number" value={issueQty} onChange={e => setIssueQty(Number(e.target.value))} min={1} max={selectedItem.quantity} placeholder="Quantity" />
              <input className="inv-input" value={playerUsername} onChange={e => setPlayerUsername(e.target.value)} placeholder="Player Username / ID" />
              <input className="inv-input" value={issueComment} onChange={e => setIssueComment(e.target.value)} placeholder="Comment (e.g. Size L shirt)" />
              <button className="inv-btn-primary" onClick={handleIssueItem}>Confirm Issue</button>
              {issueError && <div style={{color:'#ef4444', fontSize:'0.85rem'}}>{issueError}</div>}
            </div>
          )}

          {!isAdmin && selectedItem && (
            <div className="action-form">
               <div className="action-form-title">Request Asset</div>
              <input className="inv-input" type="number" value={issueQty} onChange={e => setIssueQty(Number(e.target.value))} min={1} max={selectedItem.quantity} placeholder="Quantity" />
              <input className="inv-input" value={issueComment} onChange={e => setIssueComment(e.target.value)} placeholder="Request Details" />
              <button className="inv-btn-primary" onClick={async () => {
                let userObj = await fetchUser(userId);
                await axios.post("/api/inventory/request", {
                  inventoryItemId: selectedItem.id,
                  requestedByUserId: userObj?.id || userId,
                  quantity: issueQty,
                  comment: issueComment
                }, {
                  headers: { Authorization: `Bearer ${auth.token}` }
                });
                setIssueQty(1);
                setIssueComment("");
                setSelectedItem(null);
                fetchInventory();
                fetchTransactions();
              }}>Submit Request</button>
            </div>
          )}
        </div>
      </div>

      {/* Logs Section */}
      <div className="logs-grid" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
        <div className="inv-card">
          <h3>Pending Requests</h3>
          {transactions.filter(t => t.quantityChanged === 0).length === 0 ? (
            <div className="empty-state">No pending requests.</div>
          ) : (
             <ul className="tx-list">
               {(Array.isArray(transactions) ? transactions : []).filter(t => t.quantityChanged === 0).map((tx) => (
                 <TransactionItem key={tx.id} tx={tx} fetchUser={fetchUser} onReturn={handleReturnTransaction} onApprove={handleApproveRequest} showReturn={isAdmin} isAdmin={isAdmin} />
               ))}
             </ul>
          )}
        </div>
        <div className="inv-card">
          <h3>Active Issued Assets</h3>
          {transactions.filter(t => t.quantityChanged < 0).length === 0 ? (
            <div className="empty-state">No items currently issued.</div>
          ) : (
             <ul className="tx-list">
               {(Array.isArray(transactions) ? transactions : []).filter(t => t.quantityChanged < 0).map((tx) => (
                 <TransactionItem key={tx.id} tx={tx} fetchUser={fetchUser} onReturn={handleReturnTransaction} onApprove={handleApproveRequest} showReturn={isAdmin} isAdmin={isAdmin} />
               ))}
             </ul>
          )}
        </div>
        <div className="inv-card">
          <h3>Returned History</h3>
          {returnedLogs.length === 0 ? (
            <div className="empty-state">No returned items yet.</div>
          ) : (
             <ul className="tx-list">
               {(Array.isArray(returnedLogs) ? returnedLogs : []).map((tx) => (
                 <TransactionItem key={tx.id} tx={tx} fetchUser={fetchUser} showReturn={false} />
               ))}
             </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default InventoryPage;
