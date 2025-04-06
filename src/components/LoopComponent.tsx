import React from 'react';
import { LoopConfig, Step } from '../types';
import { Info } from 'lucide-react';

interface LoopComponentProps {
  loop: LoopConfig;
  steps: Step[];
  onChange: (updatedLoop: LoopConfig) => void;
  onStepsChange: (updatedSteps: Step[]) => void;
}

export const LoopComponent: React.FC<LoopComponentProps> = ({
  loop,
  steps,
  onChange,
  onStepsChange,
}) => {
  const handleLoopChange = (field: keyof LoopConfig, value: string | boolean) => {
    onChange({
      ...loop,
      [field]: value,
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center space-x-2">
        <h3 className="text-sm font-medium text-gray-900">Loop Configuration</h3>
        <div className="flex items-center text-xs text-gray-500">
          <Info size={14} className="mr-1" />
          <span>Loop over an array of items</span>
        </div>
      </div>
      
      <div className="space-y-4">
        {/* Loop Type */}
        <div className="flex items-center">
          <label className="w-32 text-sm text-gray-700">Loop Type</label>
          <div className="flex items-center">
            <input
              type="text"
              value="data"
              disabled
              className="w-20 px-2 py-1 border rounded bg-gray-50 text-gray-700 text-sm"
            />
            <span className="ml-2 text-sm text-gray-500">array data</span>
          </div>
        </div>

        {/* Variable Name */}
        <div className="flex items-start">
          <label className="w-32 text-sm text-gray-700 pt-1">Variable Name</label>
          <div className="flex-1">
            <input
              type="text"
              className="w-full px-2 py-1 border rounded focus:border-indigo-500 focus:ring-indigo-500 text-sm"
              value={loop.variable_name}
              onChange={(e) => handleLoopChange('variable_name', e.target.value)}
              placeholder="e.g., post_ids"
            />
            <p className="mt-1 text-xs text-gray-500">
              Array to loop over
            </p>
          </div>
        </div>

        {/* Item Name */}
        <div className="flex items-start">
          <label className="w-32 text-sm text-gray-700 pt-1">Item Name</label>
          <div className="flex-1">
            <input
              type="text"
              className="w-full px-2 py-1 border rounded focus:border-indigo-500 focus:ring-indigo-500 text-sm"
              value={loop.item_name}
              onChange={(e) => handleLoopChange('item_name', e.target.value)}
              placeholder="e.g., post_id"
            />
            <p className="mt-1 text-xs text-gray-500">
              Current item variable
            </p>
          </div>
        </div>

        {/* Results */}
        <div className="flex items-start">
          <label className="w-32 text-sm text-gray-700 pt-1">Results</label>
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                checked={loop.add_to_results}
                onChange={(e) => handleLoopChange('add_to_results', e.target.checked)}
              />
              <span className="ml-2 text-sm text-gray-700">Include in output</span>
            </label>
            <p className="mt-1 text-xs text-gray-500">
              Collect loop results
            </p>
          </div>
        </div>
      </div>

      <div className="text-xs text-blue-700 border-t pt-2">
        <span className="font-medium mr-1">Example:</span>
        <span>Variable: </span>
        <code className="bg-blue-50 px-1 rounded mx-1">post_ids</code>
        <span>Item: </span>
        <code className="bg-blue-50 px-1 rounded mx-1">post_id</code>
        <span>Use: </span>
        <code className="bg-blue-50 px-1 rounded mx-1">{'{{%post_id%}}'}</code>
      </div>
    </div>
  );
};

export default LoopComponent; 