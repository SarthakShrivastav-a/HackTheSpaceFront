import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CreateAccount: React.FC = () => {
  const [keypairs, setKeypairs] = useState<{ publicKey: string; secret: string }[]>([]);
  const [selectedAccountIndex, setSelectedAccountIndex] = useState<number | null>(null);
  const [fundingMessage, setFundingMessage] = useState<string>('');

  const storeKeys = async (newKeypair: { publicKey: string; secret: string }) => {
    try {
      const existingKeypairs = JSON.parse(await AsyncStorage.getItem('keypairs') || '[]');
      existingKeypairs.push(newKeypair);
      await AsyncStorage.setItem('keypairs', JSON.stringify(existingKeypairs));
      setKeypairs(existingKeypairs);
      setSelectedAccountIndex(existingKeypairs.length - 1);
    } catch (error) {
      console.error('Error storing keys:', error);
    }
  };

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

  useEffect(() => {
    retrieveKeys();
  }, []);

  const generateKeypair = async () => {
    try {
      const response = await fetch('http://10.0.2.2:3001/create-keypair', { method: 'POST' });
      const data = await response.json();
      await storeKeys({ publicKey: data.publicKey, secret: data.secret });
    } catch (error) {
      console.error('Error generating keypair:', error);
    }
  };

  const fundAccount = async () => {
    if (selectedAccountIndex === null) return;

    const publicKeyToFund = keypairs[selectedAccountIndex]?.publicKey; // Use optional chaining
    try {
      const response = await fetch('http://10.0.2.2:3001/fund-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publicKey: publicKeyToFund }),
      });
      const data = await response.json();
      setFundingMessage(data.message);
    } catch (error) {
      console.error('Error funding account:', error);
      setFundingMessage('Error funding account.');
    }
  };

  const switchAccount = (index: number) => {
    setSelectedAccountIndex(index);
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
              setSelectedAccountIndex(updatedKeypairs.length > 0 ? Math.min(0, updatedKeypairs.length - 1) : null);
            }
          },
        },
      ],
      { cancelable: false }
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Create Account</Text>

      {selectedAccountIndex !== null && keypairs[selectedAccountIndex] && (
        <View style={styles.keysContainer}>
          <Text style={styles.keyText}>Public Key: {keypairs[selectedAccountIndex].publicKey}</Text>
          <Text style={styles.keyText}>Secret Key: {keypairs[selectedAccountIndex].secret}</Text>
          <TouchableOpacity style={styles.button} onPress={fundAccount}>
            <Text style={styles.buttonText}>Fund Account</Text>
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity style={styles.button} onPress={generateKeypair}>
        <Text style={styles.buttonText}>Generate Keypair</Text>
      </TouchableOpacity>

      <Text style={styles.messageText}>{fundingMessage}</Text>

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
  messageText: {
    color: '#FFFFFF',
    marginBottom: 20,
    textAlign: 'center',
  },
  accountContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
});

export default CreateAccount;