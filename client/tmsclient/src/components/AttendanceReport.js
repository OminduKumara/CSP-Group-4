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
        // Uses your team's standard tab wrapper
        <div className="approvals-tab">
            <h2>Player Attendance Report</h2>
            
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginBottom: '24px', alignItems: 'flex-end' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '13px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Start Date</label>
                    <input 
                        type="date" 
                        value={startDate} 
                        onChange={(e) => setStartDate(e.target.value)}
                        style={{ padding: '10px 14px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', outline: 'none' }}
                    />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '13px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>End Date</label>
                    <input 
                        type="date" 
                        value={endDate} 
                        onChange={(e) => setEndDate(e.target.value)}
                        style={{ padding: '10px 14px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', outline: 'none' }}
                    />
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                    {/* Reusing the team's green approve-btn class for standard styling */}
                    <button 
                        onClick={handleGenerateReport}
                        className="approve-btn"
                        style={{ padding: '10px 20px', fontSize: '14px' }}
                        disabled={loading}
                    >
                        {loading ? 'Generating...' : 'Generate Report'}
                    </button>
                    
                    {reportData.length > 0 && (
                        <button 
                            onClick={handleExportPDF}
                            className="approve-btn"
                            style={{ padding: '10px 20px', fontSize: '14px', background: '#3b82f6' }} // Custom blue override for export
                        >
                            Export to PDF
                        </button>
                    )}
                </div>
            </div>

            {error && <div className="error-message">{error}</div>}

            {reportData.length > 0 ? (
                // Uses the team's rounded table styling
                <div className="requests-table">
                    <table>
                        <thead>
                            <tr>
                                <th>Player Name</th>
                                <th>Identity Number</th>
                                <th>Sessions Scheduled</th>
                                <th>Sessions Attended</th>
                                <th>Attendance %</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reportData.map((player) => (
                                <tr key={player.playerId}>
                                    <td>{player.playerName}</td>
                                    <td>{player.identityNumber}</td>
                                    <td>{player.totalSessionsScheduled}</td>
                                    <td>{player.sessionsAttended}</td>
                                    <td>
                                        <span style={{ 
                                            fontWeight: '600', 
                                            color: player.attendancePercentage < 50 ? '#ef4444' : '#10b981' 
                                        }}>
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
                    <div className="no-requests">
                        <p>Select dates and generate a report to view data.</p>
                    </div>
                )
            )}
        </div>
    );
};

export default AttendanceReport;