import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../service/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {
  credenciais = {
    login: '',
    senha: ''
  };

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  executarLogin() {
    const dadosLogin = {
      login: this.credenciais.login,
      senha: this.credenciais.senha
    };

    this.authService.login(dadosLogin).subscribe({
      next: (response: any) => {
        console.log('Login efetuado com sucesso!', response);

        const token = response && typeof response === 'object' ? (response.token || response.tokenAcesso) : response;
        const tokenAtivo = token || localStorage.getItem('token');

        if (tokenAtivo) {
          try {
            localStorage.setItem('token', tokenAtivo);

            const parts = tokenAtivo.split('.');
            const base64Url = parts[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const payload = JSON.parse(window.atob(base64));

            // Salva o ID correto do usuário para a Área do Passageiro não quebrar
            const idUsuario = response.userId || response.id || response.user?.id || payload.sub;
            if (idUsuario) {
              localStorage.setItem('userId', idUsuario.toString());
            }

            let roleUsuario = payload.role || payload.authority || '';
            roleUsuario = roleUsuario.toString().trim().toUpperCase();

            console.log('Nível de acesso identificado e tratado:', roleUsuario);

            localStorage.setItem('role', roleUsuario);
            localStorage.setItem('email', payload.sub || '');

            if (payload.empresaId) {
              localStorage.setItem('empresaId', payload.empresaId.toString());
            }

            if (roleUsuario.includes('EMPRESA')) {
              this.router.navigate(['/dashboard-empresa']);
            } else if (roleUsuario.includes('ADMIN')) {
              this.router.navigate(['/dashboard']);
            } else {
              this.router.navigate(['/area-passageiro']);
            }
            return;
          } catch (e) {
            console.error('Erro ao decodificar payload do token JWT:', e);
          }
        }

        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        console.error('Erro ao fazer login:', err);
        alert('Usuário ou senha incorretos.');
      }
    });
  }
}
