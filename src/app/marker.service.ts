import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MarkerService {

  createSvgMarker(
    xLong: number,
    yLat: number,
    scale: number = 2, // Add a scale parameter (default is 1 for original size)
  ): SVGSVGElement {
    // Base dimensions of the SVG
    const baseWidth = 10;
    const baseHeight = 14;
  
    // Scaled dimensions
    const scaledWidth = baseWidth * scale;
    const scaledHeight = baseHeight * scale;
  
    // Create the SVG element
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', scaledWidth.toString());
    svg.setAttribute('height', scaledHeight.toString());
    svg.setAttribute('viewBox', `0 0 ${baseWidth} ${baseHeight}`);
    svg.setAttribute('x', (xLong - scaledWidth / 2).toString()); // Center horizontally
    svg.setAttribute('y', (yLat - scaledHeight).toString()); // Position vertically
  
    // Use custom SVG if provided, otherwise use the default path
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('fill-rule', 'evenodd');
    path.setAttribute('clip-rule', 'evenodd');
    path.setAttribute('d', 'M0.248291 4.83217C0.248291 1.99003 2.2606 0.0839844 4.73709 0.0839844C7.21597 0.0839844 9.20769 1.99247 9.20769 4.83217C9.20769 7.86823 7.5708 11.0263 4.94622 12.6562C4.81285 12.739 4.64415 12.7392 4.51059 12.6567C1.87111 11.0262 0.248291 7.86547 0.248291 4.83217ZM4.73709 0.912639C2.73472 0.912639 1.07618 2.4306 1.07618 4.83217C1.07618 7.5139 2.47705 10.3047 4.72741 11.8113C6.96755 10.3041 8.3798 7.51416 8.3798 4.83217C8.3798 2.42815 6.73709 0.912639 4.73709 0.912639ZM4.72799 3.08703C3.75638 3.08703 2.96873 3.87541 2.96873 4.84792C2.96873 5.82043 3.75638 6.60881 4.72799 6.60881C5.6996 6.60881 6.48725 5.82043 6.48725 4.84792C6.48725 3.87541 5.6996 3.08703 4.72799 3.08703ZM2.14084 4.84792C2.14084 3.41775 3.29915 2.25837 4.72799 2.25837C6.15683 2.25837 7.31514 3.41775 7.31514 4.84792C7.31514 6.27809 6.15683 7.43747 4.72799 7.43747C3.29915 7.43747 2.14084 6.27809 2.14084 4.84792ZM1.42059 12.3027C1.42108 12.2301 1.43933 12.1699 1.53481 12.0927C1.65545 11.9953 1.89383 11.8802 2.34183 11.7764L2.1551 10.9691C1.66262 11.0832 1.28009 11.2337 1.01494 11.4478C0.725957 11.6812 0.592692 11.9779 0.592692 12.3058C0.592692 12.6569 0.812225 12.9243 1.04424 13.106C1.28341 13.2933 1.60423 13.4464 1.96513 13.5684C2.69128 13.8139 3.66911 13.9631 4.73213 13.9631C5.79514 13.9631 6.77297 13.8139 7.49912 13.5684C7.86002 13.4464 8.18084 13.2933 8.42002 13.106C8.65203 12.9243 8.87156 12.6569 8.87156 12.3058C8.87156 11.9776 8.73784 11.681 8.44892 11.4478C8.18375 11.2337 7.80131 11.0832 7.30923 10.9691L7.12235 11.7764C7.56991 11.8802 7.8084 11.9953 7.92922 12.0928C8.02496 12.1701 8.04318 12.2304 8.04367 12.3027C8.04184 12.3102 8.02566 12.3627 7.90986 12.4534C7.77208 12.5613 7.54743 12.6775 7.23422 12.7834C6.61215 12.9936 5.72724 13.1345 4.73213 13.1345C3.73702 13.1345 2.8521 12.9936 2.23004 12.7834C1.91683 12.6775 1.69218 12.5613 1.5544 12.4534C1.43859 12.3627 1.42241 12.3102 1.42059 12.3027Z');
    path.setAttribute('fill', '#002418'); // Set the fill color
    svg.appendChild(path);
    return svg;
  }

  createCircleMarker(
    xLong: number,
    yLat: number,
    badgeNumber: number,
    label: string,
    scale = 2,
    markerWidth: number = 13, // Width of the SVG marker
    markerHeight: number = 18, // Height of the SVG marker
    radius: number = 10, // Radius of the circle
    fill: string = 'orange', // Fill color of the circle
    stroke: string = 'white', // Stroke color of the circle

  ): [SVGCircleElement,SVGTextElement] {
    // Calculate the position of the circle at the top-right corner of the marker

    const scaledWidth = markerWidth * scale;
    const scaledHeight = markerHeight * scale;
    const circleX = (xLong + scaledWidth) - radius; // Top-right X position
    const circleY = (yLat - scaledHeight) + radius; // Top-right Y position
  
    // Create the circle element
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', circleX.toString());
    circle.setAttribute('cy', circleY.toString());
    circle.setAttribute('r', radius.toString());
    circle.setAttribute('fill', fill);
    circle.setAttribute('stroke', stroke);
    circle.setAttribute('stroke-width', '1');
    circle.setAttribute('data-name', label);
    circle.classList.add('marker');
  
  // Add a badge number inside the circle (optional)
  const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  text.setAttribute('x', circleX.toString());
  text.setAttribute('y', circleY.toString());
  text.setAttribute('fill', 'white');
  text.setAttribute('font-size', '12'); // Increased font size
  text.setAttribute('text-anchor', 'middle');
  text.setAttribute('dominant-baseline', 'central'); // Changed to 'central'
  text.textContent = badgeNumber.toString();
  
  
    return [circle, text];
  }

  createSvgCustomPlusCricle( xLong:number, yLat:number, scale:number , badgeNumber:number ){
    const svgMarker = this.createSvgMarker(xLong,yLat,scale)
    const [circle, text] = this.createCircleMarker(xLong,yLat,badgeNumber,'',scale)
    return [svgMarker ,circle ,text]
  }

}
