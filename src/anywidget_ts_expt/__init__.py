# This file provided by the anywidgets generator

import importlib.metadata
import pathlib

import anywidget
import traitlets

try:
    __version__ = importlib.metadata.version("anywidget_ts_expt")
except importlib.metadata.PackageNotFoundError:
    __version__ = "unkown"


class Widget(anywidget.AnyWidget):
    _esm = pathlib.Path(__file__).parent / "static" / "widget.js"
    _css = pathlib.Path(__file__).parent / "static" / "widget.css"
    value = traitlets.Int(0).tag(sync=True)


class ledsdemoWidget(anywidget.AnyWidget):
    _deps = ["https://unpkg.com/@wokwi/elements@0.48.3/dist/wokwi-elements.bundle.js"]
    _esm = pathlib.Path(__file__).parent / "static" / "leds.js"
    # Create a traitlet for the code content
    code_content = traitlets.Unicode("").tag(sync=True)

    def set_code_content(self, value):
        self.code_content = value


class matrixdemoWidget(anywidget.AnyWidget):
    _deps = ["https://unpkg.com/@wokwi/elements@0.48.3/dist/wokwi-elements.bundle.js"]
    _esm = pathlib.Path(__file__).parent / "static" / "pixels.js"
    _css = pathlib.Path(__file__).parent / "static" / "pixels.css"
    # Create a traitlet for the code content
    code_content = traitlets.Unicode("").tag(sync=True)

    def set_code_content(self, value):
        self.code_content = value


class switchledsWidget(anywidget.AnyWidget):
    _deps = ["https://unpkg.com/@wokwi/elements@0.48.3/dist/wokwi-elements.bundle.js"]
    _esm = pathlib.Path(__file__).parent / "static" / "switchleds.js"
    # Create a traitlet for the code content
    code_content = traitlets.Unicode("").tag(sync=True)

    def set_code_content(self, value):
        self.code_content = value


from .magics import ArduinoMagic

def load_ipython_extension(ipython):
    ipython.register_magics(ArduinoMagic)


from sidecar import Sidecar
from IPython.display import display

def leds_panel(title="LEDs Output", anchor="split-bottom"):
    sc = Sidecar(title=title, anchor=anchor)

    widget_ = ledsdemoWidget()
    with sc:
        display(widget_)

    return widget_
