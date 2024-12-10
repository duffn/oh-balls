import { BaseScene } from '../components/base-scene';

export class Instructions extends BaseScene {
  private readonly INSTRUCTIONS_START_X = 75;

  private readonly INSTRUCTIONS_START_Y = 130;

  constructor() {
    super({ key: 'Instructions' });
  }

  create(): void {
    super.create();

    const fontStyle = {
      fontFamily: '"Mountains of Christmas"',
      fontSize: 36,
      color: '#667A81',
      stroke: '#ffffff',
      strokeThickness: 6
    };

    this.add.text(412, 50, 'Instructions', {
      ...fontStyle,
      fontSize: 64,
      color: '#B07F5F'
    });

    this.add.text(
      this.INSTRUCTIONS_START_X,
      this.INSTRUCTIONS_START_Y + 10,
      'This is a simple draw and match game, with a twist.',
      fontStyle
    );
    this.add.text(
      this.INSTRUCTIONS_START_X,
      this.INSTRUCTIONS_START_Y + 60,
      'Use your mouse or finger to draw a line to match three or more balls.',
      fontStyle
    );
    this.add.text(
      this.INSTRUCTIONS_START_X,
      this.INSTRUCTIONS_START_Y + 110,
      'Match more for a higher score, but be quick as a round is only 12 seconds!',
      fontStyle
    );

    this.add.text(
      this.INSTRUCTIONS_START_X,
      this.INSTRUCTIONS_START_Y + 210,
      "And watch out! If you don't make a match before the reset",
      fontStyle
    );
    this.add.text(
      this.INSTRUCTIONS_START_X,
      this.INSTRUCTIONS_START_Y + 260,
      "timer runs out, the board resets, even if you're in the",
      fontStyle
    );
    this.add.text(
      this.INSTRUCTIONS_START_X,
      this.INSTRUCTIONS_START_Y + 310,
      'middle of a match!',
      fontStyle
    );
    this.add.text(
      this.INSTRUCTIONS_START_X,
      this.INSTRUCTIONS_START_Y + 410,
      'Act quick, make matches, and work your way up to',
      fontStyle
    );
    this.add.text(
      this.INSTRUCTIONS_START_X,
      this.INSTRUCTIONS_START_Y + 460,
      'ludicrous difficulty!',
      fontStyle
    );
    this.add
      .text(
        this.INSTRUCTIONS_START_X + 447,
        this.INSTRUCTIONS_START_Y + 500,
        'Back',
        {
          ...fontStyle,
          align: 'center',
          color: '#B07F5F'
        }
      )
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this.scene.start('MainMenu'));
  }
}
