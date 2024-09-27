import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';

const Payments: React.FC = () => {
  const [senderSecret, setSenderSecret] = useState<string>('');
  const [receiverPublicKey, setReceiverPublicKey] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [paymentMessage, setPaymentMessage] = useState<string>('');

  const makePayment = async () => {
    console.log('Make Payment button clicked');
    try {
      const response = await fetch('http://10.0.2.2:3001/make-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderSecret,
          receiverPublicKey,
          amount,
        }),
      });
      const data = await response.json();
      console.log('Payment made:', data);
      setPaymentMessage(data.message);
    } catch (error) {
      console.error('Error making payment:', error);
      setPaymentMessage('Error making payment.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Payments</Text>
      <TextInput
        style={styles.input}
        placeholder="Sender Secret Key"
        value={senderSecret}
        onChangeText={setSenderSecret}
      />
      <TextInput
        style={styles.input}
        placeholder="Receiver Public Key"
        value={receiverPublicKey}
        onChangeText={setReceiverPublicKey}
      />
      <TextInput
        style={styles.input}
        placeholder="Amount"
        value={amount}
        onChangeText={setAmount}
      />
      <Button title="Make Payment" onPress={makePayment} />
      <Text>{paymentMessage}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20 },
  heading: { fontSize: 24, marginBottom: 20 },
  input: { height: 40, borderColor: 'gray', borderWidth: 1, marginBottom: 10, paddingLeft: 8 }
});

export default Payments;
