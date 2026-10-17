// Stands in for react-native-svg when the gallery renders scenes to plain SVG in Node.
const React = require('react');
const el = (tag) => (props) => React.createElement(tag, props);
// Masks use the alpha channel (a thing's silhouette), as react-native-svg's maskType="alpha" does.
const Mask = ({ maskType, ...props }) => React.createElement('mask', { ...props, style: { maskType } });
module.exports = { __esModule: true, default: el('svg'), Defs: el('defs'), LinearGradient: el('linearGradient'), Stop: el('stop'), Mask, ClipPath: el('clipPath'), G: el('g'), Rect: el('rect'), Circle: el('circle'), Ellipse: el('ellipse'), Path: el('path'), Polygon: el('polygon'), Line: el('line'), Text: el('text') };
