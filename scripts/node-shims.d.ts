// Just enough Node and React DOM typing for the developer scripts in this folder (they run in Node, not the app).
declare module 'fs' {
  export function writeFileSync(path: string, data: string): void;
}
declare module 'react-dom/server' {
  import type { ReactElement } from 'react';
  export function renderToStaticMarkup(element: ReactElement): string;
}
