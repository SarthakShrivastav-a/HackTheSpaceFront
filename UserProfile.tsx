import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  Animated,
  FlatList,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

// Using the Animated API for a subtle shadow effect
const AnimatedView = Animated.createAnimatedComponent(View);

export default function Profile() {
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
      const publicKey = keypairs[selectedAccountIndex]?.publicKey;
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
              setBalance(null);
              setTransactions([]);
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
      <ScrollView showsVerticalScrollIndicator={false}>
        <View>
          <Image
            style={styles.coverImage}
            source={{
              uri: 'https://res.cloudinary.com/uf-551409/image/upload/v1713548725/itemeditorimage_6622abe5943c8-1915626.jpg',
            }}
          />
          <View style={styles.profileContainer}>
            <AnimatedView style={styles.profileImageView}>
              <Image
                style={styles.profileImage}
                source={{
                  uri: 'https://i.pinimg.com/originals/13/5a/93/135a939b222bfc2e5e1b50a75f3de521.jpg',
                }}
              />
            </AnimatedView>
            <View style={styles.nameAndBioView}>
              <Text style={styles.userFullName}>{'Annepu Sagar'}</Text>
              <Text style={styles.userBio}>{'Digital artist and NFT creator'}</Text>
            </View>
            <View style={styles.countsView}>
              <View style={styles.countView}>
                <Text style={styles.countNum}>58</Text>
                <Text style={styles.countText}>NFTs</Text>
              </View>
              <View style={styles.countView}>
                <Text style={styles.countNum}>1246</Text>
                <Text style={styles.countText}>Followers</Text>
              </View>
              <View style={styles.countView}>
                <Text style={styles.countNum}>348</Text>
                <Text style={styles.countText}>Following</Text>
              </View>
            </View>
            <View style={styles.interactButtonsView}>
              <TouchableOpacity style={styles.interactButtonEdit}>
                <Text style={styles.interactButtonText}>Edit Profile</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.interactButtonShare}>
                <Text style={styles.interactButtonTextShare}>Share Profile</Text>
              </TouchableOpacity>
            </View>
          </View>

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

          <View style={styles.nftSection}>
            <Text style={styles.sectionTitle}>Listed NFTs</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.nftScrollView}
            >
              {[
                {
                  name: 'FunkyApe',
                  image: 'https://d1don5jg7yw08.cloudfront.net/800x800/nft-images/20220419/Funkyapes_46_1650340513820.jpg',
                  price: '1.5 ETH',
                },
                {
                  name: 'TravisScott',
                  image: 'https://dl.openseauserdata.com/cache/originImage/files/e3ac76b414b460413563607adf454125.jpg',
                  price: '1.8 ETH',
                },
                {
                  name: 'KanyeWest',
                  image: 'https://th.bing.com/th/id/OIP.1mx8JikM-_JvpcHo0GZm2gHaHa?rs=1&pid=ImgDetMain',
                  price: '2.0 ETH',
                },
                {
                  name: 'TaylorSwift',
                  image: 'https://th.bing.com/th/id/OIP.oYbV_nvJSG_ZMPJYLbJWWgHaJ4?rs=1&pid=ImgDetMain',
                  price: '1.7 ETH',
                },
                {
                  name: 'KendrickLamar',
                  image: 'https://mir-s3-cdn-cf.behance.net/project_modules/1400_opt_1/983397128352755.615f07f01669e.jpg',
                  price: '2.5 ETH',
                },
              ].map((item, index) => (
                <View key={index} style={styles.nftCard}>
                  <Image source={{ uri: item.image }} style={styles.nftImage} />
                  <Text style={styles.nftName}>{item.name}</Text>
                  <Text style={styles.nftPrice}>{item.price}</Text>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f6f8',
  },
  coverImage: {
    width: '100%',
    height: 200,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  profileContainer: {
    alignItems: 'center',
    paddingTop: -60,
    paddingBottom: 30,
    backgroundColor: '#fff',
    marginTop: -60,
    borderRadius: 30,
    marginHorizontal: 20,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  profileImageView: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  nameAndBioView: {
    alignItems: 'center',
    marginTop: 15,
  },
  userFullName: {
    fontSize: 22,
    fontWeight: '600',
    color: '#333',
  },
  userBio: {
    fontSize: 16,
    color: '#777',
    marginVertical: 5,
    textAlign: 'center',
    paddingHorizontal: 30,
  },
  countsView: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 20,
  },
  countView: {
    alignItems: 'center',
  },
  countNum: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  countText: {
    fontSize: 14,
    color: '#888',
  },
  interactButtonsView: {
    flexDirection: 'row',
    marginTop: 20,
  },
  interactButtonEdit: {
    backgroundColor: '#4b79ff',
    borderRadius: 30,
    paddingVertical: 8,
    paddingHorizontal: 20,
    marginHorizontal: 10,
  },
  interactButtonShare: {
    backgroundColor: '#ddd',
    borderRadius: 30,
    paddingVertical: 8,
    paddingHorizontal: 20,
    marginHorizontal: 10,
  },
  interactButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  interactButtonTextShare: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
  selectedAccountContainer: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginHorizontal: 20,
    marginVertical: 15,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  keyText: {
    fontSize: 16,
    color: '#444',
    marginVertical: 5,
  },
  transactionHeading: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginLeft: 20,
    marginTop: 20,
  },
  transactionList: {
    marginTop: 10,
    paddingHorizontal: 20,
  },
  transactionItem: {
    backgroundColor: '#f9f9f9',
    borderRadius: 15,
    padding: 15,
    marginVertical: 8,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  transactionText: {
    fontSize: 14,
    color: '#555',
  },
  accountContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginVertical: 10,
    borderRadius: 10,
    backgroundColor: '#fff',
    padding: 15,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  switchButton: {
    backgroundColor: '#4b79ff',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5,
  },
  removeButton: {
    backgroundColor: '#ff4b4b',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5,
  },
  buttonText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
  nftSection: {
    marginHorizontal: 20,
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  nftScrollView: {
    flexDirection: 'row',
  },
  nftCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginRight: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  nftImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
    marginBottom: 10,
  },
  nftName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  nftPrice: {
    fontSize: 12,
    color: '#777',
  },
});
