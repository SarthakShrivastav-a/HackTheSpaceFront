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

  // Retrieve stored key pairs from AsyncStorage
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

  // Fetch balance for the selected public key
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

  // Fetch transactions for the selected public key
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

  // Switch to a different account
  const switchAccount = (index: number) => {
    if (index >= 0 && index < keypairs.length) {
      setSelectedAccountIndex(index);
    }
  };

  // Remove an account from the stored key pairs
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

  // Render each transaction item
  const renderTransactionItem = ({ item }: any) => (
    <View style={styles.transactionItem}>
      <Text style={styles.transactionText}>Transaction ID: {item.id}</Text>
      <Text style={styles.transactionText}>Amount: {item.amount || item.transaction_amount}</Text>
      <Text style={styles.transactionText}>Date: {item.created_at}</Text>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
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

          {/* Section for account information */}
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

          {/* Render account switching buttons */}
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

          {/* Section for listed NFTs */}
          <View style={styles.nftSection}>
            <Text style={styles.sectionTitle}>Listed NFTs</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.nftScrollView}
            >
              {/* Sample NFTs */}
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
              ].map((nft, index) => (
                <View key={index} style={styles.nftCard}>
                  <Image source={{ uri: nft.image }} style={styles.nftImage} />
                  <Text style={styles.nftName}>{nft.name}</Text>
                  <Text style={styles.nftPrice}>{nft.price}</Text>
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
  coverImage: {
    width: '100%',
    height: 100,
    resizeMode: 'cover',
  },
  profileContainer: {
    padding: 20,
  },
  profileImageView: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  nameAndBioView: {
    alignItems: 'center',
    marginBottom: 20,
  },
  userFullName: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  userBio: {
    fontSize: 16,
    color: '#555', // Dark grey for the bio
  },
  countsView: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  countView: {
    alignItems: 'center',
  },
  countNum: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  countText: {
    fontSize: 14,
    color: '#777', // Medium grey for count text
  },
  interactButtonsView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  interactButtonEdit: {
    backgroundColor: '#007BFF', // Primary color
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginRight: 5,
  },
  interactButtonShare: {
    backgroundColor: '#28A745', // Secondary color
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginLeft: 5,
  },
  interactButtonText: {
    color: '#FFFFFF', // White text color
    textAlign: 'center',
  },
  interactButtonTextShare: {
    color: '#FFFFFF', // White text color
    textAlign: 'center',
  },
  selectedAccountContainer: {
    padding: 15,
    backgroundColor: '#F9F9F9', // Light grey for the account container
    borderRadius: 5,
    marginVertical: 10,
  },
  keyText: {
    fontSize: 14,
    color: '#555', // Dark grey for key text
    marginBottom: 5,
  },
  transactionHeading: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 15,
  },
  transactionList: {
    marginBottom: 20,
  },
  transactionItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc', // Light grey for the transaction divider
  },
  transactionText: {
    fontSize: 14,
    color: '#333', // Dark grey for transaction text
  },
  accountContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
  },
  switchButton: {
    backgroundColor: '#007BFF', // Primary color
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginRight: 5,
  },
  removeButton: {
    backgroundColor: '#FF4D4D', // Red for remove button
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginLeft: 5,
  },
  buttonText: {
    color: '#FFFFFF', // White text color
    textAlign: 'center',
  },
  nftSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  nftScrollView: {
    paddingVertical: 10,
  },
  nftCard: {
    width: 120,
    borderWidth: 1,
    borderColor: '#ddd', // Light grey for border
    borderRadius: 8,
    marginRight: 10,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF', // White for the card background
    elevation: 1,
  },
  nftImage: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
  },
  nftName: {
    fontSize: 14,
    fontWeight: 'bold',
    padding: 5,
  },
  nftPrice: {
    fontSize: 12,
    color: '#777', // Medium grey for price text
    paddingBottom: 5,
  },
});
