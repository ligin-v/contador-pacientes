import * as XLSX from "xlsx";

export const FAIXAS = [
  { nome: "0 a 1", min: 0, max: 1 },
  { nome: "2 a 4", min: 2, max: 4 },
  { nome: "5 a 9", min: 5, max: 9 },
  { nome: "10 a 19", min: 10, max: 19 },
  { nome: "20 a 29", min: 20, max: 29 },
  { nome: "30 a 39", min: 30, max: 39 },
  { nome: "40 a 49", min: 40, max: 49 },
  { nome: "50 a 59", min: 50, max: 59 },
  { nome: "60+", min: 60, max: 200 },
];

function normalizarSexo(valor) {
  if (valor === null || valor === undefined) return null;
  const texto = String(valor).trim().toLowerCase();
  if (["masculino", "m", "masc"].includes(texto)) return "Masculino";
  if (["feminino", "f", "fem"].includes(texto)) return "Feminino";
  return null;
}

function normalizarIdade(valor) {
  if (valor === null || valor === undefined || valor === "") return NaN;
  const n = Number(String(valor).trim().replace(",", "."));
  return Number.isFinite(n) ? n : NaN;
}

/** Recebe o conteúdo do arquivo em base64 — xlsx, xls ou csv. */
export function analisarPlanilha(base64) {
  const wb = XLSX.read(base64, { type: "base64" });
  const aba = wb.Sheets[wb.SheetNames[0]];
  const linhas = XLSX.utils.sheet_to_json(aba, { header: 1, defval: null });

  if (linhas.length < 2) throw new Error("A planilha está vazia.");

  const cabecalho = linhas[0].map((c) => String(c ?? "").trim().toUpperCase());
  let colIdade = cabecalho.indexOf("IDADE");
  let colSexo = cabecalho.indexOf("SEXO");

  // Fallback: segunda e terceira colunas (B e C)
  if (colIdade === -1 || colSexo === -1) {
    if (cabecalho.length < 3) {
      throw new Error("A planilha precisa ter pelo menos 3 colunas.");
    }
    colIdade = 1;
    colSexo = 2;
  }

  const resultado = FAIXAS.map((f) => ({
    faixa: f.nome,
    masculino: 0,
    feminino: 0,
    total: 0,
  }));

  for (const linha of linhas.slice(1)) {
    const idade = normalizarIdade(linha[colIdade]);
    const sexo = normalizarSexo(linha[colSexo]);
    if (Number.isNaN(idade) || !sexo) continue;

    const i = FAIXAS.findIndex((f) => idade >= f.min && idade <= f.max);
    if (i === -1) continue;

    if (sexo === "Masculino") resultado[i].masculino++;
    else resultado[i].feminino++;
    resultado[i].total++;
  }

  return resultado;
}

/** Gera um .xlsx (Uint8Array) a partir do resultado. */
export function resultadoParaXlsxBytes(resultado) {
  const dados = resultado.map((r) => ({
    "Faixa etária": r.faixa,
    Masculino: r.masculino,
    Feminino: r.feminino,
    Total: r.total,
  }));
  const ws = XLSX.utils.json_to_sheet(dados);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Resultado");
  return new Uint8Array(XLSX.write(wb, { type: "array", bookType: "xlsx" }));
}
