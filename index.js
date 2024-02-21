
const express = require('express');
const app = express();
const port = 3000;

app.use(express.json());

app.post('/api/message', (req, res) => {
    const { app, sender, message, group_name, phone } = req.body;

    // Aqui você pode adicionar lógica para processar a mensagem recebida
    // e decidir sobre a resposta. Por exemplo, integrar com um bot de IA, 
    // filtrar mensagens, etc.

    // Resposta simples para demonstração
    const reply = \`Recebemos sua mensagem: \${message} de \${sender} via \${app}.\`;

    res.json({ reply });
});

app.listen(port, () => {
    console.log(\`Servidor rodando em http://localhost:\${port}\`);
});
