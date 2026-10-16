import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';

// Substitua pelo IP da sua máquina rodando o Uvicorn, ex: http://192.168.1.15:8000
// Quando fizer o deploy na Vercel, coloque a URL final de produção aqui.
const API_URL = "https://backend-entregas.vercel.app/adicionar-rota";

export default function App() {
  const [formData, setFormData] = useState({
    data: new Date().toLocaleDateString('pt-BR'),
    hub: 'SIA',
    modalidade: 'Entrega Rápida',
    regiao: '',
    odometro_inicial: '',
    odometro_final: '',
    valor_base: '',
    bonus: '0',
    outros_custos: '0',
    horario_inicio: '',
    horario_fim: ''
  });

  const [loading, setLoading] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const enviarDados = async () => {
    if (!formData.regiao || !formData.odometro_inicial || !formData.odometro_final || !formData.valor_base) {
      Alert.alert("Atenção", "Preencha os campos obrigatórios!");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: formData.data,
          hub: formData.hub,
          modalidade: formData.modalidade,
          regiao: formData.regiao,
          odometro_inicial: parseFloat(formData.odometro_inicial),
          odometro_final: parseFloat(formData.odometro_final),
          valor_base: parseFloat(formData.valor_base),
          bonus: parseFloat(formData.bonus),
          outros_custos: parseFloat(formData.outros_custos),
          horario_inicio: formData.horario_inicio,
          horario_fim: formData.horario_fim
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert("Sucesso!", "Rota salva na planilha.");
        // Limpar o formulário para a próxima corrida
        setFormData({
          ...formData,
          odometro_inicial: formData.odometro_final, // Sugere o odometro final da corrida anterior como inicial
          odometro_final: '',
          valor_base: '',
          bonus: '0',
          outros_custos: '0',
          horario_inicio: '',
          horario_fim: ''
        });
      } else {
        Alert.alert("Erro", data.detail || "Erro ao conectar com a API.");
      }
    } catch (error) {
      Alert.alert("Erro de Conexão", "Não foi possível conectar ao servidor Python.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Registrar Rota 🚚</Text>

        <Text style={styles.label}>Data</Text>
        <TextInput style={styles.input} value={formData.data} onChangeText={(text) => handleInputChange('data', text)} />

        <Text style={styles.label}>Região (Ex: Taguatinga Sul)</Text>
        <TextInput style={styles.input} value={formData.regiao} onChangeText={(text) => handleInputChange('regiao', text)} />

        <View style={styles.row}>
          <View style={styles.col}>
            <Text style={styles.label}>Odômetro Início</Text>
            <TextInput style={styles.input} keyboardType="numeric" value={formData.odometro_inicial} onChangeText={(text) => handleInputChange('odometro_inicial', text)} />
          </View>
          <View style={styles.col}>
            <Text style={styles.label}>Odômetro Fim</Text>
            <TextInput style={styles.input} keyboardType="numeric" value={formData.odometro_final} onChangeText={(text) => handleInputChange('odometro_final', text)} />
          </View>
        </View>

        <Text style={styles.label}>Valor Base (R$)</Text>
        <TextInput style={styles.input} keyboardType="numeric" value={formData.valor_base} onChangeText={(text) => handleInputChange('valor_base', text)} />

        <View style={styles.row}>
          <View style={styles.col}>
            <Text style={styles.label}>Horário Início</Text>
            <TextInput style={styles.input} placeholder="14:00" value={formData.horario_inicio} onChangeText={(text) => handleInputChange('horario_inicio', text)} />
          </View>
          <View style={styles.col}>
            <Text style={styles.label}>Horário Fim</Text>
            <TextInput style={styles.input} placeholder="20:30" value={formData.horario_fim} onChangeText={(text) => handleInputChange('horario_fim', text)} />
          </View>
        </View>

        <TouchableOpacity style={styles.button} onPress={enviarDados} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? "Enviando..." : "Salvar na Planilha"}</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  scroll: { padding: 20, paddingTop: 60 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 20, color: '#333', textAlign: 'center' },
  label: { fontSize: 14, fontWeight: 'bold', marginBottom: 5, color: '#555' },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd', padding: 12, borderRadius: 8, marginBottom: 15 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  col: { width: '48%' },
  button: { backgroundColor: '#007AFF', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});