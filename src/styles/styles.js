import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  // Estilos originales
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

  // ========== ESTILOS PARA EL HEADER DEL USUARIO ==========
  userInfoHeader: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  userInfoContent: {
    flex: 1,
  },
  userInfoName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 3,
  },
  userInfoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  userInfoValue: {
    fontWeight: '600',
    color: '#9F2241',
  },
  logoutButton: {
    backgroundColor: '#9F2241',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    elevation: 2,
  },
  logoutButtonText: {
    color: '#BC955C',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  // ========================================================
  
  // Estilos adicionales para la funcionalidad offline y sincronización
// Estilos modificados para la barra de conexión
connectionBar: {
  flexDirection: 'row',
  backgroundColor: '#f8f9fa',
  padding: 10,
  alignItems: 'center',
  borderRadius: 8,
  marginBottom: 10,
  borderWidth: 1,
  borderColor: '#ddd',
},
connectionIndicator: {
  width: 12,
  height: 12,
  borderRadius: 6,
  marginRight: 8,
},
onlineIndicator: {
  backgroundColor: '#28a745',
},
offlineIndicator: {
  backgroundColor: '#dc3545',
},
connectionStatus: {
  fontSize: 14,
  fontWeight: '500',
},
pendingCountContainer: {
  marginLeft: 'auto',
  backgroundColor: '#9F2241',
  borderRadius: 20,
  paddingHorizontal: 10,
  paddingVertical: 2,
},
pendingCountText: {
  color: '#fff',
  fontSize: 12,
  fontWeight: 'bold',
},
onlineText: {
  color: '#155724',
},
offlineText: {
  color: '#721c24',
},
  
  // Estilos para el panel de sincronización
  syncCard: {
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 5,
    borderRadius: 8,
    backgroundColor: '#fff3cd',
    borderColor: '#ffeeba',
    borderWidth: 1,
    elevation: 2,
  },
  syncHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingTop: 15,
    paddingBottom: 5,
  },
  syncBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  syncBadge: {
    backgroundColor: '#9F2241',
    color: 'white',
    marginRight: 10,
  },
  syncTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#856404',
  },
  syncCloseButton: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
  },
  syncCloseButtonText: {
    fontSize: 12,
    color: '#666',
    fontWeight: 'bold',
  },
  syncText: {
    color: '#856404',
    marginVertical: 5,
  },
  syncButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  syncButton: {
    backgroundColor: '#9F2241',
    borderRadius: 4,
    marginLeft: 10,
  },
  syncButtonLabel: {
    color: '#BC955C',
    fontSize: 12,
  },
  syncSecondaryButton: {
    backgroundColor: 'transparent',
    borderColor: '#9F2241',
    borderRadius: 4,
  },
  syncSecondaryButtonLabel: {
    color: '#9F2241',
    fontSize: 12,
  },
  
  // Botón para reparar duplicados
  repairButton: {
    marginTop: 5,
  },
  repairButtonLabel: {
    fontSize: 10,
    color: '#666',
  },
  
  // Estilos para los indicadores de registro pendiente
  pendingIndicator: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff3cd',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: '#ffeeba',
    zIndex: 1000,
  },
  pendingIndicatorText: {
    color: '#856404',
    fontSize: 12,
    marginLeft: 5,
  },
  
  // Estilos para las listas de registros pendientes
  pendingListItem: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 5,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#9F2241',
  },
  pendingListItemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  pendingListItemDetail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
  },
  pendingListItemDate: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
    marginTop: 5,
  },
  
  // Botón flotante para acciones rápidas
  floatingButton: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#9F2241',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    zIndex: 1000,
  },
  floatingButtonText: {
    fontSize: 30,
    color: '#BC955C',
    fontWeight: 'bold',
  },
  
  // Estilos para el modal de sincronización
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#9F2241',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 20,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalCancelButton: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    flex: 1,
    marginRight: 5,
  },
  modalCancelButtonText: {
    color: '#333',
    textAlign: 'center',
  },
  modalConfirmButton: {
    backgroundColor: '#9F2241',
    borderRadius: 5,
    padding: 10,
    flex: 1,
    marginLeft: 5,
  },
  modalConfirmButtonText: {
    color: '#BC955C',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  
  // Estilos para mensajes de estado y notificaciones
  statusMessage: {
    padding: 10,
    borderRadius: 5,
    marginHorizontal: 16,
    marginBottom: 10,
  },
  statusMessageText: {
    fontSize: 14,
  },
  successMessage: {
    backgroundColor: '#d4edda',
    borderColor: '#c3e6cb',
    borderWidth: 1,
  },
  successMessageText: {
    color: '#155724',
  },
  errorMessage: {
    backgroundColor: '#f8d7da',
    borderColor: '#f5c6cb',
    borderWidth: 1,
  },
  errorMessageText: {
    color: '#721c24',
  },
  warningMessage: {
    backgroundColor: '#fff3cd',
    borderColor: '#ffeeba',
    borderWidth: 1,
  },
  warningMessageText: {
    color: '#856404',
  },
  infoMessage: {
    backgroundColor: '#d1ecf1',
    borderColor: '#bee5eb',
    borderWidth: 1,
  },
  infoMessageText: {
    color: '#0c5460',
  },
  searchableDropdown: {
    borderRadius: 4,
    marginBottom: 5,
  },
});

export default styles;