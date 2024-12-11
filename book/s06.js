import { vec3, point3, color3} from "../modules/vec3.js";
import { rcGradient } from "./s04.js";
import { Sphere } from "../surfaces/sphere.js";
import { interval } from "../modules/utils.js";

const unitZNegative = new sgxVector3f(0, 0, -1);


function hit_sphere(center, radius, the_ray) {
    const oc = new vec3(center);
    oc.sub(the_ray.origin());

    const a = the_ray.direction().dot(the_ray.direction());
    const b = -2 * the_ray.direction().dot(oc);
    const c = oc.dot(oc) - radius * radius;

    const discriminant = b*b - 4*a*c;

    if (discriminant < 0) {
        return -1;
    } else {
        return (-b - sgxSqr(discriminant) ) / (2.0 * a);
    }
}


function hit_sphere_simple(center, radius, the_ray) {
    const oc = new vec3(center);
    oc.sub(the_ray.origin());

    const ray_direction = the_ray.direction();

    const a = the_ray.direction().getMagnitudeSquared();
    const h = the_ray.direction().dot(oc);
    const c = oc.getMagnitudeSquared() - radius*radius;

    const discriminant = h*h - a*c;

    if (discriminant < 0) {
        return -1;
    } else {
        return (h - sgxSqr(discriminant) ) / a;
    }
}



function rcShadedSphereBasic(the_ray, cbHitTest) {
    const center = new point3(0, 0, -1);
    const radius = 0.5;

    // t here is the point along the ray
    const t = cbHitTest(center, radius, the_ray);

    if (t > 0) {
        const normal = new vec3(the_ray.at(t));
        normal.sub(unitZNegative);
        normal.normalize();
    
        const c = new color3(normal.x+1, normal.y+1, normal.z+1);
        c.mul(0.5);

        return c;
    }

    return rcGradient(the_ray);
}



function rcShadedSphere(the_ray) {
    return rcShadedSphereBasic(the_ray, hit_sphere);
}


function rcShadedSphereSimplifiedHitTest(the_ray) {
    return rcShadedSphereBasic(the_ray, hit_sphere_simple);
}


function rcShadedSphereWithSurfaceObject(the_ray) {
    const sphere = new Sphere(unitZNegative, 0.5);

    const hit_rec = sphere.hit(the_ray, 0, 1);

    if (hit_rec) {
        const normal = hit_rec.normal();
        const c = new color3(normal.x+1, normal.y+1, normal.z+1);
        c.mul(0.5);

        return c;
    }

    return rcGradient(the_ray);
}


function rcShadedWorld(the_ray) {
    // When using this, ensure we bind() to an object containing the world data
    const ival = new interval(0, SGX_INF);
    // const hit_rec = this.world.hit(the_ray, 0, SGX_INF);
    const hit_rec = this.world.hitInterval(the_ray, ival);

    if (hit_rec) {
        const normal = hit_rec.normal();
        const c = new color3(normal.x+1, normal.y+1, normal.z+1);
        c.mul(0.5);

        return c;
    }

    return rcGradient(the_ray);
}




export { rcShadedSphere, rcShadedSphereSimplifiedHitTest, rcShadedSphereWithSurfaceObject, rcShadedWorld }
