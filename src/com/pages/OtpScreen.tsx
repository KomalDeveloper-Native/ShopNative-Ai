import React, { useEffect, useRef, useState } from 'react';
import {
  NativeSyntheticEvent,
  DeviceEventEmitter,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TextInputKeyPressEventData,
  View,
} from 'react-native';
import { width, height, totalSize } from 'react-native-dimension';
import { colors } from '../theme/color';
import { fonts } from '../assets/fonts/fonts';
import { postMethod } from '../utils/Auth/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-simple-toast';
import { CommonActions } from '@react-navigation/native';
import type {
  RootNavigationProp,
  RootRouteProp,
} from '../../types/navigationTypes';
import GradientButton from '../../components/GradientButton';

const OTP_LENGTH = 6;

type OtpScreenProps = {
  navigation: RootNavigationProp<'Otp'>;
  route: RootRouteProp<'Otp'>;
};

const OtpScreen = ({ navigation, route }: OtpScreenProps) => {
  const { user } = route.params;
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [timer, setTimer] = useState<number>(30);
  const inputs = useRef<Array<TextInput | null>>([]);

  useEffect(() => {
    if (timer === 0) return;

    const interval = setInterval(() => {
      setTimer(prev => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  const handleChange = (text: string, index: number) => {
    const newOtp = [...otp];

   
    if (text === '') {
      newOtp[index] = '';
      setOtp(newOtp);
      return;
    }

    if (!/^\d$/.test(text)) return;

    newOtp[index] = text;
    setOtp(newOtp);

    if (index < OTP_LENGTH - 1) {
      inputs.current[index + 1]?.focus();
    }
  };


  const handleKeyPress = (
    e: NativeSyntheticEvent<TextInputKeyPressEventData>,
    index: number,
  ) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const isOtpComplete = otp.every(d => d !== '');

const verifyOtp = async () => {
  try {
    const otpValue = otp.join('');
    const res = await postMethod('/verify_otp.php', {
      userid: user.userid,
      otp: otpValue,
    });


    if (res?.status === true) {
      await AsyncStorage.setItem('userDetails', String(res.token));
      await AsyncStorage.setItem(
        'shopNativeSession',
        JSON.stringify({
          provider: 'otp',
          token: String(res.token),
          signedInAt: new Date().toISOString(),
        }),
      );
      DeviceEventEmitter.emit('authSessionChanged');

 navigation.dispatch(
  CommonActions.reset({
    index: 0,
    routes: [{ name: 'Home' }],
  }))

    } else {
      Toast.show(
        res?.message || 'Invalid OTP',
        Toast.SHORT
      );
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'OTP verification failed';
    Toast.show(message, Toast.SHORT);
  }
};


  const resendOtp = () => {
    setOtp(Array(OTP_LENGTH).fill(''));
    setTimer(30);
    inputs.current[0]?.focus();
    verifyOtp()
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Verify OTP</Text>
      <Text style={styles.subTitle}>
        Enter the 6-digit code sent to your number
      </Text>

      <View style={styles.otpRow}>
        {otp.map((digit, index) => (
          <TextInput
            key={index}
            ref={ref => {
              inputs.current[index] = ref;
            }}
            style={[styles.otpInput, digit && styles.activeInput]}
            keyboardType="number-pad"
            textContentType="oneTimeCode"
            textAlign="center"
            maxLength={1}
            autoFocus={index === 0}
            value={digit}
            onChangeText={text => handleChange(text, index)}
            onKeyPress={e => handleKeyPress(e, index)}
          />
        ))}
      </View>

      <GradientButton
        title="Verify"
        disabled={!isOtpComplete}
        onPress={verifyOtp}
        style={styles.btn}
      />

      <Pressable disabled={timer !== 0} onPress={resendOtp}>
        <Text style={styles.resend}>
          {timer === 0 ? 'Resend OTP' : `Resend in ${timer}s`}
        </Text>
      </Pressable>
    </View>
  );
};

export default OtpScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingTop: height(10),
  },
  title: {
    fontSize: totalSize(3),
    fontFamily: fonts.bold,
    marginBottom: 10,
  },
  subTitle: {
    fontSize: totalSize(1.6),
    color: colors.gray,
    marginBottom: 30,
  },
  otpRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 30,
  },
  otpInput: {
    width: width(12),
    height: width(12),
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.gray,
    textAlign: 'center',
    fontSize: totalSize(2.2),
    fontFamily: fonts.medium,
    color: colors.black,
    backgroundColor: colors.white,
  },
  activeInput: {
    borderColor: colors.primaryColor,
  },
  btn: {
    width: width(80),
    height: height(6.5),
    borderRadius: 10,
    marginBottom: 20,
  },
  resend: {
    color: colors.secondaryColor,
    fontSize: totalSize(1.6),
  },
});
