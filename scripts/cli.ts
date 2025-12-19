import chalk from 'chalk';
import { setupProject } from './init-actor-app/setupProject.ts';
import { addActorResource } from './add-actor-resource/index.ts';
import { addActorOperation } from './add-actor-operation/index.ts';

// Get the command from command line arguments
const command = process.argv[2];

async function main() {
	switch (command) {
		case 'init':
			await setupProject();
			break;
		case 'add-resource':
			await addActorResource();
			break;
		case 'add-operation':
			await addActorOperation();
			break;
		default:
			console.log(chalk.red('❌  Unknown command: ' + command));
			console.log(chalk.cyan('\nAvailable commands:'));
			console.log(chalk.cyan('  npm run init-actor-app       - Initialize a new Actor app'));
			console.log(chalk.cyan('  npm run add-actor-resource   - Add a new resource to existing Actor'));
			console.log(chalk.cyan('  npm run add-actor-operation  - Add a new operation to existing resource'));
			process.exit(1);
	}
}

main()
	.catch((error) => {
		console.log(chalk.redBright('❌  Error: ') + chalk.red(error.message));
		process.exit(1);
	})
	.finally(() => {
		process.exit(0);
	});