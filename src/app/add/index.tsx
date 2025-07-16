import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { router, Router } from 'expo-router';

import { styles } from './styles';
import { colors } from '@/styles/colors';
import { Input } from '@/components/input';
import { Button } from '@/components/button';

import { Categories } from '@/components/categories';

export default function Add() {
  const [category, setCategory] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [url, setUrl] = useState<string>('');

  function handleAdd(){
    if(!category){
      return Alert.alert("Categoria não informada", "Selecione a categoria!");
    } else if(!name.trim() || name.length < 5){
      return Alert.alert("Nome não informado", "Informe um nome!");
    } else if(!url.trim() || url.length < 6){
      return Alert.alert("URL não informada", "Informe o site!");
    }

     
    console.log("categoria: ", category," | nome: ",name," | URL: ", url);
  }

    return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
            <MaterialIcons name="arrow-back" size={32} color={colors.gray[200]} />
        </TouchableOpacity>

        <Text style={styles.title}>Novo</Text>
        <MaterialIcons name="add" size={24} color={colors.gray[200]} />
      </View>

      <Text style={styles.label}>Selecione uma categoria</Text>
      <Categories onChange={setCategory} selected={category} />

        <View style={styles.form}>
            <Input placeholder="Nome" onChangeText={setName} autocorrect={false}/>
            <Input placeholder="URL" onChangeText={setUrl} autocorrect={false}/>
            <Button title="Adicionar" onPress={handleAdd}></Button>
        </View>
        <Text style={styles.title}>{name}</Text>
        <Text style={styles.title}>{url}</Text>
    </View>
  );
}
