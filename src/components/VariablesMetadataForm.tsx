import React, { useState } from 'react';

interface VariablesMetadataFormProps {
  metadata: Record<string, any>;
  onChange: (metadata: Record<string, any>) => void;
}

export function VariablesMetadataForm({ metadata, onChange }: VariablesMetadataFormProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [newVarName, setNewVarName] = useState('');

  const handleAddVariable = () => {
    if (newVarName.trim()) {
      onChange({
        ...metadata,
        [newVarName]: {
          format: 'json',
          storage_name: 'results dir'
        }
      });
      setNewVarName('');
    }
  };

  const handleRemoveVariable = (varName: string) => {
    const newMetadata = { ...metadata };
    delete newMetadata[varName];
    onChange(newMetadata);
  };

  const handleFormatChange = (varName: string, format: string) => {
    onChange({
      ...metadata,
      [varName]: {
        ...metadata[varName],
        format
      }
    });
  };

  const handleStorageNameChange = (varName: string, storage_name: string) => {
    onChange({
      ...metadata,
      [varName]: {
        ...metadata[varName],
        storage_name
      }
    });
  };

  return (
    <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-2 bg-gray-50 flex justify-between items-center hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center space-x-2">
          <h2 className="text-sm font-medium">Variables Metadata</h2>
          {Object.keys(metadata).length > 0 && (
            <span className="px-1.5 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
              {Object.keys(metadata).length}
            </span>
          )}
        </div>
        <span className="transform transition-transform duration-200" style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>
          ▼
        </span>
      </button>

      {isExpanded && (
        <div className="p-3">
          {Object.keys(metadata).length === 0 ? (
            <div className="text-center py-3">
              <p className="text-sm text-gray-500">No variables defined</p>
            </div>
          ) : (
            <div className="space-y-2 mb-3">
              {Object.entries(metadata).map(([varName, varData]) => (
                <div key={varName} className="group relative p-2 border rounded-md bg-gray-50 hover:bg-gray-100 transition-colors text-sm">
                  <div className="flex flex-col space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{varName}</span>
                      <button
                        onClick={() => handleRemoveVariable(varName)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-gray-400 hover:text-red-500 rounded-full hover:bg-white"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <select
                          value={(varData as any).format || 'json'}
                          onChange={(e) => handleFormatChange(varName, e.target.value)}
                          className="w-full p-1 text-sm border rounded bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="json">JSON</option>
                          <option value="csv">CSV</option>
                          <option value="xml">XML</option>
                        </select>
                      </div>
                      <div>
                        <input
                          type="text"
                          value={(varData as any).storage_name || 'results dir'}
                          onChange={(e) => handleStorageNameChange(varName, e.target.value)}
                          className="w-full p-1 text-sm border rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex space-x-2">
            <input
              type="text"
              value={newVarName}
              onChange={(e) => setNewVarName(e.target.value)}
              placeholder="Variable name"
              className="flex-1 p-1 text-sm border rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              onClick={handleAddVariable}
              className="px-2 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
            >
              Add
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 