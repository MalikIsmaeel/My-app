import { View, Text, StyleSheet } from "react-native";

export default function TestBox() {
  return (
    <View style={styles.box}>
      <Text style={{ color: "white" }}>This is a test box</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    width: 200,
    height: 100,
    backgroundColor: "#0da6f2",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
  },
});
