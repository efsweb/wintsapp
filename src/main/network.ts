// src/main/network.ts
import https from 'https';

// Função para verificar a conexão com a internet
export async function checkInternetConnection(): Promise<boolean> {
    return new Promise((resolve) => {
        https.get('https://www.google.com/favicon.ico', (res) => {
            // Se o status da resposta for 200 (OK), retornamos verdadeiro
            resolve(res.statusCode === 200);
        }).on('error', (err) => {
            resolve(false); // Caso ocorra erro na requisição, retornamos falso
        });
    });
}
