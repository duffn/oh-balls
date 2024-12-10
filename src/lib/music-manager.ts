export class MusicManager {
  private static instance: MusicManager | null = null;
  private music: Phaser.Sound.BaseSound | null = null;
  private scene: Phaser.Scene;

  private constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  static getInstance(scene: Phaser.Scene): MusicManager {
    if (!MusicManager.instance) {
      MusicManager.instance = new MusicManager(scene);
    }
    return MusicManager.instance;
  }

  playMusic(): void {
    if (!this.music) {
      this.music = this.scene.sound.add('music', {
        loop: true,
        volume: 0.4
      });
    }
    if (!this.music.isPlaying) {
      this.music.play();
    }
  }

  stopMusic(): void {
    if (this.music && this.music.isPlaying) {
      this.music.stop();
    }
  }

  isMusicPlaying(): boolean {
    return this.music?.isPlaying || false;
  }
}
