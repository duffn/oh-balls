export enum Difficulty {
  easy = 'easy',
  normal = 'normal',
  medium = 'medium',
  hard = 'hard',
  ludicrous = 'ludicrous'
}

export interface GameSettings {
  difficulty: Difficulty;
  roundTime: number;
  resetTime: number;
  items: number;
  musicEnabled: boolean;
  soundEffectsEnabled: boolean;
}

export const DIFFICULTIES: GameSettings['difficulty'][] = [
  Difficulty.easy,
  Difficulty.normal,
  Difficulty.medium,
  Difficulty.hard,
  Difficulty.ludicrous
];

export const DIFFICULTY_SETTINGS = {
  easy: {
    roundTime: 12,
    resetTime: 0, // TODO: don't reset at all
    items: 6
  },
  normal: {
    roundTime: 12,
    resetTime: 4,
    items: 6
  },
  medium: {
    roundTime: 12,
    resetTime: 3,
    items: 6
  },
  hard: {
    roundTime: 12,
    resetTime: 2,
    items: 6
  },
  ludicrous: {
    roundTime: 12,
    resetTime: 1,
    items: 4
  }
};

export function updateDifficulty(
  settings: GameSettings,
  difficultyText: Phaser.GameObjects.Text,
  registry: Phaser.Data.DataManager,
  currentDifficultyIndex: number
): void {
  settings.difficulty = DIFFICULTIES[currentDifficultyIndex];

  // Update the dependent settings
  const newSettings = DIFFICULTY_SETTINGS[settings.difficulty];
  settings.roundTime = newSettings.roundTime;
  settings.resetTime = newSettings.resetTime;
  settings.items = newSettings.items;

  difficultyText.setText(DIFFICULTIES[currentDifficultyIndex]);
  difficultyText.setColor(
    DIFFICULTIES[currentDifficultyIndex] == Difficulty.ludicrous
      ? '#E75159'
      : '#667A81'
  );
  registry.set('settings', settings); // Update the registry
}
