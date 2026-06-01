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
  // Objeto vinculado aos inputs do formulário HTML
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
      next: (response) => {
        console.log('Login efetuado com sucesso!', response);

        // Trata o token caso venha encapsulado em um objeto ou como string pura
        const token = response && typeof response === 'object' ? (response.token || response.tokenAcesso) : response;

        // Garante a leitura do token ativo (seja retornado na response ou já salvo pelo AuthService)
        const tokenAtivo = token || localStorage.getItem('token');

        if (tokenAtivo) {
          try {
            // Salva o token para garantir persistência nas requisições HTTP do Dashboard
            localStorage.setItem('token', tokenAtivo);

            // Decodifica a seção do Payload do JWT (segunda parte do token)
            const parts = tokenAtivo.split('.');
            const base64Url = parts[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const payload = JSON.parse(window.atob(base64));

            // Lê a claim de nível de acesso (role/authority) e sanitiza o texto (.trim())
            let roleUsuario = payload.role || payload.authority || '';
            roleUsuario = roleUsuario.toString().trim().toUpperCase();

            console.log('Nível de acesso identificado e tratado:', roleUsuario);

            // Salva os dados de escopo no localStorage para validação das telas internas
            localStorage.setItem('role', roleUsuario);
            localStorage.setItem('email', payload.sub || '');

            if (payload.empresaId) {
              localStorage.setItem('empresaId', payload.empresaId.toString());
            }

            // REDIRECIONAMENTO BASEADO NA ROLE SANITIZADA
            if (roleUsuario.includes('EMPRESA')) {
              this.router.navigate(['/dashboard-empresa']);
            } else if (roleUsuario.includes('ADMIN')) {
              this.router.navigate(['/dashboard']);
            } else {
              this.router.navigate(['/area-passageiro']);
            }
            return; // Interrompe a execução para não cair no fallback abaixo
          } catch (e) {
            console.error('Erro ao decodificar payload do token JWT:', e);
          }
        }

        // Fallback de segurança caso o formato do token mude inesperadamente
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        console.error('Erro ao fazer login:', err);
        alert('Usuário ou senha incorretos.');
      }
    });
  }
}
