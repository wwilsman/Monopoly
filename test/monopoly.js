var fs = require('fs');
var _ = require('../lib/utilities')._;

eval(fs.readFileSync('./lib/monopoly.js').toString());
eval(fs.readFileSync('./lib/config.js').toString());
eval(fs.readFileSync('./lib/player.js').toString());
eval(fs.readFileSync('./lib/property.js').toString());

module.exports = Monopoly;
