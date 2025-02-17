import { Component, ElementRef, inject, viewChild, ViewChild } from '@angular/core';
import { topologyUsa } from './topology';
import "ag-charts-enterprise";
import { AgCharts } from "ag-charts-angular";
import { MarkerService } from '../../app/marker.service';
@Component({
  selector: 'app-third-component',
  imports: [],
  templateUrl: './third-component.component.html' ,
  styleUrl: './third-component.component.scss'
})
export class ThirdComponentComponent {

  public geojson = topologyUsa
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
    polygon.setAttribute('fill', '#ccc'); // Default fill color
    polygon.setAttribute('stroke', '#333'); // Default stroke color
    polygon.setAttribute('stroke-width', '0.5');
    svg.appendChild(polygon);
  }

  // Render a marker with a badge number
  renderMarker( longitude: number,latitude: number, label: string, badgeNumber: number, svg: SVGSVGElement, boundingBox: any, width: number, height: number) {
    const [x, y] = this.project(longitude, latitude, boundingBox, width, height);

    console.log("desde eñ render marker",x,y)

    // Create a circle for the marker
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', x.toString());
    circle.setAttribute('cy', y.toString());
    circle.setAttribute('r', '12'); // Radius of the circle
    circle.setAttribute('fill', 'red'); // Marker color
    circle.setAttribute('stroke', 'white'); // Marker border color
    circle.setAttribute('stroke-width', '1');
    circle.setAttribute('data-name', label);
    circle.classList.add('marker');

    // Add the marker to the SVG
    svg.appendChild(circle);

    // Add a badge number inside the circle
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', x.toString());
    text.setAttribute('y', y.toString());
    text.setAttribute('fill', 'white');
    text.setAttribute('font-size', '10');
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('dominant-baseline', 'middle');
    text.textContent = badgeNumber.toString();
    svg.appendChild(text);

    // Add a label for the marker (optional)
    const labelText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    labelText.setAttribute('x', (x + 15).toString()); // Offset the label
    labelText.setAttribute('y', y.toString());
    labelText.setAttribute('fill', 'black');
    labelText.setAttribute('font-size', '12');
    labelText.textContent = label;
    svg.appendChild(labelText);
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

    // Render each feature
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
    // Example markers with badge numbers
    const [x1, y1] = this.project( -118.2437, 34.0522,boundingBox, width, height);
    const svgMarker = this.markerService.createSvgMarker(x1,y1, 1, 'New York');
    svg.appendChild(svgMarker);
  }
}
