import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { router, Router } from 'expo-router';

import { styles } from './styles';
import { colors } from '@/styles/colors';
import { Input } from '@/components/input';
import { Button } from '@/components/button';

import { Categories } from '@/components/categories';
import { linkStorage } from '@/storage/link-storage';

export default function Add() {
  const [category, setCategory] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [url, setUrl] = useState<string>('');

  async function handleAdd() {
    try {

      if (!category && !name.trim() && !url.trim()) {
        return Alert.alert("Campos não preenchidos", "Selecione uma categoria e preencha todos os campos!");
      } else if (!category) {
        return Alert.alert("Categoria não informada", "Selecione a categoria!");
      } else if (!name.trim() || name.length < 5) {
        return Alert.alert("Nome não informado", "Informe um nome!");
      } else if (!url.trim() || url.length < 6) {
        return Alert.alert("URL não informada", "Informe o site!");
      } else {
        // Validação de URL simples usando regex
        const urlPattern = /^(https?:\/\/)?([\w\-]+\.)+[\w\-]+(\/[\w\-._~:/?#[\]@!$&'()*+,;=]*)?$/i;
        if (!urlPattern.test(url.trim())) {
          return Alert.alert("URL inválida", "Informe uma URL válida!");
        }
      }

      await linkStorage.save({

        id: String(new Date().getTime()),
        category,
        name,
        url
      });

      const data = await linkStorage.get();

      if(data){
        Alert.alert("Sucesso", "Link adicionado com sucesso!");
        router.push("./");
        setCategory('');
        setName('');
        setUrl('');

        console.log("Links salvos:", data);
      }

    } catch (error) {
      Alert.alert("Erro", "Ocorreu um erro ao adicionar o link.");
      console.error(error);
    }
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
            <Input 
            placeholder="Nome" 
            onChangeText={setName} 
            autocorrect={false}/>
            <Input 
            placeholder="URL" 
            onChangeText={setUrl} 
            autocorrect={false}
            autoCapitalize="none"/>
            <Button title="Adicionar" onPress={handleAdd}></Button>
        </View>        
    </View>
  );
}
