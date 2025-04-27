import yaml from 'js-yaml';

export interface YAMLValidationResult {
  isValid: boolean;
  error?: string;
  formattedYAML?: string;
}

export const validateAndFormatYAML = (yamlString: string): YAMLValidationResult => {
  try {
    // First, try to parse the YAML to validate its structure
    const parsedYAML = yaml.load(yamlString);
    
    // Then, convert it back to YAML with proper formatting
    const formattedYAML = yaml.dump(parsedYAML, {
      indent: 2,
      lineWidth: -1, // No line wrapping
      noRefs: true, // Don't use YAML references
      sortKeys: false, // Maintain original key order
      quotingType: '"', // Use double quotes for strings
    });

    return {
      isValid: true,
      formattedYAML
    };
  } catch (error) {
    return {
      isValid: false,
      error: error instanceof Error ? error.message : 'Invalid YAML structure'
    };
  }
};

export const formatYAML = (yamlString: string): string => {
  try {
    const parsedYAML = yaml.load(yamlString);
    return yaml.dump(parsedYAML, {
      indent: 2,
      lineWidth: -1,
      noRefs: true,
      sortKeys: false,
      quotingType: '"',
    });
  } catch (error) {
    return yamlString; // Return original string if formatting fails
  }
}; 