import {
    Scene,
    Engine,
    SceneLoader,
    HemisphericLight,
    Vector3,
    FreeCamera,
    AmmoJSPlugin,
    MeshBuilder,
    PhysicsImpostor,
    CubeTexture,
    PBRMaterial,
    Color3,
    ActionManager,
    ExecuteCodeAction,
    Texture,
    Matrix, AbstractMesh, Animation, Mesh, AnimationGroup
} from "@babylonjs/core";
import "@babylonjs/loaders";
import Ammo from "ammojs-typed"

export class CutScene {
    scene: Scene;
    engine: Engine;
    characterAnimations!: AnimationGroup[]
    camera!: FreeCamera

    constructor(private canvas: HTMLCanvasElement) {
        this.engine = new Engine(this.canvas, true);
        this.scene = this.CreateScene();
        this.CreateEnvironment().then().catch(e=>console.log(e))
        this.CreateCharacter()
        this.CreateZombies()
        this.CreateCutScene()
        this.engine.runRenderLoop(() => {
            this.scene.render();
        });
    }
    CreateScene(): Scene {
        const scene = new Scene(this.engine);
        new HemisphericLight("hemi",new Vector3(0,1,0),this.scene)
        const envTex = CubeTexture.CreateFromPrefilteredData("./environments/sky.env",scene)
        scene.environmentTexture = envTex
        scene.createDefaultSkybox(envTex,true,100,0.25)
        this.camera = new FreeCamera("camera",new Vector3(0,3,-10),this.scene)
        this.camera.attachControl()
        this.camera.minZ = 0.5
        this.camera.speed = 0.5
        return scene;
    }
    async CreateEnvironment(): Promise<void> {
        const { meshes } = await SceneLoader.ImportMeshAsync(
            "",
            "./models/",
            "Prototype_Level.glb",
            this.scene
        );
        meshes.map((mesh)=>{
            if (mesh.name == "Ramp") {
                mesh.setEnabled(false)
            }
        })
    }
    async CreateCharacter():Promise<void> {
        const {meshes,animationGroups} = await SceneLoader.ImportMeshAsync("","./models/","Character.glb",this.scene);
        this.characterAnimations = animationGroups
        meshes[0].rotate(Vector3.Up(),-Math.PI/2)
        meshes[0].position = new Vector3(8,0,-4)
    }
    async CreateZombies():Promise<void> {
        const zombieOne = await SceneLoader.ImportMeshAsync("","/models/","zombie_1.glb",this.scene)
        const zombieTwo = await SceneLoader.ImportMeshAsync("","/models/","zombie_2.glb",this.scene)
        zombieOne.meshes[0].rotate(Vector3.Up(),Math.PI/2)
        zombieOne.meshes[0].position = new Vector3(-8,0,-4)
        zombieTwo.meshes[0].rotate(Vector3.Up(),Math.PI/2)
        zombieTwo.meshes[0].position = new Vector3(-6,0,-2)
    }
    async CreateCutScene():Promise<void> {
        const camKeys=  []
        const fps = 60
        const camAnim = new Animation("camAnim","position",fps,Animation.ANIMATIONTYPE_VECTOR3,Animation.ANIMATIONLOOPMODE_CONSTANT,true)
        camKeys.push({frame:0,value:new Vector3(9,2,-9)})
        camKeys.push({frame:5*fps,value:new Vector3(-8,2,-8)})
        camKeys.push({frame:8*fps,value:new Vector3(-8,2,-8)})
        camKeys.push({frame:12*fps,value:new Vector3(0,3,-16)})
        camAnim.setKeys(camKeys)
        this.camera.animations.push(camAnim)
        await this.scene.beginAnimation(this.camera,0,12*fps).waitAsync()
        this.EndCutScene()
    }
    EndCutScene(): void {
        this.characterAnimations[0].stop()
        this.characterAnimations[1].play(true)
    }
}