declare global {
	namespace NodeJS {
		interface ProcessEnv {
			BOT_TOKEN: string;
			OWNER_ID: string;
			MAX_KEY_SIZE: number;
			MAX_KEYBOARD_COLUMNS: number;
			MESSAGE_WINDOW: number;
			MESSAGE_LIMIT: number;
		}
	}
}

export {};
