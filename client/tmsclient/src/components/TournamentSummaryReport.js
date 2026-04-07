import React, { useRef } from 'react';
import '../styles/TournamentSummaryReport.css';

const TournamentSummaryReport = ({
  tournament,
  teams,
  matchups,
  tiebreakers,
  finalStandings,
  onClose,
}) => {
  const reportRef = useRef(null);

  const champion = finalStandings.length > 0 ? finalStandings[0] : null;
  const totalMatches = matchups.length;
  const completedMatches = matchups.filter(m => m.winner).length;
  const totalPlayoffs = tiebreakers.length;
  const completedPlayoffs = tiebreakers.filter(t => t.winner).length;
  const completionPct = totalMatches > 0 ? Math.round((completedMatches / totalMatches) * 100) : 0;

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
    });
  };

  const getTeamName = (id, teamList) => {
    const t = teamList.find(x => x.id === id);
    return t ? t.teamName : 'Unknown';
  };

  const ordinalLabel = (n) => {
    if (n === 0) return '1st';
    if (n === 1) return '2nd';
    if (n === 2) return '3rd';
    return `${n + 1}th`;
  };

  // ─── Build self-contained HTML for print popup ───────────────────────────────
  const buildPrintHTML = (bodyHTML, tournamentName) => `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<title>Tournament Report — ${tournamentName}</title>
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
@page{size:A4;margin:14mm 16mm}
body{font-family:'Segoe UI',Arial,Helvetica,sans-serif;font-size:10pt;color:#1c2331;background:#fff;line-height:1.5}

/* ── PAGE HEADER ── */
.pr-page-header{background:#1c2b4a;color:#fff;padding:28px 32px 22px;margin-bottom:0;display:flex;align-items:flex-start;justify-content:space-between;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.pr-header-left{}
.pr-badge{font-size:8pt;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#f0b429;margin-bottom:6px}
.pr-title{font-size:20pt;font-weight:800;color:#ffffff;line-height:1.2;margin-bottom:6px}
.pr-subtitle{font-size:9pt;color:#a8bdd4;font-weight:400}
.pr-header-right{text-align:right;flex-shrink:0}
.pr-meta-label{font-size:7.5pt;color:#7a9bbf;text-transform:uppercase;letter-spacing:0.8px;margin-bottom:2px}
.pr-meta-value{font-size:9pt;color:#e0ecf8;font-weight:600;margin-bottom:8px}
.pr-status-chip{display:inline-block;padding:3px 11px;border-radius:3px;font-size:7.5pt;font-weight:700;text-transform:uppercase;letter-spacing:0.5px}
.sc-completed{background:#22c55e;color:#fff}
.sc-inprogress{background:#f59e0b;color:#fff}
.sc-scheduled{background:#3b82f6;color:#fff}
.sc-cancelled{background:#ef4444;color:#fff}
.sc-default{background:#6b7280;color:#fff}

/* ── INFO STRIP ── */
.pr-info-strip{background:#f0f4f8;border-left:0;padding:10px 32px;display:flex;gap:32px;font-size:8.5pt;color:#4b5563;border-bottom:1px solid #dde3ec;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.pr-info-item strong{color:#1c2331;font-weight:700}

/* ── SECTION ── */
.pr-section{padding:18px 32px 0}
.pr-section-title{font-size:9pt;font-weight:800;text-transform:uppercase;letter-spacing:1.2px;color:#1c2b4a;border-bottom:2px solid #1c2b4a;padding-bottom:5px;margin-bottom:14px}

/* ── STATS ROW ── */
.pr-stats-row{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:4px}
.pr-stat{background:#f8fafc;border:1px solid #e2e8f0;border-top:3px solid #1c2b4a;padding:12px 10px;text-align:center;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.pr-stat-num{font-size:18pt;font-weight:800;color:#1c2b4a;line-height:1}
.pr-stat-lbl{font-size:7pt;text-transform:uppercase;letter-spacing:0.6px;color:#64748b;margin-top:3px;font-weight:600}
.pr-stat-blue .pr-stat-num{color:#1d4ed8}
.pr-stat-blue{border-top-color:#1d4ed8}
.pr-stat-green .pr-stat-num{color:#15803d}
.pr-stat-green{border-top-color:#15803d}
.pr-stat-amber .pr-stat-num{color:#b45309}
.pr-stat-amber{border-top-color:#f59e0b}
.pr-stat-purple .pr-stat-num{color:#7c3aed}
.pr-stat-purple{border-top-color:#7c3aed}

/* ── CHAMPION BLOCK ── */
.pr-champion{background:#1c2b4a;color:#fff;padding:18px 28px;display:flex;align-items:center;gap:20px;margin-bottom:0;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.pr-champion-icon{font-size:36pt;line-height:1}
.pr-champion-tag{font-size:7.5pt;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:#f0b429;margin-bottom:4px}
.pr-champion-name{font-size:18pt;font-weight:800;color:#ffffff;margin-bottom:2px}
.pr-champion-record{font-size:9pt;color:#a8bdd4}
.pr-champion-divider{width:1px;background:rgba(255,255,255,0.15);align-self:stretch;margin:0 8px}
.pr-champion-extras{display:flex;flex-direction:column;gap:6px}
.pr-champion-extra-item{font-size:8pt;color:#cbd5e1}
.pr-champion-extra-item span{color:#f0b429;font-weight:700}

/* ── TABLES ── */
.pr-table{width:100%;border-collapse:collapse;font-size:9pt;margin-bottom:4px}
.pr-table thead tr{background:#1c2b4a;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.pr-table thead th{padding:9px 14px;text-align:left;font-size:7.5pt;font-weight:700;text-transform:uppercase;letter-spacing:0.6px;color:#fff;white-space:nowrap}
.pr-table thead th.tc{text-align:center}
.pr-table tbody tr{border-bottom:1px solid #e9edf2}
.pr-table tbody tr:nth-child(even){background:#f8fafc;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.pr-table tbody td{padding:9px 14px;color:#1c2331;vertical-align:middle}
.pr-table tbody td.tc{text-align:center}
/* champion row */
.pr-row-1st{background:#fefce8 !important;border-left:4px solid #f0b429;font-weight:700;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.pr-row-2nd{background:#f8fafc !important;border-left:4px solid #94a3b8}
.pr-row-3rd{background:#fff7ed !important;border-left:4px solid #fb923c;-webkit-print-color-adjust:exact;print-color-adjust:exact}
/* pos badges */
.pr-pos-badge{display:inline-block;width:28px;height:28px;border-radius:50%;font-size:8pt;font-weight:800;line-height:28px;text-align:center;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.pr-pos-1{background:#f0b429;color:#1c2331}
.pr-pos-2{background:#94a3b8;color:#fff}
.pr-pos-3{background:#fb923c;color:#fff}
.pr-pos-n{background:#e2e8f0;color:#475569;font-size:7.5pt}
/* wins / losses */
.pr-w{color:#15803d;font-weight:700}
.pr-l{color:#dc2626;font-weight:600}
.pr-pct{color:#1c2331;font-weight:600}
/* match table specifics */
.pr-match-idx{color:#94a3b8;font-size:8pt;font-weight:600}
.pr-vs{color:#94a3b8;font-size:8pt;font-weight:700;text-transform:uppercase;text-align:center}
.pr-winner-chip{display:inline-block;background:#dcfce7;color:#15803d;padding:2px 10px;border-radius:3px;font-size:8pt;font-weight:700;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.pr-pending-chip{display:inline-block;background:#f1f5f9;color:#64748b;padding:2px 10px;border-radius:3px;font-size:8pt;font-weight:600;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.pr-team-won{font-weight:700;color:#15803d}
.pr-type-badge{display:inline-block;background:#fef3c7;color:#92400e;padding:1px 7px;border-radius:3px;font-size:7pt;font-weight:700;text-transform:uppercase;vertical-align:middle;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.pr-playoff-badge{background:#ede9fe;color:#5b21b6}

/* ── TEAMS GRID ── */
.pr-teams-grid{display:flex;flex-wrap:wrap;gap:8px}
.pr-team-chip{display:inline-flex;align-items:center;gap:7px;background:#f1f5f9;border:1px solid #e2e8f0;border-radius:4px;padding:5px 12px;font-size:9pt;font-weight:600;color:#1c2331;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.pr-team-num{background:#1c2b4a;color:#fff;border-radius:50%;width:19px;height:19px;display:inline-flex;align-items:center;justify-content:center;font-size:7pt;font-weight:700;flex-shrink:0;-webkit-print-color-adjust:exact;print-color-adjust:exact}

/* ── PROGRESS BAR ── */
.pr-progress-wrap{background:#e2e8f0;border-radius:2px;height:5px;margin-bottom:14px;overflow:hidden;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.pr-progress-fill{height:100%;background:#1c2b4a;border-radius:2px;-webkit-print-color-adjust:exact;print-color-adjust:exact}

/* ── SECTION SPACER ── */
.pr-spacer{height:16px}

/* ── PAGE FOOTER ── */
.pr-footer{margin-top:20px;border-top:2px solid #1c2b4a;padding:10px 32px;display:flex;justify-content:space-between;font-size:7.5pt;color:#64748b;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.pr-footer strong{color:#1c2b4a}
</style>
</head>
<body>${bodyHTML}</body>
</html>`;

  const buildReportBodyHTML = () => {
    const statusClass = {
      completed: 'sc-completed',
      inprogress: 'sc-inprogress',
      scheduled: 'sc-scheduled',
      cancelled: 'sc-cancelled',
    }[(tournament?.status || '').toLowerCase()] || 'sc-default';

    const standingsRows = finalStandings.map((team, idx) => {
      const total = team.wins + team.losses;
      const pct = total > 0 ? Math.round((team.wins / total) * 100) : 0;
      const rowClass = idx === 0 ? 'pr-row-1st' : idx === 1 ? 'pr-row-2nd' : idx === 2 ? 'pr-row-3rd' : '';
      const posClass = idx === 0 ? 'pr-pos-1' : idx === 1 ? 'pr-pos-2' : idx === 2 ? 'pr-pos-3' : 'pr-pos-n';
      const posLabel = ordinalLabel(idx);
      return `<tr class="${rowClass}">
        <td class="tc"><span class="pr-pos-badge ${posClass}">${idx + 1}</span></td>
        <td><strong>${team.teamName}</strong></td>
        <td class="tc"><span class="pr-w">${team.wins}</span></td>
        <td class="tc"><span class="pr-l">${team.losses}</span></td>
        <td class="tc">${totalMatches > 0 ? team.wins + team.losses : 0}</td>
        <td class="tc"><span class="pr-pct">${pct}%</span></td>
        <td class="tc">${posLabel}</td>
      </tr>`;
    }).join('');

    const matchRows = matchups.map((m, idx) => {
      const winnerName = m.winner ? getTeamName(m.winner, teams) : null;
      const t1class = m.winner === m.team1.id ? 'pr-team-won' : '';
      const t2class = m.winner === m.team2.id ? 'pr-team-won' : '';
      return `<tr>
        <td class="tc pr-match-idx">${idx + 1}</td>
        <td class="${t1class}">${m.team1.teamName}</td>
        <td class="pr-vs">vs</td>
        <td class="${t2class}">${m.team2.teamName}</td>
        <td class="tc">${winnerName ? `<span class="pr-winner-chip">${winnerName}</span>` : '<span class="pr-pending-chip">Pending</span>'}</td>
      </tr>`;
    }).join('');

    const tbRows = tiebreakers.map((tb, idx) => {
      const winnerName = tb.winner ? getTeamName(tb.winner, teams) : null;
      const t1class = tb.winner === tb.team1.id ? 'pr-team-won' : '';
      const t2class = tb.winner === tb.team2.id ? 'pr-team-won' : '';
      return `<tr>
        <td class="tc pr-match-idx">${idx + 1}</td>
        <td class="${t1class}">${tb.team1.teamName}</td>
        <td class="pr-vs">vs</td>
        <td class="${t2class}">${tb.team2.teamName}</td>
        <td class="tc">${winnerName ? `<span class="pr-winner-chip">${winnerName}</span>` : '<span class="pr-pending-chip">Pending</span>'}</td>
      </tr>`;
    }).join('');

    const teamChips = teams.map((t, idx) =>
      `<span class="pr-team-chip"><span class="pr-team-num">${idx + 1}</span>${t.teamName}</span>`
    ).join('');

    const championBlock = champion && champion.wins > 0 ? `
      <div class="pr-section"><div class="pr-section-title">Tournament Champion</div></div>
      <div class="pr-champion" style="margin:0 32px 0">
        <div class="pr-champion-icon">&#x1F3C6;</div>
        <div>
          <div class="pr-champion-tag">&#x2605; Tournament Champion &#x2605;</div>
          <div class="pr-champion-name">${champion.teamName}</div>
          <div class="pr-champion-record">${champion.wins} Wins &bull; ${champion.losses} Losses &bull; Win Rate: ${champion.wins + champion.losses > 0 ? Math.round((champion.wins / (champion.wins + champion.losses)) * 100) : 0}%</div>
        </div>
      </div>
      <div class="pr-spacer"></div>` : '';

    const playoffSection = tiebreakers.length > 0 ? `
      <div class="pr-section">
        <div class="pr-section-title">Playoff Match Results</div>
        <table class="pr-table">
          <thead><tr>
            <th class="tc">#</th><th>Team A</th><th class="tc">vs</th><th>Team B</th><th class="tc">Result</th>
          </tr></thead>
          <tbody>${tbRows}</tbody>
        </table>
      </div>
      <div class="pr-spacer"></div>` : '';

    return `
      <div class="pr-page-header">
        <div class="pr-header-left">
          <div class="pr-badge">&#x25BA; Official Tournament Report</div>
          <div class="pr-title">${tournament?.name || 'Tournament'}</div>
          <div class="pr-subtitle">${tournament?.description || 'Round Robin Tournament — Official Summary'}</div>
        </div>
        <div class="pr-header-right">
          <div class="pr-meta-label">Status</div>
          <div><span class="pr-status-chip ${statusClass}">${tournament?.status || '—'}</span></div>
          <div style="margin-top:10px">
            <div class="pr-meta-label">Report Generated</div>
            <div class="pr-meta-value">${new Date().toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'})}</div>
          </div>
        </div>
      </div>

      <div class="pr-info-strip">
        <div class="pr-info-item"><strong>Start Date:</strong> ${formatDate(tournament?.startDate)}</div>
        <div class="pr-info-item"><strong>End Date:</strong> ${formatDate(tournament?.endDate)}</div>
        <div class="pr-info-item"><strong>Total Teams:</strong> ${teams.length}</div>
        <div class="pr-info-item"><strong>Matches Completed:</strong> ${completedMatches} / ${totalMatches}</div>
        ${totalPlayoffs > 0 ? `<div class="pr-info-item"><strong>Playoffs:</strong> ${completedPlayoffs} / ${totalPlayoffs}</div>` : ''}
      </div>

      <div class="pr-spacer"></div>

      <div class="pr-section">
        <div class="pr-section-title">Tournament Overview</div>
        <div class="pr-stats-row">
          <div class="pr-stat pr-stat-blue">
            <div class="pr-stat-num">${teams.length}</div>
            <div class="pr-stat-lbl">Participating Teams</div>
          </div>
          <div class="pr-stat pr-stat-green">
            <div class="pr-stat-num">${completedMatches}</div>
            <div class="pr-stat-lbl">Matches Played</div>
          </div>
          <div class="pr-stat pr-stat-amber">
            <div class="pr-stat-num">${totalMatches}</div>
            <div class="pr-stat-lbl">Total Matches</div>
          </div>
          <div class="pr-stat ${totalPlayoffs > 0 ? 'pr-stat-purple' : ''}">
            <div class="pr-stat-num">${completionPct}%</div>
            <div class="pr-stat-lbl">Completion Rate</div>
          </div>
        </div>
      </div>

      <div class="pr-spacer"></div>

      ${championBlock}

      <div class="pr-section">
        <div class="pr-section-title">Final Standings${totalPlayoffs > 0 ? ' (After Playoffs)' : ''}</div>
        <table class="pr-table">
          <thead><tr>
            <th class="tc">Rank</th><th>Team Name</th>
            <th class="tc">W</th><th class="tc">L</th><th class="tc">GP</th>
            <th class="tc">Win%</th><th class="tc">Position</th>
          </tr></thead>
          <tbody>${standingsRows}</tbody>
        </table>
        <div style="font-size:7.5pt;color:#94a3b8;margin-top:6px">W = Wins &nbsp; L = Losses &nbsp; GP = Games Played &nbsp; Win% = Win Percentage</div>
      </div>

      <div class="pr-spacer"></div>

      <div class="pr-section">
        <div class="pr-section-title">Round Robin Match Results</div>
        <table class="pr-table">
          <thead><tr>
            <th class="tc">#</th><th>Team A</th><th class="tc">vs</th><th>Team B</th><th class="tc">Result</th>
          </tr></thead>
          <tbody>${matchRows || '<tr><td colspan="5" style="text-align:center;color:#94a3b8;padding:16px">No matches recorded</td></tr>'}</tbody>
        </table>
      </div>

      <div class="pr-spacer"></div>

      ${playoffSection}

      <div class="pr-section">
        <div class="pr-section-title">Registered Teams (${teams.length})</div>
        <div class="pr-teams-grid">${teamChips || '<span style="color:#94a3b8;font-size:9pt">No teams registered</span>'}</div>
      </div>

      <div class="pr-spacer"></div>

      <div class="pr-footer">
        <div><strong>Tournament Management System</strong> &nbsp;|&nbsp; ${tournament?.name || ''}</div>
        <div>Generated: ${new Date().toLocaleString('en-US',{dateStyle:'long',timeStyle:'short'})}</div>
      </div>
    `;
  };

  const handlePrint = () => {
    const reportEl = reportRef.current;
    if (!reportEl) return;

    const pw = window.open('', '_blank', 'width=960,height=740');
    if (!pw) {
      alert('Please allow popups for this page to print the report.');
      return;
    }

    const html = buildPrintHTML(buildReportBodyHTML(), tournament?.name || 'Report');
    pw.document.write(html);
    pw.document.close();

    setTimeout(() => {
      pw.focus();
      pw.print();
      pw.onafterprint = () => pw.close();
    }, 500);
  };

  // ── Screen preview ───────────────────────────────────────────────────────────
  const statusClass = {
    completed: 'tsr-sc-completed',
    inprogress: 'tsr-sc-inprogress',
    scheduled: 'tsr-sc-scheduled',
    cancelled: 'tsr-sc-cancelled',
  }[(tournament?.status || '').toLowerCase()] || 'tsr-sc-default';

  return (
    <>
      <div className="tsr-overlay" onClick={onClose} role="dialog" aria-modal="true">
        <div className="tsr-modal" onClick={e => e.stopPropagation()}>

          {/* Toolbar */}
          <div className="tsr-toolbar">
            <div className="tsr-toolbar-left">
              <span className="tsr-toolbar-icon">&#x1F4CB;</span>
              <span className="tsr-toolbar-title">Tournament Summary Report</span>
            </div>
            <div className="tsr-toolbar-right">
              <button className="tsr-print-btn" onClick={handlePrint}>
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <polyline points="6 9 6 2 18 2 18 9"/>
                  <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
                  <rect x="6" y="14" width="12" height="8"/>
                </svg>
                Print / Download PDF
              </button>
              <button className="tsr-close-btn" onClick={onClose}>&#x2715;</button>
            </div>
          </div>

          {/* Report preview */}
          <div className="tsr-body" ref={reportRef}>

            {/* Page header */}
            <div className="tsr-hdr">
              <div className="tsr-hdr-left">
                <div className="tsr-hdr-badge">&#x25BA;&nbsp; Official Tournament Report</div>
                <h1 className="tsr-hdr-title">{tournament?.name || 'Tournament'}</h1>
                <p className="tsr-hdr-sub">{tournament?.description || 'Round Robin Tournament — Official Summary'}</p>
              </div>
              <div className="tsr-hdr-right">
                <div className="tsr-hdr-meta-label">Status</div>
                <span className={`tsr-status-chip ${statusClass}`}>{tournament?.status || '—'}</span>
                <div className="tsr-hdr-meta-label" style={{marginTop: 12}}>Generated</div>
                <div className="tsr-hdr-meta-value">{new Date().toLocaleDateString('en-US',{year:'numeric',month:'short',day:'numeric'})}</div>
              </div>
            </div>

            {/* Info strip */}
            <div className="tsr-info-strip">
              <div className="tsr-info-item"><strong>Start:</strong> {formatDate(tournament?.startDate)}</div>
              <div className="tsr-info-item"><strong>End:</strong> {formatDate(tournament?.endDate)}</div>
              <div className="tsr-info-item"><strong>Teams:</strong> {teams.length}</div>
              <div className="tsr-info-item"><strong>Completed:</strong> {completedMatches}/{totalMatches} matches</div>
              {totalPlayoffs > 0 && <div className="tsr-info-item"><strong>Playoffs:</strong> {completedPlayoffs}/{totalPlayoffs}</div>}
            </div>

            <div className="tsr-content">

              {/* Overview Stats */}
              <div className="tsr-section">
                <h2 className="tsr-section-title">Tournament Overview</h2>
                <div className="tsr-stats-row">
                  <div className="tsr-stat tsr-stat-blue">
                    <div className="tsr-stat-num">{teams.length}</div>
                    <div className="tsr-stat-lbl">Participating Teams</div>
                  </div>
                  <div className="tsr-stat tsr-stat-green">
                    <div className="tsr-stat-num">{completedMatches}</div>
                    <div className="tsr-stat-lbl">Matches Played</div>
                  </div>
                  <div className="tsr-stat tsr-stat-amber">
                    <div className="tsr-stat-num">{totalMatches}</div>
                    <div className="tsr-stat-lbl">Total Matches</div>
                  </div>
                  <div className="tsr-stat tsr-stat-slate">
                    <div className="tsr-stat-num">{completionPct}%</div>
                    <div className="tsr-stat-lbl">Completion Rate</div>
                  </div>
                </div>
                {/* progress */}
                <div className="tsr-progress-wrap">
                  <div className="tsr-progress-fill" style={{width: `${completionPct}%`}}></div>
                </div>
                <div className="tsr-progress-label">{completedMatches} of {totalMatches} matches completed</div>
              </div>

              {/* Champion */}
              {champion && champion.wins > 0 && (
                <div className="tsr-section">
                  <h2 className="tsr-section-title">Tournament Champion</h2>
                  <div className="tsr-champion">
                    <div className="tsr-champion-trophy">&#x1F3C6;</div>
                    <div className="tsr-champion-info">
                      <div className="tsr-champion-tag">&#x2605; Tournament Champion &#x2605;</div>
                      <div className="tsr-champion-name">{champion.teamName}</div>
                      <div className="tsr-champion-record">
                        {champion.wins} Wins &bull; {champion.losses} Losses &bull;&nbsp;
                        Win Rate: {champion.wins + champion.losses > 0
                          ? Math.round((champion.wins / (champion.wins + champion.losses)) * 100) : 0}%
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Final Standings */}
              <div className="tsr-section">
                <h2 className="tsr-section-title">
                  Final Standings {totalPlayoffs > 0 && <span className="tsr-title-note">(After Playoffs)</span>}
                </h2>
                {finalStandings.length === 0 ? (
                  <p className="tsr-empty">No standings available.</p>
                ) : (
                  <>
                    <table className="tsr-table">
                      <thead>
                        <tr>
                          <th className="tc">Rank</th>
                          <th>Team Name</th>
                          <th className="tc">W</th>
                          <th className="tc">L</th>
                          <th className="tc">GP</th>
                          <th className="tc">Win%</th>
                          <th className="tc">Position</th>
                        </tr>
                      </thead>
                      <tbody>
                        {finalStandings.map((team, idx) => {
                          const total = team.wins + team.losses;
                          const pct = total > 0 ? Math.round((team.wins / total) * 100) : 0;
                          const rowClass = idx === 0 ? 'tsr-row-1st' : idx === 1 ? 'tsr-row-2nd' : idx === 2 ? 'tsr-row-3rd' : '';
                          const posClass = idx === 0 ? 'tsr-pos-1' : idx === 1 ? 'tsr-pos-2' : idx === 2 ? 'tsr-pos-3' : 'tsr-pos-n';
                          return (
                            <tr key={team.id} className={rowClass}>
                              <td className="tc"><span className={`tsr-pos-badge ${posClass}`}>{idx + 1}</span></td>
                              <td><strong>{team.teamName}</strong></td>
                              <td className="tc tsr-w">{team.wins}</td>
                              <td className="tc tsr-l">{team.losses}</td>
                              <td className="tc">{team.wins + team.losses}</td>
                              <td className="tc tsr-pct">{pct}%</td>
                              <td className="tc">{ordinalLabel(idx)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                    <div className="tsr-table-note">W = Wins &nbsp; L = Losses &nbsp; GP = Games Played &nbsp; Win% = Win Percentage</div>
                  </>
                )}
              </div>

              {/* Round Robin Matches */}
              <div className="tsr-section">
                <h2 className="tsr-section-title">Round Robin Match Results</h2>
                {matchups.length === 0 ? (
                  <p className="tsr-empty">No matches recorded.</p>
                ) : (
                  <table className="tsr-table">
                    <thead>
                      <tr>
                        <th className="tc">#</th>
                        <th>Team A</th>
                        <th className="tc">vs</th>
                        <th>Team B</th>
                        <th className="tc">Result</th>
                      </tr>
                    </thead>
                    <tbody>
                      {matchups.map((m, idx) => (
                        <tr key={m.key || idx}>
                          <td className="tc tsr-idx">{idx + 1}</td>
                          <td className={m.winner === m.team1.id ? 'tsr-team-won' : ''}>{m.team1.teamName}</td>
                          <td className="tc tsr-vs-cell">vs</td>
                          <td className={m.winner === m.team2.id ? 'tsr-team-won' : ''}>{m.team2.teamName}</td>
                          <td className="tc">
                            {m.winner
                              ? <span className="tsr-win-chip">{getTeamName(m.winner, teams)}</span>
                              : <span className="tsr-pending-chip">Pending</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Playoffs */}
              {tiebreakers.length > 0 && (
                <div className="tsr-section">
                  <h2 className="tsr-section-title">Playoff Match Results</h2>
                  <table className="tsr-table">
                    <thead>
                      <tr>
                        <th className="tc">#</th>
                        <th>Team A</th>
                        <th className="tc">vs</th>
                        <th>Team B</th>
                        <th className="tc">Result</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tiebreakers.map((tb, idx) => (
                        <tr key={tb.key || idx}>
                          <td className="tc tsr-idx">{idx + 1}</td>
                          <td className={tb.winner === tb.team1.id ? 'tsr-team-won' : ''}>{tb.team1.teamName}</td>
                          <td className="tc tsr-vs-cell">vs</td>
                          <td className={tb.winner === tb.team2.id ? 'tsr-team-won' : ''}>{tb.team2.teamName}</td>
                          <td className="tc">
                            {tb.winner
                              ? <span className="tsr-win-chip">{getTeamName(tb.winner, teams)}</span>
                              : <span className="tsr-pending-chip">Pending</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Teams */}
              <div className="tsr-section">
                <h2 className="tsr-section-title">Registered Teams ({teams.length})</h2>
                {teams.length === 0 ? (
                  <p className="tsr-empty">No teams registered.</p>
                ) : (
                  <div className="tsr-teams-grid">
                    {teams.map((t, idx) => (
                      <div key={t.id} className="tsr-team-chip">
                        <span className="tsr-team-num">{idx + 1}</span>
                        {t.teamName}
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>{/* /tsr-content */}

            {/* Footer */}
            <div className="tsr-footer">
              <span><strong>Tournament Management System</strong> &nbsp;|&nbsp; {tournament?.name}</span>
              <span>Generated {new Date().toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'})}</span>
            </div>

          </div>{/* /tsr-body */}
        </div>{/* /tsr-modal */}
      </div>{/* /tsr-overlay */}
    </>
  );
};

export default TournamentSummaryReport;
