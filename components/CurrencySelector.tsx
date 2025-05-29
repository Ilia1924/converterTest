
import { CurrencySelectorType, CurrencyType, listType } from '@/types/currencySelectorTypes';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import MyRadioButton from '../components/RadioButton';
import currencyFlags from '../constants/flags';

const CurrencySelector = ({ onSelectCurrency, initialValue }: CurrencySelectorType) => {
  const [currencies, setCurrencies] = useState<listType[]>([]);
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyType | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const apiKey = Constants?.expoConfig?.extra?.FX_API_KEY;

  useEffect(() => {

    if (initialValue) {
      setSelectedCurrency(initialValue);
    }

    const fetchRates = async () => {
      try {
        const cachedData = await AsyncStorage.getItem('currency_rates');
        const cacheTimestamp = await AsyncStorage.getItem('currency_rates_timestamp');
        const isCacheValid =
          cachedData &&
          cacheTimestamp &&
          Date.now() - parseInt(cacheTimestamp, 10) < 1000 * 60 * 60;

        if (isCacheValid) {
          const rates = JSON.parse(cachedData);
          const list = getCurrencyListWithFlags(rates);
          setCurrencies(list);
          setLoading(false);
          return;
        }

        const response = await fetch(`https://api.fxratesapi.com/latest?api_key=${apiKey}`);
        const data = await response.json();

        await AsyncStorage.setItem('currency_rates', JSON.stringify(data.rates));
        await AsyncStorage.setItem('currency_rates_timestamp', Date.now().toString());

        const list = getCurrencyListWithFlags(data.rates);
        setCurrencies(list);
        setLoading(false);

      } catch (err) {
        console.error('Ошибка загрузки валют:', err);
        setLoading(false);
      }
    };

    fetchRates();
  }, [initialValue]);

  const getCurrencyListWithFlags = (rates: [{}]) => {
    return Object.keys(rates).map((code) => ({
      code,
      name: code,
      flag: currencyFlags[code] || '🏳️',
    }));
  };

  const filteredCurrencies = currencies.filter(
    (currency) =>
      currency.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      currency.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View>
      <TouchableOpacity
        style={styles.selectorButton}
        onPress={() => setModalVisible(true)}
        disabled={loading}
      >
        {selectedCurrency ? (
          <>
            <Text style={styles.flag}>{selectedCurrency.flag}</Text>
            <Text style={styles.currencyCode}>{selectedCurrency.code}</Text>
          </>
        ) : (
          <Text>Choose Currency</Text>
        )}
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalTitle}>
            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
              <Text style={styles.closeButtonText}> ← </Text>
            </TouchableOpacity>
            <Text style={styles.modalTitleName}> Currency Select </Text>
          </View>

          <TextInput
            style={styles.searchInput}
            placeholder="Looking currency..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />

          {loading ? (
            <ActivityIndicator size="large" />
          ) : filteredCurrencies.length === 0 ? (
            <Text>Don't find</Text>
          ) : (
            <FlatList
              data={filteredCurrencies}
              keyExtractor={(item) => item.code}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.currencyItem}
                  onPress={() => {
                    setSelectedCurrency(item);
                    onSelectCurrency(item);
                    setModalVisible(false);
                    setSearchQuery('');
                  }}
                >
                  <Text style={styles.flag}>{item.flag}</Text>
                  <Text style={styles.currencyName}>{item.code} – {item.name}</Text>
                  <MyRadioButton
                    selected={selectedCurrency?.code === item.code}
                    onSelect={() => {
                      setSelectedCurrency(item);
                      onSelectCurrency(item);
                    }}
                  />
                </TouchableOpacity>
              )}
            />
          )}
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  selectorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
    minWidth: 100,
    justifyContent: 'center',
  },
  flag: {
    fontSize: 24,
    marginRight: 8,
  },
  currencyCode: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalContainer: {
    marginTop: 40,
    display: 'flex',
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  modalTitle: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  modalTitleName: {
    fontSize: 20,
    fontWeight: 'bold'
  },
  searchInput: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 12,
    fontSize: 16,
  },
  currencyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  currencyName: {
    flex: 1,
    fontSize: 16,
    marginLeft: 10,
  },
  closeButton: {
    padding: 10,
    backgroundColor: '#efeaea',
    borderRadius: 6,
    marginBottom: 10,
    alignSelf: 'flex-start',
  },
  closeButtonText: {
    fontWeight: 'bold',
    margin: 3
  },
});

export default CurrencySelector;
