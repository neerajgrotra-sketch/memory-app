// Stands in for react-native-reanimated when scripts import scene code in Node: the gallery and
// screenshot tools draw still pictures, so animation is never needed.
const noop = () => {};
module.exports = {
  __esModule: true,
  default: { View: () => null },
  Easing: { inOut: () => noop, sin: noop },
  useAnimatedStyle: () => ({}),
  useReducedMotion: () => true,
  useSharedValue: (v) => ({ value: v }),
  withDelay: (_d, v) => v,
  withRepeat: (v) => v,
  withTiming: (v) => v,
};
