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
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Connector Name
            <span className="ml-1 text-xs text-gray-500">
              (The name of your API connector, e.g., 'Rivery API')
            </span>
          </label>
          <input
            type="text"
            value={connector.name || ''}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="e.g., Rivery API"
            className="w-full px-3 py-2 border border-gray-200 rounded-md shadow-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
          {/* <p className="mt-1 text-xs text-gray-500">
            This name will be used to identify your connector in the configuration.
          </p> */}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Base URL
            <span className="ml-1 text-xs text-gray-500">
              (The root URL for all API endpoints)
            </span>
          </label>
          <input
            type="text"
            value={connector.base_url || ''}
            onChange={(e) => handleChange('base_url', e.target.value)}
            placeholder="e.g., https://api.rivery.io"
            className="w-full px-3 py-2 border border-gray-200 rounded-md shadow-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
          {/* <p className="mt-1 text-xs text-gray-500">
            All API endpoints will be relative to this base URL. Include the protocol (http:// or https://).
          </p> */}
        </div>
      </div>

      <div className="border-t pt-6">
        <h3 className="text-lg font-medium mb-2">Variables Metadata</h3>
        <p className="text-sm text-gray-600 mb-4">Configure how your pipeline variables are formatted and stored. These settings determine how data is processed and where it's saved.</p>
        <div className="space-y-4">
          {Object.entries(connector.variables_metadata).map(([varName, config]) => (
            <div key={varName}>
              
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-md">
                <div className="flex-1">
                {varName === 'final_output_file' && (
                <p className="text-sm text-gray-600 mb-2">Pre-configured variable for storing the final output of your workflow</p>
              )}
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
            </div>
          ))}

          <div className="flex items-center gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Variable Name"
                value={newVarName}
                onChange={(e) => setNewVarName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-md shadow-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
              />
            </div>
            <button
              onClick={addVariable}
              disabled={!newVarName.trim()}
              className={`px-4 py-2 rounded-md transition-colors shadow-sm ${
                !newVarName.trim()
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-500 text-white hover:bg-blue-600 hover:shadow-md'
              }`}
            >
              + Add Variable
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};