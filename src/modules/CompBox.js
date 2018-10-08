//class that draws a comparison box
// when updated with a player, animates bars to compare between statistics

import * as d3 from './d3.min.js';

export default class CompBox {
  constructor(cb_width, cb_height, svgContainer) {

    let svg_width = svgContainer.style("width").replace("px", "");
    let svg_height = svgContainer.style("height").replace("px", "");

    this.cb_width = cb_width;
    this.cb_height = cb_height;

    this.comparison_box = svgContainer.append("g")
      .attr("transform", "translate(" + svg_width * 0.35 + "," + svg_height * 0.3 + ")");

    this.comparison_box_bars = this.comparison_box.append("g");
    this.comparison_box_t1 = this.comparison_box.append("g");
    this.comparison_box_t2 = this.comparison_box.append("g")
      .attr("transform", "translate(" + cb_width / 2 + ",0)");


      //draw comparison box text and lines
    this.comparison_box.append("text").text("Comparison")
      .attr("x",cb_width / 2)
      .attr("y", -cb_height / 30)
      .classed("comp_box_title", true);
    this.comparison_box.append("rect")
      .attr("width", cb_width)
      .attr("height", cb_height)
      .attr("id", "comparison_box");
    this.comparison_box.append("line")
      .attr("x1", cb_width / 2)
      .attr("x2", cb_width / 2)
      .attr("y2", cb_height)
      .attr("id", "comparison_box_midline");
    // comparison_box_t1.append("text").text("Click on a player to compare")
    this.comparison_box.append("text").text("Click on a player to compare")
    .attr("x",cb_width / 2)
    .attr("y", cb_height / 2)
    .attr("id", "placeholder")
    .classed("comp_box_title", true);

    this.stat_bar_widths = new Array();
    this.comp_player_1;
    this.comp_player_2;
  }

  //show a player in the comparison box
  update_comparison(p, teams) {

    const px_per_line = (this.cb_height*0.95) / p.statistics.length;
    var cp_pane;
    var x_pos;
    const pad = this.cb_width / 20;

    //select which side of the comparison box should be affected
    if (p.team_id === teams[0].team_id) {
      cp_pane = this.comparison_box_t1;
      x_pos = pad;
      this.comp_player_1 = p;
    }
    else {
      cp_pane = this.comparison_box_t2;
      x_pos = (this.cb_width / 2) - pad;
      this.comp_player_2 = p;
    }

    //remove previous texts and bars
    this.comparison_box.select("#placeholder").remove();
    cp_pane.selectAll("text").remove();
    this.comparison_box_bars.selectAll("rect").remove();

    let stat_bars = this.comparison_box_bars.selectAll("rect")
      .data(p.statistics).enter();

    //check there are players to compare before drawing bars
    if (this.comp_player_1 !== undefined && this.comp_player_2 !== undefined){

      //stat bars - base bars (away team colour)
      stat_bars.append("rect")
        .attr("x",pad * 0.8 )
        .attr("y", function(d,i){return ((i * px_per_line) + (px_per_line * 0.75));})
        .attr("width", this.cb_width - (pad*1.6))
        .attr("height", px_per_line / 3)
        .style("fill", function(d){
          if (!isNaN(parseFloat(d3.values(d)[0]))){return teams[1].main_colour}
          else {return "none";}
        });

      //stat bars - create with previous length
      let moving_bars = stat_bars.append("rect")
        .attr("x", pad * 0.8)
        .attr("y", function(d,i){return ((i * px_per_line) + (px_per_line * 0.75));})
        .attr("width", (d,i) => {return this.stat_bar_widths[i];})
        .attr("height", px_per_line / 3)
        .style("fill", function(d){
          if (!isNaN(parseFloat(d3.values(d)[0]))){return teams[0].main_colour}
          else {return "none";}
        });
      //clear old stat_bar_widths
      this.stat_bar_widths = [];

      moving_bars.transition()
        .attr("width", (d,i) => { // get width by comparing with other players stats
          if (isNaN(parseFloat(d3.values(d)[0]))){
            this.stat_bar_widths.push(0);
            return 0; //if not a numeric stat, return 0 - wont be shown
          }
          else { // if numeric stat, calculate proportion of width needed
            let p1_val = d3.values(this.comp_player_1.statistics[i])[0];
            let p2_val = d3.values(this.comp_player_2.statistics[i])[0];
            var factor;
            if (p1_val === p2_val) {
              factor = 0.5;
            }
            else {
              factor = p1_val / (p1_val + p2_val);
            }
            let width = factor * (this.cb_width - (pad*1.6));
            //save old Length
            this.stat_bar_widths.push(width);

            return width;
          }
        })
        .duration(1000);

    }
    else {
      stat_bars.each(()=> {this.stat_bar_widths.push(0);})
    }

    //labels
    let stats_entries = cp_pane.selectAll("text")
      .data(p.statistics).enter();
    stats_entries.append("text")
      .attr("x", x_pos)
      .attr("y", function(d,i){return (i * px_per_line) + (px_per_line * 0.6);})
      .text((d) => {return d3.keys(d)[0]})
      .classed("stats", true)
      .classed("sl", (d) => {return cp_pane === this.comparison_box_t1;})
      .classed("sr", (d) => {return cp_pane === this.comparison_box_t2;});
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
      .classed("sl", (d) => {return cp_pane === this.comparison_box_t1;})
      .classed("sr", (d) => {return cp_pane === this.comparison_box_t2;});

  }

  get comp_player_1(){
    return this._comp_player_1;
  }

  set comp_player_1(value){
    this._comp_player_1 = value;
  }

  get comp_player_2(){
    return this._comp_player_2;
  }

  set comp_player_2(value){
    this._comp_player_2 = value;
  }
}
