import { Handle, Position } from 'reactflow';
import { useNodeBase } from './useNodeBase';
import styles from './BaseNode.module.css';

const positionMap = {
  left: Position.Left,
  right: Position.Right,
};

const renderField = (field, value, onChange) => {
  const commonProps = {
    className: styles.fieldInput,
    value,
    onChange: (e) => onChange(field.name, e.target.value),
  };

  switch (field.type) {
    case 'select':
      return (
        <select {...commonProps}>
          {field.options.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      );
    case 'textarea':
      return <textarea {...commonProps} rows={field.rows || 2} />;
    case 'text':
    default:
      return <input type="text" {...commonProps} />;
  }
};

export const BaseNode = ({
  id,
  title,
  fields = [],
  inputs = [],
  outputs = [],
  body = null,
  className = '',
  style = {},
}) => {
  const { fieldValues, updateField, inputHandles, outputHandles } = useNodeBase({
    id, fields, inputs, outputs,
  });

  return (
    <div className={`${styles.node} ${className}`} style={style}>
      {inputHandles.map((h) => (
        <Handle
          key={h.handleId}
          type="target"
          position={positionMap[h.position]}
          id={h.handleId}
          style={h.style}
        />
      ))}

      <div className={styles.header}>
        <span className={styles.title}>{title}</span>
      </div>

      {(fields.length > 0 || body) && (
        <div className={styles.body}>
          {fields.map((field) => (
            <label key={field.name} className={styles.fieldLabel}>
              {field.label}
              {renderField(field, fieldValues[field.name], updateField)}
            </label>
          ))}
          {body}
        </div>
      )}

      {outputHandles.map((h) => (
        <Handle
          key={h.handleId}
          type="source"
          position={positionMap[h.position]}
          id={h.handleId}
          style={h.style}
        />
      ))}
    </div>
  );
};
