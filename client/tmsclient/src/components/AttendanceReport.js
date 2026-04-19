import React, { useState } from 'react';
import { adminService } from '../services/adminService';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'; // Explicitly import the function
import '../styles/AdminDashboard.css';

const AttendanceReport = () => {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [reportData, setReportData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleGenerateReport = async () => {
        if (!startDate || !endDate) {
            setError("Please select both a start and end date.");
            return;
        }

        setLoading(true);
        setError('');
        
        try {
            const response = await adminService.getAttendanceReport(startDate, endDate);
            
            if (response.success && response.data) {
                setReportData(response.data);
            } else {
                setError("No data returned from the server.");
            }
        } catch (err) {
            console.error(err);
            setError(err.message || "Failed to load report data.");
        } finally {
            setLoading(false);
        }
    };

    const handleExportPDF = () => {
        const doc = new jsPDF('p', 'pt', 'a4');
        
        doc.setFontSize(18);
        doc.text("SLIIT Tennis - Player Attendance Report", 40, 40);
        doc.setFontSize(12);
        doc.setTextColor(100);
        doc.text(`Date Range: ${startDate} to ${endDate}`, 40, 60);

        const tableColumn = ["Player Name", "Identity Number", "Scheduled", "Attended", "Attendance %"];
        const tableRows = reportData.map(player => [
            player.playerName,
            player.identityNumber,
            player.totalSessionsScheduled,
            player.sessionsAttended,
            `${player.attendancePercentage}%`
        ]);

        // Pass 'doc' directly into the autoTable function as the first parameter
        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 80,
            theme: 'grid',
            styles: { fontSize: 10, cellPadding: 5 },
            headStyles: { fillColor: [16, 185, 129], textColor: 255 }, 
            alternateRowStyles: { fillColor: [249, 250, 251] }
        });

        const timestamp = new Date().toISOString().split('T')[0];
        doc.save(`Attendance_Report_${timestamp}.pdf`);
    };

    return (
        <div className="approvals-tab">
            <h2>Player Attendance Analytics</h2>
            
            <div className="admin-card" style={{ marginBottom: '28px' }}>
                <h3 style={{ marginTop: 0, marginBottom: '20px', fontSize: '1.1rem' }}>Report Parameters</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'flex-end' }}>
                    <div className="form-group-item" style={{ minWidth: '200px' }}>
                        <label>Start Period</label>
                        <input 
                            type="date" 
                            value={startDate} 
                            onChange={(e) => setStartDate(e.target.value)}
                        />
                    </div>
                    <div className="form-group-item" style={{ minWidth: '200px' }}>
                        <label>End Period</label>
                        <input 
                            type="date" 
                            value={endDate} 
                            onChange={(e) => setEndDate(e.target.value)}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button 
                            onClick={handleGenerateReport}
                            className="btn-primary"
                            style={{ padding: '0 30px', height: '42px' }}
                            disabled={loading}
                        >
                            {loading ? 'Analyzing...' : 'Generate Analytics'}
                        </button>
                        
                        {reportData.length > 0 && (
                            <button 
                                onClick={handleExportPDF}
                                className="btn-secondary"
                                style={{ padding: '0 30px', height: '42px' }}
                            >
                                Export PDF
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {error && <div className="error-message">{error}</div>}

            {reportData.length > 0 ? (
                <div className="requests-table">
                    <table>
                        <thead>
                            <tr>
                                <th>Athlete Name</th>
                                <th>Identity Number</th>
                                <th style={{ textAlign: 'center' }}>Scheduled</th>
                                <th style={{ textAlign: 'center' }}>Attended</th>
                                <th style={{ textAlign: 'center' }}>Compliance %</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reportData.map((player) => (
                                <tr key={player.playerId}>
                                    <td><strong>{player.playerName}</strong></td>
                                    <td><code>{player.identityNumber}</code></td>
                                    <td style={{ textAlign: 'center' }}>{player.totalSessionsScheduled}</td>
                                    <td style={{ textAlign: 'center' }}>{player.sessionsAttended}</td>
                                    <td style={{ textAlign: 'center' }}>
                                        <span className={`status-badge ${player.attendancePercentage < 70 ? 'status-cancelled' : 'status-inprogress'}`}>
                                            {player.attendancePercentage}%
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                !loading && (
                    <div className="no-data">
                        <p>Define a date range and generate a report to view athlete compliance trends.</p>
                    </div>
                )
            )}
        </div>
    );
};

export default AttendanceReport;