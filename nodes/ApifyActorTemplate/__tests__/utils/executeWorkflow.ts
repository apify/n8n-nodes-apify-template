import {
	createDeferredPromise,
	ICredentialsHelper,
	IExecuteWorkflowInfo,
	IRun,
	IWorkflowBase,
	IWorkflowExecuteAdditionalData,
	LoggerProxy,
	Workflow,
} from 'n8n-workflow';
import { WorkflowExecute, ExecutionLifecycleHooks } from 'n8n-core';
import { nodeTypes } from './nodeTypesClass';

export type ExecuteWorkflowArgs = {
	workflow: any;
	credentialsHelper: ICredentialsHelper;
};

export const executeWorkflow = async ({ credentialsHelper, ...args }: ExecuteWorkflowArgs) => {
	LoggerProxy.init({
		debug() {},
		error() {},
		info() {},
		warn() {},
	});

	const workflow = new Workflow({
		id: 'test',
		active: true,
		connections: args.workflow.connections,
		nodes: args.workflow.nodes,
		nodeTypes,
	});

	const waitPromise = createDeferredPromise<IRun>();

	const workflowData: IWorkflowBase = {
		id: 'test',
		name: 'test',
		createdAt: new Date(),
		updatedAt: new Date(),
		active: true,
		nodes: args.workflow.nodes,
		connections: args.workflow.connections,
	};

	const additionalData: IWorkflowExecuteAdditionalData = {
		credentialsHelper,
		hooks: new ExecutionLifecycleHooks('trigger', '1', workflowData),
		executeWorkflow: async (workflowInfo: IExecuteWorkflowInfo): Promise<any> => {},
		restApiUrl: 'http://localhost:5678',
		webhookBaseUrl: 'http://localhost:5678',
		webhookWaitingBaseUrl: 'http://localhost:5678',
		webhookTestBaseUrl: 'http://localhost:5678',
		userId: 'userId',
		instanceBaseUrl: 'http://localhost:5678',
		formWaitingBaseUrl: 'http://localhost:5678',
		variables: {},
		secretsHelpers: {} as any,
		logAiEvent: async () => {},
		startRunnerTask: (async () => {}) as any,
	};

	const workflowExecute = new WorkflowExecute(additionalData, 'cli');

	const executionData = await workflowExecute.run(workflow);

	return {
		workflow,
		waitPromise,
		executionData,
		additionalData,
	};
};
