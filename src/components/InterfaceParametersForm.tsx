import React, { useState } from 'react';
import { InterfaceParameter, Field } from '../types/yaml';

interface InterfaceParametersFormProps {
  parameters: InterfaceParameter[];
  onChange: (parameters: InterfaceParameter[]) => void;
}

export function InterfaceParametersForm({ parameters, onChange }: InterfaceParametersFormProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleAddParameter = () => {
    const newParams = [
      ...(parameters || []),
      {
        name: '',
        type: 'string',
        value: ''
      }
    ];
    onChange(newParams);
  };

  const handleParameterChange = (index: number, field: string, value: any) => {
    const newParams = [...parameters];
    newParams[index] = {
      ...newParams[index],
      [field]: value
    };
    onChange(newParams);
  };

  const handleFieldChange = (paramIndex: number, fieldIndex: number, field: string, value: string) => {
    const newParams = [...parameters];
    if (!newParams[paramIndex].fields) {
      newParams[paramIndex].fields = [];
    }
    newParams[paramIndex].fields[fieldIndex] = {
      ...newParams[paramIndex].fields[fieldIndex],
      [field]: value
    };
    onChange(newParams);
  };

  const handleAddField = (paramIndex: number) => {
    const newParams = [...parameters];
    if (!newParams[paramIndex].fields) {
      newParams[paramIndex].fields = [];
    }
    newParams[paramIndex].fields.push({
      name: '',
      value: ''
    });
    onChange(newParams);
  };

  const handleDeleteField = (paramIndex: number, fieldIndex: number) => {
    const newParams = [...parameters];
    newParams[paramIndex].fields = newParams[paramIndex].fields.filter((_, idx) => idx !== fieldIndex);
    onChange(newParams);
  };

  const handleDeleteParameter = (index: number) => {
    const newParams = parameters.filter((_, idx) => idx !== index);
    onChange(newParams);
  };

  const renderFields = (param: InterfaceParameter, paramIndex: number) => {
    if (!param.fields) return null;

    return (
      <div className="mt-4 space-y-4">
        <h4 className="text-sm font-medium text-gray-700">Fields</h4>
        {param.fields.map((field, fieldIndex) => (
          <div key={fieldIndex} className="p-3 border rounded bg-white">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Field Name</label>
                <input
                  type="text"
                  value={field.name}
                  onChange={(e) => handleFieldChange(paramIndex, fieldIndex, 'name', e.target.value)}
                  className="w-full p-2 border rounded"
                  placeholder="Field name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Value</label>
                <input
                  type="text"
                  value={field.value}
                  onChange={(e) => handleFieldChange(paramIndex, fieldIndex, 'value', e.target.value)}
                  className="w-full p-2 border rounded"
                  placeholder="Field value"
                />
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleDeleteField(paramIndex, fieldIndex)}
              className="mt-2 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
            >
              Remove Field
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => handleAddField(paramIndex)}
          className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
        >
          Add Field
        </button>
      </div>
    );
  };

  return (
    <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 bg-gray-50 flex justify-between items-center hover:bg-gray-100"
      >
        <h2 className="text-lg font-semibold">Interface Parameters ({parameters.length})</h2>
        <span>{isExpanded ? '▼' : '▶'}</span>
      </button>
      {isExpanded && (
        <div className="p-4">
          {parameters.map((param, index) => (
            <div key={index} className="mb-4 p-4 border rounded bg-gray-50">
              <div className="grid grid-cols-2 gap-4 mb-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={param.name}
                    onChange={(e) => handleParameterChange(index, 'name', e.target.value)}
                    className="w-full p-2 border rounded"
                    placeholder="Parameter name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select
                    value={param.type}
                    onChange={(e) => handleParameterChange(index, 'type', e.target.value)}
                    className="w-full p-2 border rounded bg-white"
                  >
                    <option value="string">String</option>
                    <option value="authentication">Authentication</option>
                    <option value="date_range">Date Range</option>
                  </select>
                </div>
              </div>

              {param.type !== 'authentication' && param.type !== 'date_range' && (
                <div className="mb-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Value</label>
                  <input
                    type="text"
                    value={param.value || ''}
                    onChange={(e) => handleParameterChange(index, 'value', e.target.value)}
                    className="w-full p-2 border rounded"
                    placeholder="Value"
                  />
                </div>
              )}

              {param.type === 'authentication' && (
                <>
                  <div className="mb-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Auth Type</label>
                    <select
                      value={param.auth_type || 'bearer'}
                      onChange={(e) => handleParameterChange(index, 'auth_type', e.target.value)}
                      className="w-full p-2 border rounded bg-white"
                    >
                      <option value="bearer">Bearer</option>
                      {/* Add other auth types as needed */}
                    </select>
                  </div>
                  {renderFields(param, index)}
                </>
              )}

              {param.type === 'date_range' && (
                <>
                  <div className="mb-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Period Type</label>
                    <select
                      value={param.period_type || 'datetime'}
                      onChange={(e) => handleParameterChange(index, 'period_type', e.target.value)}
                      className="w-full p-2 border rounded bg-white"
                    >
                      <option value="datetime">DateTime</option>
                      <option value="date">Date</option>
                    </select>
                  </div>
                  <div className="mb-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Format</label>
                    <input
                      type="text"
                      value={param.format || ''}
                      onChange={(e) => handleParameterChange(index, 'format', e.target.value)}
                      className="w-full p-2 border rounded"
                      placeholder="e.g., YYYY-MM-DDTHH:MM:SSZ"
                    />
                  </div>
                  {renderFields(param, index)}
                </>
              )}

              <button
                type="button"
                onClick={() => handleDeleteParameter(index)}
                className="mt-4 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
              >
                Remove Parameter
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={handleAddParameter}
            className="w-full mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Add Parameter
          </button>
        </div>
      )}
    </div>
  );
} 