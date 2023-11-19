import {defs, tiny} from './examples/common.js';

const {
    Vector, Vector3, vec, vec3, vec4, color, hex_color, Matrix, Mat4, Light, Shape, Material, Scene,
} = tiny;

class Cube extends Shape {
    constructor() {
        super("position", "normal",);
        // Loop 3 times (for each axis), and inside loop twice (for opposing cube sides):
        this.arrays.position = Vector3.cast(
            [-1, -1, -1], [1, -1, -1], [-1, -1, 1], [1, -1, 1], [1, 1, -1], [-1, 1, -1], [1, 1, 1], [-1, 1, 1],
            [-1, -1, -1], [-1, -1, 1], [-1, 1, -1], [-1, 1, 1], [1, -1, 1], [1, -1, -1], [1, 1, 1], [1, 1, -1],
            [-1, -1, 1], [1, -1, 1], [-1, 1, 1], [1, 1, 1], [1, -1, -1], [-1, -1, -1], [1, 1, -1], [-1, 1, -1]);
        this.arrays.normal = Vector3.cast(
            [0, -1, 0], [0, -1, 0], [0, -1, 0], [0, -1, 0], [0, 1, 0], [0, 1, 0], [0, 1, 0], [0, 1, 0],
            [-1, 0, 0], [-1, 0, 0], [-1, 0, 0], [-1, 0, 0], [1, 0, 0], [1, 0, 0], [1, 0, 0], [1, 0, 0],
            [0, 0, 1], [0, 0, 1], [0, 0, 1], [0, 0, 1], [0, 0, -1], [0, 0, -1], [0, 0, -1], [0, 0, -1]);
        // Arrange the vertices into a square shape in texture space too:
        this.indices.push(0, 1, 2, 1, 3, 2, 4, 5, 6, 5, 7, 6, 8, 9, 10, 9, 11, 10, 12, 13,
            14, 13, 15, 14, 16, 17, 18, 17, 19, 18, 20, 21, 22, 21, 23, 22);
    }
}

class Cube_Outline extends Shape {
    constructor() {
        super("position", "color");
        //  TODO (Requirement 5).
        // When a set of lines is used in graphics, you should think of the list entries as
        // broken down into pairs; each pair of vertices will be drawn as a line segment.
        // Note: since the outline is rendered with Basic_shader, you need to redefine the position and color of each vertex
    }
}

class Cube_Single_Strip extends Shape {
    constructor() {
        super("position", "normal");
        // TODO (Requirement 6)
    }
}

class Pane extends Shape {
    constructor() {
        super("position", "normal",);
        this.arrays.position = Vector3.cast(
            [-1, 0, -1], [1, 0, -1], [-1, 0, 1], [1, 0, 1]
        );
        this.arrays.normal = Vector3.cast(
            [0, -1, 0], [0, -1, 0], [0, -1, 0], [0, -1, 0]
        );
        this.indices.push(0, 1, 2, 1, 2, 3);
    }
}


class Base_Scene extends Scene {
    /**
     *  **Base_scene** is a Scene that can be added to any display canvas.
     *  Setup the shapes, materials, camera, and lighting here.
     */
    constructor() {
        // constructor(): Scenes begin by populating initial values like the Shapes and Materials they'll need.
        super();
        this.hover = this.swarm = false;
        // At the beginning of our program, load one of each of these shape definitions onto the GPU.
        this.shapes = {
            'cube': new Cube(),
            'outline': new Cube_Outline(),
            'pane': new Pane(),
        };

        // *** Materials
        this.materials = {
            plastic: new Material(new defs.Phong_Shader(),
                {ambient: .4, diffusivity: .6, color: hex_color("#ffffff")}),
        };
        // The white material and basic shader are used for drawing the outline.
        this.white = new Material(new defs.Basic_Shader());
        this.levels = []
        for (let i = 0; i < 100; i++) {
            let temp = [];
            for (let j = 0; j < 13; j++) {
                temp.push(Math.round(Math.random()));
            }
            this.levels.push(temp);
        }
    }

    display(context, program_state) {
        // display():  Called once per frame of animation. Here, the base class's display only does
        // some initial setup.

        // Setup -- This part sets up the scene's overall camera matrix, projection matrix, and lights:
        if (!context.scratchpad.controls) {
            this.children.push(context.scratchpad.controls = new defs.Movement_Controls());
            // Define the global camera and projection matrices, which are stored in program_state.
            program_state.set_camera(Mat4.translation(-0.5,-1.5,0));
        }
        program_state.projection_transform = Mat4.perspective(
            Math.PI / 4, context.width / context.height, 1, 100);

        // *** Lights: *** Values of vector or point lights.
        const light_position = vec4(0, 5, 5, 1);
        program_state.lights = [new Light(light_position, color(1, 1, 1, 1), 1000)];
    }
}

export class Assignment2 extends Base_Scene {
    /**
     * This Scene object can be added to any display canvas.
     * We isolate that code so it can be experimented with on its own.
     * This gives you a very small code sandbox for editing a simple scene, and for
     * experimenting with matrix transformations.
     */
    set_colors() {
        // TODO:  Create a class member variable to store your cube's colors.
        // Hint:  You might need to create a member variable at somewhere to store the colors, using `this`.
        // Hint2: You can consider add a constructor for class Assignment2, or add member variables in Base_Scene's constructor.
    }

    make_control_panel() {
        // Draw the scene's buttons, setup their actions and keyboard shortcuts, and monitor live measurements.
        this.key_triggered_button("Change Colors", ["c"], this.set_colors);
        // Add a button for controlling the scene.
        this.key_triggered_button("Outline", ["o"], () => {
            // TODO:  Requirement 5b:  Set a flag here that will toggle your outline on and off
        });
        this.key_triggered_button("Sit still", ["m"], () => {
            // TODO:  Requirement 3d:  Set a flag here that will toggle your swaying motion on and off.
        });
    }

    draw_box(context, program_state, model_transform) {
        // TODO:  Helper function for requirement 3 (see hint).
        //        This should make changes to the model_transform matrix, draw the next box, and return the newest model_transform.
        // Hint:  You can add more parameters for this function, like the desired color, index of the box, etc.

        return model_transform;
    }

    generateFaces(num_sides, panes_per_side, context, program_state, model_transform, ring_color, row) {
        const blue = color(255 * Math.random(), 255 * Math.random(), 255 * Math.random(), 1)
        let rotation_angle = 360 / num_sides;
        for (let i = 0; i < num_sides; i++) {
            for(let j = 0; j < panes_per_side; j++) {
                if (row[i*panes_per_side + j]) {
                    this.shapes.pane.draw(context, program_state, model_transform.times(Mat4.scale(1, 10, 5)), this.materials.plastic.override({color:color(0.5, 0.5, 0.1, 1)}));
                }
                model_transform = model_transform.times(Mat4.translation(1, 0, 0));
                
            }
            model_transform = model_transform.times(Mat4.rotation(rotation_angle * Math.PI / 180, 0, 0, 1));
            model_transform = model_transform.times(Mat4.translation(1, 0, 0));
        }
    }

    display(context, program_state) {
        super.display(context, program_state);
        let model_transform = Mat4.identity();
        let t = program_state.animation_time / 1000
        model_transform = model_transform.times(Mat4.translation(0, 0, t * 12))
        for (let i = 0; i<this.levels.length; i++) {
            this.generateFaces(6, 2, context, program_state, model_transform, color(0.9, 0.3, .2, 1), this.levels[i]);
            model_transform = model_transform.times(Mat4.translation(0, 0, -10));
        }
    }
}