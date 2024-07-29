# anywidget_ts_expt

Simple experiements to explore the use of [`anywidget`](https://anywidget.dev/) to create a simple IPython widget to wrap a Typescript based Arduino simulator ([`avr8js`](https://github.com/wokwi/avr8js)).

See [`NOTES.md`](./NOTES.md) for a walkthrough on creating `anywidget` widgets to create an `ipywidget` wrapper around a simple Typescript application (`avr8js`).

![Example widget panel and magic](images/example.png)

Example:

```python
%pip install https://github.com/ouseful-testing/anywidget-ts-expt/raw/main/dist/anywidget_ts_expt-0.0.1-py2.py3-none-any.whl
```

```python
from anywidget_ts_expt import leds_panel
%load_ext anywidget_ts_expt

leds_widget = leds_panel()
```

```python
%%leds_magic leds_widget
// LEDs connected to pins 8..13

byte leds[] = {13, 12, 11, 10, 9, 8};
void setup() {
  for (byte i = 0; i < sizeof(leds); i++) {
    pinMode(leds[i], OUTPUT);
  }
}

int i = 0;
void loop() {
  digitalWrite(leds[i], HIGH);
  delay(250);
  digitalWrite(leds[i], LOW);
  i = (i + 1) % sizeof(leds);
}
```
