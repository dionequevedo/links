import {Image, View, TouchableOpacity, FlatList, Modal, Text } from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'
import { Route, router } from 'expo-router'

import { styles } from "./styles"
import { colors } from "@/styles/colors"
import { Link} from '@/components/Link'
import { Option } from '@/components/options'

import { Categories } from '@/components/categories'

export default function Index(){
    return(
        <View style={styles.container}>
            <View style={styles.header}>
                <Image source={require("@/assets/logo.png")} style={styles.logo}/>

                <TouchableOpacity activeOpacity={0.7} onPress={() => router.navigate("/add")}>
                    <MaterialIcons name="add" size={32} color={colors.green[300]}/>
                </TouchableOpacity>
            </View>

            <Categories />
         
                     <FlatList
                data={["1", "2", "3", "4", "5", "6"]}
                keyExtractor={(item) => item}
                renderItem={() => (
                    <Link 
                    name="Rocketseat"
                    url="https://www.rocketseat.com.br/"
                    onDetails={() => console.log("Clicou!")}
                />
                )}
                style={styles.links}
                contentContainerStyle={styles.linksContent}
                showsVerticalScrollIndicator={false}
            />

            <Modal transparent visible={false}>
                <View style={styles.modal}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalCategory}>
                                Curso
                            </Text>
                            <TouchableOpacity>
                                <MaterialIcons name="close" size={20} color={colors.gray[400]} />
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.modalLinkName}>
                            RockeSeat
                        </Text>
                        <Text style={styles.modalUrl}>
                        https://rocketseat.com.br/
                        </Text>
                        <View style={styles.modalFooter}>
                            <Option name='Abrir' icon="language"/>
                            <Option name='Deletar' icon='delete' variant='secondary'/>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    )
}

