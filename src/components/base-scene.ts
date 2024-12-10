export class BaseScene extends Phaser.Scene {
  constructor({ key }: { key: string }) {
    super({ key });
  }

  create(): void {
    this.add.image(512, 384, 'background');
  }
}
