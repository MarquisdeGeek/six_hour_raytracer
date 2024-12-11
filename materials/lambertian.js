// Section 10
import { Material } from "./material.js";
import { ray } from "../modules/ray.js";


class Lambertian extends Material {
#albedo

    constructor(albedo) {
        super();

        this.#albedo = albedo;
    }

    // returned scattered ray
    scatter(the_ray, hitRecord) {
        let scatter_direction = sgxPoint3f.randomUnit();
        scatter_direction.add(hitRecord.normal());

        // Catch degenerate scatter direction
        if (scatter_direction.nearZero()) {
            scatter_direction = hitRecord.normal();
        }
        
        const scattered = new ray(hitRecord.point(), scatter_direction);

        return {
            scattered,
            attenuation: this.#albedo
        }
    }
}


export { Lambertian };
