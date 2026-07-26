// apiNode.js

import { BaseNode } from './BaseNode';

export const APINode = ({ id, data }) => (
  <BaseNode
    id={id}
    title="API Call"
    fields={[
      {
        name: 'url',
        label: 'URL',
        type: 'text',
        defaultValue: data?.url || 'https://api.example.com',
      },
      {
        name: 'method',
        label: 'Method',
        type: 'select',
        options: ['GET', 'POST', 'PUT', 'DELETE'],
        defaultValue: data?.method || 'GET',
      },
    ]}
    inputs={[{ id: 'payload' }]}
    outputs={[{ id: 'response' }]}
  />
);
