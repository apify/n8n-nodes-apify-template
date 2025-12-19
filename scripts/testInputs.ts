import chalk from 'chalk';
import { generateInputFunctions } from './buildInputFunctions.ts';

// Get Actor ID from command line arguments
const actorId = process.argv[2];

if (!actorId) {
	console.log(chalk.red('❌ Actor ID is required'));
	console.log(chalk.cyan('Usage: npm run test-inputs <actor-id>'));
	console.log(chalk.cyan('Example: npm run test-inputs apify/web-scraper'));
	process.exit(1);
}

// Run the generator
generateInputFunctions(actorId).catch((error) => {
	console.error(chalk.red(`❌ Error: ${error.message}`));
	process.exit(1);
});
