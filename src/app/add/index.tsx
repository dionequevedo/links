import {View, Text, TouchableOpacity} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { router, Router } from 'expo-router';

import { styles } from './styles';
import { colors } from '@/styles/colors';
import { Input } from '@/components/input';
import { Button } from '@/components/button';

import { Categories } from '@/components/categories';

export default function Add() {
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
      <Categories />
        <View style={styles.form}>
            <Input placeholder="Nome" onChangeText={(value:string) => console.log(value)}/>
            <Input placeholder="Url"/>
            <Button title="Adicionar"></Button>
        </View>
    </View>
  );
}
