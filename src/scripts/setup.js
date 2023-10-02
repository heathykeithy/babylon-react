import React, { useState, useEffect } from 'react';

import {
    Scene,
    ArcRotateCamera,
    HemisphericLight,
    Vector3,
    CreateGround,
    CreateSphere,
    Tools,
    PBRMaterial,
    WebGPUEngine,
    SceneLoader,
    Color3
} from "@babylonjs/core";
import "@babylonjs/loaders"



const BabylonComponent = () => {

    const [scene, setScene] = useState(null);
  // const [man, setMan] = useState({});
  //  const [building, setBuilding] = useState({});
    const [camera, setCamera] = useState({})

    useEffect(() => {
        const canvas = document.getElementById("renderCanvas");
        const engine = new WebGPUEngine(canvas);
        //engine.initAsync();

        const createScene = async () => {
            //scene
            await engine.initAsync();
            const newScene = new Scene(engine);
            
            //camera
            var camera =  new ArcRotateCamera("camera", Tools.ToRadians(90), Tools.ToRadians(65), 10, Vector3.Zero(), newScene)
            camera.setTarget(Vector3.Zero());
            camera.attachControl(canvas, true);
            //lights
            var light = new HemisphericLight("light1", new Vector3(0, 1, 0), newScene);
            light.intensity = 0.7;
            //materials
            var pbr = new PBRMaterial()
            pbr.albedoColor = new Color3(1,0.5,0)
            pbr.metallic = 0.1;
            pbr.roughness = 0.1;
            

            //3d objects
            var sphere = CreateSphere("sphere1", { segments: 16, diameter: 2 }, newScene);
            sphere.position.y = 2;
            sphere.material = pbr;

            // ground
            var ground = CreateGround("ground1", { width: 6, height: 6, subdivisions: 2 }, newScene);
            ground.material = pbr;
            
            
            //Render every frame
            engine.runRenderLoop(() => {
                //rotateRender(ground)
                newScene.render();
            });
            
           // setMan(man);
           // setBuilding(building);


            setScene(newScene);
        };

        createScene();



        // return () => {
        //     engine.dispose(); // Cleanup the engine when the component unmounts
        // };
    }, []);

    return (
        <div>
            <canvas id="renderCanvas" style={{ width: '100%', height: '100vh' }}></canvas>
        </div>
    );
}

export default BabylonComponent;


// let scene = {}
// const man = {}
// export const building = {}




// export async function setupBaby(element) {
//     // Get the canvas element from the DOM.
//     const canvas = element;

//     // Associate a Babylon Engine to it.
//    // const engine = new Engine(canvas);
//     const engine = new WebGPUEngine(canvas); 
//     await engine.initAsync(); //requirment of WEBGPU

//     // Create our first scene.
//     //var scene = new Scene(engine);
//     scene = new Scene(engine);

//     // This creates and positions a free camera (non-mesh)
//     //var camera = new FreeCamera("camera1", new Vector3(0, 5, -10), scene);
//     var camera = new ArcRotateCamera("camera", Tools.ToRadians(90), Tools.ToRadians(65), 10, Vector3.Zero(), scene);


//     // This targets the camera to scene origin
//     camera.setTarget(Vector3.Zero());

//     // This attaches the camera to the canvas
//     camera.attachControl(canvas, true);

//     // This creates a light, aiming 0,1,0 - to the sky (non-mesh)
//     var light = new HemisphericLight("light1", new Vector3(0, 1, 0), scene);

//     // Default intensity is 1. Let's dim the light a small amount
//     light.intensity = 0.7;

//     // Create a pbr material
//    // var material = new PBRBaseSimpleMaterial("pbr", scene);
//  //   material.metallicReflectanceColor = new Color3(1,0.5,0)


//     var pbr = new PBRMaterial()
//     pbr.albedoColor = new Color3(1,0.5,0)
//     pbr.metallic = 0.1;
//     pbr.roughness = 0.1;
    

//     // Our built-in 'sphere' shape.
//     var sphere = CreateSphere("sphere1", { segments: 16, diameter: 2 }, scene);

//     sphere.position.y = 2;

//     // Affect a material
//     sphere.material = pbr;

//     // Our built-in 'ground' shape.
//     var ground = CreateGround("ground1", { width: 6, height: 6, subdivisions: 2 }, scene);

//     // Affect a material
//     ground.material = pbr;

//     loadMeshes(man, "./media/", "man.glb")
//     loadMeshes(building, "./media/", "building.glb")
//     building.scale = new Vector3(2,2,2)
//     building.partent = ground
    

//     // Render every frame
//     engine.runRenderLoop(() => {
//         rotateRender(ground)
//         scene.render();
//     });
// }

function rotateRender(mesh){
    mesh.rotate(new Vector3(0, 1, 0), 0.002)
}




// function loadMeshes(obj, path, filename) {
//    // man.file = await SceneLoader.AppendAsync("https://patrickryanms.github.io/BabylonJStextures/Demos/sodaman/assets/gltf/sodaman.gltf");
//         obj.file = SceneLoader.ImportMesh("", path, filename, scene, (meshes, ps, sk, ani) => {
//         console.log("Meshes", meshes)
//         console.log("Ani", ani)
//         meshes.forEach(element => {
//             obj[element.name] = scene.getMeshByName(element.name);
//             console.log(element.name)
//             element.isVisible = false
//         });
//         console.log(obj)
//         obj.__root__.position = new Vector3(2, 0.0, 0.0)
        
    
//     });
    
// }

