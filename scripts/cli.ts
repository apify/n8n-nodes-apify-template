import chalk from 'chalk';
import { setupProject } from './setupProject.ts';

setupProject()
	.catch((error) => {
		console.log(chalk.redBright('❌  Error: ') + chalk.red(error.message));
	})
	.finally(() => {
		process.exit(0);
	});