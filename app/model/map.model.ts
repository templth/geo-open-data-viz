export class Layer {
  id: string;
  type: string;
  rank: number;
  name: string;
  applied: boolean;
  visible: boolean;
  maps:Map[];
}

// Graticule layer

export class GraticuleLayerDisplay {
  background: boolean;
  lines: boolean;
  border: boolean;
}

export class GraticuleLayerStyles {
  background: { fill: string };
  border: { stroke: string, strokeWidth: string };
  lines: { stroke: string, strokeWidth: string, strokeOpacity: string };
}

export class GraticuleLayer extends Layer {
  display: GraticuleLayerDisplay;
  styles: GraticuleLayerStyles;
}

// Geo data layer

export class GeodataLayerStyles {
  background: { fill: string };
  lines: { stroke: string, strokeWidth: string, strokeOpacity: string };
}

export class GeodataLayerDisplay {
  fill: { categorical: any }
}

export class GeodataLayer extends Layer {
  styles: GeodataLayerStyles;
  fill: GeodataLayerDisplay;
}

// Shape layer

// Map

export class Map {
  id: string;
  name: string;
  layers: Layer[];
}