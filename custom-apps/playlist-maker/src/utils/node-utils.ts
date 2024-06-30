import { type Edge, getIncomers, type Node } from 'reactflow';
import { type CustomNodeType } from '../models/nodes/node-types';
import { ResultNodeProcessor } from '../models/nodes/results/result-node-processor';
import {
    type BaseNodeData,
    type NodeProcessor,
} from '../models/nodes/node-processor';
import { LikedSongsSourceProcessor } from '../models/nodes/sources/liked-songs-source-processor';
import { LocalTracksSourceProcessor } from '../models/nodes/sources/local-tracks-source-processor';
import { MergeProcessor } from '../models/nodes/processing/merge-processor';
import { DeduplicateProcessor } from '../models/nodes/processing/deduplicate-processor';
import {
    type GenreFilterData,
    GenreProcessor,
} from '../models/nodes/filter/genre-processor';

export function getDataForNodeType(nodeType: CustomNodeType): BaseNodeData {
    let data: BaseNodeData = { isExecuting: false };

    if (nodeType === 'genre') {
        const newData: GenreFilterData = {
            ...data,
            genres: [],
        };

        data = newData;
    }

    return data;
}

export async function executeWorkflow(
    nodes: Node[],
    edges: Edge[],
): Promise<void> {
    console.log('Executing workflow with nodes:', nodes);

    const results = nodes.filter(
        (node) => (node.type as CustomNodeType) === 'result',
    );

    if (results.length === 0) {
        Spicetify.showNotification('No result node found in workflow', true);
        return;
    }

    if (results.length > 1) {
        Spicetify.showNotification(
            'The workflow should have only one result node',
            true,
        );
        return;
    }

    const result = results[0];

    console.log('Result node:', result);

    // Build the graph starting from the result node
    const nodesToVisit: Node[] = [...getIncomers(result, nodes, edges)];
    const resultProcessor = new ResultNodeProcessor(
        result.id,
        nodesToVisit[0].id,
    );
    const allProcessors: Record<string, NodeProcessor> = {
        [result.id]: resultProcessor,
    };
    const visitedNodes: Set<string> = new Set<string>([result.id]);

    while (nodesToVisit.length > 0) {
        const currentNode = nodesToVisit.pop()!;

        if (visitedNodes.has(currentNode.id)) {
            Spicetify.showNotification('Cycle detected in workflow', true);
            return;
        }

        visitedNodes.add(currentNode.id);

        const incomers = getIncomers(currentNode, nodes, edges);
        allProcessors[currentNode.id] = getProcessorForNode(
            currentNode,
            incomers,
        );

        nodesToVisit.push(...incomers);
    }

    console.log('All processors : ', allProcessors);
    const finalResult = await resultProcessor.getResults(allProcessors);
    console.log('Final result : ', finalResult);
}

function getProcessorForNode(node: Node, incomers: Node[]): NodeProcessor {
    switch (node.type as CustomNodeType) {
        case 'likedSongsSource':
            return new LikedSongsSourceProcessor(node.id, node.data);
        case 'localTracksSource':
            return new LocalTracksSourceProcessor(node.id, node.data);
        case 'merge':
            return new MergeProcessor(
                node.id,
                incomers.map((node) => node.id),
            );
        case 'deduplicate':
            return new DeduplicateProcessor(
                node.id,
                incomers.map((node) => node.id),
            );
        case 'genre':
            return new GenreProcessor(node.id, incomers[0].id, node.data);
        default:
            throw new Error(`Unknown node type: ${node.type}`);
    }
}
