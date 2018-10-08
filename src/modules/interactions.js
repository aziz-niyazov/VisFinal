import {players, card1, card2} from '../main_vis.js'


//hover function for circles
//highlight lines connected to that player on mouseover
const mouseovered = (d) => {

  //update player info card
  if (d.team_id === players[0][0].team_id) {
    card1.show_player(d, 'images/team1.png');
  }
  else {
    card1.show_player(d, 'images/team2.png');
  }

}

const mouseout = (d) => {

  if (d.team_id === players[0][0].team_id) {
    card1.remove_player();
  }
  else {
    card2.remove_player();
  }
}

export{mouseovered, mouseout};
