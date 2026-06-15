import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Button from "../../components/Button";
import Input from "../../components/Input";
import { AuthStackParamList } from "../../navigation/AuthNavigator";
import { useAuthStore } from "../../stores/authStore";

type Props = NativeStackScreenProps<AuthStackParamList, "SignUp">;

export default function SignUpScreen({ navigation }: Props) {
  const signup = useAuthStore((state) => state.signup);
  const isLoading = useAuthStore((state) => state.isLoading);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [pickerDate, setPickerDate] = useState(new Date(2000, 0, 1));
  const [showPicker, setShowPicker] = useState(false);

  function formatDate(date: Date): string {
    const d = String(date.getDate()).padStart(2, "0");
    const m = String(date.getMonth() + 1).padStart(2, "0");
    return `${d}/${m}/${date.getFullYear()}`;
  }

  function onDateChange(event: DateTimePickerEvent, selected?: Date) {
    if (Platform.OS === "android") {
      setShowPicker(false);
      if (event.type === "set" && selected) {
        setPickerDate(selected);
        setBirthDate(formatDate(selected));
      }
    } else {
      if (selected) setPickerDate(selected);
    }
  }

  function confirmIOSDate() {
    setBirthDate(formatDate(pickerDate));
    setShowPicker(false);
  }

  async function handleSignup() {
    const result = await signup({
      name,
      email,
      password,
      confirmPassword,
      birthDate,
    });

    if (!result.success) {
      Alert.alert("Não foi possível cadastrar", result.error);
      return;
    }

    Alert.alert("Conta criada", "Agora você já pode fazer login.");
    navigation.navigate("SignIn");
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      className="flex-1 bg-slate-50"
    >
      <View className="flex-1 justify-center px-6">
        <View className="mb-8">
          <Text className="text-3xl font-bold text-slate-950">Criar conta</Text>
          <Text className="mt-2 text-base text-slate-600">
            Cadastre seus dados para acessar o MYeconomy.
          </Text>
        </View>

        <View className="gap-4">
          <Input
            label="Nome"
            onChangeText={setName}
            placeholder="Seu nome"
            value={name}
          />
          <Input
            autoCapitalize="none"
            keyboardType="email-address"
            label="E-mail"
            onChangeText={setEmail}
            placeholder="seuemail@exemplo.com"
            value={email}
          />
          <Input
            label="Senha"
            onChangeText={setPassword}
            placeholder="Crie uma senha"
            secureTextEntry
            value={password}
          />
          <Input
            label="Confirmar senha"
            onChangeText={setConfirmPassword}
            placeholder="Repita a senha"
            secureTextEntry
            value={confirmPassword}
          />

          <View className="gap-2">
            <Text className="text-sm font-medium text-slate-700">
              Data de nascimento
            </Text>
            <TouchableOpacity
              className="h-12 rounded-lg border border-slate-300 bg-white px-4 justify-center"
              activeOpacity={0.7}
              onPress={() => setShowPicker(true)}
            >
              <Text
                className={
                  birthDate ? "text-base text-slate-900" : "text-base text-slate-400"
                }
              >
                {birthDate || "DD/MM/AAAA"}
              </Text>
            </TouchableOpacity>
          </View>

          {showPicker && (
            <>
              <DateTimePicker
                value={pickerDate}
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={onDateChange}
                maximumDate={new Date()}
                locale="pt-BR"
              />
              {Platform.OS === "ios" && (
                <Button title="Confirmar data" onPress={confirmIOSDate} />
              )}
            </>
          )}

          <Button title="Cadastrar" onPress={handleSignup} loading={isLoading} />
          <Button
            title="Voltar para login"
            onPress={() => navigation.goBack()}
            variant="secondary"
          />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
