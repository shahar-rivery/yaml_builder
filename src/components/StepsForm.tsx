import React, { useState } from 'react';
import { Step, VariableMetadata, LoopConfig } from '../types';
import { Trash2, Plus, Settings } from 'lucide-react';
import { LoopComponent } from './LoopComponent';

interface Props {
  steps: Step[];
  onUpdate: (steps: Step[]) => void;
  isNested?: boolean;
}

// Create a recursive StepContent component to handle nested steps
const StepContent: React.FC<{
  step: Step;
  stepIndex: number;
  parentSteps: Step[];
  onUpdate: (steps: Step[]) => void;
  handleStepChange: (index: number, field: keyof Step, value: string) => void;
  handleLoopChange: (index: number, updatedLoop: LoopConfig) => void;
  handleLoopStepsChange: (index: number, updatedSteps: Step[]) => void;
  addVariableOutput: (index: number) => void;
  removeVariableOutput: (stepIndex: number, outputIndex: number) => void;
  handleVariableOutputChange: (stepIndex: number, outputIndex: number, field: string, value: string) => void;
  handleTransformationLayerChange: (stepIndex: number, outputIndex: number, layerIndex: number, field: string, value: string) => void;
  addTransformationLayer: (stepIndex: number, outputIndex: number) => void;
  removeTransformationLayer: (stepIndex: number, outputIndex: number, layerIndex: number) => void;
  removeStep: (index: number) => void;
  isNested?: boolean;
}> = ({
  step,
  stepIndex,
  parentSteps,
  onUpdate,
  handleStepChange,
  handleLoopChange,
  handleLoopStepsChange,
  addVariableOutput,
  removeVariableOutput,
  handleVariableOutputChange,
  handleTransformationLayerChange,
  addTransformationLayer,
  removeTransformationLayer,
  removeStep,
  isNested = false
}) => {
  const hasNextStep = parentSteps.length > stepIndex + 1;
  const nextStepIsLoop = hasNextStep && parentSteps[stepIndex + 1].type === 'loop';
  const hasLoopSteps = step.steps && step.steps.length > 0;

  const addNestedStep = (stepIndex: number) => {
    const newSteps = [...parentSteps];
    if (!newSteps[stepIndex]) return;
    
    if (!newSteps[stepIndex].steps) {
      newSteps[stepIndex].steps = [];
    }
    
    newSteps[stepIndex].steps.push({
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
    });
    onUpdate(newSteps);
  };

  const addNestedLoopStep = (stepIndex: number) => {
    const newSteps = [...parentSteps];
    if (!newSteps[stepIndex]) return;
    
    newSteps.splice(stepIndex + 1, 0, {
      name: '',
      description: '',
      type: 'loop',
      loop: {
        type: 'data',
        variable_name: '',
        item_name: '',
        add_to_results: true
      }
    });
    onUpdate(newSteps);
  };

  return (
    <div className="p-4 shadow-md rounded-lg space-y-4 w-full bg-white">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">
          {step.type === 'loop' ? 'Loop Block' : isNested ? 'Nested REST Step' : 'REST Step'}
        </h3>
        <button
          onClick={() => removeStep(stepIndex)}
          className="p-2 text-red-500 hover:text-red-700"
        >
          <Trash2 size={20} />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 w-full">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Step Name
            <span className="ml-1 text-xs text-gray-500">(Unique identifier for this step)</span>
          </label>
          <input
            type="text"
            placeholder="e.g., Get Posts"
            value={step.name}
            onChange={(e) => handleStepChange(stepIndex, 'name', e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-md shadow-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
            <span className="ml-1 text-xs text-gray-500">(Brief explanation of what this step does)</span>
          </label>
          <input
            type="text"
            placeholder="e.g., Get posts from API"
            value={step.description}
            onChange={(e) => handleStepChange(stepIndex, 'description', e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-md shadow-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Type
            <span className="ml-1 text-xs text-gray-500">(REST API step)</span>
          </label>
          <input
            type="text"
            value="rest"
            disabled
            className="w-full px-3 py-2 border border-gray-200 rounded-md shadow-sm outline-none bg-gray-50 text-gray-600 cursor-not-allowed"
          />
        </div>

        {step.type === 'loop' && step.loop && (
          <>
            <LoopComponent
              loop={step.loop}
              steps={step.steps || []}
              onChange={(updatedLoop) => handleLoopChange(stepIndex, updatedLoop)}
              onStepsChange={(updatedSteps) => handleLoopStepsChange(stepIndex, updatedSteps)}
            />
            {/* Render nested steps */}
            <div className="col-span-2">
              <div className="mt-4 mb-4">
                <div className="flex space-x-4">
                  <button
                    onClick={() => {
                      const newStep = {
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
                      };
                      handleLoopStepsChange(stepIndex, [...(step.steps || []), newStep]);
                    }}
                    disabled={hasLoopSteps}
                    className={`flex items-center px-4 py-2 rounded-md ${
                      hasLoopSteps 
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                        : 'bg-blue-500 text-white hover:bg-blue-600'
                    }`}
                  >
                    <Plus size={20} className="mr-2" />
                    Add Nested REST Step to Loop
                  </button>
                </div>
              </div>
              <StepsForm
                steps={step.steps || []}
                onUpdate={(updatedSteps) => handleLoopStepsChange(stepIndex, updatedSteps)}
                isNested={true}
              />
            </div>
          </>
        )}

        {step.type === 'rest' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                HTTP Method
                <span className="ml-1 text-xs text-gray-500">(HTTP method to use for the request)</span>
              </label>
              <input
                type="text"
                value="GET"
                disabled
                className="w-full px-3 py-2 border rounded-md bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Endpoint
                <span className="ml-1 text-xs text-gray-500">(The API endpoint URL, can include variables like {'{'}%post_id%{'}'})</span>
              </label>
              <input
                type="text"
                placeholder="e.g., {{%BASE_URL%}}/posts/{{%post_id%}}"
                value={step.endpoint}
                onChange={(e) => handleStepChange(stepIndex, 'endpoint', e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>

            {/* Variables Output section */}
            <div className="col-span-2">
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

              {(step.variables_output || []).map((output, outputIndex) => (
                <div key={outputIndex} className="mb-4 p-4 rounded-lg shadow-md bg-white">
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
                      <label className="block text-sm font-medium mb-1">
                        Response Location
                        <span className="ml-1 text-xs text-gray-500">(Where to find the data in the response)</span>
                      </label>
                      <input
                        type="text"
                        value={output.response_location}
                        onChange={(e) => handleVariableOutputChange(stepIndex, outputIndex, 'response_location', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-md shadow-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Variable Name
                        <span className="ml-1 text-xs text-gray-500">(Name of the variable to store the result)</span>
                      </label>
                      <input
                        type="text"
                        value={output.variable_name}
                        onChange={(e) => handleVariableOutputChange(stepIndex, outputIndex, 'variable_name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-md shadow-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      />
                    </div>
                  </div>

                  <div className="mt-2">
                    <h5 className="text-sm font-medium mb-1">Transformation Layers</h5>
                    {(output.transformation_layers || []).map((layer, layerIndex) => (
                      <div key={layerIndex} className="mb-2">
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
                            <label className="block text-xs font-medium mb-1">
                              Type
                              <span className="ml-1 text-xs text-gray-500">(Type of transformation to apply)</span>
                            </label>
                            <input
                              type="text"
                              value="extract_json"
                              disabled
                              className="w-full px-2 py-1 text-sm border rounded-md bg-gray-50"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium mb-1">
                              From Type
                              <span className="ml-1 text-xs text-gray-500">(Input data format)</span>
                            </label>
                            <input
                              type="text"
                              value="json"
                              disabled
                              className="w-full px-2 py-1 text-sm border rounded-md bg-gray-50"
                            />
                          </div>
                          <div className="col-span-2">
                            <label className="block text-xs font-medium mb-1">
                              JSON Path
                              <span className="ml-1 text-xs text-gray-500">(JSON path expression to extract data, e.g., $.items[*])</span>
                            </label>
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

            {/* Add nested steps section */}
            <div className="mt-2 col-span-2 w-full">
              <button
                onClick={() => addNestedLoopStep(stepIndex)}
                disabled={nextStepIsLoop}
                className={`px-4 py-2 rounded-md transition-colors shadow-sm ${
                  nextStepIsLoop
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-500 text-white hover:bg-blue-600 hover:shadow-md'
                }`}
              >
                + Add Loop Block
              </button>
              
              {step.steps && step.steps.length > 0 && (
                <div className="mt-4">
                  <StepsForm
                    steps={step.steps}
                    onUpdate={(updatedSteps) => {
                      const newSteps = [...parentSteps];
                      newSteps[stepIndex] = {
                        ...newSteps[stepIndex],
                        steps: updatedSteps
                      };
                      onUpdate(newSteps);
                    }}
                    isNested={true}
                  />
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export const StepsForm: React.FC<Props> = ({ steps, onUpdate, isNested = false }) => {
  const handleStepChange = (index: number, field: keyof Step, value: string) => {
    const newSteps = [...steps];
    if (!newSteps[index]) return;
    newSteps[index] = { ...newSteps[index], [field]: value };
    onUpdate(newSteps);
  };

  const handleVariableOutputChange = (stepIndex: number, outputIndex: number, field: string, value: string) => {
    const newSteps = [...steps];
    const step = newSteps[stepIndex];
    if (!step?.variables_output?.[outputIndex]) return;
    step.variables_output[outputIndex] = {
      ...step.variables_output[outputIndex],
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
    const step = newSteps[stepIndex];
    if (!step?.variables_output?.[outputIndex]?.transformation_layers?.[layerIndex]) return;
    step.variables_output[outputIndex].transformation_layers[layerIndex] = {
      ...step.variables_output[outputIndex].transformation_layers[layerIndex],
      [field]: value
    };
    onUpdate(newSteps);
  };

  const addVariableOutput = (stepIndex: number) => {
    const newSteps = [...steps];
    const step = newSteps[stepIndex];
    if (!step) return;
    
    if (!step.variables_output) {
      step.variables_output = [];
    }
    
    step.variables_output.push({
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
    const step = newSteps[stepIndex];
    if (!step?.variables_output) return;
    
    step.variables_output = step.variables_output.filter(
      (_, i) => i !== outputIndex
    );
    onUpdate(newSteps);
  };

  const addTransformationLayer = (stepIndex: number, outputIndex: number) => {
    const newSteps = [...steps];
    const step = newSteps[stepIndex];
    if (!step?.variables_output?.[outputIndex]) return;
    
    if (!step.variables_output[outputIndex].transformation_layers) {
      step.variables_output[outputIndex].transformation_layers = [];
    }
    
    step.variables_output[outputIndex].transformation_layers.push({
      type: 'extract_json',
      from_type: 'json',
      json_path: ''
    });
    onUpdate(newSteps);
  };

  const removeTransformationLayer = (stepIndex: number, outputIndex: number, layerIndex: number) => {
    const newSteps = [...steps];
    const step = newSteps[stepIndex];
    if (!step?.variables_output?.[outputIndex]?.transformation_layers) return;
    
    step.variables_output[outputIndex].transformation_layers = 
      step.variables_output[outputIndex].transformation_layers.filter(
        (_, i) => i !== layerIndex
      );
    onUpdate(newSteps);
  };

  const handleLoopChange = (stepIndex: number, updatedLoop: LoopConfig) => {
    const newSteps = [...steps];
    if (!newSteps[stepIndex]) return;
    newSteps[stepIndex] = {
      ...newSteps[stepIndex],
      loop: updatedLoop
    };
    onUpdate(newSteps);
  };

  const handleLoopStepsChange = (stepIndex: number, updatedSteps: Step[]) => {
    const newSteps = [...steps];
    if (!newSteps[stepIndex]) return;
    newSteps[stepIndex] = {
      ...newSteps[stepIndex],
      steps: updatedSteps
    };
    onUpdate(newSteps);
  };

  const removeStep = (index: number) => {
    onUpdate(steps.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      {steps.map((step, index) => (
        <StepContent
          key={index}
          step={step}
          stepIndex={index}
          parentSteps={steps}
          onUpdate={onUpdate}
          handleStepChange={handleStepChange}
          handleLoopChange={handleLoopChange}
          handleLoopStepsChange={handleLoopStepsChange}
          addVariableOutput={addVariableOutput}
          removeVariableOutput={removeVariableOutput}
          handleVariableOutputChange={handleVariableOutputChange}
          handleTransformationLayerChange={handleTransformationLayerChange}
          addTransformationLayer={addTransformationLayer}
          removeTransformationLayer={removeTransformationLayer}
          removeStep={removeStep}
          isNested={isNested}
        />
      ))}
    </div>
  );
};