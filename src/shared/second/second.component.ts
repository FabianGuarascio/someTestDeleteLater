import { Component } from '@angular/core';
import { AgCharts } from "ag-charts-angular";
import { AgChartOptions } from "ag-charts-enterprise";
import { backgroundTopology } from "./backgroundTopology";
import { data } from "./data";
import { data2 } from "./data2";
import { usa2 } from "./custom.geo";
import { topology } from "./topology";
import "ag-charts-enterprise";

@Component({
  selector: 'app-second',
  imports: [AgCharts],
  template: `
    <ag-charts [options]="options"></ag-charts>
`,
  styleUrl: './second.component.scss'
})
export class SecondComponent {
  coso = usa2.features[0]
  public options:any;
  constructor() {
    
    this.options = {
      title: {
        text: "Crime in Surrey",
      },
      data:data2,
      series: [
        {
          type: "map-shape-background",
          topology: usa2,
          
        },
        {
          type: "map-marker",
          latitudeKey: "lat",
          longitudeKey: "lon",
          sizeKey: "count",
          sizeName: "Count",
          size: 10,
          maxSize: 10,
          shape:'cross'
        },
      ],
    };
  }
}
