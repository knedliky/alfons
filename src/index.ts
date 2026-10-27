/**
 * Motif Design Library
 *
 * CSS tokens are separate entry points — import them directly:
 *   @import '@alfons/design/public';
 *   @import '@alfons/design/base';
 *
 * Component usage:
 *   import { Button, Input } from '@alfons/design';
 *
 * Themes are token values applied with data-theme, never a script context
 * (D-238): <div data-theme="admin"> puts its subtree on the admin overlay.
 */
export * from './components/index.js';
