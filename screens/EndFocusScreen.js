import React from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet, Dimensions } from "react-native";

const { width, height } = Dimensions.get('window'); // Get screen dimensions

const EndFocusScreen = ({ visible, onClose, onEndSession }) => {
  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <View style={styles.overlay}>
        <View style={styles.banner}>
          <Text style={styles.text}>Do you want to end the session?</Text>
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.endButton} onPress={onEndSession}>
              <Text style={styles.endButtonText}>End Session</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  banner: {
    width: width * 0.7,
    padding: 10,
    backgroundColor: "white",
    borderRadius: 20,
    alignItems: "center",
  },
  text: {
    fontSize: 20,
    marginBottom: 5,
    textAlign: 'center',
    paddingVertical: 10
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 10,
    borderTopWidth: 2,
    borderColor: '#e0e0e0',
    paddingTop: 5
  },
  cancelButton: {
    padding: 10,
    borderRadius: 5,
    minWidth: 100,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 14,
  },
  endButton: {
    padding: 10,
    borderRadius: 5,
    minWidth: 100,
    alignItems: 'center',
  },
  endButtonText: {
    color: 'red',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default EndFocusScreen;
