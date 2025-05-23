import { AuthType } from './components/InterfaceParametersForm';

export interface InterfaceParameter {
  name: string;
  type: string;
  value: string;
  auth_type?: AuthType;
  fields?: InterfaceParameter[];
  is_encrypted?: boolean;
}

export interface Section {
  source: InterfaceParameter[];
}

export interface VariableMetadata {
  format: string;
  storage_name: string;
}

export interface Connector {
  name: string;
  base_url: string;
  default_headers: Record<string, string>;
  variables_metadata: Record<string, VariableMetadata>;
  variables_storages: Array<{
    name: string;
    type: string;
  }>;
}

export interface LoopConfig {
  type: string;
  variable_name: string;
  item_name: string;
  add_to_results: boolean;
}

export interface LoopStep {
  name: string;
  description: string;
  type: 'loop';
  loop: LoopConfig;
  steps: Step[];
}

export interface Step {
  name: string;
  description: string;
  type: string;
  http_method?: string;
  endpoint?: string;
  variables_output?: Array<{
    response_location: string;
    variable_name: string;
    variable_format: string;
    overwrite_storage?: boolean;
    transformation_layers?: Array<{
      type: string;
      from_type: string;
      json_path: string;
    }>;
  }>;
  steps?: Step[];
  loop?: {
    type: string;
    variable_name: string;
    item_name: string;
    add_to_results: boolean;
  };
  pagination?: Pagination;
}

export interface Pagination {
  type: string;
  parameters?: Array<{
    name: string;
    value: number;
    increment_by: number;
  }>;
  break_conditions: Array<{
    name: string;
    condition: {
      type: string;
      value?: string;
    };
    variable: string;
  }>;
  location: string;
  cursor_path?: string;
  variables_output?: Array<{
    response_location: string;
    variable_name: string;
    variable_format: string;
    overwrite_storage?: boolean;
    transformation_layers?: Array<{
      type: string;
      from_type: string;
      json_path: string;
    }>;
  }>;
}


export interface YAMLConfig {
  interface_parameters: {
    section: Section;
  };
  connector: Connector;
  steps: Step[];
}