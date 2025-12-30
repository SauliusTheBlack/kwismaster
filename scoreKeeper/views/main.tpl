<!DOCTYPE html>
<html lang="nl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ScoreKeeper</title>
    <link rel="stylesheet" href="/static/style.css">
</head>
<body>
    <div class="container">
        <header>
            <h1>Quiz Scorekeeper</h1>
        </header>

        <div class="tab-container">
            <div class="tabs">
                <input type="radio" name="round-tab" id="tab-overview" checked>
                <label for="tab-overview" class="tab-label">Overzicht</label>
                % for idx, round in enumerate(rounds):
                    <input type="radio" name="round-tab" id="tab-{{idx}}">
                    <label for="tab-{{idx}}" class="tab-label">{{round[0]}}</label>
                % end
            </div>

            <div class="tab-content" id="content-overview">
                <div class="card">
                    <h2>Alle Scores - Overzicht</h2>
                    <table class="score-table overview-table">
                        <thead>
                            <tr>
                                <th>Team</th>
                                % for round in rounds:
                                    <th>{{round[0]}}</th>
                                % end
                                <th class="total-column">Totaal</th>
                                <th>Acties</th>
                            </tr>
                        </thead>
                        <tbody>
                            % for team in teams:
                                % humanTeamName = team[0]
                                % total = sum(int(scores.get(humanTeamName, {}).get(r[1], 0) or 0) for r in rounds)
                                <tr>
                                    <td class="team-name">{{humanTeamName}}</td>
                                    % for round in rounds:
                                        % technicalRoundName = round[1]
                                        % currentScore = scores.get(humanTeamName, {}).get(technicalRoundName, '-')
                                        <td class="score-display">{{currentScore if currentScore != '' else '-'}}</td>
                                    % end
                                    <td class="total-score">{{total}}</td>
                                    <td class="actions">
                                        <button type="button" class="btn-delete" onclick="deleteTeam('{{humanTeamName}}')">Verwijder</button>
                                    </td>
                                </tr>
                            % end
                        </tbody>
                    </table>
                </div>
            </div>

            % for idx, round in enumerate(rounds):
                <div class="tab-content" id="content-{{idx}}">
                    <div class="card">
                        <h2>{{round[0]}}</h2>
                        <form action="/scores" method="post" class="score-form">
                            <table class="score-table">
                                <thead>
                                    <tr>
                                        <th>Team</th>
                                        <th>Score</th>
                                        <th>Totaal</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    % for team in teams:
                                        % humanTeamName = team[0]
                                        % technicalTeamName = team[1]
                                        % technicalRoundName = round[1]
                                        % currentScore = scores.get(humanTeamName, {}).get(technicalRoundName, '')
                                        % total = sum(int(scores.get(humanTeamName, {}).get(r[1], 0) or 0) for r in rounds)
                                        <tr>
                                            <td class="team-name">{{humanTeamName}}</td>
                                            <td class="score-input">
                                                <input type="number"
                                                       name="{{technicalTeamName + DELIMITER + technicalRoundName}}"
                                                       value="{{currentScore}}"
                                                       placeholder="0">
                                            </td>
                                            <td class="total-score">{{total}}</td>
                                        </tr>
                                    % end
                                </tbody>
                            </table>
                            <div class="form-actions">
                                <button type="submit" class="btn-primary">Opslaan</button>
                            </div>
                        </form>
                    </div>
                </div>
            % end
        </div>

        <div class="card team-management">
            <h2>Team Beheer</h2>
            <form action="/teams" method="post" class="add-team-form">
                <div class="form-group">
                    <label for="newTeamName">Nieuw Team</label>
                    <input type="text" name="newTeamName" id="newTeamName"
                           placeholder="Teamnaam" required>
                    <button type="submit" class="btn-secondary">Toevoegen</button>
                </div>
            </form>
            <div class="quick-add">
                <form action="/quickAddTeam" method="post" style="display: inline;">
                    <button type="submit" class="btn-quick-add">+ Snel Team Toevoegen</button>
                </form>
            </div>
        </div>
    </div>

    <script>
        function deleteTeam(teamName) {
            if (confirm('Team ' + teamName + ' verwijderen?')) {
                const form = document.createElement('form');
                form.method = 'POST';
                form.action = '/deleteTeam';

                const input = document.createElement('input');
                input.type = 'hidden';
                input.name = 'toDelete';
                input.value = teamName;

                form.appendChild(input);
                document.body.appendChild(form);
                form.submit();
            }
        }

        document.addEventListener('DOMContentLoaded', function() {
            const tabs = document.querySelectorAll('input[name="round-tab"]');
            const contents = document.querySelectorAll('.tab-content');

            tabs.forEach((tab) => {
                tab.addEventListener('change', function() {
                    if (this.checked) {
                        contents.forEach(c => c.style.display = 'none');
                        const contentId = 'content-' + this.id.replace('tab-', '');
                        const targetContent = document.getElementById(contentId);
                        if (targetContent) {
                            targetContent.style.display = 'block';
                        }
                    }
                });
            });

            const overviewContent = document.getElementById('content-overview');
            if (overviewContent) {
                overviewContent.style.display = 'block';
            }
        });
    </script>
</body>
</html>
