import type { RenderContext } from "@anywidget/types";
import html from "./switchleds.html";
import { buildHex } from "./compile";

import { LEDElement, PushbuttonElement } from "@wokwi/elements";
import { AVRRunner } from "./execute";
import { formatTime } from "./format-time";
import { generateUUID } from "./uuid";

const SAMPLE_CODE = `
#define LED_PIN 13
#define BUTTON_PIN 12
void setup() {
  pinMode(LED_PIN, OUTPUT);
  pinMode(BUTTON_PIN, INPUT);
}
void loop() {
  if (digitalRead(BUTTON_PIN) == HIGH) {
    digitalWrite(LED_PIN, HIGH);
  }
  else {
    digitalWrite(LED_PIN, LOW);
  }
}`.trim();

/* Specifies attributes defined with traitlets in ../src/anywidget_ts_expt/__init__.py */
interface WidgetModel {
  code_content: string;
  code_hex: string;
  sample: string;
}

function render({ model, el }: RenderContext<WidgetModel>) {
  model.set("sample", SAMPLE_CODE);
  model.save_changes();
  
  let el2 = document.createElement("div");
  el2.innerHTML = html;
  const uuid = generateUUID();
  // If required we could set this somewhere / use it as an object id?
  // Maybe via the WidgetModel ?
  el2.id = uuid;
  el.appendChild(el2);

  const statusLabel = el.querySelector('div[title="status-label"]');
  statusLabel.textContent = "WAITING FOR BITS...";

  const compilerOutput = el.querySelector('pre[title="compiler-output-text"]');
  const runButton = el.querySelector('button[name="run-button"]');
  const stopButton = el.querySelector('button[name="stop-button"]');

  // Set up LEDs
  const LEDs = el.querySelectorAll<LEDElement & HTMLElement>("wokwi-led");
  // Set up switch
  const pushbutton = document.querySelector<PushbuttonElement & HTMLElement>(
    "wokwi-pushbutton"
  );
  const pushbuttonPin = 12 - 8; // Port B starts at Arduino pin 8

  let runner: AVRRunner;

  function updateLEDs(value: number, startPin: number) {
    for (const led of LEDs) {
      const pin = parseInt(led.getAttribute("pin"), 10);
      if (pin >= startPin && pin <= startPin + 8) {
        led.value = value & (1 << (pin - startPin)) ? true : false;
      }
    }
  }

  function executeProgram(hex: string) {
    statusLabel.textContent = "executing...";
    runButton.setAttribute("disabled", "1");
    stopButton.removeAttribute("disabled");
    statusLabel.textContent = "try a runner...";
    runner = new AVRRunner(hex);
    statusLabel.textContent = "got a runner...";
    const MHZ = 16000000;

    // Hook to LEDs
    runner.portD.addListener((value) => {
      updateLEDs(value, 0);
    });
    runner.portB.addListener((value) => {
      updateLEDs(value, 8);
    });

    // Set up switch
    // Set up the button
    pushbutton.addEventListener("button-press", () => {
      runner.portB.setPin(pushbuttonPin, false);
    });
    pushbutton.addEventListener("button-release", () => {
      runner.portB.setPin(pushbuttonPin, true);
    });
    runner.portB.setPin(pushbuttonPin, true);

    runner.execute((cpu) => {
      const time = formatTime(cpu.cycles / MHZ);
      statusLabel.textContent = "Simulation time: " + time;
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
