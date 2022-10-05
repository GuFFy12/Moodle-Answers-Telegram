import {
	coursesKeyboard,
	createLecturesKeyboard,
	createSectionsKeyboard,
	createTestsKeyboard,
	mainKeyboard,
} from "../utils/keyboards.util.js";
import { Telegraf } from "telegraf";
import log4js, { Logger } from "log4js";
import { IBotContext, ICourse, IKeysNames } from "../types/app.types.js";
import answersToText from "../utils/answersToText.util.js";
import ctxReply from "../utils/ctxReply.util.js";

export default class AnswersCommands {
	private readonly logger: Logger;

	private readonly bot: Telegraf<IBotContext>;

	private readonly answers: ICourse;
	private readonly keysNames: IKeysNames;

	public constructor(bot: Telegraf<IBotContext>, answers: ICourse, keysNames: IKeysNames) {
		this.logger = log4js.getLogger(this.constructor.name);

		this.bot = bot;

		this.answers = answers;
		this.keysNames = keysNames;

		void this.commandsInit();
	}

	private readonly commandsInit = () => {
		this.bot.hears(/✅ Ответы|Ответы|ответы/, (ctx) => {
			void ctxReply(ctx, `🗂 Выбери предмет:`, coursesKeyboard(this.keysNames.courses));
		});

		this.bot.hears(this.keysNames.courses, (ctx) => {
			if (!this.answers[ctx.message.text]) {
				return void ctxReply(ctx, `🚫 Предмет не найден!`);
			}

			if (Object.keys(this.answers[ctx.message.text]).length === 1) {
				ctx.session.section = Object.keys(this.answers[ctx.message.text])[0];
				void ctxReply(
					ctx,
					`📒 Выбери лекцию:`,
					createLecturesKeyboard(this.answers, ctx.message.text, ctx.session.section)
				);
			} else {
				void ctxReply(ctx, `📚 Выбери раздел:`, createSectionsKeyboard(this.answers, ctx.message.text));
			}

			ctx.session.course = ctx.message.text;
		});

		this.bot.hears(this.keysNames.sections, (ctx) => {
			try {
				if (!ctx.session.course) {
					return void ctxReply(ctx, `🌠 Возвращаюсь в главное меню!`, mainKeyboard);
				} else if (!this.answers[ctx.session.course][ctx.message.text]) {
					return void ctxReply(ctx, `🚫 Раздел не найден!`);
				}
			} catch (e) {
				return void ctxReply(ctx, `🚫 Раздел не найден!`);
			}

			void ctxReply(
				ctx,
				`📒 Выбери лекцию:`,
				createLecturesKeyboard(this.answers, ctx.session.course, ctx.message.text)
			);

			ctx.session.section = ctx.message.text;
		});

		this.bot.hears(this.keysNames.lectures, (ctx) => {
			try {
				if (!ctx.session.course || !ctx.session.section) {
					return void ctxReply(ctx, `🌠 Возвращаюсь в главное меню!`, mainKeyboard);
				} else if (!this.answers[ctx.session.course][ctx.session.section][ctx.message.text]) {
					return void ctxReply(ctx, `🚫 Лекция не найдена!`);
				}
			} catch (e) {
				return void ctxReply(ctx, `🚫 Лекция не найдена!`);
			}

			void ctxReply(
				ctx,
				`📃 Выбери номер теста:`,
				createTestsKeyboard(this.answers, ctx.session.course, ctx.session.section, ctx.message.text)
			);

			ctx.session.lecture = ctx.message.text;
		});

		this.bot.hears(this.keysNames.tests, (ctx) => {
			try {
				if (!ctx.session.course || !ctx.session.section || !ctx.session.lecture) {
					return void ctxReply(ctx, `🌠 Возвращаюсь в главное меню!`, mainKeyboard);
				} else if (
					!this.answers[ctx.session.course][ctx.session.section][ctx.session.lecture][ctx.message.text]
				) {
					return void ctxReply(ctx, `🚫 Тест не найден!`);
				}
			} catch (e) {
				return void ctxReply(ctx, `🚫 Тест не найден!`);
			}

			void ctxReply(
				ctx,
				answersToText(
					this.answers[ctx.session.course][ctx.session.section][ctx.session.lecture][ctx.message.text]
				)
			);

			if (typeof ctx.session.checkedTests !== "number") {
				ctx.session.checkedTests = 0;
			}

			ctx.session.checkedTests += 1;
		});
	};
}
