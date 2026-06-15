// components/Auth/InputField.tsx
import { Ionicons } from '@expo/vector-icons';
import React, { forwardRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Colors } from '../../constants/colors';

interface InputFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  placeholder?: string;
  iconName?: keyof typeof Ionicons.glyphMap;
  secureTextEntry?: boolean;
  returnKeyType?: 'done' | 'next' | 'go' | 'search' | 'send';
  onSubmitEditing?: () => void;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  keyboardType?: 'default' | 'numeric' | 'email-address' | 'phone-pad';
  maxLength?: number;
  multiline?: boolean;
  numberOfLines?: number;
}

export const InputField = forwardRef<TextInput, InputFieldProps>(
  (
    {
      label,
      value,
      onChangeText,
      error,
      placeholder,
      iconName,
      secureTextEntry = false,
      returnKeyType = 'done',
      onSubmitEditing,
      autoCapitalize = 'sentences',
      keyboardType = 'default',
      maxLength,
      multiline = false,
      numberOfLines = 1,
    },
    ref
  ) => {
    const [isPasswordVisible, setIsPasswordVisible] = React.useState(false);

    const togglePasswordVisibility = () => {
      setIsPasswordVisible(!isPasswordVisible);
    };

    const isSecure = secureTextEntry && !isPasswordVisible;

    return (
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>{label} *</Text>
        <View
          style={[
            styles.inputContainer,
            error && styles.inputContainerError,
          ]}
        >
          {iconName && (
            <Ionicons
              name={iconName}
              size={20}
              color={error ? Colors.error : Colors.whiteFaint}
              style={styles.leftIcon}
            />
          )}
          <TextInput
            ref={ref}
            style={[
              styles.textInput,
              multiline && styles.textArea,
              iconName && { paddingLeft: 36 },
              secureTextEntry && { paddingRight: 36 },
            ]}
            placeholder={placeholder}
            placeholderTextColor={Colors.whiteFaint}
            value={value}
            onChangeText={onChangeText}
            secureTextEntry={isSecure}
            returnKeyType={returnKeyType}
            onSubmitEditing={onSubmitEditing}
            autoCapitalize={autoCapitalize}
            keyboardType={keyboardType}
            maxLength={maxLength}
            multiline={multiline}
            numberOfLines={multiline ? numberOfLines : 1}
          />
          {secureTextEntry && (
            <TouchableOpacity
              onPress={togglePasswordVisibility}
              style={styles.rightIcon}
            >
              <Ionicons
                name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color={Colors.whiteFaint}
              />
            </TouchableOpacity>
          )}
        </View>
        {error && <Text style={styles.errorText}>{error}</Text>}
      </View>
    );
  }
);

InputField.displayName = 'InputField';

const styles = StyleSheet.create({
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    color: Colors.whiteMuted,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    position: 'relative',
  },
  inputContainerError: {
    borderColor: Colors.error,
  },
  leftIcon: {
    position: 'absolute',
    left: 12,
    zIndex: 1,
  },
  rightIcon: {
    position: 'absolute',
    right: 12,
    padding: 4,
  },
  textInput: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: Colors.white,
    fontSize: 15,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  errorText: {
    color: Colors.error,
    fontSize: 12,
    marginTop: 4,
    marginLeft: 6,
  },
});