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
			this.logger.info("Answers command has been called");
			void ctxReply(ctx, `🗂 Выбери предмет:`, coursesKeyboard(this.keysNames.courses));
		});

		this.bot.hears(this.keysNames.courses, (ctx) => {
			this.logger.info("Courses command has been called");
			if (!this.answers[ctx.message.text]) {
				this.logger.error("Course was not found");
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
			this.logger.info("Sections command has been called");
			try {
				if (!ctx.session.course) {
					this.logger.error("Course was not provided");
					return void ctxReply(ctx, `🌠 Возвращаюсь в главное меню!`, mainKeyboard);
				} else if (!this.answers[ctx.session.course][ctx.message.text]) {
					this.logger.error("Section was not found");
					return void ctxReply(ctx, `🚫 Раздел не найден!`);
				}
			} catch (e) {
				this.logger.error("Section was not found");
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
			this.logger.info("Lectures command has been called");
			try {
				if (!ctx.session.course || !ctx.session.section) {
					this.logger.error("Course or section was not provided");
					return void ctxReply(ctx, `🌠 Возвращаюсь в главное меню!`, mainKeyboard);
				} else if (!this.answers[ctx.session.course][ctx.session.section][ctx.message.text]) {
					this.logger.error("Lecture was not found");
					return void ctxReply(ctx, `🚫 Лекция не найдена!`);
				}
			} catch (e) {
				this.logger.error("Lecture was not found");
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
			this.logger.info("Tests command has been called");
			try {
				if (!ctx.session.course || !ctx.session.section || !ctx.session.lecture) {
					this.logger.error("Course or section or lecture was not provided");
					return void ctxReply(ctx, `🌠 Возвращаюсь в главное меню!`, mainKeyboard);
				} else if (
					!this.answers[ctx.session.course][ctx.session.section][ctx.session.lecture][ctx.message.text]
				) {
					this.logger.error("Test was not found");
					return void ctxReply(ctx, `🚫 Тест не найден!`);
				}
			} catch (e) {
				this.logger.error("Test was not found");
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
