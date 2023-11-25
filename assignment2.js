import { defs, tiny } from "./examples/common.js";

import { GameManager, stringToMatrix } from "./gameManager.js";

const {
  Vector,
  Vector3,
  vec,
  vec3,
  vec4,
  color,
  hex_color,
  Matrix,
  Mat4,
  Light,
  Shape,
  Material,
  Scene,
} = tiny;

class Cube extends Shape {
  constructor() {
    super("position", "normal");
    // Loop 3 times (for each axis), and inside loop twice (for opposing cube sides):
    this.arrays.position = Vector3.cast(
      [-1, -1, -1],
      [1, -1, -1],
      [-1, -1, 1],
      [1, -1, 1],
      [1, 1, -1],
      [-1, 1, -1],
      [1, 1, 1],
      [-1, 1, 1],
      [-1, -1, -1],
      [-1, -1, 1],
      [-1, 1, -1],
      [-1, 1, 1],
      [1, -1, 1],
      [1, -1, -1],
      [1, 1, 1],
      [1, 1, -1],
      [-1, -1, 1],
      [1, -1, 1],
      [-1, 1, 1],
      [1, 1, 1],
      [1, -1, -1],
      [-1, -1, -1],
      [1, 1, -1],
      [-1, 1, -1]
    );
    this.arrays.normal = Vector3.cast(
      [0, -1, 0],
      [0, -1, 0],
      [0, -1, 0],
      [0, -1, 0],
      [0, 1, 0],
      [0, 1, 0],
      [0, 1, 0],
      [0, 1, 0],
      [-1, 0, 0],
      [-1, 0, 0],
      [-1, 0, 0],
      [-1, 0, 0],
      [1, 0, 0],
      [1, 0, 0],
      [1, 0, 0],
      [1, 0, 0],
      [0, 0, 1],
      [0, 0, 1],
      [0, 0, 1],
      [0, 0, 1],
      [0, 0, -1],
      [0, 0, -1],
      [0, 0, -1],
      [0, 0, -1]
    );
    // Arrange the vertices into a square shape in texture space too:
    this.indices.push(
      0,
      1,
      2,
      1,
      3,
      2,
      4,
      5,
      6,
      5,
      7,
      6,
      8,
      9,
      10,
      9,
      11,
      10,
      12,
      13,
      14,
      13,
      15,
      14,
      16,
      17,
      18,
      17,
      19,
      18,
      20,
      21,
      22,
      21,
      23,
      22
    );
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
    super("position", "normal");
    this.arrays.position = Vector3.cast(
      [-1, 0, -1],
      [1, 0, -1],
      [-1, 0, 1],
      [1, 0, 1]
    );
    this.arrays.normal = Vector3.cast(
      [0, -1, 0],
      [0, -1, 0],
      [0, -1, 0],
      [0, -1, 0]
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
      cube: new Cube(),
      outline: new Cube_Outline(),
      pane: new Pane(),
      sphere: new defs.Subdivision_Sphere(4),
    };

    // *** Materials
    this.materials = {
      plastic: new Material(new defs.Phong_Shader(), {
        ambient: 0.4,
        diffusivity: 0.6,
        color: hex_color("#ffffff"),
      }),
    };
    // The white material and basic shader are used for drawing the outline.
    this.white = new Material(new defs.Basic_Shader());

    this.levels = [];
    for (let i = 0; i < 20; i++) {
      let temp = [];
      for (let j = 0; j < 13; j++) {
        temp.push(Math.floor(Math.random() * 2));
      }
      this.levels.push(temp);
    }
    this.sphere_transform = Mat4.identity().times(
      Mat4.translation(0.5, 0.5, -4).times(Mat4.scale(0.2, 0.2, 0.2))
    );

    //Need globally stored program time for smooth ball transitions
    this.mili_t = 0;
    this.mark_begin = 0;
    this.mark_end = 0;

    this.key_shift = 10.0; // How much distance the ball should move on each keypress
    this.gradient_x = 100; //How fast the ball should move in its change of direction. Higher number is slower.
    this.delta_x = this.key_shift / this.gradient_x;

    this.left_pressed = false;
    this.right_pressed = false;

    this.bounds = 0; //Simple range from -13 to 13 for ball movement. Note: needs to be set by inspection.

    //JUMP MOTION
    this.is_jumping = false;
    this.jump_begin = 0;
    this.jump_end = 0;

    this.jump_height = 3.0;
    this.gravity = 1000;

    this.jump_origin = Mat4.identity();
  }

  display(context, program_state) {
    // display():  Called once per frame of animation. Here, the base class's display only does
    // some initial setup.

    // Setup -- This part sets up the scene's overall camera matrix, projection matrix, and lights:
    if (!context.scratchpad.controls) {
      this.children.push(
        (context.scratchpad.controls = new defs.Movement_Controls())
      );
      // Define the global camera and projection matrices, which are stored in program_state.
      this.camera_location = this.rotation(0);
      program_state.set_camera(this.camera_location);
    }
    program_state.projection_transform = Mat4.perspective(
      Math.PI / 4,
      context.width / context.height,
      1,
      100
    );

    // *** Lights: *** Values of vector or point lights.
    const light_position = vec4(0, 5, 5, 1);
    program_state.lights = [new Light(light_position, color(1, 1, 1, 1), 1000)];
  }

  rotation(side) {
    const center_translation = Mat4.translation(
      -0.5,
      -1.5,
      0
    );
    return center_translation.pre_multiply(
      Mat4.rotation(side * (Math.PI / 3), 0, 0, 1)
    );
    //   .times(Mat4.inverse(center_translation))
    //   .times(Mat4.translation(-0.5, -1.5, 0));
  }
}

export class Assignment2 extends Base_Scene {
  /**
   * This Scene object can be added to any display canvas.
   * We isolate that code so it can be experimented with on its own.
   * This gives you a very small code sandbox for editing a simple scene, and for
   * experimenting with matrix transformations.
   */
  constructor() {
    super();
    const levels = [
      `101110101110
      111010111010
      010111010111
      011100011100`,
      `101110101110
      111010111010
      010111010111
      011100011100`,
      `101110101110
      111010111010
      010111010111
      011100011100`,
    ];
    const game = new GameManager(levels.map((l) => stringToMatrix(l)));
    this.manager = game;
    this.prev_t = -1;
  }
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
    this.key_triggered_button("Jump", ["k"], () => {
      // TODO:  Requirement 3d:  Set a flag here that will toggle your swaying motion on and off.
      if (this.is_jumping) {
        return;
      } else {
        this.jump_begin = this.mili_t;
        this.jump_end = this.jump_begin + this.gravity;
        this.is_jumping = true;
        this.jump_origin = this.sphere_transform;
      }
    });

    this.key_triggered_button("Move Left", ["j"], () => {
      console.log("click l")
      this.bounds--;
      if (this.bounds > -13) {
        this.left_pressed = true;

        this.mark_begin = this.mili_t;
        this.mark_end = this.mark_begin + this.gradient_x;
      } else {
        this.bounds = -13;
      }
    });

    this.key_triggered_button("Move Right", ["l"], () => {
      if (this.right_pressed) {
        return;
      }

      this.bounds++;
      if (this.bounds < 13) {
        this.right_pressed = true;

        this.mark_begin = this.mili_t;
        this.mark_end = this.mark_begin + this.gradient_x;
      } else {
        this.bounds = 13;
      }
    });
  }

  draw_ball(context, program_state) {
    if (this.is_jumping) {
      if (this.mili_t < this.jump_end) {
        let vertex = this.gravity / 2;
        let projectile_time = this.mili_t - this.jump_begin;
        let a = (-1 * this.jump_height) / vertex ** 2;
        let y = a * (projectile_time - vertex) ** 2 + this.jump_height;
        console.log(y);

        this.sphere_transform = this.jump_origin.times(
          Mat4.translation(0, y, 0)
        );
      } else {
        console.log("Jump ended");
        this.jump_origin = Mat4.identity();
        this.is_jumping = false;
      }
    }

    if (this.left_pressed) {
      if (this.mili_t < this.mark_end) {
        this.sphere_transform = this.sphere_transform.times(
          Mat4.translation(-1 * this.delta_x, 0, 0)
        );
      } else {
        console.log("skip")
        this.left_pressed = false;
      }
    }

    if (this.right_pressed) {
      if (this.mili_t < this.mark_end) {
        this.sphere_transform = this.sphere_transform.times(
          Mat4.translation(this.delta_x, 0, 0)
        );
      } else {
        this.right_pressed = false;
      }
    }

    this.shapes.sphere.draw(
      context,
      program_state,
      this.sphere_transform,
      this.materials.plastic.override({ color: color(1, 1, 1, 1) })
    );
  }

  generateFaces(
    num_sides,
    panes_per_side,
    context,
    program_state,
    model_transform,
    ring_color,
    row
  ) {
    const blue = color(
      255 * Math.random(),
      255 * Math.random(),
      255 * Math.random(),
      1
    );
    let rotation_angle = 360 / num_sides;
    for (let i = 0; i < num_sides; i++) {
      for (let j = 0; j < panes_per_side; j++) {
        if (row[i * panes_per_side + j]) {
          // if (row[i * panes_per_side + j]) {
          this.shapes.pane.draw(
            context,
            program_state,
            model_transform.times(Mat4.scale(1, 10, 5)),
            this.materials.plastic.override({ color: ring_color })
          );
        }
        model_transform = model_transform.times(Mat4.translation(1, 0, 0));
      }
      model_transform = model_transform.times(
        Mat4.rotation((rotation_angle * Math.PI) / 180, 0, 0, 1)
      );
      model_transform = model_transform.times(Mat4.translation(1, 0, 0));
    }
  }

  display(context, program_state) {
    super.display(context, program_state);
    program_state.set_camera(this.camera_location);
    this.mili_t = program_state.animation_time
    let t = program_state.animation_time / 1000;
    let model_transform = this.manager.get_initial_transform();
    if (model_transform == -1) {
      model_transform = Mat4.identity().times(Mat4.translation(0, 0, t * 12));
    } else {
      model_transform = model_transform.times(
        Mat4.translation(0, 0, (t - this.prev_t) * 12)
      );
    }
    // model_transform = model_transform.times(this.sphere_transform)
    const rows = this.manager.get_rows_in_view();
    // console.log(rows);

    let rows_behind_camera = 0;
    let new_initial_transform = model_transform;
    let next_model_transform = -1;
    // console.log(model_transform);

    for (let row of rows) {
      this.generateFaces(
        6,
        2,
        context,
        program_state,
        model_transform,
        color(0.5, 0.95, 0.5, 1),
        row
      );
      next_model_transform = model_transform.times(Mat4.translation(0, 0, -10));
      if (model_transform[2][3] >= 10) {
        // console.log(rows_behind_camera)
        rows_behind_camera++;
        new_initial_transform = next_model_transform;
      }
      model_transform = next_model_transform;
    }
    for (let i = 0; i < rows_behind_camera; i++) {
      this.manager.update_row_window(new_initial_transform);
    }
    if (rows_behind_camera == 0)
      this.manager.update_initial_tranform(new_initial_transform);
    this.prev_t = t;
    this.draw_ball(context, program_state);
  }
}
