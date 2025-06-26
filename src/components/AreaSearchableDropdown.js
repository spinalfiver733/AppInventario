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
import { useAreaSearch } from '../hooks/useAreaSearch';

/**
 * Componente de Dropdown con búsqueda SQLite para áreas
 * 
 * @param {Object} props
 * @param {number} props.selectedValue - Número de área seleccionada
 * @param {function} props.onValueChange - Función a llamar cuando se selecciona un área
 * @param {string} props.placeholder - Texto placeholder
 * @param {Object} props.style - Estilos adicionales
 * @param {Object} props.labelStyle - Estilos para el texto del label
 * @param {Object} props.placeholderStyle - Estilos para el placeholder
 * @param {boolean} props.error - Estado de error
 * @param {number} props.searchLimit - Límite de resultados (default: 50)
 */
const AreaSearchableDropdown = ({
  selectedValue,
  onValueChange,
  placeholder = "Seleccione un área",
  style = {},
  labelStyle = {},
  placeholderStyle = {},
  error = false,
  searchLimit = 50,
}) => {
  // Estados locales
  const [modalVisible, setModalVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedArea, setSelectedArea] = useState(null);
  
  // Hook personalizado para búsqueda
  const {
    isLoading,
    isSearching,
    areas,
    error: dbError,
    isReady,
    searchAreas,
    getAreaByNumber
  } = useAreaSearch();

  // Referencia para debounce
  const searchTimeoutRef = useRef(null);

  // Cargar área seleccionada al cambiar selectedValue
  useEffect(() => {
    const loadSelectedArea = async () => {
      if (selectedValue && isReady) {
        const area = await getAreaByNumber(selectedValue);
        setSelectedArea(area);
      } else {
        setSelectedArea(null);
      }
    };

    loadSelectedArea();
  }, [selectedValue, isReady, getAreaByNumber]);

  // Búsqueda con debounce
  useEffect(() => {
    if (!isReady) return;

    // Limpiar timeout anterior
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Nueva búsqueda con delay
    searchTimeoutRef.current = setTimeout(() => {
      searchAreas(searchText, searchLimit);
    }, 300); // 300ms de delay

    // Cleanup
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchText, isReady, searchAreas, searchLimit]);

  // Manejar selección de área
  const handleSelect = (area) => {
    setSelectedArea(area);
    onValueChange(area.value); // Pasar solo el num_area
    setModalVisible(false);
    setSearchText('');
  };

  // Manejar apertura del modal
  const handleOpenModal = () => {
    if (!isReady) {
      console.warn('⚠️ Base de datos de áreas no está lista');
      return;
    }
    setModalVisible(true);
  };

  // Manejar cierre del modal
  const handleCloseModal = () => {
    setModalVisible(false);
    setSearchText('');
  };

  // Renderizar elemento de área
  const renderArea = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.itemContainer,
        item.value === selectedValue ? styles.selectedItem : null
      ]}
      onPress={() => handleSelect(item)}
    >
      <View style={styles.areaInfo}>
        <Text style={styles.areaNumber}>{item.value}</Text>
        <Text style={styles.areaName} numberOfLines={2}>{item.nombre_area}</Text>
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
          <Text style={styles.loadingText}>Cargando áreas...</Text>
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
            selectedArea ? styles.selectedLabel : styles.placeholder,
            selectedArea ? labelStyle : placeholderStyle,
          ]}
          numberOfLines={1}
        >
          {selectedArea ? selectedArea.label : placeholder}
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
              <Text style={styles.modalTitle}>Seleccionar área</Text>
              <View style={{ width: 40 }} />
            </View>
            
            {/* Campo de búsqueda */}
            <View style={styles.searchContainer}>
              <MaterialIcons name="search" size={20} color="#666" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Buscar por número o nombre de área..."
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
            
            {/* Lista de áreas */}
            {!searchText ? (
              <View style={styles.emptyContainer}>
                <MaterialIcons name="business" size={48} color="#ccc" />
                <Text style={styles.emptyText}>
                  Escribe para buscar áreas{'\n'}
                  Puedes buscar por número o nombre
                </Text>
              </View>
            ) : areas.length > 0 ? (
              <FlatList
                data={areas}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderArea}
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
                <Text style={styles.emptyText}>Buscando áreas...</Text>
              </View>
            ) : (
              <View style={styles.emptyContainer}>
                <MaterialIcons name="search-off" size={48} color="#ccc" />
                <Text style={styles.emptyText}>
                  No se encontraron áreas{'\n'}
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
  areaInfo: {
    flex: 1,
  },
  areaNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#BC955C',
  },
  areaName: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
    lineHeight: 18,
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

export default AreaSearchableDropdown;