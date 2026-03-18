import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import bracketService from '../services/bracketService';
import { tournamentService } from '../services/tournamentService';
import '../styles/LiveScoreView.css';

const LiveScoreView = () => {
  const { tournamentId, matchId } = useParams();
  const [match, setMatch] = useState(null);
  const [tournament, setTournament] = useState(null);
  const [team1, setTeam1] = useState(null);
  const [team2, setTeam2] = useState(null);
  const [setScores, setSetScores] = useState([]);
  const [liveScore, setLiveScore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const t = await tournamentService.getTournamentById(tournamentId);
        setTournament(t);

        const m = await bracketService.getMatchById(tournamentId, matchId);
        setMatch(m);

        const t1 = await bracketService.getTeamById(tournamentId, m.team1Id);
        const t2 = await bracketService.getTeamById(tournamentId, m.team2Id);
        setTeam1(t1);
        setTeam2(t2);

        const scores = await bracketService.getMatchScores(tournamentId, matchId);
        setSetScores(scores || []);

        const live = await bracketService.getLiveGameScore(tournamentId, matchId);
        setLiveScore(live || null);

      } catch (err) {
        console.error(err);
        setError('Failed to load match data. The match may not have started yet.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();

    // Set up polling every 5 seconds for live scores
    const interval = setInterval(async () => {
      try {
        const scores = await bracketService.getMatchScores(tournamentId, matchId);
        setSetScores(scores || []);
        const live = await bracketService.getLiveGameScore(tournamentId, matchId);
        setLiveScore(live || null);
      } catch (e) {
        // ignore errors on polling
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [tournamentId, matchId]);

  if (loading) return <div className="live-score-view loading">Loading live score...</div>;
  if (error) return <div className="live-score-view error">{error} <br/><button onClick={() => window.history.back()} className="btn-back">Back</button></div>;

  return (
    <div className="live-score-view">
      <div className="live-score-header">
        <h2>{tournament?.name}</h2>
        <h3>Live Match Score</h3>
      </div>

      <div className="scoreboard">
        <div className="team-score">
          <h4>{team1?.teamName}</h4>
          <div className="points">{liveScore?.team1Points || 0}</div>
          {liveScore?.servingTeamId === team1?.id && <div className="serving-indicator">🎾 Serving</div>}
        </div>
        <div className="vs">VS</div>
        <div className="team-score">
          <h4>{team2?.teamName}</h4>
          <div className="points">{liveScore?.team2Points || 0}</div>
          {liveScore?.servingTeamId === team2?.id && <div className="serving-indicator">🎾 Serving</div>}
        </div>
      </div>

      <div className="set-scores">
        <h3>Sets</h3>
        {setScores.length > 0 ? (
          <table className="sets-table">
            <thead>
              <tr>
                <th>Team</th>
                {setScores.map(s => <th key={s.setNumber}>Set {s.setNumber}</th>)}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{team1?.teamName}</td>
                {setScores.map(s => <td key={s.setNumber}>{s.team1Games}</td>)}
              </tr>
              <tr>
                <td>{team2?.teamName}</td>
                {setScores.map(s => <td key={s.setNumber}>{s.team2Games}</td>)}
              </tr>
            </tbody>
          </table>
        ) : (
          <p>No completed sets yet.</p>
        )}
      </div>

      <div className="actions">
         <button onClick={() => window.history.back()} className="btn-back">Back to bracket</button>
      </div>
    </div>
  );
};

export default LiveScoreView;
