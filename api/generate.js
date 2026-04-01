export default async function handler(req, res) {

  // CORS (segurança básica)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST");

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  try {

    const body = req.body || {};
    const idea = body.idea;

    if (!idea) {
      return res.status(400).json({ error: "Digite uma ideia válida" });
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000); // 15s

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        messages: [{
          role: "user",
          content: `
Crie um NFT altamente lucrativo baseado em: ${idea}

Retorne de forma estruturada:

🔥 Nome do NFT
💰 Receita mensal estimada
🎯 Público-alvo
🚀 Estratégia de monetização
💵 Preço sugerido
⚡ Como vender rápido

Seja direto, agressivo e realista.
`
        }]
      })
    });

    clearTimeout(timeout);

    const data = await response.json();

    if (!data.choices || !data.choices[0]) {
      return res.status(500).json({
        error: "Erro na IA",
        details: data
      });
    }

    return res.status(200).json({
      result: data.choices[0].message.content
    });

  } catch (err) {

    return res.status(500).json({
      error: "Erro interno",
      message: err.message
    });
  }
}
