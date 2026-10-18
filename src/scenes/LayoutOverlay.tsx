import { G, Line, Rect, Text } from 'react-native-svg';

import { BOTTOM_CLEAR, EDGE, GAP, columnBounds, rectOf, rowsOf } from './layout';
import { getRecipe } from './recipes';
import { SCENE_WIDTH, ratioOf, type SceneSpec } from './types';
import type { SceneIssue } from './validateScene';

interface LayoutOverlayProps {
  spec: SceneSpec;
  issues: SceneIssue[];
  pointsPerUnit: number;
}

/**
 * Dev-only drawing over a scene for checking layouts by eye:
 * - grey: edge margins and the clear strip at the bottom
 * - blue dashed: band edges; thin blue: the slot grid (3 columns × rows per band)
 * - magenta: the lines between the top, middle and bottom thirds
 * - green boxes (red if a rule fails), with the 4% clearance dashed around them
 * - a banner with the validation result.
 */
export function LayoutOverlay({ spec, issues, pointsPerUnit }: LayoutOverlayProps) {
  const recipe = getRecipe(spec.recipeId);
  const ratio = ratioOf(spec.size);
  const H = SCENE_WIDTH * ratio;
  const u = (v: number) => v * SCENE_WIDTH;
  // Lines and text a fixed size on screen.
  const px = (points: number) => points / pointsPerUnit;
  const bad = new Set(issues.flatMap((i) => i.kinds));

  return (
    <G>
      <G fill="#000000" fillOpacity={0.25}>
        <Rect x={0} y={0} width={u(EDGE)} height={H} />
        <Rect x={u(1 - EDGE)} y={0} width={u(EDGE)} height={H} />
        <Rect x={0} y={H * (1 - BOTTOM_CLEAR)} width={SCENE_WIDTH} height={H * BOTTOM_CLEAR} />
      </G>

      {recipe.zones.map((zone) => (
        <G key={zone.id}>
          <Line x1={0} y1={zone.top * H} x2={SCENE_WIDTH} y2={zone.top * H} stroke="#1c7ed6" strokeWidth={px(1.5)} strokeDasharray={`${px(6)} ${px(4)}`} />
          <Text x={px(4)} y={zone.top * H + px(11)} fontSize={px(10)} fill="#1c7ed6" fontWeight="bold">
            {zone.id}
          </Text>
          {rowsOf(zone, ratio).map((row, r) =>
            [0, 1, 2].map((col) => {
              const b = columnBounds(zone, col);
              return (
                <Rect
                  key={`${r}-${col}`}
                  x={u(b.x0)}
                  y={u(row.top)}
                  width={u(b.x1 - b.x0)}
                  height={u(row.bottom - row.top)}
                  fill="none"
                  stroke="#1c7ed6"
                  strokeOpacity={0.6}
                  strokeWidth={px(0.75)}
                />
              );
            }),
          )}
        </G>
      ))}

      {[1, 2].map((t) => (
        <Line key={t} x1={0} y1={(H * t) / 3} x2={SCENE_WIDTH} y2={(H * t) / 3} stroke="#e64980" strokeWidth={px(1.5)} />
      ))}

      {spec.groups.map((group) => {
        const item = recipe.items.find((i) => i.kind === group.kind)!;
        const colour = bad.has(group.kind) ? '#fa5252' : '#40c057';
        return group.boxes.map((box, i) => {
          const r = rectOf(item, box, ratio);
          const pad = GAP / 2;
          return (
            <G key={`${group.kind}-${i}`}>
              <Rect x={u(r.x0 - pad)} y={u(r.y0 - pad)} width={u(r.x1 - r.x0 + 2 * pad)} height={u(r.y1 - r.y0 + 2 * pad)} fill="none" stroke={colour} strokeOpacity={0.6} strokeWidth={px(0.75)} strokeDasharray={`${px(3)} ${px(3)}`} />
              <Rect x={u(r.x0)} y={u(r.y0)} width={u(r.x1 - r.x0)} height={u(r.y1 - r.y0)} fill={colour} fillOpacity={0.12} stroke={colour} strokeWidth={px(1.5)} />
              {i === 0 && (
                <Text x={u(r.x0) + px(2)} y={u(r.y0) - px(3)} fontSize={px(9)} fill={colour} fontWeight="bold" stroke="#000000" strokeWidth={px(0.3)}>
                  {`${group.kind}×${group.count} ${group.region[0].toUpperCase()}`}
                </Text>
              )}
            </G>
          );
        });
      })}

      <Rect x={u(EDGE)} y={px(4)} width={u(1 - 2 * EDGE)} height={px(18)} rx={px(4)} fill={issues.length ? '#c92a2a' : '#2b8a3e'} fillOpacity={0.9} />
      <Text x={SCENE_WIDTH / 2} y={px(17)} fontSize={px(11)} fill="#ffffff" fontWeight="bold" textAnchor="middle">
        {issues.length ? `✗ ${issues.length}: ${issues[0].message}` : `✓ layout OK · ${Math.round(spec.size.width)}×${Math.round(spec.size.height)} pt`}
      </Text>
    </G>
  );
}
