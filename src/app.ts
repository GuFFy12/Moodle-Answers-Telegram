import dotenv from "dotenv";
import fs from "fs";
import log4js, { Logger } from "log4js";
import { Context, MiddlewareFn, Telegraf } from "telegraf";
import rateLimit from "telegraf-ratelimit";
import sender from "telegraf-sender";
import LocalSession from "telegraf-session-local";

import AnswersCommands from "./commands/answers.commands.js";
import MainCommands from "./commands/main.commands.js";
import { IBotContext, ICourse, IKeysNames, IStatistics } from "./types/app.types.js";
import answersParser from "./utils/answersParser.util.js";
import clearStatistic from "./utils/clearStatistic.js";

dotenv.config();

class App {
	private readonly logger: Logger;

	private readonly bot: Telegraf<IBotContext>;

	public constructor() {
		this.log4jsInit();
		this.logger = log4js.getLogger(this.constructor.name);

		const helpText = fs.readFileSync("./help.txt", "utf-8");

		const answers = JSON.parse(fs.readFileSync("./answers.json").toString()) as ICourse;
		const { answersParsed, statistics, keysNames } = answersParser(answers, parseInt(process.env.MAX_KEY_SIZE));
		this.logger.info(
			Object.keys(statistics)
				.reduce((result: string[], statistic) => {
					result.push(`${statistic}: ${statistics[statistic]}`);
					return result;
				}, [])
				.join(", ")
		);

		this.bot = new Telegraf(process.env.BOT_TOKEN);
		const localSession = new LocalSession();

		void this.modulesInit(localSession);
		void this.commandsInit(answersParsed, statistics, localSession, keysNames, helpText);

		void this.bot.launch().then(() => {
			this.logger.info("Telegram bot started");
			const clearStatisticData = clearStatistic(localSession);
			this.logger.info(
				`LocalDB loaded, users count (active): ${clearStatisticData.activeUsers}, checked tests: ${clearStatisticData.checkedTests}`
			);
		});

		process.once("SIGINT", () => this.bot.stop("SIGINT"));
		process.once("SIGTERM", () => this.bot.stop("SIGTERM"));
	}

	private readonly log4jsInit = () => {
		log4js.configure({
			appenders: {
				out: { type: "stdout" },
				app: {
					type: "file",
					filename: "./logs/app.log",
					maxLogSize: parseInt(process.env.MAX_LOG_SIZE),
					backups: parseInt(process.env.MAX_LOG_BACKUPS),
					compress: true,
				},
			},
			categories: {
				default: { appenders: ["out"], level: "all" },
				App: { appenders: ["app"], level: "all" },
				MainCommands: { appenders: ["app"], level: "all" },
				AnswersCommands: { appenders: ["app"], level: "all" },
				Reply: { appenders: ["app"], level: "all" },
			},
			pm2: true,
		});
	};

	private readonly commandsInit = (
		answers: ICourse,
		statistics: IStatistics,
		localSession: LocalSession<unknown>,
		keysNames: IKeysNames,
		helpText: string
	) => {
		this.logger.info("Initialize commands...");
		void new MainCommands(this.bot, process.env.OWNER_ID, localSession, statistics, helpText);
		void new AnswersCommands(this.bot, answers, keysNames);
	};

	private readonly modulesInit = (localSession: LocalSession<unknown>) => {
		this.logger.info("Initialize modules...");
		this.bot.use(localSession.middleware());
		this.bot.use(sender as MiddlewareFn<Context>);
		this.bot.use(
			rateLimit({
				window: process.env.MESSAGE_WINDOW,
				limit: process.env.MESSAGE_LIMIT,
			}) as MiddlewareFn<Context>
		);
	};
}

new App();
