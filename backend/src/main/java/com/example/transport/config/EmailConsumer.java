package com.example.transport.config;
import com.example.transport.response.PassagemResponse;
import com.example.transport.service.PdfService;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Component;

@Component
public class EmailConsumer {

    @Autowired
    private JavaMailSender mailSender;

    @Autowired
    private PdfService pdfService;

    @Value("${spring.mail.username}")
    private String remetente;

    @RabbitListener(queues = RabbitMqConfig.QUEUE_PASSAGEM)
    public void processarEnvioEmail(PassagemResponse dados) {
        System.out.println(">>>> [RABBITMQ] Mensagem recebida! Iniciando processamento...");

        try {

            byte[] pdfBytes = pdfService.gerarPdfPassagem(
                    dados.nomePassageiro(),
                    dados.documento(),
                    dados.origem(),
                    dados.Destino(),
                    dados.quantidadeDeAssentos(),
                    dados.dataHoraDaCompra(),
                    dados.numeroAssentos()
            );


            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(remetente);
            helper.setTo(dados.email());
            helper.setSubject("Sua Passagem de Viagem Chegou! 🚌💨");

            String corpoEmail = String.format(
                    "Olá, %s!\n\nSua viagem de %s para %s está confirmada.\nSua passagem eletrônica está em anexo.",
                    dados.nomePassageiro(),
                    dados.origem(),
                    dados.Destino(),
                    dados.numeroAssentos(),
                    dados.quantidadeDeAssentos(),
                    dados.dataHoraDaCompra()
            );
            helper.setText(corpoEmail);

            ByteArrayResource pdfAnexo = new ByteArrayResource(pdfBytes);
            helper.addAttachment("passagem_viagem.pdf", pdfAnexo);

            mailSender.send(message);
            System.out.println("====== [MENSAGERIA] E-mail enviado com sucesso para: " + dados.email() + " ======");

        } catch (MessagingException e) {
            System.err.println("Erro ao montar o e-mail: " + e.getMessage());
        } catch (Exception e) {
            System.err.println("Erro inesperado no envio: " + e.getMessage());
        }
    }
}