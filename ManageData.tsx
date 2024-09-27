import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';

const ManageData: React.FC = () => {
  const [senderSecret, setSenderSecret] = useState<string>('');
  const [key, setKey] = useState<string>('');
  const [value, setValue] = useState<string>('');
  const [manageDataMessage, setManageDataMessage] = useState<string>('');

  const manageData = async () => {
    console.log('Manage Data button clicked');
    try {
      const response = await fetch('http://10.0.2.2:3001/manage-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderSecret,
          key,
          value,
        }),
      });
      const data = await response.json();
      console.log('Data managed:', data);
      setManageDataMessage(data.message);
    } catch (error) {
      console.error('Error managing data:', error);
      setManageDataMessage('Error managing data.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Manage Data</Text>
      <TextInput
        style={styles.input}
        placeholder="Sender Secret Key"
        value={senderSecret}
        onChangeText={setSenderSecret}
      />
      <TextInput
        style={styles.input}
        placeholder="Key"
        value={key}
        onChangeText={setKey}
      />
      <TextInput
        style={styles.input}
        placeholder="Value"
        value={value}
        onChangeText={setValue}
      />
      <Button title="Manage Data" onPress={manageData} />
      <Text>{manageDataMessage}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20 },
  heading: { fontSize: 24, marginBottom: 20 },
  input: { height: 40, borderColor: 'gray', borderWidth: 1, marginBottom: 10, paddingLeft: 8 }
});

export default ManageData;
