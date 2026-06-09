
# 🚀 Transport System - Fullstack Application

Sistema corporativo ponta a ponta para gerenciamento de frotas de transporte, controle de rotas e venda automatizada de passagens. O ecossistema é composto por um **Backend** robusto construído sob a arquitetura em camadas com Spring Boot e um **Frontend** moderno e reativo desenvolvido em Angular utilizando componentes autônomos (*Standalone Components*).

---

## 📌 Visão Geral do Sistema

O **Transport System** foi projetado para mitigar os gargalos tradicionais do setor logístico e rodoviário, focando em quatro pilares fundamentais:
1. **Escalabilidade:** Arquitetura desacoplada e preparada para alta demanda por meio do processamento assíncrono.
2. **Segurança:** Autenticação baseada em tokens de curta duração e controle granular de acessos por privilégios (*Roles*).
3. **Organização:** Estrutura de código limpa, seguindo princípios de arquitetura em camadas e alta coesão.
4. **Experiência do Usuário:** Interfaces intuitivas, separadas por escopos e níveis de permissão (Portal da Empresa vs. Área do Passageiro).

---

## 🧱 Arquitetura Global do Projeto

O repositório está organizado de forma a manter total independência de execução entre o ecossistema de dados do servidor e o cliente web.


```

transport-system/
├── backend/                  # Código-fonte do servidor (Spring Boot)
│   ├── src/main/java/com/example/transport/
│   │   ├── config/           # Configurações globais (Security, JWT, RabbitMQ, etc)
│   │   ├── controller/       # Camada REST (Exposição dos endpoints da API)
│   │   ├── service/          # Camada de Serviços (Regras de negócio e lógica central)
│   │   ├── repository/       # Camada de Acesso a Dados (Interfaces Spring Data JPA)
│   │   ├── entity/           # Entidades de Domínio (Mapeamento O/R com o PostgreSQL)
│   │   ├── request/          # DTOs (Data Transfer Objects) de entrada/validação
│   │   └── response/         # DTOs de saída estilizados para o cliente
│   └── pom.xml               # Gerenciador de dependências Maven
│
└── frontend/                 # Código-fonte da interface web (Angular)
├── public/               # Ativos públicos e estáticos
└── src/
├── app/
│   ├── components/   # Módulos visuais e views da aplicação
│   │   ├── area-empresa/     # Painel corporativo e gestão de frotas/rotas
│   │   ├── area-passageiro/  # Portal do cliente, histórico e bilhetes
│   │   ├── cadastro/         # Fluxo de registo de novos utilizadores
│   │   ├── dashboard/        # Central de inteligência e gráficos analíticos
│   │   ├── landing-page/     # Página de apresentação institucional
│   │   └── login/            # Portal de autenticação unificado
│   ├── service/      # Serviços de comunicação HTTP e segurança
│   │   ├── admin.service.ts
│   │   ├── auth.guard.ts     # Guarda de rotas para proteção de acessos
│   │   ├── auth.service.ts   # Controle de estado de login e JWT
│   │   ├── passageiro.service.ts
│   │   └── viagem-compra.service.ts
│   ├── app.config.ts         # Configurações globais do ecossistema Angular
│   ├── app.routes.ts         # Matriz de roteamento e mapeamento de caminhos
│   ├── app.component.ts      # Componente raiz estrutural
│   ├── app.component.html
│   └── app.component.css
├── index.html        # Arquivo HTML principal de inicialização
├── main.ts           # Ponto de entrada que realiza o bootstrap da aplicação
└── styles.css        # Folha de estilos globais e resets

```

---

## ⚙️ Tecnologias Utilizadas

### 🔙 Backend
* **Linguagem:** Java 21 (Long Term Support)
* **Framework Core:** Spring Boot 3.2
* **Persistência de Dados:** Spring Data JPA / Hibernate
* **Banco de Dados:** PostgreSQL (Produção/Desenvolvimento)
* **Camada de Segurança:** Spring Security com criptografia e validação stateless via **JWT (JSON Web Token)**
* **Validação de Contratos:** Spring Validation (Bean Validation)
* **Mensageria Assíncrona:** RabbitMQ
* **Mecanismo de Relatórios:** OpenPDF (Compilação dinâmica de vouchers e relatórios analíticos)
* **Auxiliares:** Lombok (Redução de boilerplate) e Maven (Automação de compilação)

### 💻 Frontend
* **Framework:** Angular 17+ (Arquitetura moderna baseada em *Standalone Components*, livre de NgModules tradicionais)
* **Linguagem:** TypeScript
* **Estilização:** HTML5 Dinâmico / CSS3 Modular estruturado por escopo de componente
* **Consumo de API:** HttpClientModule integrado com interceptors nativos para injeção automática de tokens

---

## 🔑 Funcionalidades Principais do Ecossistema

### 1. 👤 Autenticação Avançada & RBAC
* Mecanismo de login seguro com entrega de tokens JWT assinados digitalmente.
* Controle de navegação e exibição de componentes baseado no perfil do utilizador (*Roles* do sistema) implementado simultaneamente no backend (Spring Security) e frontend (Angular Router Guards).

### 2. 🎫 Gestão Logística de Passagens
* Cadastro abrangente de empresas e frotas parceiras.
* Planeamento estratégico de rotas logísticas com definição de origens, destinos, paradas e durações estimados.
* Criação dinâmica de viagens vinculando motoristas, frotas, tabelas de preços e lugares disponíveis.

### 3. 💳 Processamento de Compras e Pagamentos
* Registo instantâneo de ordens de compra de bilhetes de passagem.
* Automação do ciclo de vida da transação com máquina de estados para o status da compra: `PENDENTE`, `PAGO`, ou `CANCELADO`.

### 4. 📊 Dashboard Gerencial
* Consolidação de dados complexos em endpoints simplificados para geração de relatórios de faturação, ocupação média de veículos e rotas de maior rentabilidade.

### 5. 📩 Mensageria Assíncrona com RabbitMQ
* Desacoplamento de rotinas críticas em segundo plano para otimização do tempo de resposta HTTP.
* Estrutura preparada para tratamento automático de filas, envio automatizado de e-mails com vouchers anexos e conciliação de pagamentos com gateways externos.

---

## 🧬 Modelo de Domínio (Entidades Relacionais)

O mapeamento objeto-relacional reflete regras rígidas de integridade referencial estruturadas no banco PostgreSQL através das entidades:
* **User / Role:** Sustentação do ecossistema de segurança e acessos.
* **Empresa:** Representação jurídica das concessionárias de transporte.
* **Passageiro:** Vinculação de perfis de pessoas físicas às passagens adquiridas.
* **Rotas:** Malha logística de deslocamento entre terminais.
* **Viagem:** Instanciação operacional de uma Rota em um espaço de tempo específico com um veículo definido.
* **Passagem / Compra:** Registo físico da aquisição de assentos específicos.
* **Pagamentos / MetodoPagamento / StatusPagamento:** Rastreabilidade financeira completa da transação.

---

## 🔗 Matriz de Endpoints Rest da API

| Recurso | Endpoint Base | Descrição Funcional | Autenticação Requerida |
| :--- | :--- | :--- | :--- |
| **Autenticação** | `/auth` | Login, geração de tokens JWT e validação de sessão | Não |
| **Empresas** | `/empresa` | CRUD de concessionárias de transporte e frotas corporativas | Sim (Admin/Empresa) |
| **Passageiros** | `/passageiro` | Atualização cadastral, consulta de perfis e preferências | Sim (Passageiro) |
| **Rotas** | `/rotas` | Mapeamento de trajetos, origens, destinos e distâncias | Sim (Admin) |
| **Viagens** | `/viagem` | Programação de datas, horários, preços e alocação de veículos | Sim (Empresa/Admin) |
| **Transportes**| `/transport` | Gerenciamento técnico de veículos cadastrados no sistema | Sim (Empresa) |
| **Compras** | `/compra` | Checkout de passagens, cancelamentos e estornos | Sim (Passageiro) |
| **Dashboard** | `/dashboard` | Extração de métricas de vendas, ocupação e performance | Sim (Admin/Empresa) |

---

## 🐳 Infraestrutura de Mensageria (RabbitMQ)

Para rodar o ecossistema localmente, o ambiente utiliza containers Docker para gerenciar o servidor de mensagens.

1. **Subir o serviço via Docker:**
   ```bash
   docker-compose up -d

```

2. **Acessar a interface administrativa de gerenciamento das filas (RabbitMQ Management):**
* **URL:** `http://localhost:15672`
* **Usuário Padrão:** `guest`
* **Senha Padrão:** `guest`



---

## 🚀 Como Executar o Projeto Completo

### 🔧 Pré-requisitos Obrigatórios

* **Java Development Kit (JDK) 21** ou superior instalado.
* **Node.js** (Versão 18 ou superior) & **NPM** gerenciador de pacotes.
* **Angular CLI** instalado de forma global (`npm install -g @angular/cli`).
* **Docker & Docker Compose** instalados e configurados.
* Instância do **PostgreSQL** ativa.

---

### ▶️ Execução Passo a Passo

#### Passo 1: Inicialização do Banco e Mensageria (Infraestrutura)

Certifique-se de que os serviços Docker estejam de pé e crie um banco de dados vazio chamado `transport` no seu PostgreSQL local.

#### Passo 2: Configuração e Execução do Servidor (Backend)

1. Navegue até o diretório do backend:
```bash
cd backend

```


2. Abra o arquivo de propriedades (`src/main/resources/application.properties`) e adapte as credenciais do seu banco de dados:
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/transport
spring.datasource.username=seu_usuario_postgres
spring.datasource.password=sua_senha_postgres

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true

```


3. Execute o servidor Spring Boot utilizando o wrapper do Maven:
```bash
./mvnw spring-boot:run

```


*O servidor será iniciado por padrão na porta `8080`.*

#### Passo 3: Configuração e Execução da Interface Web (Frontend)

1. Abra um novo terminal na raiz do projeto e navegue até a pasta do cliente Angular:
```bash
cd frontend

```


2. Realize o download de todas as dependências de terceiros listadas no `package.json`:
```bash
npm install

```


3. Inicie o servidor de desenvolvimento local do Angular:
```bash
ng serve

```


4. Acesse a interface do sistema através do seu navegador web:
* **URL Local:** `http://localhost:4200/`



---

## 📈 Boas Práticas e Diferenciais Técnicos Aplicados

* **Separação Rígida de Conceitos (SoC):** Arquitetura que garante manutenabilidade a longo prazo sem acoplamento entre lógica de negócios e persistência.
* **Componentes Autônomos (Standalone Components):** Implementação da abordagem mais moderna recomendada pela equipe do Angular Core, eliminando a sobrecarga de módulos pesados e acelerando o carregamento da SPA.
* **Criptografia e Filtros Customizados:** Segurança nativa baseada na interceptação fina de requisições HTTP tanto na entrada da API quanto na saída do cliente.
* **Geração Dinâmica de Documentos:** Uso avançado da biblioteca OpenPDF para entrega instantânea de relatórios legíveis para impressão.

---

## 👨‍💻 Equipe de Desenvolvimento

* **Autor:** Celso Vinícius Souza Silva
* **Função:** Desenvolvedor Fullstack 
* **Foco:** Sistemas Web Distribuídos e  Microsserviços
