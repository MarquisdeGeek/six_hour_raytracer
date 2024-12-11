// Section 10
import { Material } from "./material.js";
import { ray } from "../modules/ray.js";
import { vec3 } from "../modules/vec3.js";


class Dielectric extends Material {
#refraction_index
static #white = new vec3(1,1,1);

    constructor(refraction_index) {
        super();

        this.#refraction_index = refraction_index;
    }

    #reflectance(cosine, refraction_index) {
        // Use Schlick's approximation for reflectance.
        let r0 = (1 - refraction_index) / (1 + refraction_index);
        r0 = r0*r0;
        return r0 + (1-r0)*sgxPower((1 - cosine), 5);
    }

    // returned scattered ray
    scatter(the_ray, hitRecord) {
        // TODO: Should we demonstrate the various algorithms here?
        const ri = hitRecord.front_face() ? (1.0/this.#refraction_index) : this.#refraction_index;

        const unit_direction_neg = new vec3(the_ray.direction());
        unit_direction_neg.normalize();
        unit_direction_neg.neg();

        let cos_theta = sgxMin(hitRecord.normal().dot(unit_direction_neg), 1.0);
        let sin_theta = sgxSqr(1.0 - cos_theta*cos_theta);
        let cannot_refract = ri * sin_theta > 1.0;

        let direction;

        // BUGWARN: unit_direction_neg is no longer a negative version - it just saves us another ctor
        unit_direction_neg.neg();
        let unit_direction = unit_direction_neg;
        //
        if (cannot_refract || this.#reflectance(cos_theta, ri) > sgxRand()) { // then reflect
            direction = sgxPoint3f.reflect(unit_direction, hitRecord.normal());
        } else {
            direction = sgxVector3f.refract(unit_direction, hitRecord.normal(), ri);
        }

        const scattered = new ray(hitRecord.point(), direction);

        return {
            scattered,
            attenuation: Dielectric.#white
        }
    }
}


export { Dielectric };
