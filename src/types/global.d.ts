declare global {
    namespace NodeJS {
        interface ProcessEnv {
            BOT_TOKEN: string;
            MAX_KEY_SIZE: number;
            MAX_KEYBOARD_COLUMNS: number;
        }
    }
}

export {};
