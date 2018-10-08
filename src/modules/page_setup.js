// draws some static graphics that are needed for the visualisation


const visual_setup = (svgContainer, team1_center, team2_center, radius, node_r) => {

  const svg_width = svgContainer.style("width").replace("px", "");
  const svg_height = svgContainer.style("height").replace("px", "");

  //write explanation text
  svgContainer.append("text")
    .attr("x",svg_width*0.5)
    .attr("y",svg_height*0.18)
    .classed("exp_text", true)
    .text("Passing Relationship Diagram for this football match. Lines between players represent the passes they made.")

  //draw comparison box links
  let comparison_box_links = svgContainer.append("g");//linking lines
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

  // //draw player info card
  // card1.append("rect")
  //   .classed("player_card", true)
  //   .attr("width", card_width)
  //   .attr("rx", 5)
  //   .attr("ry", 5)
  //   .attr("height", 0.17*svg_height);
  // card2.append("rect")
  //   .classed("player_card", true)
  //   .attr("width", card_width)
  //   .attr("rx", 5)
  //   .attr("ry", 5)
  //   .attr("height", 0.17*svg_height);


}

const draw_titles = (teams, title_bar_svg, svg_width, svg_height) => {
  title_bar_svg.append("rect")
    .classed("title_left", true)
    .attr("height", 0.14*svg_height)
    .attr("width", 0.5*svg_width)
    .style("fill", teams[0].main_colour);
  title_bar_svg.append("rect")
    .attr("x", 0.5*svg_width)
    .attr("height", 0.14*svg_height)
    .attr("width", 0.5*svg_width)
    .style("fill", teams[1].main_colour);

  title_bar_svg.append("rect")
    .attr("x", 0.41*svg_width)
    .attr("y", -0.05*svg_height)
    .attr("width", 0.18*svg_width)
    .attr("height", 0.12*svg_height)
    .attr("rx", 0.01*svg_width)
    .attr("ry", 0.01*svg_width)
    .style("stroke_width", 3)
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

export{visual_setup,draw_titles};
