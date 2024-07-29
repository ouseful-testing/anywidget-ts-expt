/* 
Code via:

https://github.com/wokwi/avr8js
https://stackblitz.com/edit/avr8js-6leds?file=index.ts
https://stackblitz.com/edit/avr8js-ws2812?file=index.ts
https://stackblitz.com/edit/avr8js-eeprom-localstorage?file=eeprom-localstorage-backend.ts

MIT License.

Original repo: Copyright (C) 2019-2023 Uri Shaked
*/ 
import {
  avrInstruction,
  AVRTimer,
  CPU,
  timer0Config,
  AVRIOPort,
  portBConfig,
  portCConfig,
  portDConfig,
} from "avr8js";
import { loadHex } from "./intelhex";

// ATmega328p params
const FLASH = 0x8000;

export class AVRRunner {
  readonly program = new Uint16Array(FLASH);
  readonly cpu: CPU;
  readonly timer: AVRTimer;
  readonly portB: AVRIOPort;
  readonly portC: AVRIOPort;
  readonly portD: AVRIOPort;

  private stopped = false;

  constructor(hex: string) {
    loadHex(hex, new Uint8Array(this.program.buffer));
    this.cpu = new CPU(this.program);
    this.timer = new AVRTimer(this.cpu, timer0Config);
    this.portB = new AVRIOPort(this.cpu, portBConfig);
    this.portC = new AVRIOPort(this.cpu, portCConfig);
    this.portD = new AVRIOPort(this.cpu, portDConfig);
  }

  async execute(callback: (cpu: CPU) => void) {
    this.stopped = false;
    for (;;) {
      avrInstruction(this.cpu);
      this.cpu.tick();
      if (this.cpu.cycles % 50000 === 0) {
        callback(this.cpu);
        await new Promise((resolve) => setTimeout(resolve, 0));
        if (this.stopped) {
          break;
        }
      }
    }
  }

  stop() {
    this.stopped = true;
  }
}
