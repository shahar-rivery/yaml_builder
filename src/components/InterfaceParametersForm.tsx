import React from 'react';
import { InterfaceParameter } from '../types';
import { Trash2 } from 'lucide-react';

interface Props {
  parameters: InterfaceParameter[];
  onUpdate: (parameters: InterfaceParameter[]) => void;
}

export const InterfaceParametersForm: React.FC<Props> = ({ parameters, onUpdate }) => {
  const handleParameterChange = (index: number, field: string, value: string) => {
    const newParameters = [...parameters];
    newParameters[index] = { ...newParameters[index], [field]: value };
    onUpdate(newParameters);
  };

  const addParameter = () => {
    onUpdate([...parameters, { name: '', type: 'string', value: '' }]);
  };

  const removeParameter = (index: number) => {
    const newParameters = parameters.filter((_, i) => i !== index);
    onUpdate(newParameters);
  };

  return (
    <div className="space-y-4">
      {parameters.map((param, index) => (
        <div key={index} className="flex gap-4 items-start">
          <div className="flex-1 space-y-2">
            <input
              type="text"
              placeholder="Parameter Name"
              value={param.name}
              onChange={(e) => handleParameterChange(index, 'name', e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
            />
            <select
              value={param.type}
              onChange={(e) => handleParameterChange(index, 'type', e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="string">String</option>
              <option value="authentication">Authentication</option>
            </select>
            {param.type === 'authentication' && (
              <select
                value={param.auth_type}
                onChange={(e) => handleParameterChange(index, 'auth_type', e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="bearer">Bearer</option>
              </select>
            )}
          </div>
          <button
            onClick={() => removeParameter(index)}
            className="p-2 text-red-500 hover:text-red-700"
          >
            <Trash2 size={20} />
          </button>
        </div>
      ))}
      <button
        onClick={addParameter}
        className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
      >
        Add Parameter
      </button>
    </div>
  );
};