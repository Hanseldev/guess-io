export type CellStatus = "correct" | "present" | "absent" | "empty";

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
	message: string;
	roomId: string;
	digit: number;
	tries: number;
	players: string[];
}

export interface GuessResultPayload {
	guess: string;
	result: CellStatus[];
	correctPosition: number;
	correctDigit: number;
}

export interface GameOverPayload {
	secret: string;
	winner: string | null;
}

export interface ErrorPayload {
	success: boolean;
	message: string;
}
