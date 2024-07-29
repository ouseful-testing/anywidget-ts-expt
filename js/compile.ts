/* 
Code via:

https://github.com/wokwi/avr8js
https://stackblitz.com/edit/avr8js-6leds?file=index.ts
https://stackblitz.com/edit/avr8js-ws2812?file=index.ts
https://stackblitz.com/edit/avr8js-eeprom-localstorage?file=eeprom-localstorage-backend.ts

MIT License.

Original repo: Copyright (C) 2019-2023 Uri Shaked
*/
const url = "https://hexi.wokwi.com";

export interface IHexiResult {
  stdout: string;
  stderr: string;
  hex: string;
}

export async function buildHex(source: string) {
  const resp = await fetch(url + "/build", {
    method: "POST",
    mode: "cors",
    cache: "no-cache",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ sketch: source }),
  });
  return (await resp.json()) as IHexiResult;
}
