import { MusicManager } from '../lib/music-manager';
import { GameSettings } from '../lib/settings';

export class SpeakerToggle extends Phaser.GameObjects.Container {
  private speakerOnIcon: Phaser.GameObjects.Image;
  private speakerOffIcon: Phaser.GameObjects.Image;
  private settings: GameSettings;
  private musicManager: MusicManager;
  private registry: Phaser.Data.DataManager;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    registry: Phaser.Data.DataManager,
    musicManager: MusicManager
  ) {
    super(scene, x, y);

    this.scene = scene;
    this.musicManager = musicManager;
    this.registry = registry;
    this.settings = this.registry.get('settings');

    this.speakerOnIcon = this.scene.add
      .image(0, 0, 'speaker-on')
      .setInteractive({ useHandCursor: true })
      .setVisible(this.settings.musicEnabled)
      .setScale(0.5);

    this.speakerOffIcon = this.scene.add
      .image(0, 0, 'speaker-off')
      .setInteractive({ useHandCursor: true })
      .setVisible(!this.settings.musicEnabled)
      .setScale(0.5);

    this.add(this.speakerOnIcon);
    this.add(this.speakerOffIcon);

    this.speakerOnIcon.on('pointerdown', () => this.toggleAudio(false));
    this.speakerOffIcon.on('pointerdown', () => this.toggleAudio(true));

    // Lighten up the speaker icons a bit with the background color.
    const overlay = scene.add.graphics();
    overlay.fillStyle(0xf7f3e8, 0.5);
    overlay.fillRect(
      this.speakerOnIcon.x - this.speakerOnIcon.displayWidth / 2,
      this.speakerOnIcon.y - this.speakerOnIcon.displayHeight / 2,
      this.speakerOnIcon.displayWidth,
      this.speakerOnIcon.displayHeight
    );
    this.add(overlay);

    this.scene.add.existing(this);
  }

  toggleAudio(isMusicEnabled: boolean): void {
    if (isMusicEnabled) {
      this.musicManager.playMusic();
      this.settings.musicEnabled = true;
      this.registry.set('settings', this.settings);
      this.speakerOnIcon.setVisible(true);
      this.speakerOffIcon.setVisible(false);
    } else {
      this.musicManager.stopMusic();
      this.settings.musicEnabled = false;
      this.registry.set('settings', this.settings);
      this.speakerOnIcon.setVisible(false);
      this.speakerOffIcon.setVisible(true);
    }
  }
}
