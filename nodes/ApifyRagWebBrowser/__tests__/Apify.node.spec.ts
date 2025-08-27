import { ACTOR_ID, ApifyRagWebBrowser, ClassNameCamel } from '../ApifyRagWebBrowser.node';
import { executeWorkflow } from './utils/executeWorkflow';
import { CredentialsHelper } from './utils/credentialHelper';
import { getRunTaskDataByNodeName, getTaskData } from './utils/getNodeResultData';
import nock from 'nock';
import * as fixtures from './utils/fixtures';

describe('Apify Node', () => {
	let apifyNode: ApifyRagWebBrowser;
	let credentialsHelper: CredentialsHelper;

	beforeEach(() => {
		apifyNode = new ApifyRagWebBrowser();
		credentialsHelper = new CredentialsHelper({
			apifyApi: {
				apiToken: 'test-token',
				baseUrl: 'https://api.apify.com',
			},
		});
	});

	describe('description', () => {
		it('should have a name property', () => {
			expect(apifyNode.description.name).toBeDefined();
			expect(apifyNode.description.name).toEqual(ClassNameCamel);
		});

		it('should have properties defined', () => {
			expect(apifyNode.description.properties).toBeDefined();
		});

		it('should have credential properties defined', () => {
			expect(apifyNode.description.credentials).toBeDefined();
		});
	});

	describe('actors', () => {
		describe('run-actor', () => {
			const mockRunActor = fixtures.runActorResult();
			const mockBuild = fixtures.getBuildResult();
			const mockFinishedRun = fixtures.getSuccessRunResult();
			const mockResultDataset = fixtures.getDatasetItems();

			const tests = [
				{
					name: 'Advanced Workflow',
					workflowJsonName: 'run-actor-advanced.workflow.json',
					nodeName: 'Crawl a Website (Advanced Settings)',
				},
				{
					name: 'Standard Workflow',
					workflowJsonName: 'run-actor-standard.workflow.json',
					nodeName: 'Crawl a Website (Standard Settings)',
				},
			];

			test.each(tests)(
				'$name should run the WCC actor correctly',
				async ({ workflowJsonName, nodeName }) => {
					const scope = nock('https://api.apify.com')
						.get(`/v2/acts/${ACTOR_ID}/builds/default`)
						.reply(200, mockBuild)
						.post(`/v2/acts/${ACTOR_ID}/runs`)
						.query({ waitForFinish: 0 })
						.reply(200, mockRunActor)
						.get('/v2/actor-runs/5rsC83CHinQwPlsSI')
						.reply(200, mockFinishedRun)
						.get('/v2/datasets/63kMAihbWVgBvEAZ2/items')
						.reply(200, mockResultDataset);

					const workflow = require(`./workflows/actors/${workflowJsonName}`);
					const { executionData } = await executeWorkflow({
						credentialsHelper,
						workflow,
					});

					const nodeResults = getRunTaskDataByNodeName(executionData, nodeName);
					expect(nodeResults.length).toBe(1);

					const [nodeResult] = nodeResults;
					expect(nodeResult.executionStatus).toBe('success');

					const data = getTaskData(nodeResult);
					expect(typeof data).toBe('object');

					const first = data?.['0'] as { json: any };
					expect(first.json).toEqual(mockResultDataset[0]);

					console.log(`Pending mocks for ${workflowJsonName}:`, scope.pendingMocks());
					expect(scope.isDone()).toBe(true);
				},
			);
		});
	});
});
