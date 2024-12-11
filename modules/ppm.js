import { color3 } from "./vec3.js";

class PPM {
    constructor(width, height) {
      this.width = width;
      this.height = height;
      this.bpp = 3;

      this.data = new Uint8Array(width * height * this.bpp);
    }

    setPixel(x, y, r, g, b) {
        const idx = (x + y * this.width) * this.bpp;

        this.data[idx + 0] = r;
        this.data[idx + 1] = g;
        this.data[idx + 2] = b;
    }

    saveData() {
        const EOL = "\n";
        let textData = "";

        textData += `P3${EOL}`;
        textData += `${this.width} ${this.height}${EOL}`;
        textData += `255${EOL}`;

        for (let j = 0; j < this.height; j++) {
            for (let i = 0; i < this.width; i++) {
                const idx = (i + j * this.width) * this.bpp;

                // section 1 version
                // const r = this.data[idx + 0];
                // const g = this.data[idx + 1];
                // const b = this.data[idx + 2];
                // textData += `${r} ${g} ${b}  ${EOL}`;

                // section 3 version
                const col = new color3(this.data[idx + 0] / 255, this.data[idx + 1] / 255, this.data[idx + 2] / 255);
                textData += `${color3.saveData(col)} ${EOL}`;
                
            }
        }

        return textData;
    }
}

  
function create(w, h) {
    return new PPM(w, h);
}

export { create };
