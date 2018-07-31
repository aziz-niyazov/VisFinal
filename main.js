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


d3.json("data.json").then(function(data){
			    
	console.log('START')
	
	
	var players = []
	
	//iterate through whole json
	for (var i = 0; i<data.length; i++){
		
		console.log(data[i])
		//check for 'player' key existence
		if(data[i].hasOwnProperty('player')){
			//check for unique IDs -> number of players
			//add first value
			if(players.length  == 0 || players === undefined){
				player1 = new Object()
				player1.id = data[i].player.id
				player1.name = data[i].player.name
				player1.events = new Array
				players.push(player1);	
				 
			}
			var found = false
			//iterate to find similarities
			for(var j = 0; j < players.length && !found; j++){
				
				if(data[i].player.id == players[j].id ){
					found = true
				}
			}
			//if not found -> add to the array
			if(found == false){
				player1 = new Object()
				player1.id = data[i].player.id
				player1.name = data[i].player.name
				player1.events = new Array
				players.push(player1)
			}
			
			
		}

	}

	document.write(players.length +"<br>")
	
	//adding all the rest to the player object
	for (var i = 0; i<data.length; i++){
		if(data[i].hasOwnProperty('player')){
			for(var j = 0; j < players.length; j++){
				if(players[j].id == data[i].player.id){
					//console.log("json " + data[i].timestamp)

					event = new Object()
					

					type = new Object()
					type.name = data[i].type.name
					type.id = data[i].type.id
					event.type = type

					//need to make data[i].location.x/y
					loc = new Object()
					loc.x = data[i].location
					event.location = loc

					play_pattern = new Object()
					play_pattern.id = data[i].play_pattern.id
					play_pattern.name = data[i].play_pattern.name
					event.play_pattern = play_pattern




					event.timestamp = data[i].timestamp
					event.index = data[i].index
					event.id = data[i].id
					event.minute = data[i].minute
					event.possession = data[i].possession



					event.period = data[i].period

					players[j].events.push(event)
				}
			}
			

		}
	}
		
	



	//player id iteration
	
	console.log(players.length)
	for(var i=0; i<players.length; i++){
		document.write("player: " + players[i].id + " " + players[i].name + "<br>")
		for(var j = 0; j<players[i].events.length; j++){
			document.write("timestamp: " + players[i].events[j].timestamp +"<br>")
			document.write("id: " + players[i].events[j].id +"<br>")
			document.write("index: " + players[i].events[j].index +"<br>")
			document.write("possession: " + players[i].events[j].possession +"<br>")
			document.write("period: " + players[i].events[j].period +"<br>")
			document.write("type: " + players[i].events[j].type.id + " " + players[i].events[j].type.name +"<br>")
			document.write("location: " + players[i].events[j].location.x  +"<br>")
			document.write("play_pattern: " + players[i].events[j].play_pattern.id + 
										" " + players[i].events[j].play_pattern.name +"<br>")
			//document.write("location: " + players[i].events[j].location.x  +"<br>")


			document.write("-----------------"  +"<br>")
		}
		document.write("=================================================="  +"<br>")

	}

	// players.forEach(function (player){
	// 	console.log(player.describe())
	// })

				
});