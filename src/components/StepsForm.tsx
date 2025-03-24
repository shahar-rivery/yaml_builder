import React, { useState } from 'react';
import { Step, VariableMetadata } from '../types';
import { Trash2, Plus, Settings } from 'lucide-react';

interface Props {
  steps: Step[];
  onUpdate: (steps: Step[]) => void;
}

export const StepsForm: React.FC<Props> = ({ steps, onUpdate }) => {
  const handleStepChange = (index: number, field: keyof Step, value: string) => {
    const newSteps = [...steps];
    newSteps[index] = { ...newSteps[index], [field]: value };
    onUpdate(newSteps);
  };

  const handleVariableOutputChange = (stepIndex: number, outputIndex: number, field: string, value: string) => {
    const newSteps = [...steps];
    newSteps[stepIndex].variables_output[outputIndex] = {
      ...newSteps[stepIndex].variables_output[outputIndex],
      [field]: value
    };
    onUpdate(newSteps);
  };

  const handleTransformationLayerChange = (
    stepIndex: number,
    outputIndex: number,
    layerIndex: number,
    field: string,
    value: string
  ) => {
    const newSteps = [...steps];
    newSteps[stepIndex].variables_output[outputIndex].transformation_layers[layerIndex] = {
      ...newSteps[stepIndex].variables_output[outputIndex].transformation_layers[layerIndex],
      [field]: value
    };
    onUpdate(newSteps);
  };

  const addVariableOutput = (stepIndex: number) => {
    const newSteps = [...steps];
    newSteps[stepIndex].variables_output.push({
      response_location: 'data',
      variable_name: '',
      variable_format: 'json',
      transformation_layers: [{
        type: 'extract_json',
        from_type: 'json',
        json_path: ''
      }]
    });
    onUpdate(newSteps);
  };

  const removeVariableOutput = (stepIndex: number, outputIndex: number) => {
    const newSteps = [...steps];
    newSteps[stepIndex].variables_output = newSteps[stepIndex].variables_output.filter(
      (_, i) => i !== outputIndex
    );
    onUpdate(newSteps);
  };

  const addTransformationLayer = (stepIndex: number, outputIndex: number) => {
    const newSteps = [...steps];
    newSteps[stepIndex].variables_output[outputIndex].transformation_layers.push({
      type: 'extract_json',
      from_type: 'json',
      json_path: ''
    });
    onUpdate(newSteps);
  };

  const removeTransformationLayer = (stepIndex: number, outputIndex: number, layerIndex: number) => {
    const newSteps = [...steps];
    newSteps[stepIndex].variables_output[outputIndex].transformation_layers = 
      newSteps[stepIndex].variables_output[outputIndex].transformation_layers.filter(
        (_, i) => i !== layerIndex
      );
    onUpdate(newSteps);
  };

  const addStep = () => {
    onUpdate([...steps, {
      name: '',
      description: '',
      type: 'rest',
      http_method: 'GET',
      endpoint: '',
      variables_output: [{
        response_location: 'data',
        variable_name: '',
        variable_format: 'json',
        transformation_layers: [{
          type: 'extract_json',
          from_type: 'json',
          json_path: ''
        }]
      }]
    }]);
  };

  const removeStep = (index: number) => {
    onUpdate(steps.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      {steps.map((step, stepIndex) => (
        <div key={stepIndex} className="p-4 border rounded-lg space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Step {stepIndex + 1}</h3>
            <button
              onClick={() => removeStep(stepIndex)}
              className="p-2 text-red-500 hover:text-red-700"
            >
              <Trash2 size={20} />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Step Name
                <span className="ml-1 text-xs text-gray-500">
                  (Unique identifier for this step)
                </span>
              </label>
              <input
                type="text"
                placeholder="e.g., Get Rivers"
                value={step.name}
                onChange={(e) => handleStepChange(stepIndex, 'name', e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
                <span className="ml-1 text-xs text-gray-500">
                  (Brief explanation of what this step does)
                </span>
              </label>
              <input
                type="text"
                placeholder="e.g., Get rivers from environment"
                value={step.description}
                onChange={(e) => handleStepChange(stepIndex, 'description', e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type
                <span className="ml-1 text-xs text-gray-500">
                  (API request type, usually 'rest')
                </span>
              </label>
              <input
                type="text"
                placeholder="e.g., rest"
                value={step.type}
                onChange={(e) => handleStepChange(stepIndex, 'type', e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                HTTP Method
                <span className="ml-1 text-xs text-gray-500">
                  (GET, POST, PUT, DELETE, etc.)
                </span>
              </label>
              <select
                value={step.http_method}
                onChange={(e) => handleStepChange(stepIndex, 'http_method', e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="DELETE">DELETE</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Endpoint
                <span className="ml-1 text-xs text-gray-500">
                  (API endpoint URL, can include variables like {'{account_id}'})
                </span>
              </label>
              <input
                type="text"
                placeholder="e.g., {{%BASE_URL%}}/v1/accounts/{account_id}/environments/{environment_id}/rivers"
                value={step.endpoint}
                onChange={(e) => handleStepChange(stepIndex, 'endpoint', e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
          </div>

          <div className="mt-6">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-md font-medium">Variable Outputs</h4>
              <button
                onClick={() => addVariableOutput(stepIndex)}
                className="flex items-center text-blue-500 hover:text-blue-700"
              >
                <Plus size={20} className="mr-1" />
                Add Output
              </button>
            </div>

            {step.variables_output.map((output, outputIndex) => (
              <div key={outputIndex} className="mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-start mb-4">
                  <h5 className="text-sm font-medium">Output {outputIndex + 1}</h5>
                  <button
                    onClick={() => removeVariableOutput(stepIndex, outputIndex)}
                    className="p-1 text-red-500 hover:text-red-700"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Response Location</label>
                    <input
                      type="text"
                      value={output.response_location}
                      onChange={(e) => handleVariableOutputChange(stepIndex, outputIndex, 'response_location', e.target.value)}
                      className="w-full px-3 py-2 border rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Variable Name</label>
                    <input
                      type="text"
                      value={output.variable_name}
                      onChange={(e) => handleVariableOutputChange(stepIndex, outputIndex, 'variable_name', e.target.value)}
                      className="w-full px-3 py-2 border rounded-md"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <div className="flex justify-between items-center mb-2">
                    <h6 className="text-sm font-medium">Transformation Layers</h6>
                    <button
                      onClick={() => addTransformationLayer(stepIndex, outputIndex)}
                      className="flex items-center text-blue-500 hover:text-blue-700"
                    >
                      <Plus size={16} className="mr-1" />
                      Add Layer
                    </button>
                  </div>

                  {output.transformation_layers.map((layer, layerIndex) => (
                    <div key={layerIndex} className="mb-4 p-3 bg-white rounded border">
                      <div className="flex justify-between items-start mb-3">
                        <span className="text-xs font-medium">Layer {layerIndex + 1}</span>
                        <button
                          onClick={() => removeTransformationLayer(stepIndex, outputIndex, layerIndex)}
                          className="p-1 text-red-500 hover:text-red-700"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium mb-1">Type</label>
                          <select
                            value={layer.type}
                            onChange={(e) => handleTransformationLayerChange(stepIndex, outputIndex, layerIndex, 'type', e.target.value)}
                            className="w-full px-2 py-1 text-sm border rounded-md"
                          >
                            <option value="extract_json">Extract JSON</option>
                            <option value="transform_json">Transform JSON</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium mb-1">From Type</label>
                          <select
                            value={layer.from_type}
                            onChange={(e) => handleTransformationLayerChange(stepIndex, outputIndex, layerIndex, 'from_type', e.target.value)}
                            className="w-full px-2 py-1 text-sm border rounded-md"
                          >
                            <option value="json">JSON</option>
                            <option value="csv">CSV</option>
                            <option value="text">Text</option>
                          </select>
                        </div>
                        <div className="col-span-2">
                          <label className="block text-xs font-medium mb-1">JSON Path</label>
                          <input
                            type="text"
                            value={layer.json_path}
                            onChange={(e) => handleTransformationLayerChange(stepIndex, outputIndex, layerIndex, 'json_path', e.target.value)}
                            className="w-full px-2 py-1 text-sm border rounded-md"
                            placeholder="$.items[*]"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};