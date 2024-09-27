import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, FlatList } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const UserProfile: React.FC = () => {
  const [keypairs, setKeypairs] = useState<{ publicKey: string; secret: string }[]>([]);
  const [selectedAccountIndex, setSelectedAccountIndex] = useState<number | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<any[]>([]);

  const retrieveKeys = async () => {
    try {
      const existingKeypairs = JSON.parse(await AsyncStorage.getItem('keypairs') || '[]');
      setKeypairs(existingKeypairs);
      if (existingKeypairs.length > 0) {
        setSelectedAccountIndex(0);
      }
    } catch (error) {
      console.error('Error retrieving keys:', error);
    }
  };

  const fetchBalance = async (publicKey: string) => {
    try {
      const response = await axios.get(`https://diamtestnet.diamcircle.io/accounts/${publicKey}`);
      const accountData = response.data;
      setBalance(accountData.balances.find((b: any) => b.asset_type === 'native')?.balance || '0');
    } catch (error) {
      console.error(`Error fetching balance for ${publicKey}`, error);
      setBalance('Error fetching balance');
    }
  };

  const fetchTransactions = async (publicKey: string) => {
    try {
      const response = await axios.get(`https://diamtestnet.diamcircle.io/accounts/${publicKey}/transactions`);
      setTransactions(response.data._embedded?.records || []);
    } catch (error) {
      console.error(`Error fetching transactions for ${publicKey}`, error);
      setTransactions([]);
    }
  };

  useEffect(() => {
    retrieveKeys();
  }, []);

  useEffect(() => {
    if (selectedAccountIndex !== null && keypairs.length > 0) {
      const publicKey = keypairs[selectedAccountIndex]?.publicKey; // Use optional chaining
      if (publicKey) {
        fetchBalance(publicKey);
        fetchTransactions(publicKey);
      }
    }
  }, [selectedAccountIndex, keypairs]);

  const switchAccount = (index: number) => {
    if (index >= 0 && index < keypairs.length) {
      setSelectedAccountIndex(index);
    }
  };

  const removeAccount = async (index: number) => {
    Alert.alert(
      'Remove Account',
      'Are you sure you want to remove this account?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'OK',
          onPress: async () => {
            const updatedKeypairs = keypairs.filter((_, i) => i !== index);
            await AsyncStorage.setItem('keypairs', JSON.stringify(updatedKeypairs));
            setKeypairs(updatedKeypairs);
            if (selectedAccountIndex === index) {
              setSelectedAccountIndex(updatedKeypairs.length > 0 ? 0 : null);
              setBalance(null); // Reset balance when account is removed
              setTransactions([]); // Reset transactions
            }
          },
        },
      ],
      { cancelable: false }
    );
  };

  const renderTransactionItem = ({ item }: any) => (
    <View style={styles.transactionItem}>
      <Text style={styles.transactionText}>Transaction ID: {item.id}</Text>
      <Text style={styles.transactionText}>Amount: {item.amount || item.transaction_amount}</Text>
      <Text style={styles.transactionText}>Date: {item.created_at}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>User Profile</Text>

      {selectedAccountIndex !== null && keypairs[selectedAccountIndex] && (
        <View style={styles.selectedAccountContainer}>
          <Text style={styles.keyText}>Selected Account:</Text>
          <Text style={styles.keyText}>Public Key: {keypairs[selectedAccountIndex].publicKey}</Text>
          <Text style={styles.keyText}>Secret Key: {keypairs[selectedAccountIndex].secret}</Text>
          <Text style={styles.keyText}>Balance: {balance !== null ? balance : 'Loading...'}</Text>
        </View>
      )}

      <Text style={styles.transactionHeading}>Transactions:</Text>
      <FlatList
        data={transactions}
        renderItem={renderTransactionItem}
        keyExtractor={(item) => item.id}
        style={styles.transactionList}
      />

      {keypairs.map((_, index) => (
        <View key={index} style={styles.accountContainer}>
          <TouchableOpacity
            style={styles.switchButton}
            onPress={() => switchAccount(index)}
          >
            <Text style={styles.buttonText}>Switch to Account {index + 1}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => removeAccount(index)}
          >
            <Text style={styles.buttonText}>Remove</Text>
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d0d0d',
    padding: 20,
    justifyContent: 'center',
  },
  heading: {
    fontSize: 28,
    color: '#00FFCC',
    marginBottom: 20,
    textAlign: 'center',
  },
  selectedAccountContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  keyText: {
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 5,
  },
  transactionHeading: {
    fontSize: 22,
    color: '#00FFCC',
    marginTop: 20,
    marginBottom: 10,
  },
  transactionList: {
    marginBottom: 20,
  },
  transactionItem: {
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  transactionText: {
    color: '#FFFFFF',
    marginBottom: 5,
  },
  switchButton: {
    flex: 1,
    backgroundColor: '#005f5f',
    padding: 10,
    borderRadius: 8,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButton: {
    backgroundColor: '#ff3b3b',
    padding: 10,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#000000',
    fontWeight: 'bold',
  },
  accountContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
});

export default UserProfile;
