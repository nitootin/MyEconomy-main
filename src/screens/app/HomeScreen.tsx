import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import Button from "../../components/Button";
import Card from "../../components/Card";
import EmptyState from "../../components/EmptyState";
import ProgressBar from "../../components/ProgressBar";
import type { AppTabParamList } from "../../navigation/AppTabs";
import { useAuthStore } from "../../stores/authStore";
import { useFinanceStore } from "../../stores/financeStore";
import { MonthlySummary } from "../../types/Finance";

export default function HomeScreen() {
  const user = useAuthStore((state) => state.getCurrentUser());
  const currentMonthRef = getCurrentMonthRef();
  const [selectedMonth, setSelectedMonth] = useState(currentMonthRef);
  const isPastMonth = selectedMonth < currentMonthRef;

  const summary = useFinanceStore((state) =>
    state.getMonthlySummary(user?.id ?? "", selectedMonth)
  );
  const progressPercentage = Math.round(summary.progress * 100);

  return (
    <ScrollView
      className="flex-1 bg-slate-50"
      contentContainerClassName="px-6 pb-8 pt-16"
      showsVerticalScrollIndicator={false}
    >
      <View className="flex-row items-start justify-between">
        <View className="flex-1 mr-4">
          <Text className="text-3xl font-bold text-slate-950">Home</Text>
          <Text className="mt-3 text-base leading-6 text-slate-600">
            Visão geral de {getFirstName(user?.name)} em{" "}
            {formatMonth(selectedMonth)}.
          </Text>
        </View>
        <MonthNavigator
          monthRef={selectedMonth}
          maxMonthRef={currentMonthRef}
          onPrev={() => setSelectedMonth(prevMonth(selectedMonth))}
          onNext={() => setSelectedMonth(nextMonth(selectedMonth))}
        />
      </View>

      <View className="mt-8 gap-4">
        <MonthlyTotalCard total={summary.totalExpenses} />

        <View className="flex-row gap-4">
          <SummaryInfoCard
            label="Limite mensal"
            value={summary.limit === null ? "--" : formatCurrency(summary.limit)}
          />
          <SummaryInfoCard
            isDanger={summary.status === "over-limit"}
            label="Saldo"
            value={
              summary.balance === null ? "--" : formatCurrency(summary.balance)
            }
          />
        </View>

        <Card>
          <View className="mb-4 flex-row items-center justify-between">
            <View className="flex-1 mr-3">
              <Text className="text-base font-semibold text-slate-950">
                Uso do limite
              </Text>
              <Text className="mt-1 text-sm text-slate-500">
                {summary.limit === null
                  ? summary.totalExpenses > 0
                    ? "Despesas registradas — sem limite definido."
                    : "Cadastre um limite para acompanhar."
                  : `${progressPercentage}% utilizado`}
              </Text>
            </View>
            <View
              className={`rounded-lg px-3 py-2 ${
                summary.status === "over-limit"
                  ? "bg-red-50"
                  : summary.status === "without-limit"
                  ? "bg-slate-100"
                  : "bg-brand-50"
              }`}
            >
              <Text
                className={`text-sm font-semibold ${
                  summary.status === "over-limit"
                    ? "text-red-600"
                    : summary.status === "without-limit"
                    ? "text-slate-500"
                    : "text-brand-700"
                }`}
              >
                {summary.limit === null ? "Sem limite" : `${progressPercentage}%`}
              </Text>
            </View>
          </View>

          <ProgressBar progress={summary.progress} status={summary.status} />
        </Card>

        {isPastMonth && summary.status !== "without-limit" ? (
          <OutcomeCard summary={summary} />
        ) : (
          <StatusCard summary={summary} isPastMonth={isPastMonth} />
        )}

        {summary.expensesCount === 0 ? (
          <EmptyState
            description="Quando as despesas forem cadastradas, elas aparecerão no resumo deste mês."
            title="Nenhuma despesa cadastrada"
          />
        ) : (
          <Card>
            <Text className="text-base font-semibold text-slate-950">
              Despesas registradas
            </Text>
            <Text className="mt-2 text-sm leading-5 text-slate-500">
              {summary.expensesCount} lançamento
              {summary.expensesCount > 1 ? "s" : ""} no mês.
            </Text>
          </Card>
        )}
      </View>
    </ScrollView>
  );
}

type MonthNavigatorProps = {
  monthRef: string;
  maxMonthRef: string;
  onPrev: () => void;
  onNext: () => void;
};

function MonthNavigator({
  monthRef,
  maxMonthRef,
  onPrev,
  onNext,
}: MonthNavigatorProps) {
  const canGoNext = monthRef < maxMonthRef;
  return (
    <View className="flex-row items-center gap-1 mt-1">
      <TouchableOpacity
        className="h-8 w-8 items-center justify-center rounded-lg bg-slate-100"
        onPress={onPrev}
        activeOpacity={0.7}
      >
        <Ionicons name="chevron-back-outline" size={16} color="#475569" />
      </TouchableOpacity>
      <Text className="w-24 text-center text-xs font-medium text-slate-600">
        {formatMonthNav(monthRef)}
      </Text>
      <TouchableOpacity
        className={`h-8 w-8 items-center justify-center rounded-lg bg-slate-100 ${!canGoNext ? "opacity-30" : ""}`}
        onPress={onNext}
        disabled={!canGoNext}
        activeOpacity={0.7}
      >
        <Ionicons name="chevron-forward-outline" size={16} color="#475569" />
      </TouchableOpacity>
    </View>
  );
}

type SummaryInfoCardProps = {
  label: string;
  value: string;
  isDanger?: boolean;
};

function SummaryInfoCard({
  label,
  value,
  isDanger = false,
}: SummaryInfoCardProps) {
  return (
    <Card className="flex-1">
      <Text className="text-sm font-medium text-slate-500">{label}</Text>
      <Text
        className={`mt-2 text-xl font-bold ${
          isDanger ? "text-red-600" : "text-slate-950"
        }`}
      >
        {value}
      </Text>
    </Card>
  );
}

function MonthlyTotalCard({ total }: { total: number }) {
  return (
    <Card>
      <View className="flex-row items-center justify-between">
        <View>
          <Text className="text-sm font-medium text-slate-500">
            Total gasto no mês
          </Text>
          <Text className="mt-2 text-3xl font-bold text-slate-950">
            {formatCurrency(total)}
          </Text>
        </View>
        <View className="h-12 w-12 items-center justify-center rounded-lg bg-brand-50">
          <Ionicons name="wallet-outline" size={24} color="#059669" />
        </View>
      </View>
    </Card>
  );
}

function OutcomeCard({ summary }: { summary: MonthlySummary }) {
  const saved = summary.status === "saved";
  return (
    <Card>
      <View className="items-center py-6">
        <View
          className={`mb-5 h-36 w-36 items-center justify-center rounded-full ${
            saved ? "bg-brand-50" : "bg-red-50"
          }`}
        >
          <Ionicons
            name={saved ? "happy-outline" : "sad-outline"}
            size={80}
            color={saved ? "#059669" : "#dc2626"}
          />
        </View>
        <Text
          className={`text-xl font-bold ${
            saved ? "text-brand-700" : "text-red-600"
          }`}
        >
          {saved ? "Parabéns!" : "Não foi dessa vez..."}
        </Text>
        <Text
          className={`mt-1 text-base font-semibold ${
            saved ? "text-brand-600" : "text-red-500"
          }`}
        >
          {saved ? "Você economizou neste mês!" : "Você passou do limite"}
        </Text>
        <Text className="mt-3 px-4 text-center text-sm leading-5 text-slate-500">
          {saved
            ? `Você ficou ${formatCurrency(summary.balance ?? 0)} abaixo do limite. Continue assim!`
            : `Você gastou ${formatCurrency(
                Math.abs(summary.balance ?? 0)
              )} a mais do que o planejado. Tente melhorar no próximo mês!`}
        </Text>
      </View>
    </Card>
  );
}

function StatusCard({
  summary,
  isPastMonth,
}: {
  summary: MonthlySummary;
  isPastMonth: boolean;
}) {
  const navigation = useNavigation<BottomTabNavigationProp<AppTabParamList>>();

  if (summary.status === "without-limit") {
    return (
      <Card>
        <View className="flex-row">
          <Ionicons name="alert-circle-outline" size={24} color="#64748b" />
          <View className="ml-3 flex-1">
            <Text className="text-base font-semibold text-slate-950">
              {isPastMonth
                ? "Nenhum progresso encontrado"
                : "Ainda não há limite cadastrado"}
            </Text>
            <Text className="mt-1 text-sm leading-5 text-slate-500">
              {isPastMonth
                ? "Nenhum limite foi cadastrado para este mês."
                : "Cadastre um limite mensal para saber se você economizou ou passou do valor planejado."}
            </Text>
            {!isPastMonth && (
              <View className="mt-3">
                <Button
                  title="Cadastrar limite"
                  onPress={() => navigation.navigate("Limit")}
                />
              </View>
            )}
          </View>
        </View>
      </Card>
    );
  }

  if (summary.status === "over-limit") {
    return (
      <Card>
        <View className="flex-row">
          <Ionicons name="trending-up-outline" size={24} color="#dc2626" />
          <View className="ml-3 flex-1">
            <Text className="text-base font-semibold text-slate-950">
              Você passou do limite
            </Text>
            <Text className="mt-1 text-sm leading-5 text-slate-500">
              {`Você passou ${formatCurrency(
                Math.abs(summary.balance ?? 0)
              )} do limite deste mês.`}
            </Text>
          </View>
        </View>
      </Card>
    );
  }

  return (
    <Card>
      <View className="flex-row">
        <Ionicons name="checkmark-circle-outline" size={24} color="#059669" />
        <View className="ml-3 flex-1">
          <Text className="text-base font-semibold text-slate-950">
            Você está economizando
          </Text>
          <Text className="mt-1 text-sm leading-5 text-slate-500">
            {`Você economizou ${formatCurrency(
              summary.balance ?? 0
            )} em relação ao limite cadastrado.`}
          </Text>
        </View>
      </View>
    </Card>
  );
}

function getCurrentMonthRef() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function prevMonth(monthRef: string): string {
  const [y, m] = monthRef.split("-").map(Number);
  const d = new Date(y, m - 2, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function nextMonth(monthRef: string): string {
  const [y, m] = monthRef.split("-").map(Number);
  const d = new Date(y, m, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function formatMonthNav(monthRef: string): string {
  const months = [
    "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
    "Jul", "Ago", "Set", "Out", "Nov", "Dez",
  ];
  const [y, m] = monthRef.split("-");
  return `${months[Number(m) - 1]}/${y}`;
}

function getFirstName(name?: string) {
  return name?.trim().split(" ")[0] || "usuário";
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    currency: "BRL",
    style: "currency",
  }).format(value);
}

function formatMonth(monthRef: string) {
  const [year, month] = monthRef.split("-");
  const date = new Date(Number(year), Number(month) - 1, 1);
  return new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
  }).format(date);
}
