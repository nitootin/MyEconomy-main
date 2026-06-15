import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, Text, View } from "react-native";
import Button from "../../components/Button";
import Input from "../../components/Input";
import { AuthStackParamList } from "../../navigation/AuthNavigator";
import { useAuthStore } from "../../stores/authStore";

type Props = NativeStackScreenProps<AuthStackParamList, "SignIn">;

export default function SignInScreen({ navigation }: Props) {
  const signin = useAuthStore((state) => state.signin);
  const isLoading = useAuthStore((state) => state.isLoading);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSignin() {
    const result = await signin({ email, password });

    if (!result.success) {
      Alert.alert("Não foi possível entrar", result.error);
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      className="flex-1 bg-slate-50"
    >
      <View className="flex-1 justify-center px-6">
        <View className="mb-10">
          <Text className="text-3xl font-bold text-slate-950">MYeconomy</Text>
          <Text className="mt-2 text-base text-slate-600">
            Entre para acompanhar sua vida financeira.
          </Text>
        </View>

        <View className="gap-4">
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
            placeholder="Sua senha"
            secureTextEntry
            value={password}
          />
          <Button title="Entrar" onPress={handleSignin} loading={isLoading} />
          <Button
            title="Criar conta"
            onPress={() => navigation.navigate("SignUp")}
            variant="secondary"
          />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
