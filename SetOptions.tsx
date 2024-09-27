import { useLayoutEffect } from 'react';
import { StackNavigationOptions, StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';

type SetOptionsProps = {
  navigation: StackNavigationProp<any>;
  route: RouteProp<any>;
  title: string;
};

const setOptions = ({ navigation, route, title }: SetOptionsProps): void => {
  useLayoutEffect(() => {
    navigation.setOptions({
      title: title,
      headerStyle: {
        backgroundColor: '#f4511e',
      },
      headerTintColor: '#fff',
      headerTitleStyle: {
        fontWeight: 'bold',
      },
    });
  }, [navigation, route, title]);
};

export default setOptions;
