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
} from 'react-native';
import { TextInput, Button, Card, Divider } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';
import { StatusBar } from 'expo-status-bar';

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

  // Manejar el envío del formulario
  const handleSubmit = () => {
    // Aquí iría la lógica para enviar los datos a tu backend
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
    
    console.log('Datos del formulario:', formData);
    // Aquí harías el fetch o axios.post a tu API
    
    // Navegación a la pantalla de confirmación o lista
    alert('Registro guardado exitosamente');
    // navigation.navigate('InventarioBienes');
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
                  style={styles.picker}
                  onValueChange={(itemValue) => setBienInformatico(itemValue)}
                >
                  <Picker.Item label="SELECCIONE TIPO DE BIEN" value="" />
                  <Picker.Item label="CPU" value="CPU" />
                  <Picker.Item label="MONITOR" value="Monitor" />
                  <Picker.Item label="EQUIPO COMPLETO" value="Equipo Completo" />
                </Picker>
              </View>
              
              <TextInput
                label="Modelo"
                value={modelo}
                onChangeText={setModelo}
                style={styles.input}
                mode="outlined"
                outlineColor={styles.outlineColor.color}
                activeOutlineColor={styles.activeOutlineColor.color}
              />
              
              <TextInput
                label="Número de Serie"
                value={numeroSerie}
                onChangeText={setNumeroSerie}
                style={styles.input}
                mode="outlined"
                outlineColor={styles.outlineColor.color}
                activeOutlineColor={styles.activeOutlineColor.color}
              />
              
              <TextInput
                label="Número de Inventario"
                value={numeroInventario}
                onChangeText={setNumeroInventario}
                style={styles.input}
                mode="outlined"
                outlineColor={styles.outlineColor.color}
                activeOutlineColor={styles.activeOutlineColor.color}
              />
              
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
                  style={styles.picker}
                  onValueChange={handleResponsableChange}
                >
                  <Picker.Item label="SELECCIONE RESPONSABLE" value="" />
                  {responsables.map((resp, index) => (
                    <Picker.Item key={index} label={resp.NOMBRE} value={resp.NOMBRE} />
                  ))}
                </Picker>
              </View>
              
              <TextInput
                label="Ubicación"
                value={ubicacion}
                onChangeText={setUbicacion}
                style={styles.input}
                mode="outlined"
                outlineColor={styles.outlineColor.color}
                activeOutlineColor={styles.activeOutlineColor.color}
              />
              
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
                  style={styles.picker}
                  onValueChange={(itemValue) => setEstatus(itemValue)}
                >
                  <Picker.Item label="SELECCIONE ESTADO" value="" />
                  <Picker.Item label="ACTIVO" value="activo" />
                  <Picker.Item label="BAJA" value="baja" />
                </Picker>
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
});

export default RegistroBienesScreen;