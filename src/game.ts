import Phaser from 'phaser';
import { Boot } from './scenes/boot';
import { Game } from './scenes/game';
import { GameOver } from './scenes/game-over';
import { Instructions } from './scenes/instructions';
import { MainMenu } from './scenes/main-menu';
import { Preloader } from './scenes/preloader';
import { Settings } from './scenes/settings';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    parent: 'game',
    width: 1280,
    height: 720
  },
  scene: [Boot, Preloader, MainMenu, Instructions, Settings, Game, GameOver]
};

export default new Phaser.Game(config);
