import * as progress from "../modules/progress.js";
import { vec3, point3, color3} from "../modules/vec3.js";
import { ray } from "../modules/ray.js";

// VARIATION: We use rcGradient a lot, so the original version from the book (rcGradientOriginal)
// has been tweaked, by moving out all the ctors
let cacheUnitDirection = new vec3();
let cacheCol1 = new color3();
let cacheCol2 = new color3();

function rcGradient(the_ray) {

    // For reasons lost to time, SGX has only sgxPoint2f (and not sgxPoint3f)
    // So we do this the same way as the book
    cacheUnitDirection.set(the_ray.direction());
    cacheUnitDirection.normalize();

    // (1.0-a)*color(1.0, 1.0, 1.0) + a*color(0.5, 0.7, 1.0);
    let a = 0.5*(cacheUnitDirection.y + 1.0);

    // This the version with a, first
    cacheCol2.set(0.5, 0.7, 1);
    cacheCol2.mul(a);

    // We can then unroll this...
    // cacheCol1.set(1, 1, 1);
    // cacheCol1.mul(1 - a);
    // into this...
    a = 1 - a;
    cacheCol1.x = cacheCol1.y = cacheCol1.z = a;

    // Manually do the addition
    cacheCol2.x += cacheCol1.x;
    cacheCol2.y += cacheCol1.y;
    cacheCol2.z += cacheCol1.z;

    // BUGWARN: This only works because we refer to the return value ONLY by reference, immediately
    // (it kinda helps that we're single threaded)
    return cacheCol2;
}

// VARIATION: Compare to above
function rcGradientOriginal(the_ray) {

    // For reasons lost to time, SGX has only sgxPoint2f (and not sgxPoint3f)
    // So we do this the same way as the book
    const unit_direction = new vec3(the_ray.direction());
    unit_direction.normalize();

    // (1.0-a)*color(1.0, 1.0, 1.0) + a*color(0.5, 0.7, 1.0);
    const a = 0.5*(unit_direction.y + 1.0);
    const col1 = new color3(1, 1, 1);
    col1.mul(1 - a);

    const col2 = new color3(0.5, 0.7, 1);
    col2.mul(a);

    let c = new color3(0,0,0);
    c.add(col1);
    c.add(col2);

    return c;
}

function rcBlack(the_ray) {
    return new color3(0,0,0);
}

function raytrace(surface, cbRayColor) {
	const progressData = progress.start();
	const imageData = new sgx.ImageData();

	surface.lock(imageData);

	progress.startFrame(progressData);

    // Image
    const image_width = surface.getWidth();
    const image_height = surface.getHeight();

    // Camera
    const focal_length = 1.0;
    const camera_center = new point3(0, 0, 0);

    // Viewport
    const viewport_height = 2.0;
    const viewport_width = viewport_height * (image_width / image_height);

    // Calculate the vectors across the horizontal and down the vertical viewport edges.
    const viewport_u = new vec3(viewport_width, 0, 0);
    const viewport_v = new vec3(0, -viewport_height, 0);

    // Calculate the horizontal and vertical delta vectors from pixel to pixel.
    const pixel_delta_u = new vec3(viewport_u);     pixel_delta_u.div(image_width);
    const pixel_delta_v = new vec3(viewport_v);     pixel_delta_v.div(image_height);


    // Calculate the location of the upper left pixel.
    // VARIATION: Without function overloading in JS, this needs a few more steps to be clearly explained
    // (although is can be made much shorter by jumping into the structures to directly take the parameters we need)
    const focal_length_as_v3 = new vec3(0, 0, focal_length);
    const viewport_u_halved = new vec3(viewport_u);     viewport_u_halved.div(2);
    const viewport_v_halved = new vec3(viewport_v);     viewport_v_halved.div(2);

    // viewport_upper_left = camera_center - vec3(0, 0, focal_length) - viewport_u/2 - viewport_v/2;
    const viewport_upper_left = new vec3(camera_center);
    viewport_upper_left.sub(focal_length_as_v3);
    viewport_upper_left.sub(viewport_u_halved);
    viewport_upper_left.sub(viewport_v_halved);
    

    // Again, explicit calculations for
    //  viewport_upper_left) + 0.5 * (pixel_delta_u + pixel_delta_v);
    const pixel_delta_term = new vec3(pixel_delta_u);
    pixel_delta_term.add(pixel_delta_v);
    pixel_delta_term.mul(0.5);

    const pixel00_loc = new vec3(viewport_upper_left);
    pixel00_loc.add(pixel_delta_term);


    // Render
    for (let j = 0; j < image_height; j++) {
		for (let i = 0; i < image_width; i++) {
            // Do the slow way first - we can do incremental stepping afterwards
            // const pixel_center = pixel00_loc + (i * pixel_delta_u) + (j * pixel_delta_v);
            const pixel_center = new vec3(pixel00_loc);
            const pixel_delta_u_step = new vec3(pixel_delta_u);     pixel_delta_u_step.mul(i);
            const pixel_delta_v_step = new vec3(pixel_delta_v);     pixel_delta_v_step.mul(j);
        
            pixel_center.add(pixel_delta_u_step);
            pixel_center.add(pixel_delta_v_step);
        
            // direction
            const ray_direction = new vec3(pixel_center);
            ray_direction.sub(camera_center);

            // the ray
            const the_ray = new ray(camera_center, ray_direction);
            const pixel_color = cbRayColor(the_ray);

			imageData.setPixelAt({r:pixel_color.x, g:pixel_color.y, b:pixel_color.z, a:1}, i, j);
		}
	}
    progress.endFrame(progressData);
	surface.unlock(imageData);

    progress.end(progressData);
}

export { raytrace, rcBlack, rcGradient }
