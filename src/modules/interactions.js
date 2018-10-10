//defines behaviour for user triggered interactions with visualisation


import {teams, players, card1, card2, compBox, pitch, diagram1, diagram2} from '../main_vis.js'


//hover function for circles/
//gives info about that player on card
const mouseovered = (d) => {

  //update player info card
  if (d.team_id === players[0][0].team_id) {
    card1.show_player(d, 'images/team1.png');
  }
  else {
    card2.show_player(d, 'images/team2.png');
  }

}

//mouseout for circles
//removes info about that player on card
const mouseout = (d) => {

  if (d.team_id === players[0][0].team_id) {
    card1.remove_player();
  }
  else {
    card2.remove_player();
  }
}

//decides what happens when nodes are clicked
const on_node_click = (d) => {
  compBox.update_comparison(d, teams);

  pitch.draw_pitch_highlight(d);

  if (d.team_id === teams[0].team_id) {
    card1.lock();
    diagram1.rotate_transition(d);
    diagram1.update_link_colours(d);
  }
  else {
    card2.lock();
    diagram2.rotate_transition(d);
    diagram2.update_link_colours(d);
  }
}

//show a label when a highlighted link is hovered over
const link_hover = (d) => {
  var diagram;
  if (d.team_id === teams[0].team_id){
    diagram = diagram1;
  }
  else {
    diagram = diagram2;
  }
  diagram.link_hover(d);
}

export{mouseovered, mouseout, on_node_click, link_hover};
