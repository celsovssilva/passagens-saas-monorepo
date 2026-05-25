import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router'; // Retiramos o RouterLink daqui

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet], // Deixamos apenas o RouterOutlet
  template: `<router-outlet></router-outlet>`
})
export class AppComponent {
  title = 'transport-front';
}
