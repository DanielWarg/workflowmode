import * as Y from 'yjs';
import { WorkflowSpec, Node, Edge, Lane } from './schema';

export function syncYjsToSpec(doc: Y.Doc): WorkflowSpec | null {
    const nodesMap = doc.getMap<Node>('nodes');
    const edgesMap = doc.getMap<Edge>('edges');
    const lanesArray = doc.getArray<Lane>('lanes');
    const metadataMap = doc.getMap<unknown>('metadata');

    // Om dokumentet är tomt, returnera null
    if (nodesMap.size === 0 && lanesArray.length === 0) {
        return null;
    }

    return {
        nodes: Array.from(nodesMap.values()),
        edges: Array.from(edgesMap.values()),
        lanes: lanesArray.toArray(),
        metadata: metadataMap.toJSON() as WorkflowSpec['metadata'],
    };
}

export function syncSpecToYjs(doc: Y.Doc, spec: WorkflowSpec) {
    doc.transact(() => {
        const nodesMap = doc.getMap<Node>('nodes');
        const edgesMap = doc.getMap<Edge>('edges');
        const lanesArray = doc.getArray<Lane>('lanes');
        const metadataMap = doc.getMap('metadata');

        // Rensa nuvarande state
        nodesMap.clear();
        edgesMap.clear();
        lanesArray.delete(0, lanesArray.length);
        metadataMap.clear();

        // Sätt nytt state
        spec.nodes.forEach(node => nodesMap.set(node.id, node));
        spec.edges.forEach(edge => edgesMap.set(edge.id, edge));
        lanesArray.push(spec.lanes);

        if (spec.metadata) {
            Object.entries(spec.metadata).forEach(([key, value]) => {
                metadataMap.set(key, value);
            });
        }
    });
}
