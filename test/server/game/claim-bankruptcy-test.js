import { describe, it } from 'mocha';
import { expect } from 'chai';

import {
  setupGameForTesting,
  modifyGameInTesting
} from '../game-helpers';

import MonopolyError from '../../../server/error';
import { bankrupt } from '../../../server/actions/players';

describe('Game: claiming bankruptcy', function() {
  setupGameForTesting({ state: {
    players: [
      { token: 'top-hat' },
      { token: 'automobile' }
    ],
    properties: [{
      id: 'oriental-avenue',
      owner: 'top-hat',
      mortgaged: true
    }]
  }});

  it('should bankrupt the player', function() {
    this.dispatch(bankrupt('top-hat'));

    expect(this.getPlayer('top-hat')).to.deep.include({ bankrupt: true, balance: 0 });
    expect(this.getProperty('oriental-avenue').owner).to.equal('bank');
  });

  it('should transfer properties and remaining balance to another player', function() {
    this.dispatch(bankrupt('top-hat', 'automobile'));

    expect(this.getPlayer('top-hat')).to.deep.include({ bankrupt: true, balance: 0 });
    expect(this.getProperty('oriental-avenue').owner).to.equal('automobile');
    expect(this.getPlayer('automobile').balance).to.equal(3000);
  });

  it('should create a notice', function() {
    this.dispatch(bankrupt('top-hat'));

    expect(this.state.notice.id).to.equal('player.bankrupt');
    expect(this.state.notice.message).to.match(/went bankrupt/);
    expect(this.state.notice.meta).to.have.property('player')
      .that.has.property('token', 'top-hat');
  });

  it('should create a different notice when bankrupt by another player', function() {
    this.dispatch(bankrupt('top-hat', 'automobile'));

    expect(this.state.notice.id).to.equal('player.other-bankrupt');
    expect(this.state.notice.message).to.match(/bankrupt/);
    expect(this.state.notice.meta).to.have.property('player')
      .that.has.property('token', 'top-hat');
    expect(this.state.notice.meta).to.have.property('other')
      .that.has.property('token', 'automobile');
  });

  describe('with improved properties', function() {
    modifyGameInTesting({ state: {
      properties: [{
        id: 'st-james-place',
        owner: 'top-hat',
        buildings: 1
      }]
    }});

    it('should not bankrupt the player', function() {
      expect(() => this.dispatch(bankrupt('top-hat')))
        .to.throw(MonopolyError, /improved/);
      expect(this.getPlayer('top-hat').bankrupt).to.be.false;
      expect(this.getProperty('st-james-place').owner).to.equal('top-hat');
    });
  });

  describe('with unmortgaged properties', function() {
    modifyGameInTesting({ state: {
      properties: [{
        group: 'orange',
        owner: 'top-hat'
      }]
    }});

    it('should not bankrupt the player', function() {
      expect(() => this.dispatch(bankrupt('top-hat')))
        .to.throw(MonopolyError, /unmortgaged/);
      expect(this.getPlayer('top-hat').bankrupt).to.be.false;
      expect(this.getProperty('st-james-place').owner).to.equal('top-hat');
    });
  });
});