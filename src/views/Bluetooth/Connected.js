/* eslint-disable react/self-closing-comp */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable prettier/prettier */
/* eslint-disable comma-dangle */
/* eslint-disable quotes */
import React  from "react";
import { ImageBackground, StyleSheet, Text, View, TouchableHighlight, Image } from "react-native"
import { Layout } from '@ui-kitten/components';

const Connected = ({ navigation, route }) => {
    const {device} = route.params; 
    return (
        <Layout style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ImageBackground source={require('../../assets/background/background.png')} resizeMode="cover" style={styles.image}>
                <View style={{
                    width: '100%',
                    height: '55%',
                    alignContent: 'center',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <View style={{
                        alignContent: 'center',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '80%',
                        height: '80%',
                    }}
                    >
                        <View style={styles.box} >
                            <View style={{
                                backgroundColor: '#51DCF9',
                                alignContent: 'center',
                                width: 225,
                                height: 225,
                                borderRadius: 225,
                                borderWidth: 4,
                                borderColor: 'transparent',
                                opacity: 0.2,
                            }}
                            >
                            </View>

                        </View>

                    </View>
                </View>
                <View style={{
                    width: '100%',
                    height: '22.5%',
                    justifyContent: 'flex-start'
                }}>
                    <View style={{
                        width: '90%',
                        alignSelf: 'center'
                    }}>
                        <Text style={{
                            fontFamily: 'Avenir Black',
                            fontSize: 34,
                            fontWeight: 'bold',
                            color: 'white',
                            marginBottom: 20
                        }}>Vinculación exitosa!!!</Text>
                        <Text style={{
                            fontFamily: 'Avenir Black',
                            fontSize: 16,
                            marginTop: 5,
                            color: 'white',
                            marginBottom: 20
                        }}>Dispositivo encontrado: {device} </Text>
                        <Text style={{
                            fontFamily: 'Avenir Black',
                            fontSize: 16,
                            marginTop: 5,
                            color: 'white'
                        }}>Ya estamos listos, empieza a navegar con SeaRebbel!</Text>
                    </View>


                </View>
                <View style={{

                    width: '100%',
                    height: '22.5%',
                    justifyContent: 'flex-end',
                    alignContent: 'center'
                }}>
                    <View style={{
                        width: '90%',
                        justifyContent: 'flex-end',
                        alignSelf: 'center',

                    }}>
                        <TouchableHighlight onPress={() => { navigation.navigate('Map') }} underlayColor="rgba(151,151,151,0.4)" style={{
                            width: 50,
                            height: 50,
                            backgroundColor: 'black',
                            alignSelf: 'flex-end',
                            alignContent: 'center',
                            justifyContent: 'center',
                            borderRadius: 25,
                            marginBottom: 40
                        }}>
                            <Image source={require('../../assets/icons/check.png')} style={styles.arrow} />
                        </TouchableHighlight>
                    </View>
                </View>
            </ImageBackground>
        </Layout>
    )
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    image: {
        flex: 1,
        height: '100%',
        width: '100%',
    },
    arrow: {
        width: 25,
        height: 20,
        alignSelf: 'center',
    },
    box: {
        width: 225,
        height: 225,
        borderRadius: 225,
        alignContent: 'center',
        justifyContent: 'center',
        alignItems: 'center',
        borderColor: 'white',

        borderWidth: 4,
    }
});

export default Connected;