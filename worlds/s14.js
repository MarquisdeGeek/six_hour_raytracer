
function makeWorldSection14() {
	const Sphere = raytracer.surfaces.Sphere;
	let world = new raytracer.hittable.HittableList();


    const ground_material = new raytracer.materials.Lambertian(new raytracer.color3(0.5, 0.5, 0.5));
	world.add(new Sphere(new raytracer.point3(0,-1000, 0), 1000, ground_material));


	const targetPoint = new raytracer.point3(4, 0.2, 0);
	for (let a = -11; a < 11; a++) {
        for (let b = -11; b < 11; b++) {
            let choose_mat = sgxRand();
            let center = new raytracer.point3(a + 0.9*sgxRand(), 0.2, b + 0.9*sgxRand());

            // if ((center - point3(4, 0.2, 0)).length() > 0.9) {
			if (center.getDistance(targetPoint) > 0.9) {
                // shared_ptr<material> sphere_material;

                if (choose_mat < 0.8) {
                    // diffuse
                    const albedo = sgxPoint3f.random();
					// color3::random() * color3::random();
                    // sphere_material = make_shared<lambertian>(albedo);
                    // world.add(make_shared<sphere>(center, 0.2, sphere_material));

					const tmpMaterial = new raytracer.materials.Lambertian(albedo);
					world.add(new Sphere(center, 0.2, tmpMaterial));
				
                } else if (choose_mat < 0.95) {
                    // metal
                    const albedo = sgxPoint3f.random(0.5, 1);
                    // auto albedo = color3::random(0.5, 1);
                    const fuzz = sgxRand() / 2;

					const tmpMaterial  = new raytracer.materials.Metal(albedo, fuzz);

					world.add(new Sphere(center, 0.2, tmpMaterial));
                } else {
                    // glass
                    // sphere_material = make_shared<dielectric>(1.5);
					const tmpMaterial   = new raytracer.materials.Dielectric(1.5);

					world.add(new Sphere(center, 0.2, tmpMaterial));
                }
            }
        }
    }



    const material1   = new raytracer.materials.Dielectric(1.5);
	world.add(new Sphere(new raytracer.point3(0, 1, 0), 1, material1));

    const material2 = new raytracer.materials.Lambertian(new raytracer.color3(0.4, 0.2, 0.1));
	world.add(new Sphere(new raytracer.point3(-4, 1, 0), 1, material2));

	const material3  = new raytracer.materials.Metal(new raytracer.color3(0.7, 0.6, 0.5), 0);
	world.add(new Sphere(new raytracer.point3(4, 1, 0), 1, material3));


	return { world };
}
