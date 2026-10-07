# fit

Your bags, your fit. Paste any Solana wallet (or connect one; the address is only read, nothing is signed) and get a pixel character dressed in what it holds.

## How it dresses you

- **Biggest bag → the hoodie.** Its ticker is printed on the chest; the colourway comes from its contract address.
- **Next 3 bags → coin patches.** Bags worth under $1 don't count.
- **Dead coins → stitched patches.** A coin you still hold with no market, or under $1k of liquidity. Up to four show.
- **24h move → the face.** Value-weighted 24h change of your live bags: ≤ −10% tears, flat shades, ≥ +10% grin, ≥ +30% gold chain.
- The codename comes from the wallet address.

Wallets holding **$20 or more of $FIT** get drip: gold trim, animated sparkles and the 1500×500 banner export. Everyone can save the 1080×1080 pfp.

Bags come from `getTokenAccountsByOwner` (Token and Token-2022 programs); prices, liquidity and 24h change from DexScreener (up to 150 tokens per wallet). If a source is down the page says so and shows "—".

## Environment variables (Vercel)

| name | effect |
|---|---|
| `FIT_MINT` | The $FIT contract address. Turns on the $FIT stats and drip. |
| `RPC_URL` | Your own Solana RPC (e.g. Helius). Defaults to the public mainnet endpoint, which rate-limits. |

## Files

- `index.html`: the whole page; the pixel engine is the same code as `api/_fit.js`.
- `api/rpc.js`: read-only JSON-RPC proxy (only `getTokenAccountsByOwner`).
- `api/prices.js`: DexScreener market data for up to 30 mints per call.
- `api/config.js`: public settings. `api/og.js`: the share image, drawn by the pixel engine.
