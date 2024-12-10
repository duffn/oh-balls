import { BaseScene } from '../components/base-scene';
import { SpeakerToggle } from '../components/speaker-toggle';
import { MusicManager } from '../lib/music-manager';
import { Difficulty, GameSettings } from '../lib/settings';

export class GameOver extends BaseScene {
  private readonly GAME_OVER_START_X = 375;
  private readonly GAME_OVER_START_Y = 225;
  private score: number;

  constructor() {
    super({ key: 'GameOver' });
  }

  init(data: { score: number }) {
    this.score = data.score;
  }

  create(): void {
    super.create();

    const settings: GameSettings = this.registry.get('settings');

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
      stroke: '#ffffff',
      strokeThickness: 6
    };

    const gameOverText = this.add.text(
      this.GAME_OVER_START_X,
      this.GAME_OVER_START_Y,
      'Game Over',
      {
        ...fontStyle,
        fontSize: 128,
        align: 'center'
      }
    );
    gameOverText.setOrigin(0.5);

    const scoreText = this.add.text(
      this.GAME_OVER_START_X,
      this.GAME_OVER_START_Y + 96,
      `Score: ${this.score}`,
      { ...fontStyle, fontSize: 64, align: 'center' }
    );
    scoreText.setOrigin(0.5);

    const difficultyTextLabel = this.add.text(
      this.GAME_OVER_START_X - 100,
      this.GAME_OVER_START_Y + 176,
      'Difficulty:',
      { ...fontStyle, fontSize: 64 }
    );
    difficultyTextLabel.setOrigin(0.5);

    const difficultyText = this.add.text(
      this.GAME_OVER_START_X + 140,
      this.GAME_OVER_START_Y + 176,
      settings.difficulty,
      {
        ...fontStyle,
        fontSize: 64,
        color:
          settings.difficulty == Difficulty.ludicrous ? '#E75159' : '#667A81'
      }
    );
    difficultyText.setOrigin(0.5);

    this.add
      .text(
        this.GAME_OVER_START_X,
        this.GAME_OVER_START_Y + 292,
        'Play again',
        {
          ...fontStyle,
          color: '#B07F5F',
          align: 'center'
        }
      )
      .setOrigin(0.5)
      .setInteractive()
      .on('pointerdown', () => this.scene.start('Game'));

    this.add
      .text(this.GAME_OVER_START_X, this.GAME_OVER_START_Y + 372, 'Settings', {
        ...fontStyle,
        color: '#B07F5F',
        align: 'center'
      })
      .setOrigin(0.5)
      .setInteractive()
      .on('pointerdown', () => this.scene.start('Settings'));
  }
}
