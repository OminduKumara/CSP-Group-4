import React, { useCallback, useEffect, useRef, useState } from "react";
import bracketService from "../services/bracketService";
import { tournamentService } from "../services/tournamentService";
import { useAuth } from "../contexts/AuthContext";
import { useParams, useNavigate } from "react-router-dom";
import { 
  Trophy, Play, Settings, Trash2, 
  ChevronRight, ArrowLeft, RotateCcw, Activity, 
  User, CheckCircle, AlertTriangle, Plus, Search,
  Monitor, Layout
} from 'lucide-react';
import "../styles/LiveScoring.css";

// ─────────────────────────────────────────────
// TENNIS POINT SEQUENCE
// ─────────────────────────────────────────────
const POINT_LABELS = ["Love", "15", "30", "40"];

function initialGameState() {
  return { p1: 0, p2: 0, deuce: false, advantage: null }; 
}

function scorePoint(gs, player) {
  let { p1, p2, deuce, advantage } = gs;
  if (deuce) {
    if (advantage === null) return { state: { p1, p2, deuce: true, advantage: player }, gameWon: null };
    if (advantage === player) return { state: initialGameState(), gameWon: player };
    return { state: { p1, p2, deuce: true, advantage: null }, gameWon: null };
  }
  if (player === 1) p1++; else p2++;
  if (p1 === 3 && p2 === 3) return { state: { p1, p2, deuce: true, advantage: null }, gameWon: null };
  if (p1 >= 4) return { state: initialGameState(), gameWon: 1 };
  if (p2 >= 4) return { state: initialGameState(), gameWon: 2 };
  return { state: { p1, p2, deuce, advantage }, gameWon: null };
}

function gameScoreLabel(gs) {
  if (gs.deuce) {
    if (gs.advantage === null) return ["Deuce", "Deuce"];
    return gs.advantage === 1 ? ["Adv", "—"] : ["—", "Adv"];
  }
  return [POINT_LABELS[gs.p1] ?? "Love", POINT_LABELS[gs.p2] ?? "Love"];
}

function setWinner(t1Games, t2Games, gamesNeeded) {
  const g = gamesNeeded;
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
    if (w === 1) t1++; else if (w === 2) t2++;
  });
  return [t1, t2];
}

const LiveScoring = () => {
  const { urlTournamentId, urlMatchId } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();

  const [tournaments, setTournaments] = useState([]);
  const [selectedTournament, setSelectedTournamentRaw] = useState(
    () => urlTournamentId || sessionStorage.getItem('ls_tournament') || ""
  );
  
  const setSelectedTournament = (v) => { sessionStorage.setItem('ls_tournament', v); setSelectedTournamentRaw(v); };

  const [matches, setMatches] = useState([]);
  const [selectedMatch, setSelectedMatchRaw] = useState(
    () => urlMatchId || sessionStorage.getItem('ls_match') || ""
  );

  const setSelectedMatch = (v) => { sessionStorage.setItem('ls_match', v); setSelectedMatchRaw(v); };

  const [teams, setTeams] = useState([]);
  const [gamesNeeded, setGamesNeededRaw] = useState(() => parseInt(sessionStorage.getItem('ls_gamesNeeded') || '6'));
  const setGamesNeeded = (v) => { sessionStorage.setItem('ls_gamesNeeded', v); setGamesNeededRaw(v); };

  const [setsNeeded, setSetsNeededRaw] = useState(() => parseInt(sessionStorage.getItem('ls_setsNeeded') || '2'));
  const setSetsNeeded = (v) => { sessionStorage.setItem('ls_setsNeeded', v); setSetsNeededRaw(v); };

  const [setScores, setSetScores] = useState([]); 
  const [gameState, setGameState] = useState(initialGameState());
  const [servingTeam, setServingTeam] = useState(null);
  const [matchStarted, setMatchStarted] = useState(false);
  const [matchWinnerId, setMatchWinnerId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const msgTimer = useRef(null);

  const currentMatchObj = matches.find(m => m.id === parseInt(selectedMatch));
  const team1 = teams.find(t => t.id === currentMatchObj?.team1Id);
  const team2 = teams.find(t => t.id === currentMatchObj?.team2Id);

  const notify = (msg, isError = false) => {
    setMessage({ text: msg, error: isError });
    clearTimeout(msgTimer.current);
    msgTimer.current = setTimeout(() => setMessage(""), 4000);
  };

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
      setMatches(m); setTeams(t); setLoading(false);
    }).catch(() => setLoading(false));
  }, [selectedTournament]);

  useEffect(() => {
    if (!selectedTournament || !selectedMatch) return;
    setLoading(true);
    setMatchWinnerId(null);
    setGameState(initialGameState());
    setServingTeam(null);
    setMatchStarted(false);
    Promise.all([
      bracketService.getMatchScores(selectedTournament, selectedMatch),
      bracketService.getLiveGameScore(selectedTournament, selectedMatch),
    ]).then(([scores, live]) => {
      setSetScores(scores || []);
      if (live?.servingTeamId) {
        const match = matches.find(m => m.id === parseInt(selectedMatch));
        if (match) {
          setServingTeam(live.servingTeamId === match.team1Id ? "1" : "2");
          setMatchStarted(true);
        }
      }
      if (currentMatchObj?.winnerId) setMatchWinnerId(currentMatchObj.winnerId);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [selectedTournament, selectedMatch, matches, currentMatchObj]);

  const persistLiveScore = useCallback(async (gs, serving) => {
    if (!selectedTournament || !selectedMatch) return;
    const match = matches.find(m => m.id === parseInt(selectedMatch));
    if (!match) return;
    const [l1, l2] = gameScoreLabel(gs);
    const servingId = serving === "1" ? match.team1Id : serving === "2" ? match.team2Id : null;
    try {
      await bracketService.updateLiveGameScore(selectedTournament, selectedMatch, {
        Team1Points: l1, Team2Points: l2, ServingTeamId: servingId,
      }, token);
    } catch (e) { console.warn("Could not persist live score", e); }
  }, [selectedTournament, selectedMatch, matches, token]);

  const checkMatchWinner = useCallback(async (newSetScores) => {
    const match = matches.find(m => m.id === parseInt(selectedMatch));
    if (!match) return false;
    const [t1Sets, t2Sets] = countSetsWon(newSetScores, gamesNeeded);
    if (t1Sets >= setsNeeded) {
      await bracketService.updateMatch(selectedTournament, selectedMatch, { WinnerId: match.team1Id }, token);
      setMatchWinnerId(match.team1Id);
      notify(`${teams.find(t => t.id === match.team1Id)?.teamName} wins!`);
      return true;
    }
    if (t2Sets >= setsNeeded) {
      await bracketService.updateMatch(selectedTournament, selectedMatch, { WinnerId: match.team2Id }, token);
      setMatchWinnerId(match.team2Id);
      notify(`${teams.find(t => t.id === match.team2Id)?.teamName} wins!`);
      return true;
    }
    return false;
  }, [selectedTournament, selectedMatch, matches, teams, gamesNeeded, setsNeeded, token]);

  const awardGame = useCallback(async (player) => {
    if (matchWinnerId) return;
    setLoading(true);
    let updatedSets = [...setScores];
    let currentSetIdx = updatedSets.length - 1;

    if (updatedSets.length === 0) {
      const firstSet = { setNumber: 1, team1Games: 0, team2Games: 0 };
      await bracketService.updateMatchSetScore(selectedTournament, selectedMatch, 1, firstSet, token);
      updatedSets = [firstSet]; currentSetIdx = 0;
    }

    let currentSet = { ...updatedSets[currentSetIdx] };
    if (setWinner(currentSet.team1Games, currentSet.team2Games, gamesNeeded) !== null) {
      const newSetNum = updatedSets.length + 1;
      currentSet = { setNumber: newSetNum, team1Games: 0, team2Games: 0 };
      await bracketService.updateMatchSetScore(selectedTournament, selectedMatch, newSetNum, currentSet, token);
      updatedSets = [...updatedSets, currentSet]; currentSetIdx = updatedSets.length - 1;
    }

    if (player === 1) currentSet.team1Games++; else currentSet.team2Games++;
    updatedSets[currentSetIdx] = currentSet;
    await bracketService.updateMatchSetScore(selectedTournament, selectedMatch, currentSet.setNumber, currentSet, token);
    setSetScores(updatedSets);
    setServingTeam(prev => prev === "1" ? "2" : "1");

    if (setWinner(currentSet.team1Games, currentSet.team2Games, gamesNeeded) !== null) {
      const matchOver = await checkMatchWinner(updatedSets);
      if (!matchOver) {
        const newSetNum = updatedSets.length + 1;
        const nextSet = { setNumber: newSetNum, team1Games: 0, team2Games: 0 };
        await bracketService.updateMatchSetScore(selectedTournament, selectedMatch, newSetNum, nextSet, token);
        setSetScores([...updatedSets, nextSet]);
      }
    }
    setLoading(false);
  }, [matchWinnerId, selectedMatch, setScores, gamesNeeded, selectedTournament, token, checkMatchWinner]);

  const awardPoint = useCallback(async (player) => {
    if (matchWinnerId || !matchStarted) return;
    const { state: newGs, gameWon } = scorePoint(gameState, player);
    setGameState(newGs);
    await persistLiveScore(newGs, servingTeam);
    if (gameWon) { await awardGame(gameWon); setGameState(initialGameState()); }
  }, [gameState, matchWinnerId, matchStarted, servingTeam, persistLiveScore, awardGame]);

  const startMatch = (team) => { setServingTeam(team); setMatchStarted(true); };

  const handleDeleteSet = async (setNumber) => {
    if (!window.confirm(`Delete Set ${setNumber}?`)) return;
    setLoading(true);
    try {
      await bracketService.deleteMatchSetScore(selectedTournament, selectedMatch, setNumber, token);
      const newScores = setScores.filter(s => s.setNumber !== setNumber);
      setSetScores(newScores);
      if (countSetsWon(newScores, gamesNeeded).every(s => s < setsNeeded)) {
        await bracketService.updateMatch(selectedTournament, selectedMatch, { WinnerId: null }, token);
        setMatchWinnerId(null);
      }
      notify(`Set deleted.`);
    } catch (e) { notify("Error deleting set.", true); }
    setLoading(false);
  };

  const [gsLabel1, gsLabel2] = gameScoreLabel(gameState);
  const [t1Sets, t2Sets] = countSetsWon(setScores, gamesNeeded);

  return (
    <div className="live-scoring-container">
      {message && <div className={message.error ? "admin-error-message" : "admin-message"}>{message.text}</div>}

      {!selectedTournament ? (
        <div className="tournament-picker">
          <h2 className="picker-label">Scoring Control Center</h2>
          <div className="tournament-cards">
            {tournaments.map(t => (
              <button key={t.id} className="tournament-card-btn" onClick={() => setSelectedTournament(String(t.id))}>
                <div className="tc-icon-wrapper">
                  <Trophy size={28} />
                </div>
                <span className="tc-name">{t.name}</span>
                <ChevronRight size={20} />
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="live-score-section">
          <div className="bracket-active-header">
            <div className="header-meta">
              <Activity size={16} />
              <span>{tournaments.find(t => String(t.id) === String(selectedTournament))?.name}</span>
            </div>
            <button className="btn-change-tournament" onClick={() => { setSelectedTournament(""); setSelectedMatch(""); }}>
              Switch Tournament
            </button>
          </div>

          <div className="selection-card-container">
            <div className="admin-card match-config-card">
              <div className="config-row">
                <div className="config-item full-width">
                  <label className="config-label">ACTIVE MATCH SELECTION</label>
                  <select className="modern-select pro-select" value={selectedMatch} onChange={e => setSelectedMatch(e.target.value)}>
                    <option value="">-- Choose Match --</option>
                    {matches.map(m => (
                      <option key={m.id} value={m.id}>
                        {teams.find(t => t.id === m.team1Id)?.teamName} vs {teams.find(t => t.id === m.team2Id)?.teamName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {selectedMatch && (
                <div className="rules-config-grid">
                  <div className="config-item">
                    <label className="config-label">GAMES TO WIN A SET</label>
                    <div className="input-stepper">
                      <Layout size={18} className="config-icon" />
                      <input 
                        className="config-input" 
                        type="number" 
                        value={gamesNeeded} 
                        onChange={e => setGamesNeeded(parseInt(e.target.value))} 
                      />
                    </div>
                  </div>
                  <div className="config-item">
                    <label className="config-label">SETS TO WIN MATCH</label>
                    <div className="input-stepper">
                      <Activity size={18} className="config-icon" />
                      <input 
                        className="config-input" 
                        type="number" 
                        value={setsNeeded} 
                        onChange={e => setSetsNeeded(parseInt(e.target.value))} 
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {selectedMatch && team1 && team2 && (
            <div className="arena-wrapper">
              {matchWinnerId && (
                <div className="winner-banner-pro">
                  {teams.find(t => t.id === matchWinnerId)?.teamName} Wins the Match
                </div>
              )}
              
              {!matchStarted ? (
                <div className="admin-card first-server-hub">
                  <div className="hub-tag">PRE-MATCH COIN TOSS</div>
                  <h3 className="hub-title">DETERMINE FIRST SERVE</h3>
                  <div className="server-grid">
                    <button className="pro-serve-btn" onClick={() => startMatch("1")}>
                      <span className="btn-player-name">{team1.teamName}</span>
                      <span className="btn-action-label">START SERVING</span>
                    </button>
                    <div className="server-vs-badge">OR</div>
                    <button className="pro-serve-btn" onClick={() => startMatch("2")}>
                      <span className="btn-player-name">{team2.teamName}</span>
                      <span className="btn-action-label">START SERVING</span>
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="scoreboard-arena">
                    {/* Team 1 Card */}
                    <div className={`team-card ${servingTeam === "1" ? "serving" : ""}`}>
                      {servingTeam === "1" && <div className="pulse-indicator" />}
                      <h4 className="team-name-large">{team1.teamName}</h4>
                      <div className="score-display">
                        <div className="points-large">{gsLabel1}</div>
                        <div className="sets-badge">Sets <span className="sets-count">{t1Sets}</span></div>
                      </div>
                    </div>

                    <div className="vs-arena">
                      <div className="vs-text">VS</div>
                    </div>

                    {/* Team 2 Card */}
                    <div className={`team-card ${servingTeam === "2" ? "serving" : ""}`}>
                      {servingTeam === "2" && <div className="pulse-indicator" />}
                      <h4 className="team-name-large">{team2.teamName}</h4>
                      <div className="score-display">
                        <div className="points-large">{gsLabel2}</div>
                        <div className="sets-badge">Sets <span className="sets-count">{t2Sets}</span></div>
                      </div>
                    </div>
                  </div>

                  {!matchWinnerId && (
                    <div className="control-hub">
                      <button className="btn-point-pro" onClick={() => awardPoint(1)}>
                        <Plus size={32} />
                        <span>Point {team1.teamName.split(' ')[0]}</span>
                        <span className="btn-label">Award 1 Point</span>
                      </button>
                      <button className="btn-point-pro" onClick={() => awardPoint(2)}>
                        <Plus size={32} />
                        <span>Point {team2.teamName.split(' ')[0]}</span>
                        <span className="btn-label">Award 1 Point</span>
                      </button>
                    </div>
                  )}

                  <div className="history-section">
                    <h5 className="history-section-title">SET-BY-SET PROGRESSION</h5>
                    <div className="score-strip">
                      {setScores.map(score => (
                        <div key={score.setNumber} className="strip-segment">
                          <div className="segment-header">SET {score.setNumber}</div>
                          <div className="segment-scores">
                            <span className={`score-digit ${score.team1Games > score.team2Games ? "is-winner" : ""}`}>
                              {score.team1Games}
                            </span>
                            <span className="score-sep">:</span>
                            <span className={`score-digit ${score.team2Games > score.team1Games ? "is-winner" : ""}`}>
                              {score.team2Games}
                            </span>
                          </div>
                          <button className="strip-delete" onClick={() => handleDeleteSet(score.setNumber)}>
                            <Trash2 size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LiveScoring;
