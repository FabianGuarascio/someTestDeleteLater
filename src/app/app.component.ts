import { Component } from '@angular/core';
import { MapComponent } from '../shared/third-component/map.component';

@Component({
  selector: 'app-root',
  imports: [MapComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'agGridLear';
}
