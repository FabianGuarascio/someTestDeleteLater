import { Component, ElementRef, inject, viewChild, ViewChild } from '@angular/core';
import { topologyUsa } from './mockData/topology';
import "ag-charts-enterprise";
import { usaPoints } from './mockData/usa-points';
import { usaLines1 } from './mockData/topology-lines';
import { MarkerService } from '../services/marker/marker.service';
import { BoundingBox, GeoJSONData, GeoJSONFeature, isMultiPolygon, isPolygon, USALinesData, USAPoint } from '../types/types';
@Component({
  selector: 'app-third-component',
  imports: [],
  template: ` 
    <div #mapContainer class="map-container">
      <svg #map></svg>
    </div>
    ` ,
  styleUrl: './map.component.scss'
})
export class MapComponent {

  public geojson: GeoJSONData  = topologyUsa as GeoJSONData
  public usaPoints: USAPoint[] = usaPoints as USAPoint[]
  public usaLines:USALinesData = usaLines1 as USALinesData;
  private resizeObserver: ResizeObserver | null = null;
  mapContainer = viewChild<ElementRef<HTMLElement>>('mapContainer')
  map = viewChild<ElementRef<SVGSVGElement>>('map')
  markerService = inject(MarkerService)

  ngAfterViewInit() {
    this.renderMap();
    this.resizeObserver = new ResizeObserver(() => this.renderMap());
    this.resizeObserver.observe(this.mapContainer()!.nativeElement);
  }

  ngOnDestroy() {
    // Clean up the ResizeObserver when the component is destroyed
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  }
  // Calculate the bounding box of the GeoJSON features
  calculateBoundingBox(features: GeoJSONFeature[]): BoundingBox {
    let minLongitude = Infinity;
    let maxLongitude = -Infinity;
    let minLatitude = Infinity;
    let maxLatitude = -Infinity;

    features.forEach(feature => {
      const geometry = feature.geometry;

      if (geometry.type === 'Polygon' || geometry.type === 'MultiPolygon') {
        
        // Handle MultiPolygon (nested one level deeper)
        if (isMultiPolygon(geometry)) {
          const coordinates = geometry.coordinates;
          coordinates.forEach((polygon) => {
            polygon.forEach((ring) => {
              ring.forEach((coord) => {
                if (Array.isArray(coord) && coord.length >= 2) {
                  const [longitude, latitude] = coord;
                  if (longitude < minLongitude) minLongitude = longitude;
                  if (longitude > maxLongitude) maxLongitude = longitude;
                  if (latitude < minLatitude) minLatitude = latitude;
                  if (latitude > maxLatitude) maxLatitude = latitude;
                }
              });
            });
          });
        } else if (isPolygon(geometry)) {
          // Handle Polygon
          const coordinates = geometry.coordinates;
          coordinates.forEach((ring: number[][]) => {
            ring.forEach((coord: number[]) => {
              if (Array.isArray(coord) && coord.length >= 2) {
                const [longitude, latitude] = coord;
                if (longitude < minLongitude) minLongitude = longitude;
                if (longitude > maxLongitude) maxLongitude = longitude;
                if (latitude < minLatitude) minLatitude = latitude;
                if (latitude > maxLatitude) maxLatitude = latitude;
              }
            });
          });
        }
      }
    });

    return { minLongitude, maxLongitude, minLatitude, maxLatitude };
  }

  // Project geographic coordinates to SVG coordinates
  project(longitude: number, latitude: number, boundingBox: BoundingBox, width: number, height: number): [number, number] {
    const { minLongitude, maxLongitude, minLatitude, maxLatitude } = boundingBox;
    // Normalize longitude and latitude to fit the SVG dimensions
    const x = ((longitude - minLongitude) / (maxLongitude - minLongitude)) * width;
    const y = ((maxLatitude - latitude) / (maxLatitude - minLatitude)) * height; // Flip y-axis
    return [x, y];
  }

  // Render a polygon
  renderPolygon(coordinates: number[][][], properties: any, svg: SVGSVGElement, boundingBox: BoundingBox, width: number, height: number) {
    const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    const points = coordinates[0]
      .map((coord) => this.project(coord[0], coord[1], boundingBox, width, height).join(','))
      .join(' ');
    polygon.setAttribute('points', points);
    polygon.setAttribute('data-name', properties.name);
    polygon.setAttribute('fill', '#E5F1CC'); // Default fill color
    polygon.setAttribute('stroke', '#E5F1CC'); // Default stroke color
    polygon.setAttribute('stroke-width', '0.5');
    svg.appendChild(polygon);
  }



  renderBackgroundMap( svg:SVGSVGElement , boundingBox:BoundingBox, width:number, height:number ){
    this.geojson.features.forEach((feature) => {
      const geometry = feature.geometry;
      const properties = feature.properties;
      if (isPolygon(geometry)) {
        this.renderPolygon(geometry.coordinates, properties, svg, boundingBox, width, height);
      } else if (isMultiPolygon(geometry)) {
        geometry.coordinates.forEach((polygonCoords: number[][][]) => {
          this.renderPolygon(polygonCoords, properties, svg, boundingBox, width, height);
        });
      }
    });
  }

  renderMarkerPoints( svg:SVGSVGElement, boundingBox:BoundingBox, width:number ,height:number ){
    this.usaPoints.forEach(point=>{
      const [xPoint, yPoint] = this.project( point.longitude, point.latitude,boundingBox, width, height);
      this.markerService.createSvgCustomPlusCricle(xPoint,yPoint,2,point.count).forEach(el=>{
        svg.appendChild(el)
      })
    })
  }

  // Render the map
  renderMap() {
    const container = this.mapContainer()!.nativeElement;
    const svg = this.map()!.nativeElement;
    if (!svg || !(svg instanceof SVGSVGElement)) {
      throw new Error('SVG element not found or is not an SVGSVGElement');
    }

    // Set SVG dimensions based on the container size
    const width = container.clientWidth;
    const height = container.clientHeight;
    svg.setAttribute('width', width.toString());
    svg.setAttribute('height', height.toString());

    // Clear previous SVG content
    svg.innerHTML = '';

    // Calculate the bounding box of the GeoJSON features
    const boundingBox = this.calculateBoundingBox(this.geojson.features);
    this.renderBackgroundMap(svg, boundingBox, width,height)
    this.renderLines(svg, boundingBox, width, height);
    this.renderMarkerPoints(svg, boundingBox, width,height)
  }

  // Render a line
  renderLine(coordinates: number[][], svg: SVGSVGElement, boundingBox: BoundingBox, width: number, height: number) {
    const polyline = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
  
    // Convert geographic coordinates to SVG coordinates
    const points = coordinates
      .map((coord) => this.project(coord[0], coord[1], boundingBox, width, height).join(','))
      .join(' ');
  
    polyline.setAttribute('points', points);
    polyline.setAttribute('stroke', '#000'); // Line color
    polyline.setAttribute('stroke-width', '2'); // Line thickness
    polyline.setAttribute('fill', 'none'); // No fill
    svg.appendChild(polyline);
  }

  renderLines(svg: SVGSVGElement, boundingBox: BoundingBox, width: number, height: number) {
    this.usaLines.features.forEach((feature) => {
      const geometry = feature.geometry;
      this.renderLine(geometry.coordinates, svg, boundingBox, width, height);
    });
  }

}
