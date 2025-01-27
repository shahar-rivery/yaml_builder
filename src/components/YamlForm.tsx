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

const BASE_URL = import.meta.env.VITE_BASE_URL; // Use Vite's way to access environment variables

export const YamlForm: React.FC = () => {
  const [formData, setFormData] = useState<YamlFormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [yamlPreview, setYamlPreview] = useState<string>('');
  const [isInterfaceParamsOpen, setInterfaceParamsOpen] = useState(true);
  const [isConnectorOpen, setConnectorOpen] = useState(true);
  const [isStepsOpen, setStepsOpen] = useState(true);

  const validateForm = (): boolean => {
    // Removed validation logic to allow YAML generation
    return true; // Always return true to bypass validation
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Removed validation check
    try {
      const orderedData = {
        interface_parameters: formData.interface_parameters,
        connector: {
          base_url: formData.connector.base_url,
          default_headers: formData.connector.default_headers,
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

  const handleAddStep = () => {
    const newStep = {
      id: Date.now(),
      name: '',
      description: '',
      endpoint: '{{%BASE_URL%}}/',
      http_method: 'GET',
      type: 'rest',
      variables_output: []
    };

    setFormData((prevData) => ({
      ...prevData,
      steps: [...prevData.steps, newStep],
    }));
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
          
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                {/* <h3 className="font-medium">Interface Parameters</h3> */}
              </div>
              
              {/* Collapsible Interface Parameters Section */}
              <div className="border p-4 rounded">
                <h3 className="flex items-center cursor-pointer" onClick={() => setInterfaceParamsOpen(!isInterfaceParamsOpen)}>
                  <span className="mr-2">{isInterfaceParamsOpen ? '▼' : '►'}</span>
                  <span>Interface Parameters</span>
                </h3>
                {isInterfaceParamsOpen && (
                  <div className="border p-4 rounded space-y-4 mt-4">
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
                    {formData.interface_parameters.section.source.map((param, index) => 
                      renderParameterFields(param as SourceParameter, index)
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Collapsible Connector Section */}
            <div className="border p-4 rounded">
              <h2 className="flex items-center cursor-pointer" onClick={() => setConnectorOpen(!isConnectorOpen)}>
                <span className="mr-2">{isConnectorOpen ? '▼' : '►'}</span>
                <span>Connector</span>
              </h2>
              {isConnectorOpen && (
                <div className="border p-4 rounded space-y-4 mt-4">
                  <div>
                    <label className="block mb-2">Base URL</label>
                    <input
                      type="text"
                      value={formData.connector.base_url}
                      onChange={(e) => setFormData({ ...formData, connector: { ...formData.connector, base_url: e.target.value } })}
                      className="border rounded p-2 w-full"
                    />
                  </div>

                  {/* Variables Section */}
                  <div className="space-y-4">
                    <h3 className="font-medium">Variables</h3>
                    {Object.entries(formData.connector.variables_metadata).map(([varName, value], index) => (
                      <div key={index} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={varName}
                          onChange={(e) => {
                            const newVariables: Record<string, { format: string; storage_name: string }> = { ...formData.connector.variables_metadata };
                            const oldValue = newVariables[varName];
                            delete newVariables[varName];
                            newVariables[e.target.value] = oldValue;
                            setFormData({
                              ...formData,
                              connector: {
                                ...formData.connector,
                                variables_metadata: {
                                  ...newVariables,
                                  final_output_file: {
                                    format: 'json',
                                    storage_name: 'results dir'
                                  }
                                }
                              }
                            });
                          }}
                          placeholder="Variable Name"
                          className="border rounded p-2 flex-grow"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const newVariables = { ...formData.connector.variables_metadata };
                            delete newVariables[varName];
                            setFormData({
                              ...formData,
                              connector: {
                                ...formData.connector,
                                variables_metadata: newVariables
                              }
                            });
                          }}
                          className="text-red-500 hover:text-red-600"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        const newVariables = {
                          ...formData.connector.variables_metadata,
                          [`variable_${Object.keys(formData.connector.variables_metadata).length + 1}`]: {
                            format: 'json',
                            storage_name: 'results dir'
                          }
                        };
                        setFormData({
                          ...formData,
                          connector: {
                            ...formData.connector,
                            variables_metadata: newVariables
                          }
                        });
                      }}
                      className="bg-blue-100 text-blue-600 px-4 py-2 rounded hover:bg-blue-200"
                    >
                      + Add Variable
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Collapsible Steps Section */}
            <div className="border p-4 rounded">
              <h3 className="flex items-center cursor-pointer" onClick={() => setStepsOpen(!isStepsOpen)}>
                <span className="mr-2">{isStepsOpen ? '▼' : '►'}</span>
                <span>Steps</span>
              </h3>
              {isStepsOpen && (
                <div className="border p-4 rounded space-y-4 mt-4">
                  {formData.steps.map((step, index) => (
                    <div key={index} className="p-4 rounded space-y-2">
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
                      <div className="space-y-4">
                        <div>
                          <label className="block mb-2">Step Name</label>
                          <input
                            type="text"
                            value={step.name}
                            onChange={(e) => {
                              const newSteps = [...formData.steps];
                              newSteps[index] = { ...step, name: e.target.value };
                              setFormData({ ...formData, steps: newSteps });
                            }}
                            className="border rounded p-2 w-full"
                            placeholder="Enter step name"
                          />
                        </div>
                        <div>
                          <label className="block mb-2">Description</label>
                          <input
                            type="text"
                            value={step.description}
                            onChange={(e) => {
                              const newSteps = [...formData.steps];
                              newSteps[index] = { ...step, description: e.target.value };
                              setFormData({ ...formData, steps: newSteps });
                            }}
                            className="border rounded p-2 w-full"
                            placeholder="Enter step description"
                          />
                        </div>
                        <div>
                          <label className="block mb-2">Method</label>
                          <input
                            type="text"
                            value={step.http_method}
                            onChange={(e) => {
                              const newSteps = [...formData.steps];
                              newSteps[index] = { ...step, http_method: e.target.value as 'GET' | 'POST' | 'PUT' | 'DELETE' };
                              setFormData({ ...formData, steps: newSteps });
                            }}
                            className="border rounded p-2 w-full"
                            placeholder="Enter HTTP method"
                          />
                        </div>
                        <div>
                          <label className="block mb-2">Path</label>
                          <input
                            type="text"
                            value={step.endpoint}
                            onChange={(e) => {
                              const newSteps = [...formData.steps];
                              newSteps[index] = { ...step, endpoint: e.target.value };
                              setFormData({ ...formData, steps: newSteps });
                            }}
                            className="border rounded p-2 w-full"
                            placeholder="Enter endpoint path"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      const newStep = {
                        id: Date.now(),
                        name: '',
                        description: '',
                        endpoint: '{{%BASE_URL%}}/',
                        http_method: 'GET',
                        type: 'rest',
                        variables_output: []
                      };
                      setFormData({
                        ...formData,
                        steps: [...formData.steps, newStep],
                      });
                    }}
                    className="bg-green-100 text-green-600 px-4 py-2 rounded hover:bg-green-200"
                  >
                    + Add Step
                  </button>
                </div>
              )}
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