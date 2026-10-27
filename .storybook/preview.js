// Storybook preview configuration for the Motif design library.
// Applies global decorators and parameters that affect every story.

// Import the distributed token files directly so every story canvas receives
// the same design tokens that library consumers will receive. These are the
// source-of-truth files — do NOT import src/app.css here.
// public.css carries every theme, the admin overlay included (D-238).
import '../src/tokens/public.css';
import '../src/tokens/base.css';

// Apply a global decorator to every story.
// Sets data-colour-mode="dark" on the root HTML element so that Motif's
// CSS custom properties resolve to their dark-mode values by default.
export const decorators = [
	(story) => {
		document.documentElement.setAttribute('data-colour-mode', 'dark');
		return story();
	},
	// `parameters: { theme: 'admin' }` puts a story on that theme (D-238). It
	// goes on <html> rather than a wrapper so that menus portalled to <body>
	// sit inside it too, and it is cleared for every other story because the
	// canvas document is reused between them.
	(story, context) => {
		const theme = context.parameters.theme;
		if (theme) document.documentElement.setAttribute('data-theme', theme);
		else document.documentElement.removeAttribute('data-theme');
		return story();
	}
];

export const parameters = {
	// Centre each story in the canvas so components render with equal
	// whitespace on all sides regardless of their natural width
	layout: 'centered',

	// Disable the built-in backgrounds panel — Motif manages its own
	// background colours through the data-colour-mode attribute above
	backgrounds: { disable: true }
};
