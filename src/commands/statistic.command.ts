import { Composer } from 'grammy';
import { Bot } from 'grammy';

import PrismaService from '../prisma.service';
import { MyContext } from '../types';
import { Command } from '../types';

export default class implements Command {
	composer: Composer<MyContext> = new Composer<MyContext>();

	constructor(public bot: Bot<MyContext>, public prisma: PrismaService) {
		this.composer.command(['statistic'], (ctx) => this.command(ctx));
		this.composer.hears(/(📊 )?Статистика/, (ctx) => this.command(ctx));
	}

	async command(ctx: MyContext) {
		const sessionCount = await this.prisma.session.count({
			where: {
				checkedModulesCount: {
					gte: 1,
				},
			},
		});
		const userCount = await this.prisma.user.count();

		const answerAggregate = await this.prisma.answer.aggregate({
			_avg: {
				percent: true,
			},
		});

		const sessionAggregate = await this.prisma.session.aggregate({
			_sum: {
				checkedModulesCount: true,
			},
		});

		const courseCount = await this.prisma.course.count();
		const sectionCount = await this.prisma.section.count();
		const moduleCount = await this.prisma.module.count();
		const questionCount = await this.prisma.question.count();
		const answersCount = await this.prisma.answer.count();

		await ctx.reply(
			`😃 Всего пользователей: ${sessionCount} у бота, ${userCount} у скрипта
🕰 Тестов проверенно через этого бота: ${sessionAggregate._sum.checkedModulesCount}
💯 Средний процент верности ответов: ${answerAggregate._avg.percent}
🗂 Всего предметов: ${courseCount}
📚 Всего разделов: ${sectionCount}
📃 Всего тестов: ${moduleCount}
❓ Всего вопросов: ${questionCount}
🙋 Всего ответов: ${answersCount}`,
			{ parse_mode: 'HTML' },
		);
	}
}
