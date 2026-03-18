import React, { useCallback, useEffect, useRef, useState } from "react";
import bracketService from "../services/bracketService";
import { tournamentService } from "../services/tournamentService";
import { useAuth } from "../contexts/AuthContext";
import { useParams } from "react-router-dom";
import "../styles/LiveScoring.css";

// ─────────────────────────────────────────────
// TENNIS POINT SEQUENCE (within a single game)
//   index: 0=Love  1=15  2=30  3=40
//   Deuce / Advantage / Game handled separately
// ─────────────────────────────────────────────
const POINT_LABELS = ["Love", "15", "30", "40"];

function initialGameState() {
  return { p1: 0, p2: 0, deuce: false, advantage: null }; // advantage: null | 1 | 2
}

// Returns the next game state after player (1 or 2) scores.
// Returns { state, gameWon: 1|2|null }
function scorePoint(gs, player) {
  let { p1, p2, deuce, advantage } = gs;

  if (deuce) {
    if (advantage === null) {
      // First point after deuce → Advantage
      return { state: { p1, p2, deuce: true, advantage: player }, gameWon: null };
    }
    if (advantage === player) {
      // They had Adv, won the game
      return { state: initialGameState(), gameWon: player };
    } else {
      // Other player scores → back to deuce (no advantage)
      return { state: { p1, p2, deuce: true, advantage: null }, gameWon: null };
    }
  }

  // Normal scoring
  if (player === 1) p1++;
  else p2++;

  if (p1 === 3 && p2 === 3) {
    // 40-40 → Deuce
    return { state: { p1, p2, deuce: true, advantage: null }, gameWon: null };
  }
  if (p1 >= 4) return { state: initialGameState(), gameWon: 1 };
  if (p2 >= 4) return { state: initialGameState(), gameWon: 2 };

  return { state: { p1, p2, deuce, advantage }, gameWon: null };
}

function gameScoreLabel(gs) {
  if (gs.deuce) {
    if (gs.advantage === null) return ["Deuce", "Deuce"];
    return gs.advantage === 1 ? ["Adv", "—"] : ["—", "Adv"];
  }
  return [POINT_LABELS[gs.p1] ?? "?", POINT_LABELS[gs.p2] ?? "?"];
}

// Is a set won? Returns 1, 2, or null.
// gamesNeeded = games to win set (default 6), mustLeadBy2 = true always
function setWinner(t1Games, t2Games, gamesNeeded) {
  const g = gamesNeeded;
  const total = t1Games + t2Games;
  // Tiebreak condition: both reached gamesNeeded → first to gamesNeeded+1 wins
  if (t1Games >= g && t2Games >= g) {
    if (t1Games >= g + 1 && t1Games > t2Games) return 1;
    if (t2Games >= g + 1 && t2Games > t1Games) return 2;
    return null;
  }
  if (t1Games >= g && t1Games - t2Games >= 2) return 1;
  if (t2Games >= g && t2Games - t1Games >= 2) return 2;
  return null;
}

function countSetsWon(setScores, gamesNeeded) {
  let t1 = 0, t2 = 0;
  setScores.forEach(s => {
    const w = setWinner(s.team1Games, s.team2Games, gamesNeeded);
    if (w === 1) t1++;
    else if (w === 2) t2++;
  });
  return [t1, t2];
}

// ─────────────────────────────────────────────
const LiveScoring = () => {
  const { urlTournamentId, urlMatchId } = useParams();
  const { token } = useAuth();

  const [tournaments, setTournaments] = useState([]);
  const [selectedTournament, setSelectedTournamentRaw] = useState(
    () => urlTournamentId || sessionStorage.getItem('ls_tournament') || ""
  );
  const setSelectedTournament = (v) => {
    sessionStorage.setItem('ls_tournament', v);
    setSelectedTournamentRaw(v);
  };

  const [matches, setMatches] = useState([]);
  const [selectedMatch, setSelectedMatchRaw] = useState(
    () => urlMatchId || sessionStorage.getItem('ls_match') || ""
  );
  const setSelectedMatch = (v) => {
    sessionStorage.setItem('ls_match', v);
    setSelectedMatchRaw(v);
  };

  const [teams, setTeams] = useState([]);

  // Config
  const [gamesNeeded, setGamesNeededRaw] = useState(
    () => parseInt(sessionStorage.getItem('ls_gamesNeeded') || '6')
  );
  const setGamesNeeded = (v) => { sessionStorage.setItem('ls_gamesNeeded', v); setGamesNeededRaw(v); };

  const [setsNeeded, setSetsNeededRaw] = useState(
    () => parseInt(sessionStorage.getItem('ls_setsNeeded') || '2')
  );
  const setSetsNeeded = (v) => { sessionStorage.setItem('ls_setsNeeded', v); setSetsNeededRaw(v); };

  // Set Scores persisted to DB
  const [setScores, setSetScores] = useState([]); // [{setNumber, team1Games, team2Games}]

  // Current live game state (in memory, synced to DB each update)
  const [gameState, setGameState] = useState(initialGameState());

  // Who is serving (null=not set, "1"=team1, "2"=team2)
  const [servingTeam, setServingTeam] = useState(null);
  const [matchStarted, setMatchStarted] = useState(false);
  const [matchWinner, setMatchWinner] = useState(null); // null | team object
  const [matchWinnerId, setMatchWinnerId] = useState(null);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const msgTimer = useRef(null);

  // ── helpers ───────────────────────────────
  const currentMatchObj = matches.find(m => m.id === parseInt(selectedMatch));
  const team1 = teams.find(t => t.id === currentMatchObj?.team1Id);
  const team2 = teams.find(t => t.id === currentMatchObj?.team2Id);

  const notify = (msg, isError = false) => {
    setMessage({ text: msg, error: isError });
    clearTimeout(msgTimer.current);
    msgTimer.current = setTimeout(() => setMessage(""), 4000);
  };

  // ── data load ─────────────────────────────
  useEffect(() => {
    tournamentService.getAllTournaments().then(setTournaments).catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedTournament) return;
    setLoading(true);
    Promise.all([
      bracketService.getMatches(selectedTournament),
      bracketService.getTeams(selectedTournament),
    ]).then(([m, t]) => {
      setMatches(m);
      setTeams(t);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [selectedTournament]);

  useEffect(() => {
    if (!selectedTournament || !selectedMatch) return;
    setLoading(true);
    setMatchWinner(null);
    setMatchWinnerId(null);
    setGameState(initialGameState());
    setServingTeam(null);
    setMatchStarted(false);
    Promise.all([
      bracketService.getMatchScores(selectedTournament, selectedMatch),
      bracketService.getLiveGameScore(selectedTournament, selectedMatch),
    ]).then(([scores, live]) => {
      setSetScores(scores || []);
      // Restore serving info if available
      if (live?.servingTeamId) {
        const match = matches.find(m => m.id === parseInt(selectedMatch));
        if (match) {
          setServingTeam(live.servingTeamId === match.team1Id ? "1" : "2");
          setMatchStarted(true);
        }
      }
      // Check if there's already a winner
      if (currentMatchObj?.winnerId) {
        setMatchWinnerId(currentMatchObj.winnerId);
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTournament, selectedMatch]);

  // ── auto save live state to DB ────────────
  const persistLiveScore = useCallback(async (gs, serving) => {
    if (!selectedTournament || !selectedMatch) return;
    const match = matches.find(m => m.id === parseInt(selectedMatch));
    if (!match) return;
    const [l1, l2] = gameScoreLabel(gs);
    const servingId = serving === "1" ? match.team1Id : serving === "2" ? match.team2Id : null;
    try {
      await bracketService.updateLiveGameScore(selectedTournament, selectedMatch, {
        Team1Points: l1,
        Team2Points: l2,
        ServingTeamId: servingId,
      }, token);
    } catch (e) {
      console.warn("Could not persist live score", e);
    }
  }, [selectedTournament, selectedMatch, matches, token]);

  // ── check & persist match winner ──────────
  const checkMatchWinner = useCallback(async (newSetScores) => {
    const match = matches.find(m => m.id === parseInt(selectedMatch));
    if (!match) return false;
    const [t1Sets, t2Sets] = countSetsWon(newSetScores, gamesNeeded);
    if (t1Sets >= setsNeeded) {
      await bracketService.updateMatch(selectedTournament, selectedMatch, { WinnerId: match.team1Id }, token);
      setMatchWinnerId(match.team1Id);
      setMatchWinner(teams.find(t => t.id === match.team1Id));
      notify(`${teams.find(t => t.id === match.team1Id)?.teamName} wins the match! Bracket updated.`);
      return true;
    }
    if (t2Sets >= setsNeeded) {
      await bracketService.updateMatch(selectedTournament, selectedMatch, { WinnerId: match.team2Id }, token);
      setMatchWinnerId(match.team2Id);
      setMatchWinner(teams.find(t => t.id === match.team2Id));
      notify(`${teams.find(t => t.id === match.team2Id)?.teamName} wins the match! Bracket updated.`);
      return true;
    }
    return false;
  }, [selectedTournament, selectedMatch, matches, teams, gamesNeeded, setsNeeded, token]);

  // ── award a game to a player (1 or 2) ────
  const awardGame = useCallback(async (player) => {
    if (matchWinnerId) return; // Match already over
    const match = matches.find(m => m.id === parseInt(selectedMatch));
    if (!match) return;

    setLoading(true);

    // Get current set or create first one
    let updatedSets = [...setScores];
    let currentSetIdx = updatedSets.length - 1;

    // If no sets exist, create Set 1
    if (updatedSets.length === 0) {
      const firstSet = { setNumber: 1, team1Games: 0, team2Games: 0 };
      await bracketService.updateMatchSetScore(selectedTournament, selectedMatch, 1, firstSet, token);
      updatedSets = [firstSet];
      currentSetIdx = 0;
    }

    let currentSet = { ...updatedSets[currentSetIdx] };

    // Was the last set already complete? If so, start a new one
    const prevWinner = setWinner(currentSet.team1Games, currentSet.team2Games, gamesNeeded);
    if (prevWinner !== null) {
      const newSetNum = updatedSets.length + 1;
      currentSet = { setNumber: newSetNum, team1Games: 0, team2Games: 0 };
      await bracketService.updateMatchSetScore(selectedTournament, selectedMatch, newSetNum, currentSet, token);
      updatedSets = [...updatedSets, currentSet];
      currentSetIdx = updatedSets.length - 1;
    }

    // Increment game count
    if (player === 1) currentSet = { ...currentSet, team1Games: currentSet.team1Games + 1 };
    else currentSet = { ...currentSet, team2Games: currentSet.team2Games + 1 };

    updatedSets[currentSetIdx] = currentSet;

    // Persist set update
    await bracketService.updateMatchSetScore(
      selectedTournament, selectedMatch, currentSet.setNumber, currentSet, token
    );
    setSetScores(updatedSets);

    // Rotate server after every game
    setServingTeam(prev => prev === "1" ? "2" : "1");

    // Check if this set is now won
    const setWon = setWinner(currentSet.team1Games, currentSet.team2Games, gamesNeeded);
    if (setWon !== null) {
      notify(`Set ${currentSet.setNumber} won by ${setWon === 1 ? team1?.teamName : team2?.teamName}!`);
      // Check match winner
      const matchOver = await checkMatchWinner(updatedSets);
      if (matchOver) {
        setLoading(false);
        return;
      }
      // Auto-create next set in DB
      const newSetNum = updatedSets.length + 1;
      const nextSet = { setNumber: newSetNum, team1Games: 0, team2Games: 0 };
      await bracketService.updateMatchSetScore(selectedTournament, selectedMatch, newSetNum, nextSet, token);
      setSetScores([...updatedSets, nextSet]);
      notify(`Set ${newSetNum} started.`);
    }

    setLoading(false);
  }, [
    matchWinnerId, matches, selectedMatch, setScores, gamesNeeded,
    selectedTournament, token, team1, team2, checkMatchWinner
  ]);

  // ── award a point to a player (1 or 2) ───
  const awardPoint = useCallback(async (player) => {
    if (matchWinnerId) return;
    if (!matchStarted) {
      notify("Please select first server before starting the match.", true);
      return;
    }

    const { state: newGs, gameWon } = scorePoint(gameState, player);
    setGameState(newGs);
    await persistLiveScore(newGs, servingTeam);

    if (gameWon) {
      await awardGame(gameWon);
      setGameState(initialGameState());
    }
  }, [gameState, matchWinnerId, matchStarted, servingTeam, persistLiveScore, awardGame]);

  // ── start match (pick first server) ──────
  const startMatch = (team) => {
    setServingTeam(team);
    setMatchStarted(true);
    notify(`${team === "1" ? team1?.teamName : team2?.teamName} serves first!`);
  };

  // ── delete set ────────────────────────────
  const handleDeleteSet = async (setNumber) => {
    if (!window.confirm(`Delete Set ${setNumber}? This cannot be undone.`)) return;
    setLoading(true);
    try {
      await bracketService.deleteMatchSetScore(selectedTournament, selectedMatch, setNumber, token);
      const newScores = setScores.filter(s => s.setNumber !== setNumber);
      setSetScores(newScores);
      // Re-check if winner still holds
      const match = matches.find(m => m.id === parseInt(selectedMatch));
      if (match) {
        const [t1, t2] = countSetsWon(newScores, gamesNeeded);
        if (t1 < setsNeeded && t2 < setsNeeded) {
          // clear winner
          await bracketService.updateMatch(selectedTournament, selectedMatch, { WinnerId: null }, token);
          setMatchWinnerId(null);
          setMatchWinner(null);
        }
      }
      notify(`Set ${setNumber} deleted.`);
    } catch (e) {
      notify("Failed to delete set.", true);
    }
    setLoading(false);
  };

  // ── derived ───────────────────────────────
  const [gsLabel1, gsLabel2] = gameScoreLabel(gameState);
  const [t1Sets, t2Sets] = countSetsWon(setScores, gamesNeeded);
  const matchTeams = currentMatchObj
    ? teams.filter(t => t.id === currentMatchObj.team1Id || t.id === currentMatchObj.team2Id)
    : [];

  // ─────────────────────────────────────────
  return (
    <div className="live-scoring-container">

      {message && (
        <div className={message.error ? "admin-error-message" : "admin-message"}>
          {message.text || message}
        </div>
      )}

      {/* ── Selectors ── */}
      <div className="selector-group">

        {/* Tournament picker: cards when none selected, header when one is */}
        {!selectedTournament ? (
          tournaments.length === 0 ? (
            <div className="loader">Loading tournaments...</div>
          ) : (
            <div className="tournament-picker">
              <p className="picker-label">Select a tournament to score:</p>
              <div className="tournament-cards">
                {tournaments.map(t => (
                  <button
                    key={t.id}
                    className="tournament-card-btn"
                    onClick={() => { setSelectedTournament(String(t.id)); setSelectedMatch(""); }}
                  >
                    <span className="tc-name">{t.name}</span>
                    <span className="tc-arrow">Select &rarr;</span>
                  </button>
                ))}
              </div>
            </div>
          )
        ) : (
          <div className="bracket-active-header">
            <span className="bracket-tournament-name">
              {tournaments.find(t => String(t.id) === String(selectedTournament))?.name || 'Tournament'}
            </span>
            <button
              className="btn-change-tournament"
              onClick={() => { setSelectedTournament(""); setSelectedMatch(""); }}
            >Change</button>
          </div>
        )}

        {selectedTournament && (
          <div className="form-field">
            <label>Match</label>
            <select
              className="modern-select"
              value={selectedMatch}
              onChange={e => setSelectedMatch(e.target.value)}
            >
              <option value="">-- Choose a Match --</option>
              {matches.map(m => (
                <option key={m.id} value={m.id}>
                  {teams.find(t => t.id === m.team1Id)?.teamName ?? "?"} vs {teams.find(t => t.id === m.team2Id)?.teamName ?? "?"}
                </option>
              ))}
            </select>
          </div>
        )}

        {selectedMatch && (
          <div className="rules-row">
            <div className="form-field">
              <label>Games to Win a Set</label>
              <input
                className="modern-select"
                type="number"
                min="4"
                max="12"
                value={gamesNeeded}
                onChange={e => setGamesNeeded(parseInt(e.target.value))}
              />
            </div>
            <div className="form-field">
              <label>Sets to Win Match</label>
              <input
                className="modern-select"
                type="number"
                min="1"
                max="5"
                value={setsNeeded}
                onChange={e => setSetsNeeded(parseInt(e.target.value))}
              />
            </div>
          </div>
        )}
      </div>

      {loading && <div className="loader">Updating...</div>}

      {/* ── Main scoring panel ── */}
      {selectedMatch && !loading && (() => {
        if (!team1 || !team2) return <div className="loader">Loading teams…</div>;
        return (
          <div className="live-score-section">

            {/* ── Match Winner Banner ── */}
            {matchWinnerId && (
              <div className="winner-banner">
                {teams.find(t => t.id === matchWinnerId)?.teamName} wins the match!
              </div>
            )}

            {/* ── First Server Selector ── */}
            {!matchStarted && (
              <div className="first-serve-card">
                <h3>Who serves first?</h3>
                <div className="first-serve-buttons">
                  <button className="btn-serve" onClick={() => startMatch("1")}>{team1.teamName}</button>
                  <button className="btn-serve" onClick={() => startMatch("2")}>{team2.teamName}</button>
                </div>
              </div>
            )}

            {/* ── Live Scoreboard ── */}
            {matchStarted && (
              <div className="scoreboard">
                {/* Header row */}
                <div className="scoreboard-header">
                  <div className="sb-team-name">
                    {team1.teamName}
                    {servingTeam === "1" && <span className="serve-dot" title="Serving">(S)</span>}
                  </div>
                  <div className="sb-sets">{t1Sets}</div>
                  {setScores.map(s => (
                    <div key={s.setNumber} className={`sb-set ${setWinner(s.team1Games, s.team2Games, gamesNeeded) === 1 ? "set-won" : ""}`}>
                      {s.team1Games}
                    </div>
                  ))}
                  <div className="sb-game">{gsLabel1}</div>
                </div>

                <div className="scoreboard-header">
                  <div className="sb-team-name">
                    {team2.teamName}
                    {servingTeam === "2" && <span className="serve-dot" title="Serving">(S)</span>}
                  </div>
                  <div className="sb-sets">{t2Sets}</div>
                  {setScores.map(s => (
                    <div key={s.setNumber} className={`sb-set ${setWinner(s.team1Games, s.team2Games, gamesNeeded) === 2 ? "set-won" : ""}`}>
                      {s.team2Games}
                    </div>
                  ))}
                  <div className="sb-game">{gsLabel2}</div>
                </div>
              </div>
            )}

            {/* ── Point Buttons ── */}
            {matchStarted && !matchWinnerId && (
              <div className="point-buttons-row">
                <button
                  className="btn-point btn-point-1"
                  onClick={() => awardPoint(1)}
                  disabled={loading}
                >
                  <span className="btn-point-name">{team1.teamName}</span>
                  <span className="btn-point-label">+ Point</span>
                </button>
                <div className="vs-chip">VS</div>
                <button
                  className="btn-point btn-point-2"
                  onClick={() => awardPoint(2)}
                  disabled={loading}
                >
                  <span className="btn-point-name">{team2.teamName}</span>
                  <span className="btn-point-label">+ Point</span>
                </button>
              </div>
            )}

            {/* ── Set Score Breakdown ── */}
            <h3 className="section-title">Set Breakdown</h3>
            {setScores.length === 0
              ? <p className="no-sets">No sets recorded yet. Points will auto-create sets.</p>
              : (
                <div className="sets-container">
                  {setScores.map(score => {
                    const winner = setWinner(score.team1Games, score.team2Games, gamesNeeded);
                    return (
                      <div key={score.setNumber} className={`set-score-card ${winner ? "set-completed" : ""}`}>
                        <span className="set-label">Set {score.setNumber}</span>
                        <div className="set-game-score">
                          <span className={winner === 1 ? "games-won" : "games-count"}>{score.team1Games}</span>
                          <span className="set-divider">–</span>
                          <span className={winner === 2 ? "games-won" : "games-count"}>{score.team2Games}</span>
                        </div>
                        {winner && (
                          <span className="set-winner-badge">
                            {winner === 1 ? team1.teamName : team2.teamName} won
                          </span>
                        )}
                        {!matchWinnerId && (
                          <button className="btn-delete" onClick={() => handleDeleteSet(score.setNumber)}>Delete</button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )
            }
          </div>
        );
      })()}
    </div>
  );
};

export default LiveScoring;
