/**
 * Get {{PARAM_NAME}} parameter (list)
 * Transforms the fixedCollection format to an array format expected by Apify
 */
export function {{FUNCTION_NAME}}(this: IExecuteFunctions, i: number): {{ARRAY_RETURN_TYPE}} {
	const {{PARAM_NAME}} = this.getNodeParameter('{{PARAM_NAME}}', i, {}) as {
		{{COLLECTION_NAME}}?: {{ENTRY_TYPE}}[];
	};
	// Transform from fixedCollection format { {{COLLECTION_NAME}}: [...] } to array format [...]
	return {{PARAM_NAME}}.{{COLLECTION_NAME}} || [];
}
