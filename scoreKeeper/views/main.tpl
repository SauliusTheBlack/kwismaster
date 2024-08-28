<!DOCTYPE html>
<!-- {{scores}}-->
<html>

	<head>
		<title>ScoreKeeper</title>
	</head>

	<body>
		<div id="mainContent">
			<table>
				<tr>
						<th></th> <!-- empty cell to allign with team names -->
					% for round in rounds:
						<th>{{round[0]}}</th>
					% end
				</tr>
			% for team in teams:
				<tr>
					<td>{{team[0]}}</td>
					% for round in rounds:
						% generatedId = team[1] + "_" + round[1]
						% if generatedId in scores : 
						<td><input type="number" id="{{generatedId}}" value="{{scores[generatedId]}}"></td>
						% else :
						<td><input type="number" id="{{generatedId}}"></td>
						% end
					% end
				</tr>
				% end
			</table>
		</div>

    </body>
</html>