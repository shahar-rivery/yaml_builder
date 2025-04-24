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
    parameters: true,
    connector: true,
    steps: true,
    yaml: true,
    docs: true
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

  const yamlOutput = dump(config);

  return (
    <div className="min-h-screen bg-gray-50 relative">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <FileText size={32} className="text-blue-500 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">YAML Builder</h1>
          </div>
        </div>
        <p className="text-gray-600 mb-8">
          This YAML Builder is designed to help you create and configure your data pipeline without needing to write YAML code manually. 
          It provides a user-friendly interface where you can define your API connections, input parameters, and data processing steps. 
          As you make changes in the interface, the YAML configuration is automatically generated and displayed in the right panel. 
          You can then copy this YAML and use it in your Rivery Blueprint.
        </p>
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
       
        
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="space-y-8 lg:col-span-3">
            <div className="space-y-4">
              <div className="bg-white rounded-lg shadow-lg">
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
                    <div className="bg-gray-50 p-4 rounded-lg shadow-md">
                      <button
                        onClick={() => toggleDocs('connector')}
                        className="w-full flex justify-between items-center text-left mb-2"
                      >
                        <h4 className="font-semibold text-blue-600">Defining the Connector: API Setup & Data Handling                        </h4>
                        {expandedDocs.connector ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                      {expandedDocs.connector && (
                        <div className="space-y-4">
                          <div>
                            <p className="text-sm text-gray-600 mb-4">
                              Sets up API connection details and defines how data should be processed and stored.
                              The connector configuration is the foundation of your Blueprint:
                            </p>
                            <ul className="list-disc text-sm text-gray-600 ml-4 mb-4">
                              <li className="mb-2">
                                <strong>name & base_url:</strong>
                                <ul className="list-circle ml-4 mt-1">
                                  <li>name: Identifies your connector in the system</li>
                                  <li>base_url: Root URL for all API endpoints</li>
                                  <li>Example: https://api.example.com (without trailing slash)</li>
                                </ul>
                              </li>
                              <li className="mb-3">
                                <strong>variables_metadata:</strong> Configures how data is output and stored:
                                <ul className="list-circle ml-4 mt-2">
                                  <li>Defines the format of the output data (e.g., json, csv, parquet)</li>
                                  <li>Specifies the storage location for the output data</li>
                                  <li>Links output variables to storage configurations</li>
                                  <li>Ensures data is processed and stored according to specified formats</li>
                                </ul>
                              </li>
                              <li className="mb-2">
                                <strong>variables_storages:</strong>
                                <ul className="list-circle ml-4 mt-1">
                                  <li>Defines storage locations for your data</li>
                                  <li>Each storage needs a unique name and type</li>
                                  <li>Types include: file_system, s3, azure_blob, etc.</li>
                                  <li>Referenced by variables_metadata for data storage</li>
                                </ul>
                              </li>
                            </ul>
                          </div>

                          <div className="bg-blue-50 p-3 rounded mb-4">
                            <p className="text-sm text-blue-800">
                              <strong>Important:</strong> The variables_metadata section is crucial for ensuring that data is correctly formatted and stored. 
                              It acts as a bridge between your API data and storage system, enabling automatic data processing.
                            </p>
                          </div>

                          <div>
                            <h5 className="font-medium text-gray-700 mb-2">Example Configuration:</h5>
                            <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
{`connector:
  name: "Rivery API"              # Unique identifier for your connector
  base_url: "https://api.example.com"  # Root URL for all endpoints
  
  variables_metadata:             
    final_output_file:           # Example variable for data processing
      format: "json"             # Supported: json, csv, parquet
      storage_name: "results dir" # Must match a storage name
  
  variables_storages:            
    - name: "results dir"        # Referenced by storage_name above
      type: "file_system"        # Storage system type
    - name: "backup_storage"     # Additional storage example
      type: "s3"                 # Cloud storage option`}
                            </pre>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-white rounded-lg shadow-lg">
                <button
                  onClick={() => toggleSection('parameters')}
                  className="w-full p-6 flex justify-between items-center text-left"
                >
                  <h2 className="text-xl font-semibold">Interface Parameters</h2>
                  {expandedSections.parameters ? <ChevronUp /> : <ChevronDown />}
                </button>
                {expandedSections.parameters && (
                  <div className="p-6 pt-0 space-y-6">
                    <p className="text-sm text-gray-600 mb-4">Define the input parameters for your pipeline. These parameters can be used for authentication, filtering data, and customizing API requests.</p>
                    <InterfaceParametersForm
                      parameters={config.interface_parameters.section.source}
                      onUpdate={handleParametersUpdate}
                    />
                    <div className="bg-gray-50 p-4 rounded-lg shadow-md">
                      <button
                        onClick={() => toggleDocs('parameters')}
                        className="w-full flex justify-between items-center text-left mb-2"
                      >
                        <h4 className="font-semibold text-blue-600">Defining Dynamic Inputs: Interface Parameters</h4>
                        {expandedDocs.parameters ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                      {expandedDocs.parameters && (
                        <div className="space-y-4">
                          <div>
                            <p className="text-sm text-gray-600 mb-4">
                              Dynamic variables used throughout your Blueprint for API interactions and data handling.
                              These parameters can be used in endpoints, headers, and query parameters:
                            </p>
                            <ul className="list-disc text-sm text-gray-600 ml-4 mb-4">
                              <li className="mb-2">
                                <strong>String Parameters:</strong>
                                <ul className="list-circle ml-4 mt-1">
                                  <li>Used in API endpoints or query parameters</li>
                                  <li>Can be referenced using {'{parameter_name}'}</li>
                                  <li>Example: /api/v1/accounts/{'{account_id}'}</li>
                                </ul>
                              </li>
                              <li className="mb-2">
                                <strong>Authentication Parameters:</strong>
                                <ul className="list-circle ml-4 mt-1">
                                  <li>Bearer Token: JWT or OAuth tokens</li>
                                  <li>Basic HTTP: Username/password authentication</li>
                                  <li>API Key: Header or query parameter keys</li>
                                  <li>All credentials are securely encrypted</li>
                                </ul>
                              </li>
                              <li className="mb-2">
                                <strong>Date Range Parameters:</strong>
                                <ul className="list-circle ml-4 mt-1">
                                  <li>Filter data by time periods</li>
                                  <li>Supports various date formats</li>
                                  <li>Can be used for incremental data loads</li>
                                </ul>
                              </li>
                            </ul>
                          </div>

                          <div>
                            <h5 className="font-medium text-gray-700 mb-2">Example Configuration:</h5>
                            <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
{`interface_parameters:
  section:
    source:
      - name: "account_id"        # Used in API endpoints
        type: "string"
        description: "Account identifier"
      
      - name: "Auth"             # Authentication setup
        type: "authentication"
        auth_type: "bearer"      # bearer, basic_http, api_key
        fields:
          - name: "bearer_token"
            type: "string"
            is_encrypted: true    # Secure storage
      
      - name: "time_period"      # Date-based filtering
        type: "date_range"
        period_type: "date"      # date or datetime
        format: "YYYY-MM-DD"     # Date format
        fields:
          - name: "start_date"   # Range start
          - name: "end_date"     # Range end`}
                            </pre>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-white rounded-lg shadow-lg">
                <button
                  onClick={() => toggleSection('steps')}
                  className="w-full p-6 flex justify-between items-center text-left"
                >
                  <h2 className="text-xl font-semibold">Workflow Steps</h2>
                  {expandedSections.steps ? <ChevronUp /> : <ChevronDown />}
                </button>
                {expandedSections.steps && (
                  <div className="p-6 pt-0 space-y-6">
                    <StepsForm
                      steps={config.steps}
                      onUpdate={handleStepsUpdate}
                    />
                    <div className="bg-gray-50 p-4 rounded-lg shadow-md">
                      <button
                        onClick={() => toggleDocs('steps')}
                        className="w-full flex justify-between items-center text-left mb-2"
                      >
                        <h4 className="font-semibold text-blue-600">Building the Flow: Step Configuration Explained</h4>
                        {expandedDocs.steps ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                      {expandedDocs.steps && (
                        <div className="space-y-4">
                          <div>
                            <p className="text-sm text-gray-600 mb-4">
                              Steps define the sequence of API calls and how to process their responses. 
                              Each step represents an API interaction and its data handling:
                            </p>
                            <ul className="list-disc text-sm text-gray-600 ml-4 mb-4">
                              <li className="mb-2">
                                <strong>Step Details:</strong>
                                <ul className="list-circle ml-4 mt-1">
                                  <li>name: Identifies the step in logs and monitoring</li>
                                  <li>type: Usually "rest" for REST API calls</li>
                                  <li>description: Helps document the step's purpose</li>
                                  <li>http_method: GET, POST, PUT, DELETE, etc.</li>
                                </ul>
                              </li>
                              <li className="mb-2">
                                <strong>Endpoint Configuration:</strong>
                                <ul className="list-circle ml-4 mt-1">
                                  <li>endpoint: API path relative to base_url</li>
                                  <li>Can include parameter variables: /api/{'{param}'}</li>
                                  <li>Supports query parameters</li>
                                  <li>Can include multiple parameters</li>
                                </ul>
                              </li>
                              <li className="mb-2">
                                <strong>Variables Output:</strong>
                                <ul className="list-circle ml-4 mt-1">
                                  <li>response_location: Path to data in response</li>
                                  <li>variable_name: Where to store the data</li>
                                  <li>variable_format: How to format the data</li>
                                  <li>Use final_output_file to save to storage</li>
                                </ul>
                              </li>
                            </ul>

                            <div className="bg-yellow-50 p-3 rounded mb-4">
                              <p className="text-sm text-yellow-800">
                                <strong>Tip:</strong> When using <code>final_output_file</code> in steps:
                              </p>
                              <ul className="list-disc text-sm text-yellow-800 ml-4 mt-2">
                                <li>The engine will automatically handle data schema creation</li>
                                <li>Data types will be inferred from the response</li>
                                <li>Data will be stored in the configured storage location</li>
                                <li>Multiple steps can write to the same output file</li>
                              </ul>
                            </div>
                          </div>

                          <div>
                            <h5 className="font-medium text-gray-700 mb-2">Example Configuration:</h5>
                            <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
{`steps:
  - name: "Get Account Data"     # Step identifier
    description: "Fetch account information"
    type: "rest"                # API call type
    http_method: "GET"          # HTTP method
    endpoint: "/api/v1/accounts/{account_id}"  # Using parameter
    variables_output:
      - response_location: "data.accounts"  # JSON path to data
        variable_name: "final_output_file"  # Save to storage
        variable_format: "json"             # Output format

`}
                            </pre>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg col-span-2">
            <div className="p-6 flex justify-between items-center">
              <button
                onClick={() => toggleSection('yaml')}
                className="flex-grow text-left flex items-center"
              >
                <h2 className="text-xl font-semibold">Generated YAML</h2>
                {expandedSections.yaml ? <ChevronUp className="ml-2" /> : <ChevronDown className="ml-2" />}
              </button>
              {expandedSections.yaml && (
                <div className="flex items-center space-x-2">
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
                </div>
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