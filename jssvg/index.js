const createSVGElem = type => document.createElementNS("http://www.w3.org/2000/svg", type);

class SVG {
    constructor(parent, width, height) {
        this.elem = createSVGElem("svg");
        this.elem.setAttribute("width", width);
        this.elem.setAttribute("height", height);
        parent.append(this.elem);

        this.defs = createSVGElem("defs");
        this.elem.append(this.defs);

        this.current = {
            elem: this.elem,
            group: this.elem,
            definition: null,
        };
    }

    onload(func) {
        this.elem.onload = func;
    }

    ensureCurrentElement() {
        if (!this.current || !this.current.elem) {
            throw new Error("No SVG element is currently active. Call createPath(), createShape(), or createText() first.");
        }
        return this.current.elem;
    }

    createGroup() {
        const group = createSVGElem("g");
        this.current.group = group;
        this.current.elem = group;
        this.elem.append(group);
        return group;
    }

    createPath(inGroup = false) {
        const path = createSVGElem("path");
        path.setAttribute("d", "");

        if (inGroup) {
            if (!this.current.group || this.current.group === this.elem) this.createGroup();
            this.current.group.append(path);
        } else this.elem.append(path);

        this.current.elem = path;
    }

    pathMove(x, y) {
        const path = this.ensureCurrentElement();
        path.setAttribute("d", `${path.getAttribute("d") || ""}M${x} ${y}`);
    }

    pathLine(x, y) {
        const path = this.ensureCurrentElement();
        path.setAttribute("d", `${path.getAttribute("d") || ""}L${x} ${y}`);
    }

    pathRight(x) {
        const path = this.ensureCurrentElement();
        path.setAttribute("d", `${path.getAttribute("d") || ""}H${x}`);
    }

    pathDown(y) {
        const path = this.ensureCurrentElement();
        path.setAttribute("d", `${path.getAttribute("d") || ""}V${y}`);
    }

    pathCSpl(m1x, m1y, m2x, m2y, x, y) {
        const path = this.ensureCurrentElement();
        path.setAttribute("d", `${path.getAttribute("d") || ""}C${m1x} ${m1y},${m2x} ${m2y},${x} ${y}`);
    }

    pathSSpl(mx, my, x, y) {
        const path = this.ensureCurrentElement();
        path.setAttribute("d", `${path.getAttribute("d") || ""}S${mx} ${my},${x} ${y}`);
    }

    pathQSpl(mx, my, x, y) {
        const path = this.ensureCurrentElement();
        path.setAttribute("d", `${path.getAttribute("d") || ""}Q${mx} ${my},${x} ${y}`);
    }

    pathTSpl(x, y) {
        const path = this.ensureCurrentElement();
        path.setAttribute("d", `${path.getAttribute("d") || ""}T${x} ${y}`);
    }

    createShape(x, y, w, h, inGroup = false, type = "square", px) {
        const path = createSVGElem("path");
        switch (type) {
            case "square":
                path.setAttribute("d", `M${x} ${y}h${w}v${h}h${-w}Z`);
                break;
            case "hexagon":
                path.setAttribute("d", `M${x} ${y + w / 2}l${w / 2} ${h / 4}v${h / 2}l${-w / 2} ${h / 4}l${-w / 2} ${-h / 4}v${-h / 2}Z`);
                break;
            case "triangle":
                path.setAttribute("d", `M${x} ${y + w / 2}l${w / 2} ${h}h${-w}Z`);
                break;
            case "squircle":
                path.setAttribute("d", `M${x + px} ${y}H${x + w - px}q${px} 0,${px} ${px}V${y + h - px}q0 ${px},${-px} ${px}H${x + px}q${-px} 0,${-px} ${-px}V${y + px}Q${x} ${y},${x + px} ${y}Z`);
                break;
            case "bevel":
                path.setAttribute("d", `M${x + px} ${y}H${x + w - px}l${px} ${px}V${y + h - px}l${-px} ${px}H${x + px}l${-px} ${-px}V${y + px}L${x + px} ${y}Z`);
                break;
            case "notch":
                path.setAttribute("d", `M${x + px} ${y}H${x + w - px}v${px}h${px}V${y + h - px}h${-px}v${px}H${x + px}v${-px}h${-px}V${y + px}H${x + px}Z`);
                break;
            case "carve":
                path.setAttribute("d", `M${x + px} ${y}H${x + w - px}q0 ${px},${px} ${px}V${y + h - px}q${-px} 0,${-px} ${px}H${x + px}q0 ${-px},${-px} ${-px}V${y + px}Q${x + px} ${y + px},${x + px} ${y}Z`);
                break;
            default:
                path.setAttribute("d", `M${x} ${y}h${w}v${h}h${-w}Z`);
                break;
        }

        if (inGroup) {
            if (!this.current.group || this.current.group === this.elem) this.createGroup();
            this.current.group.append(path);
        } else {
            this.elem.append(path);
        }

        this.current.elem = path;
    }

    createText(data, x, y, inGroup = false) {
        const text = createSVGElem("text");
        text.textContent = data;
        text.setAttribute("x", x);
        text.setAttribute("y", y);

        if (inGroup) {
            if (!this.current.group || this.current.group === this.elem) this.createGroup();
            this.current.group.append(text);
        } else this.elem.append(text);

        this.current.elem = text;
    }

    textFont(font) {
        this.ensureCurrentElement().setAttribute("font-family", font);
    }

    textSize(size) {
        this.ensureCurrentElement().setAttribute("font-size", size);
    }

    textAlign(align) {
        this.ensureCurrentElement().setAttribute("text-anchor", align);
    }

    textBaseline(baseline) {
        this.ensureCurrentElement().setAttribute("dominant-baseline", baseline);
    }

    fill(color) {
        this.ensureCurrentElement().setAttribute("fill", color);
    }

    fillDef() {
        if (!this.current.definition) throw new Error("No gradient is active. Call createLinearGradient() or createRadialGradient() first.");
        this.ensureCurrentElement().setAttribute("fill", `url(#${this.current.definition.id})`);
    }

    stroke(color, width) {
        const elem = this.ensureCurrentElement();
        elem.setAttribute("stroke", color);
        elem.setAttribute("stroke-width", width);
    }

    strokeDef(width) {
        if (!this.current.definition) throw new Error("No gradient is active. Call createLinearGradient() or createRadialGradient() first.");
        const elem = this.ensureCurrentElement();
        elem.setAttribute("stroke", `url(#${this.current.definition.id})`);
        elem.setAttribute("stroke-width", width);
    }

    createLinearGradient(id, x1, y1, x2, y2) {
        this.current.definition = createSVGElem("linearGradient");
        this.current.definition.setAttribute("id", id);
        this.current.definition.setAttribute("x1", x1);
        this.current.definition.setAttribute("y1", y1);
        this.current.definition.setAttribute("x2", x2);
        this.current.definition.setAttribute("y2", y2);
        this.defs.append(this.current.definition);
    }

    createRadialGradient(id, cx, cy, r) {
        this.current.definition = createSVGElem("radialGradient");
        this.current.definition.setAttribute("id", id);
        this.current.definition.setAttribute("cx", cx);
        this.current.definition.setAttribute("cy", cy);
        this.current.definition.setAttribute("r", r);
        this.defs.append(this.current.definition);
    }

    addGradientStop(offset, color, opacity = 1) {
        if (!this.current.definition) throw new Error("No gradient is active. Call createLinearGradient() or createRadialGradient() first.");
        const stop = createSVGElem("stop");
        stop.setAttribute("offset", offset);
        stop.setAttribute("stop-color", color);
        stop.setAttribute("stop-opacity", opacity);
        this.current.definition.append(stop);
    }

    event(eventName, funct) {
        this.ensureCurrentElement().addEventListener(eventName, funct);
    }

    setSpecial(elem,attribute, value) {
        this.current[elem].setAttribute(attribute, value);
    }
}