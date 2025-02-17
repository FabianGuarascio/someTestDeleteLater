import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FirstComponentComponent } from '../shared/first-component/first-component.component';
import { SecondComponent } from "../shared/second/second.component";
import { ThirdComponentComponent } from '../shared/third-component/third-component.component';

@Component({
  selector: 'app-root',
  imports: [ FirstComponentComponent, SecondComponent, ThirdComponentComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'agGridLear';
}
