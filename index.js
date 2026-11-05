const BGG_API = "https://boardgamegeek.com/xmlapi2";
const APP_ORIGIN = "https://eduardosilvabaptista.github.io";

function cors(origin) {
  return {
    "Access-Control-Allow-Origin": APP_ORIGIN,
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin"
  };
}
function response(body, status, origin, type = "application/json; charset=utf-8") {
  return new Response(body, {
    status,
    headers: { ...cors(origin), "Content-Type": type, "Cache-Control": "no-store" }
  });
}

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const origin = request.headers.get("Origin") || "";
    if (request.method === "OPTIONS") return new Response(null, {status: 204, headers: cors(origin)});
    if (request.method !== "GET") return response(JSON.stringify({error:"Método não permitido."}),405,origin);

    const path = url.pathname.replace(/\/+$/, "") || "/";
    let target;
    if (path === "/api/search") {
      const q = (url.searchParams.get("q") || "").trim();
      if (!q || q.length > 120) return response(JSON.stringify({error:"Indica o nome do jogo (máximo 120 caracteres)."}),400,origin);
      target = `${BGG_API}/search?type=boardgame&query=${encodeURIComponent(q)}`;
    } else if (path === "/api/game") {
      const id = url.searchParams.get("id") || "";
      if (!/^\d+$/.test(id)) return response(JSON.stringify({error:"ID BGG inválido."}),400,origin);
      target = `${BGG_API}/thing?id=${id}&stats=1`;
    } else if (path === "/" || path === "/health") {
      return response(JSON.stringify({service:"Boardgames Eduardo — ligação BGG",status:"ok",endpoints:["/api/search?q=Azul","/api/game?id=230802"]}),200,origin);
    } else {
      return response(JSON.stringify({error:"Endpoint não encontrado."}),404,origin);
    }

    try {
      const upstream = await fetch(target,{headers:{"User-Agent":"BoardgamesEduardo/2.1"}});
      const body = await upstream.text();
      if (upstream.status === 202) return response(JSON.stringify({pending:true,message:"O BGG está a preparar os dados. Tenta novamente dentro de alguns segundos."}),202,origin);
      if (!upstream.ok) return response(JSON.stringify({error:"O BoardGameGeek não conseguiu responder neste momento.",upstreamStatus:upstream.status}),502,origin);
      return response(body,200,origin,"application/xml; charset=utf-8");
    } catch (e) {
      return response(JSON.stringify({error:"Não foi possível contactar o BoardGameGeek."}),502,origin);
    }
  }
};
