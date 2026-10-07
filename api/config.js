// public settings the page needs: the $FIT mint (set by the team in Vercel)
const { ADDR, send } = require("./_lib");
module.exports = function (req, res) {
  const mint = (process.env.FIT_MINT || "").trim();
  send(res, 200, { mint: ADDR.test(mint) ? mint : null, customRpc: !!process.env.RPC_URL }, "public, s-maxage=60");
};
