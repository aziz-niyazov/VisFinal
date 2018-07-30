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
				//players.push(data[i].player.id)
				 //players.push(data[i].player.name)

				 console.log('a')
			}
			//iterate to find similarities
			for(var j = 0; j < players.length; j++){
				// com = new String(players[j].id);
				if(players[j].id != data[i].player.id){
					player1 = new Object();
					player1.id = data[i].player.id;
					player1.name = data[i].player.name
					players.push(player1);
					//players.push(data[i].player.id)
					// players.push(data[i].player.name)
					 // p.init(data[i].player.id, data[i].player.name)
					 // players.push(p)
					// console.log(players.length)
					 console.log(players.length)
					 break
					
				}


			}
			
			
		}

	}

	//player id iteration
	console.log(players.length)
	for(var i=0; i<players.length; i++){
		 document.write(players[i].id+ "<br>")
		 //console.log(players[i].name)
	}

	// players.forEach(function (player){
	// 	console.log(player.describe())
	// })

				
});