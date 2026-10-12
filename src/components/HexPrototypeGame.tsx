import { useEffect, useRef } from 'react';
import Phaser from 'phaser';

type HexCoord = {
  q: number;
  r: number;
};

type Unit = HexCoord & {
  id: number;
  name: string;
  color: number;
  moveRange: number;
};

const BOARD_RADIUS = 4;
const HEX_RADIUS = 28;
const BOARD_ORIGIN_X = 430;
const BOARD_ORIGIN_Y = 250;

const axialDistance = (a: HexCoord, b: HexCoord) => {
  const dq = a.q - b.q;
  const dr = a.r - b.r;
  const ds = -dq - dr;

  return Math.max(Math.abs(dq), Math.abs(dr), Math.abs(ds));
};

const axialToPixel = (q: number, r: number) => ({
  x: HEX_RADIUS * Math.sqrt(3) * (q + r / 2),
  y: HEX_RADIUS * 1.5 * r,
});

const getHexVertices = (centerX: number, centerY: number) => {
  const points: Phaser.Math.Vector2[] = [];

  for (let index = 0; index < 6; index += 1) {
    const angle = ((Math.PI / 180) * (60 * index + 30));
    points.push(new Phaser.Math.Vector2(
      centerX + HEX_RADIUS * Math.cos(angle),
      centerY + HEX_RADIUS * Math.sin(angle),
    ));
  }

  return points;
};

const HexPrototypeGame = () => {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!mountRef.current) {
      return undefined;
    }

    const units: Unit[] = [
      { id: 1, name: 'Frontline', q: -1, r: 0, color: 0xff8252, moveRange: 3 },
      { id: 2, name: 'Archer', q: 1, r: 2, color: 0x7bc8ff, moveRange: 2 },
      { id: 3, name: 'Guardian', q: 2, r: -1, color: 0x9ef0ab, moveRange: 2 },
    ];

    let selectedUnitId: number | null = units[0].id;
    let sceneRef: Phaser.Scene | null = null;
    let boardGraphics: Phaser.GameObjects.Graphics | null = null;
    let selectionGraphics: Phaser.GameObjects.Graphics | null = null;
    let unitContainer: Phaser.GameObjects.Container | null = null;
    let instructionsText: Phaser.GameObjects.Text | null = null;

    const getSelectedUnit = () => units.find((unit) => unit.id === selectedUnitId) ?? null;

    const drawHex = (
      graphics: Phaser.GameObjects.Graphics,
      centerX: number,
      centerY: number,
      fillColor: number,
      strokeColor: number,
    ) => {
      const vertices = getHexVertices(centerX, centerY);
      graphics.fillStyle(fillColor, 1);
      graphics.lineStyle(2, strokeColor, 1);

      graphics.beginPath();
      vertices.forEach((point, index) => {
        if (index === 0) {
          graphics.moveTo(point.x, point.y);
          return;
        }
        graphics.lineTo(point.x, point.y);
      });
      graphics.closePath();
      graphics.fillPath();
      graphics.strokePath();
    };

    const refreshBoard = () => {
      if (!sceneRef) {
        return;
      }

      if (boardGraphics) {
        boardGraphics.destroy();
      }
      boardGraphics = sceneRef.add.graphics();

      const selectedUnit = getSelectedUnit();

      for (let q = -BOARD_RADIUS; q <= BOARD_RADIUS; q += 1) {
        for (let r = -BOARD_RADIUS; r <= BOARD_RADIUS; r += 1) {
          const dist = Math.max(Math.abs(q), Math.abs(r), Math.abs(-q - r));
          if (dist > BOARD_RADIUS) {
            continue;
          }

          const offset = axialToPixel(q, r);
          const centerX = BOARD_ORIGIN_X + offset.x;
          const centerY = BOARD_ORIGIN_Y + offset.y;

          const tileOccupied = units.some((unit) => unit.q === q && unit.r === r);
          const tileReachable = Boolean(
            selectedUnit
            && !tileOccupied
            && axialDistance({ q, r }, selectedUnit) <= selectedUnit.moveRange,
          );

          const fillColor = tileOccupied ? 0xdfead7 : tileReachable ? 0xcfe5cf : 0xe5dfd0;
          const strokeColor = tileReachable ? 0x6f8e75 : 0x8a9283;
          drawHex(boardGraphics, centerX, centerY, fillColor, strokeColor);
        }
      }

      if (unitContainer) {
        unitContainer.destroy();
      }
      unitContainer = sceneRef.add.container();

      units.forEach((unit) => {
        const offset = axialToPixel(unit.q, unit.r);
        const centerX = BOARD_ORIGIN_X + offset.x;
        const centerY = BOARD_ORIGIN_Y + offset.y;

        const token = sceneRef.add.circle(centerX, centerY, 17, unit.color);
        const outline = sceneRef.add.circle(centerX, centerY, 22, 0x000000, 0);
        outline.setStrokeStyle(2, 0xf5efe8, 0.9);

        const label = sceneRef.add.text(centerX, centerY + 26, unit.name, {
          fontSize: '12px',
          color: '#2b2d30',
          backgroundColor: '#f6f3ee',
          padding: { x: 4, y: 2 },
        }).setOrigin(0.5);

        unitContainer.add([token, outline, label]);
      });

      if (selectionGraphics) {
        selectionGraphics.destroy();
      }
      selectionGraphics = sceneRef.add.graphics();

      if (selectedUnit) {
        const offset = axialToPixel(selectedUnit.q, selectedUnit.r);
        const centerX = BOARD_ORIGIN_X + offset.x;
        const centerY = BOARD_ORIGIN_Y + offset.y;
        selectionGraphics.lineStyle(3, 0xc7a67a, 1);
        selectionGraphics.strokeCircle(centerX, centerY, 28);
      }
    };

    const handleTileClick = (q: number, r: number) => {
      const selectedUnit = getSelectedUnit();
      const occupied = units.find((unit) => unit.q === q && unit.r === r);

      if (occupied) {
        selectedUnitId = occupied.id;
        if (instructionsText) {
          instructionsText.setText(`Selected ${occupied.name}. Pick a highlighted tile to move.`);
        }
        refreshBoard();
        return;
      }

      if (!selectedUnit) {
        return;
      }

      if (axialDistance({ q, r }, selectedUnit) <= selectedUnit.moveRange) {
        selectedUnit.q = q;
        selectedUnit.r = r;
        if (instructionsText) {
          instructionsText.setText(`Moved ${selectedUnit.name} to (${q}, ${r}).`);
        }
        refreshBoard();
      }
    };

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      parent: mountRef.current,
      width: 860,
      height: 560,
      backgroundColor: '#e9e1d6',
      scene: {
        create() {
          sceneRef = this;
          refreshBoard();

          instructionsText = this.add.text(20, 16, 'Select a unit and click a highlighted hex to move.', {
            fontSize: '18px',
            color: '#2b2d30',
            backgroundColor: '#f5efe8',
            padding: { x: 10, y: 6 },
          });

          this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            const worldX = pointer.x;
            const worldY = pointer.y;
            let clickedTile: HexCoord | null = null;

            for (let q = -BOARD_RADIUS; q <= BOARD_RADIUS; q += 1) {
              for (let r = -BOARD_RADIUS; r <= BOARD_RADIUS; r += 1) {
                const dist = Math.max(Math.abs(q), Math.abs(r), Math.abs(-q - r));
                if (dist > BOARD_RADIUS) {
                  continue;
                }

                const offset = axialToPixel(q, r);
                const centerX = BOARD_ORIGIN_X + offset.x;
                const centerY = BOARD_ORIGIN_Y + offset.y;
                const dx = worldX - centerX;
                const dy = worldY - centerY;

                if (Math.hypot(dx, dy) <= HEX_RADIUS + 4) {
                  clickedTile = { q, r };
                  break;
                }
              }
              if (clickedTile) {
                break;
              }
            }

            if (clickedTile) {
              handleTileClick(clickedTile.q, clickedTile.r);
            }
          });
        },
      },
    };

    const game = new Phaser.Game(config);

    return () => {
      game.destroy(true, false);
    };
  }, []);

  return <div ref={mountRef} />;
};

export default HexPrototypeGame;
