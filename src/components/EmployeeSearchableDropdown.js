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
import AddEmployeeModal from './AddEmployeeModal';

/**
 * Componente de Dropdown con búsqueda SQLite para empleados
 * 
 * @param {Object} props
 * @param {number} props.selectedValue - Número de empleado seleccionado
 * @param {function} props.onValueChange - Función a llamar cuando se selecciona un empleado
 * @param {function} props.onNewEmployee - Función a llamar cuando se agrega un empleado nuevo
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
  onNewEmployee,
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
  const [showAddEmployeeModal, setShowAddEmployeeModal] = useState(false);
  const [employees, setEmployees] = useState([]);         // Lista para mostrar
  const [employeesList, setEmployeesList] = useState([]); // Lista combinada (BD + nuevos)
  
  // Hook personalizado para búsqueda
  const {
    isLoading,
    isSearching,
    employees: dbEmployees,
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
        // Primero buscar en empleados de la BD
        const employee = await getEmployeeByNumber(selectedValue);
        if (employee) {
          setSelectedEmployee(employee);
        } else {
          // Si no se encuentra por número, podría ser un empleado nuevo
          // Buscar en la lista local de empleados nuevos
          const foundNewEmployee = employeesList.find(emp => 
            emp.esNuevo && emp.value === selectedValue
          );
          if (foundNewEmployee) {
            setSelectedEmployee(foundNewEmployee);
          }
        }
      } else {
        setSelectedEmployee(null);
      }
    };

    loadSelectedEmployee();
  }, [selectedValue, isReady, getEmployeeByNumber, employeesList]);

  // Búsqueda con debounce
  useEffect(() => {
    if (!isReady) return;

    // Limpiar timeout anterior
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Nueva búsqueda con delay
    searchTimeoutRef.current = setTimeout(async () => {
      const dbEmployees = await searchEmployees(searchText, searchLimit);
      
      // Combinar empleados de BD con empleados nuevos locales si hay texto de búsqueda
      if (searchText.trim()) {
        const filteredNewEmployees = employeesList.filter(emp => 
          emp.esNuevo && 
          emp.nombre.toLowerCase().includes(searchText.toLowerCase())
        );
        
        // Combinar ambas listas (nuevos al principio)
        const combinedEmployees = [...filteredNewEmployees, ...dbEmployees];
        setEmployees(combinedEmployees);
      } else {
        setEmployees(dbEmployees);
      }
    }, 300); // 300ms de delay

    // Cleanup
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchText, isReady, searchEmployees, searchLimit, employeesList]);

  // Manejar selección de empleado
  const handleSelect = (employee) => {
    setSelectedEmployee(employee);
    
    // Determinar qué valor pasar según el tipo de empleado
    if (employee.esNuevo) {
      // Para empleados nuevos, pasar el nombre completo
      onValueChange(employee.value);
      // Notificar que es un empleado nuevo si hay callback
      if (onNewEmployee) {
        onNewEmployee(employee);
      }
    } else {
      // Para empleados de BD, pasar el número de empleado
      onValueChange(employee.value);
    }
    
    setModalVisible(false);
    setSearchText('');
  };

  // Manejar guardado de empleado nuevo
  const handleSaveNewEmployee = (newEmployee) => {
    // Agregar a la lista local
    setEmployeesList(prev => [...prev, newEmployee]);
    
    // Seleccionar automáticamente el nuevo empleado
    handleSelect(newEmployee);
    
    // Cerrar modal de agregar empleado
    setShowAddEmployeeModal(false);
  };

  // Abrir modal para agregar empleado
  const handleAddNewEmployee = () => {
    setShowAddEmployeeModal(true);
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
        <View style={styles.employeeHeader}>
          {item.esNuevo ? (
            <MaterialIcons name="person-add" size={20} color="#BC955C" />
          ) : (
            <MaterialIcons name="business" size={20} color="#4CAF50" />
          )}
          <Text style={[
            styles.employeeNumber,
            item.esNuevo ? styles.newEmployeeNumber : null
          ]}>
            {item.esNuevo ? 'NUEVO' : item.value}
          </Text>
        </View>
        <Text style={styles.employeeName}>{item.nombre || item.label}</Text>
        {item.esNuevo && (
          <Text style={styles.newEmployeeTag}>(Agregado manualmente)</Text>
        )}
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
              <>
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
                
                {/* Botón para agregar nuevo empleado */}
                <View style={styles.addEmployeeContainer}>
                  <Divider style={styles.addEmployeeDivider} />
                  <TouchableOpacity
                    style={styles.addEmployeeButton}
                    onPress={handleAddNewEmployee}
                  >
                    <MaterialIcons name="person-add" size={24} color="#BC955C" />
                    <Text style={styles.addEmployeeText}>
                      ¿No encuentras al empleado? Agregar nuevo
                    </Text>
                    <MaterialIcons name="arrow-forward" size={20} color="#BC955C" />
                  </TouchableOpacity>
                </View>
              </>
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
                
                {/* Botón para agregar nuevo empleado cuando no hay resultados */}
                <TouchableOpacity
                  style={styles.addEmployeeButtonNoResults}
                  onPress={handleAddNewEmployee}
                >
                  <MaterialIcons name="person-add" size={24} color="#BC955C" />
                  <Text style={styles.addEmployeeTextNoResults}>
                    Agregar "{searchText}" como nuevo empleado
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </SafeAreaView>
      </Modal>

      {/* Modal para agregar empleado nuevo */}
      <AddEmployeeModal
        visible={showAddEmployeeModal}
        onClose={() => setShowAddEmployeeModal(false)}
        onSave={handleSaveNewEmployee}
        initialName={searchText.trim()}
      />
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
    maxHeight: '95%', // Aumentado de 80% a 95%
    minHeight: '70%', // Aumentado de 40% a 70%
    flex: 1, // Agregado para usar todo el espacio disponible
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8, // Reducido de 10 a 8
    paddingHorizontal: 4, // Agregado padding horizontal
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8, // Reducido de 10 a 8
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    margin: 8, // Reducido de 10 a 8
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
    flex: 1, // Esto es clave para que ocupe todo el espacio disponible
    paddingBottom: 10, // Padding inferior agregado
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
  employeeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  employeeNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginLeft: 6,
  },
  newEmployeeNumber: {
    color: '#BC955C',
  },
  employeeName: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
    marginLeft: 26,
  },
  newEmployeeTag: {
    fontSize: 12,
    color: '#BC955C',
    fontStyle: 'italic',
    marginTop: 2,
    marginLeft: 26,
  },
  addEmployeeContainer: {
    marginTop: 10,
  },
  addEmployeeDivider: {
    marginVertical: 10,
  },
  addEmployeeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(188, 149, 92, 0.1)',
    borderRadius: 8,
    marginHorizontal: 10,
    marginBottom: 10,
  },
  addEmployeeText: {
    flex: 1,
    fontSize: 14,
    color: '#BC955C',
    fontWeight: '500',
    marginHorizontal: 10,
  },
  addEmployeeButtonNoResults: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(188, 149, 92, 0.1)',
    borderRadius: 8,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#BC955C',
    borderStyle: 'dashed',
  },
  addEmployeeTextNoResults: {
    fontSize: 14,
    color: '#BC955C',
    fontWeight: '500',
    marginLeft: 10,
    textAlign: 'center',
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