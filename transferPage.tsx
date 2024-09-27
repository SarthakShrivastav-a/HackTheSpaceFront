import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity, TextInput } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TransferAsset: React.FC = () => {
  const [keypairs, setKeypairs] = useState<{ publicKey: string; secret: string }[]>([]);
  const [selectedAccountIndex, setSelectedAccountIndex] = useState<number | null>(null);
  const [recipientAddress, setRecipientAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [transferMessage, setTransferMessage] = useState<string>('');

  // Function to retrieve keypairs from AsyncStorage
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

  // Use effect to retrieve keys on component mount
  useEffect(() => {
    retrieveKeys();
  }, []);

  // Function to handle transfer of assets
  const transferAsset = async () => {
    if (selectedAccountIndex === null || !recipientAddress || !amount) {
      Alert.alert('Error', 'Please select an account, recipient address, and amount to transfer.');
      return;
    }

    const selectedAccount = keypairs[selectedAccountIndex];
    try {
      const response = await fetch('http://10.0.2.2:3001/transfer-asset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          publicKey: selectedAccount.publicKey,
          secret: selectedAccount.secret,
          recipient: recipientAddress,
          amount: Number(amount),
        }),
      });
      const data = await response.json();
      setTransferMessage(data.message);
    } catch (error) {
      console.error('Error transferring asset:', error);
      setTransferMessage('Error transferring asset.');
    }
  };

  // Function to switch between accounts
  const switchAccount = (index: number) => {
    setSelectedAccountIndex(index);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Transfer Asset</Text>

      {selectedAccountIndex !== null && keypairs[selectedAccountIndex] && (
        <View style={styles.keysContainer}>
          <Text style={styles.keyText}>Selected Account: {keypairs[selectedAccountIndex].publicKey}</Text>
        </View>
      )}

      <TextInput
        style={styles.input}
        placeholder="Recipient Address"
        value={recipientAddress}
        onChangeText={setRecipientAddress}
      />

      <TextInput
        style={styles.input}
        placeholder="Amount"
        value={amount}
        keyboardType="numeric"
        onChangeText={setAmount}
      />

      <TouchableOpacity style={styles.button} onPress={transferAsset}>
        <Text style={styles.buttonText}>Transfer Asset</Text>
      </TouchableOpacity>

      <Text style={styles.messageText}>{transferMessage}</Text>

      {keypairs.map((_, index) => (
        <View key={index} style={styles.accountContainer}>
          <TouchableOpacity 
            style={styles.switchButton} 
            onPress={() => switchAccount(index)}
          >
            <Text style={styles.buttonText}>Switch to Account {index + 1}</Text>
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
  keysContainer: {
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
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 5,
    padding: 10,
    marginVertical: 10,
  },
  button: {
    backgroundColor: '#00FFCC',
    padding: 10,
    borderRadius: 8,
    marginVertical: 10,
    alignItems: 'center',
  },
  switchButton: {
    flex: 1,
    backgroundColor: '#005f5f',
    padding: 10,
    borderRadius: 8,
    marginVertical: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#000000',
    fontWeight: 'bold',
  },
  messageText: {
    color: '#FFFFFF',
    marginBottom: 20,
    textAlign: 'center',
  },
  accountContainer: {
    marginBottom: 10,
  },
});

export default TransferAsset;
