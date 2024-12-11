// Section 3

const vec3 = window.sgxVector3f;
const point3 = window.sgxVector3f;
const color3 =  window.sgxVector3f; // although we also have sgxColorRGBA, we keep to the books use of xyz (but with our reminder that it only stores 3 values)


// For section 9

window.sgxPoint3f.randomUnitDisk = function() {
    while (true) {
        let p = sgxPoint3f.random(-1, 1);
        p.z = 0;

        let lensq = p.getMagnitudeSquared();
        if (lensq <= 1) {
            return p;
        }
    }
}


window.sgxPoint3f.randomUnitOnHemisphere = function(normal) {
    let on_unit_sphere = window.sgxPoint3f.randomUnit();
    if (on_unit_sphere.dot(normal) > 0.0) { // In the same hemisphere as the normal
        return on_unit_sphere;
    }
    
    on_unit_sphere.neg();
    return on_unit_sphere;
}

// Section 10
window.sgxPoint3f.prototype.nearZero = function() {
    // sgxEq uses an epsilon check
    return sgxEq(this.x, 0) && sgxEq(this.y, 0) && sgxEq(this.z, 0);
}

window.sgxPoint3f.reflect = function(v, n) {
    // return v - 2*dot(v,n)*n;
    let reflectedVector = new vec3(v);
    let multiple = 2 * v.dot(n);
    let tempN = new vec3(n);
    tempN.mul(multiple);
    reflectedVector.sub(tempN);

    return reflectedVector;
}

window.sgxVector3f.refract = function(uv, n, etai_over_etat) {
    let negUV = new vec3(uv);
    negUV.neg();

    const cos_theta = sgxMin(negUV.dot(n), 1.0); 

    // Working from the end of:
    //    etai_over_etat * (uv + cos_theta*n);
    const r_out_perp =  new vec3(n);
    r_out_perp.mul(cos_theta);
    r_out_perp.add(uv);
    r_out_perp.mul(etai_over_etat);

    //  r_out_parallel = -std::sqrt(std::fabs(1.0 - r_out_perp.length_squared())) * n;
    const r_out_parallel =  new vec3(n);
    const multiple = -sgxSqr(sgxAbs(1.0 - r_out_perp.getMagnitudeSquared()));
    r_out_parallel.mul(multiple);


    r_out_perp.add(r_out_parallel);

    return r_out_perp;
}

// Stuff just for PPM export
vec3.saveData = function(v) {
    return `${v.x} ${v.y} ${v.z}`;
}

color3.saveData = function(c) {
    // VARIATION: I don't force an EOL here, since we might not always be using this export with a
    // PPM file.
    return `${sgxRoundDown(c.x * 255.999)} ${sgxRoundDown(c.y * 255.999)} ${sgxRoundDown(c.z * 255.999)}`;
}

export { vec3, point3, color3 };
