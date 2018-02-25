import { describe, it, beforeEach } from 'mocha';
import { expect } from 'chai';

import {
  setupRoomForTesting,
  emitSocketEvent,
  promisifySocketEvent,
  createSocketAndJoinGame
} from './helpers';

import MonopolyError from '../../src/error';

describe('Room: actions', function() {
  let p1, p2;

  const promiseAction = (ws, event, ...args) => {
    let promised = promisifySocketEvent(ws, 'game:update');
    emitSocketEvent(ws, event, ...args);
    return promised;
  };

  setupRoomForTesting();

  beforeEach(async function() {
    p1 = await createSocketAndJoinGame(this.room, 'top-hat');
    p2 = await createSocketAndJoinGame(this.room, 'automobile');
  });

  /* eslint-disable indent */
  [{ event: 'player:transfer', args: [100] },
   { event: 'player:claim-bankruptcy', args: [] },
   { event: 'property:buy', args: ['oriental-avenue'] },
   { event: 'property:improve', args: ['oriental-avenue'] },
   { event: 'property:unimprove', args: ['oriental-avenue'] },
   { event: 'property:mortgage', args: ['oriental-avenue'] },
   { event: 'property:unmortgage', args: ['oriental-avenue'] },
   { event: 'property:pay-rent', args: ['oriental-avenue'] },
   { event: 'auction:new', args: ['oriental-avenue'] },
   { event: 'auction:bid', args: [100] },
   { event: 'auction:concede', args: [] },
   { event: 'trade:new', args: ['automobile', { properties: ['oriental-avenue'] }] },
   { event: 'trade:decline', args: ['automobile'] },
   { event: 'trade:accept', args: ['automobile'] }
  /* eslint-enable indent */
  ].forEach(({ event, args }) => {
    it(`should respond to "${event}"`, async function() {
      await expect(promiseAction(p1, event, ...args).catch((error) => {
        expect(error).to.be.an.instanceof(MonopolyError);
      })).to.be.fulfilled;
    });
  });

  describe('actions that affect a player\'s balance', function() {
    it('add to that player\'s balance history', async function() {
      let game;

      ({ game } = await promiseAction(p1, 'property:buy', 'boardwalk'));
      ({ game } = await promiseAction(p1, 'player:transfer', -200));

      expect(game.players['top-hat'].balance).to.equal(1300);
      expect(game.players['top-hat'].history).to.have.members([1500, 1100]);
      expect(game.players['automobile'].history).to.be.empty;

      ({ game } = await promiseAction(p2, 'property:pay-rent', 'boardwalk'));

      expect(game.players['automobile'].balance).to.equal(1450);
      expect(game.players['automobile'].history).to.have.members([1500]);
    });
  });
});