import teamsJson from './teams.json';

const allTeams = teamsJson.teams
  .sort((a, b) => {
    // First sort by ranking_score
    if (b.ranking_score !== a.ranking_score) {
      return b.ranking_score - a.ranking_score;
    }
    // If ranking_scores are equal, use avg_coop as tiebreaker
    return b.avg_coop - a.avg_coop;
  })
  .map((team, index) => ({
    id: team.team_number,
    number: team.team_number,
    name: `Team ${team.team_number}`,
    rankingPoints: team.ranking_score,
    coopertition: team.avg_coop,
    rank: index + 1
  }));

export default allTeams;
export { allTeams }; 
