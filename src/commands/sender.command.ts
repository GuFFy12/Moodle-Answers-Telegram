import { createConversation } from '@grammyjs/conversations';
import { Bot, Composer, InlineKeyboard } from 'grammy';

import PrismaService from '../prisma.service';
import { Command, MyContext, MyConversation } from '../types';
let externalVars: { prisma: PrismaService; bot: Bot<MyContext> } | null = null;

export default class SenderCommand implements Command {
	composer: Composer<MyContext> = new Composer<MyContext>();

	constructor(public bot: Bot<MyContext>, public prisma: PrismaService) {
		externalVars = { prisma, bot };

		this.composer.use(createConversation(SenderCommand.conversation, 'sender'));
		this.composer.command(['sender'], (ctx) => ctx.conversation.enter('sender'));
	}

	static async conversation(conversation: MyConversation, ctx: MyContext) {
		if (!ctx.config.isDeveloper) return;

		await ctx.reply('📩 Введите текст для рассылки!');
		const textMessage = await conversation.waitFor('message:text');

		await ctx.reply('📨 Вы уверрены что вы хотите использовать это сообщение?', {
			reply_markup: new InlineKeyboard([
				[{ text: '✅ Начать рассылку', callback_data: `${textMessage.message.message_id}_yes` }],
				[{ text: '🚫 Отмена', callback_data: `${textMessage.message.message_id}_no` }],
			]),
		});

		const response = await conversation.waitForCallbackQuery(
			[`${textMessage.message.message_id}_yes`, `${textMessage.message.message_id}_no`],
			{
				drop: true,
			},
		);

		if (response.match === `${textMessage.message.message_id}_yes`) {
			await conversation.external(async () => {
				if (!externalVars) return;

				let userIds: { telegramId: string }[] | null = null;
				let skip = 0;

				while (userIds === null || userIds.length) {
					userIds = await externalVars.prisma.session.findMany({
						where: {},
						select: { telegramId: true },
						take: 1000,
						skip,
					});

					skip += 1000;

					for (const userId of userIds) {
						await externalVars.bot.api.sendMessage(userId.telegramId, textMessage.message.text);
					}
				}
			});
			await response.editMessageText('✅ Все сообщения отправленны!');
		} else {
			await response.editMessageText('🚫 Отмена!');
		}
	}
}
