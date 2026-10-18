// Stands in for react-native when the gallery imports scene code in Node (only the SVG content is rendered).
module.exports = { StyleSheet: { create: (s) => s, absoluteFill: {} }, View: () => null };
