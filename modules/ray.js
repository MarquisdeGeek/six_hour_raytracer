// Section 4
import { vec3, point3 } from "./vec3.js";


class ray {
    constructor(origin, direction) {
        this.origin_ = new vec3(origin);
        this.direction_ = new vec3(direction);
    }

    direction() {
        return this.direction_;
    }

    origin() {
        return this.origin_;
    }

    at(t) {
        let position = new vec3(this.direction_);

        position.mul(t);
        position.add(this.origin_);

        return position;
    }
}


export { ray };
