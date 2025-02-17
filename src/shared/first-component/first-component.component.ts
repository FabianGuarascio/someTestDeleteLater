
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { AgCharts } from "ag-charts-angular";
import "ag-charts-enterprise";
import { AgGridAngular } from 'ag-grid-angular';
import type { ColDef } from 'ag-grid-community';
import { AgChartOptions } from "ag-charts-enterprise";

import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { central, eastern, mountain, pacific,newSerie } from "./data";
// import { topology } from "./topology";
import { topology2 } from "./topology2";
import { backgroundTopology } from "./backgroundTopology";
import { GeoJSON } from 'ag-charts-enterprise';
import { data } from './data2'

@Component({
  selector: 'app-first-component',
  imports: [AgCharts],
  template: `
  <ag-charts [options]="options"></ag-charts>
`,
  styleUrl: './first-component.component.scss'
})
export class FirstComponentComponent {
  public options:any;
  


  
  constructor(private http: HttpClient) { 

    // this.options = {
    //   title: {
    //     text: "Timezones Across America",
    //   },
    //   topology,
    //   series: [
    //     {
    //       type: "map-shape",
    //       data: pacific,
    //       idKey: "name",
    //       title: "Pacific",
    //     },
    //     {
    //       type: "map-shape",
    //       data: mountain,
    //       idKey: "name",
    //       title: "Mountain",
    //     },
    //     {
    //       type: "map-shape",
    //       data: central,
    //       idKey: "name",
    //       title: "Central",
    //     },
    //     {
    //       type: "map-shape",
    //       data: eastern,
    //       idKey: "name",
    //       title: "Eastern",
    //     },{
    //       type: "map-shape",
    //       data: newSerie,
    //       idKey: "name",
    //       title: "Eastern",
    //     },
    //   ],
    //   legend: {
    //     enabled: true,
    //   },
    // };
    this.options = {
      title: {
        text: "UK Cities",
      },
      data:[{ name: "London", population: 11262000 }],
      topology: topology2,
      series: [
        {
          type: "map-shape-background",
          topology: backgroundTopology,
        },
        {
          type: "map-marker",
          idKey: "name",
        },
      ],
    };
  }

}


