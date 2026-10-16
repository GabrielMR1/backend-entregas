from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import gspread
from google.oauth2.service_account import Credentials
import os
import json

app = FastAPI(title="API Planilha Entregas")

# Configuração de CORS para permitir que o app acesse a API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Definindo o modelo de dados esperado do React Native
class RotaPayload(BaseModel):
    data: str
    modalidade: str
    regiao: str
    hub: str
    odometro_inicial: float
    odometro_final: float
    valor_base: float
    bonus: float
    outros_custos: float
    horario_inicio: str
    horario_fim: str

def get_sheet():
    scopes = ["https://www.googleapis.com/auth/spreadsheets", "https://www.googleapis.com/auth/drive"]
    
    # Se estiver rodando na nuvem (Render) com a variável configurada:
    if "GOOGLE_CREDENTIALS" in os.environ:
        creds_info = json.loads(os.environ.get("GOOGLE_CREDENTIALS"))
        credentials = Credentials.from_service_account_info(creds_info, scopes=scopes)
    else:
        # Se estiver rodando localmente no seu PC:
        credentials = Credentials.from_service_account_file("credentials.json", scopes=scopes)
        
    cliente = gspread.authorize(credentials)
    sheet = cliente.open_by_key("1VhECNg8QAWzTSYRiE3BRCyxl49x2k4GD8pOFTQP-2Cg")
    return sheet.worksheet("Rotas")

@app.post("/adicionar-rota")
async def adicionar_rota(rota: RotaPayload):
    try:
        sheet = get_sheet()
        
        # O gspread apenas insere os valores brutos. As fórmulas das colunas K até S do Sheets farão o resto automaticamente!
        nova_linha = [
            rota.data,                 # A: Data
            "",                        # B: Dia da Semana (Deixe vazio ou repita a fórmula no Sheets depois)
            rota.hub,                  # C: HUB
            rota.modalidade,           # D: Modalidade
            rota.regiao,               # E: Região de Entrega
            rota.odometro_inicial,     # F: Odômetro Inicial
            rota.odometro_final,       # G: Odômetro Final
            rota.valor_base,           # H: Valor Base
            rota.bonus,                # I: Bônus
            rota.outros_custos,        # J: Outros Custos
            "",                        # K: KM Total (Fórmula)
            rota.horario_inicio,       # L: Horário Início
            rota.horario_fim           # M: Horário Fim
        ]
        
        sheet.append_row(nova_linha, value_input_option="USER_ENTERED")
        return {"status": "sucesso", "mensagem": "Rota salva na planilha com sucesso!"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao salvar na planilha: {str(e)}")

# Comando para rodar localmente: uvicorn main:app --reload