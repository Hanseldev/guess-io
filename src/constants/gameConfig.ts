import type { Difficulty } from '../types/types.ts';

interface ModeSettings {
    readonly codeLength: number
    readonly maxAttempts: number
}

export const GAME_MODES: Record<Difficulty, ModeSettings> = {
    easy: {
        codeLength: 4,
        maxAttempts: 10,
    },
    medium: {
        codeLength: 5,
        maxAttempts: 12,
    },
    hard: {
        codeLength: 6,
        maxAttempts: 15,
    },
    '': {
        codeLength: 0,
        maxAttempts: 0,
    }
}
