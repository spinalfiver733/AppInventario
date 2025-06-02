import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  FlatList,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  SafeAreaView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Divider, IconButton } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { useEmployeeSearch } from '../hooks/useEmployeeSearch';

/**
 * Componente de Dropdown con búsqueda SQLite para empleados
 * 
 * @param {Object} props
 * @param {number} props.selectedValue - Número de empleado seleccionado
 * @param {function} props.onValueChange - Función a llamar cuando se selecciona un empleado
 * @param {string} props.placeholder - Texto placeholder
 * @param {Object} props.style - Estilos adicionales
 * @param {Object} props.labelStyle - Estilos para el texto del label
 * @param {Object} props.placeholderStyle - Estilos para el placeholder
 * @param {boolean} props.error - Estado de error
 * @param {number} props.searchLimit - Límite de resultados (default: 50)
 */
const EmployeeSearchableDropdown = ({
  selectedValue,
  onValueChange,
  placeholder = "Seleccione un empleado",
  style = {},
  labelStyle = {},
  placeholderStyle = {},
  error = false,
  searchLimit = 50,
}) => {
  // Estados locales
  const [modalVisible, setModalVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  
  // Hook personalizado para búsqueda
  const {
    isLoading,
    isSearching,
    employees,
    error: dbError,
    isReady,
    searchEmployees,
    getEmployeeByNumber
  } = useEmployeeSearch();

  // Referencia para debounce
  const searchTimeoutRef = useRef(null);

  // Cargar empleado seleccionado al cambiar selectedValue
  useEffect(() => {
    const loadSelectedEmployee = async () => {
      if (selectedValue && isReady) {
        const employee = await getEmployeeByNumber(selectedValue);
        setSelectedEmployee(employee);
      } else {
        setSelectedEmployee(null);
      }
    };

    loadSelectedEmployee();
  }, [selectedValue, isReady, getEmployeeByNumber]);

  // Búsqueda con debounce
  useEffect(() => {
    if (!isReady) return;

    // Limpiar timeout anterior
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Nueva búsqueda con delay
    searchTimeoutRef.current = setTimeout(() => {
      searchEmployees(searchText, searchLimit);
    }, 300); // 300ms de delay

    // Cleanup
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchText, isReady, searchEmployees, searchLimit]);

  // Manejar selección de empleado
  const handleSelect = (employee) => {
    setSelectedEmployee(employee);
    onValueChange(employee.value); // Pasar solo el no_emp
    setModalVisible(false);
    setSearchText('');
  };

  // Manejar apertura del modal
  const handleOpenModal = () => {
    if (!isReady) {
      console.warn('⚠️ Base de datos no está lista');
      return;
    }
    setModalVisible(true);
  };

  // Manejar cierre del modal
  const handleCloseModal = () => {
    setModalVisible(false);
    setSearchText('');
  };

  // Renderizar elemento de empleado
  const renderEmployee = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.itemContainer,
        item.value === selectedValue ? styles.selectedItem : null
      ]}
      onPress={() => handleSelect(item)}
    >
      <View style={styles.employeeInfo}>
        <Text style={styles.employeeNumber}>{item.value}</Text>
        <Text style={styles.employeeName}>{item.nombre}</Text>
      </View>
      {item.value === selectedValue && (
        <MaterialIcons name="check" size={20} color="#BC955C" />
      )}
    </TouchableOpacity>
  );

  // Mostrar loading si la base de datos no está lista
  if (isLoading) {
    return (
      <View style={[styles.container, style]}>
        <View style={[styles.dropdownField, styles.loadingField]}>
          <ActivityIndicator size="small" color="#BC955C" />
          <Text style={styles.loadingText}>Cargando empleados...</Text>
        </View>
      </View>
    );
  }

  // Mostrar error si hay problemas con la base de datos
  if (dbError) {
    return (
      <View style={[styles.container, style]}>
        <TouchableOpacity style={[styles.dropdownField, styles.errorField]}>
          <Text style={styles.errorText}>Error: {dbError}</Text>
          <MaterialIcons name="error" size={24} color="#FF0000" />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      {/* Campo de selección */}
      <TouchableOpacity
        style={[
          styles.dropdownField,
          error ? styles.dropdownError : null,
        ]}
        onPress={handleOpenModal}
        disabled={!isReady}
      >
        <Text 
          style={[
            selectedEmployee ? styles.selectedLabel : styles.placeholder,
            selectedEmployee ? labelStyle : placeholderStyle,
          ]}
          numberOfLines={1}
        >
          {selectedEmployee ? selectedEmployee.label : placeholder}
        </Text>
        <MaterialIcons name="arrow-drop-down" size={24} color="#666" />
      </TouchableOpacity>

      {/* Modal para búsqueda y selección */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={handleCloseModal}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {/* Cabecera del modal */}
            <View style={styles.modalHeader}>
              <IconButton
                icon="close"
                size={24}
                onPress={handleCloseModal}
              />
              <Text style={styles.modalTitle}>Seleccionar empleado</Text>
              <View style={{ width: 40 }} />
            </View>
            
            {/* Campo de búsqueda */}
            <View style={styles.searchContainer}>
              <MaterialIcons name="search" size={20} color="#666" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Buscar por número o nombre..."
                value={searchText}
                onChangeText={setSearchText}
                autoFocus={Platform.OS !== 'ios'}
                autoCapitalize="none"
                clearButtonMode="always"
              />
              {searchText ? (
                <TouchableOpacity onPress={() => setSearchText('')}>
                  <MaterialIcons name="close" size={20} color="#666" style={styles.clearIcon} />
                </TouchableOpacity>
              ) : null}
              {isSearching && (
                <ActivityIndicator size="small" color="#BC955C" style={styles.searchLoader} />
              )}
            </View>
            
            <Divider />
            
            {/* Lista de empleados */}
            {!searchText ? (
              <View style={styles.emptyContainer}>
                <MaterialIcons name="search" size={48} color="#ccc" />
                <Text style={styles.emptyText}>
                  Escribe para buscar empleados{'\n'}
                  Puedes buscar por número o nombre
                </Text>
              </View>
            ) : employees.length > 0 ? (
              <FlatList
                data={employees}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderEmployee}
                ItemSeparatorComponent={() => <Divider />}
                style={styles.listContainer}
                keyboardShouldPersistTaps="handled"
                initialNumToRender={20}
                maxToRenderPerBatch={20}
                windowSize={10}
              />
            ) : isSearching ? (
              <View style={styles.emptyContainer}>
                <ActivityIndicator size="large" color="#BC955C" />
                <Text style={styles.emptyText}>Buscando empleados...</Text>
              </View>
            ) : (
              <View style={styles.emptyContainer}>
                <MaterialIcons name="search-off" size={48} color="#ccc" />
                <Text style={styles.emptyText}>
                  No se encontraron empleados{'\n'}
                  para "{searchText}"
                </Text>
              </View>
            )}
          </View>
        </SafeAreaView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 15,
    width: '100%',
  },
  dropdownField: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 56,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
  },
  dropdownError: {
    borderColor: '#FF0000',
  },
  loadingField: {
    justifyContent: 'center',
  },
  errorField: {
    borderColor: '#FF0000',
    backgroundColor: '#ffe6e6',
  },
  selectedLabel: {
    color: '#000',
    fontSize: 16,
    flex: 1,
  },
  placeholder: {
    color: '#999',
    fontSize: 16,
    flex: 1,
  },
  loadingText: {
    color: '#666',
    fontSize: 16,
    marginLeft: 8,
  },
  errorText: {
    color: '#FF0000',
    fontSize: 14,
    flex: 1,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    minHeight: '40%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    margin: 10,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
  },
  clearIcon: {
    marginLeft: 8,
  },
  searchLoader: {
    marginLeft: 8,
  },
  listContainer: {
    flex: 1,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  selectedItem: {
    backgroundColor: 'rgba(188, 149, 92, 0.1)',
  },
  employeeInfo: {
    flex: 1,
  },
  employeeNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#BC955C',
  },
  employeeName: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 22,
  },
});

export default EmployeeSearchableDropdown;