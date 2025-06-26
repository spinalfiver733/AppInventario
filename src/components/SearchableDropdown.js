import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import { Divider, IconButton } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';

/**
 * Componente de Dropdown con búsqueda para React Native
 * 
 * @param {Object} props
 * @param {Array} props.items - Lista de opciones a mostrar
 * @param {string} props.selectedValue - Valor seleccionado actualmente
 * @param {function} props.onValueChange - Función a llamar cuando se selecciona un valor
 * @param {string} props.placeholder - Texto placeholder para el campo de búsqueda
 * @param {Object} props.style - Estilos adicionales para el componente
 * @param {Object} props.labelStyle - Estilos para el texto del label seleccionado
 * @param {Object} props.placeholderStyle - Estilos para el texto del placeholder
 * @param {Object} props.error - Estado de error
 */
const SearchableDropdown = ({
  items = [],
  selectedValue,
  onValueChange,
  placeholder = "Seleccione un elemento",
  style = {},
  labelStyle = {},
  placeholderStyle = {},
  error = false,
}) => {
  // Estados
  const [modalVisible, setModalVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filteredItems, setFilteredItems] = useState(items);

  // Actualizar los elementos filtrados cuando cambia el texto de búsqueda o los elementos
  useEffect(() => {
    if (searchText) {
      const filtered = items.filter(item =>
        item.toLowerCase().includes(searchText.toLowerCase())
      );
      setFilteredItems(filtered);
    } else {
      setFilteredItems(items);
    }
  }, [searchText, items]);

  // Manejar la selección de un elemento
  const handleSelect = (value) => {
    onValueChange(value);
    setModalVisible(false);
    setSearchText('');
  };

  // Encontrar el elemento seleccionado
  const selectedItem = selectedValue 
    ? items.find(item => item === selectedValue) 
    : null;

  return (
    <View style={[styles.container, style]}>
      {/* Campo de selección */}
      <TouchableOpacity
        style={[
          styles.dropdownField,
          error ? styles.dropdownError : null,
        ]}
        onPress={() => setModalVisible(true)}
      >
        <Text 
          style={[
            selectedItem ? styles.selectedLabel : styles.placeholder,
            selectedItem ? labelStyle : placeholderStyle,
          ]}
          numberOfLines={1}
        >
          {selectedItem || placeholder}
        </Text>
        <MaterialIcons name="arrow-drop-down" size={24} color="#666" />
      </TouchableOpacity>

      {/* Modal para la búsqueda y selección */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => {
          setModalVisible(false);
          setSearchText('');
        }}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {/* Cabecera del modal */}
            <View style={styles.modalHeader}>
              <IconButton
                icon="close"
                size={24}
                onPress={() => {
                  setModalVisible(false);
                  setSearchText('');
                }}
              />
              <Text style={styles.modalTitle}>Seleccionar elemento</Text>
              <View style={{ width: 40 }} />
            </View>
            
            {/* Campo de búsqueda */}
            <View style={styles.searchContainer}>
              <MaterialIcons name="search" size={20} color="#666" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Buscar..."
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
            </View>
            
            <Divider />
            
            {/* Lista de opciones */}
            {filteredItems.length > 0 ? (
              <FlatList
                data={filteredItems}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.itemContainer,
                      item === selectedValue ? styles.selectedItem : null
                    ]}
                    onPress={() => handleSelect(item)}
                  >
                    <Text style={styles.itemText}>{item}</Text>
                    {item === selectedValue && (
                      <MaterialIcons name="check" size={20} color="#BC955C" />
                    )}
                  </TouchableOpacity>
                )}
                ItemSeparatorComponent={() => <Divider />}
                style={styles.listContainer}
              />
            ) : (
              <View style={styles.emptyContainer}>
                <MaterialIcons name="search-off" size={48} color="#ccc" />
                <Text style={styles.emptyText}>No se encontraron resultados</Text>
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
  itemText: {
    fontSize: 16,
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
  },
});

export default SearchableDropdown;