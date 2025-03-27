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
        
        <p className="text-gray-600 mb-8">
          For complete documentation, please refer to the{' '}
          <a 
            href="https://docs.rivery.io/docs/blueprint" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 underline"
          >
            official Rivery Blueprint documentation
          </a>.
        </p>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="bg-white rounded-lg shadow-md">
                <button
                  onClick={() => toggleSection('connector')}
                  className="w-full p-6 flex justify-between items-center text-left"
                >
                  <h2 className="text-xl font-semibold">Connector Configuration</h2>
                  {expandedSections.connector ? <ChevronUp /> : <ChevronDown />}
                </button>
                {expandedSections.connector && (
                  <div className="p-6 pt-0 space-y-6">
                    <ConnectorForm
                      connector={config.connector}
                      onUpdate={handleConnectorUpdate}
                    />
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-blue-600 mb-2">Connector Configuration Structure</h4>
                      <p className="text-sm text-gray-600 mb-4">
                        The Connector Configuration defines how your application connects to and interacts with the API. 
                        It sets up the fundamental connection details and specifies how data should be handled:
                      </p>
                      <ul className="list-disc text-sm text-gray-600 ml-4 mb-4">
                        <li className="mb-2">
                          <strong>name & base_url:</strong> Define the basic connection details for your API
                        </li>
                        <li className="mb-4">
                          <strong>variables_metadata:</strong> This is a crucial configuration that defines how your data will be handled:
                          <ul className="list-circle ml-4 mt-2">
                            <li className="mb-1">Determines the final destination of your processed data</li>
                            <li className="mb-1">Specifies the format of the output (json, csv, etc.)</li>
                            <li className="mb-1">Links to a storage configuration through storage_name</li>
                            <li className="mb-1">The <code>final_output_file</code> is a special variable that the Blueprint engine uses to:</li>
                            <ul className="list-dash ml-6 mt-1">
                              <li>Create the schema for your data</li>
                              <li>Prepare the data structure</li>
                              <li>Determine where to save the processed data</li>
                              <li>Handle data type conversions</li>
                            </ul>
                          </ul>
                        </li>
                        <li className="mb-4">
                          <strong>variables_storages:</strong> Defines where and how your data can be stored:
                          <ul className="list-circle ml-4 mt-2">
                            <li className="mb-1">Each storage configuration must have a unique name</li>
                            <li className="mb-1">The storage_name in variables_metadata must reference a defined storage</li>
                            <li className="mb-1">Supports different storage types (file_system, s3, etc.)</li>
                          </ul>
                        </li>
                      </ul>
                      <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
{`connector:
  name: "Rivery API"              # Name of your API connector
  base_url: "https://api.example.com"  # Base URL for all endpoints
  
  # Variables metadata defines how data is processed and stored
  variables_metadata:             
    final_output_file:           # Special variable for data handling
      format: "json"             # Format of the output data
      storage_name: "results dir" # References a storage configuration
  
  # Storage configurations
  variables_storages:            
    - name: "results dir"        # Must match storage_name in metadata
      type: "file_system"        # Storage type (file_system, s3, etc.)`}
                      </pre>
                      <div className="mt-4 bg-blue-50 p-3 rounded">
                        <p className="text-sm text-blue-800">
                          <strong>Important Note:</strong> The <code>final_output_file</code> variable is a key component that:
                        </p>
                        <ul className="list-disc text-sm text-blue-800 ml-4 mt-2">
                          <li>Acts as a bridge between your API data and storage system</li>
                          <li>Is referenced in step configurations to specify where data should be saved</li>
                          <li>Enables the Blueprint engine to automatically handle data processing and storage</li>
                          <li>Can be used across multiple steps to accumulate and process data</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-white rounded-lg shadow-md">
                <button
                  onClick={() => toggleSection('parameters')}
                  className="w-full p-6 flex justify-between items-center text-left"
                >
                  <h2 className="text-xl font-semibold">Interface Parameters</h2>
                  {expandedSections.parameters ? <ChevronUp /> : <ChevronDown />}
                </button>
                {expandedSections.parameters && (
                  <div className="p-6 pt-0 space-y-6">
                    <InterfaceParametersForm
                      parameters={config.interface_parameters.section.source}
                      onUpdate={handleParametersUpdate}
                    />
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-blue-600 mb-2">Interface Parameters Structure</h4>
                      <p className="text-sm text-gray-600 mb-4">
                        Interface Parameters are crucial variables that flow through your Blueprint steps. They serve as dynamic inputs 
                        that can be used across different steps and influence how data is processed and stored:
                      </p>
                      <ul className="list-disc text-sm text-gray-600 ml-4 mb-4">
                        <li className="mb-2">
                          <strong>String Parameters:</strong> Simple text inputs that can be used in API endpoints or queries
                        </li>
                        <li className="mb-2">
                          <strong>Authentication Parameters:</strong> Secure credentials for API access
                          <ul className="list-circle ml-4 mt-1">
                            <li>Bearer Token: For token-based authentication</li>
                            <li>Basic HTTP: For username/password authentication</li>
                            <li>API Key: For key-based authentication in headers or query parameters</li>
                          </ul>
                        </li>
                        <li className="mb-2">
                          <strong>Date Range Parameters:</strong> Time-based filters for data queries
                        </li>
                      </ul>
                      <p className="text-sm text-gray-600 mb-4">
                        <strong>Key Concept:</strong> These parameters are used throughout your Blueprint to:
                      </p>
                      <ul className="list-disc text-sm text-gray-600 ml-4 mb-4">
                        <li className="mb-2">Build dynamic API endpoints (e.g., <code>/api/v1/accounts/{'{account_id}'}</code>)</li>
                        <li className="mb-2">Pass authentication credentials securely</li>
                        <li className="mb-2">Filter data based on date ranges</li>
                        <li className="mb-2">Control where and how data is stored (using <code>final_output_file</code>)</li>
                      </ul>
                      <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
{`interface_parameters:
  section:
    source:
      - name: "account_id"        # Used in API endpoints
        type: "string"
      - name: "Auth"             # Authentication parameter
        type: "authentication"
        auth_type: "bearer"      # Auth types: bearer, basic_http, api_key
        fields:
          - name: "bearer_token"
            type: "string"
            is_encrypted: true
      - name: "time_period"      # Date range for filtering
        type: "date_range"
        period_type: "date"      # date or datetime
        format: "YYYY-MM-DD"
        fields:
          - name: "start_date"
          - name: "end_date"`}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-white rounded-lg shadow-md">
                <button
                  onClick={() => toggleSection('steps')}
                  className="w-full p-6 flex justify-between items-center text-left"
                >
                  <h2 className="text-xl font-semibold">Steps</h2>
                  {expandedSections.steps ? <ChevronUp /> : <ChevronDown />}
                </button>
                {expandedSections.steps && (
                  <div className="p-6 pt-0 space-y-6">
                    <StepsForm
                      steps={config.steps}
                      onUpdate={handleStepsUpdate}
                    />
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-blue-600 mb-2">Steps Configuration Structure</h4>
                      <p className="text-sm text-gray-600 mb-4">
                        Steps define the sequence of API calls and data transformations in your Blueprint. Each step represents 
                        an action that interacts with the API and processes the response:
                      </p>
                      <ul className="list-disc text-sm text-gray-600 ml-4 mb-4">
                        <li className="mb-2">
                          <strong>Step Configuration:</strong> Defines how to interact with the API
                          <ul className="list-circle ml-4 mt-1">
                            <li>name & description: For identification and documentation</li>
                            <li>type: Usually 'rest' for REST API calls</li>
                            <li>http_method: The HTTP method to use (GET, POST, etc.)</li>
                            <li>endpoint: The API endpoint to call, can use parameter variables</li>
                          </ul>
                        </li>
                        <li className="mb-2">
                          <strong>Variables Output:</strong> Controls how response data is processed
                          <ul className="list-circle ml-4 mt-1">
                            <li>response_location: Where to find data in the response</li>
                            <li>variable_name: How to reference the output</li>
                            <li>variable_format: How to format the data</li>
                          </ul>
                        </li>
                      </ul>
                      <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
{`steps:
  - name: "Get Data"             # Step identifier
    description: "Fetch data"    # Step description
    type: "rest"                # Request type
    http_method: "GET"          # HTTP method
    endpoint: "/api/v1/data"    # API endpoint
    variables_output:           # Output configuration
      - response_location: "data"
        variable_name: "final_output_file"  # References storage config
        variable_format: "json"`}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
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