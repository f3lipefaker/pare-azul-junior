import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import http from 'http';
import { config as dotenvConfig } from 'dotenv';
import axios from 'axios';

dotenvConfig();

const app = express();
app.use(bodyParser.json());
app.use(cors());

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    } else {
        next();
    }
});

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
❌ Estado: ${formattedData.estado}
🕒 Data de Criação: ${formattedDataCriacao}
📍 Endereço: ${formattedData.endereco_logradouro}, ${formattedData.endereco_numero}
💰 Valor da Notificação: R$ ${formattedData.valor_notificacao}
🕒 Tempo da Notificação: ${formattedData.tempo_notificacao || 'Não disponível'}
🖼️ Imagens: ${formattedData.imagens}
    `;

    //     Latitude: ${formattedData.latitude}
    // Longitude: ${formattedData.longitude}

    const data = JSON.stringify({
        "destination": "120363374433640025@g.us",
        "data": formattedText.trim()
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
            // Filtra notificações com estado "CANCELADA"
            const notificacoes = response.data.resultado.filter(item => item.estado === 'CANCELADA');
            console.log(`Notificações CANCELADAS: ${notificacoes.length}`);

            for (const notificacao of notificacoes) {
                const formattedData = {
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
                        : 'Sem imagens',  // Verifica se existem imagens, senão coloca 'Sem imagens'
                };

                // Exibe os dados formatados antes de enviar
                //console.log('Enviando Notificação:', formattedData);

                // Enviar a notificação de forma sequencial
                await enviarNotificacao(formattedData);
            }
        } else {
            console.log('Nenhuma notificação encontrada.');
        }
    } catch (error) {
        console.error('Erro ao buscar notificações:', error);
    }
};

// Chama a consulta inicial
consultaNotificacoes();

// Configura a consulta a cada 10 segundos
setInterval(() => {
    consultaNotificacoes();
}, 10000); // 10000 ms = 10 segundos

// Inicia o servidor
server.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});

export { app };