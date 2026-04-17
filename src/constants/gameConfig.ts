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
        maxAttempts: 8,
    },
    hard: {
        codeLength: 6,
        maxAttempts: 6,
    },
    '': {
        codeLength: 0,
        maxAttempts: 0,
    }
}
