from app.services.transitions import allowed_transitions_for, can_transition


def test_legal_it_edges():
    assert can_transition("it", False, "Aberto", "Em andamento")
    assert can_transition("it", False, "Em andamento", "Aguardando aluno")
    assert can_transition("it", False, "Aguardando aluno", "Em andamento")
    assert can_transition("it", False, "Em andamento", "Resolvido")
    assert can_transition("it", False, "Resolvido", "Fechado")


def test_owner_student_responder_and_close():
    assert can_transition("student", True, "Aguardando aluno", "Em andamento")
    assert can_transition("student", True, "Resolvido", "Fechado")
    assert not can_transition("student", True, "Aberto", "Em andamento")


def test_non_owner_student_denied():
    assert not can_transition("student", False, "Aguardando aluno", "Em andamento")
    assert not can_transition("student", False, "Resolvido", "Fechado")


def test_fechado_is_terminal():
    assert not can_transition("it", False, "Fechado", "Aberto")
    assert not can_transition("it", False, "Fechado", "Em andamento")
    assert allowed_transitions_for("it", False, "Fechado") == []


def test_illegal_edges():
    assert not can_transition("it", False, "Aberto", "Resolvido")
    assert not can_transition("it", False, "Aberto", "Fechado")
