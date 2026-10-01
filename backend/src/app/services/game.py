from app.schemas.game import Game, GameCreate, GamePatch, GameUpdate

# Respostas demonstrativas, sem persistência.
JOGOS_EXEMPLO = (
    Game(
        id=1,
        genero="Aventura",
        titulo="Ilhas Perdidas",
        ano=2024,
        plataforma="Switch",
        preco=299.90,
    ),
    Game(
        id=2,
        genero="Corrida",
        titulo="Circuito Neon",
        ano=2023,
        plataforma="PC",
        preco=249.90,
    ),
    Game(
        id=3,
        genero="Aventura",
        titulo="Cavernas de Cristal",
        ano=2022,
        plataforma="PC",
        preco=46.99,
    ),
)


def listar_jogos(genero: str | None = None, limite: int = 10) -> list[Game]:
    jogos = JOGOS_EXEMPLO
    if genero is not None:
        jogos = tuple(jogo for jogo in jogos if jogo.genero.lower() == genero.lower())
    return list(jogos[:limite])


def obter_jogo(game_id: int) -> Game:
    return JOGOS_EXEMPLO[0].model_copy(update={"id": game_id})


def criar_jogo(dados: GameCreate) -> Game:
    return Game(id=1, **dados.model_dump())


def substituir_jogo(game_id: int, dados: GameUpdate) -> Game:
    return Game(id=game_id, **dados.model_dump())


def atualizar_jogo(game_id: int, dados: GamePatch) -> Game:
    alteracoes = dados.model_dump(exclude_unset=True, exclude_none=True)
    return obter_jogo(game_id).model_copy(update=alteracoes)


def remover_jogo(game_id: int) -> None:
    return None
