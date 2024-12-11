// FPS forces a yield, so that the DOM can be repained.
// Every blocking frame should be paired as either:
//      a) startFrame - yieldFrame (with a return true, which exits the block)
//      b) startFrame - endFrame (for the final frame)
// This ensures we accumulate the total frame duration appropriately, and not accumulate
// all the delays caused by setTimout and other random JS stuff.
// The start/end pair is for the whole process, including startup/teardown, to separate the time
// spent doing the actual work, vs overhead.
const fps = 30;

function start() {
    return {
        supported: window.onRenderProgress,
        durationLastFrame: 0,
        durationLastFrameWallClock: 0,
        maxFrameDuration: sgxRoundDown(1000 / fps), // in ms
        startTime: performance.now(),
        startFrameAt: undefined,
        // Private, progress.js must not touch these
        userdata: undefined
    };
}


function startFrame(progressData) {
    progressData.startFrameAt = performance.now();
}


function updateFrame(progressData) {
}

function yieldFrame(progressData) {
    const durationLastFrame = performance.now() - progressData.startFrameAt; // in ms
    if (durationLastFrame > progressData.maxFrameDuration) {
        progressData.durationLastFrame += durationLastFrame;
        return true;
    }
    
    return false;
}


// The update() returns false when the render is to stop
function update(progressData, fractional) {
    if (!progressData.supported) {
        return true;
    }
    //
    const complete = (fractional === 1) ? true : false;
    const percentage = sgxFloor(fractional * 100);
    const duration = progressData.durationLastFrame; // in ms
    const durationWallClock = performance.now() - progressData.startTime; // in ms

    return window.onRenderProgress({
        percentage,
        duration,
        durationWallClock,
        complete
    });
}

function endFrame(progressData) {
    // We could be lazy and call yield() here, but won't!
    const durationLastFrame = performance.now() - progressData.startFrameAt; // in ms
    progressData.durationLastFrame += durationLastFrame;
}

function end(progressData) {
    update(progressData, 1);
}



export { start, update, startFrame, updateFrame, yieldFrame, endFrame, end };
