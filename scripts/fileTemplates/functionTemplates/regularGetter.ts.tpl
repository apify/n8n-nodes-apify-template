/**
 * Get {{PARAM_NAME}} parameter
 */
export function {{FUNCTION_NAME}}(this: IExecuteFunctions, i: number): {{TS_TYPE}} {
	const {{PARAM_NAME}} = this.getNodeParameter('{{PARAM_NAME}}', i) as {{TS_TYPE}};
	return {{PARAM_NAME}};
}
