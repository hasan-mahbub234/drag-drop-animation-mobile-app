import React from "react";
import { StyleSheet, View, ImageBackground, Image, Text } from "react-native";
import {
  PanGestureHandler,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  useAnimatedGestureHandler,
} from "react-native-reanimated";

import BG from "./assest/bg-2.png";
import Cat from "./assest/cat.png";
import Dog from "./assest/dog.png";
import Tiger from "./assest/tiger.png";
import Elephant from "./assest/elephant.png";
import Panda from "./assest/panda.png";

const images = [Cat, Dog, Tiger, Elephant, Panda];
const containerWidth = 400;
const containerHeight = 800;
const boxSize = 150;

export default function App() {
  const translateX = images.map(() => useSharedValue(0));
  const translateY = images.map(() => useSharedValue(0));
  const velocityX = images.map(() => useSharedValue(0));
  const velocityY = images.map(() => useSharedValue(0));
  const zIndices = images.map(() => useSharedValue(0));

  const onGestureEvents = images.map((_, index) =>
    useAnimatedGestureHandler({
      onStart: (_, ctx) => {
        ctx.startX = translateX[index].value;
        ctx.startY = translateY[index].value;
        zIndices.forEach((zIndex, i) => {
          zIndex.value = i === index ? 1 : 0;
        });
      },
      onActive: (event, ctx) => {
        translateX[index].value = ctx.startX + event.translationX;
        translateY[index].value = ctx.startY + event.translationY;
        velocityX[index].value = event.velocityX;
        velocityY[index].value = event.velocityY;
      },
      onEnd: () => {
        translateX[index].value = withSpring(
          Math.min(
            Math.max(translateX[index].value + velocityX[index].value / 10, 0),
            containerWidth - boxSize
          ),
          { damping: 4, stiffness: 100, mass: 0.6 }
        );
        translateY[index].value = withSpring(
          Math.min(
            Math.max(translateY[index].value + velocityY[index].value / 10, 0),
            containerHeight - boxSize
          ),
          { damping: 4, stiffness: 100, mass: 0.6 }
        );
      },
    })
  );

  const animatedStyles = images.map((_, index) =>
    useAnimatedStyle(() => ({
      transform: [
        { translateX: translateX[index].value },
        { translateY: translateY[index].value },
      ],
      zIndex: zIndices[index].value,
    }))
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ImageBackground source={BG} style={styles.background}>
        <View style={styles.container}>
          <View
            style={[
              styles.boundary,
              { width: containerWidth, height: containerHeight },
            ]}
          >
            {images.map((image, index) => (
              <PanGestureHandler
                key={index}
                onGestureEvent={onGestureEvents[index]}
              ></PanGestureHandler>
            ))}
          </View>
        </View>
      </ImageBackground>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: "cover",
    justifyContent: "center",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  boundary: {
    position: "relative",
    overflow: "hidden",
  },
  box: {
    width: boxSize,
    height: boxSize,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: boxSize / 2,
    position: "absolute",
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    borderWidth: 0.1,
    borderColor: "#eee",
  },
  image: {
    width: boxSize - 35,
    height: boxSize - 15,
    borderRadius: (boxSize - 30) / 2,
  },
});
