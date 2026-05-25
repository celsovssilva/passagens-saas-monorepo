import { Component } from '@angular/core';
import { RouterLink } from '@angular/router'; // 👈 Importante!

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [RouterLink], // 👈 Permite usar o routerLink no HTML deste componente
  templateUrl: './landing-page.html',
  styleUrl: './landing-page.css'
})
export class LandingPageComponent {}
