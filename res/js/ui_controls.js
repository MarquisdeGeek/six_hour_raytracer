const cidRealtimeUpdate = '#ui-check-realtimeUpdate';
const cidMinmized = '#ui-check-minmized';
const cidCameraFOV = '#ui-camera-fov';
const cidFixShadowAcne = '#ui-check-fixShadowAcne';
const cidApplyGammaCorrection = '#ui-check-applyGammaCorrection';
const cidApplyDefocus = '#ui-check-applyDefocus';
const cidScatteringDepth = '#ui-scattering-depth';
const cidSamplingCount = '#ui-sampling-count';
const cidScatteringAlgorithmOff = '#ui-scattering-off';
const cidScatteringAlgorithmLinear = '#ui-scattering-linear';
const cidScatteringAlgorithmLambertian = '#ui-scattering-lambertian';

const gidScatteringControls = '#ui-controls-step8';
const gidStep8 = '#ui-controls-step8plus';
const gidStep9 = '#ui-controls-step9';
const gidApplyDefocus = '#ui-controls-step13';
const gidStep12fov = '#ui-controls-step12-fov';

const cidRender = '#ui-control-render';


let currentWorld;
let currentCamera;


function uiControlsInitialize() {
	$(cidSamplingCount).slider({
		formatter: function(value) {
			return `Samples: ${value}`;
		}
	});
	$(cidScatteringDepth).slider({
		formatter: function(value) {
			return `Recursive depth: ${value}`;
		}
	});

	$(cidCameraFOV).slider({
		formatter: function(value) {
			return `Current FOV: ${value}`;
		}
	});

	$(cidRender).click(() => {
        uiControlRenderEnable(false);
        uiControlsReflectIntoCamera();
        uiControlSetGlobalRenderer();

        bContinueRendering = true;

        currentCamera.render(currentWorld);
    });
}



function uiControlRenderEnable(state) {
    $(cidRender).prop('disabled', !state);
}

/*
TODO:
If you're reading this, let me explain my thinking!

We have the functionality to switch between the normal and minimized libraries, but we
need to rebuild the camera objects (currently cached in currentCamera) to do so. Since the
UI does not make it obvious that we have to re-run the example (to ctor a new object), rather
than simply re-render it I removed it, lest I get complaints.

If/when the UI code is refactored to allow us to re-create the objects, we can put this back.
*/
function uiControlSetGlobalRenderer() {
    const useMinimized = $(cidMinmized).prop('checked');

    window.raytracer = useMinimized ? raytracerMinimized : raytracerNormal;
}


function uiControlsShow(world, camera, asStep) {
    // Only the gradient step is omitted here, as it does no raytracing and
    // therefore doesn't need the settings
    if (asStep < 3) {
        $('#ui-control-panel').hide();
        return;
    }
    //
    currentWorld = world;
    currentCamera = camera;

    uiControlsReflectFromStep(asStep);
    uiControlsReflectFromCamera();

    $('#ui-control-panel').show();
}


function uiControlsReflectFromStep(asStep) {

    // No re-render when we don't have a camera object
    $(cidRender).prop('disabled', asStep < 7);

    $(gidStep8).toggle(asStep >= 8);
    $(gidScatteringControls).toggle(asStep === 9);
    $(gidStep9).toggle(asStep >= 9);
    $(gidStep12fov).toggle(asStep >= 12);
    $(gidApplyDefocus).toggle(asStep === 13);
}


function uiControlsReflectFromCamera() {
    if (!currentCamera) {
        return;
    }
    //
    if (!currentCamera.settings) {
        return;
    }
    const CameraSettings = raytracer.s08.CameraSettings;
    
    $(cidSamplingCount).data('slider').setValue([currentCamera.getSamplesPerPixel()]);
    $(cidFixShadowAcne).prop('checked', currentCamera.settings.fixShadowAcne);
    $(cidApplyGammaCorrection).prop('checked', currentCamera.settings.applyGammaCorrection);
    $(cidApplyDefocus).prop('checked', currentCamera.settings.applyDefocus);

    $(cidScatteringAlgorithmOff).prop('checked', currentCamera.settings.scatteringAlgorithm === CameraSettings.SCATTER_OFF);
    $(cidScatteringAlgorithmLinear).prop('checked', currentCamera.settings.scatteringAlgorithm === CameraSettings.SCATTER_LINEAR);
    $(cidScatteringAlgorithmLambertian).prop('checked', currentCamera.settings.scatteringAlgorithm === CameraSettings.SCATTER_LAMBERTIAN);

    $(cidCameraFOV).data('slider').setValue([currentCamera.fov]);
    $(cidScatteringDepth).data('slider').setValue([currentCamera.settings.scatteringMaxDepth]);

}


function uiControlsReflectIntoCamera() {
    if (!currentCamera) {
        return;
    }
    //
    currentCamera.fov = $(cidCameraFOV).data('slider').getValue();
    //
    if (!currentCamera.settings) {
        return;
    }

    const CameraSettings = raytracer.s08.CameraSettings;

    currentCamera.setSamplesPerPixel($(cidSamplingCount).data('slider').getValue());

    // And those stored in settings:
    currentCamera.settings.fixShadowAcne = $(cidFixShadowAcne).prop('checked');
    currentCamera.settings.applyGammaCorrection = $(cidApplyGammaCorrection).prop('checked');
    currentCamera.settings.realtimeUpdate = $(cidRealtimeUpdate).prop('checked');
    currentCamera.settings.applyDefocus = $(cidApplyDefocus).prop('checked');
    currentCamera.settings.scatteringMaxDepth = $(cidScatteringDepth).data('slider').getValue();

    if ($(cidScatteringAlgorithmOff).prop('checked')) {
        currentCamera.settings.scatteringAlgorithm = CameraSettings.SCATTER_OFF;
    } else if ($(cidScatteringAlgorithmLinear).prop('checked')) {
        currentCamera.settings.scatteringAlgorithm = CameraSettings.SCATTER_LINEAR;
    } else if ($(cidScatteringAlgorithmLambertian).prop('checked')) {
        currentCamera.settings.scatteringAlgorithm = CameraSettings.SCATTER_LAMBERTIAN;
    }

}

