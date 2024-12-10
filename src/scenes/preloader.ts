import { GameSettings, Difficulty } from '../lib/settings';
import WebFontFile from '../lib/web-font-loader';
import assetPackUrl from '../assets/asset-pack.json';

export class Preloader extends Phaser.Scene {
  constructor() {
    super({ key: 'Preloader' });
  }

  init(): void {
    this.add.image(512, 384, 'background');

    this.add.rectangle(512, 360, 468, 32).setStrokeStyle(8, 0xffffff);
    const bar = this.add.rectangle(512 - 260, 360, 4, 28, 0x667a81);
    this.load.on('progress', (progress: number) => {
      //  Update the progress bar (our bar is 464px wide, so 100% = 464px)
      bar.width = 4 + 460 * progress;
    });
  }

  preload(): void {
    if (!this.registry.has('settings')) {
      const defaultSettings: GameSettings = {
        difficulty: Difficulty.normal,
        roundTime: 12,
        resetTime: 4,
        items: 6,
        musicEnabled: false,
        soundEffectsEnabled: false
      };
      this.registry.set('settings', defaultSettings);
    }

    this.load.addFile(new WebFontFile(this.load, ['Mountains of Christmas']));

    // @ts-ignore
    this.load.pack('pack', assetPackUrl);
  }

  create(): void {
    this.scene.start('MainMenu');
  }
}
