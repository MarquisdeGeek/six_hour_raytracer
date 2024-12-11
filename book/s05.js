import { vec3, point3, color3} from "../modules/vec3.js";
import { rcGradient } from "./s04.js";


function hit_sphere(center, radius, the_ray) {
    const oc = new vec3(center);
    oc.sub(the_ray.origin());

    const a = the_ray.direction().dot(the_ray.direction());
    const b = -2 * the_ray.direction().dot(oc);
    const c = oc.dot(oc) - radius * radius;

    const discriminant = b*b - 4*a*c;

    return discriminant >= 0;
}


function rcBasicSphere(the_ray) {
    const center = new point3(0, 0, -1);
    const radius = 0.5;

    if (hit_sphere(center, radius, the_ray)) {
        return new color3(1, 0, 0);
    }

    // Make use of code from the previous lesson
    return rcGradient(the_ray);
}


export { rcBasicSphere }
