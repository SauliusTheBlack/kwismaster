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
					<tr>
						<td>{{teams[team]}}</td>
						% for round in rounds:							
							% if team in scores and round[1] in scores[team] : 
							<td><input type="number" name="{{team + DELIMITER + round[1]}}" value="{{scores[team][round[1]]}}"></td>
							% else :
							<td><input type="number" name="{{team + DELIMITER + round[1]}}"></td>
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



