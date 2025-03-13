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
  request?: {
    method?: string;
    url?: string;
  };
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
  steps: Step[];
  onChange: (steps: Step[]) => void;
}

export function StepForm({ steps = [], onChange }: StepFormProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleAddStep = () => {
    const newStep: Step = {
      name: '',
      request: {
        method: 'GET',
        url: ''
      }
    };
    onChange([...steps, newStep]);
  };

  const handleStepChange = (index: number, updatedStep: Step) => {
    const newSteps = [...steps];
    newSteps[index] = updatedStep;
    onChange(newSteps);
  };

  const handleRemoveStep = (index: number) => {
    const newSteps = [...steps];
    newSteps.splice(index, 1);
    onChange(newSteps);
  };

  return (
    <div className="form-card">
      <div className="form-header">
        <div className="flex items-center space-x-2">
          <h2>Workflow Steps</h2>
          {steps.length > 0 && (
            <span className="badge badge-blue">
              {steps.length}
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
          {steps.length === 0 ? (
            <div className="text-center py-3">
              <p className="text-sm text-neutral-500">No steps added yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {steps.map((step, index) => (
                <div key={index} className="step-card">
                  <div className="step-header">
                    <span className="text-xs font-medium text-neutral-700">Step {index + 1}</span>
                    <button
                      onClick={() => handleRemoveStep(index)}
                      className="remove-button btn btn-icon btn-ghost text-neutral-400 hover:text-red-500"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  <div className="step-content space-y-3">
                    <div>
                      <label className="form-label">Name</label>
                      <span className="form-description">Unique identifier for this step</span>
                      <input
                        type="text"
                        value={step.name}
                        onChange={(e) => handleStepChange(index, { ...step, name: e.target.value })}
                        className="form-input"
                        placeholder="Step name"
                      />
                    </div>

                    <div>
                      <label className="form-label">Method</label>
                      <span className="form-description">HTTP method for this request</span>
                      <select
                        value={step.request.method}
                        onChange={(e) => handleStepChange(index, {
                          ...step,
                          request: { ...step.request, method: e.target.value }
                        })}
                        className="form-select"
                      >
                        <option value="GET">GET</option>
                        <option value="POST">POST</option>
                        <option value="PUT">PUT</option>
                        <option value="DELETE">DELETE</option>
                      </select>
                    </div>

                    <div>
                      <label className="form-label">Endpoint</label>
                      <span className="form-description">The endpoint for this request</span>
                      <input
                        type="text"
                        value={step.endpoint}
                        onChange={(e) => handleStepChange(index, { ...step, endpoint: e.target.value })}
                        className="form-input"
                        placeholder="Enter endpoint"
                      />
                    </div>

                    <div>
                      <label className="form-label">Description</label>
                      <span className="form-description">A brief description of this step</span>
                      <input
                        type="text"
                        value={step.description}
                        onChange={(e) => handleStepChange(index, { ...step, description: e.target.value })}
                        className="form-input"
                        placeholder="Enter step description"
                      />
                    </div>

                    <div>
                      <label className="form-label">Type</label>
                      <span className="form-description">The type of this step</span>
                      <select
                        value={step.type}
                        onChange={(e) => handleStepChange(index, { ...step, type: e.target.value as 'rest' | 'loop' })}
                        className="form-select"
                      >
                        <option value="rest">REST</option>
                        <option value="loop">Loop</option>
                      </select>
                    </div>

                    {step.type === 'rest' && (
                      <>
                        <div>
                          <label className="form-label">Variables Output</label>
                          <span className="form-description">Variables output from this step</span>
                          <select
                            value={step.variables_output?.length ? step.variables_output[0].response_location : ''}
                            onChange={(e) => {
                              const newOutputs = [...(step.variables_output || []), { response_location: e.target.value, variable_name: '', variable_format: 'json', transformation_layers: [] }];
                              handleStepChange(index, { ...step, variables_output: newOutputs });
                            }}
                            className="form-select"
                          >
                            <option value="">No Variables Output</option>
                            {step.variables_output?.map((output, outputIndex) => (
                              <option key={outputIndex} value={output.response_location}>
                                {output.response_location}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="form-label">Variable Name</label>
                          <span className="form-description">The name of the variable output</span>
                          <input
                            type="text"
                            value={step.variables_output?.length ? step.variables_output[0].variable_name : ''}
                            onChange={(e) => {
                              const newOutputs = [...(step.variables_output || []), { response_location: '', variable_name: e.target.value, variable_format: 'json', transformation_layers: [] }];
                              handleStepChange(index, { ...step, variables_output: newOutputs });
                            }}
                            className="form-input"
                            placeholder="Enter variable name"
                          />
                        </div>

                        <div>
                          <label className="form-label">Variable Format</label>
                          <span className="form-description">The format of the variable output</span>
                          <select
                            value={step.variables_output?.length ? step.variables_output[0].variable_format : ''}
                            onChange={(e) => {
                              const newOutputs = [...(step.variables_output || []), { response_location: '', variable_name: '', variable_format: e.target.value, transformation_layers: [] }];
                              handleStepChange(index, { ...step, variables_output: newOutputs });
                            }}
                            className="form-select"
                          >
                            <option value="json">JSON</option>
                            <option value="text">Text</option>
                          </select>
                        </div>

                        <div>
                          <label className="form-label">Transformation Layers</label>
                          <span className="form-description">Transformation layers for this step</span>
                          <select
                            value={step.variables_output?.length ? step.variables_output[0].transformation_layers?.length ? step.variables_output[0].transformation_layers[0].type : '' : ''}
                            onChange={(e) => {
                              const newOutputs = [...(step.variables_output || []), { response_location: '', variable_name: '', variable_format: 'json', transformation_layers: [{ type: e.target.value, json_path: '', from_type: '' }] }];
                              handleStepChange(index, { ...step, variables_output: newOutputs });
                            }}
                            className="form-select"
                          >
                            <option value="">No Transformation Layers</option>
                            {step.variables_output?.map((output, outputIndex) =>
                              output.transformation_layers?.map((layer, layerIndex) => (
                                <option key={`${outputIndex}-${layerIndex}`} value={layer.type}>
                                  {layer.type}
                                </option>
                              ))
                            )}
                          </select>
                        </div>
                      </>
                    )}

                    {step.type === 'loop' && (
                      <div>
                        <label className="form-label">Loop Configuration</label>
                        <span className="form-description">Configuration for this loop step</span>
                        <div className="space-y-3">
                          <div>
                            <label className="form-label">Variable Name</label>
                            <span className="form-description">The variable to loop over</span>
                            <input
                              type="text"
                              value={step.loop?.variable_name}
                              onChange={(e) => handleStepChange(index, { ...step, loop: { ...step.loop, variable_name: e.target.value } })}
                              className="form-input"
                              placeholder="Enter variable name"
                            />
                          </div>
                          <div>
                            <label className="form-label">Item Name</label>
                            <span className="form-description">The item variable name</span>
                            <input
                              type="text"
                              value={step.loop?.item_name}
                              onChange={(e) => handleStepChange(index, { ...step, loop: { ...step.loop, item_name: e.target.value } })}
                              className="form-input"
                              placeholder="Enter item name"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          <button
            type="button"
            onClick={handleAddStep}
            className="add-button"
          >
            <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>Add Step</span>
          </button>
        </div>
      )}
    </div>
  );
}

export default StepForm; 