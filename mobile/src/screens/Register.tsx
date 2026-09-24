import React, { useState, useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const Register = ({ navigation }: any) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useContext(AuthContext);
  const { theme } = useContext(ThemeContext);

  const handleRegister = async () => {
    setErrorMessage('');
    setIsLoading(true);
    try {
      if (!name || !email || !password) {
        setErrorMessage('Please fill all fields');
        setIsLoading(false);
        return;
      }
      await register(name, email, password);
    } catch (e: any) {
      setErrorMessage(e.response?.data?.error || 'Network error: Could not reach the backend.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background, padding: theme.spacing.xl }]}>
      <Text style={[styles.title, { color: theme.colors.text, fontFamily: theme.typography.family.primaryBold, fontSize: theme.typography.size.h1, marginBottom: theme.spacing.xxl }]}>Create Account</Text>
      
      {errorMessage ? (
        <Text style={{ color: theme.colors.error, fontFamily: theme.typography.family.primaryMedium, textAlign: 'center', marginBottom: theme.spacing.lg }}>{errorMessage}</Text>
      ) : null}
      
      <Input
        label="Name"
        value={name}
        onChangeText={setName}
      />
      <Input
        label="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <Input
        label="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      
      <Button 
        title="Register"
        variant="primary"
        loading={isLoading}
        onPress={handleRegister}
        style={{ marginTop: theme.spacing.md }}
      />
      
      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={[styles.link, { color: theme.colors.primary, fontFamily: theme.typography.family.primaryMedium, fontSize: theme.typography.size.body, marginTop: theme.spacing.xl }]}>Already have an account? Login</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    textAlign: 'center',
  },
  link: {
    textAlign: 'center',
  },
});

export default Register;
