import React, { useState } from 'react';
import { dump } from 'js-yaml';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { YAMLConfig } from './types';
import { InterfaceParametersForm } from './components/InterfaceParametersForm';
import { ConnectorForm } from './components/ConnectorForm';
import { StepsForm } from './components/StepsForm';
import { FileText, ChevronDown, ChevronUp } from 'lucide-react';

function App() {
  const [config, setConfig] = useState<YAMLConfig>({
    interface_parameters: {
      section: {
        source: [
          // {
          //   name: 'account_id',
          //   type: 'string'
          // },
          // {
          //   name: 'environment_id',
          //   type: 'string'
          // },
          // {
          //   name: 'BearerAuth',
          //   type: 'authentication',
          //   auth_type: 'bearer',
          //   fields: [
          //     {
          //       name: 'bearer_token',
          //       type: 'string',
          //       is_encrypted: true
          //     }
          //   ]
          // },
          // {
          //   name: 'BasicAuth',
          //   type: 'authentication',
          //   auth_type: 'basic_http',
          //   fields: [
          //     {
          //       name: 'username',
          //       type: 'string'
          //     },
          //     {
          //       name: 'password',
          //       type: 'string',
          //       is_encrypted: true
          //     }
          //   ]
          // },
          // {
          //   name: 'ApiKeyAuth',
          //   type: 'authentication',
          //   auth_type: 'api_key',
          //   // location: 'header',
          //   fields: [
          //     {
          //       name: 'key_name',
          //       type: 'string'
          //     },
          //     {
          //       name: 'key_value',
          //       type: 'string',
          //       is_encrypted: true
          //     }
          //   ]
          // }
        ]
      }
    },
    connector: {
      name: '',
      base_url: '',
      variables_metadata: {
        // final_output_file: {
        //   format: 'json',
        //   storage_name: 'results dir'
        // }
      },
      variables_storages: [
        {
          name: 'results dir',
          type: 'file_system'
        }
      ]
    },
    steps: [
      {
        name: '',
        description: '',
        type: 'rest',
        http_method: 'GET',
        endpoint: '{{%BASE_URL%}}/',
        variables_output: [
          // {
          //   response_location: 'data',
          //   variable_name: '',
          //   variable_format: 'json',
          //   transformation_layers: [
              // {
              //   type: 'extract_json',
              //   from_type: 'json',
              //   json_path: ''
              // }
          //   ]
          // }
        ]
      }
    ]
  });

  const [expandedSections, setExpandedSections] = useState({
    parameters: false,
    connector: false,
    steps: false,
    yaml: true
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleParametersUpdate = (source: any[]) => {
    setConfig({
      ...config,
      interface_parameters: {
        section: { source }
      }
    });
  };

  const handleConnectorUpdate = (connector: any) => {
    setConfig({ ...config, connector });
  };

  const handleStepsUpdate = (steps: any[]) => {
    setConfig({ ...config, steps });
  };

  const yamlOutput = dump(config);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-8">
          <FileText size={32} className="text-blue-500 mr-3" />
          <h1 className="text-3xl font-bold text-gray-900">YAML Builder</h1>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-8">
            <div className="bg-white rounded-lg shadow-md">
              <button
                onClick={() => toggleSection('parameters')}
                className="w-full p-6 flex justify-between items-center text-left"
              >
                <h2 className="text-xl font-semibold">Interface Parameters</h2>
                {expandedSections.parameters ? <ChevronUp /> : <ChevronDown />}
              </button>
              {expandedSections.parameters && (
                <div className="p-6 pt-0">
                  <InterfaceParametersForm
                    parameters={config.interface_parameters.section.source}
                    onUpdate={handleParametersUpdate}
                  />
                </div>
              )}
            </div>

            <div className="bg-white rounded-lg shadow-md">
              <button
                onClick={() => toggleSection('connector')}
                className="w-full p-6 flex justify-between items-center text-left"
              >
                <h2 className="text-xl font-semibold">Connector Configuration</h2>
                {expandedSections.connector ? <ChevronUp /> : <ChevronDown />}
              </button>
              {expandedSections.connector && (
                <div className="p-6 pt-0">
                  <ConnectorForm
                    connector={config.connector}
                    onUpdate={handleConnectorUpdate}
                  />
                </div>
              )}
            </div>

            <div className="bg-white rounded-lg shadow-md">
              <button
                onClick={() => toggleSection('steps')}
                className="w-full p-6 flex justify-between items-center text-left"
              >
                <h2 className="text-xl font-semibold">Steps</h2>
                {expandedSections.steps ? <ChevronUp /> : <ChevronDown />}
              </button>
              {expandedSections.steps && (
                <div className="p-6 pt-0">
                  <StepsForm
                    steps={config.steps}
                    onUpdate={handleStepsUpdate}
                  />
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md">
            <button
              onClick={() => toggleSection('yaml')}
              className="w-full p-6 flex justify-between items-center text-left"
            >
              <h2 className="text-xl font-semibold">Generated YAML</h2>
              {expandedSections.yaml ? <ChevronUp /> : <ChevronDown />}
            </button>
            {expandedSections.yaml && (
              <div className="p-6 pt-0">
                <SyntaxHighlighter
                  language="yaml"
                  style={tomorrow}
                  className="rounded-md"
                >
                  {yamlOutput}
                </SyntaxHighlighter>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;