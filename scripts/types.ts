// NOTE: This was generated from the Apify Input Schema by LLM
// https://github.com/apify/apify-shared-js/blob/master/packages/input_schema/src/schema.json
export type ApifyInputField = any;

export interface ApifyInputSchema {
	$schema?: string;
	title: string;
	schemaVersion: number;
	description?: string;
	type: string;
	required?: string[];
	additionalProperties?: boolean;
	properties: Record<string, ApifyInputField>;
}