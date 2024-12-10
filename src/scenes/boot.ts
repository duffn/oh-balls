export class Boot extends Phaser.Scene {
  constructor() {
    super({ key: 'Boot' });
  }

  preload(): void {
    this.load.image('background', 'assets/backgrounds/christmas.jpg');
  }

  create(): void {
    this.scene.start('Preloader');
  }
}
