export interface Point {
  x: number;
  y: number;
}

export interface SvgBoundaryBox {
  topLeft: Point;
  bottomright: Point;
}

export interface MapBoundaryBox {
  topLeft: Point;
  bottomright: Point;
}

export interface SvgCenter {
  x: number;
  y: number;
}

export class MapLibrePolygon {
  type!: string;
  geometry!: {
    type: string;
    coordinates: number[][];
  };
  properties!: {
    label: string;
    rotate: number;
    color: string;
  };
}
