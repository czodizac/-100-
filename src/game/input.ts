import Phaser from "phaser";

export interface ActionState {
  x: number;
  y: number;
  burst: boolean;
  pointerActive: boolean;
  pointerX: number;
  pointerY: number;
}

export class InputMapper {
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  private keys: Record<string, Phaser.Input.Keyboard.Key>;
  private pointerWasDown = false;

  constructor(private scene: Phaser.Scene) {
    const keyboard = scene.input.keyboard;
    if (!keyboard) {
      throw new Error("Keyboard input is unavailable.");
    }

    this.cursors = keyboard.createCursorKeys();
    this.keys = keyboard.addKeys("W,A,S,D,SPACE") as Record<string, Phaser.Input.Keyboard.Key>;
  }

  read(): ActionState {
    const pointer = this.scene.input.activePointer;
    const left = this.cursors.left.isDown || this.keys.A.isDown;
    const right = this.cursors.right.isDown || this.keys.D.isDown;
    const up = this.cursors.up.isDown || this.keys.W.isDown;
    const down = this.cursors.down.isDown || this.keys.S.isDown;
    const burst = Phaser.Input.Keyboard.JustDown(this.keys.SPACE);

    this.pointerWasDown = pointer.isDown || (this.pointerWasDown && pointer.isDown);

    return {
      x: Number(right) - Number(left),
      y: Number(down) - Number(up),
      burst,
      pointerActive: pointer.isDown,
      pointerX: pointer.worldX,
      pointerY: pointer.worldY
    };
  }
}
