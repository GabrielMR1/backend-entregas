import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  SafeAreaView
} from 'react-native';

const API_URL = "https://backend-entregas.vercel.app/adicionar-rota";

export default function HomeScreen() {
  const [data, setData] = useState(new Date().toLocaleDateString('pt-BR'));
  const [hub, setHub] = useState('');
  const [modalidade, setModalidade] = useState('');
  const [regiao, setRegiao] = useState('');
  const [odometroInicial, setOdometroInicial] = useState('');
  const [odometroFinal, setOdometroFinal] = useState('');
  const [valorBase, setValorBase] = useState('');
  const [bonus, setBonus] = useState('');
  const [outrosCustos, setOutrosCustos] = useState('');
  const [horarioInicio, setHorarioInicio] = useState('');
  const [horarioFim, setHorarioFim] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!hub || !modalidade || !regiao || !odometroInicial || !odometroFinal || !valorBase) {
      Alert.alert("Campos obrigatórios", "Por favor, preencha todos os campos principais.");
      return;
    }

    setLoading(true);

    const payload = {
      data: data,
      hub: hub,
      modalidade: modalidade,
      regiao: regiao,
      odometro_inicial: parseFloat(odometroInicial.replace(',', '.')) || 0,
      odometro_final: parseFloat(odometroFinal.replace(',', '.')) || 0,
      valor_base: parseFloat(valorBase.replace(',', '.')) || 0,
      bonus: parseFloat(bonus.replace(',', '.')) || 0,
      outros_custos: parseFloat(outrosCustos.replace(',', '.')) || 0,
      horario_inicio: horarioInicio || "08:00",
      horario_fim: horarioFim || "18:00",
    };

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok) {
        Alert.alert("Sucesso! 🎉", "Rota salva na planilha com sucesso!");
        // Limpar campos
        setHub('');
        setModalidade('');
        setRegiao('');
        setOdometroInicial('');
        setOdometroFinal('');
        setValorBase('');
        setBonus('');
        setOutrosCustos('');
        setHorarioInicio('');
        setHorarioFim('');
      } else {
        Alert.alert("Erro", result.detail || "Falha ao salvar rota.");
      }
    } catch (error) {
      Alert.alert("Erro de conexão", "Não foi possível conectar à API na Vercel.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>🚚 Registro de Rota</Text>
        <Text style={styles.subtitle}>Sincronizado diretamente com o Google Sheets</Text>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Data</Text>
          <TextInput style={styles.input} value={data} onChangeText={setData} placeholder="DD/MM/AAAA" />

          <Text style={styles.label}>HUB</Text>
          <TextInput style={styles.input} value={hub} onChangeText={setHub} placeholder="Ex: Shopee / Mercado Livre" />

          <Text style={styles.label}>Modalidade</Text>
          <TextInput style={styles.input} value={modalidade} onChangeText={setModalidade} placeholder="Ex: Utililitário / Carro" />

          <Text style={styles.label}>Região</Text>
          <TextInput style={styles.input} value={regiao} onChangeText={setRegiao} placeholder="Ex: Ceilândia / Taguatinga" />

          <View style={styles.row}>
            <View style={styles.halfInput}>
              <Text style={styles.label}>KM Inicial</Text>
              <TextInput style={styles.input} value={odometroInicial} onChangeText={setOdometroInicial} keyboardType="numeric" placeholder="120000" />
            </View>
            <View style={styles.halfInput}>
              <Text style={styles.label}>KM Final</Text>
              <TextInput style={styles.input} value={odometroFinal} onChangeText={setOdometroFinal} keyboardType="numeric" placeholder="120150" />
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.halfInput}>
              <Text style={styles.label}>Valor Base (R$)</Text>
              <TextInput style={styles.input} value={valorBase} onChangeText={setValorBase} keyboardType="numeric" placeholder="250.00" />
            </View>
            <View style={styles.halfInput}>
              <Text style={styles.label}>Bônus (R$)</Text>
              <TextInput style={styles.input} value={bonus} onChangeText={setBonus} keyboardType="numeric" placeholder="30.00" />
            </View>
          </View>

          <Text style={styles.label}>Outros Custos (R$)</Text>
          <TextInput style={styles.input} value={outrosCustos} onChangeText={setOutrosCustos} keyboardType="numeric" placeholder="Ex: Pedágio / Alimentação" />

          <View style={styles.row}>
            <View style={styles.halfInput}>
              <Text style={styles.label}>Início</Text>
              <TextInput style={styles.input} value={horarioInicio} onChangeText={setHorarioInicio} placeholder="07:30" />
            </View>
            <View style={styles.halfInput}>
              <Text style={styles.label}>Fim</Text>
              <TextInput style={styles.input} value={horarioFim} onChangeText={setHorarioFim} placeholder="17:00" />
            </View>
          </View>

          <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.buttonText}>Salvar Rota na Planilha</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F6F8' },
  scrollContent: { padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1E293B', textAlign: 'center', marginTop: 10 },
  subtitle: { fontSize: 13, color: '#64748B', textAlign: 'center', marginBottom: 20 },
  formGroup: { backgroundColor: '#FFF', padding: 20, borderRadius: 12, elevation: 3, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 6 },
  label: { fontSize: 14, fontWeight: '600', color: '#334155', marginBottom: 5, marginTop: 10 },
  input: { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 8, padding: 12, fontSize: 15, color: '#0F172A' },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  halfInput: { width: '48%' },
  button: { backgroundColor: '#2563EB', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 25 },
  buttonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
});