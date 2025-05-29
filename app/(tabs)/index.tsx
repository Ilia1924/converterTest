import { fetchRatesWithCache } from '@/scripts/fetchWithCache';
import { CurrencyType } from '@/types/currencySelectorTypes';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import CurrencySelector from '../../components/CurrencySelector';

export default function HomeScreen() {
  const [fromCurrency, setFromCurrency] = useState<CurrencyType | null>(null);
  const [toCurrency, setToCurrency] = useState<CurrencyType | null>(null);
  const [amount, setAmount] = useState('');
  const [converted, setConverted] = useState<string>('');
  const apiKey = Constants?.expoConfig?.extra?.FX_API_KEY;

  useEffect(() => {
    const loadSavedCurrencies = async () => {
      try {
        const savedFrom = await AsyncStorage.getItem('fromCurrency');
        const savedTo = await AsyncStorage.getItem('toCurrency');
        const savedAmount = await AsyncStorage.getItem('lastAmount');
        const savedConverted = await AsyncStorage.getItem('lastConverted');

        if (savedFrom) setFromCurrency(JSON.parse(savedFrom));
        else setFromCurrency({ code: 'USD', name: 'USD', flag: '🇺🇸' });

        if (savedTo) setToCurrency(JSON.parse(savedTo));
        else setToCurrency({ code: 'EUR', name: 'EUR', flag: '🇪🇺' });

        if (savedAmount) setAmount(savedAmount);
        if (savedConverted) setConverted(savedConverted);

      } catch (err) {
        console.error('Ошибка при загрузке сохранённых валют:', err);
      }
    };

    loadSavedCurrencies();
  }, []);

  useEffect(() => {
    const convert = async () => {
      if (!fromCurrency || !toCurrency || !amount) return;

      try {
        const data = await fetchRatesWithCache(fromCurrency.code, apiKey);
        const rate = data.rates[toCurrency.code];

        if (rate) {
          const result = (parseFloat(amount) * rate).toFixed(2);
          setConverted(result);

          await AsyncStorage.setItem('lastAmount', amount);
          await AsyncStorage.setItem('lastConverted', result);
        } else {
          setConverted('Ошибка');
        }
      } catch (error) {
        setConverted('Ошибка');
      }
    };

    convert();
  }, [fromCurrency, toCurrency, amount]);

  const handleFromCurrencySelect = async (currency: CurrencyType) => {
    setFromCurrency(currency);
    await AsyncStorage.setItem('fromCurrency', JSON.stringify(currency));
  };

  const handleToCurrencySelect = async (currency: CurrencyType) => {
    setToCurrency(currency);
    await AsyncStorage.setItem('toCurrency', JSON.stringify(currency));
  };

  const swapCurrencies = async () => {
    if (!fromCurrency || !toCurrency) return;

    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);

    await AsyncStorage.setItem('fromCurrency', JSON.stringify(toCurrency));
    await AsyncStorage.setItem('toCurrency', JSON.stringify(fromCurrency));
  };

  return (
    <View style={styles.body}>
      <View style={styles.currencyRow}>
        <View style={styles.selectorWrapper}>
          <Text style={styles.label}>From:</Text>
          <CurrencySelector onSelectCurrency={handleFromCurrencySelect} initialValue={fromCurrency} />
        </View>

        <TouchableOpacity style={styles.swapButton} onPress={swapCurrencies}>
          <Text style={styles.swapText}>⇄</Text>
        </TouchableOpacity>

        <View style={styles.selectorWrapper}>
          <Text style={styles.label}>To:</Text>
          <CurrencySelector onSelectCurrency={handleToCurrencySelect} initialValue={toCurrency} />
        </View>
      </View>

      <View style={styles.amountWrapper}>jh vjh
        <Text style={styles.label}>Amount:</Text>
        <TextInput
          style={styles.input}
          onChangeText={(value) => setAmount(value.replace(/[^0-9.,]/g, ''))}
          value={amount}
          placeholder="1"
          keyboardType="numeric"
        />
      </View>

      <View style={styles.resultBox}>
        {converted ? (
          <View>
            <Text style={styles.inputCurs}>{amount} {fromCurrency?.code} = </Text>
            <Text style={styles.outputCurs}>{converted} {toCurrency?.code}</Text>
          </View>
        ) : (
          <Text style={styles.outputCurs}>$=$</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  body: {
    padding: 20,
    paddingTop: 90,
    display: 'flex',
  },
  titleContainer: {
    paddingBottom: 10,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  input: {
    height: 43,
    borderColor: 'black',
    borderWidth: 1,
    padding: 10,
    borderRadius: 5,
    marginBottom: 40,
  },
  resultBox: {
    display: 'flex',
    flexDirection: 'column',
  },
  currencyRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: 20,
    marginHorizontal: 20,
  },
  selectorWrapper: {
    alignItems: 'flex-start',
  },
  label: {
    fontSize: 14,
    marginBottom: 10,
  },
  amountWrapper: {
    marginHorizontal: 20,
  },
  swapButton: {
    alignSelf: 'center',
  },
  swapText: {
    paddingTop: 15,
    fontSize: 24,
  },
  inputCurs: {
    fontSize: 28,
    fontWeight: 'light',
    textAlign: 'center',
  },
  outputCurs: {
    fontSize: 42,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
