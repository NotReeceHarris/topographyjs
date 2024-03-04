// ascii theme by https://replit.com/@jgordon510/perlin-vanilla-js

import alea from 'alea';
import { Scene, OrthographicCamera, WebGLRenderer, Color, Vector2 } from "three";
import { Line2, LineGeometry, LineMaterial } from "three-fatline";
import { createNoise2D } from "simplex-noise";
import { AccumProgram } from "accum";

class Topography {
    constructor(el, seed, noiseScale = 0.02) {
        this.target = document.getElementById(el);
        this.seed = seed || Math.random();
        this.noiseScale = noiseScale;
    }

    updateSeed(seed) {
        this.seed = seed;
    }

    ascii() {
        var ramp = '$@B%8&WM#oahkbdpqwmZO0QLCJUYXzcvunxrjft/\|()1{}[]?-_+~i!lI;:,"^`\'.'

        const draw = () => {
            const prng = alea(this.seed)
            const noise2D = createNoise2D(prng);

            // Calculate the number of columns and rows based on character size and the size of the target element
            const testChar = document.createElement('span');
            testChar.innerHTML = 'M';
            this.target.appendChild(testChar);

            const charDimensions = testChar.getBoundingClientRect();
            const charWidth = charDimensions.width;
            const charHeight = charDimensions.height;

            const cols = Math.floor(this.target.offsetWidth / charWidth);
            const rows = Math.floor(this.target.offsetHeight / charHeight);
            this.target.removeChild(testChar);

            // Create a 2D array
            const map = Array.from({ length: cols }, (_, x) => {
                return Array.from({ length: rows }, (_, y) => {
                    const noiseLevel = (noise2D(x * this.noiseScale, y * this.noiseScale) + 1) / 2;
                    return ramp[Math.floor(noiseLevel * ramp.length)];
                });
            });

            // Create a new map by transforming each row into a line
            const newMap = Array.from({ length: rows }, (_, y) => {
                return Array.from({ length: cols }, (_, x) => map[x][y]).join('');
            });

            this.target.innerHTML = newMap.join('<br>');
        }

        const target = this.target;
        const resizeObserver = new ResizeObserver(function (entries) {
            for (let entry of entries) {
                if (entry.target === target) {
                    draw();
                }
            }
        });

        resizeObserver.observe(this.target);
        draw();
        return draw;
    }


    lines() {

        const draw = () => {
            this.target.innerHTML = '';
            const prng = alea(this.seed)
            const noise2D = createNoise2D(prng);

            const scene = new Scene();
            const res = this.target.offsetHeight;
            const camera = new OrthographicCamera(
                -res * 0.5,
                res * 0.5,
                res * 0.5,
                -res * 0.5,
                0,
                1000
            );
            
            camera.position.z = 0;

            const renderer = new WebGLRenderer({ antialias: true });
            renderer.setSize(this.target.offsetWidth, this.target.offsetHeight);
            this.target.appendChild(renderer.domElement);
            let hasRedLine = false;

            createLines(noise2D, res, scene, hasRedLine);
            scene.background = new Color("rgb(34, 30, 27)").convertLinearToSRGB();

            const accumProgram = new AccumProgram(renderer);
            (function animate() {
                requestAnimationFrame(animate);

                accumProgram.accumulate(() => {
                    camera.position.set(prng(), prng(), 0);
                    renderer.render(scene, camera);
                });
            })();
        }

        const createLines = (noise2D, res, scene, hasRedLine) => {
            const prng = alea(this.seed)
            for (let r = -20; r < 20; r++) {
                let vertices = [];

                let wnoise = noise2D(0, r * 0.125) * 1.0;
                let lwidth = 0.25 + Math.pow(wnoise * 0.5 + 1, 2);
                let lcolor = "rgb(241, 231, 222)";

                if (lwidth > 1.5 && !hasRedLine && Math.abs(r) < 4) {
                    hasRedLine = true;
                    lcolor = "rgb(255, 150, 140)";
                }

                let dashed = prng() > 0.5;
                let dashScale = 1;
                let dashSize = Math.pow(prng(), 2) * 15 + 4;
                let gapSize = dashSize * (0.5 + prng() * 1);

                const material = new LineMaterial({
                    color: lcolor,
                    linewidth: lwidth,
                    resolution: new Vector2(res, res),
                    dashed,
                    dashScale,
                    dashSize,
                    gapSize,
                });

                for (let i = 0; i < 100; i++) {
                    let height = 0;
                    height += noise2D(i * 0.0189 * 1, r * 0.125) * 2.0;
                    height += noise2D(i * 0.0189 * 2, r * 0.125) * 1.0;
                    height += noise2D(i * 0.0189 * 4, r * 0.125) * 0.5;
                    height += noise2D(i * 0.0189 * 8, r * 0.125) * 0.25;
                    height += noise2D(i * 0.0189 * 16, r * 0.125) * 0.125;

                    vertices.push(
                        -330 + 660 * (i / 100),
                        height * 20 + r * 16,
                        0
                    );
                }

                const geometry = new LineGeometry();
                geometry.setPositions(vertices);

                const myLine = new Line2(geometry, material);
                myLine.computeLineDistances();

                scene.add(myLine);
            }
        }

        const target = this.target;
        const resizeObserver = new ResizeObserver(function (entries) {
            for (let entry of entries) {
                if (entry.target === target) {
                    draw();
                }
            }
        });

        resizeObserver.observe(this.target);
        draw();
        return draw;

    }
}

export default Topography;