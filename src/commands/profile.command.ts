import { Composer } from 'grammy';

import { Command, MyContext } from '../types';

export default class implements Command {
	composer: Composer<MyContext> = new Composer<MyContext>();

	constructor() {
		this.composer.command(['profile'], (ctx) => this.command(ctx));
		this.composer.hears(/(👤 )?Профиль/, (ctx) => this.command(ctx));
	}

	async command(ctx: MyContext) {
		await ctx.reply(
			`🆔 Ваш ID: ${ctx.from?.id ?? 'unknown'}
📃 Проверенно тестов: ${ctx.session.checkedModulesCount}`,
			{ parse_mode: 'HTML' },
		);
	}
}
