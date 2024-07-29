import type { RenderContext } from "@anywidget/types";
import { buildHex } from "./compile";
import { AVRRunner } from "./execute";
import { formatTime } from "./format-time";
import { NeopixelMatrixElement } from "@wokwi/elements";
import { WS2812Controller } from "./ws2812";
import html from "./pixels.html";
import { generateUUID } from "./uuid";
import "./pixels.css";

type NeopixelMatrixHTMLElement = NeopixelMatrixElement & HTMLElement;
type CpuNanosFunction = () => number;

/* SAMPLE CODE

const BLINK_CODE = `
#include "FastLED.h"

// Matrix size
#define NUM_ROWS 9
#define NUM_COLS 9

// LEDs pin
#define DATA_PIN 3

// LED brightness
#define BRIGHTNESS 180

#define NUM_LEDS NUM_ROWS * NUM_COLS

// Define the array of leds
CRGB leds[NUM_LEDS];

void setup() {
  FastLED.addLeds<NEOPIXEL, DATA_PIN>(leds, NUM_LEDS);
  FastLED.setBrightness(BRIGHTNESS);
}

int counter = 0;
void loop() {
  for (byte row = 0; row < NUM_ROWS; row++) {
    for (byte col = 0; col < NUM_COLS; col++) {
      int delta = abs(NUM_ROWS - row * 2) + abs(NUM_COLS - col * 2);
      leds[row * NUM_COLS + col] = CHSV(delta * 4 + counter, 255, 255);
    }
  }
  FastLED.show();
  delay(5);
  counter++;
}
`.trim();
*/

/* Specifies attributes defined with traitlets in ../src/anywidget_ts_expt/__init__.py */
interface WidgetModel {
  code_content: string;
  code_hex: string;
}

function render({ model, el }: RenderContext<WidgetModel>) {
  let el2 = document.createElement("div");
  el2.innerHTML = html;
  const uuid = generateUUID();
  // If required we could set this somewhere / use it as an object id?
  // Maybe via the WidgetModel ?
  el2.id = uuid;
  el.appendChild(el2);
  const statusLabel = el.querySelector('div[title="pixels-status-label"]');
  statusLabel.textContent = "WAITING FOR BITS...";

  const compilerOutput = el.querySelector('pre[title="compiler-output-text"]');
  const runButton = el.querySelector('button[name="run-button"]');
  const stopButton = el.querySelector('button[name="stop-button"]');

  // Set up the NeoPixel matrix
  const matrix = document.querySelector<NeopixelMatrixElement & HTMLElement>(
    "wokwi-neopixel-matrix"
  );

  // Set up toolbar
  let runner: AVRRunner;

  function updateMatrix(
    matrixController: WS2812Controller,
    matrix: NeopixelMatrixHTMLElement | null,
    cpuNanos: CpuNanosFunction
  ) {
    const pixels = matrixController.update(cpuNanos());
    if (pixels) {
      for (let row = 0; row < matrix.rows; row++) {
        for (let col = 0; col < matrix.cols; col++) {
          const value = pixels[row * matrix.cols + col];
          matrix.setPixel(row, col, {
            b: (value & 0xff) / 255,
            r: ((value >> 8) & 0xff) / 255,
            g: ((value >> 16) & 0xff) / 255,
          });
        }
      }
    }
  }

  function executeProgram(hex: string) {
    statusLabel.textContent = "executing...";
    runButton.setAttribute("disabled", "1");
    stopButton.removeAttribute("disabled");
    statusLabel.textContent = "try a runner...";

    runner = new AVRRunner(hex);
    statusLabel.textContent = "runner enabled...";
    const MHZ = 16000000;

    const cpuNanos = () => Math.round((runner.cpu.cycles / MHZ) * 1000000000);
    const matrixController = new WS2812Controller(matrix.cols * matrix.rows);
    statusLabel.textContent = "matrix controller initialised...";
    // Hook to PORTD register
    runner.portD.addListener(() => {
      matrixController.feedValue(runner.portD.pinState(3), cpuNanos());
    });
    statusLabel.textContent = "port connected...";

    runner.execute((cpu) => {
      const time = formatTime(cpu.cycles / MHZ);
      statusLabel.textContent = "Simulation time: " + time;
      updateMatrix(matrixController, matrix, cpuNanos);
    });
  }

  runButton.addEventListener("click", () => {
    executeProgram(model.get("code_hex"));
  });

  stopButton.addEventListener("click", () => {
    stopButton.setAttribute("disabled", "1");
    runButton.removeAttribute("disabled");
    if (runner) {
      runner.stop();
      runner = null;
    }
    statusLabel.textContent = "stopped...";
  });

  // Add an observer for the code_content trait
  model.on("change:code_content", async () => {
    const codeEditor = el.querySelector('div[title="code-editor"]');
    if (codeEditor) {
      statusLabel.textContent = "compiling...";
      const hexResult = await buildHex(model.get("code_content"));
      model.set("code_hex", hexResult.hex);
      codeEditor.innerHTML =
        model.get("code_content") + JSON.stringify(hexResult);
      statusLabel.textContent = "ready to run...";
      //executeProgram(hexResult.hex);
      compilerOutput.innerHTML = model.get("code_hex");
      //executeProgram(model.get("code_hex"));
    }
  });

  // Initial update of the code editor content
  const codeEditor = el.querySelector('div[title="code-editor"]');
  if (codeEditor) {
    codeEditor.innerHTML = model.get("code_content");
  }
}

export default { render };
