import { Routes } from '@angular/router';
import { LandingPageComponent } from './components/landing-page/landing-page';
import { LoginComponent } from './components/login/login'; // 👈 Mudado de Login para LoginComponent
import { CadastroComponent } from './components/cadastro/cadastro';// 👈 Mudado de Cadastro para CadastroComponent
import {DashboardComponent} from './components/dashboard/dashboard';
import { DashboardEmpresaComponent } from './components/area-empresa/dashboard-empresa'; // Seu componente novo!
import {authGuard} from './service/auth.guard';

export const routes: Routes = [
  { path: '', component: LandingPageComponent },
  { path: 'login', component: LoginComponent },       // 👈 Usando LoginComponent aqui
  { path: 'cadastro', component: CadastroComponent } ,// 👈 Usando CadastroComponent aqui
  { path: 'dashboard-empresa', component: DashboardEmpresaComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] }];
