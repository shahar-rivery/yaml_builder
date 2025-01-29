import React, { useState } from 'react';
import { VariableMetadata } from '../types/yaml';

interface VariablesMetadataFormProps {
  variables: Record<string, VariableMetadata>;
  onChange: (variables: Record<string, VariableMetadata>) => void;
}

export function VariablesMetadataForm({ variables, onChange }: VariablesMetadataFormProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [newVariableKey, setNewVariableKey] = useState('');

  const handleAddVariable = () => {
    if (!newVariableKey.trim()) return;

    const newVariables = {
      ...variables,
      [newVariableKey]: {
        format: 'json',
        storage_name: 'results dir',
        variable_name: newVariableKey
      }
    };
    onChange(newVariables);
    setNewVariableKey('');
  };

  const handleVariableChange = (key: string, field: string, value: string) => {
    const newVariables = {
      ...variables,
      [key]: {
        ...variables[key],
        [field]: value
      }
    };
    onChange(newVariables);
  };

  const handleDeleteVariable = (key: string) => {
    const newVariables = { ...variables };
    delete newVariables[key];
    onChange(newVariables);
  };

  return (
    <div className="mb-4 border rounded-lg overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-2 bg-gray-50 flex justify-between items-center hover:bg-gray-100"
      >
        <span className="text-sm font-medium">Variables Metadata ({Object.keys(variables).length})</span>
        <span>{isExpanded ? '▼' : '▶'}</span>
      </button>
      {isExpanded && (
        <div className="p-4">
          {/* Add new variable */}
          <div className="mb-4 flex gap-2">
            <input
              type="text"
              value={newVariableKey}
              onChange={(e) => setNewVariableKey(e.target.value)}
              className="flex-1 p-2 border rounded"
              placeholder="Enter variable key"
            />
            <button
              type="button"
              onClick={handleAddVariable}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Add Variable
            </button>
          </div>

          {/* Variables list */}
          {Object.entries(variables).map(([key, variable]) => (
            <div key={key} className="mb-4 p-4 border rounded bg-gray-50">
              <div className="font-medium mb-2">{key}</div>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Format</label>
                  <select
                    value={variable.format}
                    onChange={(e) => handleVariableChange(key, 'format', e.target.value)}
                    className="w-full p-2 border rounded bg-white"
                  >
                    <option value="json">JSON</option>
                    <option value="text">Text</option>
                    <option value="binary">Binary</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Storage Name</label>
                  <input
                    type="text"
                    value={variable.storage_name}
                    onChange={(e) => handleVariableChange(key, 'storage_name', e.target.value)}
                    className="w-full p-2 border rounded"
                    placeholder="Storage name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Variable Name</label>
                  <input
                    type="text"
                    value={variable.variable_name}
                    onChange={(e) => handleVariableChange(key, 'variable_name', e.target.value)}
                    className="w-full p-2 border rounded"
                    placeholder="Variable name"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleDeleteVariable(key)}
                className="mt-4 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
              >
                Remove Variable
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 