// Stands in for react-native-svg when the gallery renders scenes to plain SVG in Node.
const React = require('react');
const el = (tag) => (props) => React.createElement(tag, props);
module.exports = { __esModule: true, default: el('svg'), G: el('g'), Rect: el('rect'), Circle: el('circle'), Ellipse: el('ellipse'), Path: el('path'), Polygon: el('polygon'), Line: el('line'), Text: el('text') };
