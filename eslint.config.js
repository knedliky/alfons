import { includeIgnoreFile } from '@eslint/compat';
import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import svelte from 'eslint-plugin-svelte';
import globals from 'globals';
import { fileURLToPath } from 'node:url';
import ts from 'typescript-eslint';
import svelteConfig from './svelte.config.ts';

const gitignorePath = fileURLToPath(new URL('./.gitignore', import.meta.url));

export default ts.config(
	includeIgnoreFile(gitignorePath),
	js.configs.recommended,
	...ts.configs.recommended,
	...svelte.configs.recommended,
	prettier,
	...svelte.configs.prettier,
	{
		languageOptions: {
			globals: { ...globals.browser, ...globals.node }
		},
		rules: {
			// typescript-eslint advise against no-undef on TypeScript projects.
			'no-undef': 'off',

			// CLAUDE.md's three Svelte 5 review-checklist rules, moved out of prose.
			// eslint-plugin-svelte has no rule for any of them — legacy syntax is
			// still valid Svelte, so only a reader would have caught it. Expressed
			// as syntax selectors instead.
			'no-restricted-syntax': [
				'error',
				{
					selector: 'ExportNamedDeclaration > VariableDeclaration[kind="let"]',
					message: 'Use the $props() rune, not `export let` (Svelte 5 runes only).'
				},
				{
					// svelte-eslint-parser emits SvelteReactiveStatement, not a
					// LabeledStatement — the obvious selector matches nothing, and
					// the rule fails silently. Verified by probe.
					selector: 'SvelteReactiveStatement',
					message: 'Use $derived() or $effect(), not a `$:` reactive statement.'
				},
				{
					selector: 'CallExpression[callee.name="createEventDispatcher"]',
					message: 'Use callback props or Svelte 5 events, not createEventDispatcher.'
				}
			],
			'svelte/no-reactive-reassign': 'error',
			'svelte/valid-compile': 'error',

			// Downgraded to warn — existing violations to clear incrementally rather
			// than a gate that fails on day one. Same posture as Atlas.
			'@typescript-eslint/no-explicit-any': 'warn',
			'@typescript-eslint/no-empty-object-type': 'warn',
			'@typescript-eslint/no-unused-vars': [
				'warn',
				{ argsIgnorePattern: '^_', varsIgnorePattern: '^_' }
			],
			'svelte/require-each-key': 'warn',

			// Off, matching Atlas: the svelte-ignore comments are deliberate and
			// this rule fires on all 116 of them, and the navigation rules are
			// false positives on mailto: and external URLs.
			'svelte/no-unused-svelte-ignore': 'off',
			'svelte/no-navigation-without-resolve': 'off',
			'svelte/no-navigation-without-base': 'off'
		}
	},
	{
		// Story files use explicit snippet wrappers and literal mustaches for
		// code samples — intentional patterns, not defects.
		files: ['**/*.stories.svelte', '**/*.stories.ts'],
		rules: {
			'svelte/no-useless-mustaches': 'off',
			'svelte/no-useless-children-snippet': 'off',
			'@typescript-eslint/no-unused-vars': 'off',
			'@typescript-eslint/no-explicit-any': 'off'
		}
	},
	{
		// Without this the Svelte files are parsed as plain JS, and every
		// `<script lang="ts">` fails on the first `interface` or type annotation.
		files: ['**/*.svelte', '**/*.svelte.ts', '**/*.svelte.js'],
		languageOptions: {
			parserOptions: {
				parser: ts.parser,
				extraFileExtensions: ['.svelte'],
				svelteConfig
			}
		}
	},
	{
		// Generated output — the manifest is checked by regenerating it, not linted.
		ignores: ['alfons.manifest.json', 'storybook-static/', 'screenshots/']
	}
);
