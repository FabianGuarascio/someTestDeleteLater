export type Coordinates = {
  longitude: number, 
  latitude: number
}
export type WidthAndHeight = {
  width: number, 
  height: number
}

export type BoundingBox = {
  minLongitude: number;
  maxLongitude: number;
  minLatitude: number;
  maxLatitude: number;
}

export type ProjectCreation = Coordinates & WidthAndHeight & {boundingBox:BoundingBox}

type Geometry<T extends 'Polygon' | 'MultiPolygon' | 'LineString'> = {
  type: T;
  coordinates: T extends 'Polygon'
    ? number[][][] 
    : T extends 'MultiPolygon'
    ? number[][][][] 
    : T extends 'LineString'
    ? number[][] 
    : never;
};

export type GeoJSONFeature<T extends 'Polygon' | 'MultiPolygon' | 'LineString' = 'Polygon' | 'MultiPolygon' | 'LineString'> = {
  type: 'Feature';
  geometry: Geometry<T>;
  properties: {
    name?: string;
    [key: string]: any; 
  };
};


export type GeoJSONData = {
  type: 'FeatureCollection';
  features: GeoJSONFeature[];
}


export type USAPoint= {
  longitude: number;
  latitude: number;
  count: number;
}


export type USALineFeature ={
  type: 'Feature';
  geometry: {
    type: 'LineString';
    coordinates: number[][];
  };
  properties: {
    [key: string]: any; 
  };
}

export type USALinesData = {
  type: 'FeatureCollection';
  features: USALineFeature[];
}

export function isPolygon(geometry: Geometry<any>): geometry is Geometry<'Polygon'> {
  return geometry.type === 'Polygon';
}

export function isMultiPolygon(geometry: Geometry<any>): geometry is Geometry<'MultiPolygon'> {
  return geometry.type === 'MultiPolygon';
}

export function isLineString(geometry: Geometry<any>): geometry is Geometry<'LineString'> {
  return geometry.type === 'LineString';
}