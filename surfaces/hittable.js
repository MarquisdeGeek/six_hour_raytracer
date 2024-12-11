import { vec3, point3 } from "../modules/vec3.js";


class HitRecord {
static #hrCache;
static #hrCacheIndex;
static #hrCacheSize = 128;

    static {
        // VARIATION: Cache some hit objects
        HitRecord.#hrCache = new Array(HitRecord.#hrCacheSize);
        for(let i=0;i<HitRecord.#hrCacheSize;++i) {
            HitRecord.#hrCache[i] = new HitRecord();
        }

        // Not needed, just here as a reminder that the variable exists
        HitRecord.#hrCacheIndex = 0;
    }

    constructor(position, normal, t, material) {
        this.point_ = new point3(position);
        this.normal_ = new vec3(normal);
        this.t_ = t;
        this.front_face_ = undefined;
        this.material = material;
    }

    // Call this periodically, preferably before every ray is cast.
    static startRay() {
        HitRecord.#hrCacheIndex = 0;
    }

    static create(position, normal, t, material) {
        if (HitRecord.#hrCacheIndex >= HitRecord.#hrCacheSize) {
            return new HitRecord(position, normal, t, material);
        }
        let hr = HitRecord.#hrCache[HitRecord.#hrCacheIndex++];

        hr.point_.set(position);
        hr.normal_.set(normal);
        hr.t_ = t;
        hr.material = material;
        
        return hr;     
    }

    point() {
        return this.point_;
    }


    normal() {
        return this.normal_;
    }


    t() {
        return this.t_;
    }

    front_face() {
        return this.front_face_;
    }

    set_face_normal(the_ray, outward_normal) {
        // Sets the hit record normal vector.
        // NOTE: the parameter `outward_normal` is assumed to have unit length.
        this.front_face_ = the_ray.direction().dot(outward_normal) < 0;

        this.normal_.set(outward_normal);
        if (!this.front_face_) {
            this.normal_.neg();
        }
    }
}


class Hittable {
    constructor() {
    }

    // Slightly different interface here: we return the hit record, instead of modifying an
    // incoming parameter
    hit(the_ray, the_ray_tmin, the_ray_tmax) {
        return false;
    }

    hitInterval(the_ray, the_ray_interval) {
        return false;
    }

}


class HittableList {
    constructor() {
        this.clear();
    }

    clear() {
        this.list_ = [];
    }

    add(surface) {
        this.list_.push(surface);
    }

    hit(the_ray, the_ray_tmin, the_ray_tmax) {
        let closest_so_far = the_ray_tmax;
        let closest_surface = null;

        this.list_.forEach((item) => {
            let hit_rec = item.hit(the_ray, the_ray_tmin, closest_so_far);

            if (hit_rec) {
                closest_so_far = hit_rec.t();
                closest_surface = hit_rec; // no need to clone this, because hit() always returns a new object
            }
        });

        return closest_surface;
    }


    hitInterval(the_ray, the_ray_interval) {
        let closest_so_far = the_ray_interval.max();
        let closest_surface = null;

        this.list_.forEach((item) => {
            let hit_rec = item.hit(the_ray, the_ray_interval.min(), closest_so_far);

            if (hit_rec) {
                closest_so_far = hit_rec.t();
                closest_surface = hit_rec; // no need to clone this, because hit() always returns a new object
            }
        });

        return closest_surface;
    }

    
}



export { HitRecord, Hittable, HittableList};
