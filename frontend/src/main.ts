import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app'; // 👈 Mudado de 'App' para 'AppComponent'
import { appConfig } from './app/app.config';

bootstrapApplication(AppComponent, appConfig) // 👈 Usando o nome correto aqui também
  .catch((err) => console.error(err));
