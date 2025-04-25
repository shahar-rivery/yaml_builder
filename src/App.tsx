import React, { useState, useEffect } from 'react';
import { dump } from 'js-yaml';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { nightOwl } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { YAMLConfig } from './types';
import { InterfaceParametersForm } from './components/InterfaceParametersForm';
import { ConnectorForm } from './components/ConnectorForm';
import { StepsForm } from './components/StepsForm';
import { FileText, ChevronDown, ChevronUp, Copy, Check, HelpCircle } from 'lucide-react';

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
      default_headers: {},
      variables_metadata: {
        
        final_output_file: { 
          format: 'json',
          storage_name: 'results dir'
        }
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
        // variables_output: []
      }
    ]
  });

  const [expandedSections, setExpandedSections] = useState({
    parameters: false,
    connector: false,
    steps: false,
    yaml: false,
    docs: false
  });

  const [expandedDocs, setExpandedDocs] = useState({
    connector: false,
    connectorYaml: false,
    parameters: false,
    parametersYaml: false,
    steps: false,
    stepsYaml: false
  });

  const [copied, setCopied] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  // Track if sections have ever been filled
  const [hasEverFilled, setHasEverFilled] = useState({
    parameters: false,
    steps: false
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const toggleDocs = (section: keyof typeof expandedDocs) => {
    setExpandedDocs(prev => ({
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

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(yamlOutput);
      setCopied(true);
      setShowPopup(true);
      setTimeout(() => {
        setCopied(false);
        setShowPopup(false);
      }, 5000); // Hide after 5 seconds
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const yamlOutput = dump({
    interface_parameters: config.interface_parameters,
    connector: config.connector,
    steps: config.steps
  }, {
    indent: 2,
    lineWidth: -1,
    noRefs: true,
    sortKeys: false,
    styles: {
      '!!null': 'empty'
    }
  });

  const isConnectorValid = () => {
    return config.connector.name && config.connector.base_url;
  };

  const isParametersValid = () => {
    return config.interface_parameters.section.source.length > 0;
  };

  const isStepsValid = () => {
    return config.steps.length > 0 && config.steps.every(step => 
      step.name && step.endpoint
    );
  };

  // Update hasEverFilled when config changes
  useEffect(() => {
    if (config.interface_parameters.section.source.length > 0) {
      setHasEverFilled(prev => ({ ...prev, parameters: true }));
    }
    if (config.steps.length > 0) {
      setHasEverFilled(prev => ({ ...prev, steps: true }));
    }
  }, [config]);

  // New functions to check if sections should be enabled
  const isParametersEnabled = () => {
    return isConnectorValid() || hasEverFilled.parameters;
  };

  const isStepsEnabled = () => {
    return isConnectorValid() && (isParametersValid() || hasEverFilled.parameters);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <FileText size={32} className="text-[#0066CC] mr-3" />
              <h1 className="text-3xl font-bold text-gray-900">YAML Builder</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <p className="text-gray-700 text-sm leading-relaxed">
            This YAML Builder is designed to help you create and configure your data pipeline without needing to write YAML code manually. It provides a user-friendly interface where you can define your API connections, input parameters, and data processing steps. As you make changes in the interface, the YAML configuration is automatically generated and displayed in the right panel. You can then copy this YAML and paste it directly into the Blueprint editor in your Rivery console to create your data pipeline.
          </p>
          <p className="text-gray-700 text-sm mt-4">
            For complete documentation, please refer to the <a href="https://docs.rivery.io/blueprint" target="_blank" rel="noopener noreferrer" className="text-[#0066CC] hover:text-[#0066CC]/90 underline">official Rivery Blueprint documentation</a>.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="space-y-8 lg:col-span-3">
            <div className="space-y-4">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center mb-2">
                    <div className="w-8 h-8 rounded-full bg-[#0066CC] text-white flex items-center justify-center font-bold mr-3">
                      1
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900">Connector Configuration</h2>
                  </div>
                  <p className="text-sm text-gray-600">
                    First, define your API connection details. This includes the base URL and any default headers needed for authentication.
                  </p>
                </div>
                <button
                  onClick={() => toggleSection('connector')}
                  className="w-full p-6 flex justify-between items-center text-left text-gray-900 hover:bg-gray-50 transition-colors"
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
            </div>

            <div className="space-y-4">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center mb-2">
                    <div className="w-8 h-8 rounded-full bg-[#0066CC] text-white flex items-center justify-center font-bold mr-3">
                      2
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900">Interface Parameters</h2>
                  </div>
                  <p className="text-sm text-gray-600">
                    Next, define the input parameters for your pipeline. These parameters can be used for authentication, filtering data, and customizing API requests.
                  </p>
                </div>
                <button
                  onClick={() => toggleSection('parameters')}
                  className="w-full p-6 flex justify-between items-center text-left text-gray-900 hover:bg-gray-50 transition-colors"
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
            </div>

            <div className="space-y-4">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center mb-2">
                    <div className="w-8 h-8 rounded-full bg-[#0066CC] text-white flex items-center justify-center font-bold mr-3">
                      3
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900">Workflow Steps</h2>
                  </div>
                  <p className="text-sm text-gray-600">
                    Finally, define your workflow steps. Each step represents an API call and how to process its response. You can add pagination, loops, and data transformations.
                  </p>
                </div>
                <button
                  onClick={() => toggleSection('steps')}
                  className="w-full p-6 flex justify-between items-center text-left text-gray-900 hover:bg-gray-50 transition-colors"
                >
                  <h2 className="text-xl font-semibold">Workflow Steps</h2>
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
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 sticky top-8">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <h2 className="text-xl font-semibold text-gray-900">Generated YAML</h2>
                  </div>
                  <button
                    onClick={handleCopy}
                    className="flex items-center px-2 py-2 bg-[#0066CC] text-white rounded-lg hover:bg-[#0066CC]/90 transition-all"
                  >
                    {copied ? <Check size={15} className="mr-2" /> : <Copy size={15} className="mr-2" />}
                    {copied ? 'Copied!' : 'Copy YAML'}
                  </button>
                </div>
                <p className="text-sm text-gray-600">
                  Your configuration in YAML format. This updates automatically as you make changes.
                </p>
              </div>
              <div className="p-6">
                <SyntaxHighlighter
                  language="yaml"
                  style={nightOwl}
                  customStyle={{
                    background: '#1a1a2e',
                    fontSize: '0.875rem',
                    margin: 0,
                    borderRadius: '0.5rem',
                    padding: '1rem'
                  }}
                >
                  {yamlOutput}
                </SyntaxHighlighter>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showPopup && (
        <div className="fixed bottom-4 right-4 bg-[#0066CC] text-white px-6 py-3 rounded-lg shadow-lg flex items-center">
          <Check size={20} className="mr-2" />
          YAML copied to clipboard! Paste it in the Blueprint editor in your Rivery console.
        </div>
      )}
    </div>
  );
}

export default App;