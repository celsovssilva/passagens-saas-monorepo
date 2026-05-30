package com.example.transport.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfigurations {

    @Autowired
    private SecurityFilter securityFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception{
        return http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(req ->{
                  
                    req.requestMatchers(HttpMethod.POST,"api/auth/login").permitAll();
                    req.requestMatchers(HttpMethod.POST,"api/empresa/cadastrar").permitAll();
                    req.requestMatchers(HttpMethod.POST,"api/passageiro/cadastrar").permitAll();
                    req.requestMatchers(HttpMethod.GET, "api/dashboard/estatisticas").hasRole("ADMIN");
                    req.requestMatchers(HttpMethod.POST,"api/compra/comprar").hasAnyRole("ADMIN","PASSAGEIRO");
                    req.requestMatchers(HttpMethod.PUT,"api/compra/atualizar/{idCompra}").hasAnyRole("ADMIN","PASSAGEIRO");
                    req.requestMatchers(HttpMethod.PATCH,"api/compra/{compraId}/cancelar").hasAnyRole("ADMIN","PASSAGEIRO");
                    req.requestMatchers(HttpMethod.GET,"api/compra/historico/{userId}").hasAnyRole("ADMIN","PASSAGEIRO");
                    req.requestMatchers(HttpMethod.PUT,"api/empresa/atualizar/{id}").hasAnyRole("ADMIN","EMPRESA");
                    req.requestMatchers(HttpMethod.GET,"api/empresa/buscar/{idEmpresa}").authenticated();
                    req.requestMatchers(HttpMethod.GET,"api/empresa/buscar-transporte/{idEmpresa}").authenticated();
                    req.requestMatchers(HttpMethod.GET,"api/localidades/estados").hasRole("ADMIN");
                    req.requestMatchers(HttpMethod.GET,"api/localidades/estados/{uf}/cidades").hasRole("ADMIN");
                    req.requestMatchers(HttpMethod.PUT,"api/passageiro/atualizar/{idPassageiro}").hasAnyRole("ADMIN","PASSAGEIRO");
                    req.requestMatchers(HttpMethod.GET,"api/passageiro/buscar/{idPassaeiro}").hasAnyRole("ADMIN","PASSAGEIRO");
                    req.requestMatchers(HttpMethod.DELETE,"api/passageiro/deletar/{idPassageiro}").hasAnyRole("ADMIN","PASSAGEIRO");
                    req.requestMatchers(HttpMethod.POST,"api/rotas/cadastrar").hasAnyRole("ADMIN","EMPRESA");
                    req.requestMatchers(HttpMethod.POST,"api/transport/cadastrar").hasAnyRole("ADMIN","EMPRESA");
                    req.requestMatchers(HttpMethod.PUT,"api/transport/atualizar/{id}").hasAnyRole("ADMIN","EMPRESA");
                    req.requestMatchers(HttpMethod.GET,"api/transport/buscar/{id}").hasAnyRole("ADMIN","EMPRESA");
                    req.requestMatchers(HttpMethod.GET,"api/transport/listar-todas").hasAnyRole("ADMIN","EMPRESA");
                    req.requestMatchers(HttpMethod.DELETE,"api/transport/deletar/{id}").hasAnyRole("ADMIN","EMPRESA");
                    req.requestMatchers(HttpMethod.DELETE,"api/viagem/deletar/{idViagem}").hasAnyRole("ADMIN","EMPRESA");
                    req.requestMatchers(HttpMethod.POST,"api/viagem/cadastrar").hasAnyRole("ADMIN","EMPRESA");
                    req.requestMatchers(HttpMethod.POST,"api/viagem/agendar").authenticated();
                    req.requestMatchers(HttpMethod.GET,"api/viagem/buscar/{id}").authenticated();
                    req.requestMatchers(HttpMethod.GET,"api/viagem/pesquisar").authenticated();
                    req.requestMatchers(HttpMethod.GET,"api/viagem/listar-passageiros/{viagemId}").authenticated();
                    req.requestMatchers(HttpMethod.GET,"api/viagem/listar-todas").authenticated();
                    req.requestMatchers(HttpMethod.GET,"api/rotas").authenticated();
                    req.requestMatchers(HttpMethod.GET,"api/empresa/listar-todas").authenticated();

                })
                .addFilterBefore(securityFilter, UsernamePasswordAuthenticationFilter.class)
                .build();
    }


    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("http://localhost:4200")); // Permite seu Front-end
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("Authorization", "Content-Type", "X-Requested-With"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder(){
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }
}