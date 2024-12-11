
function makeWorldSection10() {
	const Sphere = raytracer.surfaces.Sphere;
	let world = new raytracer.hittable.HittableList();
    const material_ground = new raytracer.materials.Lambertian(new raytracer.color3(0.8, 0.8, 0.0));
    const material_center = new raytracer.materials.Lambertian(new raytracer.color3(0.1, 0.2, 0.5));
    const material_left   = new raytracer.materials.Metal(new raytracer.color3(0.8, 0.8, 0.8), 0.3);
    const material_right  = new raytracer.materials.Metal(new raytracer.color3(0.8, 0.6, 0.2), 1.0);

	world.add(new Sphere(new raytracer.point3(0,-100.5,-1), 100, material_ground));
	world.add(new Sphere(new raytracer.point3(0, 0, -1.2), 0.5, material_center));
	world.add(new Sphere(new raytracer.point3(-1, 0, -1), 0.5, material_left));
	world.add(new Sphere(new raytracer.point3(1, 0, -1), 0.5, material_right));

	return { world };
}
