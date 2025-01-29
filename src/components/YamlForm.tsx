import React, { useState, useEffect } from 'react';
import { z } from 'zod';
import yaml from 'js-yaml';
import { Copy, Download } from 'lucide-react';
import { YamlConfig, Step, InterfaceParameter, VariableMetadata } from '../types/yaml';
import StepForm from './StepForm';
import { InterfaceParametersForm } from './InterfaceParametersForm';
import { VariablesMetadataForm } from './VariablesMetadataForm';

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
    // name: z.string().min(1, 'Name is required'),
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
      ),
      pagination: z.string().optional()
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
    default_headers: {},
    default_retry_strategy: {},
    // name: '',
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
    }],
    pagination: undefined
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

interface Step {
  name: string;
  description: string;
  command: string;
  method: string;
  endpoint: string;
  interface_parameters: SourceParameter[];
  variables_output: z.infer<typeof formSchema.shape.variables_output>;
  pagination?: string;
}

const initialStep: Step = {
  name: '',
  description: '',
  command: '',
  method: '',
  endpoint: '',
  interface_parameters: [],
  variables_output: [],
  pagination: undefined
};

const initialConnectorConfig = {
  base_url: '',
  default_headers: {}, // Connection block will inject automatically
  default_retry_strategy: {},
  name: '',
  variables_metadata: {},
  variables_storages: [{
    name: 'results dir',
    path: '/storage/file_system',
    type: 'file_system'
  }]
};

export function YamlForm() {
  const [config, setConfig] = useState<YamlConfig>({
    connector: initialConnectorConfig,
    steps: []
  });
  const [generatedYaml, setGeneratedYaml] = useState<string>('');
  const [isConnectorExpanded, setIsConnectorExpanded] = useState(false);
  const [isStepsExpanded, setIsStepsExpanded] = useState(false);
  const [interfaceParameters, setInterfaceParameters] = useState<InterfaceParameter[]>([]);

  const handleConnectorChange = (field: string, value: any) => {
    console.log('Connector change:', { field, value });
    setConfig(prev => ({
      ...prev,
      connector: {
        ...prev.connector,
        [field]: value
      }
    }));
  };

  const handleAddStep = () => {
    const newStep: Step = {
      name: '',
      description: '',
      type: 'rest',
      method: 'GET',
      endpoint: '',
      interface_parameters: [],
      variables_output: []
    };
    console.log('Adding new step with interface_parameters:', newStep);
    setConfig(prev => ({
      ...prev,
      steps: [...prev.steps, newStep]
    }));
  };

  const handleStepChange = (index: number, field: string, value: any) => {
    console.log('Step change:', { index, field, value });
    setConfig(prev => {
      const newSteps = [...prev.steps];
      if (field === 'interface_parameters') {
        console.log('Updating interface parameters:', value);
      }
      newSteps[index] = {
        ...newSteps[index],
        [field]: value,
        // Ensure interface_parameters exists when type is 'rest'
        interface_parameters: field === 'type' 
          ? (value === 'rest' ? [] : undefined)
          : newSteps[index].interface_parameters
      };
      console.log('Updated step:', newSteps[index]);
      return {
        ...prev,
        steps: newSteps
      };
    });
  };

  const handleDeleteStep = (index: number) => {
    setConfig(prev => ({
      ...prev,
      steps: prev.steps.filter((_, idx) => idx !== index)
    }));
  };

  const generateYaml = () => {
    const cleanConfig = {
      interface_parameters: {
        section: {
          source: interfaceParameters.map(param => {
            const cleanParam: any = {
              name: param.name,
              type: param.type
            };

            if (param.value) {
              cleanParam.value = param.value;
            }

            if (param.type === 'authentication') {
              cleanParam.auth_type = param.auth_type;
              if (param.fields?.length > 0) {
                cleanParam.fields = param.fields;
              }
            }

            if (param.type === 'date_range') {
              cleanParam.period_type = param.period_type;
              cleanParam.format = param.format;
              if (param.fields?.length > 0) {
                cleanParam.fields = param.fields;
              }
            }

            return cleanParam;
          })
        }
      },
      connector: {
        ...config.connector,
        default_headers: {},
        name: config.connector.name || 'default',
        base_url: config.connector.base_url || '',
        default_retry_strategy: config.connector.default_retry_strategy || {},
        variables_metadata: config.connector.variables_metadata || {},
        variables_storages: config.connector.variables_storages || [{
          name: 'results dir',
          path: '/storage/file_system',
          type: 'file_system'
        }]
      },
      steps: config.steps.map(step => {
        console.log('Processing step:', step);
        const cleanStep: any = {
          name: step.name || '',
          description: step.description || '',
          type: step.type || 'rest'
        };

        if (step.type === 'rest') {
          cleanStep.method = step.method || 'GET';
          cleanStep.endpoint = step.endpoint || '';

          if (Array.isArray(step.interface_parameters) && step.interface_parameters.length > 0) {
            cleanStep.interface_parameters = step.interface_parameters
              .filter(param => param && param.name && param.type)
              .map(param => ({
                name: param.name,
                type: param.type,
                required: Boolean(param.required),
                ...(param.default !== undefined && param.default !== '' ? { default: param.default } : {})
              }));
          }

          if (step.pagination) {
            cleanStep.pagination = {
              type: step.pagination.type,
              location: step.pagination.location,
              parameters: step.pagination.parameters,
              break_conditions: step.pagination.break_conditions
            };
          }

          if (Array.isArray(step.variables_output) && step.variables_output.length > 0) {
            cleanStep.variables_output = step.variables_output
              .filter(output => output && (output.response_location || output.variable_name))
              .map(output => ({
                response_location: output.response_location,
                variable_name: output.variable_name,
                variable_format: output.variable_format,
                ...(output.transformation_layers && output.transformation_layers.length > 0
                  ? {
                      transformation_layers: output.transformation_layers.map(layer => ({
                        type: layer.type,
                        from_type: layer.from_type,
                        ...(layer.type === 'extract_json' ? { json_path: layer.json_path } : {})
                      }))
                    }
                  : {})
              }));
          }
        }

        return cleanStep;
      })
    };

    try {
      let yamlString = yaml.dump(cleanConfig, {
        indent: 2,
        lineWidth: -1,
        noRefs: true,
        sortKeys: false
      });

      yamlString = yamlString.replace(
        'default_headers: {}',
        'default_headers: {} #Connection block will inject automatically'
      );

      console.log('Generated YAML:', yamlString);
      return yamlString;
    } catch (error) {
      console.error('Error generating YAML:', error);
      return 'Error generating YAML';
    }
  };

  useEffect(() => {
    console.log('Config changed, regenerating YAML');
    const newYaml = generateYaml();
    setGeneratedYaml(newYaml);
  }, [config, interfaceParameters]);

  const [formData, setFormData] = useState<YamlFormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [yamlPreview, setYamlPreview] = useState<string>('');
  const [isInterfaceParamsOpen, setInterfaceParamsOpen] = useState(false);
  const [isConnectorOpen, setConnectorOpen] = useState(false);
  const [isStepsOpen, setStepsOpen] = useState(false);

  const validateForm = (): boolean => {
    // Removed validation logic to allow YAML generation
    return true; // Always return true to bypass validation
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let yamlString = yaml.dump(formData, {
        indent: 2,
        lineWidth: -1,
        noRefs: true
      });

      // Add the comment after default_headers
      yamlString = yamlString.replace(
        'default_headers: {}',
        'default_headers: {} #Connection block will inject automatically'
      );

      setYamlPreview(yamlString);
    } catch (error) {
      console.error('Error generating YAML:', error);
      setYamlPreview('Error generating YAML');
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

  const handleVariablesMetadataChange = (newVariables: Record<string, VariableMetadata>) => {
    setConfig(prev => ({
      ...prev,
      connector: {
        ...prev.connector,
        variables_metadata: newVariables
      }
    }));
  };

  return (
    <div className="flex justify-center w-full p-4">
      <div className="flex flex-col lg:flex-row gap-8 w-full max-w-[1600px]">
        {/* Form Section */}
        <div className="lg:w-1/2">
          <div className="space-y-6">
            {/* Interface Parameters */}
            <InterfaceParametersForm
              parameters={interfaceParameters}
              onChange={setInterfaceParameters}
            />

            {/* Connector Configuration */}
            <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
              <button
                onClick={() => setIsConnectorExpanded(!isConnectorExpanded)}
                className="w-full p-4 bg-gray-50 flex justify-between items-center hover:bg-gray-100"
              >
                <h2 className="text-lg font-semibold">Connector Configuration</h2>
                <span>{isConnectorExpanded ? '▼' : '▶'}</span>
              </button>
              {isConnectorExpanded && (
                <div className="p-4">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                      <input
                        type="text"
                        value={config.connector.name}
                        onChange={(e) => handleConnectorChange('name', e.target.value)}
                        className="w-full p-2 border rounded"
                        placeholder="Connector Name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Base URL</label>
                      <input
                        type="text"
                        value={config.connector.base_url}
                        onChange={(e) => handleConnectorChange('base_url', e.target.value)}
                        className="w-full p-2 border rounded"
                        placeholder="Base URL"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Variables Metadata</label>
                      <VariablesMetadataForm
                        variables={config.connector.variables_metadata}
                        onChange={handleVariablesMetadataChange}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Steps Configuration */}
            <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
              <button
                onClick={() => setIsStepsExpanded(!isStepsExpanded)}
                className="w-full p-4 bg-gray-50 flex justify-between items-center hover:bg-gray-100"
              >
                <h2 className="text-lg font-semibold">Workflow Steps</h2>
                <span>{isStepsExpanded ? '▼' : '▶'}</span>
              </button>
              {isStepsExpanded && (
                <div className="p-4">
                  {config.steps.map((step, index) => (
                    <StepForm
                      key={index}
                      step={step}
                      index={index}
                      onStepChange={handleStepChange}
                      onDeleteStep={handleDeleteStep}
                    />
                  ))}
                  <button
                    type="button"
                    onClick={handleAddStep}
                    className="mt-4 px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 w-full"
                  >
                    Add Step
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* YAML Output Section */}
        <div className="lg:w-1/2">
          <div className="sticky top-4">
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <h2 className="text-lg font-semibold mb-4">Generated YAML</h2>
              <pre className="bg-white border rounded-lg p-4 overflow-auto max-h-[80vh] whitespace-pre-wrap font-mono text-sm">
                {generatedYaml || 'No YAML generated yet'}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}