require('dotenv').config();
const express = require('express');
const TelegramBot = require('node-telegram-bot-api');

const PORT = process.env.PORT || 3000;
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_TARGET_CHAT_ID = process.env.TELEGRAM_TARGET_CHAT_ID || process.env.TELEGRAM_CHAT_ID;
const TELEGRAM_TARGET_PHONE = (process.env.TELEGRAM_TARGET_PHONE || '+55 48 99909-0646').replace(/\D/g, '');
const STARTUP_MESSAGE =
  process.env.TELEGRAM_STARTUP_MESSAGE ||
  `Serviço WhatsApi inicializado com sucesso. Mensagem de teste para o número +55 48 99909-0646.`;

let bot = null;

if (!TELEGRAM_BOT_TOKEN) {
  console.warn(
    'ATENÇÃO: defina a variável de ambiente TELEGRAM_BOT_TOKEN para permitir o envio de mensagens ao Telegram.'
  );
} else {
  bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: false });
}

async function sendTelegramMessage(message, chatId = TELEGRAM_TARGET_CHAT_ID) {
  if (!bot) {
    throw new Error('Bot do Telegram não configurado. Informe TELEGRAM_BOT_TOKEN.');
  }

  if (!chatId) {
    throw new Error(
      'Destinatário não configurado. Informe TELEGRAM_TARGET_CHAT_ID com o chatId que receberá as notificações.'
    );
  }

  return bot.sendMessage(chatId, message);
}

async function sendStartupNotification() {
  if (!bot) {
    console.warn('Mensagem de inicialização não enviada porque o bot não está configurado.');
    return;
  }

  if (!TELEGRAM_TARGET_CHAT_ID) {
    console.warn(
      'Mensagem de inicialização não enviada porque TELEGRAM_TARGET_CHAT_ID não foi informado.'
    );
    return;
  }

  try {
    await sendTelegramMessage(
      `${STARTUP_MESSAGE} (Destino configurado: ${TELEGRAM_TARGET_PHONE || TELEGRAM_TARGET_CHAT_ID})`
    );
    console.log('Mensagem de inicialização enviada com sucesso.');
  } catch (error) {
    console.error('Falha ao enviar mensagem de inicialização:', error.message);
  }
}

const app = express();
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.post('/api/telegram/send', async (req, res) => {
  const { message, chatId } = req.body;

  if (!message) {
    return res.status(400).json({ error: "O campo 'message' é obrigatório." });
  }

  try {
    const response = await sendTelegramMessage(message, chatId || TELEGRAM_TARGET_CHAT_ID);
    res.json({ ok: true, result: response });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
  sendStartupNotification();
});
