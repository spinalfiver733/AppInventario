import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Platform,
  Alert,
} from 'react-native';
import { TextInput, Button, IconButton } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';

/**
 * Modal para agregar un nuevo empleado manualmente
 * Guarda el nombre en el campo auxiliar contrato_adquisicion
 * 
 * @param {Object} props
 * @param {boolean} props.visible - Si el modal está visible
 * @param {function} props.onClose - Función para cerrar el modal
 * @param {function} props.onSave - Función para guardar el empleado nuevo
 * @param {string} props.initialName - Nombre inicial (opcional)
 */
const AddEmployeeModal = ({
  visible,
  onClose,
  onSave,
  initialName = '',
}) => {
  // Estados locales
  const [nombreEmpleado, setNombreEmpleado] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Resetear formulario cuando se abre/cierra el modal
  useEffect(() => {
    if (visible) {
      setNombreEmpleado(initialName);
      setErrors({});
    } else {
      setNombreEmpleado('');
      setErrors({});
    }
  }, [visible, initialName]);

  // Validar el formulario
  const validateForm = () => {
    const formErrors = {};
    let isValid = true;

    // Validar nombre requerido
    if (!nombreEmpleado.trim()) {
      formErrors.nombre = "El nombre del empleado es obligatorio";
      isValid = false;
    } else if (nombreEmpleado.trim().length < 3) {
      formErrors.nombre = "El nombre debe tener al menos 3 caracteres";
      isValid = false;
    } else if (nombreEmpleado.trim().length > 100) {
      formErrors.nombre = "El nombre no puede exceder 100 caracteres";
      isValid = false;
    }

    // Validar que solo contenga letras, espacios, acentos y algunos caracteres especiales
    const nombreRegex = /^[a-zA-ZÀ-ÿñÑ\s\-\.\']+$/;
    if (nombreEmpleado.trim() && !nombreRegex.test(nombreEmpleado.trim())) {
      formErrors.nombre = "El nombre solo puede contener letras, espacios y acentos";
      isValid = false;
    }

    setErrors(formErrors);
    return isValid;
  };

  // Manejar el guardado
  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Formatear el nombre (capitalizar cada palabra)
      const nombreFormateado = nombreEmpleado
        .trim()
        .toUpperCase()
        .replace(/\s+/g, ' '); // Normalizar espacios múltiples

      // Crear objeto de empleado nuevo
      const empleadoNuevo = {
        id: `nuevo_${Date.now()}`, // ID único temporal
        nombre: nombreFormateado,
        esNuevo: true,
        label: `${nombreFormateado} (Agregado manualmente)`,
        value: nombreFormateado
      };

      // Llamar función de guardado
      await onSave(empleadoNuevo);

      // Cerrar modal
      handleClose();

    } catch (error) {
      console.error('Error al guardar empleado nuevo:', error);
      Alert.alert(
        "Error",
        "No se pudo guardar el empleado. Por favor intente nuevamente.",
        [{ text: "OK" }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Manejar el cierre del modal
  const handleClose = () => {
    if (isLoading) return; // Prevenir cierre durante carga
    
    setNombreEmpleado('');
    setErrors({});
    onClose();
  };

  // Manejar cambio de texto con validación en tiempo real
  const handleTextChange = (text) => {
    setNombreEmpleado(text);
    
    // Limpiar errores mientras el usuario escribe
    if (errors.nombre && text.trim().length >= 3) {
      setErrors({});
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={handleClose}
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalContent}>
          
          {/* Header del modal */}
          <View style={styles.modalHeader}>
            <IconButton
              icon="close"
              size={24}
              onPress={handleClose}
              disabled={isLoading}
            />
            <Text style={styles.modalTitle}>Agregar Nuevo Empleado</Text>
            <View style={{ width: 40 }} />
          </View>

          {/* Contenido principal */}
          <View style={styles.contentContainer}>
            
            {/* Icono y descripción */}
            <View style={styles.descriptionContainer}>
              <MaterialIcons name="person-add" size={48} color="#BC955C" />
              <Text style={styles.descriptionText}>
                Agrega un empleado que no está en la base de datos.{'\n'}
                Este nombre se guardará temporalmente.
              </Text>
            </View>

            {/* Campo de nombre */}
            <View style={styles.inputContainer}>
              <TextInput
                label="Nombre completo del empleado"
                value={nombreEmpleado}
                onChangeText={handleTextChange}
                style={styles.input}
                mode="outlined"
                outlineColor={errors.nombre ? '#FF0000' : '#ddd'}
                activeOutlineColor="#BC955C"
                error={!!errors.nombre}
                disabled={isLoading}
                placeholder="Ej: JUAN PÉREZ GONZÁLEZ"
                autoCapitalize="characters"
                maxLength={100}
                multiline={false}
                returnKeyType="done"
                onSubmitEditing={handleSave}
              />
              {errors.nombre && (
                <Text style={styles.errorText}>{errors.nombre}</Text>
              )}
              
              {/* Contador de caracteres */}
              <Text style={styles.characterCount}>
                {nombreEmpleado.length}/100 caracteres
              </Text>
            </View>

            {/* Vista previa */}
            {nombreEmpleado.trim() && !errors.nombre && (
              <View style={styles.previewContainer}>
                <Text style={styles.previewLabel}>Vista previa:</Text>
                <View style={styles.previewEmployee}>
                  <MaterialIcons name="person-add" size={20} color="#BC955C" />
                  <Text style={styles.previewText}>
                    {nombreEmpleado.trim().toUpperCase()} (Agregado manualmente)
                  </Text>
                </View>
              </View>
            )}

          </View>

          {/* Botones de acción */}
          <View style={styles.buttonsContainer}>
            <Button
              mode="outlined"
              onPress={handleClose}
              style={styles.cancelButton}
              labelStyle={styles.cancelButtonLabel}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            
            <Button
              mode="contained"
              onPress={handleSave}
              style={styles.saveButton}
              labelStyle={styles.saveButtonLabel}
              disabled={isLoading || !nombreEmpleado.trim()}
              loading={isLoading}
            >
              {isLoading ? "Guardando..." : "Agregar Empleado"}
            </Button>
          </View>

        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    maxHeight: '80%',
    minHeight: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
  },
  contentContainer: {
    flex: 1,
    padding: 20,
  },
  descriptionContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  descriptionText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 22,
  },
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#fff',
    marginBottom: 5,
  },
  errorText: {
    color: '#FF0000',
    fontSize: 12,
    marginTop: 5,
    marginLeft: 10,
  },
  characterCount: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
    marginTop: 5,
  },
  previewContainer: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  previewLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  previewEmployee: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BC955C',
  },
  previewText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
    flex: 1,
  },
  buttonsContainer: {
    flexDirection: 'row',
    padding: 20,
    paddingTop: 10,
    gap: 15,
  },
  cancelButton: {
    flex: 1,
    borderColor: '#999',
  },
  cancelButtonLabel: {
    color: '#666',
    fontSize: 16,
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#BC955C',
  },
  saveButtonLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AddEmployeeModal;