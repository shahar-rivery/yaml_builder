import React, { useState } from 'react';
import { Connector } from '../types/yaml';

interface ConnectorFormProps {
  connector: Connector;
  onChange: (connector: Connector) => void;
}

export function ConnectorForm({ connector, onChange }: ConnectorFormProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleChange = (field: keyof Connector, value: any) => {
    onChange({
      ...connector,
      [field]: value
    });
  };

  return (
    <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-2 bg-gray-50 flex justify-between items-center hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center space-x-2">
          <h2 className="text-sm font-medium">Connector Configuration</h2>
        </div>
        <span className="transform transition-transform duration-200" style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>
          ▼
        </span>
      </button>

      {isExpanded && (
        <div className="p-3 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-gray-700">
                Name
                <span className="block font-normal text-gray-500">Name of your connector</span>
              </label>
              <input
                type="text"
                value={connector.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className="w-full p-1 text-sm border rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 mt-1"
                placeholder="Connector name"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700">
                Base URL
                <span className="block font-normal text-gray-500">Root URL of the API</span>
              </label>
              <input
                type="text"
                value={connector.base_url}
                onChange={(e) => handleChange('base_url', e.target.value)}
                className="w-full p-1 text-sm border rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 mt-1"
                placeholder="https://api.example.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700">
              Default Headers
              <span className="block font-normal text-gray-500">Headers included in all requests (API keys, content type)</span>
            </label>
            <textarea
              value={JSON.stringify(connector.default_headers, null, 2)}
              onChange={(e) => {
                try {
                  handleChange('default_headers', JSON.parse(e.target.value));
                } catch (error) {
                  // Handle invalid JSON
                }
              }}
              className="w-full p-1 text-sm border rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 font-mono mt-1"
              placeholder="{}"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700">
              Default Retry Strategy
              <span className="block font-normal text-gray-500">Configure retry behavior for failed requests</span>
            </label>
            <textarea
              value={JSON.stringify(connector.default_retry_strategy, null, 2)}
              onChange={(e) => {
                try {
                  handleChange('default_retry_strategy', JSON.parse(e.target.value));
                } catch (error) {
                  // Handle invalid JSON
                }
              }}
              className="w-full p-1 text-sm border rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 font-mono mt-1"
              placeholder="{}"
              rows={3}
            />
          </div>
        </div>
      )}
    </div>
  );
} 