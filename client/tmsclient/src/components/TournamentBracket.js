import React, { useState, useEffect } from 'react';
import '../styles/TournamentBracket.css';
import { tournamentService } from '../services/tournamentService';
import bracketService from '../services/bracketService';
import { useAuth } from '../contexts/AuthContext';

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
      console.error('Invalid team name, tournament, or token');
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

    // If no token, just open for viewing (read-only) — still stay in dashboard
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

      // Write selections to sessionStorage then switch tab — no page navigation
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

  const handleMatchWinner = async (matchKey, winnerId) => {
    if (!selectedTournamentId || !token) return;

    try {
      setSavingMatch(matchKey);
      setError(null);

      const matchups = generateMatchups();
      const matchup = matchups.find(m => m.key === matchKey);

      if (!matchup) return;

      // If match doesn't exist in DB yet, create it
      let dbMatchId = matchup.dbId;
      if (!dbMatchId) {
        const createdMatch = await bracketService.createMatch(
          selectedTournamentId,
          {
            Team1Id: matchup.team1.id,
            Team2Id: matchup.team2.id,
            IsPlayoff: false,
          },
          token
        );
        dbMatchId = createdMatch.id;
      }

      // Update/toggle winner
      const newWinnerId = matchup.winner === winnerId ? null : winnerId;
      const updated = await bracketService.updateMatch(
        selectedTournamentId,
        dbMatchId,
        { WinnerId: newWinnerId },
        token
      );

      // Reload matches from DB
      const updatedMatches = await bracketService.getMatches(selectedTournamentId);
      setDbMatches(updatedMatches || []);
    } catch (err) {
      console.error('Failed to update match:', err);
      setError(err.message);
    } finally {
      setSavingMatch(null);
    }
  };

  // ==================== STANDINGS & TIEBREAKER LOGIC ====================

  const calculateStandings = () => {
    const standings = teams.map(team => ({
      ...team,
      wins: 0,
      losses: 0,
      draws: 0,
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

    // Group teams by wins
    const winGroups = {};
    standings.forEach(team => {
      if (!winGroups[team.wins]) {
        winGroups[team.wins] = [];
      }
      winGroups[team.wins].push(team);
    });

    // For groups with 2+ teams tied, get/create tiebreaker matches
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

  const handleTiebreakerWinner = async (tiebreakKey, winnerId) => {
    if (!selectedTournamentId || !token) return;

    try {
      setSavingMatch(tiebreakKey);
      setError(null);

      const tiebreakers = generateTiebreakers();
      const tb = tiebreakers.find(t => t.key === tiebreakKey);

      if (!tb) return;

      // If tiebreaker doesn't exist in DB yet, create it
      let dbMatchId = tb.dbId;
      if (!dbMatchId) {
        const createdMatch = await bracketService.createMatch(
          selectedTournamentId,
          {
            Team1Id: tb.team1.id,
            Team2Id: tb.team2.id,
            IsPlayoff: true,
          },
          token
        );
        dbMatchId = createdMatch.id;
      }

      // Update/toggle winner
      const newWinnerId = tb.winner === winnerId ? null : winnerId;
      await bracketService.updateMatch(
        selectedTournamentId,
        dbMatchId,
        { WinnerId: newWinnerId },
        token
      );

      // Reload matches from DB
      const updatedMatches = await bracketService.getMatches(selectedTournamentId);
      setDbMatches(updatedMatches || []);
    } catch (err) {
      console.error('Failed to update tiebreaker:', err);
      setError(err.message);
    } finally {
      setSavingMatch(null);
    }
  };

  const calculateFinalStandings = () => {
    const standings = calculateStandings();
    const tiebreakers = generateTiebreakers();

    // Apply tiebreaker results
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

  // ==================== HANDLE CLEAR BRACKET ====================

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

  // ==================== RENDER ====================

  return (
    <div className="tournament-bracket-container">
      <h2>Round Robin Tournament</h2>

      {error && <div className="error-message">{error}</div>}

      {/* TOURNAMENT SELECTOR */}
      {!selectedTournamentId && (
        loadingTournaments ? (
          <div className="loading">Loading tournaments...</div>
        ) : (
          <div className="tournament-picker">
            <p className="picker-label">Select a tournament to view its bracket:</p>
            <div className="tournament-cards">
              {tournaments.map(t => (
                <button
                  key={t.id}
                  className="tournament-card-btn"
                  onClick={() => setSelectedTournamentId(parseInt(t.id))}
                >
                  <span className="tc-name">{t.name}</span>
                  <span className="tc-arrow">Select &rarr;</span>
                </button>
              ))}
            </div>
          </div>
        )
      )}

      {selectedTournamentId && (
        <div className="bracket-active-header">
          <span className="bracket-tournament-name">
            {tournaments.find(t => t.id === selectedTournamentId)?.name || 'Tournament'}
          </span>
          <button
            className="btn-change-tournament"
            onClick={() => setSelectedTournamentId(null)}
          >Change</button>
        </div>
      )}

      {selectedTournamentId && (
        <div className="bracket-wrapper">
          {loading && <div className="loading">Loading bracket data...</div>}

          {/* TEAMS MANAGEMENT SECTION */}
          <div className="teams-management-section">
            <div className="left-panel">
              <h3>Add/Manage Teams</h3>
              <div className="add-team-form">
                <input
                  type="text"
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddTeam()}
                  placeholder="Enter team name..."
                  className="team-input-add"
                  disabled={savingTeam || !token}
                />
                <button
                  onClick={handleAddTeam}
                  className="btn-add-team"
                  disabled={savingTeam || !token}
                >
                  {savingTeam ? 'Adding...' : '+ Add Team'}
                </button>
              </div>

              <div className="teams-list-container">
                <h4>Teams ({teams.length})</h4>
                <div className="teams-list">
                  {teams.map((team) => (
                    <div
                      key={team.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, team.id)}
                      className={`team-item-managed ${deletingTeam === team.id ? 'deleting' : ''}`}
                      title={token ? 'Drag to remove' : 'Login to remove'}
                    >
                      <span>{team.teamName}</span>
                      <span className="drag-hint">{token ? 'Remove' : 'Locked'}</span>
                    </div>
                  ))}
                </div>

                {token && (
                  <div
                    className="remove-zone"
                    onDragOver={handleDragOver}
                    onDrop={handleDropRemoveZone}
                  >
                    <p>Drag team here to remove</p>
                  </div>
                )}
              </div>
            </div>

            <div className="right-panel">
              <h3>Tournament Info</h3>
              <div className="tournament-info">
                <div className="info-box">
                  <span className="info-label">Total Teams:</span>
                  <span className="info-value">{teams.length}</span>
                </div>
                <div className="info-box">
                  <span className="info-label">Round Robin Matches:</span>
                  <span className="info-value">{totalMatches}</span>
                </div>
                <div className="info-box">
                  <span className="info-label">Completed:</span>
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
                    <div className="info-box tiebreaker-info">
                      <span className="info-label">Tiebreaker Matches:</span>
                      <span className="info-value">{completedTiebreakers}/{totalTiebreakers}</span>
                    </div>
                    <div className="progress-bar">
                      <div
                        className="progress-fill tiebreaker-fill"
                        style={{
                          width: totalTiebreakers > 0 ? `${(completedTiebreakers / totalTiebreakers) * 100}%` : '0%',
                        }}
                      ></div>
                    </div>
                  </>
                )}
              </div>

              {finalStandings.length > 0 && (
                <div className="current-leader">
                  <h4>Current Leader</h4>
                  <div className="leader-card">
                    <div className="leader-name">{finalStandings[0].teamName}</div>
                    <div className="leader-stats">
                      <span className="stat-wins">{finalStandings[0].wins} Wins</span>
                    </div>
                  </div>
                </div>
              )}

              {token && teams.length > 0 && (
                <button onClick={handleClearBracket} className="btn-clear-bracket">
                  Clear Bracket
                </button>
              )}
            </div>
          </div>

          {/* MATCHUPS SECTION */}
          <div className="matchups-section">
            <h3>Schedule & Results</h3>
            <div className="matchups-container">
              {matchups.length === 0 ? (
                <p className="no-matchups">Add at least 2 teams to generate matchups</p>
              ) : (
                <div className="matchups-grid">
                  {matchups.map((match) => (
                    <div 
                      key={match.key} 
                      className="match-card" 
                      onClick={() => handleMatchClick(match, false)} 
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="match-team team1">
                        <div
                          className={`team-btn ${match.winner === match.team1.id ? 'winner' : ''}`}
                        >
                          {match.winner === match.team1.id && '✓ '}
                          {match.team1.teamName}
                        </div>
                      </div>
                      <div className="match-vs">
                        <div style={{marginBottom: "5px"}}>vs</div>
                        <div style={{fontSize: '0.75rem', color: '#3498db', textDecoration: 'underline'}}>Score Match</div>
                      </div>
                      <div className="match-team team2">
                        <div
                          className={`team-btn ${match.winner === match.team2.id ? 'winner' : ''}`}
                        >
                          {match.winner === match.team2.id && '✓ '}
                          {match.team2.teamName}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* TIEBREAKER SECTION */}
          {tiebreakers_list.length > 0 && (
            <div className="tiebreaker-section">
              <h3>Playoff Matches</h3>
              <div className="tiebreaker-info-box">
                <p>These teams are tied with the same number of wins. Play these tiebreaker matches to determine the final ranking.</p>
              </div>
              <div className="matchups-container">
                <div className="matchups-grid">
                  {tiebreakers_list.map((tb) => (
                    <div 
                      key={tb.key} 
                      className="match-card tiebreaker-card" 
                      onClick={() => handleMatchClick(tb, true)} 
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="tiebreaker-badge">PLAYOFF</div>
                      <div className="match-team team1">
                        <div
                          className={`team-btn ${tb.winner === tb.team1.id ? 'winner' : ''}`}
                        >
                          {tb.winner === tb.team1.id && '✓ '}
                          {tb.team1.teamName}
                        </div>
                      </div>
                      <div className="match-vs">
                        <div style={{marginBottom: "5px"}}>vs</div>
                        <div style={{fontSize: '0.75rem', color: '#3498db', textDecoration: 'underline'}}>Score Match</div>
                      </div>
                      <div className="match-team team2">
                        <div
                          className={`team-btn ${tb.winner === tb.team2.id ? 'winner' : ''}`}
                        >
                          {tb.winner === tb.team2.id && '✓ '}
                          {tb.team2.teamName}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STANDINGS SECTION */}
          <div className="standings-section">
            <h3>Final Standings {totalTiebreakers > 0 && '(After Playoffs)'}</h3>
            {finalStandings.length === 0 ? (
              <p className="no-standings">Add teams to see standings</p>
            ) : (
              <div className="standings-table">
                <div className="standings-header">
                  <div className="pos">Position</div>
                  <div className="team">Team</div>
                  <div className="wins">Wins</div>
                  <div className="losses">Losses</div>
                </div>
                {finalStandings.map((team, index) => (
                  <div key={team.id} className={`standings-row ${index === 0 ? 'champion' : ''}`}>
                    <div className="pos">
                      {index === 0 && '1st'}
                      {index === 1 && '2nd'}
                      {index === 2 && '3rd'}
                      {index > 2 && `#${index + 1}`}
                    </div>
                    <div className="team">{team.teamName}</div>
                    <div className="wins">{team.wins}</div>
                    <div className="losses">{team.losses}</div>
                  </div>
                ))}
              </div>
            )}

            {finalStandings.length > 0 && finalStandings[0].wins > 0 && (
              <div className="winner-announcement">
                <h2>CHAMPION</h2>
                <p className="champion-name">{finalStandings[0].teamName}</p>
                <p className="champion-record">{finalStandings[0].wins} Wins</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TournamentBracket;
