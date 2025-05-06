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
import { TextInput, Button, Card, Divider } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';
import { StatusBar } from 'expo-status-bar';
// Importamos el servicio de API
import { registrarEquipo } from '../services/apiService';

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
  const [areaAsignada, setAreaAsignada] = useState('');
  
  const [estatus, setEstatus] = useState('');
  const [fechaCaptura, setFechaCaptura] = useState(new Date());
  
  // Estado para mostrar el indicador de carga
  const [loading, setLoading] = useState(false);
  
  // Estado para validación de formulario
  const [errors, setErrors] = useState({});
  
  // Lista de responsables (debería venir de una API/base de datos)
  const [responsables, setResponsables] = useState([]);

  // Cargar los responsables al montar el componente
  useEffect(() => {
    // Aquí deberías hacer una llamada a tu API para obtener los responsables
    // Por ahora, usamos datos de ejemplo
    setResponsables([
      { NOMBRE: 'Juan Pérez', AREA: 'Sistemas' },
      { NOMBRE: 'María López', AREA: 'Contabilidad' },
      { NOMBRE: 'Carlos Rodríguez', AREA: 'Recursos Humanos' },
    ]);
  }, []);

  // Manejar el cambio de fecha
  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || fechaEntrega;
    setShowDatePicker(Platform.OS === 'ios');
    setFechaEntrega(currentDate);
  };

  // Manejar el cambio de responsable y actualizar el área
  const handleResponsableChange = (itemValue, itemIndex) => {
    setResponsable(itemValue);
    if (itemIndex > 0) { // Para evitar el placeholder
      const selectedResponsable = responsables[itemIndex - 1];
      setAreaAsignada(selectedResponsable.AREA);
    }
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
      area_asignada: areaAsignada,
      estatus,
      fecha_captura: fechaCaptura.toISOString().split('T')[0],
    };
    
    try {
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
    } catch (error) {
      console.error("Error al registrar equipo:", error);
      Alert.alert(
        "Error inesperado",
        "Ocurrió un error al procesar la solicitud. Por favor intente nuevamente.",
        [{ text: "OK" }]
      );
    } finally {
      setLoading(false);
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
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
              
              <View style={styles.pickerContainer}>
                <Text style={styles.label}>Responsable:</Text>
                <Picker
                  selectedValue={responsable}
                  style={[styles.picker, errors.responsable ? styles.inputError : null]}
                  onValueChange={handleResponsableChange}
                >
                  <Picker.Item label="SELECCIONE RESPONSABLE" value="" />
                  {responsables.map((resp, index) => (
                    <Picker.Item key={index} label={resp.NOMBRE} value={resp.NOMBRE} />
                  ))}
                </Picker>
                {errors.responsable && <Text style={styles.errorText}>{errors.responsable}</Text>}
              </View>
              
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
              
              <TextInput
                label="Área Asignada"
                value={areaAsignada}
                onChangeText={setAreaAsignada}
                style={styles.input}
                mode="outlined"
                outlineColor={styles.outlineColor.color}
                activeOutlineColor={styles.activeOutlineColor.color}
                editable={false} // Automáticamente llenado por el responsable
              />
              
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
                REGISTRAR EQUIPO
              </Button>
            </Card.Content>
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
      <StatusBar style="light" />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#7b1c34',
  },
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 16,
  },
  card: {
    borderRadius: 15,
    marginVertical: 20,
    elevation: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#9F2241',
    textAlign: 'center',
    marginVertical: 15,
    textTransform: 'uppercase',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#9F2241',
    borderLeftWidth: 5,
    borderLeftColor: '#9F2241',
    paddingLeft: 15,
    marginVertical: 15,
  },
  label: {
    fontSize: 16,
    color: '#9F2241',
    marginBottom: 5,
  },
  input: {
    marginBottom: 15,
    backgroundColor: 'white',
  },
  outlineColor: {
    color: '#ddd',
  },
  activeOutlineColor: {
    color: '#9F2241',
  },
  pickerContainer: {
    marginBottom: 15,
  },
  picker: {
    height: 50,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
  },
  inputError: {
    borderColor: '#FF0000',
    borderWidth: 1,
  },
  errorText: {
    color: '#FF0000',
    fontSize: 12,
    marginTop: -10,
    marginBottom: 10,
  },
  dateButton: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 15,
    marginBottom: 15,
  },
  dateButtonText: {
    color: '#333',
  },
  dateText: {
    fontSize: 16,
    color: '#333',
    backgroundColor: '#f4f4f4',
    padding: 15,
    borderRadius: 5,
    marginBottom: 15,
  },
  button: {
    backgroundColor: '#9F2241',
    marginTop: 20,
    paddingVertical: 8,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#BC955C',
  },
  divider: {
    height: 1,
    backgroundColor: '#ddd',
    marginVertical: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#7b1c34',
  },
  loadingText: {
    marginTop: 10,
    color: 'white',
    fontSize: 16,
  },
});

export default RegistroBienesScreen;