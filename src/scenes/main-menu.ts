import {
  GameSettings,
  DIFFICULTIES,
  Difficulty,
  updateDifficulty
} from '../lib/settings';
import { MusicManager } from '../lib/music-manager';
import { SpeakerToggle } from '../components/speaker-toggle';
import { BaseScene } from '../components/base-scene';

export class MainMenu extends BaseScene {
  private readonly TITLE_START_Y = 225;
  private settings: GameSettings;
  private musicManager!: MusicManager;
  private difficultyText: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'MainMenu' });
  }

  create(): void {
    super.create();

    this.musicManager = MusicManager.getInstance(this);
    this.settings = this.registry.get('settings');

    if (this.settings.musicEnabled) {
      this.musicManager.playMusic();
    } else {
      this.musicManager.stopMusic();
    }

    new SpeakerToggle(
      this,
      this.scale.width - 50,
      50,
      this.registry,
      this.musicManager
    );

    const fontStyle = {
      fontFamily: '"Mountains of Christmas"',
      fontSize: 36,
      color: '#B07F5F',
      stroke: '#ffffff',
      strokeThickness: 6
    };

    const titleText = this.add
      .text(412, this.TITLE_START_Y, 'Oh, balls', {
        ...fontStyle,
        fontSize: 172,
        color: '#667A81',
        stroke: '#ffffff',
        strokeThickness: 8
      })
      .setOrigin(0.5);
    titleText.alpha = 0;

    let currentDifficultyIndex = DIFFICULTIES.indexOf(this.settings.difficulty);

    this.difficultyText = this.add
      .text(
        522,
        this.TITLE_START_Y + 141,
        DIFFICULTIES[currentDifficultyIndex],
        {
          ...fontStyle,
          color:
            DIFFICULTIES[currentDifficultyIndex] == Difficulty.ludicrous
              ? '#E75159'
              : '#667A81',
          fontSize: 48
        }
      )
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => {
        currentDifficultyIndex =
          (currentDifficultyIndex + 1) % DIFFICULTIES.length;
        updateDifficulty(
          this.settings,
          this.difficultyText,
          this.registry,
          currentDifficultyIndex
        );
      });
    this.difficultyText.alpha = 0;

    const difficultyTextLabel = this.add
      .text(352, this.TITLE_START_Y + 141, 'Difficulty: ', {
        ...fontStyle,
        color: '#667A81',
        fontSize: 48
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => {
        currentDifficultyIndex =
          (currentDifficultyIndex + 1) % DIFFICULTIES.length;
        updateDifficulty(
          this.settings,
          this.difficultyText,
          this.registry,
          currentDifficultyIndex
        );
      });
    difficultyTextLabel.alpha = 0;

    const playButton = this.add
      .text(412, this.TITLE_START_Y + 258, 'Play', {
        ...fontStyle,
        fontSize: 64
      })
      .setOrigin(0.5);
    playButton.alpha = 0;
    playButton.setInteractive({ useHandCursor: true });
    playButton.on('pointerdown', () => {
      this.scene.start('Game');
    });

    const settingsButton = this.add
      .text(412, this.TITLE_START_Y + 368, 'Settings', fontStyle)
      .setOrigin(0.5);
    settingsButton.alpha = 0;
    settingsButton.setInteractive({ useHandCursor: true });
    settingsButton.on('pointerdown', () => {
      this.scene.start('Settings');
    });

    const instructionsButton = this.add
      .text(412, this.TITLE_START_Y + 428, 'Instructions', fontStyle)
      .setOrigin(0.5);
    instructionsButton.alpha = 0;
    instructionsButton.setInteractive({ useHandCursor: true });
    instructionsButton.on('pointerdown', () => {
      this.scene.start('Instructions');
    });

    this.tweens.chain({
      tweens: [
        {
          targets: titleText,
          alpha: { from: 0, to: 1 },
          duration: 750
        },
        {
          targets: [
            difficultyTextLabel,
            this.difficultyText,
            playButton,
            settingsButton,
            instructionsButton
          ],
          alpha: { from: 0, to: 1 },
          duration: 750
        }
      ]
    });
  }
}
