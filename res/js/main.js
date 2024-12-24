
function SGXPrepare_OS() {
	sgx.main.System.initialize();
	const cmdLine = new sgx.system.commandline();
	const targetWidth = cmdLine.getOption(0, "width");
	const imageScale = sgxAtoi(cmdLine.getOption(0, "scale")) || 1;

	// Sections 1 to 3
	// sgx.graphics.Engine.create(256, 256);

	// Section 4.2 onwards
	const aspectRatio = 16 / 9;
	const imageWidth = (targetWidth || 400) * imageScale;
	sgx.graphics.Engine.create(imageWidth, imageWidth / aspectRatio);

	uiPrepare(imageScale);
}


function SGXinit() {
	uiInit();
}



function SGXstart() {
	const surface = sgx.graphics.DrawSurfaceManager.get().getDisplaySurface();

	raytracer.s02.createCanvasPattern(surface);
}



function SGXupdate(telaps) {
}


function SGXdraw() {
}
