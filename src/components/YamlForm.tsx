import React, { useState } from 'react';
import { z } from 'zod';
import yaml from 'js-yaml';
import { Copy, Download } from 'lucide-react';

const formSchema = z.object({
  interface_parameters: z.object({
    section: z.object({
      source: z.array(
        z.object({
          name: z.string(),
          type: z.string(),
          value: z.string().optional(),
          auth_type: z.string().optional(),
          fields: z.array(
            z.object({
              name: z.string(),
              type: z.string().optional(),
              value: z.string(),
            })
          ).optional(),
          period_type: z.string().optional(),
          format: z.string().optional(),
        })
      )
    })
  }),
  connector: z.object({
    base_url: z.string().url('Must be a valid URL'),
    default_headers: z.object({
      Accept: z.string(),
      Authorization: z.string()
    }),
    default_retry_strategy: z.object({}),
    name: z.string().min(1, 'Name is required'),
    variables_metadata: z.object({
      final_output_file: z.object({
        format: z.string(),
        storage_name: z.string()
      }),
      persons: z.object({
        format: z.string(),
        storage_name: z.string()
      })
    }),
    variables_storages: z.array(
      z.object({
        name: z.string(),
        path: z.string(),
        type: z.string()
      })
    )
  }),
  steps: z.array(
    z.object({
      name: z.string().min(1, 'Step name is required'),
      description: z.string(),
      endpoint: z.string().min(1, 'Endpoint is required'),
      http_method: z.enum(['GET', 'POST', 'PUT', 'DELETE']),
      type: z.string(),
      variables_output: z.array(
        z.object({
          variable_name: z.string(),
          response_location: z.string(),
          variable_format: z.string(),
          overwrite_storage: z.boolean()
        })
      )
    })
  )
});

type YamlFormData = z.infer<typeof formSchema>;

const initialFormData: YamlFormData = {
  interface_parameters: {
    section: {
      source: []
    }
  },
  connector: {
    base_url: '',
    default_headers: {
      Accept: 'application/json',
      Authorization: 'Basic "{authorization}"'
    },
    default_retry_strategy: {},
    name: '',
    variables_metadata: {
      final_output_file: {
        format: 'json',
        storage_name: 'results dir'
      },
      persons: {
        format: 'json',
        storage_name: 'results dir'
      }
    },
    variables_storages: [{
      name: 'results dir',
      path: '/storage/file_system',
      type: 'file_system'
    }]
  },
  steps: [{
    name: '',
    description: '',
    endpoint: '{{%BASE_URL%}}/',
    http_method: 'GET',
    type: 'rest',
    variables_output: [{
      variable_name: 'final_output_file',
      response_location: 'data',
      variable_format: 'json',
      overwrite_storage: true
    }]
  }]
};

type ParameterType = 'string' | 'authentication' | 'date_range';
type AuthType = 'basic_http' | 'bearer' | 'api_token';

interface ParameterField {
  name: string;
  type?: string;
  value: string;
}

interface SourceParameter {
  name: string;
  type: ParameterType;
  value?: string;
  auth_type?: AuthType;
  period_type?: 'date' | 'datetime';
  format?: string;
  fields?: ParameterField[];
}

const defaultAuthFields: ParameterField[] = [
  { name: 'username', type: 'string', value: '' },
  { name: 'password', type: 'string', value: '' }
];

const defaultDateRangeFields: ParameterField[] = [
  { name: 'start_date', value: '' },
  { name: 'end_date', value: '' }
];

export const YamlForm: React.FC = () => {
  const [formData, setFormData] = useState<YamlFormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [yamlPreview, setYamlPreview] = useState<string>('');

  const validateForm = (): boolean => {
    try {
      formSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          const path = err.path.join('.');
          newErrors[path] = err.message;
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        const orderedData = {
          interface_parameters: formData.interface_parameters,
          connector: {
            base_url: formData.connector.base_url,
            default_headers: formData.connector.default_headers,
            default_retry_strategy: formData.connector.default_retry_strategy,
            name: formData.connector.name,
            variables_metadata: formData.connector.variables_metadata,
            variables_storages: formData.connector.variables_storages
          },
          steps: formData.steps
        };

        const yamlString = yaml.dump(orderedData, {
          indent: 2,
          lineWidth: -1,
          noRefs: true,
          sortKeys: false
        });
        setYamlPreview(yamlString);
      } catch (error) {
        console.error('Error generating YAML:', error);
      }
    }
  };

  const downloadYaml = () => {
    if (!yamlPreview) return;
    
    const blob = new Blob([yamlPreview], { type: 'text/yaml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'connector.yaml';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const copyYaml = () => {
    if (yamlPreview) {
      navigator.clipboard.writeText(yamlPreview)
        .then(() => {
          console.log('Copied to clipboard');
        })
        .catch((err) => {
          console.error('Failed to copy:', err);
        });
    }
  };

  const addNewParameter = (type: ParameterType) => {
    const newParameter: SourceParameter = {
      name: '',
      type: type,
      value: type === 'string' ? '' : undefined
    };

    if (type === 'authentication') {
      newParameter.auth_type = 'basic_http';
      newParameter.fields = [...defaultAuthFields];
    } else if (type === 'date_range') {
      newParameter.period_type = 'date';
      newParameter.format = 'YYYY-MM-DD';
      newParameter.fields = [...defaultDateRangeFields];
    }

    setFormData({
      ...formData,
      interface_parameters: {
        section: {
          source: [...formData.interface_parameters.section.source, newParameter]
        }
      }
    });
  };

  const removeParameter = (index: number) => {
    const newSource = formData.interface_parameters.section.source.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      interface_parameters: {
        section: {
          source: newSource
        }
      }
    });
  };

  const renderParameterFields = (param: SourceParameter, index: number) => {
    return (
      <div key={index} className="p-4 border rounded space-y-2 bg-white">
        <div className="flex justify-between items-center mb-2">
          <span className="font-medium capitalize">{param.type} Parameter</span>
          <button
            type="button"
            onClick={() => removeParameter(index)}
            className="text-red-500 hover:text-red-600"
          >
            Remove
          </button>
        </div>

        <div className="space-y-1">
          <label className="block text-sm text-gray-600">Parameter Name</label>
          <p className="text-xs text-gray-500 mb-1">Enter a unique identifier for this parameter (e.g., "api_key", "date_range")</p>
          <input
            type="text"
            placeholder="Parameter Name"
            value={param.name}
            onChange={(e) => {
              const newSource = [...formData.interface_parameters.section.source];
              newSource[index] = { ...param, name: e.target.value };
              setFormData({
                ...formData,
                interface_parameters: {
                  section: {
                    source: newSource
                  }
                }
              });
            }}
            className="w-full p-2 border rounded"
          />
        </div>

        {param.type === 'string' && (
          <div className="space-y-1">
            <label className="block text-sm text-gray-600">Value</label>
            <p className="text-xs text-gray-500 mb-1">Enter the default value for this string parameter</p>
            <input
              type="text"
              placeholder="Value"
              value={param.value || ''}
              onChange={(e) => {
                const newSource = [...formData.interface_parameters.section.source];
                newSource[index] = { ...param, value: e.target.value };
                setFormData({
                  ...formData,
                  interface_parameters: {
                    section: {
                      source: newSource
                    }
                  }
                });
              }}
              className="w-full p-2 border rounded"
            />
          </div>
        )}

        {param.type === 'authentication' && (
          <div className="space-y-2">
            <select
              value={param.auth_type}
              onChange={(e) => {
                const newSource = [...formData.interface_parameters.section.source];
                newSource[index] = { ...param, auth_type: e.target.value as AuthType };
                setFormData({
                  ...formData,
                  interface_parameters: {
                    section: {
                      source: newSource
                    }
                  }
                });
              }}
              className="w-full p-2 border rounded"
            >
              <option value="basic_http">Basic HTTP</option>
              <option value="bearer">Bearer Token</option>
              <option value="api_token">API Token</option>
            </select>
            {param.fields?.map((field, fieldIndex) => (
              <div key={fieldIndex} className="space-y-1">
                <input
                  type="text"
                  placeholder={`${field.name} Value`}
                  value={field.value}
                  onChange={(e) => {
                    const newSource = [...formData.interface_parameters.section.source];
                    const newFields = [...(param.fields || [])];
                    newFields[fieldIndex] = { ...field, value: e.target.value };
                    newSource[index] = { ...param, fields: newFields };
                    setFormData({
                      ...formData,
                      interface_parameters: {
                        section: {
                          source: newSource
                        }
                      }
                    });
                  }}
                  className="w-full p-2 border rounded"
                />
              </div>
            ))}
          </div>
        )}

        {param.type === 'date_range' && (
          <div className="space-y-2">
            <select
              value={param.period_type}
              onChange={(e) => {
                const newSource = [...formData.interface_parameters.section.source];
                newSource[index] = { ...param, period_type: e.target.value as 'date' | 'datetime' };
                setFormData({
                  ...formData,
                  interface_parameters: {
                    section: {
                      source: newSource
                    }
                  }
                });
              }}
              className="w-full p-2 border rounded"
            >
              <option value="date">Date</option>
              <option value="datetime">DateTime</option>
            </select>
            {param.fields?.map((field, fieldIndex) => (
              <div key={fieldIndex} className="space-y-1">
                <label className="text-sm text-gray-600">{field.name}</label>
                <input
                  type="date"
                  value={field.value}
                  onChange={(e) => {
                    const newSource = [...formData.interface_parameters.section.source];
                    const newFields = [...(param.fields || [])];
                    newFields[fieldIndex] = { ...field, value: e.target.value };
                    newSource[index] = { ...param, fields: newFields };
                    setFormData({
                      ...formData,
                      interface_parameters: {
                        section: {
                          source: newSource
                        }
                      }
                    });
                  }}
                  className="w-full p-2 border rounded"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">YAML Generator</h1>
        <button
          type="button"
          onClick={handleSubmit}
          className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 transition-colors"
        >
          Generate YAML
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <form className="space-y-4">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-medium">Interface Parameters</h3>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => addNewParameter('string')}
                    className="text-sm px-3 py-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
                  >
                    + String
                  </button>
                  <button
                    type="button"
                    onClick={() => addNewParameter('authentication')}
                    className="text-sm px-3 py-1 bg-green-100 text-green-600 rounded hover:bg-green-200"
                  >
                    + Auth
                  </button>
                  <button
                    type="button"
                    onClick={() => addNewParameter('date_range')}
                    className="text-sm px-3 py-1 bg-purple-100 text-purple-600 rounded hover:bg-purple-200"
                  >
                    + Date Range
                  </button>
                </div>
              </div>
              
              {formData.interface_parameters.section.source.map((param, index) => 
                renderParameterFields(param, index)
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Base URL</label>
              <input
                type="text"
                value={formData.connector.base_url}
                onChange={(e) => setFormData({
                  ...formData,
                  connector: {
                    ...formData.connector,
                    base_url: e.target.value
                  }
                })}
                className={`w-full p-2 border rounded ${
                  errors['connector.base_url'] ? 'border-red-500' : ''
                }`}
              />
              {errors['connector.base_url'] && (
                <p className="text-red-500 text-sm mt-1">{errors['connector.base_url']}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Connector Name</label>
              <input
                type="text"
                value={formData.connector.name}
                onChange={(e) => setFormData({
                  ...formData,
                  connector: {
                    ...formData.connector,
                    name: e.target.value
                  }
                })}
                className={`w-full p-2 border rounded ${
                  errors['connector.name'] ? 'border-red-500' : ''
                }`}
              />
              {errors['connector.name'] && (
                <p className="text-red-500 text-sm mt-1">{errors['connector.name']}</p>
              )}
            </div>

            <div className="space-y-4">
              <h3 className="font-medium">Steps</h3>
              {formData.steps.map((step, index) => (
                <div key={index} className="p-4 border rounded space-y-2">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">Step {index + 1}</span>
                    <button
                      type="button"
                      onClick={() => {
                        const newSteps = formData.steps.filter((_, i) => i !== index);
                        setFormData({ ...formData, steps: newSteps });
                      }}
                      className="text-red-500 hover:text-red-600"
                    >
                      Remove Step
                    </button>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-sm text-gray-600">Step Name</label>
                    <p className="text-xs text-gray-500 mb-1">Enter a descriptive name for this API step (e.g., "GetUserData", "UpdateProfile")</p>
                    <input
                      type="text"
                      placeholder="Step Name"
                      value={step.name}
                      onChange={(e) => {
                        const newSteps = [...formData.steps];
                        newSteps[index] = { ...step, name: e.target.value };
                        setFormData({ ...formData, steps: newSteps });
                      }}
                      className="w-full p-2 border rounded"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-sm text-gray-600">Description</label>
                    <p className="text-xs text-gray-500 mb-1">Provide a brief description of what this step does (e.g., "Fetches user profile data from the API")</p>
                    <input
                      type="text"
                      placeholder="Description"
                      value={step.description}
                      onChange={(e) => {
                        const newSteps = [...formData.steps];
                        newSteps[index] = { ...step, description: e.target.value };
                        setFormData({ ...formData, steps: newSteps });
                      }}
                      className="w-full p-2 border rounded"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-sm text-gray-600">Endpoint</label>
                    <p className="text-xs text-gray-500 mb-1">
                      Enter the API endpoint path. Use {{%BASE_URL%}} for the base URL portion 
                      (e.g., "{{%BASE_URL%}}/users" or "{{%BASE_URL%}}/api/v1/data")
                    </p>
                    <input
                      type="text"
                      placeholder="{{%BASE_URL%}}/endpoint"
                      value={step.endpoint}
                      onChange={(e) => {
                        const newSteps = [...formData.steps];
                        newSteps[index] = { ...step, endpoint: e.target.value };
                        setFormData({ ...formData, steps: newSteps });
                      }}
                      className="w-full p-2 border rounded"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-sm text-gray-600">HTTP Method</label>
                    <p className="text-xs text-gray-500 mb-1">Select the HTTP method for this API call</p>
                    <select
                      value={step.http_method}
                      onChange={(e) => {
                        const newSteps = [...formData.steps];
                        newSteps[index] = { ...step, http_method: e.target.value as 'GET' | 'POST' | 'PUT' | 'DELETE' };
                        setFormData({ ...formData, steps: newSteps });
                      }}
                      className="w-full p-2 border rounded"
                    >
                      <option value="GET">GET - Retrieve data</option>
                      <option value="POST">POST - Create new data</option>
                      <option value="PUT">PUT - Update existing data</option>
                      <option value="DELETE">DELETE - Remove data</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-sm text-gray-600">Variables Output</label>
                    <p className="text-xs text-gray-500 mb-1">Configure how the API response should be stored</p>
                    {step.variables_output.map((variable, varIndex) => (
                      <div key={varIndex} className="space-y-2 p-2 bg-gray-50 rounded">
                        <div className="space-y-1">
                          <label className="block text-sm text-gray-600">Variable Name</label>
                          <p className="text-xs text-gray-500 mb-1">Name for storing the response (e.g., "user_data", "api_response")</p>
                          <input
                            type="text"
                            placeholder="Variable Name"
                            value={variable.variable_name}
                            onChange={(e) => {
                              const newSteps = [...formData.steps];
                              const newVars = [...step.variables_output];
                              newVars[varIndex] = { ...variable, variable_name: e.target.value };
                              newSteps[index] = { ...step, variables_output: newVars };
                              setFormData({ ...formData, steps: newSteps });
                            }}
                            className="w-full p-2 border rounded"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="block text-sm text-gray-600">Response Location</label>
                          <p className="text-xs text-gray-500 mb-1">Specify where in the response to find the data (e.g., "data", "results", "items")</p>
                          <input
                            type="text"
                            placeholder="Response Location"
                            value={variable.response_location}
                            onChange={(e) => {
                              const newSteps = [...formData.steps];
                              const newVars = [...step.variables_output];
                              newVars[varIndex] = { ...variable, response_location: e.target.value };
                              newSteps[index] = { ...step, variables_output: newVars };
                              setFormData({ ...formData, steps: newSteps });
                            }}
                            className="w-full p-2 border rounded"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="block text-sm text-gray-600">Variable Format</label>
                          <p className="text-xs text-gray-500 mb-1">Format of the response data (usually "json")</p>
                          <input
                            type="text"
                            placeholder="Variable Format"
                            value={variable.variable_format}
                            onChange={(e) => {
                              const newSteps = [...formData.steps];
                              const newVars = [...step.variables_output];
                              newVars[varIndex] = { ...variable, variable_format: e.target.value };
                              newSteps[index] = { ...step, variables_output: newVars };
                              setFormData({ ...formData, steps: newSteps });
                            }}
                            className="w-full p-2 border rounded"
                          />
                        </div>

                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={variable.overwrite_storage}
                            onChange={(e) => {
                              const newSteps = [...formData.steps];
                              const newVars = [...step.variables_output];
                              newVars[varIndex] = { ...variable, overwrite_storage: e.target.checked };
                              newSteps[index] = { ...step, variables_output: newVars };
                              setFormData({ ...formData, steps: newSteps });
                            }}
                            className="rounded border-gray-300"
                          />
                          <div>
                            <label className="block text-sm text-gray-600">Overwrite Storage</label>
                            <p className="text-xs text-gray-500">Check to overwrite existing data in storage</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={() => setFormData({
                  ...formData,
                  steps: [...formData.steps, {
                    name: '',
                    description: '',
                    endpoint: '',
                    http_method: 'GET',
                    type: 'rest',
                    variables_output: [{
                      variable_name: 'final_output_file',
                      response_location: 'data',
                      variable_format: 'json',
                      overwrite_storage: true
                    }]
                  }]
                })}
                className="text-blue-500 hover:text-blue-600"
              >
                + Add Step
              </button>
            </div>
          </form>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="border-b p-4 flex justify-between items-center">
            <h2 className="text-xl font-semibold">Preview</h2>
            <div className="flex gap-2">
              {yamlPreview && (
                <>
                  <button
                    onClick={copyYaml}
                    className="p-2 hover:bg-gray-100 rounded transition-colors"
                    title="Copy to clipboard"
                  >
                    <Copy className="w-5 h-5 text-gray-600" />
                  </button>
                  <button
                    onClick={downloadYaml}
                    className="p-2 hover:bg-gray-100 rounded transition-colors"
                    title="Download YAML"
                  >
                    <Download className="w-5 h-5 text-gray-600" />
                  </button>
                </>
              )}
            </div>
          </div>
          <pre className="p-4 overflow-auto max-h-[600px] bg-white">
            <code className="text-gray-800">{yamlPreview || 'Generated YAML will appear here'}</code>
          </pre>
        </div>
      </div>
    </div>
  );
};