/* 
Code via:

https://github.com/wokwi/avr8js
https://stackblitz.com/edit/avr8js-6leds?file=index.ts
https://stackblitz.com/edit/avr8js-ws2812?file=index.ts
https://stackblitz.com/edit/avr8js-eeprom-localstorage?file=eeprom-localstorage-backend.ts

MIT License.

Original repo: Copyright (C) 2019-2023 Uri Shaked
*/ 

function zeroPad(value: number, length: number) {
  let sval = value.toString();
  while (sval.length < length) {
    sval = "0" + sval;
  }
  return sval;
}

export function formatTime(seconds: number) {
  const ms = Math.floor(seconds * 1000) % 1000;
  const secs = Math.floor(seconds % 60);
  const mins = Math.floor(seconds / 60);
  return `${zeroPad(mins, 2)}:${zeroPad(secs, 2)}.${zeroPad(ms, 3)}`;
}
