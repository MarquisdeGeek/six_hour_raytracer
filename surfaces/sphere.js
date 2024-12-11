import { vec3 } from "../modules/vec3.js";
import { HitRecord, Hittable } from "./hittable.js";


class Sphere extends Hittable {

    constructor(center, radius, material) {
        super();
        //
        this.center_ = new vec3(center);
        this.radius_ = radius;
        this.material = material;

        // VARIATION: Cached objects to avoid expensive ctor in the hit() method
        this.oc = new vec3();
        this.normal = new vec3();
    }


    // NOTE: we haven't used the interval directly, like the book
    hitInterval(the_ray, the_ray_interval) {
        return this.hit(the_ray. the_ray_interval.min(), the_ray_interval.max());
    }


    hit(the_ray, the_ray_tmin, the_ray_tmax) {
        // VARIATION: as above
        let oc = this.oc;
        oc.set(this.center_);
        oc.sub(the_ray.origin());
    
        const a = the_ray.direction().getMagnitudeSquared();
        const h = the_ray.direction().dot(oc);
        const c = oc.getMagnitudeSquared() - this.radius_*this.radius_;
    
        const discriminant = h*h - a*c;

        if (discriminant < 0) {
            return null;
        }
        
        const sqrtd = sgxSqr(discriminant);

        // Find the nearest root that lies in the acceptable range.
        let root = (h - sqrtd) / a;
        if (root <= the_ray_tmin || the_ray_tmax <= root) {
            root = (h + sqrtd) / a;
            if (root <= the_ray_tmin || the_ray_tmax <= root)
                return null;
        }

        const position = the_ray.at(root);

        // VARIATION: as above
        let normal = this.normal;
        normal.set(position);
        normal.sub(this.center_);
        normal.div(this.radius_); // a normalize, without using square root

        // VARIATION: hitrecord has a pool of pre-allocated objects
        const hit_rec = HitRecord.create(position, normal, root, this.material);

        // I follow the book here, but should change it later. TODO
        hit_rec.set_face_normal(the_ray, normal);

        return hit_rec;
    }
}


export { Sphere };
