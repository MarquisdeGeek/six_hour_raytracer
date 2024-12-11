import * as progress from "../modules/progress.js";
import { vec3, point3, color3} from "../modules/vec3.js";
import { ray } from "../modules/ray.js";
import { interval } from "../modules/utils.js";

import { rcGradient } from "./s04.js";


class Camera {
#surface

    // VARIATION: We must pre-determine the SGX canvas surface before creating the camera, so the
    // aspect ratio and size is determined already.
    constructor(surface_) {
        this.#surface = surface_;
        this.image_width = surface_.getWidth();
        this.image_height = surface_.getHeight();
        this.aspect_ratio = this.image_width / this.image_height;

        this.initialise();
    }


    initialise() {
        // A copy+paste+modify version of s04

        // Camera
        const focal_length = 1.0;
        this.camera_center = new point3(0, 0, 0);

        // Viewport
        const viewport_height = 2.0;
        const viewport_width = viewport_height * (this.image_width / this.image_height);

        // Calculate the vectors across the horizontal and down the vertical viewport edges.
        const viewport_u = new vec3(viewport_width, 0, 0);
        const viewport_v = new vec3(0, -viewport_height, 0);

        // Calculate the horizontal and vertical delta vectors from pixel to pixel.
        this.pixel_delta_u = new vec3(viewport_u);     this.pixel_delta_u.div(this.image_width);
        this.pixel_delta_v = new vec3(viewport_v);     this.pixel_delta_v.div(this.image_height);


        // Calculate the location of the upper left pixel.
        // VARIATION: Without function overloading in JS, this needs a few more steps to be clearly explained
        // (although is can be made much shorter by jumping into the structures to directly take the parameters we need)
        let focal_length_as_v3 = new vec3(0, 0, focal_length);
        let viewport_u_halved = new vec3(viewport_u);     viewport_u_halved.div(2);
        let viewport_v_halved = new vec3(viewport_v);     viewport_v_halved.div(2);

        // viewport_upper_left = camera_center - vec3(0, 0, focal_length) - viewport_u/2 - viewport_v/2;
        let viewport_upper_left = new vec3(this.camera_center);
        viewport_upper_left.sub(focal_length_as_v3);
        viewport_upper_left.sub(viewport_u_halved);
        viewport_upper_left.sub(viewport_v_halved);
        

        // Again, explicit calculations for
        //  viewport_upper_left) + 0.5 * (pixel_delta_u + pixel_delta_v);
        let pixel_delta_term = new vec3(this.pixel_delta_u);
        pixel_delta_term.add(this.pixel_delta_v);
        pixel_delta_term.mul(0.5);

        this.pixel00_loc = new vec3(viewport_upper_left);
        this.pixel00_loc.add(pixel_delta_term);

    }


    render(world) {
        const progressData = progress.start();
        const imageData = new sgx.ImageData();
    
        this.#surface.lock(imageData);
    
        progress.startFrame(progressData);
    
        for (let j = 0; j < this.image_height; j++) {
            for (let i = 0; i < this.image_width; i++) {
                // Do the slow way first - we can do incremental stepping afterwards
                // const pixel_center = pixel00_loc + (i * pixel_delta_u) + (j * pixel_delta_v);
                const pixel_center = new vec3(this.pixel00_loc);
                const pixel_delta_u_step = new vec3(this.pixel_delta_u);     pixel_delta_u_step.mul(i);
                const pixel_delta_v_step = new vec3(this.pixel_delta_v);     pixel_delta_v_step.mul(j);
            
                pixel_center.add(pixel_delta_u_step);
                pixel_center.add(pixel_delta_v_step);
            
                // direction
                const ray_direction = new vec3(pixel_center);
                ray_direction.sub(this.camera_center);
    
                // the ray
                const the_ray = new ray(this.camera_center, ray_direction);
                const pixel_color = this.#rcShadedWorld(the_ray, world);
    
                imageData.setPixelAt({r:pixel_color.x, g:pixel_color.y, b:pixel_color.z, a:1}, i, j);
            }
        }
        progress.endFrame(progressData);
        this.#surface.unlock(imageData);

        progress.end(progressData);
    }


    #rcShadedWorld(the_ray, world) {
        const ival = new interval(0, SGX_INF);
        const hit_rec = world.hitInterval(the_ray, ival);
    
        if (hit_rec) {
            const normal = hit_rec.normal();
            const c = new color3(normal.x+1, normal.y+1, normal.z+1);
            c.mul(0.5);
    
            return c;
        }
    
        return rcGradient(the_ray);
    }
    
    
}


export { Camera }
