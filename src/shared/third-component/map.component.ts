import { Component, ElementRef, inject, viewChild, ViewChild } from '@angular/core';
import { topologyUsa } from './mockData/topology';
import "ag-charts-enterprise";
import { usaPoints } from './mockData/usa-points';
import { usaLines1 } from './mockData/topology-lines';
import { MarkerService } from '../services/marker/marker.service';
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

  public geojson = topologyUsa
  public usaPoints = usaPoints
  public usaLines = usaLines1;
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
  calculateBoundingBox(features: any[]): { minLongitude: number, maxLongitude: number, minLatitude: number, maxLatitude: number } {
    let minLongitude = Infinity;
    let maxLongitude = -Infinity;
    let minLatitude = Infinity;
    let maxLatitude = -Infinity;

    features.forEach(feature => {
      const geometry = feature.geometry;

      if (geometry.type === 'Polygon' || geometry.type === 'MultiPolygon') {
        const coordinates = geometry.coordinates;

        // Handle MultiPolygon (nested one level deeper)
        if (geometry.type === 'MultiPolygon') {
          coordinates.forEach((polygon: number[][][]) => {
            polygon.forEach((ring: number[][]) => {
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
          });
        } else if (geometry.type === 'Polygon') {
          // Handle Polygon
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
  project(longitude: number, latitude: number, boundingBox: any, width: number, height: number): [number, number] {
    const { minLongitude, maxLongitude, minLatitude, maxLatitude } = boundingBox;
    // Normalize longitude and latitude to fit the SVG dimensions
    const x = ((longitude - minLongitude) / (maxLongitude - minLongitude)) * width;
    const y = ((maxLatitude - latitude) / (maxLatitude - minLatitude)) * height; // Flip y-axis
    return [x, y];
  }

  // Render a polygon
  renderPolygon(coordinates: number[][][], properties: any, svg: SVGSVGElement, boundingBox: any, width: number, height: number) {
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



  renderBackgroundMap( svg:SVGSVGElement , boundingBox:any, width:number, height:number ){
    this.geojson.features.forEach((feature: any) => {
      const geometry = feature.geometry;
      const properties = feature.properties;
      if (geometry.type === 'Polygon') {
        this.renderPolygon(geometry.coordinates, properties, svg, boundingBox, width, height);
      } else if (geometry.type === 'MultiPolygon') {
        geometry.coordinates.forEach((polygonCoords: number[][][]) => {
          this.renderPolygon(polygonCoords, properties, svg, boundingBox, width, height);
        });
      }
    });
  }

  renderMarkerPoints( svg:SVGSVGElement, boundingBox:any, width:number ,height:number ){
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
  renderLine(coordinates: number[][], svg: SVGSVGElement, boundingBox: any, width: number, height: number) {
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

  renderLines(svg: SVGSVGElement, boundingBox: any, width: number, height: number) {
    this.usaLines.features.forEach((feature: any) => {
      const geometry = feature.geometry;
      if (geometry.type === 'LineString') {
        this.renderLine(geometry.coordinates, svg, boundingBox, width, height);
      }
    });
  }

}
