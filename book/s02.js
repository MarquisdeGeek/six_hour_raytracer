import * as progress from "../modules/progress.js";

function createCanvasPattern(surface) {
	const progressData = progress.start();
	const imageData = new sgx.ImageData();

	surface.lock(imageData);

	progress.startFrame(progressData);

	const w = imageData.getWidth();
	const h = imageData.getHeight();

    for (let j = 0; j < h; j++) {
		for (let i = 0; i < w; i++) {
			const r = (i / (w-1));
			const g = (j / (h-1));
			const b = 0;

			imageData.setPixelAt({r,g,b,a:1}, i, j);
		}
	}
	progress.endFrame(progressData);
	surface.unlock(imageData);

	progress.end(progressData);
}

export { createCanvasPattern }
