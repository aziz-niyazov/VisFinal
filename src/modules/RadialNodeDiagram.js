import * as d3 from './d3.min.js';
import * as interactions from './interactions.js';

export default class RadialNodeDiagram {
  constructor(root_group, center) {

    this.root_group = root_group;
    this.center = center;

    this.diagram = this.root_group.append("g")
      .attr("transform", "rotate(0," + center[0] + "," + center[1] + ")");
    this.lines = this.diagram.append("g")
      .attr("transform", "translate(" + center[0] + "," + center[1]  + ")");
    this.circles = this.diagram.append("g");

    this.rotation = 0;
  }

  rotate_transition(d) {

    //transition speed
    const duration = 1000;
    // The angle we need to rotate to:
    let rotate_target = 360-(d.angle * 180 / Math.PI);
    let current_rotation = this.rotation;

    //minimise rotation
    while (rotate_target > (current_rotation + 180)) {
      rotate_target -= 360;
    }
    while (rotate_target < (current_rotation - 180)) {
      rotate_target += 360;
    }
    var center_str = this.center[0] + "," +  this.center[1];


    this.diagram.transition()
    .attrTween("transform", () => {
            return d3.interpolateString(this.diagram.attr("transform"), "rotate(" + rotate_target + "," + center_str + ")");
          })
    .duration(duration);

    // Τransition the labels so they stay upright
    this.numbers.transition()
    .attrTween("transform", (t) => {
            var node_center = "" + t.cx + "," +  t.cy;
            let text_current_rotation = "rotate(" + (-current_rotation) + "," + node_center + ")";
            let text_target_rotation = "rotate(" + -rotate_target + "," + node_center + ")";
            return d3.interpolateString(text_current_rotation, text_target_rotation);
          })
    .duration(duration);

      //delay update of current position so it doesn"t confuse text rotation
      setTimeout(() => {
        this.rotation = rotate_target;
      }, (duration*1.01));
  }


  //highlight lines where given player is the passer/receiver
  update_link_colours(d){

    this.lines.selectAll("path")
      .classed("pass_line--highlight",  (l) => {
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

  link_hover(d){

    this.root_group.selectAll(".link_label").remove();

    if (d.highlighted) {

      let rect_width = this.radius;
      this.root_group.append("rect")
        .classed("link_label",true)
        .classed("link_label_bg",true)

      this.root_group.append("text")
        .classed("link_label",true)
        .attr("x", this.center[0])
        .attr("y", this.center[1])
        .text("Passes: " + d.strength);
    }
  }

  //renders a radial node diagram from a player list
  renderDiagram(team, playerList, radius, node_r){

    //to create lines
    let radialLineGenerator = d3.radialLine()
      .curve(d3.curveBasis);

    this.radius = radius;

    let nodes = this.radialLayout(playerList, radius);
    let links = this.createLinkArray(playerList, radius);

    //render lines
    this.lines.selectAll('path')
    .data(links)
    .enter().append("path")
      .attr('stroke-width', (d) => {return d.stroke_width})
      .attr("class", "pass_line")
      .attr('d', (d) => { return radialLineGenerator(d.link_points)})
      .on("mouseover", interactions.link_hover);

    //render circles:
    let team_enter = this.circles.selectAll("circle")
    .data(nodes).enter();

    team_enter.append("circle")
      .attr("cx", (d) => {return d.cx;})
      .attr("cy", (d) => {return d.cy;})
      .attr("r",  node_r)
      .style("fill", (d) => {
        if (d.position === "Goalkeeper") {return team.gk_colour}
        else if (d.position === "(Substitute)"){return team.sub_colour;}
        else {return team.main_colour};
      })
      .style("stroke", team.secondary_colour)
      .on("mouseover", interactions.mouseovered)
      .on("mouseout", interactions.mouseout)
      .on("click", interactions.on_node_click);


    //render numbers
    this.numbers = team_enter.append("text")
      .attr("x", (d) => {return d.cx;})
      .attr("y", (d) => {return d.cy + node_r/3;})
      .style("font-size", node_r)
      .text((d) => {return d.jersey_number})
      .classed("jersey_numbers", true);
  }

  //for each data point calculate position for center of circle
  //take center point and angle derived from number of nodes
  radialLayout (data, radius){
    let angleStep = 2.0 * Math.PI / data.length;
    //calc dx and dy from angle and radius
    for (var i = 0; i < data.length; i++) {
      const angle = angleStep * i;
      const dx = radius * Math.sin(angle);
      const dy = radius * Math.cos(angle);
      //add coords to data
      data[i].angle = angle;
      data[i].cx = this.center[0] + dx;
      data[i].cy = this.center[1] - dy;
    }
    return data;
  }

  //create link array to be used as a selection for rendering
  createLinkArray (players, radius) {
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
          link_points.push(this.getMidpointPosition(players[i].angle, players[j].angle, angleStep, radius));
          //end
          link_points.push([players[j].angle, radius]);

          link.link_points = link_points;
          link.stroke_width = this.get_line_thickness(radius / 10, strength);

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

  //maps the strength of a link to a line thickness
  get_line_thickness(max_thickness, strength){
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
  getMidpointPosition(angle_1, angle_2, angleStep, radius){

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

}
