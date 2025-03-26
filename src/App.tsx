import React, { useState } from 'react';
import { dump } from 'js-yaml';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
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
    yaml: true,
    docs: false
  });

  const [copied, setCopied] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

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

  const yamlOutput = dump(config);

  return (
    <div className="min-h-screen bg-gray-50 relative">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-8">
          <FileText size={32} className="text-blue-500 mr-3" />
          <h1 className="text-3xl font-bold text-gray-900">YAML Builder</h1>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-8">
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

            <div className="bg-white rounded-lg shadow-md">
              <button
                onClick={() => toggleSection('docs')}
                className="w-full p-6 flex justify-between items-center text-left"
              >
                <div className="flex items-center">
                  <HelpCircle size={20} className="mr-2 text-blue-500" />
                  <h2 className="text-xl font-semibold">Documentation</h2>
                </div>
                {expandedSections.docs ? <ChevronUp /> : <ChevronDown />}
              </button>
              {expandedSections.docs && (
                <div className="p-6 pt-0 prose max-w-none">
                  <section className="mb-8">
                    <h3 className="text-lg font-semibold mb-4">YAML Structure Overview</h3>
                    <p className="text-gray-600 mb-4">
                      The YAML configuration consists of three main sections. For complete documentation, please refer to the{' '}
                      <a 
                        href="https://docs.rivery.io/docs/blueprint" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 underline"
                      >
                        official Rivery Blueprint documentation
                      </a>.
                    </p>
                    
                    <div className="space-y-6">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-blue-600 mb-2">1. Connector Configuration</h4>
                        <p className="text-sm text-gray-600 mb-2">
                          Defines the basic settings for your API connection:
                        </p>
                        <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
{`connector:
  name: "Rivery API"              # Name of your API connector
  base_url: "https://api.example.com"  # Base URL for all endpoints
  variables_metadata:             # Output configuration
    final_output_file:
      format: "json"             # Output format
      storage_name: "results dir" # Storage reference
  variables_storages:            # Storage definitions
    - name: "results dir"        # Storage identifier
      type: "file_system"        # Storage type`}
                        </pre>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-blue-600 mb-2">2. Interface Parameters</h4>
                        <p className="text-sm text-gray-600 mb-2">
                          Defines the input parameters and authentication required by the API to generate a Successfull request:
                        </p>
                        <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
{`interface_parameters:
  section:
    source:
      - name: "account_id"        # String parameter
        type: "string"
      - name: "Auth"             # Authentication parameter
        type: "authentication"
        auth_type: "bearer"      # Auth types: bearer, basic_http, api_key
        fields:
          - name: "bearer_token"
            type: "string"
            is_encrypted: true
      - name: "time_period"      # Date range parameter
        type: "date_range"
        period_type: "date"      # date or datetime
        format: "YYYY-MM-DD"
        fields:
          - name: "start_date"
          - name: "end_date"`}
                        </pre>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-blue-600 mb-2">3. Steps Configuration</h4>
                        <p className="text-sm text-gray-600 mb-2">
                          Defines the API endpoints and data processing:
                        </p>
                        <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
{`steps:
  - name: "Get Data"             # Step identifier
    description: "Fetch data"    # Step description
    type: "rest"                # Request type
    http_method: "GET"          # HTTP method
    endpoint: "/api/v1/data"    # API endpoint
    variables_output:           # Output configuration
      - response_location: "data"
        variable_name: "final_output_file"
        variable_format: "json"`}
                        </pre>
                      </div>
                    </div>
                  </section>

                  <section className="mb-8">
                    <h3 className="text-lg font-semibold mb-4">Form Components Guide</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-blue-600">Connector Configuration</h4>
                        <ul className="list-disc pl-5 text-sm text-gray-600">
                          <li>Configure the basic API connection settings</li>
                          <li>Set up output file format and storage locations</li>
                          <li>Define storage types for your data</li>
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-semibold text-blue-600">Interface Parameters</h4>
                        <ul className="list-disc pl-5 text-sm text-gray-600">
                          <li>String parameters: Simple text inputs</li>
                          <li>Authentication:
                            <ul className="list-circle pl-5">
                              <li>Bearer Token: Single token authentication</li>
                              <li>Basic HTTP: Username/password authentication</li>
                              <li>API Key: Key-based authentication in headers or query params</li>
                            </ul>
                          </li>
                          <li>Date Range: Configure date-based parameters with specific formats</li>
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-semibold text-blue-600">Steps</h4>
                        <ul className="list-disc pl-5 text-sm text-gray-600">
                          <li>Define API endpoints and methods</li>
                          <li>Configure how response data should be processed</li>
                          <li>Set up output variable mapping</li>
                        </ul>
                      </div>
                    </div>
                  </section>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md">
            <div className="p-6 flex justify-between items-center">
              <button
                onClick={() => toggleSection('yaml')}
                className="flex-grow text-left flex items-center"
              >
                <h2 className="text-xl font-semibold">Generated YAML</h2>
                {expandedSections.yaml ? <ChevronUp className="ml-2" /> : <ChevronDown className="ml-2" />}
              </button>
              {expandedSections.yaml && (
                <button
                  onClick={handleCopy}
                  className="flex items-center px-3 py-1 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                >
                  {copied ? (
                    <>
                      <Check size={16} className="mr-1 text-green-500" />
                      <span className="text-green-500">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={16} className="mr-1" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              )}
            </div>
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

      {showPopup && (
        <div className="fixed bottom-4 right-4 bg-blue-600 text-white p-4 rounded-lg shadow-lg max-w-md animate-fade-in">
          <div className="flex items-start">
            <div className="flex-grow">
              <h4 className="font-semibold mb-1">YAML Copied Successfully!</h4>
              <p className="text-sm">
                Return to the Blueprint editor and paste (Ctrl+V) the generated YAML to update your configuration.
              </p>
            </div>
            <button 
              onClick={() => setShowPopup(false)}
              className="ml-4 text-white hover:text-blue-100"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;