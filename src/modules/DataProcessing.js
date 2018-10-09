//GRAPH SETUP HELPERS =========================================================================

//sort a list of players by their position
const sort_by_position = (playerList) => {
  let sorted_players = new Array();
  let positions_list = ["Goalkeeper", "Left Back", "Left Center Back", "Center Back", "Right Center Back", "Right Back",
   "Left Midfield", "Left Center Midfield", "Center Midfield", "Right Center Midfield", "Right Midfield", "Left Wing",
   "Left Center Forward", "Center Forward", "Right Center Forward", "Right Wing", "(Substitute)"];

   for (var i = 0; i < positions_list.length; i++) {
     for (var j = 0; j < playerList.length; j++) {
       if(playerList[j].position === positions_list[i]){
         sorted_players.push(playerList[j]);
       }
     }
   }
   return sorted_players;
}


//STATISTICS/DATA HELPERS =========================================================================

//gets positions of each player from the main data JSON
const get_position = (playerList,lineupList) => {
  for(var i = 0; i<lineupList.length; i++){
    for(var j = 0; j<playerList.length; j++){
       if(lineupList[i].player.id == playerList[j].id){
          playerList[j].position = lineupList[i].position.name
       }
    }
  }
}

const allocateEvents = (playerList, eventList) => {
  //allocate each event to the relevant player
  eventList.forEach(function(e){
    for (var p = 0; p < playerList.length; p++){
      if (e.player.id === playerList[p].id) {

        //create new event Object
        let event = new Object()

        event.type = e.type.name
        event.location = e.location
        event.index = e.index
        event.period = e.period
        event.timestamp = e.timestamp
        event.minute = e.minute
        event.second = e.second
        event.possession = e.possession
        event.duration  = e.duration

        //add pass
        if(e.hasOwnProperty('pass')){
          event.pass = e.pass;
        }
        else if (e.hasOwnProperty('shot')){
          event.shot = e.shot;
        }

        //add to player array
        playerList[p].events.push(event);
        break;
      }
    }
  })
}

//takes a list of players (a team)
//sorts the events associated with each player into an array,
// according to the recipient of the pass, or whether it was an unsuccessful pass or shot, or a goal
const calculatePlayerLinks = (playerList) => {

    //for each player
    for(var p = 0; p < playerList.length; p++){

      // fill link array with link objects
      //number of players, plus 3 (incomplete passes, goals, incomplete shots)
      for (var i = 0; i < playerList.length + 3; i++) {
        playerList[p].links.push({"npasses": 0, "length":0.0});
      }

      const INCOMPLETE_PASS_ID = playerList.length;
      const GOAL_ID = INCOMPLETE_PASS_ID + 1;
      const INCOMPLETE_SHOT_ID = GOAL_ID + 1;

      //for all of that player's events
      playerList[p].events.forEach(function (e) {

        //note - currently ignoring outcomes "unknown" and "pass offside"
        if(e.hasOwnProperty("pass")){
          //check for incomplete pass
          if(e.pass.hasOwnProperty("outcome")){
            if(e.pass.outcome.name === "Incomplete" || e.pass.outcome.name === "Out"){
              playerList[p].links[INCOMPLETE_PASS_ID].npasses++;
              playerList[p].links[INCOMPLETE_PASS_ID].length += e.pass.length;
            }
          }
          //if completed, find recipient
          else {
            for (var p2 = 0; p2 < playerList.length; p2++) {
              if (playerList[p2].id == e.pass.recipient.id){
                playerList[p].links[p2].npasses++;
                playerList[p].links[p2].length += e.pass.length;
                break;
              }
            }
          }
        }
        //count succesful and unsuccessful shots
        else if (e.hasOwnProperty("shot")){
         if(e.shot.outcome.name === "Goal")
           playerList[p].links[GOAL_ID].npasses++;
         else
           playerList[p].links[INCOMPLETE_SHOT_ID].npasses++;
        }
      })
    }
}

const calculatePlayerStats = (playerList) => {

  for(var p = 0; p < playerList.length; p++){

    let statistics = new Array();
    statistics.push({"Name":playerList[p].name});
    statistics.push({"Team":playerList[p].team_name});

    //total Passes
    let total_passes = 0;
    let pass_length = 0;
    for (var link = 0; link < playerList[p].links.length - 2; link++) {
      total_passes += playerList[p].links[link].npasses;
      pass_length += playerList[p].links[link].length;
    }
    let pass_completion = (1.0 - (playerList[p].links[playerList[p].links.length-3].npasses / total_passes)) * 100.0;
    let goals = playerList[p].links[playerList[p].links.length-2].npasses;
    let shots = goals + playerList[p].links[playerList[p].links.length-1].npasses;

    statistics.push({"Passes":total_passes});
    statistics.push({"Pass Completion (%)":pass_completion});
    statistics.push({"Total Pass Length (m)":pass_length});
    statistics.push({"Shots":shots});
    statistics.push({"Goals":goals});

    playerList[p].statistics = statistics;

  }
}


export{sort_by_position, get_position, allocateEvents, calculatePlayerLinks, calculatePlayerStats};
