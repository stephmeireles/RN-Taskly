import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, Alert } from 'react-native';
import useStyles from './style';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useTheme } from '../../pages/preferencesMenu/themeContext'; 

import LogoutConfirmationModal from '../../components/common/LogoutConfirmationModal';
import ToggleBiometricsModal from '../../components/common/ToggleBiometricsModal';
import AccountDeletionModal from '../../components/common/AccountDeletionModal';

import UserIconDark from '../../assets/icons/User.png';
import UserIconLight from '../../assets/icons/UserLight.png';
import FingerprintIconDark from '../../assets/icons/menu/FingerprintSimple.png';
import FingerprintIconLight from '../../assets/icons/menu/FingerprintSimpleLight.png';
import LogoutIconDark from '../../assets/icons/menu/SignOut.png';
import LogoutIconLight from '../../assets/icons/menu/SignOutLight.png';
import ChevronRightIcon from '../../assets/icons/ChevronRight.png';
import DeleteAccIconDark from '../../assets/icons/menu/Trash.png';
import DeleteAccIconLight from '../../assets/icons/TrashLight.png';
import ProfileImage from '../../assets/imgs/avatar.png';

import AsyncStorage from '@react-native-async-storage/async-storage';

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
const formatPhoneNumber = (phoneNumber: string) => {
  if (!phoneNumber) {
    return '';
  }
  const cleaned = ('' + phoneNumber).replace(/\D/g, '');
  const match = cleaned.match(/^(\d{2})(\d{5})(\d{4})$/);
  if (match) {
    return `(${match[1]}) ${match[2]} - ${match[3]}`;
  }
  return cleaned;
};

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  const styles = useStyles(); 
  const { currentThemeName } = useTheme(); 
  const [isLogoutConfirmationModalVisible, setIsLogoutConfirmationModalVisible] = useState(false);
  const [isBiometricModalVisible, setIsBiometricModalVisible] = useState(false);
  const [isBiometricEnabled, setIsBiometricEnabled] = useState(false);
  const [isAccountDeletionModalVisible, setIsAccountDeletionModalVisible] = useState(false);
  const [usuario, setUsuario] = useState({ nome: '', email: '', numero: '',picture:'' });


  const getIcon = (iconName: string) => {
    if (currentThemeName === 'dark') {
      switch (iconName) {
        case 'user':
          return UserIconDark;
        case 'fingerprint':
          return FingerprintIconDark;
        case 'logout':
          return LogoutIconDark;
        case 'delete':
          return DeleteAccIconDark;
        default:
          return null;
      }
    } else {
      switch (iconName) {
        case 'user':
          return UserIconLight;
        case 'fingerprint':
          return FingerprintIconLight;
        case 'logout':
          return LogoutIconLight;
        case 'delete':
          return DeleteAccIconLight;
        default:
          return null; 
      }
    }
  };

  const handleEditProfilePress = () => {
    navigation.navigate('profileEdit');
  };

  const handlePreferencesPress = () => {
    navigation.navigate('PreferencesMenu');
  };

  const handleLogoutPress = () => {
    setIsLogoutConfirmationModalVisible(true);
  };

  const handleCancelLogout = () => {
    setIsLogoutConfirmationModalVisible(false);
  };

  const handleConfirmLogout = async () => {
    try {
      await AsyncStorage.removeItem("loggedUserEmail");
      await AsyncStorage.removeItem("loggedUserNome");
      await AsyncStorage.removeItem("loggedUserNumero");

      navigation.reset({
        index: 0,
        routes: [{ name: 'SingIn' }],
      });
    } catch (error) {
      console.error('Erro ao sair da conta:', error);
      Alert.alert("Erro", "Ocorreu um erro ao deslogar.");
    }
  };

  const handleOpenBiometricModal = () => setIsBiometricModalVisible(true);
  const handleCloseBiometricModal = () => setIsBiometricModalVisible(false);

  const handleConfirmBiometricChange = (newState: boolean) => {
    setIsBiometricEnabled(newState);
    setIsBiometricModalVisible(false);
  };

  const handleOpenDeleteAccountModal = () => setIsAccountDeletionModalVisible(true);
  const handleCloseDeleteAccountModal = () => setIsAccountDeletionModalVisible(false);

  const handleConfirmDeleteAccount = async () => {
  try {
    const token = await AsyncStorage.getItem("authToken");

    if (!token) {
      Alert.alert("Erro", "Você não está autenticado.");
      return;
    }

    const response = await fetch("http://15.228.158.2:3000/profile/delete-account", {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      }
    });

    if (!response.ok) {
      console.error("Erro ao deletar conta:", await response.text());
      Alert.alert("Erro", "Não foi possível excluir sua conta.");
      return;
    }

    await AsyncStorage.clear();

    navigation.reset({
      index: 0,
      routes: [{ name: 'SingIn' }],
    });

    setIsAccountDeletionModalVisible(false);
    Alert.alert("Conta excluída", "Sua conta foi excluída com sucesso.");

  } catch (error) {
    console.error("Erro ao excluir a conta:", error);
    Alert.alert("Erro interno", "Não foi possível excluir sua conta.");
  }
};


  useFocusEffect(
    useCallback(() => {      
      const carregarUsuario = async () => {
      const token = await AsyncStorage.getItem("authToken");

      if (!token) {
        Alert.alert("Erro", "Usuário não autenticado.");
        return;
      }

      try {
  console.log("🧪 TOKEN LIDO DO STORAGE:", token);

  if (!token) {
    Alert.alert("Erro", "Você não está autenticado.");
    return;
  }

  const response = await fetch("http://15.228.158.2:3000/profile", {
  method: "GET",
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

if (!response.ok) {
  const text = await response.text();
  console.error("Erro ao buscar perfil:", text);
  Alert.alert("Erro", "Não foi possível carregar os dados.");
  return;
}

const data = await response.json();

// Verificação defensiva
if (!data?.name || !data?.email || !data?.phone_number) {
  console.error("Resposta inesperada do backend:", data);
  Alert.alert("Erro", "Dados incompletos recebidos.");
  return;
}

setUsuario({
  nome: data.name,
  email: data.email,
  numero: data.phone_number,
  picture: data.picture,
});
} catch (error) {
  console.error("Erro ao buscar dados do usuário:", error);
  Alert.alert("Erro interno", "Falha ao carregar dados.");
}
    };      
      carregarUsuario();
    }, [])
  );

  const handleTermsAndConditionsPress = () => {
    navigation.navigate('WebView', {
      url: 'https://sobreuol.noticias.uol.com.br/normas-de-seguranca-e-privacidade/en/',
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Image
            source={{ uri: getProfileImage(usuario.picture || '') }}
            style={styles.avatar}
          />
        </View>
        <Text style={styles.name}>{usuario.nome}</Text>
        <Text style={styles.email}>{usuario.email}</Text>
        <Text style={styles.phone}>{formatPhoneNumber(usuario.numero)}</Text>
      </View>

      <ScrollView
        style={styles.actionsScrollView}
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.actionsContainer}
      >
        <TouchableOpacity style={styles.actionButton} onPress={handleEditProfilePress}>
          <View style={styles.actionContent}>
            <Text style={styles.actionText}>Editar Informações Pessoais</Text>
            <Image source={getIcon('user')} style={styles.actionIcon} />
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={handleOpenBiometricModal}>
          <View style={styles.actionContent}>
            <Text style={styles.actionText}>Mudar Biometria</Text>
            <Image source={getIcon('fingerprint')} style={styles.actionIcon} />
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={handleLogoutPress}>
          <View style={styles.actionContent}>
            <Text style={styles.actionText}>Sair da Conta</Text>
            <Image source={getIcon('logout')} style={styles.actionIcon} />
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={handleOpenDeleteAccountModal}>
          <View style={styles.actionContent}>
            <Text style={styles.actionText}>Excluir Conta</Text>
            <Image source={getIcon('delete')} style={styles.actionIcon} />
          </View>
        </TouchableOpacity>
      </ScrollView>

      <View style={styles.menuContainer}>
        <TouchableOpacity style={styles.menuItem} onPress={handlePreferencesPress}>
          <Text style={styles.menuText}>Preferências</Text>
          <Image source={ChevronRightIcon} style={styles.menuIcon} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={handleTermsAndConditionsPress}>
          <Text style={styles.menuText}>Termos e regulamentos</Text>
          <Image source={ChevronRightIcon} style={styles.menuIcon} />
        </TouchableOpacity>
      </View>

      {isLogoutConfirmationModalVisible && (
        <LogoutConfirmationModal
          isVisible={isLogoutConfirmationModalVisible}
          onCancel={handleCancelLogout}
          onConfirm={handleConfirmLogout}
        />
      )}

      {isBiometricModalVisible && (
        <ToggleBiometricsModal
          isVisible={isBiometricModalVisible}
          isBiometricEnabled={isBiometricEnabled}
          onCancel={handleCloseBiometricModal}
          onConfirm={handleConfirmBiometricChange}
        />
      )}

      {isAccountDeletionModalVisible && (
        <AccountDeletionModal
          isVisible={isAccountDeletionModalVisible}
          onCancel={handleCloseDeleteAccountModal}
          onConfirm={handleConfirmDeleteAccount}
        />
      )}
    </View>
  );
};

export default ProfileScreen;