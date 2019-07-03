import React, { useMemo } from 'react';

import { useApp, useGame } from '../utils';
import { Container, Section } from '../ui/layout';
import { Text } from '../ui/typography';
import Icon from '../ui/icon';
import Button from '../ui/button';
import NavBar from '../ui/nav-bar';
import PlayerSummary from '../game/player-summary';
import PlayerCard from '../game/player-card';

export default function DashboardScreen() {
  let { room, player } = useApp();
  let { players } = useGame();

  players = useMemo(() => (
    players._all.filter(token => token !== player.token)
  ), [player.token, players._all]);

  return (
    <Container data-test-dashboard>
      <NavBar
        roomCode={room}
        renderLeft={() => (
          <Button
            style="icon"
            linkTo={`/${room}/bank`}
            data-test-bank-btn
          >
            <Icon name="bank"/>
          </Button>
        )}
      >
        <Text
          color="lighter"
          icon={player.token}
          data-test-player-name
        >
          {player.name}
        </Text>
      </NavBar>

      <PlayerSummary
        player={player.token}
      />

      <Section>
        {players.map(token => (
          <PlayerCard
            key={token}
            player={token}
          />
        ))}
      </Section>
    </Container>
  );
}
