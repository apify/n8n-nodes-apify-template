import { IRun, ITaskData } from 'n8n-workflow';

export const getRunTaskDataByNodeName = (result: IRun, nodeName: string) => {
	return result.data.resultData.runData[nodeName];
};

export const getTaskData = (result: ITaskData) => {
	return result.data?.main[0]?.[0].json;
};
