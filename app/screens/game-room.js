import React, { Component } from 'react';
import PropTypes from 'prop-types';
import route from './route';

import { connectToGame, joinGame } from '../redux/game';
import { load } from '../redux/persist';

import { Container, Section } from '../ui/layout';
import { NavLeft, NavRight } from '../ui/nav';
import Text from '../ui/typography/text';
import Toaster from '../ui/toaster';
import Spinner from '../ui/spinner';

@route(({ app, game, router }, { params }) => {
  let { location } = router;
  let persisted = load('app');

  return {
    room: app.room || persisted.room || params.room,
    player: app.player || persisted.player || location.state.player,
    connected: !!game,
    joined: !!app.player
  };
}, {
  connectToGame,
  joinGame
})

class GameRoomScreen extends Component {
  static propTypes = {
    room: PropTypes.string,
    player: PropTypes.object,
    connected: PropTypes.bool.isRequired,
    joined: PropTypes.bool.isRequired,
    connectToGame: PropTypes.func.isRequired,
    joinGame: PropTypes.func.isRequired,
    replace: PropTypes.func.isRequired,
    params: PropTypes.shape({
      room: PropTypes.string.isRequired
    }).isRequired
  };

  // when the component updates during the connect event, we lose the
  // current player in both the local and persisted state. Saving the
  // initial player prop allows us to reference it later during the
  // component update hook
  state = {
    player: this.props.player
  };

  componentWillMount() {
    let {
      room,
      player,
      connected,
      joined,
      connectToGame,
      joinGame,
      params,
      replace
    } = this.props;

    if (!player || room !== params.room) {
      replace(`/${params.room}/join`);
    } else if (!connected) {
      connectToGame(room);
    } else if (!joined) {
      joinGame(player.name, player.token);
    }
  }

  componentWillReceiveProps(nextProps) {
    let { connected, joinGame } = nextProps;
    let { player } = this.state;

    // if we just connected join the game
    if (connected && !this.props.connected) {
      joinGame(player.name, player.token);
    }
  }

  render() {
    let { room, joined } = this.props;

    return (
      <Container data-test-game-room>
        {!joined ? (
          <Section align="center" justify="center">
            <Spinner xl/>
          </Section>
        ) : [
          <Section key={0} flex="none" row>
            <NavLeft/>

            <NavRight>
              {!!room && (
                <Text sm upper color="secondary" data-test-room-code>
                  {room}
                </Text>
              )}
            </NavRight>
          </Section>,

          <Toaster key={1}/>
        ]}
      </Container>
    );
  }
}

export default GameRoomScreen;
