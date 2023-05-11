/* @flow */
import React, { Component, useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
} from 'react-native';

import { Gyroscope } from 'expo-sensors';

import { Input, Button } from '@rneui/base';
import AsyncStorage from '@react-native-async-storage/async-storage';
import init from 'react_native_mqtt';

init({
    size: 10000,
    storageBackend: AsyncStorage,
    defaultExpires: 1000 * 3600 * 24,
    enableCache: true,
    sync: {}
});
const options = {
    host: 'broker.emqx.io',
    port: 8083,
    path: '/testTopic',
    id: 'id_' + parseInt(Math.random() * 100000)
};
// 客户端
client = new Paho.MQTT.Client(options.host, options.port, options.path);

const App = () => {
    const [topic, settopic] = useState('testTopic');
    const [subscribetopic, setSubscriptopic] = useState('');
    const [message, setMessage] = useState('');
    const [status, setStatus] = useState('');
    // const [{ x, y, z }, setData] = useState({
    //     x: 0,
    //     y: 0,
    //     z: 0,
    // });
    // const [subscription, setSubscription] = useState(null);

    // 成功
    const onConnect = () => {
        console.log('onConnect');
        setStatus('connected');
        //非同步更新console.log(status);  
    }
    // 失败
    const onFailure = (err) => {
        console.log('Connect failed!');
        console.log(err);
        setStatus('failed');
    }
    // 連接 MQTT 
    const connect = () => {
        setStatus('Fetching....');
        if (!client.isConnected()) {
            console.log('didnt connected');
            client.connect({
                onSuccess: onConnect,
                useSSL: false,
                timeout: 3,
                onFailure: onFailure
            });
        }
    }
    const disconnect = () => {
        setStatus('unconnected');
        if (client.isConnected()) {
            console.log("connected!");
            client.disconnect();
        }
    }
    const onChangeTopic = (text) => {
        settopic(text);
    }
    //訂閱部分
    const subscribeTopic = () => {
        setSubscriptopic(topic);
        client.subscribe(subscribetopic, { qos: 0 });
    }

    const unSubscribeTopic = () => {
        client.unsubscribe(subscribetopic);
        setSubscriptopic('');
    }
    const onChangeMessage = (text) => {
        setMessage(text);
    }
    // 發送訊息
    const sendMessage = () => {
        if (client.isConnected()) {
            var message = new Paho.MQTT.Message(options.id + ':' + message);
            message.destinationName = subscribetopic;
            client.send(message);
        }
        else{
            client.connect(subscribetopic);
        }
    }

    return (
        <View style={styles.container}>
            <Text
                style={{
                    marginBottom: 50,
                    textAlign: 'center',
                    color: status === 'connected' ? 'green' : 'black'
                }}
            >
                ClientID: {options.id}{'\n'}
                Message : {message}{'\n'}
                Topic :{topic}{'\n'}
                subscribedTopic : {subscribetopic}
            </Text>
            {
                status === 'connected' ?
                    <View>
                        <Button
                            type='solid'
                            title='DISCONNECT'
                            onPress={disconnect}
                            buttonStyle={{ marginBottom: 50, backgroundColor: '#397af8' }}

                        />
                        <View style={{ marginBottom: 30, alignItems: 'center' }}>
                            <Input
                                label='TOPIC'
                                placeholder=''
                                value={topic}
                                onChangeText={onChangeTopic}
                                disabled={subscribetopic}
                            />
                            {
                                subscribetopic ?
                                    <Button
                                        type='solid'
                                        title='UNSUBSCRIBE'
                                        onPress={unSubscribeTopic}
                                        buttonStyle={{ backgroundColor: '#397af8' }}

                                    />
                                    :
                                    <Button
                                        type='solid'
                                        title='SUBSCRIBE'
                                        onPress={subscribeTopic}
                                        buttonStyle={{ backgroundColor: '#397af8' }}

                                        disabled={!topic || topic.match(/ /) ? true : false}
                                    />
                            }
                        </View>
                        {
                            subscribetopic ?
                                <View style={{ marginBottom: 30, alignItems: 'center' }}>
                                    <Input
                                        label='MESSAGE'
                                        placeholder=''
                                        value={message}
                                        onChangeText={onChangeMessage}
                                    />
                                    <Button
                                        type='solid'
                                        title='PUBLISH'
                                        onPress={sendMessage}
                                        buttonStyle={{ backgroundColor: status === 'failed' ? 'red' : '#397af8' }}

                                        disabled={!message || message.match(/^[ ]*$/) ? true : false}
                                    />
                                </View>
                                :
                                null
                        }
                    </View>
                    :
                    <Button
                        type='solid'
                        title='CONNECT'

                        onPress={connect}
                        buttonStyle={{
                            marginBottom: 50,
                            backgroundColor: status === 'failed' ? 'red' : '#397af8'
                        }}

                        loading={status === 'isFetching' ? true : false}
                        disabled={status === 'isFetching' ? true : false}
                    />
            }

        </View>
    );
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 70,
        backgroundColor: '#ffffff'
    },
    messageBox: {
        margin: 16,
        flex: 1,
    },
    myMessageComponent: {
        backgroundColor: '#000000',
        borderRadius: 3,
        padding: 5,
        marginBottom: 5,
    },
    messageComponent: {
        marginBottom: 5,
        backgroundColor: '#0075e2',
        padding: 5,
        borderRadius: 3,
    },
    introMessage: {
    },
    textInput: {
        height: 40,
        margin: 5,
        borderWidth: 1,
        padding: 5,
    },
    textIntro: {
        color: 'black',
        fontSize: 12,
    },
    textMessage: {
        color: 'white',
        fontSize: 16,
    },
});

export default App;