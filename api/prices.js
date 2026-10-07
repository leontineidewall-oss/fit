// market facts for up to 30 mints at once from DexScreener: for each mint, its most liquid pair
const { ADDR, getJson, send, n } = require("./_lib");

function pick(pairs, mints) {
  const out = {};
  (Array.isArray(pairs) ? pairs : []).forEach(function (p) {
    const m = p && p.baseToken && p.baseToken.address;
    if (!m || mints.indexOf(m) < 0) return;
    const liq = n(p.liquidity && p.liquidity.usd) || 0, prev = out[m];
    if (prev && prev.liquidityUsd >= liq) return;
    out[m] = {
      sym: String(p.baseToken.symbol || "").slice(0, 16),
      priceUsd: n(p.priceUsd),
      liquidityUsd: liq,
      ch24: n(p.priceChange && p.priceChange.h24),
      marketCapUsd: n(p.marketCap != null ? p.marketCap : p.fdv),
      url: String(p.url || "")
    };
  });
  return out;
}

module.exports = async function (req, res) {
  const q = String((req.query && req.query.mints) || new URL(req.url, "http://x").searchParams.get("mints") || "");
  const mints = q.split(",").filter(Boolean);
  if (!mints.length || mints.length > 30 || !mints.every(function (m) { return ADDR.test(m); })) return send(res, 400, { error: "mints: 1-30 addresses, comma separated" });
  try {
    const pairs = await getJson("https://api.dexscreener.com/tokens/v1/solana/" + mints.join(","));
    send(res, 200, { prices: pick(pairs, mints), fetchedAt: new Date().toISOString() }, "public, s-maxage=30, stale-while-revalidate=60");
  } catch (e) {
    send(res, 502, { error: "market data unavailable" });
  }
};
module.exports.pick = pick;
