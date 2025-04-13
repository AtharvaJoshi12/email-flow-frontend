"use client";
import React, { useCallback, useState } from "react";
import ReactFlow, {
  addEdge,
  useNodesState,
  useEdgesState,
  Background,
  Controls,
} from "react-flow-renderer";
import { v4 as uuidv4 } from "uuid";

const FlowBuilder = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [selectedNode, setSelectedNode] = useState(null);
  const [nodeFormData, setNodeFormData] = useState({});
  const [showScheduleModal, setShowScheduleModal] = useState(false); // Schedule modal state
  const [scheduleDateTime, setScheduleDateTime] = useState(""); // Store selected date and time

  const handleAddNodeClick = () => setShowTypeModal(true);

  const handleCreateNode = (type) => {
    const newNodeId = uuidv4();

    // Calculate the vertical position for the new node
    const position = {
      x: window.innerWidth / 2 - 100, // Center the node horizontally (adjust 100 for node width)
      y: nodes.length * 100, // Stack nodes vertically
    };

    const labelMap = {
      coldEmail: "📧 Cold Email",
      waitDelay: "⏳ Wait/Delay",
      leadSource: "📍 Lead Source",
    };

    const newNode = {
      id: newNodeId,
      type: "default",
      position,
      data: { label: labelMap[type] || type, nodeType: type, config: {} },
    };

    setNodes((prev) => [...prev, newNode]);

    if (nodes.length > 0) {
      const lastNode = nodes[nodes.length - 1];
      const newEdge = {
        id: uuidv4(),
        source: lastNode.id,
        target: newNodeId,
        type: "smoothstep",
      };
      setEdges((prev) => [...prev, newEdge]);
    }

    setSelectedNode(newNode);
    setNodeFormData({});
    setShowTypeModal(false);
    setShowSettingsModal(true);
  };

  const handleSave = async () => {
    const flowData = {
      nodes: nodes.map((n) => ({
        id: n.id,
        type: n.data.nodeType,
        label: n.data.label,
        position: n.position,
        config: n.data.config || {},
      })),
      edges,
    };

    console.log("Schedule Date ", scheduleDateTime);
    console.log(JSON.stringify(flowData, null, 2));

    // Find the coldEmail node
    const coldEmailNode = flowData.nodes.find(
      (node) => node.type === "coldEmail"
    );

    if (!coldEmailNode) {
      console.warn("❌ No coldEmail node found.");
      return;
    }

    const { to, subject, body } = coldEmailNode.config;

    if (!to || !subject || !body || !scheduleDateTime) {
      console.warn(
        "❌ Missing required fields in coldEmail node or scheduleDateTime."
      );
      return;
    }

    const emailPayload = {
      to,
      subject,
      body,
      time: scheduleDateTime, // Must be in valid date format
    };

    try {
      const response = await fetch(
        "https://email-flow-backend.onrender.com/schedule-email",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(emailPayload),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Unknown error occurred");
      }

      console.log("✅ Email scheduled:", result);
    } catch (error) {
      console.error("❌ Failed to schedule email:", error.message);
    }
  };

  const handleNodeClick = (event, node) => {
    setSelectedNode(node);
    setNodeFormData(node.data?.config || {});
    setShowSettingsModal(true);
  };

  const handleSaveSettings = () => {
    if (!selectedNode) return;

    setNodes((prev) =>
      prev.map((node) =>
        node.id === selectedNode.id
          ? {
              ...node,
              data: {
                ...node.data,
                config: nodeFormData,
                label:
                  node.data.nodeType === "leadSource"
                    ? `📍 Lead: ${nodeFormData.leadList || "N/A"}`
                    : node.data.nodeType === "coldEmail"
                    ? `📧 ${nodeFormData.subject || "No Subject"}`
                    : `⏳ Wait: ${nodeFormData.time || 0} mins`,
              },
            }
          : node
      )
    );

    setSelectedNode(null);
    setNodeFormData({});
    setShowSettingsModal(false);
  };

  const handleDeleteNode = () => {
    if (!selectedNode) return;

    setNodes((prev) => prev.filter((node) => node.id !== selectedNode.id));
    setEdges((prev) =>
      prev.filter(
        (edge) =>
          edge.source !== selectedNode.id && edge.target !== selectedNode.id
      )
    );

    setSelectedNode(null);
    setShowSettingsModal(false);
  };

  return (
    <div className="h-screen w-screen relative">
      {/* Top buttons */}
      <div className="absolute top-4 left-4 z-10 flex gap-4">
        <button
          onClick={handleAddNodeClick}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 cursor-pointer"
        >
          + Add Node
        </button>
        <button
          onClick={() => setShowScheduleModal(true)}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 cursor-pointer"
        >
          💾 Save Flow
        </button>
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
        fitView
      >
        <Background />
        <Controls />
      </ReactFlow>

      {/* Modal for selecting node type */}
      {showTypeModal && (
        <div className="fixed inset-0 bg-[#00000038] bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-96">
            <h2 className="text-lg font-semibold mb-4">Select Node Type</h2>
            <div className="space-y-2">
              <button
                className="w-full bg-gray-100 p-2 rounded hover:bg-gray-200"
                onClick={() => handleCreateNode("leadSource")}
              >
                📍 Lead Source
              </button>
              <button
                className="w-full bg-gray-100 p-2 rounded hover:bg-gray-200"
                onClick={() => handleCreateNode("coldEmail")}
              >
                📧 Cold Email
              </button>
              <button
                className="w-full bg-gray-100 p-2 rounded hover:bg-gray-200"
                onClick={() => handleCreateNode("waitDelay")}
              >
                ⏳ Wait/Delay
              </button>
              <button
                className="w-full text-red-500 hover:underline"
                onClick={() => setShowTypeModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-[#00000038] bg-opacity-20 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-[400px] space-y-4">
            <h2 className="text-lg font-semibold">
              Configure {selectedNode?.data?.nodeType}
            </h2>

            {/* Dynamic Form */}
            {selectedNode?.data?.nodeType === "leadSource" && (
              <div>
                <label className="block text-sm font-medium">Lead List</label>
                <select
                  value={nodeFormData.leadList || ""}
                  onChange={(e) =>
                    setNodeFormData((prev) => ({
                      ...prev,
                      leadList: e.target.value,
                    }))
                  }
                  className="w-full border p-2 rounded"
                >
                  <option value="">Select</option>
                  <option value="listA">List A</option>
                  <option value="listB">List B</option>
                </select>
              </div>
            )}

            {selectedNode?.data?.nodeType === "coldEmail" && (
              <>
                <div>
                  <label className="block text-sm font-medium">To Email</label>
                  <input
                    type="email"
                    value={nodeFormData.to || ""}
                    onChange={(e) =>
                      setNodeFormData((prev) => ({
                        ...prev,
                        to: e.target.value,
                      }))
                    }
                    className="w-full border p-2 rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Subject</label>
                  <input
                    type="text"
                    value={nodeFormData.subject || ""}
                    onChange={(e) =>
                      setNodeFormData((prev) => ({
                        ...prev,
                        subject: e.target.value,
                      }))
                    }
                    className="w-full border p-2 rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Body</label>
                  <textarea
                    value={nodeFormData.body || ""}
                    onChange={(e) =>
                      setNodeFormData((prev) => ({
                        ...prev,
                        body: e.target.value,
                      }))
                    }
                    className="w-full border p-2 rounded"
                  />
                </div>
              </>
            )}

            {selectedNode?.data?.nodeType === "waitDelay" && (
              <div>
                <label className="block text-sm font-medium">
                  Wait Time (mins)
                </label>
                <input
                  type="number"
                  value={nodeFormData.time || ""}
                  onChange={(e) =>
                    setNodeFormData((prev) => ({
                      ...prev,
                      time: e.target.value,
                    }))
                  }
                  className="w-full border p-2 rounded"
                />
              </div>
            )}

            <div className="flex justify-between gap-2 pt-4">
              <button
                onClick={handleSaveSettings}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                ✅ Save
              </button>
              <button
                onClick={handleDeleteNode}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                🗑️ Delete
              </button>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="text-gray-600 hover:underline"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Time Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-[#00000038] bg-opacity-20 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-[400px] space-y-4">
            <h2 className="text-lg font-semibold">
              Select Schedule Date & Time
            </h2>

            {/* Schedule Date & Time Input */}
            <div>
              <label className="block text-sm font-medium">
                Schedule Date & Time
              </label>
              <input
                type="datetime-local"
                value={scheduleDateTime || ""}
                onChange={(e) => setScheduleDateTime(e.target.value)}
                className="w-full border p-2 rounded"
              />
            </div>

            <div className="flex justify-between gap-2 pt-4">
              <button
                onClick={() => {
                  // Process the schedule time
                  if (!scheduleDateTime) {
                    alert("Please select a valid schedule time.");
                    return;
                  }

                  handleSave(); // Show confirmation alert
                  setShowScheduleModal(false); // Close the modal
                  // You can also trigger the save process here
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                ✅ Set Schedule
              </button>
              <button
                onClick={() => setShowScheduleModal(false)} // Close the modal
                className="text-gray-600 hover:underline"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FlowBuilder;
