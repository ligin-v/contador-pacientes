import React, { useState } from "react";
import {
  Alert,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import * as DocumentPicker from "expo-document-picker";
import { File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";
import { analisarPlanilha, resultadoParaXlsxBytes } from "./analisar";

// Lê o arquivo escolhido sem depender das permissões do expo-file-system.
async function lerComoBase64(uri) {
  const resposta = await fetch(uri);
  const blob = await resposta.blob();
  return new Promise((resolve, reject) => {
    const leitor = new FileReader();
    leitor.onerror = () => reject(new Error("Falha ao ler o arquivo."));
    leitor.onloadend = () => resolve(String(leitor.result).split(",")[1]);
    leitor.readAsDataURL(blob);
  });
}

export default function App() {
  const [resultado, setResultado] = useState(null);
  const [nomeArquivo, setNomeArquivo] = useState(null);

  async function importar() {
    try {
      const resp = await DocumentPicker.getDocumentAsync({
        type: [
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "application/vnd.ms-excel",
          "text/csv",
          "text/comma-separated-values",
          "*/*",
        ],
        copyToCacheDirectory: true,
      });
      if (resp.canceled) return;

      const arquivo = resp.assets[0];
      const base64 = await lerComoBase64(arquivo.uri);

      setResultado(analisarPlanilha(base64));
      setNomeArquivo(arquivo.name);
    } catch (erro) {
      Alert.alert(
        "Erro ao analisar a planilha",
        `Não foi possível processar o arquivo.\n\n${erro.message}`
      );
    }
  }

  async function exportar() {
    if (!resultado) return;
    try {
      const arquivo = new File(Paths.cache, "resultado_pacientes.xlsx");
      if (arquivo.exists) arquivo.delete();
      arquivo.create();
      arquivo.write(resultadoParaXlsxBytes(resultado));
      const caminho = arquivo.uri;
      if (!(await Sharing.isAvailableAsync())) {
        Alert.alert("Erro", "Compartilhamento indisponível neste aparelho.");
        return;
      }
      await Sharing.shareAsync(caminho, {
        mimeType:
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        dialogTitle: "Salvar resultado",
      });
    } catch (erro) {
      Alert.alert(
        "Erro ao exportar",
        `Não foi possível salvar o resultado.\n\n${erro.message}`
      );
    }
  }

  const soma = (campo) =>
    resultado ? resultado.reduce((acc, r) => acc + r[campo], 0) : 0;

  return (
    <SafeAreaView style={s.container}>
      <StatusBar style="dark" />
      <Text style={s.titulo}>Analisador de Pacientes</Text>
      <Text style={s.subtitulo}>
        Importe uma planilha e veja a quantidade por sexo e faixa etária.
      </Text>

      <View style={s.botoes}>
        <TouchableOpacity style={s.botao} onPress={importar}>
          <Text style={s.botaoTexto}>📂 Importar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[s.botao, !resultado && s.botaoOff]}
          onPress={exportar}
          disabled={!resultado}
        >
          <Text style={s.botaoTexto}>💾 Exportar</Text>
        </TouchableOpacity>
      </View>

      <Text style={s.arquivo}>
        {nomeArquivo ? `Planilha: ${nomeArquivo}` : "Nenhuma planilha selecionada."}
      </Text>

      {resultado && (
        <Text style={s.totais}>
          Total: {soma("total")} | Masc.: {soma("masculino")} | Fem.:{" "}
          {soma("feminino")}
        </Text>
      )}

      <View style={s.tabela}>
        <View style={[s.linha, s.cabecalho]}>
          <Text style={[s.celula, s.celulaFaixa, s.cabTexto]}>Faixa etária</Text>
          <Text style={[s.celula, s.cabTexto]}>Masc.</Text>
          <Text style={[s.celula, s.cabTexto]}>Fem.</Text>
          <Text style={[s.celula, s.cabTexto]}>Total</Text>
        </View>
        <FlatList
          data={resultado || []}
          keyExtractor={(item) => item.faixa}
          renderItem={({ item, index }) => (
            <View style={[s.linha, index % 2 === 1 && s.linhaPar]}>
              <Text style={[s.celula, s.celulaFaixa]}>{item.faixa}</Text>
              <Text style={s.celula}>{item.masculino}</Text>
              <Text style={s.celula}>{item.feminino}</Text>
              <Text style={s.celula}>{item.total}</Text>
            </View>
          )}
        />
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 20, paddingTop: 50 },
  titulo: { fontSize: 24, fontWeight: "bold", textAlign: "center" },
  subtitulo: { textAlign: "center", color: "#555", marginTop: 6, marginBottom: 16 },
  botoes: { flexDirection: "row", justifyContent: "center", gap: 10 },
  botao: {
    backgroundColor: "#2563eb",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  botaoOff: { backgroundColor: "#9ca3af" },
  botaoTexto: { color: "#fff", fontWeight: "600" },
  arquivo: { textAlign: "center", color: "#555", marginVertical: 10 },
  totais: { textAlign: "center", fontWeight: "bold", marginBottom: 10 },
  tabela: { flex: 1, borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 8 },
  linha: { flexDirection: "row", paddingVertical: 10 },
  linhaPar: { backgroundColor: "#f3f4f6" },
  cabecalho: { backgroundColor: "#e5e7eb" },
  cabTexto: { fontWeight: "bold" },
  celula: { flex: 1, textAlign: "center" },
  celulaFaixa: { flex: 1.4 },
});