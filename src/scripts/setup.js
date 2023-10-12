import React, { useState, useEffect, useRef } from 'react'
import star from '../assets/solidStar.png'
import sun from '../assets/sun.png'
import { addObjects } from '../scripts/helpers.js'

import {
    Engine,
    Scene,
    Mesh,
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
    ParticleSystem,
    VolumetricLightScatteringPostProcess,
    SSAORenderingPipeline,
    VertexBuffer,
    TransformNode,
    GlowLayer,
    ShaderMaterial,
    RenderTargetTexture,
    HemisphericLight,
    BoundingInfo
} from "@babylonjs/core"
import "@babylonjs/loaders"


const debug = true

let scene = {}
let shadowGenerator = {}
let camera = {}
let ssao = {}
let puff


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
        if (debug) {
            console.warn("Debug enabled, scene is exposed at window.scene")
            window.scene = scene
        }

        babScene(scene)
        //camera
        camera = new ArcRotateCamera("camera", Tools.ToRadians(45), Tools.ToRadians(65), 10, Vector3.Zero(), scene)
        camera.setTarget(Vector3.Zero())
        camera.attachControl(canvas, true)


        //lights
        const light = new DirectionalLight("dir01", new Vector3(-1, -2, 1), scene)
        light.position = new Vector3(60, 130, -65)
        light.intensity = 1

        const areaLight = new HemisphericLight("hLight", new Vector3(0, 1, 0), scene)

        //glow
        // const glow = new GlowLayer("glow", scene)
        // glow.intensity = 0.2


        //ambient occlusion
        let ssaoRatio = { ssaoRatio: 0.5, combineRatio: 1.0 }
        ssao = new SSAORenderingPipeline("ssao", scene, ssaoRatio)
        ssao.fallOff = 0.000001
        ssao.area = 1
        ssao.radius = 0.0001
        ssao.totalStrength = 1.0
        ssao.base = 0.5

        // Attach camera to the SSAO render pipeline
        //  scene.postProcessRenderPipelineManager.attachCamerasToRenderPipeline("ssao", camera)

        //shadows
        shadowGenerator = new ShadowGenerator(1024, light)
        shadowGenerator.useExponentialShadowMap = true
        // shadowGenerator.setDarkness(0.5)


        //materials
        let pbr = new PBRMaterial()
        pbr.albedoColor = new Color3(1, 0.5, 0)
        pbr.metallic = 0.1
        pbr.roughness = 0.1
        orange.current = pbr

        let brown = orange.current.clone("brownMaterial")
        brown.albedoColor = new Color3(0.7, 0.1, 0)

        //custom shader
        // shaderMaterial = new ShaderMaterial("customShader", scene, "../shaders/custom", {
        //     vertex: "custom",
        //     fragment: "custom",
        // },
        //     {
        //         attributes: ["position", "normal", "color"],
        //         uniforms: ["worldViewProjection"]
        //     })



        // ground
        let ground = CreateGround("ground1", { width: 256, height: 256, subdivisions: 16 }, scene)
        ground.position = new Vector3(0, -0.01, 0)
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

        let starsCount = 0
        puff = () => { //partical animation 
            let particleSystem = new ParticleSystem("stars" + starsCount, 20000, scene)
            particleSystem.particleTexture = new Texture(star, scene)
            particleSystem.createPointEmitter(new Vector3(-1, 0, -1), new Vector3(1, 0.2, 1))
            particleSystem.color1 = new Color4(0.51, 0.13, 0.13)
            particleSystem.color2 = new Color4(1, 1, 1, 0)
            particleSystem.colorDead = new Color4(1, 1, 1, 0)
            particleSystem.emitRate = 6000
            particleSystem.minEmitPower = 1
            particleSystem.maxEmitPower = 20
            particleSystem.addStartSizeGradient(1, 0.1)
            particleSystem.minAngularSpeed = 0
            particleSystem.maxAngularSpeed = 1
            particleSystem.addDragGradient(0, 0.7, 0.7)
            particleSystem.maxLifeTime = 0.001
            particleSystem.targetStopDuration = 0.01
            particleSystem.start()
            starsCount++
        }


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

    const [vol, setVol] = useState(false)
    const [AO, setAO] = useState(false)
    const [shadows, setShadows] = useState(true)
    const [shadowDarkness, setShadowDarkness] = useState(0.5)
    let rays = null
    const volumetricsHandler = () => {
        if (!vol) {
            rays = new VolumetricLightScatteringPostProcess('rays', 1.0, camera, null, 100, Texture.BILINEAR_SAMPLINGMODE, scene.engine, false)
            rays.mesh.material.diffuseTexture = new Texture(sun, scene, true, false, Texture.BILINEAR_SAMPLINGMODE)
            rays.mesh.material.diffuseTexture.hasAlpha = true
            rays.mesh.scaling = new Vector3(30, 30, 30)
            rays.mesh.position = scene.lights[0].position
        }
        else {
            if (rays) {
                rays.dispose()
                rays = null
            }
        }
        setVol(!vol)
    }

    const AOHandler = () => {
        if (AO) { //detach AO
            scene.postProcessRenderPipelineManager.detachCamerasFromRenderPipeline("ssao", camera)
        }
        else {
            //attach AO
            scene.postProcessRenderPipelineManager.attachCamerasToRenderPipeline("ssao", camera)
            scene.postProcessRenderPipelineManager.enableEffectInPipeline("ssao", ssao.SSAOCombineRenderEffect, camera)
        }
        setAO(!AO)
    }

    const shadowHandler = () => {
        scene.shadowsEnabled = !shadows
        setShadows(!shadows)
    }

    const darknessHandler = (value) => {
        value = 100 - value
        setShadowDarkness(value / 100)
        shadowGenerator.setDarkness(shadowDarkness)
    }

    return (
        <div>
            <canvas
                ref={renderCanvas}
                id="renderCanvas"
            >
            </canvas>
            <div className='settings'>
                <div className='postprocess-option'>
                    <input type="checkbox" id="volumetrics" name="volumetrics" value="volumetrics" checked={vol} onChange={() => volumetricsHandler()}></input>
                    <label htmlFor="volumetrics">Volumetric Lighting</label>
                </div>
                <div className='postprocess-option'>
                    <input type="checkbox" id="oa" name="oa" value="oa" checked={AO} onChange={() => AOHandler()}></input>
                    <label htmlFor="edge">Ambient Occlusion</label>
                </div>
                <div className='postprocess-option'>
                    <input type="checkbox" id="shadows" name="shadows" value="shadows" checked={shadows} onChange={shadowHandler}></input>
                    <label htmlFor="edge">Shadows</label>
                    <div className="slidecontainer" >
                        <input type="range" min="1" max="100" className="slider" disabled={!shadows} id="myRange" onChange={(event) => darknessHandler(event.target.value)}></input>
                    </div>
                </div>
            </div>
            <p id="renderType">{webGL.current ? "Browser or GPU not supported, falling back to WebGL from WebGPU" : "Running on WebGPU"}</p>
            <div className='version'>
                {/* <img src={logo} alt='logo'></img> */}
                <p id="version">Configurator v0.0.2</p>
            </div>

        </div>
    )
}

export default BabylonComponent

const createMaterial = (color, clone) => {
    let pbr = new PBRMaterial()
    if (clone) {
        pbr.albedoColor = color
    }
    else {
        pbr.albedoColor = Color3.FromHexString(color)
    }
    pbr.metallic = 0.1
    pbr.roughness = 0.1
    return pbr
}

const addEdges = (mesh, clone) => {
    mesh.enableEdgesRendering()
    mesh.edgesWidth = 4.0
    if (clone) {
        mesh.edgesColor = clone.edgesColor
    }
    else {
        mesh.edgesColor = new Color4(0, 1, 0, 0.5)
    }
}

export let boxCounter = 0
export let capCounter = 0



export const createCube = (color, clone) => {
    const box = MeshBuilder.CreateBox("box " + boxCounter)
    if (clone) {
        //  box.scaling = clone.scaling //this does not work, it copies the object not the values
        const { x, y, z } = clone.scaling
        box.scaling = new Vector3(x, y, z)
        if (!clone.material) {
            copyVertData(clone, box)
        }
        else {
            box.material = createMaterial(color, clone)
        }
    }
    else {
        box.material = createMaterial(color, clone)
    }
    addEdges(box, clone)
    box.position = new Vector3(0, box.scaling.y / 2, 0)
    shadowGenerator.addShadowCaster(box)
    boxCounter++
    puff()
    createLines(box)
  //  box.refreshBoundingInfo()
  //  createDimentions(box,box.getBoundingInfo().boundingBox, 0.25)
    return box
}

export const changeColor = (mesh, color, surface) => {
    if (!mesh.material) {
        resetVertColors(mesh)
        mesh.material = createMaterial(color)
        return
    }
    const convertColor = Color3.FromHexString(color)
    if (surface === "surface") {
        mesh.material.albedoColor = convertColor
    }
    else { //convert to colour4
        mesh.edgesColor = new Color4(convertColor.r, convertColor.g, convertColor.b, 0.5)
    }

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

export const scaleAnimation = (mesh, axis, start, end) => {
    const lerpscaling = new Animation("lerpscaling", axis, 30, Animation.ANIMATIONTYPE_FLOAT, Animation.ANIMATIONLOOPMODE_CONSTANT)
    const keyFrames = []
    keyFrames.push({
        frame: 0,
        value: parseFloat(start) //start value
    })
    keyFrames.push({
        frame: 10,
        value: parseFloat(end) //end value
    })
    lerpscaling.setKeys(keyFrames)
    mesh.animations.push(lerpscaling) //pass in object
    scene.beginAnimation(mesh, 0, 2 * 30, true)
}

/**
 * Creates an extruded cap mesh based on a predefined shape and a given path.
 * @param {number} extValue - The length of the extrusion path.
 * @param {object} color - The color object specifying the color of the extruded cap.
 * @param {object} clone - The mesh object to which the extruded cap will be attached.
 * @returns {object} - The generated extruded cap mesh.
 */
export const extrudeCap = (extValue = 1, color, clone) => {
    const capShape = [ //create V shape
        new Vector3(-0.5, 0, 0),
        new Vector3(0, 0.5, 0),
        new Vector3(0.5, 0, 0),
    ]
    const myPath = [] //extend path from UI
    for (let i = 0; i < extValue; i++) {
        myPath[i] = new Vector3(i, 0, 0)
    }
    const extrusion = MeshBuilder.ExtrudeShapeCustom("extruded" + capCounter, { shape: capShape, path: myPath, updatable: true, sideOrientation: Mesh.DOUBLESIDE })

    addEdges(extrusion, clone)
    if (clone) {
        const { x, y, z } = clone.scaling
        extrusion.scaling = new Vector3(x, y, z)
        if (!clone.material) {
            copyVertData(clone, extrusion)
        }
        else {
            extrusion.material = createMaterial(color, clone)
        }
    }
    else {
        extrusion.material = createMaterial(color, clone)
    }
    extrusion.position.y = extrusion.scaling.y/2
    capCounter++
    puff()
    createLines(extrusion, true)
    return extrusion
}

/**
 * Changes the color of a specific face on a given mesh.
 * @param {object} mesh - The mesh object to which the color change will be applied.
 * @param {number} face - The index of the face on the mesh to be colored.
 * @param {object} color - The color object specifying the new color for the face.
 */
export const faceColorChange = (mesh, face, color) => {
    mesh.edgesWidth = 4.0
    if (mesh.material) {
        mesh.material.dispose()
    }
    const convertColor = Color3.FromHexString(color.hex)
    let indices = mesh.getIndices()
    console.log(indices)
    let positions = mesh.getVerticesData(VertexBuffer.PositionKind)
    let colorkind = mesh.getVerticesData(VertexBuffer.ColorKind)
    let verts = positions.length / 3
    if (!colorkind) {
        colorkind = new Array(4 * verts)
        colorkind = colorkind.fill(1)
    }
    face = face / 2
    let facet = 2 * Math.floor(face) //gets matching tris to make quad
    let clr = new Color4(convertColor.r, convertColor.g, convertColor.b, 1)
    let vertex
    let totalfaces = indices.length / 3
    //for (let i = 0; i < 6; i++) { //iterate through verts assigning values 
    for (let i = 0; i < totalfaces; i++) { //iterate through verts assigning values 
        vertex = indices[3 * facet + i]
        colorkind[4 * vertex] = clr.r
        colorkind[4 * vertex + 1] = clr.g
        colorkind[4 * vertex + 2] = clr.b
        colorkind[4 * vertex + 3] = clr.a
    }
    mesh.setVerticesData(VertexBuffer.ColorKind, colorkind)
}

/**
 * Copies vertex color data from a source mesh (clone) to a target mesh.
 * @param {object} clone - The source mesh containing vertex color data to be copied.
 * @param {object} mesh - The target mesh to which vertex color data will be applied.
 */
const copyVertData = (clone, mesh) => {
     let colorkind = clone.getVerticesData(VertexBuffer.ColorKind)
    mesh.setVerticesData(VertexBuffer.ColorKind, colorkind)
}

/**
 * Resets the vertex colors of a mesh to their default values.
 * @param {object} mesh - The mesh object whose vertex colors need to be reset.
 */
const resetVertColors = (mesh) => {
    let colorkind = mesh.getVerticesData(VertexBuffer.ColorKind)
    if (!colorkind) {
        return
    }
    for (let i = 0; i < colorkind.length; i++) {
        colorkind[i] = 1
    }
    mesh.setVerticesData(VertexBuffer.ColorKind, colorkind)
}


/**
 * Creates lines representing the X, Y, and Z axes of a mesh and sets their positions and scaling.
 * @param {object} mesh - The mesh object for which axes lines are created.
 * @param {boolean} ext - is Extrusion?
 * @param {number} offset - Offset value for positioning the lines on the axes.
 */
const createLines = (mesh, ext, offset=0.6) => {
    //create line for each axis of scaling
    //offset on axis 

    const lineX = [
        new Vector3(-0.5, offset, -offset),
        new Vector3(0.5, offset, -offset),
    ]
    const lineY = [ //HACK if extusion + half size (temp fix)
        new Vector3(offset, ext? 0: -0.5, -offset),
        new Vector3(offset, 0.5, -offset),
    ]
    const lineZ = [
        new Vector3(-offset, offset, -0.5),
        new Vector3(-offset, offset, 0.5),
    ]
    // const capline = (ypos) => {
    //     const cap = [
    //         new Vector3(-0.1, ypos, 0),
    //         new Vector3(0.1, ypos, 0),
    //     ]
    //     return cap
    // }
    mesh.scaling.x = 10
    const lineGroup = {}
    lineGroup.x = MeshBuilder.CreateLines("lines", { points: lineX });
    lineGroup.y = MeshBuilder.CreateLines("lines2", { points: lineY });
    lineGroup.z = MeshBuilder.CreateLines("lines3", { points: lineZ });
    mesh.lines = lineGroup //add lines directly to mesh object but not parented
    setlines(mesh, true, true)
    
}


/**
 * Updates the position and scaling properties of the lines object based on the provided mesh.
 * @param {object} mesh - The mesh object serving as a reference.
 * @param {boolean} scale - A flag indicating whether the lines should scale with the mesh.
 */
export const setlines=(mesh, scale)=>{
    let ext
    //TODO update on scale
    if(mesh.id.includes("extruded")){
        ext = true
    }
    if(!mesh.lines){
        throw console.error("Lines not attached to mesh: "+ mesh.name);
    }
    
    mesh.lines.x.position.copyFrom(mesh.position.add(new Vector3(ext? mesh.scaling.x/2 : 0, 0 ,(-mesh.scaling.z/2)+ 0.5)))
    mesh.lines.y.position.copyFrom(mesh.position.add(new Vector3(ext? mesh.scaling.x -0.5: (mesh.scaling.x/2)- 0.5),0,0))
    mesh.lines.z.position.copyFrom(mesh.position.add(new Vector3(ext? +0.5: (-mesh.scaling.x/2)+ 0.5),0,0))        
    
    if(scale){
    mesh.lines.x.scaling.x = mesh.scaling.x 
    mesh.lines.y.scaling.y = mesh.scaling.y 
    mesh.lines.z.scaling.z = mesh.scaling.z  
    }

}

const lineText = (parent, text) => {
    //create text that updates with scale of parent
    //child of line
}


// const applyCustomShader = (customMaterial) => {
//     const renderTarget = new RenderTargetTexture("customTexture", 256, scene)
//     customMaterial.setTexture("textureSampler", renderTarget)
//     scene.customRenderTargets.push(renderTarget)// stores render target texture from vertex colors
// }

// const createDimentions  = (mesh,bounding, offset) => {
//     const meshPosCenter = bounding.centerWorld.add(mesh.position);
//     const meshSize = bounding.extendSizeWorld.add(mesh.position);
//     const bbv = bounding.vectorsWorld
//     console.log(bounding.vectorsWorld[5])
//     console.log(bounding.vectorsWorld)


//     //TODO add offset to line using helper script 
//     let xLine = [bbv[3], bbv[5]]
//     let yLine = [bbv[5], bbv[2]]
//     let zLine = [bbv[3], bbv[6]]

//     const lineCoordinates = [xLine, yLine, zLine];

//     const dimensionLines = MeshBuilder.CreateLineSystem("Lines", { lines: lineCoordinates, updatable: true }, scene);
//     dimensionLines.color = new Color3(1, 1, 1);
    

//    window.lines = dimensionLines
//     const linesP =  new TransformNode("linesp", scene)
//     dimensionLines.parent = linesP
//     //linesP.position.y  = mesh.position.y
//     console.log(dimensionLines.position.y)

//     if(!offset){
//         offset = 0.25
//     }

//     let xtextpos = new Vector3(meshPosCenter.x, meshSize.y + offset, bbv[3].z)
//     let ytextpos = new Vector3(meshSize.x + offset, meshPosCenter.y, bbv[5].z)
//     let ztextpos = new Vector3(bbv[3].x, meshSize.y + offset, meshPosCenter.z)

//     const textplaceholderx = MeshBuilder.CreateBox("phx", { width: 0.2, height: 0.2, depth: 0.2 }, scene);
//     const textplaceholdery = MeshBuilder.CreateBox("phy", { width: 0.2, height: 0.2, depth: 0.2 }, scene);
//     const textplaceholderz = MeshBuilder.CreateBox("phz", { width: 0.2, height: 0.2, depth: 0.2 }, scene);
//     textplaceholderx.position = xtextpos
//     textplaceholdery.position = ytextpos
//     textplaceholderz.position = ztextpos
// }