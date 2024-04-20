import React, { useState, useCallback } from 'react';
import ReactFlow, { useEdgesState, addEdge, MiniMap, Controls } from 'reactflow';

import 'reactflow/dist/style.css';
import './App.css'
import './index.css'

const initialNodes = [];
const initialEdges = [];

function LabelPopup({ node, onClose, onSave }) {
  const [label, setLabel] = useState(node.data.label || '');

  const handleSave = () => {
    onSave(node.id, label);
    onClose();
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <div className="label-pop">
      <input
        type="text"
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        placeholder="Enter Node Label"
      />
      <button onClick={handleSave}>Save</button>
      <button onClick={handleClose}>Close</button>
    </div>
  );
}

export default function App() {
  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useEdgesState(initialEdges);
  const [isPopupOpen, setIsPopupOpen] = useState(false)
  const [selectedNodeId, setSelectedNodeId] = useState(null)
  const [hoveredNodeId, setHoveredNodeId] = useState(null)


  const handleCreateNode = () => {
    const newNodeId = (nodes.length + 1).toString();
    const newNode = {
      id: newNodeId,
      position: { x: 0, y: nodes.length * 50 },
      data: { label: newNodeId },
    };

    setNodes(prevNodes => [...prevNodes, newNode]);
  };

  const onConnect = useCallback(
    (params) => { setEdges((eds) => addEdge(params, eds)); },
    [setEdges],
  );

  const onNodeDragStop = (event, node) => {
    const { id, position } = node;
    const updatedNodes = nodes.map((n) => (n.id === id ? { ...n, position } : n));
    setNodes(updatedNodes);
  };

  const handleNodeClick = (event, node) => {
    setSelectedNodeId(node.id);
    setIsPopupOpen(true);
  };

  const handlePopupClose = () => {
    setSelectedNodeId(null);
    setIsPopupOpen(false);
  };

  const handleLabelSave = (nodeId, newLabel) => {
    setNodes((prevNodes) =>
      prevNodes.map((n) => (n.id === nodeId ? { ...n, data: { label: newLabel } } : n))
    );
  };

  const handleNodeMouseEnter = (nodeId) => {
    setHoveredNodeId(nodeId);
  }

  const handleNodeMouseLeave = () => {
    setHoveredNodeId(null);
  };

  const handleDeleteNode = (nodeId) => {
    setNodes(nodes.filter((node) => node.id !== nodeId));
  };

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
      <button onClick={handleCreateNode}>Create Node</button>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onConnect={onConnect}
        onNodeDragStop={onNodeDragStop}
        onLoad={reactFlowInstance => reactFlowInstance.fitView()}
        snapToGrid={true}
        snapGrid={[15, 15]}
        style={{ width: '100%', height: '100%' }}
        onNodeClick={handleNodeClick}
      >
        <Controls />
        <MiniMap />
      </ReactFlow>

      <div>
        {isPopupOpen && selectedNodeId && (

          <LabelPopup
            node={nodes.find((n) => n.id === selectedNodeId)}
            onClose={handlePopupClose}
            onSave={handleLabelSave}
          />

        )}
      </div>

      {nodes.map((node, index) => (
        <div
          key={node.id}
          style={{
            position: 'absolute',
            top: node.position.y - 40,
            left: node.position.x + 50,
            zIndex:  index,

          }}
          onMouseEnter={() => handleNodeMouseEnter(node.id)}
          onMouseLeave={handleNodeMouseLeave}

        >
          {console.log(`hoveredNodeId: ${hoveredNodeId}`)}
          
          <button

            onClick={() => handleDeleteNode(node.id)}
            style={{ color: 'red' }}
          >
            X</button>


        </div>
      ))}

    </div>
  );
}