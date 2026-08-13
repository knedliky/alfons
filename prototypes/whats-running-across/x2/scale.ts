/**
 * The two scales the running view renders at, read as two camera distances.
 *
 * Carried from the settled two-scale finding, translated into this approach's
 * material: 'map' is the high camera, every runner lit in one frame with the
 * whole corpus around them; 'task' is the low camera, one runner filling the
 * frame's attention. The control between them is the same one control the
 * finding requires — it just moves a camera now instead of swapping layouts.
 *
 * A release or a project under the camera is not a third scale. It is a
 * different place at a middle distance, reached by tapping the map itself,
 * which is why it does not appear in this type: the scale control must not
 * become the way up, that being a neighbouring approach's experiment.
 */
export type CameraDistance = 'map' | 'task';
