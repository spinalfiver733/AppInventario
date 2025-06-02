import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Platform,
  SafeAreaView,
  KeyboardAvoidingView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { TextInput, Button, Card, Divider, Badge } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';
import { StatusBar } from 'expo-status-bar';

import SearchableDropdown from '../components/SearchableDropdown';
import EmployeeSearchableDropdown from '../components/EmployeeSearchableDropdown';
import AreaSearchableDropdown from '../components/AreaSearchableDropdown';
import { BIENES_INFORMATICOS } from '../data/bienesInformaticos';

// Importamos el servicio de API
import { 
  registrarEquipo, 
  sincronizarRegistros, 
  checkConnection 
} from '../services/apiService';

// Importamos el servicio de almacenamiento local
import { 
  guardarRegistroPendiente, 
  obtenerRegistrosPendientes, 
  contarRegistrosPendientes,
  eliminarRegistrosPendientes,
  repararDuplicadosPendientes
} from '../services/storageService';

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

const RegistroBienesScreen = ({ navigation, userData, onLogout }) => {
  // Estados para los campos del formulario
  const [bienInformatico, setBienInformatico] = useState('');
  const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState(null);
  const [areaAsignada, setAreaAsignada] = useState(null);
  const [modelo, setModelo] = useState('');
  const [numeroSerie, setNumeroSerie] = useState('');
  const [numeroInventario, setNumeroInventario] = useState('');
  
  const [fechaEntrega, setFechaEntrega] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  const [responsable, setResponsable] = useState('');
  const [ubicacion, setUbicacion] = useState('');
  
  const [estatus, setEstatus] = useState('');
  const [fechaCaptura, setFechaCaptura] = useState(new Date());

  const [empleadoNuevo, setEmpleadoNuevo] = useState(null);
  const [showAddEmployeeModal, setShowAddEmployeeModal] = useState(false);
  const [tipoEmpleado, setTipoEmpleado] = useState('existente'); // 'existente' o 'nuevo'
  
  // Estado para mostrar el indicador de carga
  const [loading, setLoading] = useState(false);
  
  // Estado para validación de formulario
  const [errors, setErrors] = useState({});
  
  // Estado para rastrear la conectividad a internet (real)
  const [isOnline, setIsOnline] = useState(true);
  
  // Estado para contar registros pendientes
  const [pendingCount, setPendingCount] = useState(0);
  
  // Estado para mostrar el panel de sincronización
  const [showSyncPanel, setShowSyncPanel] = useState(false);
  
  // Estado para sincronización en progreso
  const [isSyncing, setIsSyncing] = useState(false);

  // Reparación de duplicados y verificación de conexión al iniciar
  useEffect(() => {
    const inicializarApp = async () => {
      try {
        // Verificar y reparar duplicados al inicio
        const resultadoReparacion = await repararDuplicadosPendientes();
        
        if (resultadoReparacion.eliminados > 0) {
          console.log(`Se eliminaron ${resultadoReparacion.eliminados} registros duplicados al iniciar`);
        }
        
        // Actualizar contador de pendientes después de reparación
        await actualizarContadorPendientes();
        
        // Verificar estado inicial de la conexión
        const estaConectado = await checkConnection();
        setIsOnline(estaConectado);
        
        // Si hay conexión y registros pendientes, mostrar panel de sincronización
        if (estaConectado && pendingCount > 0) {
          setShowSyncPanel(true);
        }
      } catch (error) {
        console.error('Error al inicializar la aplicación:', error);
      }
    };
    
    inicializarApp();
  }, []);

  // Cargar los responsables y configurar detección de red al montar el componente
  useEffect(() => {
    // Configurar el listener de red para detectar conexión
    const unsubscribeNetInfo = NetInfo.addEventListener(state => {
      const isConnected = state.isConnected && state.isInternetReachable;
      setIsOnline(isConnected);
      
      // Si recuperamos la conexión y hay registros pendientes, mostrar panel
      if (isConnected && pendingCount > 0) {
        setShowSyncPanel(true);
      }
    });
        
    // Verificar registros pendientes al iniciar
    actualizarContadorPendientes();
    
    // Actualizamos el contador cada vez que la pantalla obtiene el foco
    const unsubscribeNavigation = navigation?.addListener?.('focus', () => {
      actualizarContadorPendientes();
    });
    
    return () => {
      unsubscribeNetInfo();
      if (unsubscribeNavigation) unsubscribeNavigation();
    };
  }, [navigation, pendingCount]);
  
  // Actualizar el contador de registros pendientes
  const actualizarContadorPendientes = async () => {
    try {
      const count = await contarRegistrosPendientes();
      setPendingCount(count);
      
      // Mostrar panel de sincronización automáticamente si hay registros pendientes
      if (count > 0) {
        setShowSyncPanel(true);
      }
    } catch (error) {
      console.error('Error al contar registros pendientes:', error);
      setPendingCount(0);
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
    setAreaAsignada('Sin asignar');
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
    
    if (!empleadoSeleccionado) {
      formErrors.empleado = "Este campo es obligatorio";
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

    if (!areaAsignada) {
      formErrors.areaAsignada = "Este campo es obligatorio";
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
    setFechaEntrega(new Date());
    setResponsable('');
    setUbicacion('');
    setEmpleadoSeleccionado(null);
    setAreaAsignada(null);
    setEstatus('');
    setFechaCaptura(new Date());
    setErrors({});
  };

  // Guardar localmente
  const guardarEnLocal = async (datos) => {
    try {
      // Agregar información del usuario que está registrando
      if (userData) {
        datos.usuario_id = userData.id;
        datos.usuario_nombre = userData.nombre;
        datos.territorial = userData.territorial;
      }
      
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
        Alert.alert(
          "Aviso",
          "Este registro ya existe en la cola de pendientes. No se guardará como duplicado.",
          [{ text: "OK" }]
        );
        return false;
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
      fecha_entrega: fechaEntrega.toISOString().split('T')[0],
      empleado_seleccionado: empleadoSeleccionado,
      ubicacion,
      area_asignada: areaAsignada || 'Sin asignar', // Garantizar que nunca sea NULL
      estatus,
      fecha_captura: fechaCaptura.toISOString().split('T')[0],
    };
    
    try {
      // Verificar el estado actual de la conexión (realizar comprobación real)
      const estaConectado = await checkConnection();
      setIsOnline(estaConectado);
      
      // Si estamos en línea, intentamos enviar al servidor
      if (estaConectado) {
        try {
          // Agregar información del usuario que está registrando
          if (userData) {
            formData.usuario_id = userData.id;
            formData.usuario_nombre = userData.nombre;
            formData.territorial = userData.territorial;
          }
          
          // Usar el servicio API para registrar el equipo
          const resultado = await registrarEquipo(formData);
          
          if (resultado && resultado.success) {
            Alert.alert(
              "Éxito",
              "El equipo ha sido registrado correctamente",
              [
                { 
                  text: "OK", 
                  onPress: () => {
                    // Resetear el formulario
                    resetForm();
                  } 
                }
              ]
            );
            setLoading(false);
            return;
          }
          
          // Si llegamos aquí, hubo un error en la respuesta
          throw new Error(resultado?.error || "Error desconocido");
        } catch (error) {
          console.error("Error al registrar en el servidor:", error);
          // Si falla el envío al servidor, guardamos localmente
          const mensajeError = error.message || "Error al conectar con el servidor";
          
          Alert.alert(
            "Error en el servidor",
            `${mensajeError}. ¿Desea guardar el registro localmente?`,
            [
              {
                text: "Cancelar",
                style: "cancel",
                onPress: () => setLoading(false)
              },
              {
                text: "Guardar localmente",
                onPress: async () => {
                  await guardarEnLocal(formData);
                  setLoading(false);
                }
              }
            ]
          );
          return;
        }
      } else {
        // Si no estamos en línea, guardamos localmente directamente
        await guardarEnLocal(formData);
        setLoading(false);
      }
    } catch (error) {
      console.error("Error general:", error);
      Alert.alert(
        "Error inesperado",
        "Ocurrió un error al procesar la solicitud. Por favor intente nuevamente.",
        [{ text: "OK" }]
      );
      setLoading(false);
    }
  };
  
  // Función para sincronizar registros pendientes
  const sincronizarRegistrosPendientes = async () => {
    // Verificamos el estado actual de la conexión
    const estaConectado = await checkConnection();
    setIsOnline(estaConectado);
    
    if (!estaConectado) {
      Alert.alert(
        "Sin conexión",
        "Necesitas estar en línea para sincronizar registros. Inténtalo cuando tengas conexión a internet.",
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
      // Obtener todos los registros pendientes
      const registrosPendientes = await obtenerRegistrosPendientes();
      
      // Usar la función mejorada de sincronización
      const resultado = await sincronizarRegistros(registrosPendientes);
      
      // Eliminar registros sincronizados exitosamente
      if (resultado.success && resultado.idsEliminados && resultado.idsEliminados.length > 0) {
        await eliminarRegistrosPendientes(resultado.idsEliminados);
      }
      
      // Actualizar contador de pendientes
      await actualizarContadorPendientes();
      
      // Mostrar resultado de la sincronización
      if (resultado.success) {
        Alert.alert(
          "Sincronización completada",
          `Se sincronizaron ${resultado.sincronizados} registro(s) correctamente. ${resultado.fallidos} registro(s) fallaron.`,
          [{ text: "OK" }]
        );
      } else {
        Alert.alert(
          "Error de sincronización",
          `No se pudieron sincronizar los registros. Error: ${resultado.error || 'Error desconocido'}`,
          [{ text: "OK" }]
        );
      }
    } catch (error) {
      console.error("Error general de sincronización:", error);
      Alert.alert(
        "Error de sincronización",
        "Ocurrió un error al intentar sincronizar. Por favor intente nuevamente más tarde.",
        [{ text: "OK" }]
      );
    } finally {
      setIsSyncing(false);
    }
  };
  
  // Función para ver registros pendientes
  const verRegistrosPendientes = async () => {
    try {
      const registrosPendientes = await obtenerRegistrosPendientes();
      
      if (registrosPendientes.length === 0) {
        Alert.alert(
          "Sin registros pendientes",
          "No hay registros pendientes para sincronizar.",
          [{ text: "OK" }]
        );
        return;
      }
      
      // Creamos un texto informativo con los registros pendientes
      const infoRegistros = registrosPendientes.map((reg, index) => {
        return `${index + 1}. ${reg.bien_informatico} - ${reg.modelo}
   Serie: ${reg.numero_serie}
   Resp: ${reg.responsable}
   Fecha: ${new Date(reg.createdAt).toLocaleString()}
   ID: ${reg.tempId}`;
      }).join('\n\n');
      
      Alert.alert(
        `Registros Pendientes (${registrosPendientes.length})`,
        infoRegistros,
        [
          { text: "Cancelar" },
          { 
            text: "Sincronizar Ahora", 
            onPress: sincronizarRegistrosPendientes 
          }
        ]
      );
    } catch (error) {
      console.error("Error al obtener registros pendientes:", error);
      Alert.alert(
        "Error",
        "No se pudieron obtener los registros pendientes.",
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

  // Función para forzar la reparación de duplicados
  const forzarReparacionDuplicados = async () => {
    setLoading(true);
    
    try {
      const resultado = await repararDuplicadosPendientes();
      
      await actualizarContadorPendientes();
      
      Alert.alert(
        "Reparación completada",
        resultado.eliminados > 0 
          ? `Se eliminaron ${resultado.eliminados} registros duplicados.` 
          : "No se encontraron registros duplicados.",
        [{ text: "OK" }]
      );
    } catch (error) {
      console.error("Error al reparar duplicados:", error);
      Alert.alert(
        "Error",
        "No se pudieron reparar los duplicados. Error: " + error.message,
        [{ text: "OK" }]
      );
    } finally {
      setLoading(false);
    }
  };

  // Renderizar el Panel de Sincronización
  const renderSyncPanel = () => {
    if (!showSyncPanel || pendingCount === 0) return null;
    
    return (
      <Card style={styles.syncCard}>
        <View style={styles.syncHeader}>
          <View style={styles.syncBadgeContainer}>
            <Badge style={styles.syncBadge} size={24}>{pendingCount}</Badge>
            <Text style={styles.syncTitle}>Registros Pendientes</Text>
          </View>
          <TouchableOpacity 
            style={styles.syncCloseButton} 
            onPress={() => setShowSyncPanel(false)}
          >
            <Text style={styles.syncCloseButtonText}>✕</Text>
          </TouchableOpacity>
        </View>
        <Card.Content>
          <Text style={styles.syncText}>
            Tienes {pendingCount} registro{pendingCount !== 1 ? 's' : ''} pendiente{pendingCount !== 1 ? 's' : ''} de sincronización.
          </Text>
          <View style={styles.syncButtonsContainer}>
            <Button 
              mode="outlined" 
              onPress={verRegistrosPendientes}
              style={styles.syncSecondaryButton}
              labelStyle={styles.syncSecondaryButtonLabel}
            >
              Ver Detalles
            </Button>
            <Button 
              mode="contained" 
              onPress={sincronizarRegistrosPendientes}
              style={styles.syncButton}
              labelStyle={styles.syncButtonLabel}
              disabled={!isOnline || isSyncing}
            >
              {isSyncing ? "Sincronizando..." : "Sincronizar Ahora"}
            </Button>
          </View>
          
          {/* Botón adicional para reparar duplicados manualmente si es necesario */}
          <Button 
            mode="text" 
            onPress={forzarReparacionDuplicados}
            style={styles.repairButton}
            labelStyle={styles.repairButtonLabel}
          >
          </Button>
        </Card.Content>
      </Card>
    );
  };

  // Mostrar el indicador de carga durante las operaciones
  if (loading || isSyncing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#BC955C" />
        <Text style={styles.loadingText}>
          {isSyncing ? "Sincronizando registros..." : "Procesando operación..."}
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {/* Header con información del usuario logueado */}
          {userData && (
            <View style={styles.userInfoHeader}>
              <View style={styles.userInfoContent}>
                <Text style={styles.userInfoName}>
                  Usuario: <Text style={styles.userInfoValue}>{userData.nombre}</Text>
                </Text>
                <Text style={styles.userInfoText}>
                  Territorial: <Text style={styles.userInfoValue}>{userData.territorial}</Text>
                </Text>
                <Text style={styles.userInfoText}>
                  ID: <Text style={styles.userInfoValue}>{userData.id}</Text>
                </Text>
              </View>
              {onLogout && (
                <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
                  <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
          
          {/* Indicador del estado de conexión */}
          <View style={styles.connectionBar}>
            <View style={[styles.connectionIndicator, isOnline ? styles.onlineIndicator : styles.offlineIndicator]} />
            <Text style={[styles.connectionStatus, isOnline ? styles.onlineText : styles.offlineText]}>
              {isOnline ? "Conectado a internet" : "Sin conexión a internet"}
            </Text>
            {pendingCount > 0 && (
              <View style={styles.pendingCountContainer}>
                <Text style={styles.pendingCountText}>
                  {pendingCount} registro{pendingCount !== 1 ? 's' : ''} pendiente{pendingCount !== 1 ? 's' : ''}
                </Text>
              </View>
            )}
          </View>
          
          {/* Panel de sincronización */}
          {renderSyncPanel()}
          
          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.title}>Registro de Inventario de Bienes Informáticos</Text>
              
              {/* Sección: Información del Equipo */}
              <Text style={styles.sectionTitle}>Información del Equipo</Text>
              
              <View style={styles.pickerContainer}>
                <Text style={styles.label}>Bien Informático:</Text>
                <SearchableDropdown
                  items={BIENES_INFORMATICOS}
                  selectedValue={bienInformatico}
                  onValueChange={(itemValue) => setBienInformatico(itemValue)}
                  placeholder="SELECCIONE TIPO DE BIEN"
                  style={styles.searchableDropdown}
                  error={errors.bienInformatico ? true : false}
                />
                {errors.bienInformatico && <Text style={styles.errorText}>{errors.bienInformatico}</Text>}
              </View>
              
              <TextInput
                label="Modelo"
                value={modelo}
                onChangeText={setModelo}
                style={styles.input}
                mode="outlined"
                outlineColor={errors.modelo ? '#FF0000' : styles.outlineColor?.color}
                activeOutlineColor={styles.activeOutlineColor?.color}
                error={errors.modelo ? true : false}
              />
              {errors.modelo && <Text style={styles.errorText}>{errors.modelo}</Text>}
              
              <TextInput
                label="Número de Serie"
                value={numeroSerie}
                onChangeText={setNumeroSerie}
                style={styles.input}
                mode="outlined"
                outlineColor={errors.numeroSerie ? '#FF0000' : styles.outlineColor?.color}
                activeOutlineColor={styles.activeOutlineColor?.color}
                error={errors.numeroSerie ? true : false}
              />
              {errors.numeroSerie && <Text style={styles.errorText}>{errors.numeroSerie}</Text>}
              
              <TextInput
                label="Número de Inventario"
                value={numeroInventario}
                onChangeText={setNumeroInventario}
                style={styles.input}
                mode="outlined"
                outlineColor={errors.numeroInventario ? '#FF0000' : styles.outlineColor?.color}
                activeOutlineColor={styles.activeOutlineColor?.color}
                error={errors.numeroInventario ? true : false}
                maxLength={16}
              />
              {errors.numeroInventario && <Text style={styles.errorText}>{errors.numeroInventario}</Text>}
                           
              <Divider style={styles.divider} />
              
              {/* Sección: Asignación y Ubicación */}
              <Text style={styles.sectionTitle}>Asignación y Ubicación</Text>
              
              <Text style={styles.label}>Fecha de Entrega:</Text>
              {renderDatePicker()}
                            
              <View style={styles.pickerContainer}>
                <Text style={styles.label}>Empleado:</Text>
                <EmployeeSearchableDropdown
                  selectedValue={empleadoSeleccionado}
                  onValueChange={(no_emp) => setEmpleadoSeleccionado(no_emp)}
                  placeholder="SELECCIONE EMPLEADO"
                  style={styles.searchableDropdown}
                  error={errors.empleado ? true : false}
                />
                {errors.empleado && <Text style={styles.errorText}>{errors.empleado}</Text>}
              </View>

              <View style={styles.pickerContainer}>
                <Text style={styles.label}>Área Asignada:</Text>
                <AreaSearchableDropdown
                  selectedValue={areaAsignada}
                  onValueChange={(num_area) => setAreaAsignada(num_area)}
                  placeholder="SELECCIONE ÁREA"
                  style={styles.searchableDropdown}
                  error={errors.areaAsignada ? true : false}
                />
                {errors.areaAsignada && <Text style={styles.errorText}>{errors.areaAsignada}</Text>}
              </View>
              
              <TextInput
                label="Ubicación"
                value={ubicacion}
                onChangeText={setUbicacion}
                style={styles.input}
                mode="outlined"
                outlineColor={errors.ubicacion ? '#FF0000' : styles.outlineColor?.color}
                activeOutlineColor={styles.activeOutlineColor?.color}
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

export default RegistroBienesScreen;