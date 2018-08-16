// class Player{

// 	constructor(id, name){
// 		this.id = id
// 		this.name = name
// 	}

// 	getPlayerName(){
// 		return this.name
// 	}
// }


// var Player = {
// 	init: function(id, name){
// 		this.id = id
// 		this.name = name
// 	},

// 	describe: function(){
// 		var desc = this.id + " " + this.name
// 		return desc
// 	}
// }

// arrays of 2 of players
var players = [[],[]]



//loading players from lineups
d3.json("lineups_7298.json").then(function(lineups){
	console.log("lineups")

	for(var i = 0; i < lineups.length; i++){
		
		console.log(lineups[i].lineup.length)
		console.log(lineups[i])

		for(var j = 0; j < lineups[i].lineup.length; j++){
			p = new Object()
			p.id = lineups[i].lineup[j].player_id
			p.name = lineups[i].lineup[j].player_name
			p.jersey_number = lineups[i].lineup[j].jersey_number

			p.country = new Object()
			p.country.id = lineups[i].lineup[j].country.id
			p.country.name = lineups[i].lineup[j].country.name

			p.team_id = lineups[i].team_id
			p.team_name = lineups[i].team_name

			p.events = new Array()
			
			p.links  = new Object()
			p.links.npasses = 0
			p.links.goals = 0
			p.links.blocked = 0


			if(i==0){
				players[0].push(p)
			}else if(i==1){
				players[1].push(p)	
			}
		}
	}
	

})


d3.json("data.json").then(function(data){
			    
	console.log('START')
	
	
	// var players = []
	
	//iterate through whole json
	// for (var i = 0; i<data.length; i++){
		
	// 	//console.log(data[i])
	// 	//check for 'player' key existence
	// 	if(data[i].hasOwnProperty('player')){
	// 		//check for unique IDs -> number of players
	// 		//add first value
	// 		if(players.length  == 0 || players === undefined){
	// 			player1 = new Object()
	// 			player1.id = data[i].player.id
	// 			player1.name = data[i].player.name
	// 			player1.events = new Array
	// 			players.push(player1);	
				 
	// 		}
	// 		var found = false
	// 		//iterate to find similarities
	// 		for(var j = 0; j < players.length && !found; j++){
				
	// 			if(data[i].player.id == players[j].id ){
	// 				found = true
	// 			}
	// 		}
	// 		//if not found -> add to the array
	// 		if(found == false){
	// 			player1 = new Object()
	// 			player1.id = data[i].player.id
	// 			player1.name = data[i].player.name
	// 			player1.events = new Array
	// 			players.push(player1)
	// 		}
			
			
	// 	}

	// }

	





	
	//adding all the rest to the player object from main.json
	for (var i = 0; i<data.length; i++){
		if(data[i].hasOwnProperty('player')){
			for(var j = 0; j < players[0].length ; j++){
				//if(players[0][j].id == data[i].player.id){
					//console.log("json " + data[i].timestamp)
					event = new Object()
					
					//add type
					type = new Object()
					type.name = data[i].type.name
					type.id = data[i].type.id
					event.type = type

					//add possession team
					pos_team = new Object
					pos_team.id = data[i].possession_team.id
					pos_team.name = data[i].possession_team.name
					event.possession_team = pos_team

					//add position
					position = new Object()
					position.id = data[i].position.id
					position.name = data[i].position.name
					event.position = position

					//add location
					//need to make data[i].location.x/y
					loc = new Object()
					loc.x = data[i].location
					event.location = loc

					//add play pattern
					play_pattern = new Object()
					play_pattern.id = data[i].play_pattern.id
					play_pattern.name = data[i].play_pattern.name
					event.play_pattern = play_pattern

					//add related events(array)
					rel_events = new Array
					for(r in data[i].related_events ){
						rel_events.push(data[i].related_events[r])
					}
					event.related_events = rel_events
					
					//add pass
					if(data[i].hasOwnProperty('pass')){
						pass = new Object()
						//check for recepient
						if(data[i].pass.hasOwnProperty('recipient')){
							pass.recipient = new Object()
							pass.recipient.id = data[i].pass.recipient.id
							pass.recipient.name = data[i].pass.recipient.name
						}
	
						pass.length = data[i].pass.length
						pass.height = data[i].pass.height
						pass.end_location = data[i].pass.end_location
						event.pass = pass

						
					}
					
					//add the rest
					event.id = data[i].id
					event.index = data[i].index
					event.period = data[i].period
					event.timestamp = data[i].timestamp
					event.minute = data[i].minute
					event.second = data[i].second
					event.possession = data[i].possession
					event.duration  =data[i].duration
					//players[0][j].events.push(event)
					//console.dir(players[0][j])
					//console.log(players[0][j].id + " " + data[i].player.id)
					if(players[0][j].id == data[i].player.id){
						players[0][j].events.push(event)
						//console.log('add0')
					}
					else if(players[1][j].id == data[i].player.id){
						players[1][j].events.push(event)
						//console.log('add1 ' + players[1][j].name)
					}
					
				//}
			}

			
			for(var k = 0; k < players[0].length; k++){
				for(l = 0; l < 2; l++){
					//add number of passes
					if(players[0][k].id == data[i].player.id){
						if(data[i].hasOwnProperty("pass")){
							 if(data[i].pass.hasOwnProperty("outcome")){
								if(data[i].pass.outcome.name != 'Incomplete'){
									players[0][k].links.npasses++
								}
							 }
						}
						if(data[i].hasOwnProperty("shot")){
							 if(data[i].shot.hasOwnProperty("outcome")){
							 	//add goals
								if(data[i].shot.outcome.name != 'Goal'){
									players[0][k].links.goals++
								}
								//add goal attempts
								else if(data[i].shot.outcome.name != 'Blocked'){
									players[0][k].links.blocked++
								}
							 }
						}
					}
				}
							
			}
		}
	}
		
	console.log(players[0])
	console.log(players[1])



	







	//player id iteration
	
	console.log(players[0].length)
	
	for(var k = 0; k<2; k++){
		document.write("+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++" + "<br>")
		document.write("TEAM: "+ k + "<br>")
		document.write("+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++" + "<br>")

		for(var i=0; i<players[0].length ; i++){
			document.write("player: " + i + " "+ players[k][i].id + " " + players[k][i].name + 
									" " + players[k][i].jersey_number + "<br>")
			document.write("country: " + players[k][i].country.id + " " + players[k][i].country.name + "<br>") 
			document.write("team: " + players[k][i].team_id + " " + players[k][i].team_name + "<br>") 

			for(var j = 0; j<players[k][i].events.length; j++){
				document.write("timestamp: " + players[k][i].events[j].timestamp +"<br>")
				 document.write("id: " + players[k][i].events[j].id +"<br>")
				// document.write("index: " + players[k][i].events[j].index +"<br>")
				// document.write("possession: " + players[k][i].events[j].possession +"<br>")
				// document.write("period: " + players[k][i].events[j].period +"<br>")
				// document.write("type: " + players[k][i].events[j].type.id + " " + players[k][i].events[j].type.name +"<br>")
				// document.write("location: " + players[k][i].events[j].location.x  +"<br>")
				// document.write("play_pattern: " + players[k][i].events[j].play_pattern.id + 
				// 							" " + players[k][i].events[j].play_pattern.name +"<br>")
				if(players[k][i].events[j].hasOwnProperty('pass')){
					document.write("pass: " + players[k][i].events[j].pass.length +"<br>")

					if(players[k][i].events[j].pass.hasOwnProperty('recipient')){
						document.write("recipient: " + players[k][i].events[j].pass.recipient.name +"<br>")
					}	
				}
				document.write("-----------------"  +"<br>")
			}
			document.write("=================================================="  +"<br>")
		}
	}

	// players.forEach(function (player){
	// 	console.log(player.describe())
	// })

				
});