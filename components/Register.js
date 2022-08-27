import { StatusBar } from 'expo-status-bar';
import {
  StyleSheet, Text, View, Image, ImageBackground, TextInput, TouchableOpacity,
  KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard
} from 'react-native';

export default function Register() {
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}
      accessible={false}>
      <ImageBackground source={require('../assets/background.jpg')} resizeMode="cover" style={styles.container}>

        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}
            accessible={false}>
            <View style={styles.box}>

              <View style={styles.header}>
                <Image style={styles.tinyLogo} source={require('../assets/code.png')} />
                <Text style={styles.title}>Codap</Text>
                <StatusBar style="auto" />
              </View>
              <View style={styles.inputs}>
                <TextInput style={styles.input} placeholder="Nome" />
                <TextInput style={styles.input} placeholder="Usuario" />
                <TextInput style={styles.input} placeholder="E-mail" />
                <TextInput style={styles.input} placeholder="Senha" />
                <TouchableOpacity onPress={() => alert('Hello, world!')} style={styles.button}>
                  <Text style={styles.buttonText}>Registrar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </ImageBackground>
    </TouchableWithoutFeedback>

  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    marginLeft: 50,
    alignItems: 'center',
    marginTop: 30,
    width: 170,
    backgroundColor: "#7977FD",
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    fontSize: 15,
    color: '#fff',
  },
  input: {
    backgroundColor: "#7977FD",
    borderRadius: 10,
    height: 40,
    color: '#fff',
    width: 250,
    margin: 12,
    borderWidth: 1,
    padding: 10,
  },
  header: {
    marginTop: 20,
    marginBottom: 30,
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    flexDirection: 'row',
  },
  tinyLogo: {
    width: 50,
    height: 50,
  },
  title: {
    marginLeft: 10,
    marginTop: 3,
    fontSize: 30,
    fontWeight: 'bold',
    color: "#7977FD"
  },
  box: {
    backgroundColor: "rgba(10, 10, 10, 0.7)",
    borderRadius: 20,
    height: 450,
    width: 330,
    alignItems: 'center'
  }
});
