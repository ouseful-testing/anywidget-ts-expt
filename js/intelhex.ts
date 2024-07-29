/**
 * Minimal Intel HEX loader
 * Part of AVR8js
 *
 * Copyright (C) 2019, Uri Shaked
 */

/* 
Code via:

https://github.com/wokwi/avr8js
https://stackblitz.com/edit/avr8js-6leds?file=index.ts
https://stackblitz.com/edit/avr8js-ws2812?file=index.ts
https://stackblitz.com/edit/avr8js-eeprom-localstorage?file=eeprom-localstorage-backend.ts

MIT License.

Original repo: Copyright (C) 2019-2023 Uri Shaked
*/

export function loadHex(source: string, target: Uint8Array) {
  for (const line of source.split("\n")) {
    if (line[0] === ":" && line.substr(7, 2) === "00") {
      const bytes = parseInt(line.substr(1, 2), 16);
      const addr = parseInt(line.substr(3, 4), 16);
      for (let i = 0; i < bytes; i++) {
        target[addr + i] = parseInt(line.substr(9 + i * 2, 2), 16);
      }
    }
  }
}
