// longitude: number, latitude: number, boundingBox: any, width: number, height: number
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

