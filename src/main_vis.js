import * as d3 from './modules/d3.min.js';
import * as pageSetup from './modules/page_setup.js';
import * as interactions from './modules/interactions.js';
import * as dataProc from './modules/DataProcessing.js';
import CompBox from './modules/CompBox.js';
import Pitch from './modules/Pitch.js';
import PlayerInfoCard from './modules/Card.js';
import RadialNodeDiagram from './modules/RadialNodeDiagram.js';


//setup for sizes =======================================================
const svg_width = window.innerWidth;
const svg_height = window.innerHeight-4;
const team1_center = [svg_width/6,svg_height*0.5];
const team2_center = [svg_width*(5/6),svg_height*0.5];
const radius = Math.min(svg_width / 7, svg_height / 4);
const node_r = svg_width / 60; //circle radius
const cb_width = svg_width * 0.3;
const cb_height = svg_height * 0.4;
const card_width = radius*1.5;
const card_height = svg_height*0.17;

//create element groups=======================================================

//main svg container
let svgContainer = d3.select("body").append("svg")
  .attr("width", svg_width)
  .attr("height", svg_height)
  .attr("id", "main_svg");

pageSetup.visual_setup(svgContainer, team1_center, team2_center, radius, node_r);

let compBox = new CompBox(cb_width, cb_height, svgContainer);
let pitch = new Pitch(svgContainer);

//for diagrams
let slot1 = svgContainer.append("g");
let slot2 = svgContainer.append("g")
  .attr("transform", "translate(" + svg_width * 2 / 3 + ",0)");

let diagram1 = new RadialNodeDiagram(slot1, team1_center);
let diagram2 = new RadialNodeDiagram(slot2, team1_center);

//creating a rectangle for player info card
let cardContainer = svgContainer.append("g")
  .attr("transform","translate(0, " + (team1_center[1] + radius + (node_r*2)) + ")");

let card1 = new PlayerInfoCard(cardContainer, (team1_center[0] - (radius*0.75)), 0, card_width, card_height);
let card2 = new PlayerInfoCard(cardContainer, ((team1_center[0] - (radius*0.75)) + (svg_width * 2 / 3)) , 0, card_width, card_height);

let title_bar_svg = svgContainer.append("g")
  .attr("class", "title_bar_svg");

//init data arrays
var players = [[],[]]
var teams = [{},{}]

export{teams, players, card1, card2, compBox, pitch, diagram1, diagram2};

//set team colours manually - no info for this in the JSON
teams[0].main_colour = "#82c6ff";
teams[0].secondary_colour = "#ffffff";
teams[0].sub_colour = "#3d5d77";
teams[1].main_colour = "#3156f9";
teams[1].secondary_colour = "#ffffff";
teams[1].sub_colour = "#132266";
teams[0].gk_colour = "#349b5b";
teams[1].gk_colour = "#349b5b";


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
    pageSetup.draw_titles(teams, title_bar_svg, svg_width, svg_height);

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
  			var p = new Object();
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

    //positions are found in 'starting XI' event in event JSON
    dataProc.get_position(players[0], data[0].tactics.lineup)
    dataProc.get_position(players[1], data[1].tactics.lineup)
    players[0] = dataProc.sort_by_position(players[0]);
    players[1] = dataProc.sort_by_position(players[1]);


    //allocate each event to the relevant player
    dataProc.allocateEvents(players[0], team1_events);
    dataProc.allocateEvents(players[1], team2_events);

    //calculate links between each player, within each team
    dataProc.calculatePlayerLinks(players[0]);
    dataProc.calculatePlayerLinks(players[1]);

    dataProc.calculatePlayerStats(players[0]);
    dataProc.calculatePlayerStats(players[1]);

    // renderDiagrams(players);
    diagram1.renderDiagram(teams[0], players[0], radius, node_r);
    diagram2.renderDiagram(teams[1], players[1], radius, node_r);

    pitch.add_pitch_players(1, teams[0], players[0], node_r);
    pitch.add_pitch_players(2, teams[1], players[1], node_r);

  })
}
