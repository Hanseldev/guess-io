export type Difficulty = "easy" | "medium" | "hard" | "";
export type CellStatus = "correct" | "misplaced" | "incorrect" | "empty";

export interface Player {
	id: string;
	name: string;
	progress: CellStatus[];
}

export interface GuessResult {
	guess: (string | number)[];
	result: CellStatus[];
}

export interface MatchFoundPayload {
	roomId: string;
	players: string[];
	difficulty: Difficulty;
}

export interface GuessResultPayload {
	guess: string;
	result: CellStatus[];
}

export interface GameOverPayload {
	message: string;
	winner: string;
}

export interface ErrorPayload {
    success: boolean;
    message: string;
}