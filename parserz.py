import sqlparse
from sqlparse.sql import IdentifierList, Identifier, Where
from sqlparse.tokens import Keyword, DML

def sql_parcalara_ayir(sql_query):
    parsed = sqlparse.parse(sql_query)[0]
    
    # 1. Tablo Takma Adlarını (Aliases) ve İsimlerini Bulma
    # Örn: {'y': 'kentrehberi_yapi', 'm': 'geomahalle', 'k': 'kentrehberi_yol'}
    table_map = {}
    tokens = parsed.tokens
    
    for i, token in enumerate(tokens):
        if token.ttype is Keyword and token.value.upper() in ('FROM', 'JOIN'):
            # Bir sonraki anlamlı token tablo ismidir
            next_token = tokens[i+2] 
            if isinstance(next_token, Identifier):
                real_name = next_token.get_real_name()
                alias = next_token.get_alias()
                table_map[alias or real_name] = real_name

    # 2. WHERE ve JOIN Koşullarını Ayıklama
    # Filtreleri tablo bazlı gruplayacağız
    filters = {alias: [] for alias in table_map.keys()}
    
    # Basit bir string analizi ile filtreleri eşleştirelim 
    # (Daha kompleks yapılar için recursive token gezisi gerekir)
    sql_str = str(parsed)
    where_part = sql_str.split("WHERE")[-1] if "WHERE" in sql_str.upper() else ""
    
    for alias in table_map.keys():
        # Bu alias'a ait filtreleri bul (Örn: m.adi_numarasi...)
        parts = where_part.split("AND")
        for p in parts:
            if f"{alias}." in p:
                filters[alias].append(p.strip().replace(';', ''))

    # 3. Alt Sorguları Oluşturma
    sub_queries = []
    for alias, table_name in table_map.items():
        if filters[alias]: # Sadece filtresi olan tablolar için sorgu üret
            where_clause = " AND ".join(filters[alias])
            # Kolonları dinamik almak için SELECT * veya alias.* kullanılabilir
            sub_sql = f"SELECT {alias}.* FROM {table_name} {alias} WHERE {where_clause};"
            sub_queries.append(sub_sql)
            
    return sub_queries

# --- Kullanım Örneği ---
ana_sorgu = """
SELECT y.objectid, y.adres, y.poly, ST_Area(y.poly) AS area
FROM kentrehberi_yapi y
JOIN geomahalle m ON ST_Intersects(y.poly, m.poly)
JOIN kentrehberi_yol k ON ST_DWithin(ST_Transform(y.poly, 3857), ST_Transform(k.poly, 3857), 500)
WHERE m.adi_numarasi ILIKE '%CIKCILLI%'
AND k.yol_adi ILIKE '%FATIH%';
"""

sonuclar = sql_parcalara_ayir(ana_sorgu)

for i, sorgu in enumerate(sonuclar, 1):
    print(f"Alt Sorgu {i}:\n{sorgu}\n")