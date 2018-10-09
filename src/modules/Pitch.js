import * as interactions from './interactions.js';
import {compBox} from '../main_vis.js';

export default class Pitch {
  constructor(svgContainer) {

    const svg_width = svgContainer.style("width").replace("px", "");
    const svg_height = svgContainer.style("height").replace("px", "");

    this.pitch_width = svg_width*0.2;
    this.pitch_height = this.pitch_width * 0.63475;

    let pitch_container = svgContainer.append("g")
      .attr("transform", "translate(" + ((svg_width/2)-(this.pitch_width/2)) + "," + svg_height*0.73 + ")");
    let pitch_img = pitch_container.append("g");

    this.pitch_team1 = pitch_container.append("g");
    this.pitch_team2 = pitch_container.append("g");

    //draw the pitch
    pitch_img.append("image")
      .attr('xlink:href', 'images/pitch.png')
      .attr("width",this.pitch_width)
      .attr("height", this.pitch_height)

  }

  draw_pitch_highlight(d){
    //add highlight circles
    this.pitch_team1.selectAll(".compcircle_small").remove();
    this.pitch_team2.selectAll(".compcircle_small").remove();

    if (compBox.comp_player_1 !== undefined){
      this.pitch_team1.insert("circle",":first-child")
        .attr("cx", () => {return compBox.comp_player_1.pitch_x;})
        .attr("cy", () => {return compBox.comp_player_1.pitch_y;})
        .classed("compcircle_small", true);
    }
    if (compBox.comp_player_2 !== undefined){
      this.pitch_team2.insert("circle",":first-child")
        .attr("cx", () => {return compBox.comp_player_2.pitch_x;})
        .attr("cy", () => {return compBox.comp_player_2.pitch_y;})
        .classed("compcircle_small", true);
    }
  }

  //draw players on pitch graphic
  add_pitch_players(team_num, team, playerList, node_r){

      this.calc_pitch_positions(playerList, team_num);

      var pitch_group;
      if (team_num === 1){
         pitch_group = this.pitch_team1;
      }
      else {
         pitch_group = this.pitch_team2;
      }

      let pitch_team_enter = pitch_group.selectAll("circle")
      .data(playerList).enter();

      pitch_team_enter.append("circle")
        .attr("cx", (d) => {return d.pitch_x;})
        .attr("cy", (d) => {return d.pitch_y;})
        .attr("r", node_r*0.5)
        .style("fill", (d) => {
          if (d.position === "Goalkeeper") {return team.gk_colour}
          else if (d.position === "(Substitute)"){return team.sub_colour;}
          else {return team.main_colour};
        })
        .style("stroke", team.secondary_colour)
        .on("mouseover", interactions.mouseovered)
        .on("mouseout", interactions.mouseout)
        .on("click", interactions.on_node_click);


      pitch_team_enter.append("text")
        .attr("x", (d) => {return d.pitch_x;})
        .attr("y", (d) => {return d.pitch_y + node_r/6;})
        .attr("font-size", node_r*0.5)
        .text((d) => {return d.jersey_number})
        .classed("jersey_numbers", true);
  }

  //assigns a pitch position to the player based on their position name
  calc_pitch_positions(players, team_num){

    let sub_count = 0;
    for (var i = 0; i < players.length; i++) {
      let p = players[i];
      if (p.position.includes("Goalkeeper")) {
        p.pitch_x = this.pitch_width * 0.05;
        p.pitch_y = this.pitch_height * 0.5;
      }
      else if (p.position.includes("Back")) {
        p.pitch_x = this.pitch_width * 0.15;
        if (p.position.includes("Right Center")){p.pitch_y = this.pitch_height * 0.7;}
        else if (p.position.includes("Left Center")){p.pitch_y = this.pitch_height * 0.3;}
        else if (p.position.includes("Center")){p.pitch_y = this.pitch_height * 0.5;}
        else if (p.position.includes("Right")){p.pitch_y = this.pitch_height * 0.9;}
        else if (p.position.includes("Left")){p.pitch_y = this.pitch_height * 0.1;}
      }
      else if (p.position.includes("Midfield")) {
        p.pitch_x = this.pitch_width * 0.27;
        if (p.position.includes("Right Center")){p.pitch_y = this.pitch_height * 0.7;}
        else if (p.position.includes("Left Center")){p.pitch_y = this.pitch_height * 0.3;}
        else if (p.position.includes("Center")){p.pitch_y = this.pitch_height * 0.5;}
        else if (p.position.includes("Right")){p.pitch_y = this.pitch_height * 0.9;}
        else if (p.position.includes("Left")){p.pitch_y = this.pitch_height * 0.1;}
      }
      else if (p.position.includes("Forward") || p.position.includes("Wing")) {
        p.pitch_x = this.pitch_width * 0.4;
        if (p.position.includes("Right Center")){p.pitch_y = this.pitch_height * 0.6;}
        else if (p.position.includes("Left Center")){p.pitch_y = this.pitch_height * 0.4;}
        else if (p.position.includes("Center")){p.pitch_y = this.pitch_height * 0.5;}
        else if (p.position.includes("Right")){p.pitch_y = this.pitch_height * 0.73;}
        else if (p.position.includes("Left")){p.pitch_y = this.pitch_height * 0.27;}
      }
      else if (p.position.includes("Substitute")){
        p.pitch_y = this.pitch_height * (sub_count++ * 0.14);
        p.pitch_x = this.pitch_width * -0.06;
      }
      //switch positions for away team
      if (team_num === 2) {
        p.pitch_x = this.pitch_width - p.pitch_x;
        if(!p.position.includes("Substitute")){
          p.pitch_y = this.pitch_height - p.pitch_y;
        }
      }
    }

  }
}
