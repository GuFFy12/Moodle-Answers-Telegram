import { Bot, Composer, Keyboard } from 'grammy';

import PrismaService from '../prisma.service';
import { Command, MyContext } from '../types';

export default class implements Command {
	composer: Composer<MyContext> = new Composer<MyContext>();

	constructor(public bot: Bot<MyContext>, public prisma: PrismaService) {
		this.composer.command(['start', 'help'], (ctx) => this.command(ctx));
		this.composer.hears(/(❓ )?Помощь/, (ctx) => this.command(ctx));
	}

	async command(ctx: MyContext) {
		await ctx.reply(
			`ℹ️ <b>Общая информация:</b>
1. При использовании скрипта вы видите ответы других людей и отправляете свои решения на внутренний сервер проекта.
2. Этот бот предназначен для отображения ответов, собранных с помощью скрипта. \
Он создан для людей, которые не могут установить скрипт по какой либо причине.
3. Есть также ответы, собранные за предыдущий учебный год. Однако, эти ответы отсутствуют в данном боте из-за различий в версиях хранений данных. \
Если вы заинтересованы, я могу попробовать объединить их с этой версией скрипта и бота.

🔗 <b>Ссылки:</b>
<a href="https://youtu.be/iSvP56AJ4dk">Скрипт с ответами СДО УГАТУ</a>
<a href="https://t.me/+AzlTc2COncJmYzAy">Новости бота</a>
<a href="https://t.me/guffy_owo">Администратор бота</a>
<a href="https://qiwi.com/n/AYYNITRROSELLER">Пожертвования</a>

🙏 <b>Благодарности:</b>
UGATU — создание СДО
GuFFy_OwO — создание скрипта
Cattyn — помощь в вопросах парсинга для первой версии бота (<a href="https://cattyn.dev">Клик</a>)

<i>НЕ СПИСЫВАЙТЕ, БУДЬТЕ УМНЕЕ!
ШТУРМУЙ! ДЕРЗАЙ! ТВОРИ!</i>`,
			{
				parse_mode: 'HTML',
				disable_web_page_preview: true,
				reply_markup: new Keyboard([['🙋 Ответы'], ['👤 Профиль', '📊 Статистика', '❓ Помощь']])
					.resized()
					.persistent(),
			},
		);
	}
}
