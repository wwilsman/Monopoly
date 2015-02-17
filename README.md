Monopoly Manger
===============

Easily manage your assets during a game of Monopoly


Play A Game!
------------

It's operational via the Node CLI!

```bash
user:Monopoly$ node
> 
> // require monopoly
> var Game = require('./lib/main');
> 
> // create a new game using the example.json config
> var config = JSON.parse(require('fs').readFileSync('example.json'));
> var M = new Game(config);
> 
> // play a game
> var p1 = M.Player.get('Player 1');
> var p2 = M.Player.get('Player 2');
>
> p1.transfer(p2, M.Property.get('Oriental Avenue'));
> 
```


Todo:
-----

- [ ] Create a game
- [ ] Retrieve a game
- [ ] Set up database
- [ ] Add player to a game
- [ ] Authenticate player
- [ ] Events
- [ ] Front-End
