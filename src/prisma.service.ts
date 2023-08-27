import { PrismaClient } from '@prisma/client';
import { Bot } from 'grammy';

import { MyContext } from './types';

export default class PrismaService extends PrismaClient {
	async onModuleInit() {
		await this.$connect();
	}

	enableShutdownHooks(bot: Bot<MyContext>) {
		this.$on('beforeExit', async () => {
			await bot.stop();
		});
	}
}
