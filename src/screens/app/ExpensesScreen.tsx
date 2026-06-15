import { Ionicons } from "@expo/vector-icons";
import { useRef, useState } from "react";
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import Button from "../../components/Button";
import Card from "../../components/Card";
import Input from "../../components/Input";
import { useAuthStore } from "../../stores/authStore";
import { useFinanceStore } from "../../stores/financeStore";
import { Expense } from "../../types/Finance";

export default function ExpensesScreen() {
  const scrollRef = useRef<ScrollView>(null);
  const user = useAuthStore((state) => state.getCurrentUser());
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthRef());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [value, setValue] = useState("");
  const [descriptionError, setDescriptionError] = useState("");
  const [valueError, setValueError] = useState("");

  const expenses = useFinanceStore((state) =>
    state.expenses.filter(
      (e) => e.userId === user?.id && e.monthRef === selectedMonth
    )
  );
  const addExpense = useFinanceStore((state) => state.addExpense);
  const updateExpense = useFinanceStore((state) => state.updateExpense);
  const deleteExpense = useFinanceStore((state) => state.deleteExpense);

  const currentMonthRef = getCurrentMonthRef();
  const isPastMonth = selectedMonth < currentMonthRef;
  const totalMonth = expenses.reduce((sum, e) => sum + e.value, 0);

  function resetForm() {
    setEditingId(null);
    setDescription("");
    setValue("");
    setDescriptionError("");
    setValueError("");
  }

  async function handleSave() {
    let hasError = false;
    setDescriptionError("");
    setValueError("");

    if (!description.trim()) {
      setDescriptionError("Descrição é obrigatória");
      hasError = true;
    }
    const parsed = parseFloat(value.replace(",", "."));
    if (!value || isNaN(parsed) || parsed <= 0) {
      setValueError("Informe um valor válido");
      hasError = true;
    }
    if (hasError) return;

    const result = editingId
      ? await updateExpense(editingId, {
          description: description.trim(),
          value: parsed,
        })
      : await addExpense({
          description: description.trim(),
          value: parsed,
          monthRef: selectedMonth,
        });

    if (!result.success) {
      Alert.alert("Não foi possível salvar", result.error);
      return;
    }

    resetForm();
  }

  function handleEdit(expense: Expense) {
    setEditingId(expense.id);
    setDescription(expense.description);
    setValue(expense.value.toFixed(2).replace(".", ","));
    setDescriptionError("");
    setValueError("");
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  }

  function handleDelete(id: string) {
    Alert.alert(
      "Excluir despesa",
      "Tem certeza que deseja excluir esta despesa?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            const result = await deleteExpense(id);
            if (!result.success) {
              Alert.alert("Não foi possível excluir", result.error);
            }
          },
        },
      ]
    );
  }

  return (
    <ScrollView
      ref={scrollRef}
      className="flex-1 bg-slate-50"
      contentContainerClassName="px-6 pb-8 pt-16"
      showsVerticalScrollIndicator={false}
    >
      <Text className="text-3xl font-bold text-slate-950">Despesas</Text>
      <Text className="mt-3 text-base leading-6 text-slate-600">
        Cadastre e acompanhe as despesas de cada mês.
      </Text>

      {!isPastMonth && (
        <Card className="mt-8">
          <Text className="mb-4 text-base font-semibold text-slate-950">
            {editingId ? "Editar despesa" : "Nova despesa"}
          </Text>
          <View className="gap-4">
            <Input
              label="Descrição"
              placeholder="Ex: Supermercado"
              value={description}
              onChangeText={setDescription}
              error={descriptionError}
              autoCapitalize="sentences"
            />
            <Input
              label="Valor (R$)"
              placeholder="0,00"
              value={value}
              onChangeText={setValue}
              keyboardType="numeric"
              error={valueError}
            />
            <View className="flex-row gap-3">
              {editingId && (
                <View className="flex-1">
                  <Button title="Cancelar" variant="secondary" onPress={resetForm} />
                </View>
              )}
              <View className="flex-1">
                <Button
                  title={editingId ? "Salvar" : "Adicionar"}
                  onPress={handleSave}
                />
              </View>
            </View>
          </View>
        </Card>
      )}

      <View className="mt-6">
        <View className="mb-4 flex-row items-center justify-between">
          <Text className="text-base font-semibold text-slate-950">Histórico</Text>
          <MonthNavigator
            monthRef={selectedMonth}
            maxMonthRef={addMonths(currentMonthRef, 12)}
            onPrev={() => setSelectedMonth(prevMonth(selectedMonth))}
            onNext={() => setSelectedMonth(nextMonth(selectedMonth))}
          />
        </View>

        {expenses.length > 0 && (
          <Card className="mb-3">
            <View className="flex-row items-center justify-between">
              <Text className="text-sm text-slate-500">Total do mês</Text>
              <Text className="text-base font-bold text-slate-950">
                {formatCurrency(totalMonth)}
              </Text>
            </View>
          </Card>
        )}

        {expenses.length === 0 ? (
          <Card>
            <Text className="text-center text-sm text-slate-400">
              Nenhuma despesa encontrada
            </Text>
          </Card>
        ) : (
          <View className="gap-3">
            {expenses.map((expense) => (
              <ExpenseItem
                key={expense.id}
                expense={expense}
                canModify={!isPastMonth}
                onEdit={() => handleEdit(expense)}
                onDelete={() => handleDelete(expense.id)}
              />
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

type ExpenseItemProps = {
  expense: Expense;
  canModify: boolean;
  onEdit: () => void;
  onDelete: () => void;
};

function ExpenseItem({ expense, canModify, onEdit, onDelete }: ExpenseItemProps) {
  return (
    <Card>
      <View className="flex-row items-center">
        <View className="mr-3 h-10 w-10 items-center justify-center rounded-lg bg-brand-50">
          <Ionicons name="receipt-outline" size={18} color="#059669" />
        </View>
        <View className="flex-1">
          <Text
            className="text-sm font-semibold text-slate-950"
            numberOfLines={1}
          >
            {expense.description}
          </Text>
          <Text className="mt-0.5 text-base font-bold text-brand-600">
            {formatCurrency(expense.value)}
          </Text>
        </View>
        {canModify && (
          <View className="flex-row gap-2">
            <TouchableOpacity
              className="h-9 w-9 items-center justify-center rounded-lg bg-slate-100"
              onPress={onEdit}
              activeOpacity={0.7}
            >
              <Ionicons name="pencil-outline" size={16} color="#475569" />
            </TouchableOpacity>
            <TouchableOpacity
              className="h-9 w-9 items-center justify-center rounded-lg bg-red-50"
              onPress={onDelete}
              activeOpacity={0.7}
            >
              <Ionicons name="trash-outline" size={16} color="#dc2626" />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Card>
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
    <View className="flex-row items-center gap-1">
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

function addMonths(monthRef: string, n: number): string {
  const [y, m] = monthRef.split("-").map(Number);
  const d = new Date(y, m - 1 + n, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
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

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    currency: "BRL",
    style: "currency",
  }).format(value);
}
