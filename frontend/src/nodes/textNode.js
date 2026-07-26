import { useState, useRef, useMemo, useLayoutEffect } from 'react';
import { Handle, Position } from 'reactflow';
import { useNodeBase } from './useNodeBase';
import baseStyles from './BaseNode.module.css';
import styles from './textNode.module.css';


const VARIABLE_REGEX = /\{\{\s*([A-Za-z_$][A-Za-z0-9_$]*)\s*\}\}/g;

const MIN_WIDTH = 220; 
const MAX_WIDTH = 480;
const APPROX_CHAR_PX = 7; 
const CHROME_PX = 48; 

const parseVariables = (text) => {
  const names = new Set();
  for (const match of text.matchAll(VARIABLE_REGEX)) {
    names.add(match[1]);
  }
  return [...names];
};

const computeWidth = (text) => {
  const longestLine = text
    .split('\n')
    .reduce((max, line) => Math.max(max, line.length), 0);
  const estimated = longestLine * APPROX_CHAR_PX + CHROME_PX;
  return Math.min(Math.max(estimated, MIN_WIDTH), MAX_WIDTH);
};

export const TextNode = ({ id, data }) => {
  const [text, setText] = useState(data?.text || '{{input}}');
  const textareaRef = useRef(null);

  const variables = useMemo(() => parseVariables(text), [text]);
  const inputs = useMemo(
    () => variables.map((name) => ({ id: name })),
    [variables]
  );

  const { inputHandles, outputHandles } = useNodeBase({
    id,
    inputs,
    outputs: [{ id: 'output' }],
  });

  useLayoutEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, [text]);

  const nodeWidth = useMemo(() => computeWidth(text), [text]);

  return (
    <div
      className={`${baseStyles.node} ${styles.textNode}`}
      style={{ width: nodeWidth }}
    >
      {inputHandles.map((h) => (
        <Handle
          key={h.handleId}
          type="target"
          position={Position.Left}
          id={h.handleId}
          style={h.style}
        />
      ))}

      <div className={baseStyles.header}>
        <span className={baseStyles.title}>Text</span>
      </div>

      <div className={baseStyles.body}>
        <label className={baseStyles.fieldLabel}>
          Text
          <textarea
            ref={textareaRef}
            className={`${baseStyles.fieldInput} ${styles.textarea}`}
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={1}
            spellCheck={false}
          />
        </label>

        {variables.length > 0 && (
          <div className={styles.varHint}>
            {variables.length} variable{variables.length > 1 ? 's' : ''}:{' '}
            {variables.join(', ')}
          </div>
        )}
      </div>

      {outputHandles.map((h) => (
        <Handle
          key={h.handleId}
          type="source"
          position={Position.Right}
          id={h.handleId}
          style={h.style}
        />
      ))}
    </div>
  );
};