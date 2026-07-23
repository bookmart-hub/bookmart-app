import { Dimensions, PixelRatio, Platform } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Get the smaller dimension to handle orientation changes (e.g., landscape vs portrait)
const minDimension = Math.min(SCREEN_WIDTH, SCREEN_HEIGHT);

// Base width is based on standard iPhone X/11 (375 points)
const guidelineBaseWidth = 375;

// Scale calculation
const scale = minDimension / guidelineBaseWidth;

/**
 * Responsive Typography Scaling
 * Scales the font size based on the screen width.
 * Uses a moderating factor to ensure fonts don't get too large on tablets 
 * or too small on very small devices.
 * 
 * @param size The base font size to scale
 * @param factor The moderating factor (default: 0.5 for balanced scaling)
 * @returns The dynamically scaled font size rounded to the nearest pixel
 */
export const rf = (size: number, factor: number = 0.5): number => {
  const scaledSize = size + (size * scale - size) * factor;
  return Math.round(PixelRatio.roundToNearestPixel(scaledSize));
};

/**
 * Alternative to CSS rem in web.
 * 1 rem typically equals 16px.
 * This function scales 16px * value dynamically using our responsive font scaling (rf).
 * 
 * @param value The rem value (e.g. 1, 1.5, 0.875)
 * @returns The scaled pixel value
 */
export const rem = (value: number, factor?: number): number => {
  return rf(value * 16, factor);
};

export default rf;
