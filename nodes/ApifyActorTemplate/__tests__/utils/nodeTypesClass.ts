import {
	IDataObject,
	INodeType,
	INodeTypeData,
	INodeTypes,
	IVersionedNodeType,
	NodeHelpers,
} from 'n8n-workflow';
import { ApifyActorTemplate, ClassNameCamel, PACKAGE_NAME } from '../../ApifyActorTemplate.node';

export class NodeTypesClass implements INodeTypes {
	nodeTypes: INodeTypeData = {};
	getByName(nodeType: string): INodeType | IVersionedNodeType {
		return this.nodeTypes[nodeType].type;
	}

	getKnownTypes(): IDataObject {
		return this.nodeTypes;
	}

	addNode(nodeTypeName: string, nodeType: INodeType | IVersionedNodeType) {
		const loadedNode = {
			[nodeTypeName]: {
				sourcePath: '',
				type: nodeType,
			},
		};

		this.nodeTypes = {
			...this.nodeTypes,
			...loadedNode,
		};

		Object.assign(this.nodeTypes, loadedNode);
	}

	getByNameAndVersion(nodeType: string, version?: number): INodeType {
		return NodeHelpers.getVersionedNodeType(this.nodeTypes[nodeType].type, version);
	}
}

const nodeTypes = new NodeTypesClass();

nodeTypes.addNode(`${PACKAGE_NAME}.${ClassNameCamel}`, new ApifyActorTemplate());

export { nodeTypes };
