//visual setup
//create svg container
const width = 1000;
const height = 500;
const team1_center = [height/2,width/4];
// const team2_center = [height/2,width * 0.75];
const radius = 200;
let svgContainer = d3.select("body").append("svg")
  .attr("width", width)
  .attr("height", height);

//create element groups
let diagram1 = svgContainer.append("g");
let diagram2 = svgContainer.append("g")
  .attr("transform", "translate(" + width / 2 + ",0)");
let team1_circles = diagram1.append("g");
let team1_lines = diagram1.append("g")
  .attr("transform", "translate(" + width / 4 + "," + height / 2 + ")");
let team2_circles = diagram2.append("g");
let team2_lines = diagram2.append("g")
  .attr("transform", "translate(" + width / 4 + "," + height / 2 + ")");


var players = [[],[]]

//TODO create team array

//loading player info from lineups
d3.json("lineups_7298.json")
  .then(function(lineups){

  // for each team
	for(var i = 0; i < lineups.length; i++){

    //for each player
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
      p.links = new Array()

      // add to correct player array
			if(i==0){
				players[0].push(p)
			}else if(i==1){
				players[1].push(p)
			}
		}
	}

  //TODO check that player json loaded successfully
})


//load events from json file
d3.json("data.json")
  .then(function(data){

  //filter to only passes and shots
  var useful_events = data.filter(e => {
    return (e.type.name == "Pass" || e.type.name == "Shot");
  });

  //filter for each team
  var team1_events = useful_events.filter(e => {
    return (e.team.id === players[0][0].team_id);
  });
  var team2_events = useful_events.filter(e => {
    return (e.team.id === players[1][0].team_id);
  });

  //allocate each event to the relevant player
  allocateEvents(players[0], team1_events);
  allocateEvents(players[1], team2_events);

  //calculate links between each player, within each team
  calculatePlayerLinks(players[0]);
  calculatePlayerLinks(players[1]);

  renderDiagrams(players);

})

function allocateEvents(playerList, eventList){
  //allocate each event to the relevant player
  eventList.forEach(function(e){
    for (var p = 0; p < playerList.length; p++){
      if (e.player.id === playerList[p].id) {

        //create new event Object
        event = new Object()

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
function calculatePlayerLinks(playerList){

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

function renderDiagrams(players){




  team1_nodes = radialLayout(players[0], team1_center, radius);
  team2_nodes = radialLayout(players[1], team1_center, radius);

  //TODO render lines here
  //TODO how best to convert player links array into a set of lines with thicknesses?

  team1links = createLinkArray(players[0], radius);
  // team2links = createLinkArray(players[1], radius);
  let radialLineGenerator = d3.radialLine()
    .curve(d3.curveBasis);


  team1_lines.selectAll('path')
  .data(team1links)
  .enter().append("path")
    .attr('stroke-width', (d) => {return d.stroke_width})
    .attr('stroke', "grey")
    .style('fill', 'none')
    .attr('d', (d) => { return radialLineGenerator(d.link_points)});

  team1_circles.selectAll("circle")
  .data(team1_nodes)
  .enter().append("circle")
    .attr("cx", (d) => {return d.cx;})
    .attr("cy", (d) => {return d.cy;})
    .attr("r", 20)
    .style("fill", "blue");

  team2_circles.selectAll("circle")
  .data(team2_nodes)
  .enter().append("circle")
    .attr("cx", (d) => {return d.cx;})
    .attr("cy", (d) => {return d.cy;})
    .attr("r", 20)
    .style("fill", "blue");

}


//for each data point calculate position for center of circle
//take center point and angle derived from number of nodes
function radialLayout (data, center_point, radius){
  let angleStep = 2.0 * Math.PI / data.length;
  //calc dx and dy from angle and radius
  for (var i = 0; i < data.length; i++) {
    const angle = angleStep * i;
    const dx = radius * Math.sin(angle);
    const dy = radius * Math.cos(angle);
    //add coords to data
    data[i].angle = angle;
    data[i].cx = center_point[0] + dx;
    data[i].cy = center_point[1] + dy;
  }
  return data;
}

function createLinkArray (players, radius) {
  let angleStep = 2.0 * Math.PI / players.length;
  let linkData = new Array();

  //for each player
  for (var i = 0; i < players.length; i++) {
  // for (var i = 0; i < 1; i++) {
    //for each link with another player that is not already calculated (only players for now)
    for (var j = i + 1; j < players[i].links.length - 3; j++) {
        let link = new Object();

        //calculate strength of linke (number of passes/length of passes)
        let strength = players[i].links[j].npasses + players[j].links[i].npasses;
        let LOWER_LIMIT = 3; //min strength needed before showing link
        if (strength > LOWER_LIMIT){

          //create an array describing the link points,
          //each element contains [angle, distance from center]
          let link_points = new Array();
          //start
          link_points.push([players[i].angle,radius]);
          //midpoint
          link_points.push(getMidpointPosition(players[i].angle, players[j].angle, angleStep, radius));
          //end
          link_points.push([players[j].angle, radius]);

          link.link_points = link_points;
          link.stroke_width = strength / 5;

          linkData.push(link);
        }



    }
  }
  // console.log(linkData);
  return linkData;
}

//calculates midpoint position of a radial line, given two points
//helps separate lines properly
function getMidpointPosition(angle_1, angle_2, angleStep, radius){

  let smaller_a = Math.min(angle_1, angle_2);
  let bigger_a = Math.max(angle_1, angle_2);

  if (Math.abs(bigger_a - smaller_a) > Math.abs(bigger_a - (smaller_a + (2.0*Math.PI)))){
    smaller_a += (2.0*Math.PI);
  }
  let midpoint = (smaller_a + bigger_a) / 2.0;
  let angle_diff = Math.abs(smaller_a-bigger_a);

  if (midpoint > (2.0*Math.PI)) {midpoint -= (2.0*Math.PI);  } // check midpoint is in range of a circle

  const TENSION = 0.5;//high means less curvy
  let radius_factor = (angle_diff - angleStep) / (Math.PI - angleStep); //value / range
  let abs_radius = (1.0 - radius_factor) * radius * TENSION;
  return [midpoint, abs_radius];
}


console.log(players);
