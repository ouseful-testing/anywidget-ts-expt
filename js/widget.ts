import type { RenderContext } from "@anywidget/types";
import "./widget.css";

/* Specifies attributes defined with traitlets in ../src/anywidget_ts_expt/__init__.py */
interface WidgetModel {
	value: number;
	/* Add your own */
}

function render({ model, el }: RenderContext<WidgetModel>) {
	let btn = document.createElement("button");
	btn.innerHTML = `count is ${model.get("value")}`;
	btn.addEventListener("click", () => {
		model.set("value", model.get("value") + 1);
		model.save_changes();
	});
	model.on("change:value", () => {
		btn.innerHTML = `count is ${model.get("value")}`;
	});
	el.classList.add("anywidget_ts_expt");
	el.appendChild(btn);
}

export default { render };
