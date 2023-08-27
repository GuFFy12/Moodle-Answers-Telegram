import { conversations } from '@grammyjs/conversations';
import { Bot, session } from 'grammy';

import commands from './commands';
import { CheckedQuestionCount } from './prisma.adapters';
import PrismaService from './prisma.service';
import { MyContext } from './types';

async function bootstrap() {
	const bot = new Bot<MyContext>(process.env.BOT_TOKEN ?? '');

	const prisma = new PrismaService();

	bot.use(
		session({
			type: 'multi',
			checkedModulesCount: {
				storage: new CheckedQuestionCount(prisma.session),
				initial: () => 0,
			},
			conversation: {},
		}),
	);

	bot.use(async (ctx, next) => {
		ctx.config = {
			isDeveloper: ctx.from?.id === parseInt(process.env.BOT_DEVELOPER ?? ''),
		};

		await next();
	});

	bot.use(conversations());
	bot.use(...commands(bot, prisma));

	process.once('SIGINT', () => bot.stop());
	process.once('SIGTERM', () => bot.stop());
	prisma.enableShutdownHooks(bot);

	await bot.api.setMyCommands([
		{ command: 'start', description: 'Перезапустить бота' },
		{ command: 'help', description: 'Справочный центр' },
		{ command: 'profile', description: 'Твой профиль' },
		{ command: 'statistic', description: 'Общая статистика' },
		{ command: 'answers', description: 'Найти ответы' },
	]);

	await prisma.onModuleInit();
	await bot.start();
}
void bootstrap();
