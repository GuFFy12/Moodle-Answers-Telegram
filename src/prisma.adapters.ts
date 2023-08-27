import { StorageAdapter } from 'grammy';

import PrismaService from './prisma.service';

export class CheckedQuestionCount implements StorageAdapter<number> {
	constructor(private sessionDelegate: PrismaService['session']) {}

	async read(key: string) {
		const session = await this.sessionDelegate.findUnique({ where: { telegramId: key } });
		return session?.checkedModulesCount ? session.checkedModulesCount : undefined;
	}

	async write(key: string, value: number) {
		await this.sessionDelegate.upsert({
			where: { telegramId: key },
			create: { telegramId: key, checkedModulesCount: value },
			update: { checkedModulesCount: value },
		});
	}

	async delete(key: string) {
		await this.sessionDelegate.delete({ where: { telegramId: key } });
	}
}
