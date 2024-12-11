// Section 10
import { Material } from "./material.js";
import { ray } from "../modules/ray.js";


class Metal extends Material {
#albedo
#fuzz

    constructor(albedo, fuzziness) {
        super();

        this.#albedo = albedo;
        this.#fuzz = fuzziness;
    }


    // returned scattered ray
    scatter(the_ray, hitRecord) {
        const reflected = sgxPoint3f.reflect(the_ray.direction(), hitRecord.normal());
        reflected.normalize();

        const fuzzVector = sgxPoint3f.randomUnit();
        fuzzVector.mul(this.#fuzz);

        reflected.add(fuzzVector);

        const scattered = new ray(hitRecord.point(), reflected);

        return {
            scattered,
            attenuation: this.#albedo
        }
    }
}


export { Metal };
