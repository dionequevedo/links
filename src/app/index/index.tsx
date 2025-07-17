import {Image, 
    View, 
    TouchableOpacity, 
    FlatList, 
    Modal, 
    Text,
    Alert 
} from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'
import { Route, router } from 'expo-router'
import { 
    useState,
    useEffect 
} from 'react'
import { Categories } from '@/components/categories'

import { styles } from "./styles"
import { colors } from "@/styles/colors"
import { Link} from '@/components/Link'
import { Option } from '@/components/options'
import { categories } from '@/utils/categories'
import { 
    linkStorage, 
    LinkStorage 
} from '@/storage/link-storage'
import { Category } from '@/components/category'



export default function Index(){

    const [category, setCategory] = useState<string>(categories[0].name);
    const [links, setLinks] = useState<LinkStorage[]>();
    const [url, setUrl] = useState<string>('');

    async function getLinks() {
        try {
            const response = await linkStorage.get();
            setLinks(response);
        } catch (error) {
            Alert.alert("Erro", "Não foi possível obter os links:");
        }
    }

    useEffect(() => {
        getLinks();
    }, [Category]);

    return(
        <View style={styles.container}>
            <View style={styles.header}>
                <Image source={require("@/assets/logo.png")} style={styles.logo}/>

                <TouchableOpacity activeOpacity={0.7} onPress={() => router.navigate("/add")}>
                    <MaterialIcons name="add" size={32} color={colors.green[300]}/>
                </TouchableOpacity>
            </View>

            <Categories onChange={setCategory} selected={category}/>
         
                <FlatList
                    data={links}
                    keyExtractor={(item) => item.id}
                    renderItem={({item}) => (
                        <Link 
                            name={item.name}
                            url={item.url}
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

