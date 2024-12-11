// A COPY+IMPROVE version of s10.js
import { vec3, point3, color3} from "../modules/vec3.js";
import { ray } from "../modules/ray.js";
import { interval, linear_to_gamma } from "../modules/utils.js";
import { HitRecord } from "../surfaces/hittable.js";
import * as progress from "../modules/progress.js";

import { rcGradient } from "./s04.js";


const kBlack = new color3(0,0,0);



class CameraSettings {

    constructor() {
        // From 9
        this.scatteringMaxDepth = 10;
        this.fixShadowAcne = true;
        this.applyGammaCorrection = true;
        // In 13
        this.applyDefocus = false;
        // VARIATION
        this.realtimeUpdate = true;
    }

}


class Camera {
#surface;
#image_width;
#image_height;
#aspect_ratio;
#samples_per_pixel;
#pixel_samples_scale;
// Camera uvw
#u
#v
#w
#defocus_disk_u;       // Defocus disk horizontal radius
#defocus_disk_v;       // Defocus disk vertical radius

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
        this.lookfrom = new point3(0,0,0);   // Point camera is looking from
        this.lookat   = new point3(0,0,-1);  // Point camera is looking at
        this.vup      = new vec3(0,1,0);     // Camera-relative "up" direction
        this.fov      = 90;
        // S13
        this.defocus_angle = 0;  // Variation angle of rays through each pixel
        this.focus_dist = 10;    // Distance from camera lookfrom point to plane of perfect focus
    
        //
        this.#u       = new point3(0,0,0);
        this.#v       = new point3(0,0,0);
        this.#w       = new point3(0,0,0);
        //
        this.setSamplesPerPixel(10);
        this.settings = new CameraSettings();
    }


    #recomputeCamera() {

        // Camera
        this.camera_center = new point3(this.lookfrom);
    

        // Viewport
        const focal_length_v3 = new point3(this.lookfrom);
        focal_length_v3.sub(this.lookat);
        let focal_length = sgxSqr(focal_length_v3.getMagnitudeSquared());

        // s13 - We're cheating with the words, here, as s13 expects us to use focus_dist
        // However, to let us re-use this camera - without even more copy+paste - we pretend that
        // the variation focus_length contains our focus_distance, when using the blur

        if (this.settings.applyDefocus) {
            focal_length = this.focus_dist;
        }

        const theta = sgxToRadians(this.fov);
        const h = sgxTan(theta/2);
        const viewport_height = 2 * h * focal_length;
        const viewport_width = viewport_height * (this.#image_width / this.#image_height);

        // Calculate the u,v,w unit basis vectors for the camera coordinate frame.
        // w= unit_vector(lookfrom - lookat);
        this.#w.set(this.lookfrom);
        this.#w.sub(this.lookat);
        this.#w.normalize();
        
        // unit_vector(cross(vup, w));
        this.#u = this.vup.cross(this.#w); // creates new object
        this.#u.normalize();
        
        this.#v = this.#w.cross(this.#u); // creates new object
        
        
        // Calculate the vectors across the horizontal and down the vertical viewport edges.
        // const viewport_u = new vec3(viewport_width, 0, 0);
        // const viewport_v = new vec3(0, -viewport_height, 0);
        const viewport_u = new vec3(this.#u);   viewport_u.mul(viewport_width);
        const viewport_v = new vec3(this.#v);   viewport_v.mul(-viewport_height);


        // Calculate the horizontal and vertical delta vectors from pixel to pixel.
        this.pixel_delta_u = new vec3(viewport_u);     this.pixel_delta_u.div(this.#image_width);
        this.pixel_delta_v = new vec3(viewport_v);     this.pixel_delta_v.div(this.#image_height);


        // Calculate the location of the upper left pixel.
        // VARIATION: Without function overloading in JS, this needs a few more steps to be clearly explained
        // (although is can be made much shorter by jumping into the structures to directly take the parameters we need)
        let viewport_u_halved = new vec3(viewport_u);     viewport_u_halved.div(2);
        let viewport_v_halved = new vec3(viewport_v);     viewport_v_halved.div(2);

        // viewport_upper_left = camera_center - vec3(0, 0, focal_length) - viewport_u/2 - viewport_v/2;
        let viewport_upper_left = new vec3(this.#w);
        viewport_upper_left.mul(focal_length);
        viewport_upper_left.neg();
        viewport_upper_left.add(this.camera_center);

        viewport_upper_left.sub(viewport_u_halved);
        viewport_upper_left.sub(viewport_v_halved);
        
        // auto viewport_upper_left = center - (focal_length * w) - viewport_u/2 - viewport_v/2;


        // Again, explicit calculations for
        //  viewport_upper_left) + 0.5 * (pixel_delta_u + pixel_delta_v);
        let pixel_delta_term = new vec3(this.pixel_delta_u);
        pixel_delta_term.add(this.pixel_delta_v);
        pixel_delta_term.mul(0.5);

        this.pixel00_loc = new vec3(viewport_upper_left);
        this.pixel00_loc.add(pixel_delta_term);


        // Calculate the camera defocus disk basis vectors.
        // VARIATION: We calculate this, even if we're not using it
        const defocus_radius = this.focus_dist * sgxTan(sgxToRadians(this.defocus_angle / 2));
        this.#defocus_disk_u = new vec3(this.#u);        this.#defocus_disk_u.mul(defocus_radius);
        this.#defocus_disk_v = new vec3(this.#v);        this.#defocus_disk_v.mul(defocus_radius);
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

        this.#recomputeCamera();

        progressData.userdata = {
            row: 0,
            surface: this.#surface,
            imageData: imageData,
        };

        this.renderNext(world, progressData);
    }

    renderNext(world, progressData) {

        progress.startFrame(progressData);

        while(progressData.userdata.row < this.#image_height) {
            HitRecord.startRay();

            let j = progressData.userdata.row; // using j as an alias to match the book (and micro-optimisation)

            for (let i = 0; i < this.#image_width; i++) {

                // the ray(s)
                let pixel_color = new color3(0,0,0);
                for (let sample = 0; sample < this.#samples_per_pixel; sample++) {
                    const the_ray = this.#get_ray(i, j);
                    pixel_color.add(this.#rcShadedWorld(the_ray, this.settings.scatteringMaxDepth, world));
                }
                
                pixel_color.mul(this.#pixel_samples_scale);

                if (this.settings.applyGammaCorrection) {
                    pixel_color.x = linear_to_gamma(pixel_color.x);
                    pixel_color.y = linear_to_gamma(pixel_color.y);
                    pixel_color.z = linear_to_gamma(pixel_color.z);
                }

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

    #cacheRay = new ray();
    #get_ray(i, j) {
        // Construct a camera ray originating from the origin and directed at randomly sampled
        // point around the pixel location i, j.

        //let offset = this.#sample_square();
        // VARIATION: Minor unroll and optimisation by incorporating the offset directly in the mul() step

        const pixel_sample = new vec3(this.pixel00_loc);
        const pixel_delta_u_step = new vec3(this.pixel_delta_u);     pixel_delta_u_step.mul(i + sgxRand() - 0.5);
        const pixel_delta_v_step = new vec3(this.pixel_delta_v);     pixel_delta_v_step.mul(j + sgxRand() - 0.5);
    
        pixel_sample.add(pixel_delta_u_step);
        pixel_sample.add(pixel_delta_v_step);
    

        let ray_origin = this.camera_center; // WARNING: only used as an alias, so it matches the book. Do not modify.

        // Construct a camera ray originating from the defocus disk and directed at a randomly
        // sampled point around the pixel location i, j.
        if (this.settings.applyDefocus) {
            // VARIATION: ray_origin is initial set to camera centre, so the only code needs to re-write in the opposite case
            if (this.defocus_angle) {
                ray_origin = this.#defocus_disk_sample();
            }
        }

        // VARIATION: Unroll optimisation
        this.#cacheRay.origin_.x = ray_origin.x;
        this.#cacheRay.origin_.y = ray_origin.y;
        this.#cacheRay.origin_.z = ray_origin.z;
        this.#cacheRay.direction_.x = pixel_sample.x - ray_origin.x;
        this.#cacheRay.direction_.y = pixel_sample.y - ray_origin.y;
        this.#cacheRay.direction_.z = pixel_sample.z - ray_origin.z;

        return this.#cacheRay;

        // VARIATION: Original below
        // direction
        const ray_direction = new vec3(pixel_sample);
        ray_direction.sub(ray_origin);
        

        return new ray(ray_origin, ray_direction);
    }

    #defocus_disk_sample() {
        // Returns a random point in the camera defocus disk.
        // center + (p[0] * defocus_disk_u) + (p[1] * defocus_disk_v);
        let p = sgxPoint3f.randomUnitDisk();
        p.x *= this.#defocus_disk_u.x;
        p.y *= this.#defocus_disk_v.y;

        p.add(this.camera_center);
        
        return p;
    }

    #sample_square() {
        // Returns the vector to a random point in the [-.5,-.5]-[+.5,+.5] unit square.
        return new vec3(sgxRand() - 0.5, sgxRand() - 0.5, 0);
    }


    // REM: rc still stands for our current variation of the function 'ray_color'
    #rcShadedWorld(the_ray, bounceDepth, world) {
        if (bounceDepth < 0) {
            return kBlack;
        }

        const tmin = this.settings.fixShadowAcne ? 0.001 : 0;
        const ival = new interval(tmin, SGX_INF);
        const hit_rec = world.hitInterval(the_ray, ival);
    
        if (hit_rec) {
            const normal = hit_rec.normal();
            let c;

            if (hit_rec.material) {
                const materialProps = hit_rec.material.scatter(the_ray, hit_rec);
                if (materialProps) {
                    let c = this.#rcShadedWorld(materialProps.scattered, bounceDepth-1, world);
                    // We don't have a c.mul(), so multiple each term manually
                    c.x *= materialProps.attenuation.x;
                    c.y *= materialProps.attenuation.y;
                    c.z *= materialProps.attenuation.z;
                    return c;
                }
            }

            c = new color3(kBlack);

            return c;
        }
    
        return rcGradient(the_ray);
    }


    logRender() {
        console.log(`Last render frame took ${this.lastFrameRenderMilliseconds} milliseconds`)
    }
}


export { Camera, CameraSettings }
