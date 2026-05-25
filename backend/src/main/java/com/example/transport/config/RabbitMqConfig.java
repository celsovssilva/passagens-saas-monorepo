package com.example.transport.config;

import org.springframework.amqp.core.Queue;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;




@Configuration
public class RabbitMqConfig {


        public static final String QUEUE_PASSAGEM = "q-envio-passagem";

        @Bean
        public Queue passagemQueue() {
            return new Queue(QUEUE_PASSAGEM, true);
        }

        @Bean
        public Jackson2JsonMessageConverter messageConverter() {
            return new Jackson2JsonMessageConverter();
        }

}
