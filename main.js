import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);

const whiteMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
const blackMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });

const boxes = [];
const frameLinesArray = [];

for (let i = 0; i < 350; i++) {
    const [x, y, z, x2, y2, z2] = Array(6).fill().map(() => THREE.MathUtils.randFloatSpread(200));
    const [rot_x, rot_y, rot_z] = Array(3).fill().map(() => Math.random() * 360);
    const scale = Math.random() * (4 - 0.3) + 0.3;
    const star_geometry = new THREE.SphereGeometry(0.2, 24, 24);
    const star = new THREE.Mesh(star_geometry, whiteMaterial);
    const box_geometry = new THREE.BoxGeometry(2.03, 2.03, 2.03);
    const box = new THREE.Mesh(box_geometry, blackMaterial);

    const frameGeometry = new THREE.BoxGeometry(2, 2, 2);
    const frameEdges = new THREE.EdgesGeometry(frameGeometry);
    const frameLines = new THREE.LineSegments(frameEdges, whiteMaterial);

    frameLines.rotation.set(rot_x, rot_y, rot_z);
    frameLines.scale.set(scale, scale, scale);
    frameLines.position.set(x2, y2, z2);

    frameLines.scale.multiplyScalar(1 + 0.02);

    box.rotation.set(rot_x, rot_y, rot_z);
    box.scale.set(scale, scale, scale);
    box.position.set(x2, y2, z2);

    star.position.set(x, y, z);

    scene.add(star, box, frameLines);

    const rotationSpeed = Math.random() * 0.005;

    boxes.push({ boxMesh: box, rotationSpeed: rotationSpeed });
    frameLinesArray.push({ linesMesh: frameLines, rotationSpeed: rotationSpeed })
}

camera.position.z = 10;

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
