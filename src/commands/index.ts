import { Bot } from 'grammy';

import PrismaService from '../prisma.service';
import { MyContext } from '../types';
import AnswersCommand from './answers.command';
import ProfileCommand from './profile.command';
import SenderCommand from './sender.command';
import StartCommand from './start.command';
import StatisticCommand from './statistic.command';

const commands = [AnswersCommand, ProfileCommand, SenderCommand, StartCommand, StatisticCommand];

export default function (bot: Bot<MyContext>, prisma: PrismaService) {
	return commands.map((CommandClass) => new CommandClass(bot, prisma).composer);
}
