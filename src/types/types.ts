export type Difficulty = 'easy' | 'medium' | 'hard' | ''
export type CellStatus = 'correct' | 'misplaced' | 'incorrect' | 'empty'

export interface Player {
    id: string,
    name: string,
    progress: CellStatus[] 
}

export interface GuessResult {
    guess: string,
    result: CellStatus[]
} 