
function makeWorldSection12() {
	const Sphere = raytracer.surfaces.Sphere;
	let world = new raytracer.hittable.HittableList();
	let R = sgxCos(SGX_PI/4);

    const material_left = new raytracer.materials.Lambertian(new raytracer.color3(0, 0, 1));
    const material_right = new raytracer.materials.Lambertian(new raytracer.color3(1, 0, 0));

	world.add(new Sphere(new raytracer.point3(-R, 0, -1), R, material_left));
	world.add(new Sphere(new raytracer.point3( R, 0, -1), R, material_right));

	return { world };
}
