
//globals for sizes =======================================================
const svg_width = window.innerWidth;
const svg_height = window.innerHeight-4;
const team1_center = [svg_width/6,svg_height*0.5];
const team2_center = [svg_width*(5/6),svg_height*0.5];
const radius = Math.min(svg_width / 7, svg_height / 4);
const node_r = svg_width / 60; //circle radius
const cb_width = svg_width * 0.3;
const cb_height = svg_height * 0.4;
const card_width = radius*1.5;
const pitch_width = svg_width*0.2;
const pitch_height = pitch_width * 0.63475;


//create element groups=======================================================
//main svg container
let svgContainer = d3.select("body").append("svg")
  .attr("width", svg_width)
  .attr("height", svg_height)
  .attr("id", "main_svg");

//comparison box
let comparison_box = svgContainer.append("g")
  .attr("transform", "translate(" + svg_width * 0.35 + "," + svg_height * 0.3 + ")");
let comparison_box_bars = comparison_box.append("g");
let comparison_box_t1 = comparison_box.append("g");
let comparison_box_t2 = comparison_box.append("g")
  .attr("transform", "translate(" + cb_width / 2 + ",0)");
let comparison_box_links = svgContainer.append("g");//linking lines

//for diagrams
let slot1 = svgContainer.append("g");
let slot2 = svgContainer.append("g")
  .attr("transform", "translate(" + svg_width * 2 / 3 + ",0)");
let diagram1 = slot1.append("g")
  .attr("transform", "rotate(0," + team1_center[0] + "," + team1_center[1] + ")");
let diagram2 = slot2.append("g")
  .attr("transform", "rotate(0," + team1_center[0] + "," + team1_center[1] + ")");
let team1_lines = diagram1.append("g")
  .attr("transform", "translate(" + team1_center[0] + "," + team1_center[1] + ")");
let team2_lines = diagram2.append("g")
  .attr("transform", "translate(" + team1_center[0] + "," + team1_center[1] + ")");
let team1_circles = diagram1.append("g");
let team2_circles = diagram2.append("g");

//creating a rectangle for player info card
let cardContainer = svgContainer.append("g")
  .attr("transform","translate(0, " + (team1_center[1] + radius + (node_r*2)) + ")");
let card1 = cardContainer.append("g")
  .attr("transform", "translate(" + (team1_center[0] - (radius*0.75)) + ",0)");
let card2 = cardContainer.append("g")
  .attr("transform", "translate(" + ((team1_center[0] - (radius*0.75)) + (svg_width * 2 / 3)) + ",0)");

//create container for pitch
let pitch_container = svgContainer.append("g")
  .attr("transform", "translate(" + ((svg_width/2)-(pitch_width/2)) + "," + svg_height*0.73 + ")");
let pitch_img = pitch_container.append("g");
let pitch_team1 = pitch_container.append("g");
let pitch_team2 = pitch_container.append("g");


let title_bar_svg = svgContainer.append("g");


//other globals
var comp_player_1;
var comp_player_2;
var stat_bar_widths = new Array();

var diagram1_rotation = 0;
var diagram2_rotation = 0;

var players = [[],[]]
var teams = [{},{}]

//set team colours manually - no info for this in the JSON
teams[0].main_colour = "#82c6ff";
teams[0].secondary_colour = "#ffffff";
teams[0].sub_colour = "#3d5d77";
teams[1].main_colour = "#3156f9";
teams[1].secondary_colour = "#ffffff";
teams[1].sub_colour = "#132266";
const gk_colour = "#349b5b";

//draw some static stuff
visual_setup();

//load match data to get team names and score
d3.json("../data/matchdata_37.json")
  .then(function(match_data_array){

    let match_data = match_data_array[0];

    //update team array
    teams[0].team_id = match_data.home_team.home_team_id;
    teams[0].team_name = match_data.home_team.home_team_name;
    teams[0].score = match_data.home_score;
    teams[1].team_id = match_data.away_team.away_team_id;
    teams[1].team_name = match_data.away_team.away_team_name;
    teams[1].score = match_data.away_score;

    //render all titles
    draw_titles(teams);

    //trigger load of next json file - lineups
    load_lineups();

  });


//loading player info from lineups
function load_lineups(){
  d3.json("../data/lineups_7298.json")
    .then(function(lineups){

    // for each team
  	for(var i = 0; i < lineups.length; i++){

      //for each player - create a custom player object
  		for(var j = 0; j < lineups[i].lineup.length; j++){
  			p = new Object()
  			p.id = lineups[i].lineup[j].player_id
  			p.name = lineups[i].lineup[j].player_name
        p.position = "(Substitute)";
  			p.jersey_number = lineups[i].lineup[j].jersey_number
  			p.country = new Object()
  			p.country.id = lineups[i].lineup[j].country.id
  			p.country.name = lineups[i].lineup[j].country.name
  			p.team_id = lineups[i].team_id
  			p.team_name = lineups[i].team_name
  			p.events = new Array()
        p.links = new Array()

        // add to correct player array
  			if(p.team_id === teams[0].team_id){
  				players[0].push(p)
  			}else{
  				players[1].push(p)
  			}
  		}
  	}
  })
  //trigger load of next json file - events
  load_events();
}

//load events from json file
function load_events(){
  d3.json("../data/data.json")
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

    get_position(players[0], data[0].tactics.lineup)
    get_position(players[1], data[1].tactics.lineup)
    players[0] = sort_by_position(players[0]);
    players[1] = sort_by_position(players[1]);

    //allocate each event to the relevant player
    allocateEvents(players[0], team1_events);
    allocateEvents(players[1], team2_events);

    //calculate links between each player, within each team
    calculatePlayerLinks(players[0]);
    calculatePlayerLinks(players[1]);

    calculatePlayerStats(players[0]);
    calculatePlayerStats(players[1]);

    renderDiagrams(players);

    //draw players on pitch
    add_pitch_players(players);
  })
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
    .attr('d', (d) => { return radialLineGenerator(d.link_points)})
    .on("mouseover", link_hover);

  team2_lines.selectAll('path')
  .data(team2links)
  .enter().append("path")
    .attr('stroke-width', (d) => {return d.stroke_width})
    .attr("class", "pass_line")
    .attr('d', (d) => { return radialLineGenerator(d.link_points)})
    .on("mouseover", link_hover);

  //render circles:
  let team1_enter = team1_circles.selectAll("circle")
  .data(team1_nodes).enter();

  team1_enter.append("circle")
    .attr("cx", (d) => {return d.cx;})
    .attr("cy", (d) => {return d.cy;})
    .attr("r", node_r)
    .style("fill", (d) => {
      if (d.position === "Goalkeeper") {return gk_colour}
      else if (d.position === "(Substitute)"){return teams[0].sub_colour;}
      else {return teams[0].main_colour};
    })
    .style("stroke", teams[0].secondary_colour)
    .on("mouseover", mouseovered)
    .on("mouseout", mouseout)
    .on("click", on_node_click);
  //numbers
  teams[0].numbers = team1_enter.append("text")
    .attr("x", (d) => {return d.cx;})
    .attr("y", (d) => {return d.cy + node_r/3;})
    .style("font-size", node_r)
    .text((d) => {return d.jersey_number})
    .classed("jersey_numbers", true);

  let team2_enter = team2_circles.selectAll("circle")
  .data(team2_nodes).enter();
  team2_enter.append("circle")
    .attr("cx", (d) => {return d.cx;})
    .attr("cy", (d) => {return d.cy;})
    .attr("r", node_r)
    .style("fill", (d) => {
      if (d.position === "Goalkeeper") {return gk_colour}
      else if (d.position === "(Substitute)"){return teams[1].sub_colour;}
      else {return teams[1].main_colour};
    })
    .style("stroke", teams[1].secondary_colour)
    .on("mouseover", mouseovered)
    .on("mouseout", mouseout)
    .on("click", on_node_click);
  //numbers
  teams[1].numbers = team2_enter.append("text")
    .attr("x", (d) => {return d.cx;})
    .attr("y", (d) => {return d.cy + node_r/3;})
    .style("font-size", node_r)
    .text((d) => {return d.jersey_number})
    .classed("jersey_numbers", true);


}

//renders a circle and number for each player in the pitch section
function add_pitch_players(players){

  calc_pitch_positions(players[0]);
  calc_pitch_positions(players[1]);



  let pitch_team1_enter = pitch_team1.selectAll("circle")
  .data(players[0]).enter();
  pitch_team1_enter.append("circle")
    .attr("cx", (d) => {return d.pitch_x;})
    .attr("cy", (d) => {return d.pitch_y;})
    .attr("r", node_r*0.5)
    .style("fill", (d) => {
      if (d.position === "Goalkeeper") {return gk_colour}
      else if (d.position === "(Substitute)"){return teams[0].sub_colour;}
      else {return teams[0].main_colour};
    })
    .style("stroke", teams[0].secondary_colour)
    .on("mouseover", mouseovered)
    .on("mouseout", mouseout)
    .on("click", on_node_click);
  pitch_team1_enter.append("text")
    .attr("x", (d) => {return d.pitch_x;})
    .attr("y", (d) => {return d.pitch_y + node_r/6;})
    .style("font-size", node_r*0.5)
    .text((d) => {return d.jersey_number})
    .classed("jersey_numbers", true);


  let pitch_team2_enter = pitch_team2.selectAll("circle")
  .data(players[1]).enter();
  pitch_team2_enter.append("circle")
    .attr("cx", (d) => {return d.pitch_x;})
    .attr("cy", (d) => {return d.pitch_y;})
    .attr("r", node_r*0.5)
    .style("fill", (d) => {
      if (d.position === "Goalkeeper") {return gk_colour}
      else if (d.position === "(Substitute)"){return teams[1].sub_colour;}
      else {return teams[1].main_colour};
    })
    .style("stroke", teams[1].secondary_colour)
    .on("mouseover", mouseovered)
    .on("mouseout", mouseout)
    .on("click", on_node_click);

  pitch_team2_enter.append("text")
    .attr("x", (d) => {return d.pitch_x;})
    .attr("y", (d) => {return d.pitch_y + node_r/6;})
    .style("font-size", node_r*0.5)
    .text((d) => {return d.jersey_number})
    .classed("jersey_numbers", true);
}

//assigns a pitch position to the player based on their position name
function calc_pitch_positions(players){
  let sub_count = 0;
  for (var i = 0; i < players.length; i++) {
    p = players[i];
    if (p.position.includes("Goalkeeper")) {
      p.pitch_x = pitch_width * 0.05;
      p.pitch_y = pitch_height * 0.5;
    }
    else if (p.position.includes("Back")) {
      p.pitch_x = pitch_width * 0.15;
      if (p.position.includes("Right Center")){p.pitch_y = pitch_height * 0.7;}
      else if (p.position.includes("Left Center")){p.pitch_y = pitch_height * 0.3;}
      else if (p.position.includes("Center")){p.pitch_y = pitch_height * 0.5;}
      else if (p.position.includes("Right")){p.pitch_y = pitch_height * 0.9;}
      else if (p.position.includes("Left")){p.pitch_y = pitch_height * 0.1;}
    }
    else if (p.position.includes("Midfield")) {
      p.pitch_x = pitch_width * 0.27;
      if (p.position.includes("Right Center")){p.pitch_y = pitch_height * 0.7;}
      else if (p.position.includes("Left Center")){p.pitch_y = pitch_height * 0.3;}
      else if (p.position.includes("Center")){p.pitch_y = pitch_height * 0.5;}
      else if (p.position.includes("Right")){p.pitch_y = pitch_height * 0.9;}
      else if (p.position.includes("Left")){p.pitch_y = pitch_height * 0.1;}
    }
    else if (p.position.includes("Forward") || p.position.includes("Wing")) {
      p.pitch_x = pitch_width * 0.4;
      if (p.position.includes("Right Center")){p.pitch_y = pitch_height * 0.6;}
      else if (p.position.includes("Left Center")){p.pitch_y = pitch_height * 0.4;}
      else if (p.position.includes("Center")){p.pitch_y = pitch_height * 0.5;}
      else if (p.position.includes("Right")){p.pitch_y = pitch_height * 0.73;}
      else if (p.position.includes("Left")){p.pitch_y = pitch_height * 0.27;}
    }
    else if (p.position.includes("Substitute")){
      p.pitch_y = pitch_height * (sub_count++ * 0.14);
      p.pitch_x = pitch_width * -0.06;
    }
    //switch positions for away team
    if (p.team_id === teams[1].team_id) {
      p.pitch_x = pitch_width - p.pitch_x;
      if(!p.position.includes("Substitute")){
        p.pitch_y = pitch_height - p.pitch_y;
      }
    }
  }

}

//sort a list of players by their position
function sort_by_position(playerList){
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

function on_node_click(d){
  update_comparison(d);
  rotate_transition(d);
  draw_pitch_highlight(d);
  update_link_colours(d);
}

//show a player in the comparison box
function update_comparison(p) {
  const px_per_line = (cb_height*0.95) / p.statistics.length;
  var cp_pane;
  var x_pos;
  const pad = cb_width / 20;

  //select which side of the comparison box should be affected
  if (p.team_id === teams[0].team_id) {
    cp_pane = comparison_box_t1;
    x_pos = pad;
    comp_player_1 = p;
  }
  else {
    cp_pane = comparison_box_t2;
    x_pos = (cb_width / 2) - pad;
    comp_player_2 = p;
  }

  //remove previous texts and bars
  cp_pane.selectAll("text").remove();
  comparison_box_bars.selectAll("rect").remove();

  let stat_bars = comparison_box_bars.selectAll("rect")
    .data(p.statistics).enter();

  //check there are players to compare before drawing bars
  if (comp_player_1 !== undefined && comp_player_2 !== undefined){

    //stat bars - base bars (away team colour)
    stat_bars.append("rect")
      .attr("x",pad * 0.8 )
      .attr("y", function(d,i){return ((i * px_per_line) + (px_per_line * 0.75));})
      .attr("width", cb_width - (pad*1.6))
      .attr("height", px_per_line / 3)
      .style("fill", function(d){
        if (!isNaN(parseFloat(d3.values(d)[0]))){return teams[1].main_colour}
        else {return "none";}
      });
      // .classed("stats_bars", true);

    //stat bars - create with previous length
    let moving_bars = stat_bars.append("rect")
      .attr("x", pad * 0.8)
      .attr("y", function(d,i){return ((i * px_per_line) + (px_per_line * 0.75));})
      .attr("width", function(d,i){return stat_bar_widths[i];})
      .attr("height", px_per_line / 3)
      .style("fill", function(d){
        if (!isNaN(parseFloat(d3.values(d)[0]))){return teams[0].main_colour}
        else {return "none";}
      });
    //clear old stat_bar_widths
    stat_bar_widths = [];

    moving_bars.transition()
      .attr("width", function(d,i){ // get width by comparing with other players stats
        if (isNaN(parseFloat(d3.values(d)[0]))){
          stat_bar_widths.push(0);
          return 0; //if not a numeric stat, return 0 - wont be shown
        }
        else { // if numeric stat, calculate proportion of width needed
          let p1_val = d3.values(comp_player_1.statistics[i])[0];
          let p2_val = d3.values(comp_player_2.statistics[i])[0];
          var factor;
          if (p1_val === p2_val) {
            factor = 0.5;
          }
          else {
            factor = p1_val / (p1_val + p2_val);
          }
          let width = factor * (cb_width - (pad*1.6));
          //save old Length
          stat_bar_widths.push(width);

          return width;
        }
      })
      .duration(1000);

  }

  //labels
  let stats_entries = cp_pane.selectAll("text")
    .data(p.statistics).enter();
  stats_entries.append("text")
    .attr("x", x_pos)
    .attr("y", function(d,i){return (i * px_per_line) + (px_per_line * 0.6);})
    .text((d) => {return d3.keys(d)[0]})
    .classed("stats", true)
    .classed("sl", (d) => {return cp_pane === comparison_box_t1;})
    .classed("sr", (d) => {return cp_pane === comparison_box_t2;});
  //numbers
  stats_entries.append("text")
    .attr("x", x_pos)
    .attr("y", function(d,i){return (i+1) * px_per_line;})
    .text((d) => {
      let format = d3.format(".0f");
      if (d3.keys(d)[0] == "Pass Completion (%)" || d3.keys(d)[0] == "Total Pass Length (m)") {
        // format percentage correctly
        return format(d3.values(d)[0]);
      }
      return d3.values(d)[0];
    })
    .classed("stats", true)
    .classed("stat_number", true)
    .classed("sl", (d) => {return cp_pane === comparison_box_t1;})
    .classed("sr", (d) => {return cp_pane === comparison_box_t2;});



}

//rotates the player diagram
function rotate_transition(d) {

  const duration = 1000;
  // The angle we need to rotate to:
  let rotate_target = 360-(d.angle * 180 / Math.PI);

  //check which team to rotate
  if (d.team_id === teams[0].team_id) {
    //rotate team 1
    current_rotation = diagram1_rotation;
    diagram_to_rotate = diagram1;
    numbers_to_rotate = teams[0].numbers;
  }
  else {
    //rotate team 2
    current_rotation = diagram2_rotation;
    diagram_to_rotate = diagram2;
    numbers_to_rotate = teams[1].numbers;
  }

  //minimise rotation
  while (rotate_target > (current_rotation + 180)) {
    rotate_target -= 360;
  }
  while (rotate_target < (current_rotation - 180)) {
    rotate_target += 360;
  }
  var center = "" + team1_center[0] + "," +  team1_center[1];

  diagram_to_rotate.transition()
  .attrTween("transform", function() {
          return d3.interpolateString(diagram_to_rotate.attr("transform"), "rotate(" + rotate_target + "," + center + ")");
        })
  .duration(duration);

  // Τransition the labels so they stay upright
  numbers_to_rotate.transition()
  .attrTween("transform", function(t) {
          var center = "" + t.cx + "," +  t.cy;
          let text_current_rotation = "rotate(" + (-current_rotation) + "," + center + ")";
          let text_target_rotation = "rotate(" + -rotate_target + "," + center + ")";
          return d3.interpolateString(text_current_rotation, text_target_rotation);
        })
  .duration(duration);

    //delay update of current position so it doesn"t confuse text rotation
    setTimeout(function() {

      if (d.team_id === teams[0].team_id){
        diagram1_rotation = rotate_target;
      }
      else {
        diagram2_rotation = rotate_target;
      }
    }, (duration*1.01));
}

function draw_pitch_highlight(d){
  //add highlight circles
  pitch_team1.selectAll(".compcircle_small").remove();
  pitch_team2.selectAll(".compcircle_small").remove();

  if (comp_player_1 !== undefined){
    pitch_team1.insert("circle",":first-child")
      .attr("cx", () => {return comp_player_1.pitch_x;})
      .attr("cy", () => {return comp_player_1.pitch_y;})
      .classed("compcircle_small", true);
  }
  if (comp_player_2 !== undefined){
    pitch_team2.insert("circle",":first-child")
      .attr("cx", () => {return comp_player_2.pitch_x;})
      .attr("cy", () => {return comp_player_2.pitch_y;})
      .classed("compcircle_small", true);
  }
}

function update_link_colours(d){
  //highlight lines where that player is the passer
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
          l.highlighted = true;
          return true;
        }
      }
      l.highlighted = false;
      return false;
    })
}

//hover function for circles
//highlight lines connected to that player on mouseover
function mouseovered(d) {

  //update player info card
  var card;
  var img_name;
  if (d.team_id === players[0][0].team_id) {
    card = card1;
    img_name = 'images/team1.png';
  }
  else {
    card = card2;
    img_name = 'images/team2.png';
  }

  //select existing rectangle that has been drawn in render
  card.select("rect")
    .style("fill","#444")
    .style("stroke", "#fff")

  //add labels
  card.selectAll(".card_text").remove();
  card.append("text")
        .attr("x", card_width * 0.4)
        .attr("y", card_width * 0.06)
        .text("Name: ")
        .classed("card_text", true);
  card.append("text")
        .attr("x", card_width * 0.4)
        .attr("y", card_width * 0.18)
        .text("Country: ")
        .classed("card_text", true);
  card.append("text")
        .attr("x", card_width * 0.4)
        .attr("y", card_width * 0.30)
        .text("Position: ")
        .classed("card_text", true);

  card.append("text")
        .attr("x", card_width * 0.4)
        .attr("y", card_width * 0.12)
        .text(d.name)
        .classed("card_field", true)
        .classed("card_text", true);
  card.append("text")
        .attr("x", card_width * 0.4)
        .attr("y", card_width * 0.24)
        .text(d.country.name)
        .classed("card_field", true)
        .classed("card_text", true);
  card.append("text")
        .attr("x", card_width * 0.4)
        .attr("y", card_width * 0.36)
        .text(d.position)
        .classed("card_field", true)
        .classed("card_text", true);

  card.selectAll("image").remove();
  let card_player_img = card.append("image")
        .attr('xlink:href', img_name)
        .attr("x", svg_height * 0.005)
        .attr("y", svg_height * 0.01)
        .attr('width', card_width * 0.36)
        .attr('height', svg_height * 0.15)

}

function mouseout(d){
  var team;
  var card;

  if (d.team_id === players[0][0].team_id) {
    lines_to_change = team1_lines;
    team = 1;
  }
  else {
    lines_to_change = team2_lines;
    team = 2;
  }

  if (team === 1) {card = card1;}
  else {card = card2;}

  card.select("rect")
      .style("fill","none")
      .style("stroke", "#474a4f")
  card.selectAll(".card_text").remove();
  card.selectAll("image").remove();
}

//show a label when a highlighted link is hovered over
function link_hover(d) {
  var slot;
  if (d.team_id === teams[0].team_id){
    slot = slot1;
  }
  else {
    slot = slot2;
  }

  slot.selectAll(".link_label").remove();

  if (d.highlighted) {

    let rect_width = radius;
    slot.append("rect")
      .classed("link_label",true)
      .classed("link_label_bg",true)

    slot.append("text")
      .classed("link_label",true)
      .attr("x", team1_center[0])
      .attr("y", team1_center[1])
      .text("Passes: " + d.strength);
  }
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
    data[i].cy = center_point[1] - dy;
  }
  return data;
}

//create link array to be used as a selection for rendering
function createLinkArray (players, radius) {
  let angleStep = 2.0 * Math.PI / players.length;
  let linkData = new Array();

  //for each player
  for (var i = 0; i < players.length; i++) {

    //for each link with another player that is not already calculated (only players for now)
    for (var j = i + 1; j < players[i].links.length - 3; j++) {

        let link = new Object();
        link.highlighted = false;
        link.team_id = players[i].team_id;

        //calculate strength of linke (number of passes or length of passes)
        let strength = players[i].links[j].npasses + players[j].links[i].npasses;
        link.strength = strength;

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
        link.stroke_width = get_line_thickness(radius / 10, strength);

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

  return linkData;
}
function get_line_thickness(max_thickness, strength){
  const UPPER_BOUND = 20.0;
  const NUM_THICKNESSES = 4.0;
  if (strength >= UPPER_BOUND) {
    return max_thickness;
  }
  else if (strength == 0) {
    return 0;
  }
  else {
    let s = strength * ((NUM_THICKNESSES)/UPPER_BOUND);
    s = Math.floor(s);
    s = s / NUM_THICKNESSES;

    if (strength > 0 && s == 0) {
      return 1;
    }
    return max_thickness * s;
  }
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


//STATISTICS/DATA HELPERS =========================================================================

//gets positions of each player from the main data JSON
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

function calculatePlayerStats(playerList){

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

//RENDERING SETUP HELPERS =========================================================================

//draws the initial interface
function visual_setup(){
  //write explanation text
  svgContainer.append("text")
    .attr("x",svg_width*0.5)
    .attr("y",svg_height*0.18)
    .classed("exp_text", true)
    .text("Passing Relationship Diagram for this football match. Lines between players represent the passes they made.")

    //draw comparison box text and lines
  comparison_box.append("text").text("Comparison")
    .attr("x",cb_width / 2)
    .attr("y", -cb_height / 30)
    .classed("comp_box_title", true);
  comparison_box.append("rect")
    .attr("width", cb_width)
    .attr("height", cb_height)
    .attr("id", "comparison_box");
  comparison_box.append("line")
    .attr("x1", cb_width / 2)
    .attr("x2", cb_width / 2)
    .attr("y2", cb_height)
    .attr("id", "comparison_box_midline");
  comparison_box_t1.append("text").text("Click on a player to compare")
  .attr("x",cb_width / 2)
  .attr("y", cb_height / 2)
  .classed("comp_box_title", true);

  //draw comparison box links
  comparison_box_links.append("line")
    .attr("x1", team1_center[0])
    .attr("y1", team1_center[1] - radius - node_r)
    .attr("x2", svg_width * 0.4)
    .attr("y2", team1_center[1] - radius-node_r)
  comparison_box_links.append("line")
    .attr("x1", team2_center[0])
    .attr("y1", team2_center[1] - radius - node_r)
    .attr("x2", svg_width * 0.6)
    .attr("y2", team2_center[1] - radius-node_r)
  comparison_box_links.append("line")
    .attr("x1", svg_width * 0.4)
    .attr("y1", team1_center[1] - radius - node_r)
    .attr("x2", svg_width * 0.4)
    .attr("y2", svg_height*0.3)
  comparison_box_links.append("line")
    .attr("x1", svg_width * 0.6)
    .attr("y1", team2_center[1] - radius - node_r)
    .attr("x2", svg_width * 0.6)
    .attr("y2", svg_height*0.3)
  comparison_box_links.append("circle")
    .attr("cx", team1_center[0])
    .attr("cy", team1_center[1] - radius)
  comparison_box_links.append("circle")
    .attr("cx", team2_center[0])
    .attr("cy", team2_center[1] - radius)
  comparison_box_links.selectAll("line").classed("compline", true);
  comparison_box_links.selectAll("circle").classed("compcircle", true);

  //draw player info card
  card1.append("rect")
    .classed("player_card", true)
    .attr("width", card_width);
  card2.append("rect")
    .classed("player_card", true)
    .attr("width", card_width);

  //draw the pitch
  pitch_img.append("image")
    .attr('xlink:href', 'images/pitch.png')
    .attr("width",pitch_width)
    .attr("height", pitch_height)
}

function draw_titles(teams){
  title_bar_svg.append("rect")
    .classed("title", true)
    .classed("title_left", true)
    .style("fill", teams[0].main_colour);
  title_bar_svg.append("rect")
    .classed("title", true)
    .classed("title_right", true)
    .style("fill", teams[1].main_colour);

  title_bar_svg.append("rect")
    .classed("score_separator", true);

  title_bar_svg.append("circle")
    .attr("cx", svg_width*0.5)
    .attr("cy", svg_height*0.07)
    .attr("r", svg_height*0.05)
    .attr("class", "title_circle");
  title_bar_svg.append("text")
    .attr("x", svg_width*0.5)
    .attr("y", svg_height*0.085)
    .text("vs")
    .classed("title_circle_text", true);

  title_bar_svg.append("text")
    .attr("x", svg_width*0.45)
    .attr("y", svg_height*0.12)
    .attr("text-anchor", "end")
    .text(teams[0].team_name)
    .classed("title_text", true);

  title_bar_svg.append("text")
    .attr("x", svg_width*0.55)
    .attr("y", svg_height*0.12)
    .attr("text-anchor", "start")
    .text(teams[1].team_name)
    .classed("title_text", true);

  //scores
  title_bar_svg.append("text")
    .attr("x", svg_width*0.45)
    .attr("y", svg_height*0.055)
    .attr("text-anchor", "end")
    .text(teams[0].score)
    .classed("title_text", true)
    .classed("score_number", true);

  title_bar_svg.append("text")
    .attr("x", svg_width*0.55)
    .attr("y", svg_height*0.055)
    .attr("text-anchor", "start")
    .text(teams[1].score)
    .classed("title_text", true)
    .classed("score_number", true);
}
