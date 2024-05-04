import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial";
import { LineGeometry } from "three/examples/jsm/lines/LineGeometry";
import { Line2 } from "three/examples/jsm/lines/Line2";
// import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const urls = [
    new URL('assets/models/A.glb', import.meta.url),
    new URL('assets/models/R.glb', import.meta.url),
    new URL('assets/models/T.glb', import.meta.url),
    new URL('assets/models/U.glb', import.meta.url),
    new URL('assets/models/E.glb', import.meta.url)
];


const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// const controls = new OrbitControls(camera, renderer.domElement);

const whiteMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
const blackMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
var scrolled;

const boxes = [];
const frameLinesArray = [];

for (let i = 0; i < 1000; i++) {
    const [x, y, z, x2, y2, z2] = Array(6).fill().map(() => THREE.MathUtils.randFloatSpread(300));
    const [x3, y3, z3] = Array(6).fill().map(() => THREE.MathUtils.randFloatSpread(400));
    const [rot_x, rot_y, rot_z] = Array(3).fill().map(() => Math.random() * 360);
    const scale = Math.random() * (4 - 0.3) + 0.3;
    const star_geometry = new THREE.SphereGeometry(0.2, 24, 24);
    const star = new THREE.Mesh(star_geometry, whiteMaterial);
    const smallStarGeometry = new THREE.SphereGeometry(0.1, 24, 24);
    const smallStar = new THREE.Mesh(smallStarGeometry, whiteMaterial);
    const box_geometry = new THREE.BoxGeometry(2.03, 2.03, 2.03);
    const box = new THREE.Mesh(box_geometry, blackMaterial);
    // znalazłem sposób na internecie jak zrobić fajnie linie i faktycznie to są linie
    const frameGeometry = new THREE.BoxGeometry(2, 2, 2);
    const frameEdges = new THREE.EdgesGeometry(frameGeometry);
    const frameLines = new THREE.LineSegments(frameEdges, whiteMaterial);

    frameLines.rotation.set(rot_x, rot_y, rot_z);
    frameLines.scale.set(scale, scale, scale);
    frameLines.position.set(x2, y2, z2);

    frameLines.scale.multiplyScalar(1 + 0.03);

    box.rotation.set(rot_x, rot_y, rot_z);
    box.scale.set(scale, scale, scale);
    box.position.set(x2, y2, z2);

    star.position.set(x, y, z);
    smallStar.position.set(x3, y3, z3);

    scene.add(star, smallStar, box, frameLines);

    const rotationSpeed = Math.random() * 0.005;

    boxes.push({ boxMesh: box, rotationSpeed: rotationSpeed });
    frameLinesArray.push({ linesMesh: frameLines, rotationSpeed: rotationSpeed })
}

const assetLoader = new GLTFLoader();
const models = [];
let allPoints = [];
let line, outlineGeometry;
const matLine = new LineMaterial( {

    color: 0xffffff,
    linewidth: 5, // in world units with size attenuation, pixels otherwise
    vertexColors: true,

    //resolution:  // to be set by renderer, eventually
    dashed: false,
    alphaToCoverage: true,

} );

function loadModelsSequentially(index) {
    if (index >= urls.length) {
        return;
    }
    const url = urls[index];
    assetLoader.load(url.href, function(gltf) {
        const model = gltf.scene.children[0];
        model.rotateX(Math.PI / 2);
        model.scale.set(2,2,2);
        models.push(gltf.scene);
        scene.add(gltf.scene);

        const outlineGeometry = new THREE.EdgesGeometry(model.geometry);
        const outline = new THREE.LineSegments(outlineGeometry, whiteMaterial);
        outline.scale.set(1.03, 1.03, 1.03);
        model.add(outline);

        if (models.length === urls.length) {
            models[0].position.set(-1.7,-100,-153);
            models[1].position.set(-0.75,-100,-153);
            models[2].position.set(0,-100,-153);
            models[3].position.set(0.75,-100,-153);
            models[4].position.set(1.7,-100,-153);
        }
        loadModelsSequentially(index + 1);
    }, undefined, function(error) {
        console.error(error);
        loadModelsSequentially(index + 1);
    });
}
loadModelsSequentially(0);

function updatePos(event) {
    models.forEach((model) => {
        const vector = new THREE.Vector3(model.position.x, model.position.y, model.position.z);
        vector.project(camera);
        const modelCenterX = (vector.x + 1) / 2 * window.innerWidth;
        const modelCenterY = (-vector.y + 1) / 2 * window.innerHeight;

        const mouseX = (event.clientX - modelCenterX) / modelCenterX;
        const mouseY = (event.clientY - modelCenterY) / modelCenterY;

        const horizontalValue = mouseX.toFixed(2) * Math.PI / 2;
        const verticalValue = mouseY.toFixed(2) * Math.PI / 2;

        model.rotation.y = Math.max(Math.min(horizontalValue, Math.PI / 4), Math.PI / -4);
        model.rotation.x = Math.max(Math.min(verticalValue, Math.PI / 4), Math.PI / -4);
    });
}
document.addEventListener('mousemove', updatePos);

camera.rotateX(THREE.MathUtils.degToRad(90));
window.addEventListener('scroll', function() {
    var scrollHeight = document.documentElement.scrollHeight;
    var scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
    var clientHeight = document.documentElement.clientHeight;

    scrolled = (scrollTop / (scrollHeight - clientHeight)) * 100;

    if (scrolled >= 0 && scrolled <= 30) {
        camera.rotation.x = THREE.MathUtils.degToRad(90 * (1 - scrolled / 30));
    } else if (scrolled > 30 && scrolled <= 60) {
        camera.rotation.x = 0;
        camera.position.y = -100 * (scrolled / 30 - 1);
    } else if (scrolled > 60 && scrolled <= 90) {
        camera.position.y = -100;
        camera.position.z = -150 * (scrolled / 30 - 2);
    } else {
        camera.position.z = -150;
        camera.position.y = -100;
        camera.rotation.x = 0;
    }
});

function animate() {
    requestAnimationFrame(animate);

    boxes.forEach(boxInfo => {
        const { boxMesh, rotationSpeed } = boxInfo;
        boxMesh.rotation.x += rotationSpeed;
        boxMesh.rotation.y += rotationSpeed;
        boxMesh.rotation.z += rotationSpeed;
    });

    frameLinesArray.forEach(linesInfo => {
        const { linesMesh, rotationSpeed } = linesInfo;
        linesMesh.rotation.x += rotationSpeed;
        linesMesh.rotation.y += rotationSpeed;
        linesMesh.rotation.z += rotationSpeed;
    });

    renderer.render(scene, camera);
}

animate();

window.addEventListener('resize', function() {
    camera.aspect = window.innerWidth / this.window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});