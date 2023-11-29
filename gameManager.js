export class GameManager {
  constructor(levels) {
    // pane is square
    /*
        level: (example)
        101110
        111010
        010111
        111111
        */
    this.infinite = !levels; // procedurally generate or not
    this.levels = levels;
    this.num_levels = levels.length;
    this.level_size = levels.length;
    this.level_state = this.levels[0];
    // only for first level

    /* Constants */
    this.rows_to_render = 12;

    /* Update during game */
    this.rows_deque = [];
    this.starting_transform = -1;
    this.current_row = 0; // within the current level
    this.current_level = 0;

    /* Initialize structures */
    // Add spaces between levels
    this.levels[0].unshift(new Array(this.levels[0][0].length).fill(1));
    this.levels[0].unshift(new Array(this.levels[0][0].length).fill(1));
    for (let i = 0; i < this.num_levels; i++) {
      levels[i].push(new Array(this.levels[i][0].length).fill(1));
      levels[i].push(new Array(this.levels[i][0].length).fill(1));
      levels[i].push(new Array(this.levels[i][0].length).fill(1));
    }

    // initialize visible rows (assume there are always enough rows)
    let i = this.rows_to_render;
    for (let j = 0; j < this.num_levels; j++) {
      let take = Math.min(i, levels[j].length);
      i -= take;
      for (let k = 0; k < take; k++) {
        this.right_row = k;
        this.right_level = j;
        this.rows_deque.push(this.levels[j][k]);
      }
      if (i == 0) break;
    }
  }

  get_rows_in_view() {
    return this.rows_deque;
  }

  get_initial_transform() {
    return this.starting_transform;
  }

  update_initial_tranform(new_starting_transform) {
    this.starting_transform = new_starting_transform;
  }

  generate_new_row(size) {
    const seed = Math.floor(Math.random() * (1 << size));
    let row = new Array(size);
    for (let i = 0; i < size; i++) {
      row[i] = (seed >> i) & 1;
    }
    return row;
  }

  update_row_window(new_starting_transform) {
    this.starting_transform = new_starting_transform;
    // let at_end = false;
    // if (this.right_row < this.levels[this.right_level].length - 1) {
    //   this.right_row++;
    // } else if (this.right_level < this.levels.length - 1) {
    //   this.right_row = 0;
    //   this.right_level++;
    // } else {
    //   at_end = true;
    // }

    // if (!at_end) this.rows_deque.push(this.levels[this.right_level][this.right_row])
    this.rows_deque.push(this.generate_new_row(12));
    this.rows_deque.shift();
  }

  get_current_level() {
    return this.level_state[this.current_level];
  }

  game_is_done() {
    return this.rows_deque.length <= 2;
  }
}

export function stringToMatrix(s) {
  const res = s
    .trim()
    .split("\n")
    .map((r) =>
      r
        .trim()
        .split("")
        .map((c) => parseInt(c))
    )
    .reverse();

  return res;
}

function testGameManager() {
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
  //   console.log(game.levels);
  console.log(game.rows_deque);
  console.log();

  while (!game.game_is_done()) {
    game.update_row_window();

    console.log(game.rows_deque);
    console.log("-------------------------------");
  }
}

// testGameManager();
