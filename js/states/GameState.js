var SpaceHipster = SpaceHipster || {};

SpaceHipster.GameState = {
  // Moved to Boot

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

  //load the game assets before the game starts
  preload: function() {
    this.load.image('space', 'assets/images/space.png');
    this.load.image('player', 'assets/images/player.png');
    this.load.image('bullet', 'assets/images/bullet.png');
    this.load.image('enemyParticle', 'assets/images/enemyParticle.png');
    this.load.spritesheet('yellowEnemy', 'assets/images/yellow_enemy.png', 50, 46, 3, 1, 1);
    this.load.spritesheet('redEnemy', 'assets/images/red_enemy.png', 50, 46, 3, 1, 1);
    this.load.spritesheet('greenEnemy', 'assets/images/green_enemy.png', 50, 46, 3, 1, 1);

    //load level data
    this.load.text('level1', 'assets/data/level1.json')
    this.load.text('level2', 'assets/data/level2.json')
    this.load.text('level3', 'assets/data/level3.json')

    //load sound
    this.load.audio('orchestra', ['assets/audio/8bit-orchestra.mp3', 'assets/audio/8bit-orchestra.oog'])
  },
  //executed after everything is loaded
  create: function() {
    //background
    this.background = this.add.tileSprite(0, 0, this.game.world.width, this.game.world.height, 'space')
    this.background.autoScroll(0, 30);

    //player
    this.player = this.add.sprite(this.game.world.centerX, this.game.world.height - 50, 'player');
    this.game.physics.arcade.enable(this.player);
    this.player.body.collideWorldBounds = true;

    //create bullets
    this.initBullets();
    this.shootingTimer = this.game.time.events.loop(Phaser.Timer.SECOND / 5, this.createPlayerBullet, this);

    //create enemy
    this.initEnemies();

    //load level
    this.loadLevel();

    //load sound
    this.orchestra = this.add.audio('orchestra');
    this.orchestra.play();

  },
  update: function() {

    this.game.physics.arcade.overlap(this.playerBullets, this.enemies, this.damageEnemy, null, this);

    this.game.physics.arcade.overlap(this.enemyBullets, this.player, this.killPlayer, null, this);

    //velocity is zero is nothing is pressed
    this.player.body.velocity.x = 0;

    //moves left or right depending on where the screen is touched
    if (this.game.input.activePointer.isDown) {
      var targetX = this.game.input.activePointer.position.x;

      var direction = targetX >= this.game.world.centerX ? 1 : -1;

      this.player.body.velocity.x = direction * this.PLAYER_SPEED;
    }
  },

  initBullets: function() {
    this.playerBullets = this.add.group();
    this.playerBullets.enableBody = true;
  },

  createPlayerBullet: function() {
    var bullet = this.playerBullets.getFirstExists(false);

    if (!bullet) {
      bullet = new SpaceHipster.PlayerBullet(this.game, this.player.x + 20, this.player.top);
      this.playerBullets.add(bullet)
    } else {
      //reset pos
      bullet.reset(this.player.x + 20, this.player.top);
    }
    //set velocity
    bullet.body.velocity.y = this.BULLET_SPEED;
  },

  initEnemies: function() {

    this.enemies = this.add.group();
    this.enemies.enableBody = true;

    this.enemyBullets = this.add.group();
    this.enemyBullets.enableBody = true;

  },

  damageEnemy: function(bullet, enemy) {
    enemy.damage(1);
    bullet.kill();
  },

  killPlayer: function() {
    this.player.kill();
    this.orchestra.stop();
    this.game.state.start('GameState');
  },

  createEnemy: function(x, y, health, key, scale, speedX, speedY) {
    var enemy = this.enemies.getFirstExists(false);

    if (!enemy) {
      enemy = new SpaceHipster.Enemy(this.game, x, y, key, health, this.enemyBullets);
      this.enemies.add(enemy);
    }

    enemy.reset(x, y, health, key, scale, speedX, speedY);
  },


  loadLevel: function () {
    this.currentEnemyIndex = 0;
    this.levelData = JSON.parse(this.game.cache.getText('level' + this.currentLevel));
    console.log(JSON.parse(this.game.cache.getText('level1')));

    //end of the level timer
    this.endOfLevelTimer = this.game.time.events.add(this.levelData.duration * 1000, function() {
      //stop music on new level
      this.orchestra.stop();
      if (this.currentLevel < this.numLevels) {
        this.currentLevel++;
      } else {

        this.currentLevel = 1;
      }

      console.log(this.currentLevel);

      this.game.state.start('GameState', true, false, this.currentLevel);


      console.log('here');

    }, this);


    this.scheduleNextEnemy();

  },

  scheduleNextEnemy: function() {
    var nextEnemy = this.levelData.enemies[this.currentEnemyIndex];

    if (nextEnemy) {
      var nextTime = 1000 * (nextEnemy.time - (this.currentEnemyIndex == 0 ? 0 : this.levelData.enemies[this.currentEnemyIndex - 1].time));

      this.nextEnemyTimer = this.game.time.events.add(nextTime, function() {
        this.createEnemy(nextEnemy.x * this.game.world.width, -100, nextEnemy.health, nextEnemy.key, nextEnemy.scale, nextEnemy.speedX, nextEnemy.speedY);

        this.currentEnemyIndex++;
        this.scheduleNextEnemy();
      }, this);
    }
  }

};
