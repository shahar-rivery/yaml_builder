import React from 'react';
import { PlusCircle, Trash2 } from 'lucide-react';

type AuthType = 'bearer' | 'basic_http' | 'api_key';
type PeriodType = 'date' | 'datetime';

interface Field {
  name: string;
  type?: string;
  value?: string;
  is_encrypted?: boolean;
}

interface Parameter {
  name: string;
  type: string;
  auth_type?: AuthType;
  period_type?: PeriodType;
  format?: string;
  location?: 'header' | 'query_param';
  fields?: Field[];
}

interface Props {
  parameters: Parameter[];
  onUpdate: (parameters: Parameter[]) => void;
}

export function InterfaceParametersForm({ parameters, onUpdate }: Props) {
  const addParameter = () => {
    onUpdate([...parameters, { name: '', type: 'string' }]);
  };

  const removeParameter = (index: number) => {
    const newParameters = [...parameters];
    newParameters.splice(index, 1);
    onUpdate(newParameters);
  };

  const updateParameter = (index: number, field: string, value: any) => {
    const newParameters = [...parameters];
    newParameters[index] = { ...newParameters[index], [field]: value };

    // Set default fields based on parameter type
    if (field === 'type') {
      if (value === 'authentication') {
        newParameters[index].auth_type = 'bearer';
        newParameters[index].fields = [
          { name: 'bearer_token', type: 'string', is_encrypted: true }
        ];
      } else if (value === 'date_range') {
        newParameters[index].period_type = 'date';
        newParameters[index].format = 'YYYY-MM-DD';
        newParameters[index].fields = [
          { name: 'start_date', value: '' },
          { name: 'end_date', value: '' }
        ];
      }
    }

    if (field === 'auth_type') {
      switch (value) {
        case 'bearer':
          newParameters[index].fields = [
            { name: 'bearer_token', type: 'string', is_encrypted: true }
          ];
          break;
        case 'basic_http':
          newParameters[index].fields = [
            { name: 'username', type: 'string' },
            { name: 'password', type: 'string', is_encrypted: true }
          ];
          break;
        case 'api_key':
          newParameters[index].fields = [
            { name: 'key_name', type: 'string' },
            { name: 'key_value', type: 'string', is_encrypted: true }
          ];
          break;
      }
    }

    onUpdate(newParameters);
  };

  return (
    <div className="space-y-4">
      {parameters.map((param, index) => (
        <div key={index} className="space-y-4 p-4 border rounded-lg">
          <div className="flex justify-between">
            <div className="flex-grow space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Parameter Name
                    <span className="ml-1 text-xs text-gray-500">
                      (Unique identifier for this parameter)
                    </span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., account_id"
                    value={param.name}
                    onChange={(e) => updateParameter(index, 'name', e.target.value)}
                    className="border rounded p-2 w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Parameter Type
                    <span className="ml-1 text-xs text-gray-500">
                      (Type of parameter: string, authentication, or date_range)
                    </span>
                  </label>
                  <select
                    value={param.type}
                    onChange={(e) => updateParameter(index, 'type', e.target.value)}
                    className="border rounded p-2 w-full"
                  >
                    <option value="string">String</option>
                    <option value="authentication">Authentication</option>
                    <option value="date_range">Date Range</option>
                  </select>
                </div>
              </div>

              {param.type === 'authentication' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Authentication Type
                      <span className="ml-1 text-xs text-gray-500">
                        (Method of authentication)
                      </span>
                    </label>
                    <select
                      value={param.auth_type}
                      onChange={(e) => updateParameter(index, 'auth_type', e.target.value)}
                      className="border rounded p-2 w-full"
                    >
                      <option value="bearer">Bearer Token</option>
                      <option value="basic_http">Basic HTTP</option>
                      <option value="api_key">API Key</option>
                    </select>
                  </div>

                  {param.auth_type === 'api_key' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        API Key Location
                        <span className="ml-1 text-xs text-gray-500">
                          (Where to place the API key)
                        </span>
                      </label>
                      <select
                        value={param.location}
                        onChange={(e) => updateParameter(index, 'location', e.target.value)}
                        className="border rounded p-2 w-full"
                      >
                        <option value="header">Header</option>
                        <option value="query_param">Query Parameter</option>
                      </select>
                    </div>
                  )}
                </div>
              )}

              {param.type === 'date_range' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Period Type
                      <span className="ml-1 text-xs text-gray-500">
                        (Format of the date values)
                      </span>
                    </label>
                    <select
                      value={param.period_type}
                      onChange={(e) => updateParameter(index, 'period_type', e.target.value)}
                      className="border rounded p-2 w-full"
                    >
                      <option value="date">Date</option>
                      <option value="datetime">DateTime</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date Format
                      <span className="ml-1 text-xs text-gray-500">
                        (e.g., YYYY-MM-DD for dates)
                      </span>
                    </label>
                    <input
                      type="text"
                      placeholder="YYYY-MM-DD"
                      value={param.format}
                      onChange={(e) => updateParameter(index, 'format', e.target.value)}
                      className="border rounded p-2 w-full"
                    />
                  </div>
                </div>
              )}

              {param.fields && (
                <div className="space-y-2">
                  {param.fields.map((field, fieldIndex) => (
                    <div key={fieldIndex} className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {field.name}
                        <span className="ml-1 text-xs text-gray-500">
                          {field.is_encrypted ? "(Encrypted value)" : "(Value)"}
                        </span>
                      </label>
                      <div className="grid grid-cols-2 gap-4">
                        <input
                          type="text"
                          value={field.name}
                          readOnly
                          className="border rounded p-2 bg-gray-100"
                        />
                        <input
                          type={param.type === 'date_range' ? 'date' : 'text'}
                          placeholder={`Enter ${field.name}`}
                          value={field.value || ''}
                          onChange={(e) => {
                            const newFields = [...param.fields!];
                            newFields[fieldIndex] = { ...field, value: e.target.value };
                            updateParameter(index, 'fields', newFields);
                          }}
                          className="border rounded p-2"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={() => removeParameter(index)}
              className="ml-4 text-red-500 hover:text-red-700"
            >
              <Trash2 size={20} />
            </button>
          </div>
        </div>
      ))}
      <button
        onClick={addParameter}
        className="flex items-center text-blue-500 hover:text-blue-700"
      >
        <PlusCircle size={20} className="mr-2" />
        Add Parameter
      </button>
    </div>
  );
}