import React, { useState } from 'react';
import { Step, Pagination } from '../types/yaml';

interface TransformationLayer {
  type: string;
  json_path?: string;
  from_type?: string;
}

interface VariableOutput {
  response_location: string;
  variable_name: string;
  variable_format: string;
  transformation_layers?: TransformationLayer[];
}

interface Loop {
  type: string;
  variable_name: string;
  item_name: string;
  steps: Step[];
}

interface Step {
  name: string;
  description: string;
  endpoint?: string;
  method?: string;
  type: 'rest' | 'loop';
  variables_output?: VariableOutput[];
  loop?: Loop;
  steps?: Step[];
  interface_parameters?: InterfaceParameter[];
  pagination?: Pagination;
}

interface InterfaceParameter {
  name: string;
  value: string;
  location: string;
}

interface PaginationCondition {
  type: 'empty_property' | 'string_equal' | 'json_items_result_count';
  value?: any;
}

interface BreakCondition {
  condition: PaginationCondition;
  name: string;
  variable: string;
}

interface PaginationParameter {
  name: string;
  token_format?: string;
  token_location?: string;
  token_path?: string;
  value?: number;
  increment_by?: number;
}

interface Pagination {
  type: 'cursor' | 'offset' | 'page';
  location: string;
  parameters: PaginationParameter[];
  break_conditions: BreakCondition[];
}

interface StepFormProps {
  step: Step;
  index: number;
  onStepChange: (index: number, field: string, value: any) => void;
  onDeleteStep: (index: number) => void;
  isNested?: boolean;
}

function StepForm({ step, index, onStepChange, onDeleteStep, isNested = false }: StepFormProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVariablesOutputExpanded, setIsVariablesOutputExpanded] = useState(false);
  const [isPaginationExpanded, setIsPaginationExpanded] = useState(false);

  console.log('StepForm rendered', { step, index });

  const handleVariableOutputChange = (outputIndex: number, field: string, value: any) => {
    const newOutputs = [...(step.variables_output || [])];
    newOutputs[outputIndex] = { ...newOutputs[outputIndex], [field]: value };
    onStepChange(index, 'variables_output', newOutputs);
  };

  const handleTransformationLayerChange = (
    outputIndex: number,
    layerIndex: number,
    field: string,
    value: any
  ) => {
    const newOutputs = [...(step.variables_output || [])];
    const newLayers = [...(newOutputs[outputIndex].transformation_layers || [])];
    newLayers[layerIndex] = { ...newLayers[layerIndex], [field]: value };
    newOutputs[outputIndex] = {
      ...newOutputs[outputIndex],
      transformation_layers: newLayers
    };
    onStepChange(index, 'variables_output', newOutputs);
  };

  const handleAddInterfaceParameter = () => {
    console.log('Adding new interface parameter');
    const currentParams = Array.isArray(step.interface_parameters) ? step.interface_parameters : [];
    const newParams = [
      ...currentParams,
      {
        name: '',
        type: 'string',
        required: false,
        default: ''
      }
    ];
    onStepChange(index, 'interface_parameters', newParams);
  };

  const handleInterfaceParameterChange = (paramIndex: number, field: string, value: any) => {
    console.log('Changing interface parameter:', { paramIndex, field, value });
    const currentParams = Array.isArray(step.interface_parameters) ? step.interface_parameters : [];
    const newParams = [...currentParams];
    newParams[paramIndex] = {
      ...newParams[paramIndex],
      [field]: value
    };
    onStepChange(index, 'interface_parameters', newParams);
  };

  const handleDeleteInterfaceParameter = (paramIndex: number) => {
    const newParams = (step.interface_parameters || []).filter((_, idx) => idx !== paramIndex);
    onStepChange(index, 'interface_parameters', newParams);
  };

  return (
    <div className="mb-6 border rounded-lg overflow-hidden bg-white">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 bg-gray-50 flex justify-between items-center hover:bg-gray-100"
      >
        <h3 className="font-medium">Step {index + 1}: {step.name || 'Unnamed Step'}</h3>
        <span>{isExpanded ? '▼' : '▶'}</span>
      </button>

      {isExpanded && (
        <div className="p-4">
          {/* Basic Fields */}
          <div className="space-y-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                value={step.name || ''}
                onChange={(e) => onStepChange(index, 'name', e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="Enter step name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <input
                type="text"
                value={step.description || ''}
                onChange={(e) => onStepChange(index, 'description', e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="Enter step description"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                value={step.type || 'rest'}
                onChange={(e) => onStepChange(index, 'type', e.target.value)}
                className="w-full p-2 border rounded bg-white"
              >
                <option value="rest">REST</option>
                <option value="loop">Loop</option>
              </select>
            </div>
          </div>

          {step.type === 'rest' && (
            <>
              {/* REST-specific fields */}
              <div className="space-y-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Method</label>
                  <select
                    value={step.method || 'GET'}
                    onChange={(e) => onStepChange(index, 'method', e.target.value)}
                    className="w-full p-2 border rounded bg-white"
                  >
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                    <option value="PUT">PUT</option>
                    <option value="DELETE">DELETE</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Endpoint</label>
                  <input
                    type="text"
                    value={step.endpoint || ''}
                    onChange={(e) => onStepChange(index, 'endpoint', e.target.value)}
                    className="w-full p-2 border rounded"
                    placeholder="Enter endpoint"
                  />
                </div>
              </div>

              {/* Variables Output Section */}
              <div className="mb-4 border rounded-lg overflow-hidden">
                <button
                  onClick={() => setIsVariablesOutputExpanded(!isVariablesOutputExpanded)}
                  className="w-full p-2 bg-gray-50 flex justify-between items-center hover:bg-gray-100"
                >
                  <span className="text-sm font-medium">Variables Output</span>
                  <span>{isVariablesOutputExpanded ? '▼' : '▶'}</span>
                </button>
                {isVariablesOutputExpanded && (
                  <div className="p-4">
                    {(step.variables_output || []).map((output, outputIndex) => (
                      <div key={outputIndex} className="mb-4 p-4 border rounded bg-gray-50">
                        <input
                          type="text"
                          value={output.response_location}
                          onChange={(e) => handleVariableOutputChange(outputIndex, 'response_location', e.target.value)}
                          className="w-full p-2 border rounded mb-2"
                          placeholder="Response Location (e.g., data)"
                        />
                        <input
                          type="text"
                          value={output.variable_name}
                          onChange={(e) => handleVariableOutputChange(outputIndex, 'variable_name', e.target.value)}
                          className="w-full p-2 border rounded mb-2"
                          placeholder="Variable Name"
                        />
                        <select
                          value={output.variable_format}
                          onChange={(e) => handleVariableOutputChange(outputIndex, 'variable_format', e.target.value)}
                          className="w-full p-2 border rounded mb-2"
                        >
                          <option value="json">JSON</option>
                          <option value="text">Text</option>
                        </select>

                        {/* Transformation Layers */}
                        <div className="mt-4">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Transformation Layers
                          </label>
                          {(output.transformation_layers || []).map((layer, layerIndex) => (
                            <div key={layerIndex} className="mb-2 p-2 border rounded bg-white">
                              <select
                                value={layer.type}
                                onChange={(e) => handleTransformationLayerChange(
                                  outputIndex,
                                  layerIndex,
                                  'type',
                                  e.target.value
                                )}
                                className="w-full p-2 border rounded mb-2"
                              >
                                <option value="extract_json">Extract JSON</option>
                                <option value="transform">Transform</option>
                              </select>
                              {layer.type === 'extract_json' && (
                                <input
                                  type="text"
                                  value={layer.json_path}
                                  onChange={(e) => handleTransformationLayerChange(
                                    outputIndex,
                                    layerIndex,
                                    'json_path',
                                    e.target.value
                                  )}
                                  className="w-full p-2 border rounded mb-2"
                                  placeholder="JSON Path (e.g., $.results[*].id)"
                                />
                              )}
                              <select
                                value={layer.from_type}
                                onChange={(e) => handleTransformationLayerChange(
                                  outputIndex,
                                  layerIndex,
                                  'from_type',
                                  e.target.value
                                )}
                                className="w-full p-2 border rounded"
                              >
                                <option value="json">JSON</option>
                                <option value="text">Text</option>
                              </select>
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() => {
                              const newLayers = [
                                ...(output.transformation_layers || []),
                                { type: 'extract_json', from_type: 'json' }
                              ];
                              handleVariableOutputChange(outputIndex, 'transformation_layers', newLayers);
                            }}
                            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                          >
                            Add Transformation Layer
                          </button>
                        </div>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        const newOutputs = [
                          ...(step.variables_output || []),
                          {
                            response_location: '',
                            variable_name: '',
                            variable_format: 'json',
                            transformation_layers: []
                          }
                        ];
                        onStepChange(index, 'variables_output', newOutputs);
                      }}
                      className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      Add Variable Output
                    </button>
                  </div>
                )}
              </div>

              {/* Pagination Section */}
              <div className="mb-4 border rounded-lg overflow-hidden">
                <button
                  onClick={() => setIsPaginationExpanded(!isPaginationExpanded)}
                  className="w-full p-2 bg-gray-50 flex justify-between items-center hover:bg-gray-100"
                >
                  <span className="text-sm font-medium">Pagination</span>
                  <span>{isPaginationExpanded ? '▼' : '▶'}</span>
                </button>
                {isPaginationExpanded && (
                  <div className="p-4">
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Pagination</label>
                      <select
                        value={step.pagination?.type || ''}
                        onChange={(e) => {
                          const type = e.target.value as 'cursor' | 'offset' | 'page' | '';
                          if (!type) {
                            onStepChange(index, 'pagination', undefined);
                          } else {
                            onStepChange(index, 'pagination', {
                              type,
                              location: 'qs',
                              parameters: [],
                              break_conditions: []
                            });
                          }
                        }}
                        className="w-full p-2 border rounded bg-white"
                      >
                        <option value="">No Pagination</option>
                        <option value="cursor">Cursor-based</option>
                        <option value="offset">Offset-based</option>
                        <option value="page">Page-based</option>
                      </select>
                    </div>

                    {step.pagination && (
                      <div className="mt-4 p-4 border rounded bg-gray-50">
                        <div className="mb-4">
                          <label className="block text-sm text-gray-600 mb-1">Location</label>
                          <select
                            value={step.pagination.location}
                            onChange={(e) => {
                              onStepChange(index, 'pagination', {
                                ...step.pagination!,
                                location: e.target.value
                              });
                            }}
                            className="w-full p-2 border rounded bg-white"
                          >
                            <option value="qs">Query String</option>
                            <option value="header">Header</option>
                            <option value="body">Body</option>
                          </select>
                        </div>

                        {/* Parameters */}
                        <div className="mb-4">
                          <label className="block text-sm text-gray-600 mb-1">Parameters</label>
                          {step.pagination.parameters.map((param, paramIndex) => (
                            <div key={paramIndex} className="mb-4 p-4 border rounded bg-white">
                              <input
                                type="text"
                                value={param.name}
                                onChange={(e) => {
                                  const newParams = [...step.pagination!.parameters];
                                  newParams[paramIndex] = { ...param, name: e.target.value };
                                  onStepChange(index, 'pagination', {
                                    ...step.pagination!,
                                    parameters: newParams
                                  });
                                }}
                                className="w-full p-2 border rounded mb-2"
                                placeholder="Parameter name"
                              />
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() => {
                              const newParams = [...step.pagination!.parameters, { name: '' }];
                              onStepChange(index, 'pagination', {
                                ...step.pagination!,
                                parameters: newParams
                              });
                            }}
                            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                          >
                            Add Parameter
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          )}

          {/* Loop-specific fields */}
          {step.type === 'loop' && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Loop Configuration</label>
              <div className="p-4 border rounded bg-gray-50">
                <input
                  type="text"
                  value={step.loop?.variable_name || ''}
                  onChange={(e) => {
                    const newLoop = { ...(step.loop || { type: 'data', steps: [] }), variable_name: e.target.value };
                    onStepChange(index, 'loop', newLoop);
                  }}
                  className="w-full p-2 border rounded mb-2"
                  placeholder="Variable to Loop Over"
                />
                <input
                  type="text"
                  value={step.loop?.item_name || ''}
                  onChange={(e) => {
                    const newLoop = { ...(step.loop || { type: 'data', steps: [] }), item_name: e.target.value };
                    onStepChange(index, 'loop', newLoop);
                  }}
                  className="w-full p-2 border rounded"
                  placeholder="Item Variable Name"
                />
              </div>
            </div>
          )}

          {/* Delete Button */}
          <button
            type="button"
            onClick={() => onDeleteStep(index)}
            className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Delete Step
          </button>
        </div>
      )}
    </div>
  );
}

export default StepForm; 