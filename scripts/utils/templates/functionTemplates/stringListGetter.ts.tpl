/**
 * Get {{PARAM_NAME}} parameter (string list)
 * Transforms the fixedCollection format to a simple string array expected by Apify
 */
export function {{FUNCTION_NAME}}(this: IExecuteFunctions, i: number): string[] {
	const {{PARAM_NAME}} = this.getNodeParameter('{{PARAM_NAME}}', i, {}) as {
		{{COLLECTION_NAME}}?: { {{FIELD_NAME}}: string }[];
	};
	// Transform from fixedCollection format { {{COLLECTION_NAME}}: [{ {{FIELD_NAME}}: "value" }] } to string array ["value"]
	return {{PARAM_NAME}}.{{COLLECTION_NAME}}?.map(item => item.{{FIELD_NAME}}) || [];
}
