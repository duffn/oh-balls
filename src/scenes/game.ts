import { GameSettings, Difficulty } from '../lib/settings';
import {
  DrawAndMatch,
  DrawAndMatchItem,
  DrawAndMatchDirection
} from '../lib/draw-and-match';
import { SpeakerToggle } from '../components/speaker-toggle';
import { MusicManager } from '../lib/music-manager';
import { BaseScene } from '../components/base-scene';

enum gameState {
  WAITING,
  DRAGGING,
  ARRANGING
}

enum itemData {
  ITEM,
  ARROW
}

export class Game extends BaseScene {
  /** The starting x position of the scoring and timer text block. */
  private readonly SCORING_START_X: number = 800;
  /** The starting y position of the scoring and timer text block. */
  private readonly SCORING_START_Y: number = 90;
  private settings: GameSettings;
  private group: Phaser.GameObjects.Group;
  private overlay: Phaser.GameObjects.Graphics;
  private roundTime: number;
  private roundTimerText: Phaser.GameObjects.Text;
  private roundTimer: Phaser.Time.TimerEvent;
  private resetTime: number;
  private resetTimerText: Phaser.GameObjects.Text;
  private resetTimer: Phaser.Time.TimerEvent;
  private score: number = 0;
  /**
   * The number of items to be removed from the board after a match.
   * This is used to calculate the score.
   */
  private toBeRemovedCount: number = 0;
  private scoreText: Phaser.GameObjects.Text;
  private drawAndMatch: DrawAndMatch;
  private currentState: gameState;
  /** The table used to save information about arrow frames and angles. */
  private arrowLookupTable: any[];

  constructor() {
    super({ key: 'Game' });
  }

  init(): void {
    this.score = 0;
  }

  create(): void {
    super.create();

    this.settings = this.registry.get('settings');
    this.roundTime = this.settings.roundTime;
    this.resetTime = this.settings.resetTime;

    this.populateLookupTable();

    this.currentState = gameState.WAITING;

    this.startInput();
    this.setupBoard(true);

    new SpeakerToggle(
      this,
      this.scale.width - 50,
      50,
      this.registry,
      MusicManager.getInstance(this)
    );

    const fontStyle = {
      fontFamily: '"Mountains of Christmas"',
      fontSize: 48,
      color: '#667A81',
      strokeThickness: 6,
      padding: {
        x: 16,
        y: 16
      }
    };

    this.add.text(this.SCORING_START_X, this.SCORING_START_Y, 'Score: ', {
      ...fontStyle,
      fontSize: 60,
      color: '#B07F5F'
    });
    this.scoreText = this.add.text(
      this.SCORING_START_X + 150,
      this.SCORING_START_Y,
      `${this.score}`,
      { ...fontStyle, fontSize: 60, color: '#B07F5F' }
    );
    this.add.text(
      this.SCORING_START_X,
      this.SCORING_START_Y + 120,
      'Round: ',
      fontStyle
    );
    this.roundTimerText = this.add.text(
      this.SCORING_START_X + 150,
      this.SCORING_START_Y + 120,
      `${this.roundTime}:00`,
      fontStyle
    );
    this.add.text(this.SCORING_START_X, this.SCORING_START_Y + 180, 'Reset: ', {
      ...fontStyle,
      color:
        this.settings.difficulty === Difficulty.easy ? '#e0e5e6' : '#667A81',
      strokeThickness: this.settings.difficulty === Difficulty.easy ? 0 : 6
    });
    this.resetTimerText = this.add.text(
      this.SCORING_START_X + 150,
      this.SCORING_START_Y + 180,
      `${this.resetTime}:00`,
      {
        ...fontStyle,
        color:
          this.settings.difficulty === Difficulty.easy ? '#e0e5e6' : '#667A81',
        strokeThickness: this.settings.difficulty === Difficulty.easy ? 0 : 6
      }
    );
    this.add
      .text(this.SCORING_START_X + 100, this.SCORING_START_Y + 520, 'Quit', {
        ...fontStyle,
        color: '#E75159'
      })
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => {
        this.quitGame();
      });
  }

  startGame() {
    this.startTimers();
    if (this.group) this.group.destroy(true);
    if (this.overlay) this.overlay.destroy(true);
  }

  quitGame() {
    if (this.roundTimer) this.roundTimer.remove();
    if (this.resetTimer) this.resetTimer.remove();

    this.scene.start('MainMenu');
  }

  update(): void {
    this.setTimer(this.roundTimer, this.roundTimerText, this.roundTime);
    this.setTimer(this.resetTimer, this.resetTimerText, this.resetTime);
  }

  /**
   * Sets up a timer to be run during the game.
   * @param timer The Phaser timer.
   * @param text The text of the timer. This will be updated while the timer is running.
   * @param time The number of seconds for the timer.
   */
  setTimer(
    timer: Phaser.Time.TimerEvent,
    text: Phaser.GameObjects.Text,
    time: number
  ) {
    if (timer) {
      if (timer.getProgress() === 1) {
        text.setText(`${time}:00`);
      } else {
        const remaining = (time - timer.getElapsedSeconds()).toPrecision(4);
        const pos = remaining.indexOf('.');

        let seconds = remaining.substring(0, pos);
        let ms = remaining.substring(pos + 1, pos + 3);

        seconds = Phaser.Utils.String.Pad(seconds, 2, '0', 1);

        text.setText(seconds + ':' + ms);
      }
    }
  }

  startTimers() {
    this.roundTimer = this.time.addEvent({
      delay: this.roundTime * 1000,
      callback: this.gameOver,
      callbackScope: this
    });

    if (this.settings.resetTime > 0) {
      this.resetTimer = this.time.addEvent({
        delay: this.resetTime * 1000,
        callback: this.resetBoard,
        callbackScope: this,
        repeat: this.roundTime / this.resetTime - 1
      });
    }
  }

  setupBoard(initial: boolean = false) {
    this.drawAndMatch = new DrawAndMatch({
      items: this.settings.items,
      startX: 125,
      startY: 100,
      columns: 6
    });

    let sprites: Phaser.GameObjects.Sprite[] = [];
    const spriteName =
      this.settings.difficulty === Difficulty.ludicrous
        ? 'balls-ludicrous'
        : 'balls';

    this.drawAndMatch.items.map((item: DrawAndMatchItem) => {
      let sprite: Phaser.GameObjects.Sprite = this.add.sprite(
        item.centerX,
        item.centerY,
        spriteName,
        item.value
      );
      sprite.setDepth(0);

      if (!initial) sprite.scale = 0.75;

      // create the arrow sprite and place it to posX, posY
      let arrowSprite: Phaser.GameObjects.Sprite = this.add.sprite(
        item.centerX,
        item.centerY,
        'arrows'
      );
      arrowSprite.setDepth(1).setVisible(false);

      // save sprite information into data custom property
      item.setData([sprite, arrowSprite]);
      sprites.push(sprite);

      // Show an effect when hovering over the balls.
      sprite
        .setInteractive()
        .on('pointerover', () => {
          this.tweens.add({
            targets: sprite,
            scale: sprite.scale * 1.1,
            duration: 100,
            ease: 'Power2'
          });
        })
        .on('pointerout', () => {
          this.tweens.add({
            targets: sprite,
            scale: sprite.scale / 1.1,
            duration: 100,
            ease: 'Power2'
          });
        });
    });

    if (initial) {
      if (this.settings.difficulty === Difficulty.ludicrous) {
        // This overlay hides the board since the difficulty is ludicrous.
        this.overlay = this.add.graphics();
        this.overlay
          .fillStyle(0xf7f3e8, 1)
          .fillRect(125, 100, 600, 600)
          .setDepth(2)
          .setAlpha(0.9)
          .setInteractive(
            new Phaser.Geom.Rectangle(125, 100, 600, 600),
            Phaser.Geom.Rectangle.Contains
          )
          .once('pointerdown', this.startGame, this);

        this.group = this.add.group();
        const overlayTextTitle = this.add.text(422, 334, 'LUDICROUS MODE', {
          fontFamily: '"Mountains of Christmas"',
          fontSize: 72,
          color: '#667A81',
          strokeThickness: 4
        });
        const overlayText = this.add.text(
          422,
          462,
          'Click to reveal the board\nand start the timer.',
          {
            fontFamily: '"Mountains of Christmas"',
            fontSize: 36,
            color: '#667A81',
            strokeThickness: 4,
            align: 'center'
          }
        );

        this.group
          .addMultiple([overlayTextTitle, overlayText])
          .setOrigin(0.5)
          .setDepth(3);
      } else {
        // This overlay is transparent since we're in non-ludicrous difficulty.
        this.overlay = this.add.graphics();
        this.overlay
          .fillStyle(0x000000, 0)
          .fillRect(125, 100, 600, 600)
          .setDepth(2)
          .setInteractive(
            new Phaser.Geom.Rectangle(125, 100, 600, 600),
            Phaser.Geom.Rectangle.Contains
          )
          .once('pointerdown', this.startGame, this);
      }

      // Add an effect to the balls when the game initially loads.
      this.tweens.add({
        targets: sprites,
        scaleX: 0.75,
        scaleY: 0.75,
        duration: 500,
        ease: 'Bounce.out',
        delay: this.tweens.stagger(100, { grid: [6, 6], from: 'center' })
      });
    }
  }

  /**
   * Reset the board after the reset timer has expired.
   */
  resetBoard() {
    if (this.settings.soundEffectsEnabled)
      this.sound.play('reset', { volume: 0.5 });

    this.tweens.add({
      targets: this.resetTimerText,
      ease: 'linear',
      duration: 300,
      scale: 1.2,
      yoyo: true,
      onStart: () => {
        this.resetTimerText.setTint(0xe75159);
      },
      onComplete: () => {
        this.resetTimerText.clearTint();
        this.resetTimerText.setScale(1);
      }
    });

    this.stopInput();

    this.drawAndMatch.items.map((item: DrawAndMatchItem) => {
      item.data[itemData.ITEM].destroy();
      item.data[itemData.ARROW].destroy();
    });

    this.setupBoard();
    this.startInput();
  }

  startInput() {
    this.input.on('pointerdown', this.inputStart, this);
    this.input.on('pointermove', this.inputMove, this);
    this.input.on('pointerup', this.inputStop, this);
  }

  stopInput() {
    this.input.off('pointerdown', this.inputStart, this);
    this.input.off('pointermove', this.inputMove, this);
    this.input.off('pointerup', this.inputStop, this);
  }

  gameOver() {
    this.stopInput();
    this.roundTimer.remove();
    this.resetTimer.remove();
    this.scene.start('GameOver', { score: this.score });
  }

  /**
   * The callback to be run when the player starts input in the scene.
   */
  inputStart(pointer: Phaser.Input.Pointer): void {
    if (this.currentState == gameState.WAITING) {
      let chainStarted: DrawAndMatchItem | null = this.drawAndMatch.startChain(
        pointer.position.x,
        pointer.position.y
      );

      if (chainStarted !== null) {
        chainStarted.data[itemData.ITEM].setAlpha(0.5);

        this.currentState = gameState.DRAGGING;
      }
    }
  }

  /**
   * The callback to be run when the player moves the input in the scene.
   */
  inputMove(pointer: Phaser.Input.Pointer): void {
    if (this.currentState == gameState.DRAGGING) {
      this.drawAndMatch
        .handleInputMovement(pointer.position.x, pointer.position.y)
        .map((item: DrawAndMatchItem) => {
          item.data[itemData.ITEM].setAlpha(item.selected ? 0.5 : 1);
          item.data[itemData.ARROW].setVisible(item.arrowVisible);

          if (item.arrowVisible) {
            let lookupResult: any = this.arrowLookupTable[item.arrowDirection];
            item.data[itemData.ARROW].setFrame(lookupResult.frame);
            item.data[itemData.ARROW].setAngle(lookupResult.angle);
          }
        });
    }
  }

  /**
   * The callback to be run when the player stops providing input in the scene.
   */
  inputStop(): void {
    if (this.currentState == gameState.DRAGGING) {
      this.currentState = gameState.ARRANGING;

      let spritesToRemove: Phaser.GameObjects.Sprite[] = [];

      this.drawAndMatch.removeItems().map((item: DrawAndMatchItem) => {
        if (item.toBeRemoved) {
          spritesToRemove.push(item.data[itemData.ITEM]);
          this.toBeRemovedCount++;
        }

        item.data[itemData.ITEM].setAlpha(1);
        item.data[itemData.ARROW].setVisible(false);
      });

      // This is a match here. Take all the actions necessary when we match.
      if (this.toBeRemovedCount > 0) {
        if (this.settings.soundEffectsEnabled)
          this.sound.play('match', { volume: 0.25 });

        if (this.settings.resetTime > 0) {
          // Add effect to the reset timer after a match.
          this.tweens.add({
            targets: this.resetTimerText,
            ease: 'linear',
            duration: 300,
            scale: 1.2,
            yoyo: true,
            onComplete: () => {
              this.resetTimerText.setScale(1);
            }
          });

          this.resetTimer.reset({
            delay: this.resetTime * 1000,
            callback: this.resetBoard,
            callbackScope: this,
            repeat: this.roundTime / this.resetTime - 1
          });
        }
      }

      this.score += this.toBeRemovedCount;
      this.scoreText.setText(`${this.score}`);
      this.toBeRemovedCount = 0;

      // Fade out the removed items.
      this.tweens.add({
        targets: spritesToRemove,
        alpha: 0,
        duration: 250,
        callbackScope: this,
        onComplete: this.arrangeBoard
      });
    }
  }

  /**
   * Arranges the board after sprites have been matched and removed.
   */
  arrangeBoard(): void {
    let spritesToMove: Phaser.GameObjects.Sprite[] = [];

    let maxDeltaRow: number = 0;

    this.drawAndMatch.arrangeBoard().map((item: DrawAndMatchItem) => {
      let sprite: Phaser.GameObjects.Sprite = item.data[
        itemData.ITEM
      ] as Phaser.GameObjects.Sprite;

      sprite.setAlpha(1);
      sprite.setFrame(item.value);
      sprite.setVisible(true);
      sprite.setPosition(
        item.movement.startCenterX,
        item.movement.startCenterY
      );

      item.data[itemData.ARROW].setPosition(
        item.movement.endCenterX,
        item.movement.endCenterY
      );

      sprite.setData({
        startY: item.movement.startCenterY,
        totalMovement: item.movement.endCenterY - item.movement.startCenterY,
        deltaRow: item.movement.deltaRow
      });

      spritesToMove.push(sprite);

      maxDeltaRow = Math.max(maxDeltaRow, item.movement.deltaRow);
    });

    this.tweens.addCounter({
      from: 0,
      to: 1,
      duration: maxDeltaRow * 65,
      callbackScope: this,
      onUpdate: (tween: Phaser.Tweens.Tween) => {
        spritesToMove.forEach((item: Phaser.GameObjects.Sprite) => {
          let delta: number = Math.min(
            1,
            (tween.getValue() / item.getData('deltaRow')) * maxDeltaRow
          );

          item.setY(
            item.getData('startY') + item.getData('totalMovement') * delta
          );
        });
      },
      onComplete: () => {
        this.currentState = gameState.WAITING;
      }
    });
  }

  populateLookupTable(): void {
    this.arrowLookupTable = [];
    this.arrowLookupTable[DrawAndMatchDirection.NONE] = {
      frame: 0,
      angle: 0
    };
    this.arrowLookupTable[DrawAndMatchDirection.UP] = {
      frame: 0,
      angle: -90
    };
    this.arrowLookupTable[
      DrawAndMatchDirection.UP + DrawAndMatchDirection.RIGHT
    ] = {
      frame: 1,
      angle: -90
    };
    this.arrowLookupTable[DrawAndMatchDirection.RIGHT] = {
      frame: 0,
      angle: 0
    };
    this.arrowLookupTable[
      DrawAndMatchDirection.RIGHT + DrawAndMatchDirection.DOWN
    ] = {
      frame: 1,
      angle: 0
    };
    this.arrowLookupTable[DrawAndMatchDirection.DOWN] = {
      frame: 0,
      angle: 90
    };
    this.arrowLookupTable[
      DrawAndMatchDirection.DOWN + DrawAndMatchDirection.LEFT
    ] = {
      frame: 1,
      angle: 90
    };
    this.arrowLookupTable[DrawAndMatchDirection.LEFT] = {
      frame: 0,
      angle: 180
    };
    this.arrowLookupTable[
      DrawAndMatchDirection.LEFT + DrawAndMatchDirection.UP
    ] = {
      frame: 1,
      angle: 180
    };
  }
}
