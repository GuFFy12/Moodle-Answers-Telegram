declare global {
	namespace NodeJS {
		interface ProcessEnv {
			BOT_TOKEN: string;
			OWNER_ID: string;
			MAX_KEY_SIZE: string;
			MAX_KEYBOARD_COLUMNS: string;
			MESSAGE_WINDOW: string;
			MESSAGE_LIMIT: string;
			MAX_LOG_SIZE: string;
			MAX_LOG_BACKUPS: string;
		}
	}
}

export {};
