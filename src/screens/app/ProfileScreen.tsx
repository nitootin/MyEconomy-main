import { Text, View } from "react-native";
import Button from "../../components/Button";
import { useAuthStore } from "../../stores/authStore";

export default function ProfileScreen() {
  const user = useAuthStore((state) => state.getCurrentUser());
  const signout = useAuthStore((state) => state.signout);

  return (
    <View className="flex-1 bg-slate-50 px-6 pt-16">
      <Text className="text-3xl font-bold text-slate-950">Meus Dados</Text>
      <Text className="mt-3 text-base text-slate-600">
        Informações cadastradas na sua conta.
      </Text>

      <View className="mt-8 gap-4 rounded-lg border border-slate-200 bg-white p-5">
        <View>
          <Text className="text-sm font-medium text-slate-500">Nome</Text>
          <Text className="mt-1 text-base font-semibold text-slate-950">
            {user?.name}
          </Text>
        </View>

        <View>
          <Text className="text-sm font-medium text-slate-500">E-mail</Text>
          <Text className="mt-1 text-base font-semibold text-slate-950">
            {user?.email}
          </Text>
        </View>

        <View>
          <Text className="text-sm font-medium text-slate-500">
            Data de nascimento
          </Text>
          <Text className="mt-1 text-base font-semibold text-slate-950">
            {user?.birthDate}
          </Text>
        </View>
      </View>

      <View className="mt-6">
        <Button title="Sair" onPress={signout} variant="danger" />
      </View>
    </View>
  );
}
