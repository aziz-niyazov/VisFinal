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
		
		//console.log(data[i])
		//check for 'player' key existence
		if(data[i].hasOwnProperty('player')){


			
			//check for unique IDs -> number of players
			//add first value
			if(players.length  == 0 || players === undefined){
				player1 = new Object();
				player1.id = data[i].player.id;
				player1.name = data[i].player.name
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
				player1 = new Object();
				player1.id = data[i].player.id;
				player1.name = data[i].player.name
				players.push(player1);
			}
			
			
		}

	}

	//player id iteration
	console.log(players.length)
	for(var i=0; i<players.length; i++){
		 document.write(players[i].id + "<br>")
		 document.write(players[i].name  +"<br>")

		 //console.log(players[i].name)
	}

	// players.forEach(function (player){
	// 	console.log(player.describe())
	// })

				
});