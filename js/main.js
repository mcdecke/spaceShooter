var SpaceHipster = SpaceHipster || {};

//initiate the Phaser framework
SpaceHipster.game = new Phaser.Game('100%', '100%', Phaser.AUTO);

SpaceHipster.game.state.add('Boot', SpaceHipster.Boot);
SpaceHipster.game.state.add('GameState', SpaceHipster.GameState);
// console.log(SpaceHipster.game.state.states);
SpaceHipster.game.state.start('Boot');
