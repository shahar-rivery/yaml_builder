import React, { useState } from 'react';
import { InterfaceParameter } from '../types/yaml';

interface InterfaceParametersFormProps {
  parameters: InterfaceParameter[];
  onChange: (parameters: InterfaceParameter[]) => void;
}

export function InterfaceParametersForm({ parameters, onChange }: InterfaceParametersFormProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleAddParameter = () => {
    const newParam: InterfaceParameter = {
      name: '',
      type: 'string',
      value: ''
    };
    onChange([...parameters, newParam]);
  };

  const handleParameterChange = (index: number, field: string, value: any) => {
    const newParams = [...parameters];
    const param = newParams[index];

    if (field === 'type') {
      switch (value) {
        case 'string':
          newParams[index] = {
            ...param,
            type: 'string',
            value: param.value || '',
            auth_type: undefined,
            fields: undefined,
            period_type: undefined,
            format: undefined
          };
          break;
        case 'date_range':
          newParams[index] = {
            name: param.name || 'time_period',
            type: 'date_range',
            period_type: 'datetime',
            format: 'YYYY-MM-DDTHH:MM:SSZ',
            fields: [
              { name: 'start_date', value: '' },
              { name: 'end_date', value: '' }
            ]
          };
          break;
        case 'authentication':
          newParams[index] = {
            name: 'connectToAPI',
            type: 'authentication',
            auth_type: 'basic_http',
            fields: [
              { name: 'username', type: 'string', value: '' },
              { name: 'password', type: 'string', value: '', is_encrypted: true }
            ],
            description: 'Connection type of basic http'
          };
          break;
      }
    } else if (field === 'auth_type') {
      // Update fields based on auth type
      let newFields;
      let description;
      switch (value) {
        case 'basic_http':
          newFields = [
            { name: 'username', type: 'string', value: '' },
            { name: 'password', type: 'string', value: '', is_encrypted: true }
          ];
          description = 'Connection type of basic http';
          break;
        case 'bearer':
          newFields = [
            { name: 'bearer_token', type: 'string', value: '', is_encrypted: true }
          ];
          description = 'Connection type of bearer';
          break;
        case 'api_key':
          newFields = [
            { name: 'key_name', type: 'string', value: '' },
            { name: 'key_value', type: 'string', value: '', is_encrypted: true }
          ];
          description = 'Connection type of api_key';
          break;
      }
      newParams[index] = {
        ...param,
        auth_type: value,
        fields: newFields,
        description,
        location: value === 'api_key' ? 'header' : undefined
      };
    } else if (field.startsWith('date_field_')) {
      // Handle date range field changes
      const fieldIndex = parseInt(field.split('_')[2]);
      if (param.fields) {
        param.fields[fieldIndex] = {
          ...param.fields[fieldIndex],
          value: value
        };
      }
    } else {
      newParams[index] = {
        ...param,
        [field]: value
      };
    }
    onChange(newParams);
  };

  const handleFieldChange = (paramIndex: number, fieldIndex: number, field: string, value: any) => {
    const newParams = [...parameters];
    const param = newParams[paramIndex];
    
    if (param.fields) {
      param.fields[fieldIndex] = {
        ...param.fields[fieldIndex],
        [field]: value
      };
      onChange(newParams);
    }
  };

  const handleDeleteParameter = (index: number) => {
    const newParams = parameters.filter((_, idx) => idx !== index);
    onChange(newParams);
  };

  const shouldShowEncryptionToggle = (fieldName: string): boolean => {
    const sensitiveFields = ['password', 'bearer_token', 'key_value'];
    return sensitiveFields.includes(fieldName);
  };

  return (
    <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-2 bg-gray-50 flex justify-between items-center hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center space-x-2">
          <h2 className="text-lg font-medium">Interface Parameters</h2>
          {parameters.length > 0 && (
            <span className="px-1.5 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
              {parameters.length}
            </span>
          )}
        </div>
        <span className="transform transition-transform duration-200" style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>
          ▼
        </span>
      </button>
      {isExpanded && (
        <div className="p-3">
          {parameters.length === 0 ? (
            <div className="text-center py-3">
              <p className="text-sm text-gray-500">No parameters added</p>
            </div>
          ) : (
            <div className="space-y-2 mb-3">
              {parameters.map((param, index) => (
                <div key={index} className="group relative p-2 border rounded-md bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="flex justify-end">
                    <button
                      onClick={() => {
                        const newParams = [...parameters];
                        newParams.splice(index, 1);
                        onChange(newParams);
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-gray-400 hover:text-red-500 rounded-full hover:bg-white absolute top-2 right-2"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="space-y-1">
                      <label className="block text-xs font-medium text-gray-700">Name</label>
                      <input
                        type="text"
                        value={param.name}
                        onChange={(e) => {
                          const newParams = [...parameters];
                          newParams[index] = { ...param, name: e.target.value };
                          onChange(newParams);
                        }}
                        className="w-full p-1 border rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Parameter name"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-xs font-medium text-gray-700">Type</label>
                      <select
                        value={param.type}
                        onChange={(e) => {
                          const newParams = [...parameters];
                          newParams[index] = { ...param, type: e.target.value };
                          onChange(newParams);
                        }}
                        className="w-full p-1 border rounded bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="string">String</option>
                        <option value="date_range">Date Range</option>
                        <option value="authorization">Authorization</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
              
          <button
            type="button"
            onClick={handleAddParameter}
            className="w-full mt-2 px-2 py-1 border-2 border-dashed border-gray-300 rounded text-xs text-gray-600 hover:border-blue-500 hover:text-blue-500 transition-colors flex items-center justify-center space-x-1"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>Add Parameter</span>
          </button>
        </div>
      )}
    </div>
  );
} 