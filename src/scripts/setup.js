import React, { useState, useEffect, useRef } from 'react'
import star from '../assets/solidStar.png'


import {
    Engine,
    Scene,
    ArcRotateCamera,
    Vector3,
    CreateGround,
    Tools,
    PBRMaterial,
    WebGPUEngine,
    SceneLoader,
    Color3,
    Color4,
    StandardMaterial,
    MeshBuilder,
    CubeTexture,
    Texture,
    Space,
    Matrix,
    ShadowGenerator,
    DirectionalLight,
    Animation,
    ParticleSystem
} from "@babylonjs/core"
import "@babylonjs/loaders"


let scene = {}
let shadowGenerator = {}
let camera = {}


/**
 * 
 * @param {object} scene prop to partent 
 * @param {object} canvas prop to partent 
 * @returns 
 */
const BabylonComponent = ({ babScene, babCanvas }) => {

    //  let scene = {}

    // const [babylonObjects, setBabylonObjects] = useState([])
    const renderCanvas = useRef(null)
    const webGL = useRef(false)
    let resizeTimeout
    let windowSize = []
    let orange = {}


    const sceneBuild = (engine, canvas) => {
        //scene
        scene = new Scene(engine)
        babScene(scene)
        //camera
        camera = new ArcRotateCamera("camera", Tools.ToRadians(45), Tools.ToRadians(65), 10, Vector3.Zero(), scene)
        camera.setTarget(Vector3.Zero())
        camera.attachControl(canvas, true)
        //lights
        // let light = new HemisphericLight("light1", new Vector3(0, 1, 1), scene)
        // light.intensity = 0.7

        const light = new DirectionalLight("dir01", new Vector3(-1, -2, -1), scene)
        light.position = new Vector3(20, 40, 20)
        light.intensity = 1
        //shadows
        shadowGenerator = new ShadowGenerator(1024, light)

        shadowGenerator.useExponentialShadowMap = true
        //materials
        let pbr = new PBRMaterial()
        pbr.albedoColor = new Color3(1, 0.5, 0)
        pbr.metallic = 0.1
        pbr.roughness = 0.1
        orange.current = pbr

        let brown = orange.current.clone("brownMaterial")
        brown.albedoColor = new Color3(0.7, 0.1, 0)

        //3d objects
        // let sphere = CreateSphere("sphere1", { segments: 16, diameter: 2 }, scene)
        // sphere.position.y = 2
        // sphere.material = pbr

        // ground
        let ground = CreateGround("ground1", { width: 256, height: 256, subdivisions: 16 }, scene)
        ground.position = new Vector3(0,-0.01,0)
        ground.material = brown
        ground.receiveShadows = true



        //environment 
        const skybox = MeshBuilder.CreateBox("skyBox", { size: 1000.0 }, scene)
        const skyboxMaterial = new StandardMaterial("skyBox", scene)
        skyboxMaterial.backFaceCulling = false
        skyboxMaterial.reflectionTexture = new CubeTexture("./media/textures/skybox/skybox", scene)
        skyboxMaterial.reflectionTexture.coordinatesMode = Texture.SKYBOX_MODE
        skyboxMaterial.diffuseColor = new Color3(0, 0, 0)
        skyboxMaterial.specularColor = new Color3(0, 0, 0)
        skybox.material = skyboxMaterial

        //custom mesh loading
        // let building = {}
        // loadMeshes(building, "./media/", "building.glb", scene)

        // setBabylonObjects([...babylonObjects, ground, camera, building])

        //resize engine render on window resize release
        const handleResize = () => {
            clearTimeout(resizeTimeout)
            // eslint-disable-next-line react-hooks/exhaustive-deps
            resizeTimeout = setTimeout(() => {
                windowSize.current = [window.innerWidth, window.innerHeight]
                engine.resize()
            }, 200)
        }
        window.addEventListener('resize', handleResize)

        // scene.onPointerDown = (event, pickResult) => {
        //     // pickResult is an object that contains information about the clicked object
        //     if (pickResult.hit) {
        //       console.log('Object clicked:', pickResult.pickedMesh.id)
        //     }
        //   }

        engine.runRenderLoop(() => {
            scene.render()
        })

        return () => {
            engine.dispose()
        }
    }

    //webGPU engine
    const createSceneGPU = async () => {
        const { current: canvas } = renderCanvas
        babCanvas(renderCanvas)
        const engine = new WebGPUEngine(canvas)
        await engine.initAsync()
        sceneBuild(engine, canvas)
    }

    //webGPU engine
    const createSceneWebGL = () => {
        const { current: canvas } = renderCanvas
        babCanvas(renderCanvas)
        const engine = new Engine(canvas, true)
        sceneBuild(engine, canvas)
    }


    function isSupportedBrowser() {

        let userAgent = navigator.userAgent
        if (
            (userAgent.includes("CriOS")) ||
            userAgent.includes("Android") ||
            userAgent.includes("SamsungBrowser") ||
            userAgent.includes("iPhone")

        ) {
            return false
        }
        let chromeMatch = userAgent.match(/Chrome\/(\d+)/)
        let edgeMatch = userAgent.match(/Edge\/(\d+)/)
        let firefoxMatch = userAgent.match(/Firefox\/(\d+)/)
        let operaMatch = userAgent.match(/OPR\/(\d+)/)
        if (
            (chromeMatch && parseInt(chromeMatch[1], 10) >= 113) ||
            (edgeMatch && parseInt(edgeMatch[1], 10) >= 113) ||
            (firefoxMatch && parseInt(firefoxMatch[1], 10) >= 113) ||
            (operaMatch && parseInt(operaMatch[1], 10) >= 100)
        ) {
            return true
        } else {
            return false
        }
    }



    //entry point
    useEffect(() => {
        if (Object.keys(scene).length === 0) {
            if (!isSupportedBrowser()) {
                console.warn("WebGPU not supported by browser")
                createSceneWebGL() //with webGL
                webGL.current = true
                return
            }
            if (!navigator.gpu) {
                console.warn("WebGPU not supported.")
                console.warn("Switching to WebGL")
                createSceneWebGL() //with webGL
                webGL.current = true
            }
            else {
                console.log("Using WebGPU")
                createSceneGPU() //with webGPU
            }
        }


    }, [])



    //show or hide meshes
    // if (babylonObjects[2]) {
    //     let checkvalid = false //HACk had to check if each object are valid first, workaroud error
    //     babylonObjects[2].Frame ? babylonObjects[2].Frame.isVisible = hideflags.frame : checkvalid = true
    //     babylonObjects[2].windowsmesh ? babylonObjects[2].windowsmesh.isVisible = hideflags.window : checkvalid = true
    //     babylonObjects[2].door ? babylonObjects[2].door.isVisible = hideflags.door : checkvalid = true
    //     babylonObjects[2].Wall ? babylonObjects[2].Wall.isVisible = hideflags.wall : checkvalid = true
    // }

    //  scene.onPointerDown = () => {console.log("clicked")}
    // //  function castRay(){
    // //     var ray = scene.createPickingRay(scene.pointerX, scene.pointerY, Matrix.Identity(), camera, false)	
    // //     var hit = scene.pickWithRay(ray)
    // //     console.log("HIT!: " + hit)
    // // }

    function loadMeshes(obj, path, filename, scene) {
        // obj.file = await SceneLoader.AppendAsync("")
        obj.file = SceneLoader.ImportMesh("", path, filename, scene, (meshes, ps, sk, ani) => {
            console.log("Meshes", meshes)
            console.log("Ani", ani)
            let side = 0
            meshes.forEach(element => {
                obj[element.name] = scene.getMeshByName(element.name)
                console.log(element.name)
                element.material = orange.current
                element.scaling = new Vector3(2, 2, 2)
                element.rotate(new Vector3(0, 1, 0), Tools.ToRadians(side), Space.WORLD)
                side = side + 90
            })
            console.log(obj)
        })
    }

    return (
        <div>
            <canvas
                ref={renderCanvas}
                id="renderCanvas"
            >
            </canvas>
            <p id="renderType">{webGL.current ? "Browser or GPU not supported, falling back to WebGL from WebGPU" : "Running on WebGPU"}</p>
        </div>
    )
}

export default BabylonComponent

export let counter = 0
export const createCube = (color, clone) => {
    const box = MeshBuilder.CreateBox("box " + counter)
    let pbr = new PBRMaterial()
    if(clone){
      //  box.scaling = clone.scaling //this does not work, it copies the object not the values
        // for (let i= 0; i <  box.scaling.length; i++){
        //     box.scaling[i] = clone.scaling[i]
        // }
        // box.scaling.x = clone.scaling.x
        // box.scaling.y = clone.scaling.y
        // box.scaling.z = clone.scaling.z
        const { x, y, z } = clone.scaling;
        box.scaling = new Vector3(x, y, z);
        pbr.albedoColor = color
    }
    else{
        pbr.albedoColor = Color3.FromHexString(color)
    }    
    pbr.metallic = 0.1
    pbr.roughness = 0.1
    box.material = pbr
    box.position = new Vector3(0, box.scaling.y/2, 0)
    shadowGenerator.addShadowCaster(box)
    box.enableEdgesRendering()
    box.edgesWidth = 4.0
    box.edgesColor = new Color4(0, 1, 0, 0.5)
    counter++
    puff()
    return box
}


export const changeColor = (box, color) => {
    box.material.albedoColor = Color3.FromHexString(color)
}


export const screenPos = (box) => {
    const screenPosition = Vector3.Project(box.position,
        Matrix.Identity(),
        scene.getTransformMatrix(),
        scene.activeCamera.viewport.toGlobal(scene.getEngine().getRenderWidth(),
         scene.getEngine().getRenderHeight()))
         const xy = [screenPosition.x, screenPosition.y]
    return xy
}


export const scaleAnimation = (box, axis, start , end)  =>{
    const lerpscaling = new Animation("lerpscaling", axis, 30, Animation.ANIMATIONTYPE_FLOAT, Animation.ANIMATIONLOOPMODE_CONSTANT);
    const keyFrames = []; 
    keyFrames.push({
        frame: 0,
        value: parseFloat(start) //start value
    });
        keyFrames.push({
        frame: 10,
        value: parseFloat(end) //end value
    });
    lerpscaling.setKeys(keyFrames); 
    box.animations.push(lerpscaling); //pass in object
    scene.beginAnimation(box, 0, 2 * 30, true);
}

const puff =() =>{ 
    let particleSystem = new ParticleSystem("stars", 1000, scene);
    particleSystem.particleTexture = new  Texture(star, scene);
    particleSystem.createPointEmitter(new Vector3(-1, 0, -1), new Vector3(1, 0.2, 1));
    particleSystem.color1 = new Color4(0.51, 0.13, 0.13);
    particleSystem.color2 = new Color4(1, 1, 1, 0);
    particleSystem.colorDead = new Color4(1, 1, 1, 0);
    particleSystem.emitRate = 6000;
    particleSystem.minEmitPower = 1;
    particleSystem.maxEmitPower = 20;
    particleSystem.addStartSizeGradient(1, 0.1);
    particleSystem.minAngularSpeed = 0;
    particleSystem.maxAngularSpeed = 1;
    particleSystem.addDragGradient(0,0.7,0.7);
    particleSystem.maxLifeTime = 0.001
    particleSystem.targetStopDuration = 0.01;
    particleSystem.start();
}