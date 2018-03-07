var SpaceHipster = SpaceHipster || {};

SpaceHipster.Boot = {
  //initiate game settings
  init: function(currentLevel) {
    this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    this.game.physics.startSystem(Phaser.Physics.ARCADE);
    this.PLAYER_SPEED = 200;
    this.BULLET_SPEED = -1000;

    //levels
    this.numLevels = 3;
    this.currentLevel = currentLevel ? currentLevel : 1;


  },

  create: function() {
    console.log(this.currentLevel);
    this.state.start('GameState');
  }
}
