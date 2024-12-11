let bContinueRendering;

function uiPrepare() {
}


function uiInit() {
    const worldData06 = makeWorldSection6();
    const worldData10 = makeWorldSection10();
    const worldData11 = makeWorldSection11();
    const worldData12 = makeWorldSection12();
    const worldData14 = makeWorldSection14();

    $(".ui-action-render").click((e) => {
		const surface = sgx.graphics.DrawSurfaceManager.get().getDisplaySurface();
        const stage = $(e.currentTarget).data("render-stage");
        const version = $(e.currentTarget).data("render-version");
        const id = stage * 10 + version; // BUGWARN: Limited to 10 versions per stage
        let camera;
        let worldData;

		// TODO: Trick the renderer into stopping automatically, if it is in progress

        uiControlRenderEnable(false);
		uiControlSetGlobalRenderer();

		bContinueRendering = true;

        switch (id) {
            case 20: // stage 2, version 0
                raytracer.s02.createCanvasPattern(surface);
                break;

            case 40: // stage 4, version 0
                raytracer.s04.raytrace(surface, raytracer.s04.rcBlack);
                break;
            case 41: // stage 4, version 1
                raytracer.s04.raytrace(surface, raytracer.s04.rcGradient);
                break;


            case 50: // stage 5, version 0
                raytracer.s04.raytrace(surface, raytracer.s05.rcBasicSphere)
                break;

            case 60: // stage 6, version 0
                raytracer.s04.raytrace(surface, raytracer.s06.rcShadedSphere);
                break;
            case 61: // stage 6, version 1
                raytracer.s04.raytrace(surface, raytracer.s06.rcShadedSphereSimplifiedHitTest);
                break;
            case 62: // stage 6, version 2
                raytracer.s04.raytrace(surface, raytracer.s06.rcShadedSphereWithSurfaceObject);
                break;
            case 63: // stage 6, version 3
                raytracer.s04.raytrace(surface, raytracer.s06.rcShadedWorld.bind(worldData06));
                break;

            case 70: // stage 7, version 0
                camera = new raytracer.s07.Camera(surface);
                worldData = worldData06;
                break;

            case 80: // stage 8, version 0
                camera = new raytracer.s08.Camera(surface);
                camera.setSamplesPerPixel(1);
                worldData = worldData06;
                break;
            case 81: // stage 8, version 1
                camera = new raytracer.s08.Camera(surface);
                camera.setSamplesPerPixel(10);
                worldData = worldData06;
                break;

				case 90: // stage 9, version 0
                camera = new raytracer.s08.Camera(surface);
                camera.settings.fixShadowAcne = false;
                camera.settings.scatteringAlgorithm = raytracer.s08.CameraSettings.SCATTER_LINEAR;
                worldData = worldData06;
                break;
            case 91: // stage 9, version 1
                camera = new raytracer.s08.Camera(surface);
                camera.settings.fixShadowAcne = true;
                camera.settings.scatteringAlgorithm = raytracer.s08.CameraSettings.SCATTER_LINEAR;
                worldData = worldData06;
                break;
            case 92: // stage 9, version 2
                camera = new raytracer.s08.Camera(surface);
                camera.settings.fixShadowAcne = true;
                camera.settings.scatteringAlgorithm = raytracer.s08.CameraSettings.SCATTER_LAMBERTIAN;
                worldData = worldData06;
                break;
            case 93: // stage 9, version 3
                camera = new raytracer.s08.Camera(surface);
                camera.settings.fixShadowAcne = true;
                camera.settings.applyGammaCorrection = true;
                camera.settings.scatteringAlgorithm = raytracer.s08.CameraSettings.SCATTER_LAMBERTIAN;
                worldData = worldData06;
                break;

            case 100: // stage 10, version 0
                camera = new raytracer.s10.Camera(surface);
                worldData = worldData10;
                break;
            case 110: // stage 11, version 0
                camera = new raytracer.s10.Camera(surface);
                worldData = worldData11;
                break;

            case 120: // stage 12, version 0
                camera = new raytracer.s12.Camera(surface);
                camera.lookfrom = new raytracer.point3(-2, 2, 1);
                camera.lookat = new raytracer.point3(0, 0, -1);
                camera.vup = new raytracer.vec3(0, 1, 0);
                worldData = worldData12;
                break;
            case 121: // stage 12, version 1
                camera = new raytracer.s12.Camera(surface);
                camera.lookfrom = new raytracer.point3(-2, 2, 1);
                camera.lookat = new raytracer.point3(0, 0, -1);
                camera.vup = new raytracer.vec3(0, 1, 0);
                worldData = worldData11;
                break;
            case 122: // stage 12, version 2
                camera = new raytracer.s12.Camera(surface);
                camera.lookfrom = new raytracer.point3(-2, 2, 1);
                camera.lookat = new raytracer.point3(0, 0, -1);
                camera.vup = new raytracer.vec3(0, 1, 0);
                camera.fov = 20;
                worldData = worldData11;
                break;

            case 130: // stage 13, version 0
                camera = new raytracer.s12.Camera(surface);
                camera.lookfrom = new raytracer.point3(-2, 2, 1);
                camera.lookat = new raytracer.point3(0, 0, -1);
                camera.vup = new raytracer.vec3(0, 1, 0);
                camera.fov = 20;
                camera.defocus_angle = 10.0;
                camera.focus_dist = 3.4;
                camera.settings.applyDefocus = true;
                worldData = worldData11;
                break;

            case 140: // stage 14, version 0
                camera = new raytracer.s12.Camera(surface);
                camera.fov = 20;
                camera.lookfrom = new raytracer.point3(13, 2, 3);
                camera.lookat = new raytracer.point3(0, 0, 0);
                camera.vup = new raytracer.vec3(0, 1, 0);
                worldData = worldData14;
                break;
            case 141: // stage 14, version 1
                camera = new raytracer.s12.Camera(surface);
                camera.fov = 20;
                camera.lookfrom = new raytracer.point3(13, 2, 3);
                camera.lookat = new raytracer.point3(0, 0, 0);
                camera.vup = new raytracer.vec3(0, 1, 0);
                camera.defocus_angle = 0.6;
                camera.focus_dist = 10.0;
                camera.settings.applyDefocus = true;
                camera.setSamplesPerPixel(50);
                worldData = worldData14;
                break;
        }

        let world = worldData ? worldData.world : undefined;

        camera && camera.render(world);
        uiControlsShow(world, camera, stage);

    });


    window.onRenderProgress = (progressState) => {

        $("#ui-render-progress-text").html(`Progress: ${progressState.percentage}%`);

        if (progressState.complete) {
            const prettyTime = ((t) => t >= 1000 ? `${sgxFloor(t/10)/100} second${t>1000?'s':''}` : `${t<1?"<":""}${sgxRoundUp(t)} ms`);
            $('#ui-render-panel-text').html(`Last frame: ${prettyTime(progressState.duration)}<br>Wall clock: ${prettyTime(progressState.durationWallClock)}`);
            uiControlRenderEnable(true);
        } else {
            $('#ui-render-panel-text').html(`Rendering...`);
        }

        return bContinueRendering;	
    };


    $("#ui-render-stop").click(() => {
        bContinueRendering = false;
        uiControlRenderEnable(true);
    });

    $("#ui-render-save").click(() => {
        const surface = sgx.graphics.DrawSurfaceManager.get().getDisplaySurface();
        const img = raytracer.utils.surfaceToPPM(surface);
        const data = img.saveData();

        downloadFile("image.ppm", data);
    });

    $(".ui-reload").click((e) => {
        let width = $(e.target).data('reload-width');
        let params = new URLSearchParams(location.search);
        params.set('width', width);
        window.location.search = params.toString();
    });

    uiControlsInitialize();
    uiControlsShow(null, null, 0); // i.e. hide
}
