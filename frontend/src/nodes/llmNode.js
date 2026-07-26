// llmNode.js

import { BaseNode } from './BaseNode';

export const LLMNode = ({ id }) => (
  <BaseNode
    id={id}
    title="LLM"
    body={<span>This is an LLM.</span>}
    inputs={[{ id: 'system' }, { id: 'prompt' }]}
    outputs={[{ id: 'response' }]}
  />
);
