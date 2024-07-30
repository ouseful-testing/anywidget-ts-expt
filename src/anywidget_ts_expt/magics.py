from IPython.core.magic import Magics, magics_class, cell_magic

@magics_class
class ArduinoMagic(Magics):
    def __init__(self, shell):
        super(ArduinoMagic, self).__init__(shell)

    @cell_magic
    def arduino_magic(self, line, cell):
        obj_name = line.strip()
        if cell:
            self.shell.user_ns[obj_name].set_code_content(cell)


## %load_ext anywidget_ts_expt
## Usage: %%arduino_magic x [where x is the widget object ]


# TO DO - can we generalise how we set names?

"""
  def set_attribute(self, name, value):
    setattr(self, name, value)
"""