import React, { useState } from 'react';

interface VariablesMetadataFormProps {
  metadata: Record<string, any>;
  onChange: (metadata: Record<string, any>) => void;
}

export function VariablesMetadataForm({ metadata, onChange }: VariablesMetadataFormProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');

  const handleAddVariable = () => {
    if (newKey.trim() === '') return;
    
    onChange({
      ...metadata,
      [newKey]: newValue
    });
    
    setNewKey('');
    setNewValue('');
  };

  const handleRemoveVariable = (key: string) => {
    const newMetadata = { ...metadata };
    delete newMetadata[key];
    onChange(newMetadata);
  };

  return (
    <div className="form-card">
      <div className="form-header">
        <div className="flex items-center space-x-2">
          <h2>Variables Metadata</h2>
          {Object.keys(metadata).length > 0 && (
            <span className="badge badge-blue">
              {Object.keys(metadata).length}
            </span>
          )}
        </div>
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="btn btn-icon btn-ghost"
        >
          <svg 
            className={`h-4 w-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {isExpanded && (
        <div className="form-content">
          {Object.keys(metadata).length === 0 ? (
            <div className="text-center py-3">
              <p className="text-sm text-neutral-500">No variables added</p>
            </div>
          ) : (
            <div className="space-y-2 mb-4">
              {Object.entries(metadata).map(([key, value]) => (
                <div key={key} className="parameter-card group flex justify-between items-center">
                  <div className="flex-1">
                    <div className="text-sm font-medium">{key}</div>
                    <div className="text-xs text-neutral-500">{String(value)}</div>
                  </div>
                  <button
                    onClick={() => handleRemoveVariable(key)}
                    className="remove-button btn btn-icon btn-ghost text-neutral-400 hover:text-red-500"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="form-label">Key</label>
                <input
                  type="text"
                  value={newKey}
                  onChange={(e) => setNewKey(e.target.value)}
                  className="form-input"
                  placeholder="Variable name"
                />
              </div>
              <div>
                <label className="form-label">Value</label>
                <input
                  type="text"
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  className="form-input"
                  placeholder="Variable value"
                />
              </div>
            </div>
            
            <button
              type="button"
              onClick={handleAddVariable}
              disabled={newKey.trim() === ''}
              className={`add-button ${newKey.trim() === '' ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>Add Variable</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 