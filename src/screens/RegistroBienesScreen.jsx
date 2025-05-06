import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  SafeAreaView,
  KeyboardAvoidingView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { TextInput, Button, Card, Divider, Badge } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';
import { StatusBar } from 'expo-status-bar';
import NetInfo from '@react-native-community/netinfo';

// Importamos el servicio de API
import { registrarEquipo } from '../services/apiService';

// Importamos el servicio de almacenamiento local
import { 
  guardarRegistroPendiente, 
  obtenerRegistrosPendientes, 
  contarRegistrosPendientes 
} from '../services/storageService';

// Importamos el servicio de sincronización
import { 
  sincronizarRegistrosPendientes, 
  sincronizarAlReconectar 
} from '../services/syncService';

// Importamos los estilos desde el archivo separado
import styles from '../styles/styles';

// Importación condicional para DateTimePicker
let DateTimePicker;
if (Platform.OS !== 'web') {
  // Solo importamos en plataformas nativas
  try {
    // Usamos require dinámico para evitar errores de importación
    DateTimePicker = require('@react-native-community/datetimepicker').default;
  } catch (error) {
    console.log('Error importando DateTimePicker:', error);
    // Proporcionamos un componente vacío como fallback
    DateTimePicker = () => null;
  }
}

const RegistroBienesScreen = ({ navigation }) => {
  // Estados para los campos del formulario
  const [bienInformatico, setBienInformatico] = useState('');
  const [modelo, setModelo] = useState('');
  const [numeroSerie, setNumeroSerie] = useState('');
  const [numeroInventario, setNumeroInventario] = useState('');
  const [contratoAdquisicion, setContratoAdquisicion] = useState('');
  
  const [fechaEntrega, setFechaEntrega] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  const [responsable, setResponsable] = useState('');
  const [ubicacion, setUbicacion] = useState('');
  const [areaAsignada, setAreaAsignada] = useState('Sin asignar'); // Valor inicial no vacío
  
  const [estatus, setEstatus] = useState('');
  const [fechaCaptura, setFechaCaptura] = useState(new Date());
  
  // Estado para mostrar el indicador de carga
  const [loading, setLoading] = useState(false);
  
  // Estado para validación de formulario
  const [errors, setErrors] = useState({});
  
  // Lista de responsables (debería venir de una API/base de datos)
  const [responsables, setResponsables] = useState([]);
  
  // Estado para rastrear la conectividad a internet
  const [isOnline, setIsOnline] = useState(true);
  
  // Estado para contar registros pendientes
  const [pendingCount, setPendingCount] = useState(0);
  
  // Estado para mostrar el proceso de sincronización
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);

  // Cargar los responsables al montar el componente y configurar la detección de red
  useEffect(() => {
    // Configurar el listener de red
    const unsubscribeNetInfo = NetInfo.addEventListener(state => {
      setIsOnline(state.isConnected && state.isInternetReachable);
    });
    
    // Configurar sincronización al reconectar
    const unsubscribeSyncOnReconnect = sincronizarAlReconectar(handleSyncComplete);
    
    // Verificar registros pendientes al iniciar
    actualizarContadorPendientes();
    
    // Cargar los responsables (deberías cargarlos desde tu API)
    setResponsables([
      { NOMBRE: 'Juan Pérez', AREA: 'Sistemas' },
      { NOMBRE: 'María López', AREA: 'Contabilidad' },
      { NOMBRE: 'Carlos Rodríguez', AREA: 'Recursos Humanos' },
    ]);
    
    // Cleanup al desmontar
    return () => {
      unsubscribeNetInfo();
      unsubscribeSyncOnReconnect();
    };
  }, []);
  
  // Actualizar el contador de registros pendientes
  const actualizarContadorPendientes = async () => {
    const count = await contarRegistrosPendientes();
    setPendingCount(count);
  };
  
  // Manejar la finalización de la sincronización
  const handleSyncComplete = (resultado) => {
    setIsSyncing(false);
    setSyncProgress(0);
    
    // Actualizar contador de pendientes
    actualizarContadorPendientes();
    
    // Mostrar resultado de la sincronización
    if (resultado.syncedCount > 0) {
      Alert.alert(
        "Sincronización completada",
        `Se sincronizaron ${resultado.syncedCount} registros con el servidor.` +
        (resultado.errors.length > 0 ? `\nErrores: ${resultado.errors.length}` : ""),
        [{ text: "OK" }]
      );
    }
  };

  // Manejar el cambio de fecha
  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || fechaEntrega;
    setShowDatePicker(Platform.OS === 'ios');
    setFechaEntrega(currentDate);
  };

  // Manejar el cambio de responsable y actualizar el área
  const handleResponsableChange = (itemValue, itemIndex) => {
    setResponsable(itemValue);
    // Establecemos área asignada como cadena vacía
    setAreaAsignada('');
  };

  // Validar el formulario
  const validateForm = () => {
    let formErrors = {};
    let isValid = true;

    if (!bienInformatico) {
      formErrors.bienInformatico = "Este campo es obligatorio";
      isValid = false;
    }
    
    if (!modelo) {
      formErrors.modelo = "Este campo es obligatorio";
      isValid = false;
    }
    
    if (!numeroSerie) {
      formErrors.numeroSerie = "Este campo es obligatorio";
      isValid = false;
    }
    
    if (!numeroInventario) {
      formErrors.numeroInventario = "Este campo es obligatorio";
      isValid = false;
    }
    
    if (!responsable) {
      formErrors.responsable = "Este campo es obligatorio";
      isValid = false;
    }
    
    if (!ubicacion) {
      formErrors.ubicacion = "Este campo es obligatorio";
      isValid = false;
    }
    
    if (!estatus) {
      formErrors.estatus = "Este campo es obligatorio";
      isValid = false;
    }

    setErrors(formErrors);
    return isValid;
  };

  // Función para resetear el formulario
  const resetForm = () => {
    setBienInformatico('');
    setModelo('');
    setNumeroSerie('');
    setNumeroInventario('');
    setContratoAdquisicion('');
    setFechaEntrega(new Date());
    setResponsable('');
    setUbicacion('');
    setAreaAsignada('');
    setEstatus('');
    setFechaCaptura(new Date());
    setErrors({});
  };

  // Guardar localmente
  const guardarEnLocal = async (datos) => {
    try {
      const guardado = await guardarRegistroPendiente(datos);
      if (guardado) {
        Alert.alert(
          "Guardado localmente",
          "El registro se ha guardado en tu dispositivo y se sincronizará cuando haya conexión a internet.",
          [{ 
            text: "OK", 
            onPress: () => {
              resetForm();
              actualizarContadorPendientes();
            } 
          }]
        );
        return true;
      } else {
        throw new Error("No se pudo guardar localmente");
      }
    } catch (error) {
      console.error("Error al guardar localmente:", error);
      Alert.alert(
        "Error",
        "No se pudo guardar el registro localmente. Por favor intente nuevamente.",
        [{ text: "OK" }]
      );
      return false;
    }
  };

  // Manejar el envío del formulario
  const handleSubmit = async () => {
    // Validar el formulario antes de enviar
    if (!validateForm()) {
      Alert.alert(
        "Error de validación",
        "Por favor complete todos los campos requeridos",
        [{ text: "OK" }]
      );
      return;
    }
    
    setLoading(true);
    
    // Preparar los datos del formulario en el formato requerido por la API
    const formData = {
      bien_informatico: bienInformatico,
      modelo,
      numero_serie: numeroSerie,
      numero_inventario: numeroInventario,
      contrato_adquisicion: contratoAdquisicion,
      fecha_entrega: fechaEntrega.toISOString().split('T')[0],
      responsable,
      ubicacion,
      area_asignada: areaAsignada || 'Sin asignar', // Garantizar que nunca sea NULL
      estatus,
      fecha_captura: fechaCaptura.toISOString().split('T')[0],
    };
    
    try {
      // Si estamos en línea, enviamos directamente al servidor
      if (isOnline) {
        // Usar el servicio API para registrar el equipo
        const resultado = await registrarEquipo(formData);
        
        if (resultado.success) {
          Alert.alert(
            "Éxito",
            "El equipo ha sido registrado correctamente" + 
              (resultado.method ? ` (Método: ${resultado.method})` : ""),
            [
              { 
                text: "OK", 
                onPress: () => {
                  // Resetear el formulario o navegar a otra pantalla
                  resetForm();
                  // Opcional: navegar a la lista de inventario
                  // navigation.navigate('InventarioBienes');
                } 
              }
            ]
          );
        } else {
          // Si falla la API pero estamos en línea, intentamos guardar localmente
          if (resultado.error && resultado.error.includes("servidor no disponible")) {
            await guardarEnLocal(formData);
          } else {
            // Mostrar mensaje de error de la API
            Alert.alert(
              "Error",
              resultado.error || "Hubo un error al guardar el registro",
              [{ text: "OK" }]
            );
            
            if (resultado.details) {
              console.log("Detalles del error:", resultado.details);
            }
          }
        }
      } else {
        // Si no estamos en línea, guardamos localmente
        await guardarEnLocal(formData);
      }
    } catch (error) {
      console.error("Error al registrar equipo:", error);
      
      // Si hay un error de red pero los datos son válidos, intentamos guardar localmente
      if (!isOnline) {
        await guardarEnLocal(formData);
      } else {
        Alert.alert(
          "Error inesperado",
          "Ocurrió un error al procesar la solicitud. Por favor intente nuevamente.",
          [{ text: "OK" }]
        );
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Iniciar sincronización manual
  const handleSyncNow = async () => {
    if (!isOnline) {
      Alert.alert(
        "Sin conexión",
        "No es posible sincronizar sin conexión a internet. Por favor conéctese a internet e intente nuevamente.",
        [{ text: "OK" }]
      );
      return;
    }
    
    if (pendingCount === 0) {
      Alert.alert(
        "Sin registros pendientes",
        "No hay registros pendientes para sincronizar.",
        [{ text: "OK" }]
      );
      return;
    }
    
    setIsSyncing(true);
    
    try {
      // Llamamos a la función de sincronización
      const resultado = await sincronizarRegistrosPendientes((progress) => {
        setSyncProgress(progress.percentage);
      });
      
      // Manejamos el resultado
      handleSyncComplete(resultado);
    } catch (error) {
      console.error("Error en sincronización:", error);
      setIsSyncing(false);
      setSyncProgress(0);
      
      Alert.alert(
        "Error de sincronización",
        "No se pudieron sincronizar todos los registros. Por favor intente nuevamente más tarde.",
        [{ text: "OK" }]
      );
    }
  };

  // Renderizado del selector de fecha adaptado a la plataforma
  const renderDatePicker = () => {
    if (Platform.OS === 'web') {
      return (
        <input
          type="date"
          value={fechaEntrega.toISOString().split('T')[0]}
          onChange={(e) => setFechaEntrega(new Date(e.target.value))}
          style={{
            padding: 10,
            borderWidth: 1,
            borderColor: '#ddd',
            borderRadius: 5,
            width: '100%',
            marginBottom: 15,
          }}
        />
      );
    } else {
      return (
        <>
          <TouchableOpacity
            onPress={() => setShowDatePicker(true)}
            style={styles.dateButton}
          >
            <Text style={styles.dateButtonText}>
              {fechaEntrega.toLocaleDateString()}
            </Text>
          </TouchableOpacity>
          
          {showDatePicker && DateTimePicker && (
            <DateTimePicker
              value={fechaEntrega}
              mode="date"
              display="default"
              onChange={onDateChange}
            />
          )}
        </>
      );
    }
  };

  // Mostrar el indicador de carga durante las operaciones
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#9F2241" />
        <Text style={styles.loadingText}>Guardando datos...</Text>
      </View>
    );
  }

  // Mostrar el indicador de sincronización
  if (isSyncing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#9F2241" />
        <Text style={styles.loadingText}>Sincronizando... {syncProgress}%</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        {/* Barra de estado de conexión */}
        {!isOnline && (
          <View style={styles.offlineBar}>
            <Text style={styles.offlineText}>
              Modo sin conexión. Los registros se guardarán localmente.
            </Text>
          </View>
        )}
        
        {/* Barra de registros pendientes */}
        {pendingCount > 0 && (
          <View style={styles.pendingBar}>
            <Text style={styles.pendingText}>
              {pendingCount} registro{pendingCount !== 1 ? 's' : ''} pendiente{pendingCount !== 1 ? 's' : ''} de sincronizar
            </Text>
            <Button
              mode="contained"
              onPress={handleSyncNow}
              disabled={!isOnline}
              style={styles.syncButton}
              labelStyle={styles.syncButtonLabel}
            >
              Sincronizar ahora
            </Button>
          </View>
        )}
      
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.title}>Registro de Inventario de Bienes Informáticos</Text>
              
              {/* Sección: Información del Equipo */}
              <Text style={styles.sectionTitle}>Información del Equipo</Text>
              
              <View style={styles.pickerContainer}>
                <Text style={styles.label}>Bien Informático:</Text>
                <Picker
                  selectedValue={bienInformatico}
                  style={[styles.picker, errors.bienInformatico ? styles.inputError : null]}
                  onValueChange={(itemValue) => setBienInformatico(itemValue)}
                >
                  <Picker.Item label="SELECCIONE TIPO DE BIEN" value="" />
                  <Picker.Item label="CPU" value="CPU" />
                  <Picker.Item label="MONITOR" value="MONITOR" />
                  <Picker.Item label="EQUIPO COMPLETO" value="EQUIPO COMPLETO" />
                </Picker>
                {errors.bienInformatico && <Text style={styles.errorText}>{errors.bienInformatico}</Text>}
              </View>
              
              <TextInput
                label="Modelo"
                value={modelo}
                onChangeText={setModelo}
                style={styles.input}
                mode="outlined"
                outlineColor={errors.modelo ? '#FF0000' : styles.outlineColor.color}
                activeOutlineColor={styles.activeOutlineColor.color}
                error={errors.modelo ? true : false}
              />
              {errors.modelo && <Text style={styles.errorText}>{errors.modelo}</Text>}
              
              <TextInput
                label="Número de Serie"
                value={numeroSerie}
                onChangeText={setNumeroSerie}
                style={styles.input}
                mode="outlined"
                outlineColor={errors.numeroSerie ? '#FF0000' : styles.outlineColor.color}
                activeOutlineColor={styles.activeOutlineColor.color}
                error={errors.numeroSerie ? true : false}
              />
              {errors.numeroSerie && <Text style={styles.errorText}>{errors.numeroSerie}</Text>}
              
              <TextInput
                label="Número de Inventario"
                value={numeroInventario}
                onChangeText={setNumeroInventario}
                style={styles.input}
                mode="outlined"
                outlineColor={errors.numeroInventario ? '#FF0000' : styles.outlineColor.color}
                activeOutlineColor={styles.activeOutlineColor.color}
                error={errors.numeroInventario ? true : false}
              />
              {errors.numeroInventario && <Text style={styles.errorText}>{errors.numeroInventario}</Text>}
              
              <TextInput
                label="Contrato de Adquisición"
                value={contratoAdquisicion}
                onChangeText={setContratoAdquisicion}
                style={styles.input}
                mode="outlined"
                outlineColor={styles.outlineColor.color}
                activeOutlineColor={styles.activeOutlineColor.color}
              />
              
              <Divider style={styles.divider} />
              
              {/* Sección: Asignación y Ubicación */}
              <Text style={styles.sectionTitle}>Asignación y Ubicación</Text>
              
              <Text style={styles.label}>Fecha de Entrega:</Text>
              {renderDatePicker()}
              
              <TextInput
                label="Responsable (número de empleado)"
                value={responsable}
                onChangeText={(text) => {
                  setResponsable(text);
                  setAreaAsignada('Sin asignar'); // Usamos un valor por defecto en lugar de cadena vacía
                }}
                style={styles.input}
                mode="outlined"
                outlineColor={errors.responsable ? '#FF0000' : styles.outlineColor.color}
                activeOutlineColor={styles.activeOutlineColor.color}
                error={errors.responsable ? true : false}
              />
              {errors.responsable && <Text style={styles.errorText}>{errors.responsable}</Text>}
              
              <TextInput
                label="Ubicación"
                value={ubicacion}
                onChangeText={setUbicacion}
                style={styles.input}
                mode="outlined"
                outlineColor={errors.ubicacion ? '#FF0000' : styles.outlineColor.color}
                activeOutlineColor={styles.activeOutlineColor.color}
                error={errors.ubicacion ? true : false}
              />
              {errors.ubicacion && <Text style={styles.errorText}>{errors.ubicacion}</Text>}
              
              <Divider style={styles.divider} />
              
              {/* Sección: Estado */}
              <Text style={styles.sectionTitle}>Estado del Equipo</Text>
              
              <View style={styles.pickerContainer}>
                <Text style={styles.label}>Estado del Equipo:</Text>
                <Picker
                  selectedValue={estatus}
                  style={[styles.picker, errors.estatus ? styles.inputError : null]}
                  onValueChange={(itemValue) => setEstatus(itemValue)}
                >
                  <Picker.Item label="SELECCIONE ESTADO" value="" />
                  <Picker.Item label="ACTIVO" value="activo" />
                  <Picker.Item label="BAJA" value="baja" />
                </Picker>
                {errors.estatus && <Text style={styles.errorText}>{errors.estatus}</Text>}
              </View>
              
              <Text style={styles.label}>Fecha de Captura:</Text>
              <Text style={styles.dateText}>
                {fechaCaptura.toLocaleDateString()}
              </Text>
              
              <Button
                mode="contained"
                onPress={handleSubmit}
                style={styles.button}
                labelStyle={styles.buttonLabel}
              >
                {isOnline ? "REGISTRAR EQUIPO" : "GUARDAR LOCALMENTE"}
              </Button>
            </Card.Content>
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
      <StatusBar style="light" />
    </SafeAreaView>
  );
};

// Estilos adicionales específicos para la funcionalidad offline
const additionalStyles = StyleSheet.create({
  offlineBar: {
    backgroundColor: '#f8d7da',
    padding: 10,
    width: '100%',
  },
  offlineText: {
    color: '#721c24',
    textAlign: 'center',
    fontWeight: '500',
  },
  pendingBar: {
    backgroundColor: '#fff3cd',
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  pendingText: {
    color: '#856404',
    flex: 1,
  },
  syncButton: {
    backgroundColor: '#9F2241',
    marginLeft: 10,
    height: 36,
  },
  syncButtonLabel: {
    fontSize: 12,
    marginVertical: 0,
    paddingVertical: 0,
  },
});

// Fusionar los estilos adicionales con los importados
Object.assign(styles, additionalStyles);

export default RegistroBienesScreen;