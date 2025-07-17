import {
    Image, 
    View, 
    TouchableOpacity, 
    FlatList, 
    Modal, 
    Text,
    Alert,
    Linking
} from 'react-native'

import { MaterialIcons } from '@expo/vector-icons'

import { 
    useFocusEffect
    , router 
} from 'expo-router'

import { 
    useState,
    useCallback 
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



export default function Index(){

    const [category, setCategory] = useState<string>(categories[0].name);
    const [links, setLinks] = useState<LinkStorage[]>();
    const [showModal, setShowModal] = useState(false);
    const [link, setLink] = useState<LinkStorage>({} as LinkStorage);

    async function getLinks() {
        try {
            const response = await linkStorage.get();
            const filtered = response.filter((link) => link.category === category);
            if (filtered.length === 0) {
                Alert.alert("Nenhum link encontrado", "Adicione um novo link para ver aqui.");
                setLinks([]);
            }else if (filtered.length > 0) {
                setLinks(filtered);
            }
        } catch (error) {
            Alert.alert("Erro", "Não foi possível obter os links:");
        }
    }

    function hanleDetails(selected: LinkStorage) {
        setShowModal(true);
        setLink(selected);
    }

    async function linkRemove() {
        try {
            await linkStorage.remove(link.id);
            getLinks();
            setShowModal(false);
        } catch (error) {
            Alert.alert("Erro", "Não foi possível excluir o link.");
        }
    }

    function handleRemove() {
        Alert.alert(
            "Deletar link",
            `Deseja deletar o link ${link.name}?`,
            [
                {
                    text: "Cancelar",
                    style: "cancel"
                },
                {
                    text: "Deletar",
                    onPress: linkRemove
                }
            ]
        );
    }

    async function handleOpenLink() {
        try {
            if (link.url) {
                const supported = await Linking.canOpenURL(link.url);
                if (supported) {
                    await Linking.openURL(link.url);
                    setShowModal(false);
                } 
            }
        } catch (error) {
                Alert.alert("Erro", "Não foi possível abrir o link.");
                console.log("Error opening link:", error);
        }
    }
    

    useFocusEffect(
        useCallback(() => {
        getLinks();
    }, [category])
    );

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
                            onDetails={() => hanleDetails(item)}
                        />
                    )}
                style={styles.links}
                contentContainerStyle={styles.linksContent}
                    showsVerticalScrollIndicator={false}
                />

            <Modal transparent visible={showModal}  animationType="slide">
                <View style={styles.modal}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalCategory}>
                                {link ? link.category : ''}
                            </Text>

                            <TouchableOpacity onPress={() => setShowModal(false)} activeOpacity={0.7}>
                                <MaterialIcons 
                                    name="close" 
                                    size={20} 
                                    color={colors.gray[400]} 
                                />
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.modalLinkName}>
                            {link ? link.name : ''}
                        </Text>
                        <Text style={styles.modalUrl}>
                            {link ? link.url : ''}
                        </Text>
                        <View style={styles.modalFooter}>
                            <Option name='Abrir' icon="language" onPress={handleOpenLink}/>
                            <Option name='Excluir' icon='delete' variant='secondary' onPress={handleRemove}/>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    )
}

