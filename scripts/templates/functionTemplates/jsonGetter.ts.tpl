/**
 * Get {{PARAM_NAME}} parameter
 * Parses JSON string if needed
 */
export function {{FUNCTION_NAME}}(this: IExecuteFunctions, i: number): object {
	const {{PARAM_NAME}} = this.getNodeParameter('{{PARAM_NAME}}', i) as object | string;
	// If it's a string (JSON), parse it to an object
	if (typeof {{PARAM_NAME}} === 'string') {
		try {
			return JSON.parse({{PARAM_NAME}});
		} catch (error) {
			throw new Error(`Invalid JSON in {{PARAM_NAME}}: ${error instanceof Error ? error.message : 'Unknown error'}`);
		}
	}
	return {{PARAM_NAME}};
}
