
// Create a new PPM from the data within an SGX surface
function surfaceToPPM(surface) {
	const imageData = new sgx.ImageData();

	surface.lock(imageData);

	const w = imageData.getWidth();
	const h = imageData.getHeight();

	const ppm = raytracer.ppm.create(w, h);
	const color = new sgxColorRGBA();
	for (let j = 0; j < h; j++) {
		for (let i = 0; i < w; i++) {
			imageData.getPixelAt(color, i, j);

			ppm.setPixel(i, j, color.r*255,color.g*255,color.b*255);
		}
	}
	surface.unlock(imageData);

	return ppm;
}


class interval {
    constructor(min_value = SGX_INF, max_value = -SGX_INF) {
        this.min_ = min_value;
        this.max_ = max_value;
    }

    min() {
        return this.min_;
    }

    max() {
        return this.max_;
    }

    size() {
        return this.max_ - this.min_;
    }

    contains(x) {
        return this.min_ <= x && x <= this.max_;
    }

    surrounds(x) {
        return this.min_ < x && x < this.max_;
    }
    
    // section 8
    clamp(x) {
        if (x < this.min_) return this.min_;
        if (x > this.max_) return this.max_;
        return x;
    }
}

const intervalEmpty = new interval(+SGX_INF, -SGX_INF);
const intervalUniverse = new interval(-SGX_INF, +SGX_INF);



function linear_to_gamma(linear_component) {
    if (linear_component > 0)
        return sgxSqr(linear_component);

    return 0;
}

export { surfaceToPPM, interval, intervalEmpty, intervalUniverse, linear_to_gamma };
