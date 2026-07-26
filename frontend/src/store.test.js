import { useStore } from './store';

beforeEach(() => {
  useStore.setState({ nodes: [], edges: [], nodeIDs: {} });
});

describe('getNodeID', () => {
  test('numbers ids per type starting at 1', () => {
    const { getNodeID } = useStore.getState();
    expect(getNodeID('text')).toBe('text-1');
    expect(getNodeID('text')).toBe('text-2');
  });

  test('keeps an independent counter for each type', () => {
    const { getNodeID } = useStore.getState();
    expect(getNodeID('llm')).toBe('llm-1');
    expect(getNodeID('text')).toBe('text-1');
    expect(getNodeID('llm')).toBe('llm-2');
  });

  test('works when nodeIDs has never been initialised', () => {
    useStore.setState({ nodeIDs: undefined });
    expect(useStore.getState().getNodeID('math')).toBe('math-1');
  });
});

describe('addNode', () => {
  test('appends a node without dropping existing ones', () => {
    const { addNode } = useStore.getState();
    addNode({ id: 'a', type: 'text' });
    addNode({ id: 'b', type: 'llm' });

    const { nodes } = useStore.getState();
    expect(nodes).toHaveLength(2);
    expect(nodes.map((n) => n.id)).toEqual(['a', 'b']);
  });
});

describe('onNodesChange', () => {
  test('applies a remove change', () => {
    useStore.setState({
      nodes: [
        { id: 'a', position: { x: 0, y: 0 }, data: {} },
        { id: 'b', position: { x: 0, y: 0 }, data: {} },
      ],
    });

    useStore.getState().onNodesChange([{ type: 'remove', id: 'a' }]);

    const { nodes } = useStore.getState();
    expect(nodes).toHaveLength(1);
    expect(nodes[0].id).toBe('b');
  });
});

describe('onEdgesChange', () => {
  test('applies a remove change', () => {
    useStore.setState({
      edges: [
        { id: 'e1', source: 'a', target: 'b' },
        { id: 'e2', source: 'b', target: 'c' },
      ],
    });

    useStore.getState().onEdgesChange([{ type: 'remove', id: 'e1' }]);

    const { edges } = useStore.getState();
    expect(edges).toHaveLength(1);
    expect(edges[0].id).toBe('e2');
  });
});

describe('onConnect', () => {
  test('adds an animated smoothstep edge for a new connection', () => {
    useStore.getState().onConnect({
      source: 'a',
      sourceHandle: 'a-out',
      target: 'b',
      targetHandle: 'b-in',
    });

    const { edges } = useStore.getState();
    expect(edges).toHaveLength(1);
    expect(edges[0]).toMatchObject({
      source: 'a',
      target: 'b',
      type: 'smoothstep',
      animated: true,
    });
    expect(edges[0].markerEnd).toBeDefined();
  });
});

describe('updateNodeField', () => {
  test('updates a single field on the matching node only', () => {
    useStore.setState({
      nodes: [
        { id: 'a', data: { name: 'one' } },
        { id: 'b', data: { name: 'two' } },
      ],
    });

    useStore.getState().updateNodeField('a', 'name', 'changed');

    const { nodes } = useStore.getState();
    expect(nodes.find((n) => n.id === 'a').data.name).toBe('changed');
    expect(nodes.find((n) => n.id === 'b').data.name).toBe('two');
  });
});
