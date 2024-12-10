import {
  GameSettings,
  Difficulty,
  DIFFICULTIES,
  updateDifficulty
} from '../lib/settings';
import { MusicManager } from '../lib/music-manager';
import { BaseScene } from '../components/base-scene';

export class Settings extends BaseScene {
  private readonly SETTINGS_START_Y = 154;
  private musicManager!: MusicManager;
  private settings: GameSettings;
  private difficultyText: Phaser.GameObjects.Text;
  private musicText: Phaser.GameObjects.Text;
  private soundEffectsText: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'Settings' });
  }

  create(): void {
    super.create();

    this.settings = this.registry.get('settings');

    this.musicManager = MusicManager.getInstance(this);

    const fontStyle = {
      fontFamily: '"Mountains of Christmas"',
      fontSize: 48,
      color: '#B07F5F',
      stroke: '#ffffff',
      strokeThickness: 8
    };

    this.add
      .text(412, this.SETTINGS_START_Y, 'Settings', {
        ...fontStyle,
        fontSize: 128,
        color: '#667A81'
      })
      .setOrigin(0.5);

    let currentDifficultyIndex = DIFFICULTIES.indexOf(this.settings.difficulty);

    this.add
      .text(352, this.SETTINGS_START_Y + 141, 'Difficulty: ', {
        ...fontStyle,
        color: '#667A81'
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
    this.difficultyText = this.add
      .text(
        522,
        this.SETTINGS_START_Y + 141,
        DIFFICULTIES[currentDifficultyIndex],
        {
          ...fontStyle,
          color:
            DIFFICULTIES[currentDifficultyIndex] == Difficulty.ludicrous
              ? '#E75159'
              : '#667A81'
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

    this.add
      .text(352, this.SETTINGS_START_Y + 211, 'Music: ', {
        ...fontStyle,
        color: '#667A81'
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => {
        this.updateMusic();
      });
    this.musicText = this.add
      .text(
        522,
        this.SETTINGS_START_Y + 211,
        this.settings.musicEnabled ? 'on' : 'off',
        { ...fontStyle, color: '#667A81' }
      )
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => {
        this.updateMusic();
      });

    this.add
      .text(352, this.SETTINGS_START_Y + 281, 'Sound Effects: ', {
        ...fontStyle,
        color: '#667A81'
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => {
        this.updateSoundEffects();
      });
    this.soundEffectsText = this.add
      .text(
        522,
        this.SETTINGS_START_Y + 281,
        this.settings.soundEffectsEnabled ? 'on' : 'off',
        { ...fontStyle, color: '#667A81' }
      )
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => {
        this.updateSoundEffects();
      });

    this.add
      .text(400, this.SETTINGS_START_Y + 400, 'Play', {
        ...fontStyle,
        fontSize: 64
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this.scene.start('Game'));

    this.add
      .text(400, this.SETTINGS_START_Y + 500, 'Back', {
        ...fontStyle,
        fontSize: 36
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this.scene.start('MainMenu'));
  }

  updateSoundEffects(): void {
    this.settings.soundEffectsEnabled = !this.settings.soundEffectsEnabled;
    this.soundEffectsText.setText(
      this.settings.soundEffectsEnabled ? 'on' : 'off'
    );
    this.registry.set('settings', this.settings);
  }

  updateMusic(): void {
    this.settings.musicEnabled = !this.settings.musicEnabled;
    this.musicText.setText(this.settings.musicEnabled ? 'on' : 'off');
    this.registry.set('settings', this.settings); // Update the registry

    if (this.settings.musicEnabled) {
      this.musicManager.playMusic();
    } else {
      this.musicManager.stopMusic();
    }
  }
}
