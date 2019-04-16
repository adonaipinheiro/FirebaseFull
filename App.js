import React, { Component } from 'react';
import { View, Text, StyleSheet, Button, Image, TextInput, FlatList, TouchableHighlight } from 'react-native';
import firebase from './src/FirebaseConnection';
import ImagePicker from 'react-native-image-picker';
import RNFetchBlob from 'react-native-fetch-blob';

import Usuario from './src/Usuario';


window.XMLHttpRequest = RNFetchBlob.polyfill.XMLHttpRequest;
window.Blob = RNFetchBlob.polyfill.Blob;

export default class FirebaseFull extends Component {
  constructor(props) {
    super(props);
    this.state = {
      formAvatar:null,
      formNome:'',
      formEmail:'',
      formSenha:'',
      formPct:'',
      userUid:0,
      lista:[]
    };

    this.cadastrar = this.cadastrar.bind(this);
    this.carregarFoto = this.carregarFoto.bind(this);
    this.saveAvatar = this.saveAvatar.bind(this);
    this.saveUser = this.saveUser.bind(this);

    firebase.auth().signOut();

    firebase.database().ref('users').on('value', (snapshot)=>{

      let state = this.state;
      state.lista = [];
      snapshot.forEach((child)=>{
        state.lista.push({
          key:child.key,
          name:child.val().name,
          email:child.val().email
        });
      });

      this.setState(state);

    });

  }

  saveAvatar() {

    let uri = this.state.formAvatar.uri.replace('file://', '');
    let avatar = firebase.storage().ref().child('users').child(this.state.userUid+'.jpg');
    let mime = 'image/jpg';

    RNFetchBlob.fs.readFile(uri, 'base64')
    .then((data)=>{
      return RNFetchBlob.polyfill.Blob.build(data, {type:mime+';BASE64'})
    })
    .then((blob)=>{

      avatar.put(blob, { contentType:mime })
      .on('state_changed', (snapshot)=>{
        let pct = Math.floor((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
        let state = this.state;
        state.formPct = pct+'%';
        this.setState(state);
      }, (error)=>{
        alert(error.code)
      }, ()=>{
        this.saveUser();
      })

    });

  }

  saveUser() {

    if (this.state.userUid != 0) {
      firebase.database().ref('users').child(this.state.userUid).set({
        name:this.state.formNome,
        email:this.state.formEmail
      });

      let state = this.state;
        state.formNome = '';
        state.formPct = '';
        state.formSenha = '';
        state.formAvatar = null;
        state.formEmail = '';
        state.userUid = 0;
        this.setState(this);

        firebase.auth().signOut();

        alert('usuário inserido com sucesso');
    }

  }

  carregarFoto() {

    ImagePicker.launchImageLibrary({}, (r)=>{
      if (r.uri) {
        let state = this.state;
        state.formAvatar = {uri:r.uri};
        this.setState(state);
      }
    });

  }

  cadastrar() {

    if(this.state.formAvatar != null && 
      this.state.formEmail != '' && 
      this.state.formNome != '' && 
      this.state.formSenha != '') {

        firebase.auth().onAuthStateChanged((user)=>{
          if (user) {
            let state = this.state;
            state.userUid = user.uid;
            this.setState(state);

            this.saveAvatar();
          }
        });

        firebase.auth().createUserWithEmailAndPassword(
          this.state.formEmail, 
          this.state.formSenha
        ).catch((error)=>{
          alert(error.code);
        });

    }
  }

  render() {
    return(

      <View style={StyleSheet.container}>

        <View style={styles.cadastroArea}>
          <Text style={styles.textArea}>Cadastre um novo usuário</Text>

          <View style={styles.form}>
            <View style={styles.formInfo}>
              <Image source={this.state.formAvatar} style={styles.formAvatar} />
              <TouchableHighlight underlayColor="#CCC" style={{ justifyContent:'center', alignItems:'center' }} onPress={this.carregarFoto}>
                <View>
                  <Text>Carregar</Text>
                  <Text>{this.state.formPct}</Text>
                </View>
              </TouchableHighlight>
              
            </View>
            <View style={styles.formInfo}>
              <TextInput style={styles.input} placeholder="Digite o nome" value={this.state.formNome} onChangeText={(formNome)=>this.setState({formNome})} />
              <TextInput style={styles.input} placeholder="Digite o e-mail" value={this.state.formEmail} onChangeText={(formEmail)=>this.setState({formEmail})} />
              <TextInput style={styles.input} placeholder="Digite a senha" value={this.state.formSenha} onChangeText={(formSenha)=>this.setState({formSenha})} secureTextEntry={true} />
            </View>
          </View>

        <Button title="Cadastrar" onPress={this.cadastrar} />

        </View>

        <View style={styles.listaArea}>
          <FlatList
            data={this.state.lista}
            renderItem={({item})=><Usuario data={item} />}
          />
        </View>

      </View>

    );
  }
}

const styles = StyleSheet.create({
  container:{
    flex:1
  },
  cadastroArea:{
    backgroundColor:'#EEE',
    margin:10,
    padding:10,
    height:240
  },
  textArea:{
    fontSize:18,
    marginBottom:5,
  },
  form:{
    flex:1,
    flexDirection:'row'
  },
  formAvatar:{
    width:100,
    height:100,
    backgroundColor:'#CCC',
    borderRadius:50
  },
  formInfo:{
    flexDirection:'column'
  },
  input:{
    width:260,
    height:40,
    borderWidth:0.3,
    borderColor:'#000',
    borderRadius:5,
    margin:5,
    backgroundColor:'#FFF'
  },
  listaArea:{
    backgroundColor:"#EEE",
    margin:10,
    padding:10,
    height:350
  }
});