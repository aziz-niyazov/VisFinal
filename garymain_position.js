//visual setup
//create svg container
const svg_width = 1000;
const svg_height = 500;

const svg_card_width = svg_width/3 //200
const svg_card_height = svg_height/3 //250

const card_offset = 10

const team1_center = [svg_width/4,svg_height/2];
const radius = 200;
let svgContainer = d3.select("body").insert("svg", "#info_box_wrapper")
  .attr("width", svg_width)
  .attr("height", svg_height);




//create element groups
let diagram1 = svgContainer.append("g")
  .attr("transform", "rotate(0,250,250)");
let diagram2 = svgContainer.append("g")
  .attr("transform", "translate(" + svg_width / 2 + ",0)");

let team1_lines = diagram1.append("g")
  .attr("transform", "translate(" + svg_width / 4 + "," + svg_height / 2 + ")");
let team2_lines = diagram2.append("g")
  .attr("transform", "translate(" + svg_width / 4 + "," + svg_height / 2 + ")");

let team1_circles = diagram1.append("g");
let team2_circles = diagram2.append("g");


var team1_numbers;
var team2_numbers;


let diagram1_rotation = 0;
let diagram2_rotation = 0;

//creating a rectangle
let svgCardContainer = d3.select("body").append("svg")
                                        .attr("width", svg_width)
                                        .attr("height", svg_height);

let card1 = svgCardContainer.append("g")
let card2 = svgCardContainer.append("g").attr("transform", "translate(" + svg_width / 2 + ",0)");


let card1_svg
let card2_svg




var players = [[],[]]
var teams = [{},{}]

//loading player info from lineups
d3.json("lineups_7298.json")
  .then(function(lineups){

  // for each team
	for(var i = 0; i < lineups.length; i++){

    teams[i].team_id = lineups[i].team_id;
    teams[i].team_name = lineups[i].team_name;

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
      p.position  = "Substitute"


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

  //set team colours manually
  teams[0].main_colour = "#1328b2";
  teams[0].secondary_colour = "#ffffff";
  teams[1].main_colour = "#82c6ff";
  teams[1].secondary_colour = "#ffffff";

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

  get_position(players[1], data[0].tactics.lineup)
  get_position(players[0], data[1].tactics.lineup)


  //calculate links between each player, within each team
  calculatePlayerLinks(players[0]);
  calculatePlayerLinks(players[1]);

  renderDiagrams(players);

})

function get_position(playerList,lineupList) {
  for(var i = 0; i<lineupList.length; i++){
    for(var j = 0; j<playerList.length; j++){
       if(lineupList[i].player.id == playerList[j].id){
          playerList[j].position = lineupList[i].position.name
       }
    }
  }
}

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

  //to create lines
  let radialLineGenerator = d3.radialLine()
    .curve(d3.curveBasis);

  team1links = createLinkArray(players[0], radius);
  team2links = createLinkArray(players[1], radius);


  //render lines
  team1_lines.selectAll('path')
  .data(team1links)
  .enter().append("path")
    .attr('stroke-width', (d) => {return d.stroke_width})
    .attr("class", "pass_line")
    .attr('d', (d) => { return radialLineGenerator(d.link_points)});

  team2_lines.selectAll('path')
  .data(team2links)
  .enter().append("path")
    .attr('stroke-width', (d) => {return d.stroke_width})
    .attr("class", "pass_line")
    .attr('d', (d) => { return radialLineGenerator(d.link_points)});

  let node_r = 20; //circle radius


  //render circles:
  let team1_enter = team1_circles.selectAll("circle")
  .data(team1_nodes).enter();

  team1_enter.append("circle")
    .attr("cx", (d) => {return d.cx;})
    .attr("cy", (d) => {return d.cy;})
    .attr("r", node_r)
    .style("fill", teams[0].main_colour)
    .style("stroke", teams[0].secondary_colour)
    .on("mouseover", mouseovered)
    // .on("click", rotate_transition);

  team1_numbers = team1_enter.append("text")
    .attr("x", (d) => {return d.cx - node_r/2;})
    .attr("y", (d) => {return d.cy + node_r/3;})
    .text((d) => {return d.jersey_number})
    .classed("jersey_numbers", true);

  let team2_enter = team2_circles.selectAll("circle")
  .data(team2_nodes).enter()
  team2_enter.append("circle")
    .attr("cx", (d) => {return d.cx;})
    .attr("cy", (d) => {return d.cy;})
    .attr("r", node_r)
    .style("fill", teams[1].main_colour)
    .style("stroke", teams[1].secondary_colour)
    .on("mouseover", mouseovered);
  team2_enter.append("text")
    .attr("x", (d) => {return d.cx - node_r/2;})
    .attr("y", (d) => {return d.cy + node_r/3;})
    .text((d) => {return d.jersey_number})
    .classed("jersey_numbers", true);


  //CARDS
  card1_svg = card1.append("rect")
                  .attr('x', svg_width/4 - svg_card_width/2)
                  .attr('y', 0)
                  .attr('width', svg_card_width)
                  .attr('height', svg_card_height)
                  .attr("rx", 10)
                  .attr("ry", 10)
                  .attr("fill", "#1e1f21")
                  .attr("stroke", "#474a4f")
  // card1.append("text")
  //   .attr("x", 50)
  //   .attr("y", 50)
  //   .text("jersey_numbers")

  card2_svg = card2.append("rect")
                  .attr('x', svg_width/4 - svg_card_width/2)
                  .attr('y', 0)
                  .attr('width', svg_card_width)
                  .attr('height', svg_card_height)
                  .attr("rx", 10)
                  .attr("ry", 10)
                  .attr("fill", "#1e1f21")
                  .attr("stroke","#474a4f")


}

// function rotate_transition(d) {
//
//   const duration = 1000;
//   // The amount we need to rotate:
//   let rotate = -d.angle * 180 / Math.PI;
//   while (rotate < -180){
//     rotate += 360;
//   }
//
//   var center = "" + team1_center[0] + "," +  team1_center[1];
//   diagram1.transition()
//   .attrTween("transform", function() {
//           return d3.interpolateString(diagram1.attr("transform"), "rotate(" + rotate + "," + center + ")");
//         })
//   .duration(duration);


  // Τransition the labels so they stay upright
  // team1_numbers.transition()
  //   .attrTween("transform", function(t) {
  //           var center = "" + t.cx + "," +  t.cy;
  //           return d3.interpolateString("rotate(" + -diagram1_rotation + "," + center + ")", "rotate(" + -rotate + "," + center + ")");
  //           // return d3.interpolateString(diagram1.select("text").attr("transform"), "rotate(" + -rotate + "," + center + ")");
  //       })
  //   .duration(duration);

//
//   diagram1_rotation = rotate;
// }


//hover function for circles
//highlight lines connected to that player on mouseover
function mouseovered(d) {

  var lines_to_change;
  var team;

  if (d.team_id === players[0][0].team_id) {
    lines_to_change = team1_lines;
    team = 1;
  }
  else {
    lines_to_change = team2_lines;
    team = 2;
  }

  lines_to_change.selectAll("path")
    .classed("pass_line--highlight", function (l) {
      for (let p = 0; p < l.player_ids.length; p++){
        if (l.player_ids[p] === d.id){
          return true;
        }
      }
      return false;
    })

    //update player info cards
    var card;
    if (team === 1) {
      card = card1
    }
    else {
      card = card2
    }
    //select existing rectangle that has been drawn in render
    card.select("rect")
              .attr("fill","#7f838c")
              .attr("stroke", "#ffc700")


    //add labels
    card.append("text")
          .attr("x", svg_width/4)
          .attr("y", 30)
          .attr("font-family", "sans-serif")
          .text("Name: ")
    card.append("text")
          .attr("x", svg_width/4)
          .attr("y", 70)
          .attr("font-family", "sans-serif")
          .text("Country: ")
    card.append("text")
          .attr("x", svg_width/4)
          .attr("y", 110)
          .attr("font-family", "sans-serif")
          .text("Position: ")

    //add empty text
    card.append("text")
          //.attr("class", "name")
          .text("")
    card.append("text")
          .attr("class", "country")
          .text("")
    card.append("text")
          .attr("class", "position")
          .text("")
   // select and update text
    card.select("text")
          .attr("x", svg_width/4)
          .attr("y", 50)
          .text(d.name)
    card.select("text.country")
          .attr("x", svg_width/4)
          .attr("y", 90)
          .text(d.country.name)
    card.select("text.position")
          .attr("x", svg_width/4)
          .attr("y", 130)
          .text(d.position)




    //add image

    // let card_club_img = card.append("image")
    //       .attr('xlink:href', 'man.png')
    //       .attr("x", svg_width/4 - svg_card_width/2 +card_offset)
    //       .attr("y", 0)
    //       .attr('width', svg_card_width/2 - 2*card_offset)
    //       .attr('height', svg_card_height)
    let card_player_img = card.append("image")
          .attr('xlink:href', 'player_icon.png')
          .attr("x", svg_width/4 - svg_card_width/2 +card_offset)
          .attr("y", 0)
          .attr('width', svg_card_width/2 - 2*card_offset)
          .attr('height', svg_card_height)




    // let table_data = create_table_data(d);
    // table.selectAll("tr").remove();
    // let table_rows = table
    //   .selectAll("tr")
    //   .data(table_data)
    //   .enter()
    //   .append("tr");
    // table_rows.append("td")
    //   .text(function (d) {return d.label});
    // table_rows.append("td")
    //   .text(function (d) {return d.value});

}

// function create_card_data(d){
//   let card_data = new Array();
//   card_data.push({label:"Player Name", value:d.name});
//   card_data.push({label:"Country", value:d.country.name});
//   card_data.push({label:"Position", value:"unknown"});//TODO transfer to player object in load
//   card_data.push({label:"Total Passes", value:d.events.length});//TODO not correct - includes shots
//   return card_data;
// }


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
    data[i].cy = center_point[1] - dy;
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

          //add associated players to link info
          let player_ids = new Array();
          player_ids.push(players[i].id);
          if (j < players.length) {
            player_ids.push(players[j].id);
          }
          link.player_ids = player_ids;

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
