BOARDGAMES EDUARDO 2.1 — SERVIÇO DE LIGAÇÃO AO BGG

Este ZIP contém um projeto Cloudflare Worker, não um site estático.
Ficheiros:
- src/index.js: serviço de pesquisa e detalhes no BoardGameGeek.
- wrangler.toml: configuração de publicação.

Depois de publicado, os endereços são:
- /health
- /api/search?q=Azul
- /api/game?id=230802

IMPORTANTE:
A aplicação web ainda precisa de ser atualizada para chamar estes endereços e interpretar o XML devolvido. Este ZIP cria apenas o serviço de ligação.
O BGG pode responder HTTP 202 enquanto prepara os dados; nesse caso é necessário tentar novamente após alguns segundos.

PUBLICAÇÃO:
Ligar este projeto a Workers & Pages através de um repositório GitHub e usar o wrangler.toml. Não escolher "Upload your static files", porque isso cria um site Pages e não um Worker.
