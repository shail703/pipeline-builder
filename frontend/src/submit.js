import { useStore } from './store';
import styles from './submit.module.css';

// Set REACT_APP_API_URL in the hosting provider's environment variables
// (e.g. https://pipeline-builder.onrender.com — no trailing slash).
// Create React App inlines this at BUILD time, not runtime, so changing it
// requires a redeploy. The fallback keeps local development working.
const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8000';
const PARSE_URL = `${API_BASE}/pipelines/parse`;

const isLocal = API_BASE.includes('localhost') || API_BASE.includes('127.0.0.1');

export const SubmitButton = () => {

    const handleSubmit = async () => {
        const { nodes, edges } = useStore.getState();

        const payload = {
            nodes: nodes.map((node) => ({ id: node.id, type: node.type })),
            edges: edges.map((edge) => ({
                source: edge.source,
                target: edge.target,
            })),
        };  

        try {
            const response = await fetch(PARSE_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                throw new Error(`Server responded with ${response.status}`);
            }

            const { num_nodes, num_edges, is_dag } = await response.json();

            alert(
                'Pipeline submitted!\n\n' +
                `Nodes: ${num_nodes}\n` +
                `Edges: ${num_edges}\n` +
                `Valid DAG: ${is_dag ? 'Yes' : 'No'}\n\n` +
                (is_dag
                    ? 'No cycles detected — this is a valid pipeline.'
                    : 'A cycle was detected — this pipeline is not a DAG.')
            );
        } catch (error) {
            alert(
                'Could not reach the backend.\n\n' +
                `${error.message}\n\n` +
                (isLocal
                    ? 'Make sure the server is running:\n' +
                      'cd backend && uvicorn main:app --reload'
                    : 'The API may still be waking up — free hosting tiers sleep\n' +
                      'when idle and can take up to a minute to start.\n' +
                      'Wait a moment and try again.')
            );
        }
    };

    return (
        <div className={styles.submitBar}>
            <button
                type="button"
                className={styles.submitButton}
                onClick={handleSubmit}
            >
              Submit
            </button>
        </div>
    );
}
