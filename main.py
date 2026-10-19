import os
import json
import gspread
from typing import Optional
from google.oauth2.service_account import Credentials
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class RotaPayload(BaseModel):
    data: str
    hub: str
    modalidade: str
    regiao: str
    odometro_inicial: float
    odometro_final: float
    valor_base: float
    bonus: Optional[float] = 0.0
    outros_custos: Optional[float] = 0.0
    horario_inicio: str
    horario_fim: str
    qtd_pacotes: Optional[int] = 0

@app.get("/")
def read_root():
    return {"status": "API de Entregas ativa e online!"}

def get_sheet():
    scopes = [
        "https://www.googleapis.com/auth/spreadsheets",
        "https://www.googleapis.com/auth/drive"
    ]
    
    creds_env = os.environ.get("GOOGLE_CREDENTIALS")
    if creds_env:
        try:
            creds_info = json.loads(creds_env)
            credentials = Credentials.from_service_account_info(creds_info, scopes=scopes)
        except Exception as e:
            raise HTTPException(
                status_code=500, 
                detail=f"Erro ao processar GOOGLE_CREDENTIALS na Vercel: {str(e)}"
            )
    else:
        if not os.path.exists("credentials.json"):
            raise HTTPException(
                status_code=500, 
                detail="credentials.json não encontrado localmente nem a variável GOOGLE_CREDENTIALS na Vercel."
            )
        credentials = Credentials.from_service_account_file("credentials.json", scopes=scopes)
        
    cliente = gspread.authorize(credentials)
    sheet = cliente.open_by_key("1VhECNg8QAWzTSYRiE3BRCyxl49x2k4GD8pOFTQP-2Cg")
    return sheet.worksheet("Rotas")

@app.post("/adicionar-rota")
async def adicionar_rota(rota: RotaPayload):
    try:
        sheet = get_sheet()
        
        nova_linha = [
            rota.data,                 # A: Data
            "",                        # B: Dia da Semana (Fórmula no Sheets)
            rota.hub,                  # C: HUB
            rota.modalidade,           # D: Modalidade
            rota.regiao,               # E: Região de Entrega
            rota.odometro_inicial,     # F: Odômetro Inicial
            rota.odometro_final,       # G: Odômetro Final
            rota.valor_base,           # H: Valor Base
            rota.bonus,                # I: Bônus
            rota.outros_custos,        # J: Outros Custos
            "",                        # K: KM Total (Fórmula no Sheets)
            rota.horario_inicio,       # L: Horário Início
            rota.horario_fim,          # M: Horário Fim
            rota.qtd_pacotes,          # N: Quantidade de Pacotes
            ""                         # O: Tempo Médio por Pacote (Fórmula no Sheets)
        ]
        
        sheet.append_row(nova_linha, value_input_option="USER_ENTERED")
        return {"status": "sucesso", "mensagem": "Rota salva na planilha com sucesso!"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao salvar na planilha: {str(e)}")