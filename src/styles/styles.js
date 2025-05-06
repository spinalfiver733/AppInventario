import { StyleSheet } from 'react-native';

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

export default styles;