import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import http from 'http';
import { config as dotenvConfig } from 'dotenv';
import axios from 'axios';
import db from './src/functions/db.js';
import tables from './src/utils/tables.js';

dotenvConfig();

const app = express();
app.use(bodyParser.json());
app.use(cors());

const TOKEN = process.env.TOKEN;
const PORT = process.env.PORT || 3000;
const server = http.createServer(app);

const formatData = (data) => {
    const date = new Date(data);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
};

const enviarNotificacao = async (formattedData) => {
    const formattedDataCriacao = formatData(formattedData.data_criacao);

    const formattedText = `
📋 Placa do Veículo: *${formattedData.veiculo_placa}*
🛠️ Marca e Modelo: *${formattedData.veiculo_marca_modelo}*
❔ Estado: ${formattedData.estado}
🕒 Data: ${formattedDataCriacao}
📍 Endereço: ${formattedData.endereco_logradouro}, ${formattedData.endereco_numero}
💰 Multa: R$ ${formattedData.valor_notificacao}
    `;

    const data = JSON.stringify({
        "destination": "120363374433640025@g.us",
        "data": formattedText.trim(),
        "imageUrl": `${formattedData.imagens}`
    });

    const config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: 'https://grup.viptech.com.br/api/sendgrup',
        headers: {
            'Content-Type': 'application/json'
        },
        data: data
    };

    try {
        const response = await axios.request(config);
        console.log('Notificação enviada com sucesso:', response.status, response.data);
    } catch (error) {
        console.error('Erro ao enviar notificação:', error);
    }
};

const consultaNotificacoes = async () => {
    const placas = ["BAM5913", "PVR8G33", "RUR1I46", "RUU5E24", "RUU5E25", "SEO0J85", "SER5A47"];
    const estados = ['TOLERANCIA', 'ABERTA', 'PAGA', 'CANCELADA'];  // Filtra pelos estados

    const data = JSON.stringify({
        "placas": { "in": placas },
        "estados": { "in": estados }
    });

    const config = {
        method: 'get',
        url: `https://ws.pareazul.com.br/v4/prefeituras/292/notificacoes?filtro=${encodeURIComponent(data)}`,
        headers: {
            'x-access-token': TOKEN,
            'Content-Type': 'application/json'
        }
    };

    try {
        const response = await axios.request(config);

        if (response.data.resultado && response.data.resultado.length > 0) {
            const notificacoes = response.data.resultado;

            for (const notificacao of notificacoes) {
                const formattedData = {
                    id_notification: notificacao.id,
                    veiculo_placa: notificacao.veiculo_placa,
                    veiculo_marca_modelo: notificacao.veiculo_marca_modelo,
                    estado: notificacao.estado,
                    data_criacao: notificacao.data_criacao,
                    endereco_logradouro: notificacao.endereco_logradouro,
                    endereco_bairro: notificacao.endereco_bairro,
                    endereco_numero: notificacao.endereco_numero,
                    valor_notificacao: notificacao.valor_notificacao,
                    tempo_notificacao: notificacao.tempo_notificacao,
                    latitude: notificacao.latitude,
                    longitude: notificacao.longitude,
                    imagens: notificacao.imagens && notificacao.imagens.length > 0
                        ? notificacao.imagens.map(image => image.uri).join(', ')
                        : 'Sem imagens',
                };

                // Verifica no banco de dados se o status da notificação mudou
                const existingNotification = await db.SELECT(tables.cad_plate.schema, {
                    [tables.cad_plate.columns.id_notification]: notificacao.id
                });

                if (existingNotification.length > 0) {
                    const dbStatus = existingNotification[0][tables.cad_plate.columns.status];

                    if (dbStatus !== notificacao.estado) {
                        // Atualiza o status no banco
                        await db.UPDATE(tables.cad_plate.schema, {
                            [tables.cad_plate.columns.status]: notificacao.estado,
                        }, {
                            [tables.cad_plate.columns.id_notification]: notificacao.id
                        });

                        // Define o ícone baseado no estado
                        const statusIcon = notificacao.estado === 'ABERTA' ? '⭕' :
                            notificacao.estado === 'CANCELADA' ? '❌' : '✅';

                        // Altera o texto do estado com o ícone
                        formattedData.estado = `${statusIcon} ${notificacao.estado}`;

                        // Envia a notificação de status alterado
                        await enviarNotificacao(formattedData);
                    }
                } else {
                    // Insere nova notificação no banco
                    await db.INSERT(tables.cad_plate.schema, {
                        [tables.cad_plate.columns.id_notification]: notificacao.id,
                        [tables.cad_plate.columns.status]: notificacao.estado,
                    });

                    // Define o ícone baseado no estado
                    const statusIcon = notificacao.estado === 'ABERTA' ? '⭕' :
                        notificacao.estado === 'CANCELADA' ? '❌' : '✅';

                    // Altera o texto do estado com o ícone
                    formattedData.estado = `${statusIcon} ${notificacao.estado}`;

                    // Envia a notificação
                    await enviarNotificacao(formattedData);
                }
            }
        } else {
            console.log('Nenhuma notificação encontrada.');
        }
    } catch (error) {
        console.error('Erro ao buscar notificações:', error);
    }
};

// Configura a consulta a cada 30 segundos
setInterval(() => {
    consultaNotificacoes();
}, 30000);


// Inicia o servidor
server.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});

export { app };