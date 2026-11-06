import { Layer } from 'Model/Layer'

/** Larger result paints in front. A smaller `order` is in front, in the editor and in play. */
export const drawOrder = (layer: Pick<Layer, 'order'>): number => -layer.order
