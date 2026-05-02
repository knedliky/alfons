/**
 * Co-located field option types for form field components.
 *
 * These types describe the schema-level constraints that PocketBase
 * returns for text, number, and boolean fields. Each field component
 * imports its own options type from this file.
 */

/**
 * Options for text fields — mirrors PocketBase text field schema options
 */
export interface TextFieldOptions {
	min?: number;
	max?: number;
	pattern?: string;
}

/**
 * Options for number fields — mirrors PocketBase number field schema options
 */
export interface NumberFieldOptions {
	min?: number;
	max?: number;
	noDecimal?: boolean;
}

/**
 * Options for boolean fields — reserved for future schema constraints.
 * Currently empty as PocketBase bool fields have no configurable options.
 */
export interface BoolFieldOptions {
	/* No options defined by PocketBase for bool fields at present */
}
