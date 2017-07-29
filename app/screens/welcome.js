import React, { Component } from 'react';
import { connect } from 'react-redux';

import { newGame } from '../actions/game';

import { Container, Section } from '../ui/layout';
import Title from '../ui/typography/title';
import Button from '../ui/button';

@connect(({ game }) => ({
  loading: game.loading
}), {
  newGame
})

class Welcome extends Component {
  newGame = () => {
    this.props.newGame();
  };

  render() {
    const {
      loading
    } = this.props;

    return (
      <Container>
        <Section justify="center">
          <Title>
            Monopoly<br/>Wallet
          </Title>
        </Section>

        <Section align="center">
          <Button
              type="secondary"
              loading={loading}
              onClick={this.newGame}
              data-test-welcome-new-game-btn>
            New Game
          </Button>

          <Button
              type="primary"
              disabled={loading}
              linkTo="/join"
              data-test-welcome-join-game-btn>
            Join Game
          </Button>
        </Section>
      </Container>
    );
  }
}

export default Welcome;
