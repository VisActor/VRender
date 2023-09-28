import type { CommandType, IPath2D } from '../interface';

const commandFuncs: Array<
  (command: CommandType, context: IPath2D, x: number, y: number, sx: number, sy: number, z?: number) => void
> = [
  (command: CommandType, context: IPath2D, x: number, y: number, sx: number, sy: number, z?: number) =>
    context.arc(
      (command[1] as number) * sx + x,
      (command[2] as number) * sy + y,
      ((command[3] as number) * (sx + sy)) / 2,
      command[4] as number,
      command[5] as number,
      command[6] as boolean,
      z
    ),
  (command: CommandType, context: IPath2D, x: number, y: number, sx: number, sy: number, z?: number) =>
    context.arcTo(
      (command[1] as number) * sx + x,
      (command[2] as number) * sy + y,
      (command[3] as number) * sx + x,
      (command[4] as number) * sy + y,
      ((command[5] as number) * (sx + sy)) / 2,
      z
    ),
  (command: CommandType, context: IPath2D, x: number, y: number, sx: number, sy: number, z?: number) =>
    context.bezierCurveTo(
      (command[1] as number) * sx + x,
      (command[2] as number) * sy + y,
      (command[3] as number) * sx + x,
      (command[4] as number) * sy + y,
      (command[5] as number) * sx + x,
      (command[6] as number) * sy + y,
      z
    ),
  (command: CommandType, context: IPath2D, x: number, y: number) => context.closePath(),
  (command: CommandType, context: IPath2D, x: number, y: number, sx: number, sy: number) =>
    context.ellipse(
      (command[1] as number) * sx + x,
      (command[2] as number) * sy + y,
      (command[3] as number) * sx,
      (command[4] as number) * sy,
      command[5] as number,
      command[6] as number,
      command[7] as number,
      command[8] as boolean
    ),
  (command: CommandType, context: IPath2D, x: number, y: number, sx: number, sy: number, z?: number) =>
    context.lineTo((command[1] as number) * sx + x, (command[2] as number) * sy + y, z),
  (command: CommandType, context: IPath2D, x: number, y: number, sx: number, sy: number, z?: number) =>
    context.moveTo((command[1] as number) * sx + x, (command[2] as number) * sy + y, z),
  (command: CommandType, context: IPath2D, x: number, y: number, sx: number, sy: number, z?: number) =>
    context.quadraticCurveTo(
      (command[1] as number) * sx + x,
      (command[2] as number) * sy + y,
      (command[3] as number) * sx + x,
      (command[4] as number) * sy + y,
      z
    ),
  (command: CommandType, context: IPath2D, x: number, y: number, sx: number, sy: number, z?: number) =>
    context.rect(
      (command[1] as number) * sx + x,
      (command[2] as number) * sy + y,
      (command[3] as number) * sx,
      (command[4] as number) * sy,
      z
    )
];

export function renderCommandList(
  commandList: CommandType[],
  context: IPath2D,
  x: number = 0,
  y: number = 0,
  sx: number = 1,
  sy: number = 1,
  z?: number
) {
  for (let i = 0; i < commandList.length; i++) {
    const command = commandList[i];
    commandFuncs[command[0]](command, context, x, y, sx, sy, z);
  }
}
