// A COPY+IMPROVE version of s07.js
import * as progress from "../modules/progress.js";
import { vec3, point3, color3} from "../modules/vec3.js";
import { ray } from "../modules/ray.js";
import { interval, linear_to_gamma } from "../modules/utils.js";
import { HitRecord } from "../surfaces/hittable.js";

import { rcGradient } from "./s04.js";



class CameraSettings {
    static #_SCATTER_OFF = 0;
    static #_SCATTER_LINEAR = 1;
    static #_SCATTER_LAMBERTIAN = 2;

    constructor() {
        // In 9
        this.scatteringAlgorithm = CameraSettings.#_SCATTER_OFF;
        this.scatteringMaxDepth = 10;
        this.fixShadowAcne = false;
        this.applyGammaCorrection = false;
        // VARIATION
        this.realtimeUpdate = true;
    }

    static get SCATTER_OFF() { return CameraSettings.#_SCATTER_OFF; }
    static get SCATTER_LINEAR() { return CameraSettings.#_SCATTER_LINEAR; }
    static get SCATTER_LAMBERTIAN() { return CameraSettings.#_SCATTER_LAMBERTIAN; }

}


class Camera {
#surface
#image_width;
#image_height;
#aspect_ratio;
#samples_per_pixel;
#pixel_samples_scale;
#maxBounceDepth = 2;


    // VARIATION: We must pre-determine the SGX canvas surface before creating the camera, so the
    // aspect ratio and size is determined already.
    constructor(surface_) {
        this.#surface = surface_;
        this.#image_width = surface_.getWidth();
        this.#image_height = surface_.getHeight();
        this.#aspect_ratio = this.#image_width / this.#image_height;

        this.initialise();
    }


    initialise() {
        // A copy+paste+modify version of s04

        // Camera
        const focal_length = 1.0;
        this.camera_center = new point3(0, 0, 0);

        // Viewport
        const viewport_height = 2.0;
        const viewport_width = viewport_height * (this.#image_width / this.#image_height);

        // Calculate the vectors across the horizontal and down the vertical viewport edges.
        const viewport_u = new vec3(viewport_width, 0, 0);
        const viewport_v = new vec3(0, -viewport_height, 0);

        // Calculate the horizontal and vertical delta vectors from pixel to pixel.
        this.pixel_delta_u = new vec3(viewport_u);     this.pixel_delta_u.div(this.#image_width);
        this.pixel_delta_v = new vec3(viewport_v);     this.pixel_delta_v.div(this.#image_height);


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

        // User-configurable settings
        this.setSamplesPerPixel(10);
        this.settings = new CameraSettings();

    }

    setSamplesPerPixel(num) {
        this.#samples_per_pixel = num;
        this.#pixel_samples_scale = 1 / num;
    }

    getSamplesPerPixel() {
        return this.#samples_per_pixel;
    }


    render(world) {
        const progressData = progress.start();
        const imageData = new sgx.ImageData();

        this.#surface.lock(imageData);

        progressData.userdata = {
            row: 0,
            surface: this.#surface,
            imageData: imageData,
        };

        // VARIATION
        this.renderNext(world, progressData);
    }

    renderNext(world, progressData) {
        progress.startFrame(progressData);

        while(progressData.userdata.row < this.#image_height) {

            let j = progressData.userdata.row; // using j as an alias to match the book (and micro-optimisation)

            for (let i = 0; i < this.#image_width; i++) {
                HitRecord.startRay();

                // the ray(s)
                let pixel_color = new color3(0,0,0);
                for (let sample = 0; sample < this.#samples_per_pixel; sample++) {
                    const the_ray = this.#get_ray(i, j);
                    pixel_color.add(this.#rcShadedWorld(the_ray, this.#maxBounceDepth, world));
                }
                
                pixel_color.mul(this.#pixel_samples_scale);
    
                progressData.userdata.imageData.setPixelAt({r:pixel_color.x, g:pixel_color.y, b:pixel_color.z, a:1}, i, j);
            }
            //
            ++progressData.userdata.row;

            progress.updateFrame(progressData);

            if (progress.yieldFrame(progressData)) {
                // When update() returns false, we want to terminate the render
                if (!progress.update(progressData, progressData.userdata.row / this.#image_height)) {
                    break;
                }
                //
                if (this.settings.realtimeUpdate) {
                    progressData.userdata.surface.unlock(progressData.userdata.imageData);
                }

                setTimeout(() => {
                    this.renderNext(world, progressData);
                }, 0);
                return;
            }

        }

        progress.endFrame(progressData);

        // Whole image is now complete
        progressData.userdata.surface.unlock(progressData.userdata.imageData);

        progress.end(progressData);
    }

    #get_ray(i, j) {
        // Construct a camera ray originating from the origin and directed at randomly sampled
        // point around the pixel location i, j.

        let offset = this.#sample_square();

        const pixel_sample = new vec3(this.pixel00_loc);
        const pixel_delta_u_step = new vec3(this.pixel_delta_u);     pixel_delta_u_step.mul(i + offset.x);
        const pixel_delta_v_step = new vec3(this.pixel_delta_v);     pixel_delta_v_step.mul(j + offset.y);
    
        pixel_sample.add(pixel_delta_u_step);
        pixel_sample.add(pixel_delta_v_step);
    

        // direction
        const ray_direction = new vec3(pixel_sample);
        const ray_origin = this.camera_center; // WARNING: only used as an alias, so it matches the book. Do not modify.
        ray_direction.sub(ray_origin);
        

        return new ray(ray_origin, ray_direction);
    }


    #sample_square() {
        // Returns the vector to a random point in the [-.5,-.5]-[+.5,+.5] unit square.
        return new vec3(sgxRand() - 0.5, sgxRand() - 0.5, 0);
    }


    // REM: rc still stands for our current variation of the function 'ray_color'
    #rcShadedWorld(the_ray, bounceDepth, world) {
        if (bounceDepth < 0) {
            return new color3(0,0,0);
        }

        const tmin = this.settings.fixShadowAcne ? 0.001 : 0;
        const ival = new interval(tmin, SGX_INF);
        const hit_rec = world.hitInterval(the_ray, ival);
    
        if (hit_rec) {
            const normal = hit_rec.normal();
            let c;

            switch(this.settings.scatteringAlgorithm) {
                case CameraSettings.SCATTER_OFF:{
                    c = new color3(normal.x+1, normal.y+1, normal.z+1);
                    c.mul(0.5);    
                    }break;

                case CameraSettings.SCATTER_LINEAR: {
                    const direction = sgxPoint3f.randomUnitOnHemisphere(normal);
                    const bouncedRay = new ray(hit_rec.point(), direction);
                    c = this.#rcShadedWorld(bouncedRay, bounceDepth-1, world);
                    c.mul(0.5);
                    }break;

                case CameraSettings.SCATTER_LAMBERTIAN: {
                    const direction = sgxPoint3f.randomUnit();
                    direction.add(normal);
                    const bouncedRay = new ray(hit_rec.point(), direction);
                    c = this.#rcShadedWorld(bouncedRay, bounceDepth-1, world);
                    c.mul(0.5);
                    }break;
            }

            if (this.settings.applyGammaCorrection) {
                c.x = linear_to_gamma(c.x);
                c.y = linear_to_gamma(c.y);
                c.z = linear_to_gamma(c.z);
            }
    
            return c;
        }
    
        return rcGradient(the_ray);
    }
    
    
}


export { Camera, CameraSettings }
