
function makeWorldSection6() {
	const Sphere = raytracer.surfaces.Sphere;
	let world = new raytracer.hittable.HittableList();

	world.add(new Sphere(new raytracer.point3(0,0,-1), 0.5));
	world.add(new Sphere(new raytracer.point3(0,-100.5,-1), 100));

	return { world };
}
