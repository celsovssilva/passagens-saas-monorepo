import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../service/auth.service'; // Ajuste o caminho de pastas se necessário

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {
  // Sincronizado com o [(ngModel)]="credenciais.login" e "credenciais.senha" do seu HTML
  credenciais = { login: '', senha: '' };
  errorMessage = '';

  constructor(private authService: AuthService) {}

  // Sincronizado com o (ngSubmit)="executarLogin()" do seu HTML
  executarLogin() {
    this.errorMessage = '';

    // Mapeia os campos em português para o que o AuthService/Backend esperam (geralmente email e password)
    const dadosLogin = {
      login: this.credenciais.login,
      senha: this.credenciais.senha
    };

    this.authService.login(dadosLogin).subscribe({
      next: (response) => {
        console.log('Login efetuado com sucesso!', response);
      },
      error: (err) => {
        this.errorMessage = 'Credenciais inválidas. Verifique seu usuário e senha.';
        console.error('Erro no login:', err);
      }
    });
  }
}
