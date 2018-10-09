export default class PlayerInfoCard {
  constructor(cardContainer, x, y, width, height) {

    this.width = width;
    this.height = height;

    this.card = cardContainer.append("g")
      .attr("transform", "translate(" + x + "," + y + ")");

    this.card.append("rect")
      .classed("player_card", true)
      .attr("width", width)
      .attr("rx", 5)
      .attr("ry", 5)
      .attr("height", height);
  }

//shows info about a player on the card
  show_player(d, img_name) {

    //select existing rectangle that has been drawn in render
    this.card.select("rect")
      .style("fill","#444")
      .style("stroke", "#fff")

    //add labels
    this.card.selectAll(".card_text").remove();
    this.card.append("text")
          .attr("x", this.width * 0.4)
          .attr("y", this.width * 0.06)
          .text("Name: ")
          .classed("card_text", true);
    this.card.append("text")
          .attr("x", this.width * 0.4)
          .attr("y", this.width * 0.18)
          .text("Country: ")
          .classed("card_text", true);
    this.card.append("text")
          .attr("x", this.width * 0.4)
          .attr("y", this.width * 0.30)
          .text("Position: ")
          .classed("card_text", true);

    this.card.append("text")
          .attr("x", this.width * 0.4)
          .attr("y", this.width * 0.12)
          .text(d.name)
          .classed("card_field", true)
          .classed("card_text", true);
    this.card.append("text")
          .attr("x", this.width * 0.4)
          .attr("y", this.width * 0.24)
          .text(d.country.name)
          .classed("card_field", true)
          .classed("card_text", true);
    this.card.append("text")
          .attr("x", this.width * 0.4)
          .attr("y", this.width * 0.36)
          .text(d.position)
          .classed("card_field", true)
          .classed("card_text", true);

    this.card.selectAll("image").remove();
    let card_player_img = this.card.append("image")
          .attr('xlink:href', img_name)
          .attr("x", this.width * 0.02)
          .attr("y", this.height * 0.09)
          .attr('width', this.width * 0.36)
          .attr('height', this.height * 0.7)
  }

//clears the card
  remove_player() {

    this.card.select("rect")
        .style("fill","none")
        .style("stroke", "#474a4f")
    this.card.selectAll(".card_text").remove();
    this.card.selectAll("image").remove();
  }
}
