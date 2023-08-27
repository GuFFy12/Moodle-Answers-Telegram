import { createConversation } from '@grammyjs/conversations';
import { Bot, CallbackQueryContext, Composer, InlineKeyboard } from 'grammy';

import PrismaService from '../prisma.service';
import { Command, MyContext, MyConversation } from '../types';
let externalVars: { prisma: PrismaService; bot: Bot<MyContext> } | null = null;

export default class AnswersCommand implements Command {
	composer = new Composer<MyContext>();

	constructor(public bot: Bot<MyContext>, public prisma: PrismaService) {
		externalVars = { prisma, bot };

		this.composer.use(createConversation(AnswersCommand.conversation, 'answers'));
		this.composer.command(['answers'], (ctx) => ctx.conversation.enter('answers'));
		this.composer.hears(/^(🙋 )?Ответы$/i, (ctx) => ctx.conversation.enter('answers'));
	}

	static async pathConversation(
		conversation: MyConversation,
		reply: MyContext['reply'] | CallbackQueryContext<MyContext>['editMessageText'],
		messageId: number,
		pathIndex: number,
		paths: { id: number; name: string }[],
	) {
		let messageHeader = '';
		let messageNotFound = '';
		let message = '';

		const elements = await conversation.external(async () => {
			if (!externalVars) return;

			switch (pathIndex) {
				case 0:
					messageNotFound = '😰 Ни одного предмета не было найдено!';
					message = '🗂 Выберите предмет:';

					return externalVars.prisma.course.findMany();
				case 1:
					messageHeader += `🗂 Предмет: ${paths[0].name}\n`;
					messageNotFound = '😰 Ни одного раздела не было найдено!';
					message = '📚 Выберите раздел:';

					return externalVars.prisma.section.findMany({ where: { courseId: paths[0].id } });
				case 2:
					messageHeader += `🗂 Предмет: ${paths[0].name}\n📚 Раздел: ${paths[1].name}\n`;
					messageNotFound = '😰 Ни одного теста не было найдено!';
					message = '📃 Выберите тест:';

					return externalVars.prisma.module.findMany({ where: { sectionId: paths[1].id } });
				case 3:
					messageHeader += `🗂 Предмет: ${paths[0].name}\n📚 Раздел: ${paths[1].name}\n📃 Тест:  ${paths[2].name}\n`;
					messageNotFound = '😰 Ни одного ответа не было найдено!';

					const questions = await externalVars.prisma.question.findMany({ where: { moduleId: paths[2].id } });

					for (const question of questions) {
						message += question.question + '\n';

						const answersGroupedByQuestion = await externalVars.prisma.answer.groupBy({
							by: ['answers'],
							where: { questionId: question.id },
							orderBy: [{ _count: { answers: 'desc' } }, { _avg: { percent: 'desc' } }],
							_avg: { percent: true },
							_count: { answers: true },
							_max: { createdAt: true },
							take: 3,
						});

						answersGroupedByQuestion.forEach((answer, index) => {
							message += index + ') \n';
							message += answer.answers.join('\n');
							message += '\n';
						});
					}

					return [paths[2]];
			}
		});

		const keyboardButtons =
			(pathIndex !== 3
				? elements?.map((item, index) => [{ text: item.name, callback_data: `${messageId}_${index}` }])
				: []) ?? [];
		if (pathIndex !== 0) keyboardButtons.push([{ text: '◀️ Назад', callback_data: `${messageId}_return` }]);

		if (!elements?.length) {
			await reply(`${messageHeader}\n${messageNotFound}`, {
				reply_markup: new InlineKeyboard(keyboardButtons),
			});
		} else {
			await reply(`${messageHeader}\n${message}`, {
				reply_markup: new InlineKeyboard(keyboardButtons),
			});
		}

		const callbackQueryContext = await conversation.waitForCallbackQuery(
			keyboardButtons.flatMap((keyboardColumn) =>
				keyboardColumn.map((keyboardButton) => keyboardButton.callback_data),
			),
		);

		if (callbackQueryContext.match === `${messageId}_return`) {
			pathIndex -= 2;
		} else if (elements?.length) {
			const elementIndex = parseInt(callbackQueryContext.match.toString().split('_')[1]);

			paths[pathIndex] = {
				name: elements[elementIndex].name,
				id: elements[elementIndex].id,
			};
		}

		return {
			callbackQueryContext,
			paths,
			pathIndex,
		};
	}

	static async conversation(conversation: MyConversation, ctx: MyContext) {
		let paths: { id: number; name: string }[] = [];
		let callbackQueryContext: CallbackQueryContext<MyContext> | undefined;

		for (let pathIndex = 0; pathIndex < 4; pathIndex++) {
			const conversationData = await AnswersCommand.pathConversation(
				conversation,
				callbackQueryContext
					? callbackQueryContext.editMessageText.bind(callbackQueryContext)
					: ctx.reply.bind(ctx),
				ctx.update.message?.message_id ?? 0,
				pathIndex,
				paths,
			);

			callbackQueryContext = conversationData.callbackQueryContext;
			pathIndex = conversationData.pathIndex;
			paths = conversationData.paths;
		}
	}
}
