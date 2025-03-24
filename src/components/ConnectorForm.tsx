import React, { useState } from 'react';
import { Connector } from '../types';
import { Plus, Trash2 } from 'lucide-react';

interface Props {
  connector: Connector;
  onUpdate: (connector: Connector) => void;
}

export const ConnectorForm: React.FC<Props> = ({ connector, onUpdate }) => {
  const [newVarName, setNewVarName] = useState('');
  const [newVarFormat, setNewVarFormat] = useState('json');
  const [newVarStorage, setNewVarStorage] = useState('results dir');

  const handleChange = (field: keyof Connector, value: string) => {
    onUpdate({ ...connector, [field]: value });
  };

  const addVariable = () => {
    if (!newVarName) return;

    const updatedConnector = {
      ...connector,
      variables_metadata: {
        ...connector.variables_metadata,
        [newVarName]: {
          format: newVarFormat,
          storage_name: newVarStorage
        }
      }
    };

    onUpdate(updatedConnector);
    setNewVarName('');
    setNewVarFormat('json');
    setNewVarStorage('results dir');
  };

  const removeVariable = (varName: string) => {
    const { [varName]: removed, ...remainingVars } = connector.variables_metadata;
    const updatedConnector = {
      ...connector,
      variables_metadata: remainingVars
    };
    onUpdate(updatedConnector);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Connector Name</label>
          <input
            type="text"
            value={connector.name}
            onChange={(e) => handleChange('name', e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Base URL</label>
          <input
            type="text"
            value={connector.base_url}
            onChange={(e) => handleChange('base_url', e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>
      </div>

      <div className="border-t pt-6">
        <h3 className="text-lg font-medium mb-4">Variables Metadata</h3>
        <div className="space-y-4">
          {Object.entries(connector.variables_metadata).map(([varName, config]) => (
            <div key={varName} className="flex items-center gap-4 p-4 bg-gray-50 rounded-md">
              <div className="flex-1">
                <p className="font-medium">{varName}</p>
                <p className="text-sm text-gray-600">
                  Format: {config.format} | Storage: {config.storage_name}
                </p>
              </div>
              <button
                onClick={() => removeVariable(varName)}
                className="p-2 text-red-500 hover:text-red-700"
              >
                <Trash2 size={20} />
              </button>
            </div>
          ))}

          <div className="grid grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Variable Name"
              value={newVarName}
              onChange={(e) => setNewVarName(e.target.value)}
              className="px-3 py-2 border rounded-md"
            />
            <select
              value={newVarFormat}
              onChange={(e) => setNewVarFormat(e.target.value)}
              className="px-3 py-2 border rounded-md"
            >
              <option value="json">JSON</option>
              <option value="csv">CSV</option>
              <option value="text">Text</option>
            </select>
            <input
              type="text"
              placeholder="Storage Name"
              value={newVarStorage}
              onChange={(e) => setNewVarStorage(e.target.value)}
              className="px-3 py-2 border rounded-md"
            />
          </div>
          <button
            onClick={addVariable}
            className="flex items-center justify-center w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            <Plus size={20} className="mr-2" />
            Add Variable
          </button>
        </div>
      </div>
    </div>
  );
};