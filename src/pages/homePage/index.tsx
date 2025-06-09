import React, { useState, useEffect } from 'react';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useCallback } from 'react';
import { View, Text, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import createStyles from './style';
import ModalCriarTarefa from '../../components/common/modalcriartarefa';
import AsyncStorage from '@react-native-async-storage/async-storage';
/*************  ✨ Windsurf Command ⭐  *************/
/**
 * HomeScreen is the main screen of the app, it displays a list of tasks and allows the user to create new tasks.
 * It also allows the user to toggle the completion status of each task.
 * It uses the useTheme hook to get the theme of the app and the createStyles function to create the styles of the screen based on the theme.
 *
 * The screen is divided into three main parts: the header, the content and the footer.
 * The header contains the title of the app and the logo.
 * The content contains the list of tasks and the button to create new tasks.
 * The footer contains the button to toggle the completion status of each task.
 *
 * The screen also uses the useAsyncStorage hook to store and retrieve the tasks from the AsyncStorage.
 * The tasks are stored in a stringified JSON format and are retrieved when the user navigates to the screen.
 * The screen also uses the useEffect hook to load the tasks when the user navigates to the screen.
 *
 * The screen also uses the useState hook to store the tasks in the component state and to keep track of the selected task.
 * The screen also uses the useNavigation hook to navigate to the details screen when the user clicks on a task.
 *
 * The screen also uses the useTheme hook to get the theme of the app and to change the styles of the screen based on the theme.
 *
 * @returns {React.ReactElement} The JSX element of the HomeScreen component.
 */
/*******  eca0ce8d-5c29-4525-a797-3013124349b2  *******/import { useTheme } from '../../pages/preferencesMenu/themeContext';


export default function HomeScreen() {
  const navigation = useNavigation();
    const { theme } = useTheme();
    const styles = createStyles(theme);
    const [userEmail, setUserEmail] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [tarefas, setTarefas] = useState([]);
    const [selectedTask, setSelectedTask] = useState(null);
    const [loading, setLoading] = useState(true);
    const [userAvatar, setUserAvatar] = useState('');


    const getProfileImage = (pictureId: string | null): string => {
  switch (pictureId) {
    case 'avatar_1': return 'https://img-teskly.s3.us-east-2.amazonaws.com/img/Ellipse%201.png';
    case 'avatar_2': return 'https://img-teskly.s3.us-east-2.amazonaws.com/img/Ellipse%202.png';
    case 'avatar_3': return 'https://img-teskly.s3.us-east-2.amazonaws.com/img/Ellipse%203.png';
    case 'avatar_4': return 'https://img-teskly.s3.us-east-2.amazonaws.com/img/Ellipse%204.png';
    case 'avatar_5': return 'https://img-teskly.s3.us-east-2.amazonaws.com/img/Ellipse%205.png';
    default: return Image.resolveAssetSource(require('../../assets/imgs/avatar.png')).uri;
  }
};


    const salvarTarefas = async (dados, email) => {
        if (!email) return;
        try {
            await AsyncStorage.setItem(`tarefas_${email}`, JSON.stringify(dados));
        } catch (error) {
            Alert.alert("Erro ao salvar tarefas", error.message);
        }
    };

    const carregarTarefas = async () => {
        try {
    const token = await AsyncStorage.getItem('authToken');
    if (!token) throw new Error('Token de autenticação não encontrado');

    const response = await fetch('http://15.228.158.2:3000/tasks', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Erro ao buscar tarefas da API');
    }

    const tarefasApi = await response.json();
    setTarefas(tarefasApi);
      } catch (err) {
    console.error('Erro ao carregar tarefas:', err.message);
    Alert.alert('Erro', err.message);
    setTarefas([]);
     } finally {
    setLoading(false);
     }
    };

    const handleCriarTarefa = async (novaTarefa) => {
  try {
    const token = await AsyncStorage.getItem('authToken');
    if (!token) throw new Error('Token de autenticação não encontrado');

    const response = await fetch('http://15.228.158.2:3000/tasks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(novaTarefa)
    });

    if (!response.ok) {
      const contentType = response.headers.get("content-type");
      let errorMessage = 'Erro ao salvar tarefa';

      if (contentType && contentType.includes("application/json")) {
        const erro = await response.json();
        errorMessage = erro.message || errorMessage;
      } else {
        const erroTexto = await response.text();
        errorMessage = erroTexto || errorMessage;
      }

      throw new Error(errorMessage);
    }

    const data = await response.json();

    const novaComId = { ...novaTarefa, id: data.id };
    setTarefas(prev => [...prev, novaComId]);
    setModalVisible(false);
  } catch (err) {
    Alert.alert("Erroa", err.message);
  }
};


    useFocusEffect(
  useCallback(() => {
    const buscarDados = async () => {
      setLoading(true);
      const email = await AsyncStorage.getItem('loggedUserEmail');
      const picture = await AsyncStorage.getItem('loggedUserPicture');

      setUserEmail(email || '');
      setUserAvatar(picture || '');

      if (email) {
        await carregarTarefas();
      } else {
        setTarefas([]);
        setLoading(false);
      }
    };

    buscarDados();
  }, [])
);


    const toggleCheck = async (taskIndex) => {
  const tarefa = tarefas[taskIndex];
  const token = await AsyncStorage.getItem('authToken');
  if (!token) {
    Alert.alert('Erro', 'Token de autenticação não encontrado');
    return;
  }

  const atualizada = { ...tarefa, done: !tarefa.done };

  try {
    const response = await fetch(`http://15.228.158.2:3000/tasks/${tarefa.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ done: atualizada.done })
    });

    if (!response.ok) {
      throw new Error('Erro ao atualizar tarefa');
    }

    const novasTarefas = [...tarefas];
    novasTarefas[taskIndex] = atualizada;
    setTarefas(novasTarefas);
    setSelectedTask(prev => prev === taskIndex ? null : taskIndex);
  } catch (err) {
    Alert.alert("Erro", err.message);
  }
};

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.background }}>
                <ActivityIndicator size="large" color={theme.primary} />
            </View>
        );
    }
    

    return (
        <>
            <ModalCriarTarefa
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                onCreate={handleCriarTarefa}
                theme={theme}
            />

            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.title}>TASKLY</Text>
                    <Image
                      source={{ uri: getProfileImage(userAvatar) }}
                      style={styles.logo3}
                    />
                </View>
                <View style={styles.content}>
                    {tarefas.length === 0 ? (
                        <>
                            <Image
                                source={require('../../assets/icons/sadface.png')}
                                style={styles.logo1}
                            />
                            <Text style={styles.message}>No momento você não possui tarefa</Text>
                        </>
                    ) : (
                        tarefas.map((tarefa, index) => (
                            <View key={index} style={styles.containerTesk}>
                                <View style={styles.contentTesk}>
                                    <View style={styles.tasktitle}>
                                        <Text style={[styles.txth1, tarefa.done && styles.taskCompletedText]}>{tarefa.title}</Text>
                                        <TouchableOpacity
                                            style={[styles.checkContainer, tarefa.done && styles.checkContainerChecked]}
                                            onPress={() => toggleCheck(index)}
                                        >
                                            {tarefa.done && <Text style={styles.checkMark}>✓</Text>}
                                        </TouchableOpacity>
                                    </View>
                                    <Text style={[styles.txtp, tarefa.done && styles.taskCompletedText]}>{tarefa.description}</Text>

                                    <TouchableOpacity style={styles.btn}onPress={() => navigation.navigate("avatarSelect")}>
                                      
                                        <Text style={styles.txtbtn}>VER DETALHES</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))
                    )}
                    <TouchableOpacity
                        style={styles.button}
                        onPress={() => setModalVisible(true)}
                    >
                        <Text style={styles.buttonText}>Criar Tarefa</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </>
    );
}