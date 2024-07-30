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
    sample = traitlets.Unicode("").tag(sync=True)

    def set_code_content(self, value):
        self.code_content = value


class matrixdemoWidget(anywidget.AnyWidget):
    _deps = ["https://unpkg.com/@wokwi/elements@0.48.3/dist/wokwi-elements.bundle.js"]
    _esm = pathlib.Path(__file__).parent / "static" / "pixels.js"
    _css = pathlib.Path(__file__).parent / "static" / "pixels.css"
    # Create a traitlet for the code content
    code_content = traitlets.Unicode("").tag(sync=True)
    sample = traitlets.Unicode("").tag(sync=True)

    def set_code_content(self, value):
        self.code_content = value


class switchledsWidget(anywidget.AnyWidget):
    _deps = ["https://unpkg.com/@wokwi/elements@0.48.3/dist/wokwi-elements.bundle.js"]
    _esm = pathlib.Path(__file__).parent / "static" / "switchleds.js"
    # Create a traitlet for the code content
    code_content = traitlets.Unicode("").tag(sync=True)
    sample = traitlets.Unicode("").tag(sync=True)

    def set_code_content(self, value):
        self.code_content = value


from .magics import ArduinoMagic

def load_ipython_extension(ipython):
    ipython.register_magics(ArduinoMagic)


from sidecar import Sidecar
from IPython.display import display

"""
# Literal function for preloading widget into sidecar panel

def leds_panel(title="LEDs Output", anchor="split-bottom"):
    sc = Sidecar(title=title, anchor=anchor)

    widget_ = ledsdemoWidget()
    with sc:
        display(widget_)

    return widget_
"""
from functools import wraps

# Create a decorator to simplify panel autolaunch
# First parameter on decorated function is optional title
# Second parameter on decorated function is optional anchor location
# Via Claude.ai
def create_panel(widget_class):
    @wraps(widget_class)
    def wrapper(title=None, anchor="split-bottom"):
        if title is None:
            title = f"{widget_class.__name__[:-6]} Output"  # Assuming widget classes end with 'Widget'
        sc = Sidecar(title=title, anchor=anchor)

        widget_ = widget_class()
        with sc:
            display(widget_)

        return widget_

    return wrapper


# Launch with custom title as: leds_panel("Mytitle")
# Use second parameer for anchor
@create_panel
def leds_panel(title=None, anchor="split-bottom"):
    return ledsdemoWidget()

@create_panel
def switchleds_panel(title=None, anchor="split-bottom"):
    return switchledsWidget()

@create_panel
def matrix_panel(title=None, anchor="split-bottom"):
    return matrixdemoWidget()
