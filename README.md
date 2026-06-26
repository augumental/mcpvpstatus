# BlaySMP Website

A premium futuristic Minecraft SMP landing page for `blaysmp.net` with a cyberpunk/glassmorphism visual direction, animated hero, feature cards, storefront, community sections, and live Minecraft server telemetry.

The browser fetches live Java server status from:

```text
https://api.mcstatus.io/v2/status/java/blaysmp.net
```

Displayed status data includes:

- Online/offline state
- Current and maximum players
- Minecraft version
- Client-measured status API latency
- Uptime label
- Last scan time

The status card refreshes automatically every 30 seconds and can also be refreshed manually.
