<!DOCTYPE html>
<!-- {{!scores}}-->
<html>

	<head>
		<title>ScoreKeeper</title>
	</head>

	<body>
		<div id="mainContent">
			<form action="/scores" method="post">
				<table>
					<tr>
						<th></th> <!-- empty cell to allign with team names -->
						% for round in rounds:
							<th>{{round[0]}}</th>
						% end
					</tr>

				% for team in teams:
					% humanTeamName = team[0]
					% technicalTeamName = team[1]
					<tr>
						<td>{{humanTeamName}}</td>
						% for round in rounds:
							% technicalRoundName = round[1]							
							% if humanTeamName in scores and technicalRoundName in scores[humanTeamName] : 
	
							<td><input type="number" name="{{technicalTeamName + DELIMITER + technicalRoundName}}" value="{{scores[humanTeamName][technicalRoundName]}}"></td>
							% else :
							<td><input type="number" name="{{technicalTeamName + DELIMITER + technicalRoundName}}"></td>
							% end
						% end
					</tr>
				% end
				
				</table>
				<input type="submit" value="Bevestigen">
			</form>
			<br/>
			<br/>
			<br/>
			<form  action="/teams" method="post">
				<label for="newTeamName">Teamnaam</label> <input type="text" name="newTeamName">
				<input type="submit" value="Toevoegen">
			</form>
		</div>

    </body>
</html>



