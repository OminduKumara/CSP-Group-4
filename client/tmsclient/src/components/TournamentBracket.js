import React, { useState, useEffect } from 'react';
import { Trophy, Users, Calendar, ArrowRight, Trash2, Plus, Monitor, ShieldCheck, FileText, Play, Shield } from 'lucide-react';
import '../styles/TournamentBracket.css';
import { tournamentService } from '../services/tournamentService';
import bracketService from '../services/bracketService';
import { useAuth } from '../contexts/AuthContext';
import TournamentSummaryReport from './TournamentSummaryReport';

const TournamentBracket = ({ onOpenLiveScoring }) => {
  const { user, token } = useAuth();

  // Tournament selection
  const [tournaments, setTournaments] = useState([]);
  const [selectedTournamentId, setSelectedTournamentIdRaw] = useState(
    () => { const v = sessionStorage.getItem('bracket_tournament'); return v ? parseInt(v) : null; }
  );
  const setSelectedTournamentId = (v) => {
    if (v) sessionStorage.setItem('bracket_tournament', v);
    else sessionStorage.removeItem('bracket_tournament');
    setSelectedTournamentIdRaw(v);
  };
  const [loadingTournaments, setLoadingTournaments] = useState(true);

  // Teams and matches from database
  const [teams, setTeams] = useState([]);
  const [dbMatches, setDbMatches] = useState([]);

  // Additional state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [newTeamName, setNewTeamName] = useState('');
  const [draggedTeam, setDraggedTeam] = useState(null);
  const [savingTeam, setSavingTeam] = useState(false);
  const [deletingTeam, setDeletingTeam] = useState(null);
  const [savingMatch, setSavingMatch] = useState(null);
  const [selectedTournament, setSelectedTournament] = useState(null);
  const [showSummaryReport, setShowSummaryReport] = useState(false);

  // ==================== LOAD TOURNAMENTS ====================
  useEffect(() => {
    const loadTournaments = async () => {
      try {
        setLoadingTournaments(true);
        const data = await tournamentService.getAllTournaments();
        setTournaments(data || []);
      } catch (err) {
        console.error('Failed to load tournaments:', err);
        setError(err.message);
      } finally {
        setLoadingTournaments(false);
      }
    };

    loadTournaments();
  }, []);

  // ==================== LOAD BRACKET DATA ====================
  useEffect(() => {
    if (!selectedTournamentId) {
      setTeams([]);
      setDbMatches([]);
      setSelectedTournament(null);
      return;
    }

    const loadBracketData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Load selected tournament
        const tournament = await tournamentService.getTournamentById(selectedTournamentId);
        setSelectedTournament(tournament);

        // Load teams and matches for this tournament
        const [teamsList, matchesList] = await Promise.all([
          bracketService.getTeams(selectedTournamentId),
          bracketService.getMatches(selectedTournamentId),
        ]);

        setTeams(teamsList || []);
        setDbMatches(matchesList || []);
      } catch (err) {
        console.error('Failed to load bracket data:', err);
        setError(err.message);
        setTeams([]);
        setDbMatches([]);
      } finally {
        setLoading(false);
      }
    };

    loadBracketData();
  }, [selectedTournamentId]);

  // ==================== TEAM MANAGEMENT ====================

  const handleAddTeam = async () => {
    if (!newTeamName.trim() || !selectedTournamentId || !token) {
      return;
    }

    try {
      setSavingTeam(true);
      setError(null);

      const newTeam = await bracketService.createTeam(
        selectedTournamentId,
        { TeamName: newTeamName.trim() },
        token
      );

      setTeams([...teams, newTeam]);
      setNewTeamName('');
    } catch (err) {
      console.error('Failed to add team:', err);
      setError(err.message);
    } finally {
      setSavingTeam(false);
    }
  };

  const handleRemoveTeam = async (teamId) => {
    if (!selectedTournamentId || !token) return;

    try {
      setDeletingTeam(teamId);
      setError(null);

      await bracketService.deleteTeam(selectedTournamentId, teamId, token);

      setTeams(teams.filter(t => t.id !== teamId));
      setDbMatches(dbMatches.filter(m => m.team1Id !== teamId && m.team2Id !== teamId));
    } catch (err) {
      console.error('Failed to remove team:', err);
      setError(err.message);
    } finally {
      setDeletingTeam(null);
    }
  };

  const handleDragStart = (e, teamId) => {
    setDraggedTeam(teamId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDropRemoveZone = (e) => {
    e.preventDefault();
    if (draggedTeam) {
      handleRemoveTeam(draggedTeam);
      setDraggedTeam(null);
    }
  };

  // ==================== MATCH MANAGEMENT ====================

  const handleMatchClick = async (matchInfo, isTiebreaker = false) => {
    if (!selectedTournamentId) return;

    if (!token) {
      sessionStorage.setItem('ls_tournament', String(selectedTournamentId));
      if (matchInfo.dbId) sessionStorage.setItem('ls_match', String(matchInfo.dbId));
      if (onOpenLiveScoring) onOpenLiveScoring();
      return;
    }

    try {
      setLoading(true);
      setError(null);

      let dbMatchId = matchInfo.dbId;
      if (!dbMatchId) {
        const createdMatch = await bracketService.createMatch(
          selectedTournamentId,
          {
            Team1Id: matchInfo.team1.id,
            Team2Id: matchInfo.team2.id,
            IsPlayoff: isTiebreaker,
          },
          token
        );
        dbMatchId = createdMatch.id;
      }

      sessionStorage.setItem('ls_tournament', String(selectedTournamentId));
      sessionStorage.setItem('ls_match', String(dbMatchId));
      if (onOpenLiveScoring) onOpenLiveScoring();
    } catch (err) {
      console.error('Failed to prepare match for scoring:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const generateMatchups = () => {
    const matchups = [];
    const regularMatches = dbMatches.filter(m => !m.isPlayoff);

    for (let i = 0; i < teams.length; i++) {
      for (let j = i + 1; j < teams.length; j++) {
        const matchKey = `${teams[i].id}_${teams[j].id}`;
        const dbMatch = regularMatches.find(
          m => (m.team1Id === teams[i].id && m.team2Id === teams[j].id) ||
               (m.team1Id === teams[j].id && m.team2Id === teams[i].id)
        );

        matchups.push({
          key: matchKey,
          dbId: dbMatch?.id,
          team1: teams[i],
          team2: teams[j],
          winner: dbMatch?.winnerId || null,
        });
      }
    }
    return matchups;
  };

  const calculateStandings = () => {
    const standings = teams.map(team => ({
      ...team,
      wins: 0,
      losses: 0,
    }));

    const regularMatches = dbMatches.filter(m => !m.isPlayoff);
    regularMatches.forEach(match => {
      const team1Index = standings.findIndex(t => t.id === match.team1Id);
      const team2Index = standings.findIndex(t => t.id === match.team2Id);

      if (team1Index === -1 || team2Index === -1) return;

      if (match.winnerId === match.team1Id) {
        standings[team1Index].wins++;
        standings[team2Index].losses++;
      } else if (match.winnerId === match.team2Id) {
        standings[team2Index].wins++;
        standings[team1Index].losses++;
      }
    });

    return standings.sort((a, b) => b.wins - a.wins);
  };

  const generateTiebreakers = () => {
    const standings = calculateStandings();
    const tiebreakMatches = [];

    const winGroups = {};
    standings.forEach(team => {
      if (!winGroups[team.wins]) {
        winGroups[team.wins] = [];
      }
      winGroups[team.wins].push(team);
    });

    Object.values(winGroups).forEach(group => {
      if (group.length >= 2) {
        for (let i = 0; i < group.length; i++) {
          for (let j = i + 1; j < group.length; j++) {
            const playoffMatches = dbMatches.filter(m => m.isPlayoff);
            const existingTB = playoffMatches.find(
              m => (m.team1Id === group[i].id && m.team2Id === group[j].id) ||
                   (m.team1Id === group[j].id && m.team2Id === group[i].id)
            );

            const tiebreakKey = `TB_${group[i].id}_${group[j].id}`;
            tiebreakMatches.push({
              key: tiebreakKey,
              dbId: existingTB?.id,
              team1: group[i],
              team2: group[j],
              winner: existingTB?.winnerId || null,
            });
          }
        }
      }
    });

    return tiebreakMatches;
  };

  const calculateFinalStandings = () => {
    const standings = calculateStandings();
    const tiebreakers = generateTiebreakers();

    tiebreakers.forEach(tb => {
      const team1Index = standings.findIndex(t => t.id === tb.team1.id);
      const team2Index = standings.findIndex(t => t.id === tb.team2.id);

      if (team1Index === -1 || team2Index === -1) return;

      if (tb.winner === tb.team1.id) {
        standings[team1Index].wins++;
        standings[team2Index].losses++;
      } else if (tb.winner === tb.team2.id) {
        standings[team2Index].wins++;
        standings[team1Index].losses++;
      }
    });

    return standings.sort((a, b) => b.wins - a.wins);
  };

  const handleClearBracket = async () => {
    if (!selectedTournamentId || !token || !window.confirm('Are you sure you want to delete the entire bracket?')) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await bracketService.deleteBracket(selectedTournamentId, token);
      setTeams([]);
      setDbMatches([]);
    } catch (err) {
      console.error('Failed to clear bracket:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ==================== COMPUTE DERIVED STATE ====================
  const matchups = generateMatchups();
  const tiebreakers_list = generateTiebreakers();
  const finalStandings = calculateFinalStandings();

  const totalMatches = matchups.length;
  const completedMatches = matchups.filter(m => m.winner).length;
  const totalTiebreakers = tiebreakers_list.length;
  const completedTiebreakers = tiebreakers_list.filter(t => t.winner).length;

  return (
    <div className="tournament-bracket-container">
      <h2>Tournament Arena</h2>

      {error && <div className="error-message">{error}</div>}

      {/* TOURNAMENT SELECTOR */}
      {!selectedTournamentId && (
        loadingTournaments ? (
          <div className="loading">Initializing Tournament Data...</div>
        ) : (
          <div className="tournament-picker">
            <p className="picker-label">Choose an active tournament to manage or view:</p>
            <div className="tournament-cards">
              {tournaments.map(t => (
                <button
                  key={t.id}
                  className="tournament-card-btn"
                  onClick={() => setSelectedTournamentId(parseInt(t.id))}
                >
                  <span className="tc-name">{t.name}</span>
                  <div className="tc-arrow"><ArrowRight size={18} /></div>
                </button>
              ))}
            </div>
          </div>
        )
      )}

      {selectedTournamentId && (
        <div className="bracket-active-header">
          <div className="bracket-tournament-name">
            <Trophy size={20} color="#FF5C00" />
            {tournaments.find(t => t.id === selectedTournamentId)?.name || 'Tournament'}
          </div>
          <button
            className="btn-change-tournament"
            onClick={() => setSelectedTournamentId(null)}
          >Switch Tournament</button>
        </div>
      )}

      {selectedTournamentId && (
        <div className="bracket-wrapper">
          {loading && <div className="loading">Synchronizing bracket...</div>}

          {/* TEAMS MANAGEMENT SECTION */}
          <div className="teams-management-section">
            <div className="left-panel">
              <h3><Users size={18} /> Squad Management</h3>
              <div className="add-team-form">
                <input
                  type="text"
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddTeam()}
                  placeholder="Enter Athlete or Team Name"
                  className="team-input-add"
                  disabled={savingTeam || !token}
                />
                <button
                  onClick={handleAddTeam}
                  className="btn-add-team"
                  disabled={savingTeam || !token}
                >
                  {savingTeam ? 'Adding...' : <Plus size={18} />}
                </button>
              </div>

              <div className="teams-list-container">
                <h4>Registered Athletes ({teams.length})</h4>
                <div className="teams-list">
                  {teams.length === 0 ? (
                    <p style={{ opacity: 0.5, fontSize: '0.9rem' }}>No athletes registered yet.</p>
                  ) : (
                    teams.map((team) => (
                      <div
                        key={team.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, team.id)}
                        className={`team-item-managed ${deletingTeam === team.id ? 'deleting' : ''}`}
                      >
                        <span>{team.teamName}</span>
                        <div className="drag-hint">
                           {token ? <Trash2 size={14} color="#f56565" /> : <ShieldCheck size={14} color="#94a3b8" />}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {token && teams.length > 0 && (
                  <div
                    className="remove-zone"
                    onDragOver={handleDragOver}
                    onDrop={handleDropRemoveZone}
                  >
                    Drag Athlete here to Remove
                  </div>
                )}
              </div>
            </div>

            <div className="right-panel">
              <h3><Monitor size={18} /> Broadcaster Summary</h3>
              <div className="tournament-info">
                <div className="info-box">
                  <span className="info-label">Matches</span>
                  <span className="info-value">{completedMatches}/{totalMatches}</span>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{
                      width: totalMatches > 0 ? `${(completedMatches / totalMatches) * 100}%` : '0%',
                    }}
                  ></div>
                </div>

                {totalTiebreakers > 0 && (
                  <>
                    <div className="info-box">
                      <span className="info-label">Tiebreakers</span>
                      <span className="info-value">{completedTiebreakers}/{totalTiebreakers}</span>
                    </div>
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{
                          width: totalTiebreakers > 0 ? `${(completedTiebreakers / totalTiebreakers) * 100}%` : '0%',
                          background: '#ca8a04'
                        }}
                      ></div>
                    </div>
                  </>
                )}
              </div>

              {finalStandings.length > 0 && (
                <div className="leader-card">
                  <h4 style={{ color: '#FF5C00', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '8px' }}>Current Leader</h4>
                  <div className="leader-name">{finalStandings[0].teamName}</div>
                  <div className="leader-stats">
                    <span className="stat-wins">{finalStandings[0].wins} Wins</span>
                  </div>
                </div>
              )}

              {token && teams.length > 0 && (
                <button onClick={handleClearBracket} className="btn-clear-bracket" style={{ marginTop: '20px' }}>
                  Clear Tournament Data
                </button>
              )}
            </div>
          </div>

          {/* MATCHUPS SECTION */}
          <div className="matchups-section">
            <h3><Calendar size={18} /> Schedule & Results</h3>
            <div className="matchups-container">
              {matchups.length === 0 ? (
                <p className="no-matchups">Add at least 2 athletes to generate the tournament schedule</p>
              ) : (
                <div className="matchups-grid">
                  {matchups.map((match) => (
                    <div 
                      key={match.key} 
                      className="match-card" 
                      onClick={() => handleMatchClick(match, false)} 
                      style={{ cursor: 'pointer' }}
                    >
                      <div className={`match-team team1 ${match.winner === match.team1.id ? 'winner-bg' : ''}`}>
                        <span>{match.team1.teamName}</span>
                        {match.winner === match.team1.id && <Trophy size={14} color="#FF5C00" />}
                      </div>
                      <div className="match-vs">
                        <span>VS</span>
                      </div>
                      <div className={`match-team team2 ${match.winner === match.team2.id ? 'winner-bg' : ''}`}>
                        <span>{match.team2.teamName}</span>
                        {match.winner === match.team2.id && <Trophy size={14} color="#FF5C00" />}
                      </div>
                      <div className="score-match-btn">
                        <Monitor size={12} /> Score Match
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* PLAYOFF / TIEBREAKER SECTION */}
          {tiebreakers_list.length > 0 && (
            <div className="matchups-section playoff-section">
              <div className="section-header-row">
                <h3><ShieldCheck size={18} color="#ca8a04" /> Playoff Matchups (Tiebreakers)</h3>
                <span className="playoff-badge">DECISIVE MATCHES</span>
              </div>
              <div className="matchups-container">
                <div className="matchups-grid">
                  {tiebreakers_list.map((match) => (
                    <div 
                      key={match.key} 
                      className="match-card playoff-card" 
                      onClick={() => handleMatchClick(match, true)} 
                    >
                      <div className={`match-team team1 ${match.winner === match.team1.id ? 'winner-bg' : ''}`}>
                        <span>{match.team1.teamName}</span>
                        {match.winner === match.team1.id && <Trophy size={14} color="#FF5C00" />}
                      </div>
                      <div className="match-vs"><span>VS</span></div>
                      <div className={`match-team team2 ${match.winner === match.team2.id ? 'winner-bg' : ''}`}>
                        <span>{match.team2.teamName}</span>
                        {match.winner === match.team2.id && <Trophy size={14} color="#FF5C00" />}
                      </div>
                      <div className="score-match-btn playoff-btn">
                        <Play size={12} /> Score Playoff
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STANDINGS SECTION */}
          <div className="standings-section">
            <h3>Standings Registry</h3>
            {finalStandings.length === 0 ? (
              <p style={{ opacity: 0.5 }}>Register athletes to view real-time standings.</p>
            ) : (
              <div className="standings-table-container">
                <div className="standings-header">
                  <div className="pos">Rank</div>
                  <div className="team">Athlete</div>
                  <div className="wins">W</div>
                  <div className="losses">L</div>
                </div>
                {finalStandings.map((team, index) => (
                  <div key={team.id} className={`standings-row ${index === 0 ? 'champion' : ''}`}>
                    <div className="pos">
                      {index === 0 ? <Trophy size={16} color="#FF5C00" /> : `#${index + 1}`}
                    </div>
                    <div className="team">{team.teamName}</div>
                    <div className="wins">{team.wins}</div>
                    <div className="losses">{team.losses}</div>
                  </div>
                ))}
              </div>
            )}

            {finalStandings.length > 0 && finalStandings[0].wins > 0 && (
              <div className="winner-announcement-pro">
                <div className="trophy-broadcast-wrapper">
                  <div className="trophy-glow"></div>
                  <Trophy size={80} color="#FFD700" strokeWidth={2.5} />
                </div>
                <div className="champion-badge">OFFICIAL TOURNAMENT CHAMPION</div>
                <h2 className="champion-name-display">{finalStandings[0].teamName}</h2>
                <div className="champion-meta">
                  <div className="meta-item">
                    <span className="meta-label">RECORD</span>
                    <span className="meta-value">{finalStandings[0].wins}W - {finalStandings[0].losses}L</span>
                  </div>
                  <div className="meta-divider"></div>
                  <div className="meta-item">
                    <span className="meta-label">STATUS</span>
                    <span className="meta-value">UNDISPUTED</span>
                  </div>
                </div>
              </div>
            )}

            {/* SUMMARY REPORT BUTTON */}
            {finalStandings.length > 0 && (
              <div style={{ textAlign: 'center', marginTop: '32px' }}>
                <button
                  className="btn-add-team"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                  onClick={() => setShowSummaryReport(true)}
                >
                  <FileText size={18} /> Download Tournament Summary
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      {showSummaryReport && (
        <TournamentSummaryReport
          tournament={selectedTournament}
          teams={teams}
          matchups={matchups}
          tiebreakers={tiebreakers_list}
          finalStandings={finalStandings}
          onClose={() => setShowSummaryReport(false)}
        />
      )}
    </div>
  );
};

export default TournamentBracket;
