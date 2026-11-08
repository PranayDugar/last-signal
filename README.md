# Last Signal

A two-player cooperative bomb-defusal escape room with secret temptation deals.

## Status
Built and checked locally. Online publishing was blocked by the environment approval policy; this is not yet available for long-distance play.

## Local preview
Requires Node.js 22.13 or newer. No package installation needed.

1. Run `node build.mjs`.
2. Run `node local-server.mjs`.
3. Open http://127.0.0.1:4173 in your browser.

The second player must use a separate browser profile or device; room tokens are stored per browser. The local server is bound to this computer only.

## Play
Get on a call. Create a mission, copy the invite, and have the other agent join. Both press Ready. The Operator sees the device; the Analyst sees the manual. Roles swap with each module. Three wrong submissions end the mission. Secret deals steal 25 seconds for 100 personal points; a shared win earns 1,000 points each. Hints cost 30 seconds.

## Deployment
The included Cloudflare Worker expects a D1 binding called DB. Apply drizzle/0000_rooms.sql before serving it. The Sites project identity is saved in .openai/hosting.json. Resume the existing Site; do not create a new one.

## Verification
Run `node verify.mjs` for the integration checks: 100,000 wire variants, room capacity, readiness, role separation, hidden information, temptation limits, three-stage victory, replay and three-strike loss.
