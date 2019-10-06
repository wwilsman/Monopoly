import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import styles from './player-select.css';

import Icon from '../../ui/icon';
import { Text } from '../../ui/typography';
import RadioGroup from '../../ui/forms/radio-group';

const cx = classNames.bind(styles);

const playerType = PropTypes.shape({
  name: PropTypes.string.isRequired,
  token: PropTypes.string.isRequired
});

PlayerSelect.propTypes = {
  label: PropTypes.string.isRequired,
  players: PropTypes.arrayOf(playerType).isRequired,
  onSelect: PropTypes.func.isRequired,
  selected: playerType,
};

export default function PlayerSelect({
  label,
  players,
  selected,
  onSelect,
}) {
  return (
    <div
      className={styles.root}
      data-test-player-select
    >
      <RadioGroup
        className={styles.group}
        itemClassName={styles.item}
        label={() => (
          <span
            className={styles.combobox}
            data-test-player-select-label
          >
            <Text className={styles.label} upper>
              {label}
            </Text>

            <Text icon={selected?.token || players[0]?.token || 'bank'} upper>
              {selected?.name ?? players[0]?.name ?? 'Bank'}
            </Text>
          </span>
        )}
        data={players}
        itemIdKey="token"
        onSelect={onSelect}
        selected={selected ? players.indexOf(selected) : 0}
        renderItem={(player, { selected }) => (
          <div className={cx('token', { 'is-selected': selected })}>
            <Icon name={player.token}/>
            <Text upper sm>{player.name}</Text>
          </div>
        )}
      />
    </div>
  );
}
