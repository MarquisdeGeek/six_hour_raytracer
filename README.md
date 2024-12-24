# The Six Hour Raytracer

A hastily written implementation of "Ray Tracing In One Weekend", on a quiet Friday afternoon in December, because I knew I wouldn't have any time at the weekend!

See it work by making the code visible to your web server of choice, and simply navigate to the page to see how each stage unfolds. The current version is live at https://marquisdegeek.github.io/six_hour_raytracer/

If you haven't read the book, it's freely available at https://raytracing.github.io/books/RayTracingInOneWeekend.html


## Notes

We use setTimeout() to yield the raytracing process, so that the DOM can refresh itself (to show % progress, and optionally, the display.) We could also have used webworkers. modules/progress.js controls the time permitted in the render state, before yielding back to the main thread.

I have made various optimisations and subtle changes to the original, which I marked with `VARIATION`. I hope they are all considered improvements. I had planned on making further performance optimisations by adding AABB to the hit test code, but realised it's covered in the next book, so will hold off until then.

The variable names have been kept in snake_case, despite my preference for lowerCamelCase, to better match the book.

The vec3 type is taken from the SGX graphics library, as are the basic HTML canvas access methods.

You can supply arguments in the URL for `width` and `scale` to render at alternate canvas sizes.



## Making a ugly version

You will get quite a few CPU cycles back from this version:

```
rollup --format es --input raytracer.js -o raytracer.tmp.js
uglifyjs raytracer.tmp.js -m -c -o raytracer.min.js
rm raytracer.tmp.js

```

Just remember to change the filename in `index.htm`


## Goals

Make it run the ""Juggler"" demo. e.g. http://www.etwright.org/cghist/juggler_rt.html

