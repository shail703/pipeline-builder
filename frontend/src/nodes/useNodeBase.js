import { useState, useCallback, useMemo } from 'react';

/**
 * Spread handles evenly down one edge of a node and namespace their IDs.
 *
 * Declared at module scope (rather than inside the hook) so it keeps a stable
 * identity across renders. Defining it in the component body would make it a
 * required dependency of the useMemo calls below, which trips
 * react-hooks/exhaustive-deps and fails a CI build.
 *
 * @param {Array} handles - [{ id }]
 * @param {'left'|'right'} position
 * @param {string} id - node id, used to namespace handle ids
 */
const layoutHandles = (handles, position, id) =>
  handles.map((handle, index) => ({
    ...handle,
    handleId: `${id}-${handle.id}`,
    position,
    style: { top: `${((index + 1) / (handles.length + 1)) * 100}%` },
  }));

/**
 * @param {string} id - node id (from ReactFlow)
 * @param {Array} fields - [{ name, defaultValue }]
 * @param {Array} inputs - [{ id }] target handles (left side)
 * @param {Array} outputs - [{ id }] source handles (right side)
 */
export const useNodeBase = ({ id, fields = [], inputs = [], outputs = [] }) => {

  const [fieldValues, setFieldValues] = useState(() =>
    fields.reduce((acc, field) => {
      acc[field.name] = field.defaultValue ?? '';
      return acc;
    }, {})
  );

  const updateField = useCallback((name, value) => {
    setFieldValues((prev) => ({ ...prev, [name]: value }));
  }, []);

  const inputHandles = useMemo(() => layoutHandles(inputs, 'left', id), [inputs, id]);
  const outputHandles = useMemo(() => layoutHandles(outputs, 'right', id), [outputs, id]);

  return { fieldValues, updateField, inputHandles, outputHandles };
};
